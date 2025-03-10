import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/reports/report.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { VTDailyAttendanceTrackingModel } from './vt-daily-attendance-tracking.model';
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
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';


@Component({
  selector: 'data-list-view',
  templateUrl: './vt-daily-attendance-tracking.component.html',
  styleUrls: ['./vt-daily-attendance-tracking.component.scss'],
  animations: fuseAnimations,
  standalone: true,
  imports: [MatTableExporterModule, MatIconModule,CommonModule, MatPaginator,MatTableModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None
})

export class VTDailyAttendanceTrackingComponent extends BaseListComponent<VTDailyAttendanceTrackingModel> implements OnInit {
  dailyAttendanceTrackingForm: FormGroup;
  vtpId: string;
  vcId: string;

  academicYearList: [DropdownModel];
  vtpList: [DropdownModel];
  filteredVTPItems: DropdownModel[] = [];
  vcList: DropdownModel[];
  filteredVCItems: DropdownModel[] = [];
  vtList: DropdownModel[];
  filteredVTItems: DropdownModel[] = [];
  schoolList: DropdownModel[];
  filteredSchoolItems: DropdownModel[] = [];
  sectorList: [DropdownModel];
  jobRoleList: DropdownModel[];
  divisionList: [DropdownModel];
  districtList: DropdownModel[];
  schoolManagementList: [DropdownModel];
  vcdList: DropdownModel[];

  @ViewChild('districtMatSelect') districtSelections: MatSelect;
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;
  @ViewChild(MatAutocompleteTrigger) _autoVC: MatAutocompleteTrigger;
  @ViewChild(MatAutocompleteTrigger) _autoSchool: MatAutocompleteTrigger;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    private reportService: ReportService) {
    super(commonService, router, routeParams, snackBar, zone);

    this.SearchBy.PageIndex = 0;
    this.SearchBy.PageSize = 250;
    this.IsShowFilter = true;
    this.dailyAttendanceTrackingForm = this.createVTDailyAttendanceTrackingForm();
  }

  ngOnInit(): void {

    this.reportService.GetDropdownForReports(this.UserModel).subscribe(results => {
      if (results[0].Success) {
        this.academicYearList = results[0].Results.$values;
      }

      if (results[1].Success) {
        this.divisionList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.sectorList = results[2].Results.$values;
      }

      if (results[3].Success) {
        this.vtpList = results[3].Results.$values;
        this.filteredVTPItems = this.vtpList.slice();
      }

      if (results[6].Success) {
        this.schoolManagementList = results[6].Results.$values;
      }

      if (results[8].Success) {
        this.vcdList = results[8].Results.$values;
      }

      this.dailyAttendanceTrackingForm.get('AcademicYearId').setValue(this.UserModel.AcademicYearId);
      if (this.UserModel.RoleCode == 'VC') {
        this.SearchBy.VTId = this.UserModel.UserTypeId;

        this.commonService.getVTPByVC(this.UserModel).then(resp => {
          this.vtpId = resp[0].Id;
          this.vcId = resp[0].Name;
          const selectedVTPName = this.filteredVTPItems.find(item => item.Id === this.vtpId);
          const selectedVCName = this.vcdList.find(item => item.Id === this.vcId);

          this.dailyAttendanceTrackingForm.get('VTPId').setValue(selectedVTPName);
          this.dailyAttendanceTrackingForm.controls['VTPId'].disable();

          this.onChangeVTP(this.vtpId).then(vtpResp => {
            this.dailyAttendanceTrackingForm.get('VCId').setValue(selectedVCName);
            this.dailyAttendanceTrackingForm.controls['VCId'].disable();

            this.onChangeVC(this.vcId).then(vtpResp => {
              this.getVTDailyAttendanceTrackingReports();
            });
          });
        });

      }
      else if (this.UserModel.RoleCode === 'DivEO') {
        this.dailyAttendanceTrackingForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);

        this.onChangeDivision(this.UserModel.DivisionId);
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
    });
    this.dailyAttendanceTrackingForm.controls['VTPId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredVTPItems = this.vtpList.filter(vtp => {
          const vtpName = vtp.Name.toString().toLowerCase();
          return vtpName.includes(inputValue);
        });
      } else {
        this.filteredVTPItems = this.vtpList;
      }
    });

    this.dailyAttendanceTrackingForm.controls['VCId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredVCItems = this.vcList.filter(vc => {
          const vcName = vc.Name.toString().toLowerCase();
          return vcName.includes(inputValue);
        });
      } else {
        this.filteredVCItems = this.vcList;
      }
    });

    this.dailyAttendanceTrackingForm.controls['SchoolId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredSchoolItems = this.schoolList.filter(school => {
          const schoolName = school.Name.toString().toLowerCase();
          return schoolName.includes(inputValue);
        });
      } else {
        this.filteredSchoolItems = this.schoolList;
      }
    });
  }
  displayVTPName(vt: DropdownModel): string {
    return vt ? vt.Name : '';
  }
  onFocusVTP(): void {
    this.filteredVTPItems = this.vtpList;
  }

  selectVTP(event: MatAutocompleteSelectedEvent): void {
    const selectedVTP = event.option.value;
    this.dailyAttendanceTrackingForm.controls['VTPId'].setValue(selectedVTP)
    this.onChangeVTP(selectedVTP.Id);
  }



  displayVCName(vt: DropdownModel): string {
    return vt ? vt.Name : '';
  }
  onFocusVC(): void {
    this.filteredVCItems = this.vcList;
  }

  selectVC(event: MatAutocompleteSelectedEvent): void {
    const selectedVC = event.option.value;
    this.dailyAttendanceTrackingForm.controls['VCId'].setValue(selectedVC)
    this.onChangeVC(selectedVC.Id);

  }


  displaySchoolName(vt: DropdownModel): string {
    return vt ? vt.Name : '';
  }
  onFocusSchool(): void {
    this.filteredSchoolItems = this.schoolList;
  }

  selectSchool(event: MatAutocompleteSelectedEvent): void {
    const selectedSchool = event.option.value;
    this.dailyAttendanceTrackingForm.controls['SchoolId'].setValue(selectedSchool)
  }
  resetReportFilters(): void {
    this.dailyAttendanceTrackingForm.reset();
    this.dailyAttendanceTrackingForm.get('AcademicYearId').setValue(this.UserModel.AcademicYearId);
    this.districtList = <DropdownModel[]>[];
    this.jobRoleList = <DropdownModel[]>[];
    this.SearchBy.PageIndex = 0;

    if (this.UserModel.RoleCode === 'DisEO' || this.UserModel.RoleCode === 'DisRP' || this.UserModel.RoleCode === 'BEO' || this.UserModel.RoleCode === 'BRP') {
      this.dailyAttendanceTrackingForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);


      this.onChangeDivision(this.UserModel.DivisionId).then(response => {
        let districtIds = [];
        response.forEach(districtItem => {
          districtIds.push(districtItem.Id);
        });

        this.dailyAttendanceTrackingForm.controls["DistrictId"].setValue(districtIds);

        this.getVTDailyAttendanceTrackingReports();
      });
    }
    else {
      this.getVTDailyAttendanceTrackingReports();
    }
  }

  onChangeVTP(vtpId): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({ DataType: 'VocationalCoordinators', ParentId: vtpId, SelectTitle: 'Vocational Coordinator' })
        .subscribe((response: any) => {
          if (response.Success) {
            this.vcList = response.Results.$values;
            this.filteredVCItems = this.vcList.slice();

            // this.dailyAttendanceTrackingForm.get('VCId').setValue(null);
            // this.dailyAttendanceTrackingForm.get('VTId').setValue(null);
            // this.dailyAttendanceTrackingForm.get('SchoolId').setValue(null);
          }

          this.IsLoading = false;
          resolve(true);
        }, error => {
          console.log(error);
          resolve(false);
        });
    });
    return promise;
  }

  onChangeVC(vcId): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.IsLoading = true;
      this.commonService.GetMasterDataByType({ DataType: 'SchoolsByVC', ParentId: vcId, SelectTitle: 'School' }).subscribe((response: any) => {
        if (response.Success) {
          this.schoolList = response.Results.$values;
          this.filteredSchoolItems = this.schoolList.slice();

          this.dailyAttendanceTrackingForm.get('SchoolId').setValue(null);
          this.dailyAttendanceTrackingForm.get('VTId').setValue(null);
        }

        this.IsLoading = false;
        resolve(true);
      }, error => {
        console.log(error);
        resolve(false);
      });
    });
    return promise;
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

  onLoadVTDailyAttendanceTrackingReportsByFilters(): any {
    this.SearchBy.PageIndex = 0;
    this.getVTDailyAttendanceTrackingReports();
  }

  getVTDailyAttendanceTrackingReports(): void {
    this.getVTDailyAttendanceTrackingReportsData().then(response => {
      this.displayedColumns = ['VTPName', 'VCName', 'VCMobile', 'VCEmail', 'VTName', 'VTMobile', 'VTEmail', 'VTDateOfJoining', 'UDISE', 'SchoolName', 'SectorName', 'JobRoleName', 'ReportType', 'DateOfReport', 'ActualSubmissionDateTime', 'GeoLocation'];

      this.tableDataSource.data = response.Results.$values;
      this.tableDataSource.sort = this.ListSort;
      this.tableDataSource.paginator = this.ListPaginator;
      this.tableDataSource.filteredData = this.tableDataSource.data;

      this.SearchBy.TotalResults = response.TotalResults;

      setTimeout(() => {
        this.ListPaginator.pageIndex = this.SearchBy.PageIndex;
        this.ListPaginator.length = this.SearchBy.TotalResults;
      });

      this.zone.run(() => {
        if (this.tableDataSource.data.length == 0) {
          this.showNoDataFoundSnackBar();
        }
      });

      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
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
  getVTDailyAttendanceTrackingReportsData(): Promise<any> {
    if (!this.dailyAttendanceTrackingForm.valid) {
      this.validateAllFormFields(this.dailyAttendanceTrackingForm);
      return;
    }
    var schoolDetails = this.dailyAttendanceTrackingForm.get('SchoolId').value;
    var schoolId = schoolDetails ? schoolDetails.Id : null;
    var vtpdetails = this.dailyAttendanceTrackingForm.get('VTPId').value;
    var vtpId = vtpdetails ? vtpdetails.Id : null;
    var vcdetails = this.dailyAttendanceTrackingForm.get('VCId').value;
    var vcId = vcdetails ? vcdetails.Id : null;
    this.dailyAttendanceTrackingForm.get('AcademicYearId').disable();
    this.formatAndSetDate(this.dailyAttendanceTrackingForm.get('FromDate').value, 'FromDate');
    this.formatAndSetDate(this.dailyAttendanceTrackingForm.get('ToDate').value, 'ToDate');

    var reportParams = {
      AcademicYearId: this.dailyAttendanceTrackingForm.get('AcademicYearId').value,
      VTPId: vtpId,
      VCId: vcId,
      VTId: this.dailyAttendanceTrackingForm.get('VTId').value,
      SchoolId: schoolId,
      SectorId: this.dailyAttendanceTrackingForm.get('SectorId').value,
      JobRoleId: this.dailyAttendanceTrackingForm.get('JobRoleId').value,
      DivisionId: this.dailyAttendanceTrackingForm.get('DivisionId').value,
      DistrictId: this.dailyAttendanceTrackingForm.get('DistrictId').value,
      ClassId: this.dailyAttendanceTrackingForm.get('ClassId').value,
      SchoolManagementId: this.dailyAttendanceTrackingForm.get('SchoolManagementId').value,
      FromDate: this.dailyAttendanceTrackingForm.get('FromDate').value,
      ToDate: this.dailyAttendanceTrackingForm.get('ToDate').value,
      PageIndex: this.SearchBy.PageIndex,
      PageSize: this.SearchBy.PageSize
    };

    reportParams.DistrictId = (reportParams.DistrictId != null && reportParams.DistrictId.length > 0) ? reportParams.DistrictId.toString() : null;

    let promise = new Promise((resolve, reject) => {
      this.reportService.GetVTDailyAttendanceTrackingByCriteria(reportParams).subscribe(response => {
        resolve(response);
      }, error => {
        console.log(error);
        resolve(error);
      });
    });

    return promise;
  }

  onPageIndexChanged(evt) {
    this.SearchBy.PageIndex = evt.pageIndex;
    this.SearchBy.PageSize = evt.pageSize;

    this.getVTDailyAttendanceTrackingReports();
  }

  exportExcel(): void {
    this.SearchBy.PageSize = 10000000;
    
    this.getVTDailyAttendanceTrackingReportsData().then(response => {

      response.Results.$values.forEach(
        function (obj) {
          delete obj.$id;
          delete obj.VTDailyReportingId;
          delete obj.TotalRows;
          delete obj.SrNo;
        });

      this.exportExcelFromTable(response.Results.$values, "VTAttendanceTrackingReports");

      this.IsLoading = false;
      this.SearchBy.PageIndex = 0;
      this.SearchBy.PageSize = 250;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }

  //Create VTDailyAttendanceTracking form and returns {FormGroup}
  createVTDailyAttendanceTrackingForm(): FormGroup {
    return this.formBuilder.group({
      AcademicYearId: new FormControl({ value: '', disabled: true }, Validators.required),
      VTPId: new FormControl(),
      VCId: new FormControl(),
      VTId: new FormControl(),
      SchoolId: new FormControl(),
      SectorId: new FormControl(),
      JobRoleId: new FormControl(),
      DivisionId: new FormControl(),
      DistrictId: new FormControl(),
      ClassId: new FormControl(),
      SchoolManagementId: new FormControl(),
      FromDate: new FormControl('', Validators.required),
      ToDate: new FormControl('', Validators.required),
    });
  }
}
