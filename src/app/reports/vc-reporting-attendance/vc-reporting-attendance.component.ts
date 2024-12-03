import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/reports/report.service';
import { VCReportingAttendanceReportModel } from './vc-reporting-attendance.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'data-list-view',
  templateUrl: './vc-reporting-attendance.component.html',
  styleUrls: ['./vc-reporting-attendance.component.scss'],
  animations: fuseAnimations,
  standalone: true,
  imports: [MatTableExporterModule, MatIconModule,CommonModule, MatPaginator,MatTableModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatDatepickerModule,MatInputModule,MatSelectModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None
})

export class VCReportingAttendanceReportComponent extends BaseListComponent<VCReportingAttendanceReportModel> implements OnInit {
  vcReportingAttendanceForm: FormGroup;

  academicyearList: [DropdownModel];
  divisionList: [DropdownModel];
  districtList: DropdownModel[];
  sectorList: [DropdownModel];
  jobRoleList: DropdownModel[];
  vtpList: [DropdownModel];
  classList: [DropdownModel];
  monthList: [DropdownModel];
  schoolManagementList: [DropdownModel];
  filteredVTP: DropdownModel[] = [];

  currentAcademicYearId: string;
  isShowFilterContainer = false;
  @ViewChild('districtMatSelect') districtSelections: MatSelect;
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;


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

      if (results[5].Success) {
        this.monthList = results[5].Results.$values;
      }

      if (results[6].Success) {
        this.schoolManagementList = results[6].Results.$values;
      }

      let currentYearItem = this.academicyearList.find(ay => ay.IsSelected == true)
      if (currentYearItem != null) {
        this.currentAcademicYearId = currentYearItem.Id;
        this.vcReportingAttendanceForm.get('AcademicYearId').setValue(this.currentAcademicYearId);

        if (this.UserModel.RoleCode === 'DivEO') {
          this.vcReportingAttendanceForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);


          this.onChangeDivision(this.UserModel.DivisionId).then(response => {
            this.getVCReportingAttendanceReports();
          });
        }
        else if (this.UserModel.RoleCode === 'DisEO' || this.UserModel.RoleCode === 'DisRP' || this.UserModel.RoleCode === 'BEO' || this.UserModel.RoleCode === 'BRP') {
          this.vcReportingAttendanceForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);


