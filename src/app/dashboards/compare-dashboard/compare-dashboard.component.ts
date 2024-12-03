import { Component, OnInit, NgZone, ViewEncapsulation, DebugElement, ViewChild } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { CompareDashboardModel } from './compare-dashboard.model';
import { CompareDashboardService } from './compare-dashboard.service';
import { DropdownModel } from 'app/models/dropdown.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RouteConstants } from 'app/constants/route.constant';
import { MatTableDataSource } from '@angular/material/table';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import html2canvas from 'html2canvas';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'data-list-view',standalone : true ,
  imports: [MatPaginatorModule,FormsModule,CommonModule,MatRadioModule,MatDividerModule,MatTableModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  templateUrl: './compare-dashboard.component.html',
  styleUrls: ['./compare-dashboard.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class CompareDashboardComponent extends BaseListComponent<CompareDashboardModel> implements OnInit {
  compareDashboardForm: FormGroup;
  academicYearList: [DropdownModel];
  divisionList: [DropdownModel];
  districtList: DropdownModel[];
  sectorList: [DropdownModel];
  jobRoleList: DropdownModel[];
  vtpList: [DropdownModel];
  classList: [DropdownModel];
  monthList: [DropdownModel];
  blockList: [DropdownModel];

  kpiList: any[] = [{ kpivalue: "selectkpi", kpiLable: "Select KPI" }, { kpivalue: "school", kpiLable: "Schools" },
  { kpivalue: "course material", kpiLable: "Course Material" }, { kpivalue: "tools and equipment", kpiLable: "Tools and Equipment" },
  { kpivalue: "student", kpiLable: "Students" }, { kpivalue: "new enrolments & dropouts", kpiLable: "New Enrolments & Dropouts" },
  { kpivalue: "guest lecture", kpiLable: "Guest Lectures" }, { kpivalue: "field visits", kpiLable: "Field Visits" },
  { kpivalue: "trainers", kpiLable: "Trainers" }, { kpivalue: "coordinators", kpiLable: "Coordinators" },
  { kpivalue: "reporting", kpiLable: "Reporting" }]

  schoolManagementList: [DropdownModel];
  currentYear: any;
  compareDashboardFor: string;
  vtpSelected: boolean = false;
  sectorSelected: boolean = false;
  typeOfKPI: string;
  currentAcademicYearId: string;

  @ViewChild('districtMatSelect') districtSelections: MatSelect;

  //Export From Kpis data
  schoolData: any;
  courseMaterialData: any;
  guestLectureData: any;
  toolsAndEquipmentsData: any;
  newEnrolmentsAndDropoutsData: any;
  fieldVisitData: any;
  studentData: any;
  coordinatorsData: any;
  reportingData: any;
  trainersData: any;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    private compareDashboardService: CompareDashboardService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.resetDashboardFilters();
    this.compareDashboardForm.get('ChooseKPI').setValue('selectkpi');
    this.compareDashboardFor = 'ByVTP';
    this.onChangeFor('ByVTP');
  }

  resetDashboardFilters(): void {
    this.compareDashboardService.GetDropdownForReports(this.UserModel).subscribe(results => {
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
      }

      if (results[4].Success) {
        this.classList = results[4].Results.$values;
      }

      if (results[5].Success) {
        this.monthList = results[5].Results.$values;
      }

      if (results[7].Success) {
        this.schoolManagementList = results[7].Results.$values;
      }

      let currentYearItem = this.academicYearList.find(ay => ay.IsSelected == true)
      if (currentYearItem != null) {
        this.currentAcademicYearId = currentYearItem.Id;
        this.compareDashboardForm.get('AcademicYearId').setValue(this.currentAcademicYearId);
      }

      this.districtList = <DropdownModel[]>[];
      this.jobRoleList = <DropdownModel[]>[];
      this.compareDashboardFor = 'ByVTP';
      this.compareDashboardForm.get('ChooseKPI').setValue('selectkpi');

      if (this.UserModel.RoleCode === 'DivEO') {
        this.compareDashboardForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);

        this.onChangeDivision(this.UserModel.DivisionId).then(response => {
          this.getCompareDashboards();
        });
      }
      else if (this.Constants.UserRoleIds.indexOf(this.UserModel.RoleCode) > 0) {
        this.compareDashboardForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);

        this.onChangeDivision(this.UserModel.DivisionId).then(response => {
          let districtIds = [];
          response.forEach(districtItem => {
            districtIds.push(districtItem.Id);
          });

          this.compareDashboardForm.controls["DistrictId"].setValue(districtIds);
          this.getCompareDashboards();
        });
      }
      else {
        this.getCompareDashboards();
      }
    });

    this.compareDashboardForm = this.createCompareDashboardForm();
  }

  onChangeDivision(divisionId: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {

      this.commonService.GetMasterDataByType({ DataType: 'Districts', RoleId: this.UserModel.RoleCode, UserId: this.UserModel.UserTypeId, ParentId: divisionId, SelectTitle: 'District' }, false)
        .subscribe((response: any) => {
          this.districtList = response.Results.$values;
          this.compareDashboardForm.controls['DistrictId'].setValue(null);

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
      this.compareDashboardForm.controls['JobRoleId'].setValue(null);
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

  //Create CompareDashboard form and returns {FormGroup}
  createCompareDashboardForm(): FormGroup {
    return this.formBuilder.group({
      AcademicYearId: new FormControl(),
      MonthId: new FormControl(),
      DivisionId: new FormControl(),
      DistrictId: new FormControl(),
      SectorId: new FormControl(),
      JobRoleId: new FormControl(),
      ClassId: new FormControl(),
      VTPId: new FormControl(),
      SchoolManagementId: new FormControl(),
      ChooseKPI: new FormControl()
    });
  }

  refreshSummaryDashboard() {
    this.router.navigate([RouteConstants.CompareDashboard.CompareDashboard]);
  }

  getCompareDashboards(): void {
    let chooseKPI = this.compareDashboardForm.get('ChooseKPI').value;

    if (chooseKPI != null && chooseKPI != 'selectkpi') {
      this.onChangeKPI(chooseKPI, this.compareDashboardFor);
    }
  }

  onChangeFor(forValue: string) {
    if (forValue == 'ByVTP') {
      this.typeOfKPI = 'VTP Name';
    }
    else if (forValue == 'BySector') {
      this.typeOfKPI = 'Sector Name';
    }

    this.compareDashboardFor = forValue;
    let chooseKPI = this.compareDashboardForm.get('ChooseKPI').value;
    this.onChangeKPI(chooseKPI, forValue);
  }

  onChangeKPI(kpiValue: string, filterBy: string) {
    if (!this.compareDashboardForm.valid) {
      return;
    }

    var compareParams = {
      DataType: filterBy,
      UserId: this.UserModel.LoginId,
      AcademicYearId: this.compareDashboardForm.get('AcademicYearId').value,
      MonthId: this.compareDashboardForm.get('MonthId').value,
      DivisionId: this.compareDashboardForm.get('DivisionId').value,
      DistrictCode: this.compareDashboardForm.get('DistrictId').value,
      SectorId: this.compareDashboardForm.get('SectorId').value,
      JobRoleId: this.compareDashboardForm.get('JobRoleId').value,
      ClassId: this.compareDashboardForm.get('ClassId').value,
      VTPId: this.compareDashboardForm.get('VTPId').value,
      SchoolManagementId: this.compareDashboardForm.get('SchoolManagementId').value
    };

    compareParams.DistrictCode = (compareParams.DistrictCode != null && compareParams.DistrictCode.length > 0) ? compareParams.DistrictCode.toString() : null;

    this.tableDataSource = new MatTableDataSource<Element>();
    this.displayedColumns = [];

    if (kpiValue == 'school') {
      this.compareDashboardService.GetCompareSchoolsData(compareParams).subscribe(response => {
        this.displayedColumns = ['Id', 'Name', 'ImplementedSchools', 'ApprovedSchools', 'JobRoleUnits', 'Class09', 'Class10', 'Class11', 'Class12', 'studentMaleFemale'];

        this.schoolData = response.Results.$values

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

    else if (kpiValue == 'course material') {
      this.compareDashboardService.GetCompareCourseMaterialsData(compareParams).subscribe(response => {
        this.displayedColumns = ['Id', 'Name', 'JobRoleTaught', 'ImplementedSchools', 'JobRoleUnits', 'Classes', 'ClassesWithCM', 'ClassesWithoutCM', 'StatusNotReported'];

        this.courseMaterialData = response.Results.$values;

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

    else if (kpiValue == 'tools and equipment') {
      this.compareDashboardService.GetCompareToolsAndEquipmentsData(compareParams).subscribe(response => {
        this.displayedColumns = ['Id', 'Name', 'JobRoleTaught', 'ImplementedSchools', 'JobRoleUnits', 'Classes', 'JobroleUnitsWithTE', 'JobroleUnitsWithoutTE', 'StatusNotReported'];

        this.toolsAndEquipmentsData = response.Results.$values;

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

    else if (kpiValue == 'student') {
      this.compareDashboardService.GetCompareStudentsData(compareParams).subscribe(response => {
        this.displayedColumns = ['Id', 'Name', 'ImplementedSchools', 'Classes', 'EnrollmentStudents', 'StudentAttendance'];
        this.studentData = response.Results.$values;

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

    else if (kpiValue == 'new enrolments & dropouts') {
      this.compareDashboardService.GetCompareNewEnrolmentAndDropoutStudentsData(compareParams).subscribe(response => {
        this.displayedColumns = ['Id', 'Name', 'ImplementedSchools', 'Classes', 'NewEnrolments', 'Dropouts', 'CurrentStudents'];
        this.newEnrolmentsAndDropoutsData = response.Results.$values;
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

    else if (kpiValue == 'guest lecture') {
      this.compareDashboardService.GetCompareGuestLecturesData(compareParams).subscribe(response => {
        this.displayedColumns = ['Id', 'Name', 'ImplementedSchools', 'Classes', 'TotalGLConductedCount', 'AverageGLConductedPerClass'];
        this.guestLectureData = response.Results.$values;
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

    else if (kpiValue == 'field visits') {
      this.compareDashboardService.GetCompareFieldVisitsData(compareParams).subscribe(response => {
        this.displayedColumns = ['Id', 'Name', 'ImplementedSchools', 'Classes', 'TotalFVConductedCount', 'AverageFVConductedPerClass'];
        this.fieldVisitData = response.Results.$values;
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

    else if (kpiValue == 'trainers') {
      this.compareDashboardService.GetCompareTrainersData(compareParams).subscribe(response => {
        this.displayedColumns = ['Id', 'Name', 'ImplementedSchools', 'TrainersPlaced', 'TrainersReporting', 'TrainerAttendance'];
        this.trainersData = response.Results.$values;
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

    else if (kpiValue == 'coordinators') {
      this.compareDashboardService.GetCompareCoordinatorsData(compareParams).subscribe(response => {
        this.displayedColumns = ['Id', 'Name', 'Districts', 'SchoolsCovered', 'CoordinatorsPlaced', 'CoordinatorsReporting', 'NoOfSchoolVisits', 'NoOfMeetingsHeld', 'NoOfOutreachActivities'];
        this.coordinatorsData = response.Results.$values;
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

    else if (kpiValue == 'reporting') {
      this.compareDashboardService.GetCompareVTVCReportingData(compareParams).subscribe(response => {
        this.displayedColumns = ['Id', 'Name', 'ImplementedSchools', 'TrainersPlaced', 'TotalVT', 'TrainersReporting', 'CoordinatorsPlaced', 'TotalVC', 'CoordinatorsReporting'];
        this.reportingData = response.Results.$values;

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

  isShowDivIf = false;
  percentageLessThan25(reportingPercentage) {
    if (reportingPercentage <= 25) {
      return true;
    }
  }

  percentageInBetween26to50(reportingPercentage) {
    if (reportingPercentage >= 26 && reportingPercentage <= 50) {
      return true;
    }
  }

  percentageInBetween51to75(reportingPercentage) {
    if (reportingPercentage >= 51 && reportingPercentage <= 75) {
      return true;
    }
  }

  percentageGreaterThan75(reportingPercentage) {
    if (reportingPercentage > 75) {
      return true;
    }
  }

  toggleDisplayDivIf() {
    this.isShowDivIf = !this.isShowDivIf;
  }

  //download vtp and sector from kpis
  exportFromKpisDataExcel(evt, exportType) {
    let excelDataSource: any = [];
    //Programme Information Graph
    if (exportType == 'Schools') {
      excelDataSource = this.schoolData;
    }
    else if (exportType == 'Reporting') {
      excelDataSource = this.reportingData;
    }
    else if (exportType == 'Coordinators') {
      excelDataSource = this.coordinatorsData;
    }
    else if (exportType == 'Students') {
      excelDataSource = this.studentData;
    }
    else if (exportType == 'CourseMaterial') {
      excelDataSource = this.courseMaterialData;
    }
    else if (exportType == 'ToolsAndEquipment') {
      excelDataSource = this.toolsAndEquipmentsData;
    }
    else if (exportType == 'NewEnrolmentsAndDropouts') {
      excelDataSource = this.newEnrolmentsAndDropoutsData;
    }
    else if (exportType == 'FieldVisit') {
      excelDataSource = this.fieldVisitData;
    }
    else if (exportType == 'GuestLecture') {
      excelDataSource = this.guestLectureData;
    }
    else if (exportType == 'Trainers') {
      excelDataSource = this.trainersData;
    }
    this.exportExcelFromTable(excelDataSource, exportType).then(resp => {
      //this.capturedImageFromContainer(exportType, resp);
    })
  }
}
