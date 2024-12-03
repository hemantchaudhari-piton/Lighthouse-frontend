import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/reports/report.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { VTCourseModuleTrackingModel } from './vt-course-module-tracking.model';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  selector: 'data-list-view',
  templateUrl: './vt-course-module-tracking.component.html',
  styleUrls: ['./vt-course-module-tracking.component.scss'],
  animations: fuseAnimations,
  standalone: true,
  imports: [MatTableExporterModule, MatIconModule,CommonModule, MatPaginator,MatTableModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatDatepickerModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None
})

export class VTCourseModuleTrackingComponent extends BaseListComponent<VTCourseModuleTrackingModel> implements OnInit {
  vtCourseModuleTrackingForm: FormGroup;
  isShowFilterContainer = false;
  vtList: any;
  classList: any;
  sectionList: any;
  schoolList: any;
  filteredSchoolItems: any;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    private reportService: ReportService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.reportService.getDropdownforVTCourseModuleTrackingReport(this.UserModel).subscribe((results) => {
      if (results[3].Success) {
        this.schoolList = results[3].Results.$values;
        this.filteredSchoolItems = this.schoolList.slice();
      }

      this.vtCourseModuleTrackingForm = this.createVTCourseModuleTrackingForm();
    });

    this.vtCourseModuleTrackingForm = this.createVTCourseModuleTrackingForm();
  }

  onChangeClass(classId) {
    let vtId = this.vtCourseModuleTrackingForm.get("VTId").value;
    this.commonService.GetSectionsByVTClassId({ DataId: vtId, DataId1: classId }).subscribe(response => {
      if (response.Success) {
        this.sectionList = response.Results.$values;
      }
    });
  }

  onChangeSchool(schoolId) {
    this.commonService.GetMasterDataByType({ DataType: 'TrainersBySchool', ParentId: schoolId, SelectTitle: 'Vocational Trainer' }).subscribe(response => {
      if (response.Success) {
        this.vtList = response.Results.$values;
      }
    });
  }

  onChangeVT(vtId) {
    this.commonService.GetMasterDataByType({ DataType: 'ClassesForCMByVT', ParentId: vtId, SelectTitle: 'Class' }).subscribe(response => {
      if (response.Success) {
        this.classList = response.Results.$values;
      }
    });
  }
  
  //Create VTCourseModuleTracking form and returns {FormGroup}
  createVTCourseModuleTrackingForm(): FormGroup {
    return this.formBuilder.group({
      FromDate: new FormControl('', Validators.required),
      ToDate: new FormControl('', Validators.required),
      VTId: new FormControl(''),
      SchoolId: new FormControl(''),
      ClassId: new FormControl(''),
      SectionId: new FormControl(''),
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vtCourseModuleTrackingForm.controls[controlName].setValue(null);
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vtCourseModuleTrackingForm.controls[controlName].setValue(isoDateString);
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  getVTCourseModuleTrackingReports(): void {
    if (!this.vtCourseModuleTrackingForm.valid) {
      this.validateAllFormFields(this.vtCourseModuleTrackingForm);
      return;
    }
    this.formatAndSetDate(this.vtCourseModuleTrackingForm.get('FromDate').value, 'FromDate');
    this.formatAndSetDate(this.vtCourseModuleTrackingForm.get('ToDate').value, 'ToDate');


    var reportParams = {
      UserId: this.UserModel.LoginId,
      FromDate: this.vtCourseModuleTrackingForm.get('FromDate').value,
      ToDate: this.vtCourseModuleTrackingForm.get('ToDate').value,
      VTId: this.vtCourseModuleTrackingForm.get('VTId').value,
      SchoolId: this.vtCourseModuleTrackingForm.get('SchoolId').value,
      ClassId: this.vtCourseModuleTrackingForm.get('ClassId').value,
      SectionId: this.vtCourseModuleTrackingForm.get('SectionId').value,
    };

    this.reportService.GetVTCourseModuleDailyTrackingByCriteria(reportParams).subscribe(response => {
      this.displayedColumns = ['VTPName', 'VCName', 'VCMobile', 'VCEmail', 'VTName', 'VTMobile', 'VTEmail', 'VTGender', 'HMName', 'HMMobile', 'HMEmail', 'SectorName', 'JobRoleName', 'SchoolName', 'UDISE', 'ClassName', 'SectionName', 'DistrictName', 'BlockName', 'ReportingDate', 'ReportingDay', 'ActivityType', 'ClassType', 'ClassDuration', 'ModulesTaught', 'UnitsTaught', 'SessionTaught', 'ClassPictureUrl', 'LessonPlanPictureUrl', 'EnrollmentBoys', 'EnrollmentGirls', 'EnrollmentTotal', 'AttendanceBoys', 'AttendanceGirls', 'AttendanceTotal'];

      this.tableDataSource.data = response.Results.$values;
      this.tableDataSource.sort = this.ListSort;
      this.tableDataSource.paginator = this.ListPaginator;
      this.tableDataSource.filteredData = this.tableDataSource.data;

      this.zone.run(() => {
        if (this.tableDataSource.data.length == 0) {
          this.showNoDataFoundSnackBar();
        }
      });
      this.IsLoading = false;
    }, error => {
      console.log(error);
    });
  }
}