          this.onChangeDivision(this.UserModel.DivisionId).then(response => {
            let districtIds = [];
            response.forEach(districtItem => {
              districtIds.push(districtItem.Id);
            });

            this.vcReportingAttendanceForm.controls["DistrictId"].setValue(districtIds);

            this.getVCReportingAttendanceReports();
          });
        }
        else {
          this.getVCReportingAttendanceReports();
        }
      }
    });

    this.vcReportingAttendanceForm = this.createVCReportingAttendanceForm();
    this.vcReportingAttendanceForm.controls['VTPId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredVTP = this.vtpList.filter(vtp => {
          const vtpName = vtp.Name.toString().toLowerCase();
          return vtpName.includes(inputValue);
        });
      } else {
        this.filteredVTP = this.vtpList;
      }
    });
  }
  displayVTPName(vt: DropdownModel): string {
    return vt ? vt.Name : '';
  }
  onFocus(): void {
    this.filteredVTP = this.vtpList;
  }

  selectVTP(event: MatAutocompleteSelectedEvent): void {
    const selectedVTP = event.option.value;
    this.vcReportingAttendanceForm.controls['VTPId'].setValue(selectedVTP)
  }

  resetReportFilters(): void {
    this.vcReportingAttendanceForm.reset();
    this.vcReportingAttendanceForm.get('AcademicYearId').setValue(this.currentAcademicYearId);
    this.districtList = <DropdownModel[]>[];
    this.jobRoleList = <DropdownModel[]>[];

    if (this.UserModel.RoleCode === 'DisEO' || this.UserModel.RoleCode === 'DisRP' || this.UserModel.RoleCode === 'BEO' || this.UserModel.RoleCode === 'BRP') {
      this.vcReportingAttendanceForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);


      this.onChangeDivision(this.UserModel.DivisionId).then(response => {
        let districtIds = [];
        response.forEach(districtItem => {
          districtIds.push(districtItem.Id);
        });

        this.vcReportingAttendanceForm.controls["DistrictId"].setValue(districtIds);


        this.getVCReportingAttendanceReports();
      });
    }
    else {
      this.getVCReportingAttendanceReports();
    }
  }

  onChangeDivision(divisionId: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {

      this.commonService.GetMasterDataByType({ DataType: 'Districts', RoleId: this.UserModel.RoleCode, UserId: this.UserModel.UserTypeId, ParentId: divisionId, SelectTitle: 'District' }, false)
        .subscribe((response: any) => {

          this.districtList = response.Results.$values;
          this.vcReportingAttendanceForm.controls['DistrictId'].setValue(null);
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

  //Create VCReportingAttendance form and returns {FormGroup}
  createVCReportingAttendanceForm(): FormGroup {
    return this.formBuilder.group({
      AcademicYearId: new FormControl(),
      MonthId: new FormControl(),
      DivisionId: new FormControl(),
      DistrictId: new FormControl(),
      SectorId: new FormControl(),
      JobRoleId: new FormControl(),
      ClassId: new FormControl(),
      VTPId: new FormControl(),
      SchoolManagementId: new FormControl()
    });
  }

  getVCReportingAttendanceReports(): void {
    if (!this.vcReportingAttendanceForm.valid) {
      return;
    }
    var vtpdetails = this.vcReportingAttendanceForm.get('VTPId').value;
    var vtpid = vtpdetails ? vtpdetails.Id : null;
    this.vcReportingAttendanceForm.get('AcademicYearId').disable();
    var reportParams = {
      UserId: this.UserModel.LoginId,
      AcademicYearId: this.vcReportingAttendanceForm.get('AcademicYearId').value,
      DivisionId: this.vcReportingAttendanceForm.get('DivisionId').value,
      DistrictId: this.vcReportingAttendanceForm.get('DistrictId').value,
      SectorId: this.vcReportingAttendanceForm.get('SectorId').value,
      JobRoleId: this.vcReportingAttendanceForm.get('JobRoleId').value,
      VTPId: vtpid,
      ClassId: this.vcReportingAttendanceForm.get('ClassId').value,
      MonthId: this.vcReportingAttendanceForm.get('MonthId').value,
      SchoolManagementId: this.vcReportingAttendanceForm.get('SchoolManagementId').value
    };

    reportParams.DistrictId = (reportParams.DistrictId != null && reportParams.DistrictId.length > 0) ? reportParams.DistrictId.toString() : null;

    this.reportService.GetVCReportingAttendanceReportsByCriteria(reportParams).subscribe(response => {
      this.displayedColumns = ['SrNo', 'AcademicYear', 'SchoolAllottedYear', 'PhaseName', 'VTPName', 'VCName', 'VCMobile', 'VCEmail', 'MonthYear', 'TotalDays', 'NoOfSundays', 'WorkingDays', 'Holidays', 'LeaveDays', 'NumberOfSchools', 'SchoolVisitDays', 'VCReportsSubmitted'];

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
    var reportParams: any = {
      UserId: this.UserModel.LoginId,
      AcademicYearId: this.vcReportingAttendanceForm.get('AcademicYearId').value,
      DivisionId: this.vcReportingAttendanceForm.get('DivisionId').value,
      DistrictId: this.vcReportingAttendanceForm.get('DistrictId').value,
      SectorId: this.vcReportingAttendanceForm.get('SectorId').value,
      JobRoleId: this.vcReportingAttendanceForm.get('JobRoleId').value,
      VTPId: this.vcReportingAttendanceForm.get('VTPId').value,
      ClassId: this.vcReportingAttendanceForm.get('ClassId').value,
      MonthId: this.vcReportingAttendanceForm.get('MonthId').value,
      SchoolManagementId: this.vcReportingAttendanceForm.get('SchoolManagementId').value
    };

    reportParams.DistrictId = (reportParams.DistrictId != null && reportParams.DistrictId.length > 0) ? reportParams.DistrictId.toString() : null;
    

    this.reportService.GetVCReportingAttendanceReportsByCriteria(reportParams).subscribe(response => {

      response.Results.$values.forEach(
        function (obj) {
         delete obj.$id;
        });
      this.exportExcelFromTable(response.Results.$values, "VCReportingAttendances");
      this.IsLoading = false;
      this.SearchBy.PageIndex = 0;
      this.SearchBy.PageSize = 10;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }
}
