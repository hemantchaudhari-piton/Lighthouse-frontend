import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/reports/report.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { VCDailyAttendanceTrackingModel } from './vc-daily-attendance-tracking.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  selector: 'data-list-view',
  templateUrl: './vc-daily-attendance-tracking.component.html',
  styleUrls: ['./vc-daily-attendance-tracking.component.scss'],
  animations: fuseAnimations,
  standalone: true,
  imports: [MatTableExporterModule, CommonModule, MatIconModule, MatPaginator,MatTableModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None
})

export class VCDailyAttendanceTrackingComponent extends BaseListComponent<VCDailyAttendanceTrackingModel> implements OnInit {
  dailyAttendanceTrackingForm: FormGroup;

  academicyearList: [DropdownModel];
  divisionList: [DropdownModel];
  districtList: DropdownModel[];
  sectorList: [DropdownModel];
  jobRoleList: DropdownModel[];
  vtpList: [DropdownModel];
  classList: [DropdownModel];
  schoolManagementList: [DropdownModel];
  currentAcademicYearId: string;
  isShowFilterContainer = false;
  @ViewChild('districtMatSelect') districtSelections: MatSelect;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    private reportService: ReportService) {

    super(commonService, router, routeParams, snackBar, zone);
    this.dailyAttendanceTrackingForm = this.createVCDailyAttendanceTrackingForm();
  }

  ngOnInit(): void {
    this.reportService.GetDropdownForReports(this.UserModel).subscribe(results => {
      if (results[0].Success) {
        this.academicyearList = results[0].Results.$values;
      }

      if (results[1].Success) {
        this.divisionList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.sectorList = results[2].Results.$values;
      }

      if (results[3].Success) {
        this.vtpList = results[3].Results.$values;
      }

      if (results[4].Success) {
        this.classList = results[4].Results.$values;
      }

      if (results[6].Success) {
        this.schoolManagementList = results[6].Results.$values;
      }

      let currentYearItem = this.academicyearList.find(ay => ay.IsSelected == true)
      if (currentYearItem != null) {
        this.currentAcademicYearId = currentYearItem.Id;
        this.dailyAttendanceTrackingForm.get('AcademicYearId').setValue(this.currentAcademicYearId);

        if (this.UserModel.RoleCode === 'DivEO') {
          this.dailyAttendanceTrackingForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);

          this.onChangeDivision(this.UserModel.DivisionId).then(response => {
          });
        }
        else if (this.UserModel.RoleCode === 'DisEO' || this.UserModel.RoleCode === 'DisRP' || this.UserModel.RoleCode === 'BEO' || this.UserModel.RoleCode === 'BRP') {
          this.dailyAttendanceTrackingForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);

          this.onChangeDivision(this.UserModel.DivisionId).then(response => {
            let districtIds = [];
            response.forEach(districtItem => {
              districtIds.push(districtItem.Id);
            });

            this.dailyAttendanceTrackingForm.controls["DistrictId"].setValue(districtIds);
          });
        }
      }
    });
  }

  resetReportFilters(): void {
    this.dailyAttendanceTrackingForm.reset();
    this.dailyAttendanceTrackingForm.get('AcademicYearId').setValue(this.currentAcademicYearId);
    this.dailyAttendanceTrackingForm.get('AcademicYearId').disable;
    this.districtList = <DropdownModel[]>[];
    this.jobRoleList = <DropdownModel[]>[];

    if (this.UserModel.RoleCode === 'DisEO' || this.UserModel.RoleCode === 'DisRP' || this.UserModel.RoleCode === 'BEO' || this.UserModel.RoleCode === 'BRP') {
      this.dailyAttendanceTrackingForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);


      this.onChangeDivision(this.UserModel.DivisionId).then(response => {
        let districtIds = [];
        response.forEach(districtItem => {
          districtIds.push(districtItem.Id);
        });

        this.dailyAttendanceTrackingForm.controls["DistrictId"].setValue(districtIds);

        this.getVCDailyAttendanceTrackingReports();
      });
    }
    else {
      this.getVCDailyAttendanceTrackingReports();
    }
  }

  onChangeDivision(divisionId: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {

      this.commonService.GetMasterDataByType({ DataType: 'Districts', RoleId: this.UserModel.RoleCode, UserId: this.UserModel.UserTypeId, ParentId: divisionId, SelectTitle: 'District' }, false)
        .subscribe((response: any) => {

          this.districtList = response.Results.$values;
          this.dailyAttendanceTrackingForm.controls['DistrictId'].setValue(null);
          resolve(response.Results.$values);
        }, err => {

          reject(err);
        });
    });

    return promise;
  }

  onChangeSector(sectorId: string): void {
    this.commonService.GetMasterDataByType({ DataType: 'JobRoles', ParentId: sectorId, SelectTitle: 'Job Role' }).subscribe((response: any) => {
      this.jobRoleList = response.Results.$values;
    });
  }

  toggleDistrictSelections(evt) {
    //To control select-unselect all
    let isAllSelected = (evt.currentTarget.classList.toString().indexOf('mat-active') > 0)

    if (isAllSelected) {
      this.districtSelections.options.forEach((item: MatOption) => item.select());
      this.districtSelections.options.first.deselect();
    } else {
      this.districtSelections.options.forEach((item: MatOption) => { item.deselect() });
    }
    setTimeout(() => { this.districtSelections.close(); }, 200);
  }

  //Create VCDailyAttendanceTracking form and returns {FormGroup}
  createVCDailyAttendanceTrackingForm(): FormGroup {
    return this.formBuilder.group({
      FromDate: new FormControl('', Validators.required),
      ToDate: new FormControl('', Validators.required),
      // AcademicYearId: new FormControl(),
      AcademicYearId: new FormControl({ value: '', disabled: true }, Validators.required),
      DivisionId: new FormControl(),
      DistrictId: new FormControl(),
      SectorId: new FormControl(),
      JobRoleId: new FormControl(),
      ClassId: new FormControl(),
      VTPId: new FormControl(),
      SchoolManagementId: new FormControl()
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.dailyAttendanceTrackingForm.controls[controlName].setValue(null);
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.dailyAttendanceTrackingForm.controls[controlName].setValue(isoDateString);
  }
  
  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  getVCDailyAttendanceTrackingReports(): void {
    if (!this.dailyAttendanceTrackingForm.valid) {
      this.validateAllFormFields(this.dailyAttendanceTrackingForm);
      return;
    }
    this.formatAndSetDate(this.dailyAttendanceTrackingForm.get('FromDate').value, 'FromDate');
    this.formatAndSetDate(this.dailyAttendanceTrackingForm.get('ToDate').value, 'ToDate');
    var reportParams = {
      AcademicYearId: this.dailyAttendanceTrackingForm.get('AcademicYearId').value,
      DivisionId: this.dailyAttendanceTrackingForm.get('DivisionId').value,
      DistrictId: this.dailyAttendanceTrackingForm.get('DistrictId').value,
      SectorId: this.dailyAttendanceTrackingForm.get('SectorId').value,
      JobRoleId: this.dailyAttendanceTrackingForm.get('JobRoleId').value,
      VTPId: this.dailyAttendanceTrackingForm.get('VTPId').value,
      ClassId: this.dailyAttendanceTrackingForm.get('ClassId').value,
      SchoolManagementId: this.dailyAttendanceTrackingForm.get('SchoolManagementId').value,
      UserId: this.UserModel.LoginId,
      FromDate: this.dailyAttendanceTrackingForm.get('FromDate').value,
      ToDate: this.dailyAttendanceTrackingForm.get('ToDate').value
    };

    reportParams.DistrictId = (reportParams.DistrictId != null && reportParams.DistrictId.length > 0) ? reportParams.DistrictId.toString() : null;

    this.reportService.GetVCDailyAttendanceTrackingByCriteria(reportParams).subscribe(response => {
      this.displayedColumns = ['VTPName', 'VCName', 'VCMobile', 'VCEmail', 'VCDateOfJoining', 'UDISE', 'SchoolName', 'SectorName', 'ReportType', 'DateOfReport', 'ActualSubmissionDateTime', 'GeoLocation'];

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

  exportExcel(): void {
    this.IsLoading = true;
    this.formatAndSetDate(this.dailyAttendanceTrackingForm.get('FromDate').value, 'FromDate');
    this.formatAndSetDate(this.dailyAttendanceTrackingForm.get('ToDate').value, 'ToDate');
    var reportParams: any = {
      AcademicYearId: this.dailyAttendanceTrackingForm.get('AcademicYearId').value,
      DivisionId: this.dailyAttendanceTrackingForm.get('DivisionId').value,
      DistrictId: this.dailyAttendanceTrackingForm.get('DistrictId').value,
      SectorId: this.dailyAttendanceTrackingForm.get('SectorId').value,
      JobRoleId: this.dailyAttendanceTrackingForm.get('JobRoleId').value,
      VTPId: this.dailyAttendanceTrackingForm.get('VTPId').value,
      ClassId: this.dailyAttendanceTrackingForm.get('ClassId').value,
      SchoolManagementId: this.dailyAttendanceTrackingForm.get('SchoolManagementId').value,
      UserId: this.UserModel.LoginId,
      FromDate: this.dailyAttendanceTrackingForm.get('FromDate').value,
      ToDate: this.dailyAttendanceTrackingForm.get('ToDate').value
    };

    reportParams.DistrictId = (reportParams.DistrictId != null && reportParams.DistrictId.length > 0) ? reportParams.DistrictId.toString() : null;

    this.reportService.GetVCDailyAttendanceTrackingByCriteria(reportParams).subscribe(response => {
      this.exportExcelFromTable(response.Results.$values, "VCDailyAttendanceTracking");
      this.IsLoading = false;
      this.SearchBy.PageIndex = 0;
      this.SearchBy.PageSize = 10;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }
}
