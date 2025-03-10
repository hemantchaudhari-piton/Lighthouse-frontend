import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ToolsAndEquipmentStatusModel } from './tools-equipment-status.model';
import { ReportService } from 'app/reports/report.service';
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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  selector: 'data-list-view',
  templateUrl: './tools-equipment-status.component.html',
  styleUrls: ['./tools-equipment-status.component.scss'],
  standalone: true,
  imports: [MatTableExporterModule, CommonModule, MatIconModule, MatPaginator,MatTableModule,RouterModule,ReactiveFormsModule,MatFormFieldModule, MatInputModule, MatSelectModule,FuseSharedModule],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class ToolsAndEquipmentStatusComponent extends BaseListComponent<ToolsAndEquipmentStatusModel> implements OnInit {
  toolsAndEquipmentStatusForm: FormGroup;

  academicyearList: [DropdownModel];
  divisionList: [DropdownModel];
  districtList: DropdownModel[];
  sectorList: [DropdownModel];
  jobRoleList: DropdownModel[];
  vtpList: [DropdownModel];
  classList: [DropdownModel];
  monthList: [DropdownModel];
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
        this.toolsAndEquipmentStatusForm.get('AcademicYearId').setValue(this.currentAcademicYearId);

        if (this.UserModel.RoleCode === 'DivEO') {
          this.toolsAndEquipmentStatusForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);


          this.onChangeDivision(this.UserModel.DivisionId).then(response => {
            this.getToolsAndEquipmentStatusReports();
          });
        }
        else if (this.UserModel.RoleCode === 'DisEO' || this.UserModel.RoleCode === 'DisRP' || this.UserModel.RoleCode === 'BEO' || this.UserModel.RoleCode === 'BRP') {
          this.toolsAndEquipmentStatusForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);


          this.onChangeDivision(this.UserModel.DivisionId).then(response => {
            let districtIds = [];
            response.forEach(districtItem => {
              districtIds.push(districtItem.Id);
            });

            this.toolsAndEquipmentStatusForm.controls["DistrictId"].setValue(districtIds);

            this.getToolsAndEquipmentStatusReports();
          });
        }
        else {
          this.getToolsAndEquipmentStatusReports();
        }
      }
    });

    this.toolsAndEquipmentStatusForm = this.createToolsAndEquipmentStatusForm();
  }

  resetReportFilters(): void {
    this.toolsAndEquipmentStatusForm.reset();
    this.toolsAndEquipmentStatusForm.get('AcademicYearId').setValue(this.currentAcademicYearId);
    this.districtList = <DropdownModel[]>[];
    this.jobRoleList = <DropdownModel[]>[];

    if (this.UserModel.RoleCode === 'DisEO' || this.UserModel.RoleCode === 'DisRP' || this.UserModel.RoleCode === 'BEO' || this.UserModel.RoleCode === 'BRP') {
      this.toolsAndEquipmentStatusForm.controls["DivisionId"].setValue(this.UserModel.DivisionId);


      this.onChangeDivision(this.UserModel.DivisionId).then(response => {
        let districtIds = [];
        response.forEach(districtItem => {
          districtIds.push(districtItem.Id);
        });

        this.toolsAndEquipmentStatusForm.controls["DistrictId"].setValue(districtIds);


        this.getToolsAndEquipmentStatusReports();
      });
    }
    else {
      this.getToolsAndEquipmentStatusReports();
    }
  }

  onChangeDivision(divisionId: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {

      this.commonService.GetMasterDataByType({ DataType: 'Districts', RoleId: this.UserModel.RoleCode, UserId: this.UserModel.UserTypeId, ParentId: divisionId, SelectTitle: 'District' }, false)
        .subscribe((response: any) => {

          this.districtList = response.Results.$values;
          this.toolsAndEquipmentStatusForm.controls['DistrictId'].setValue(null);
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

  //Create ToolsAndEquipmentStatus form and returns {FormGroup}
  createToolsAndEquipmentStatusForm(): FormGroup {
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

  getToolsAndEquipmentStatusReports(): void {
    if (!this.toolsAndEquipmentStatusForm.valid) {
      return;
    }
    this.toolsAndEquipmentStatusForm.get('AcademicYearId').disable();
    var reportParams: any = {
      UserId: this.UserModel.LoginId,
      AcademicYearId: this.toolsAndEquipmentStatusForm.get('AcademicYearId').value,
      DivisionId: this.toolsAndEquipmentStatusForm.get('DivisionId').value,
      DistrictId: this.toolsAndEquipmentStatusForm.get('DistrictId').value,
      SectorId: this.toolsAndEquipmentStatusForm.get('SectorId').value,
      JobRoleId: this.toolsAndEquipmentStatusForm.get('JobRoleId').value,
      VTPId: this.toolsAndEquipmentStatusForm.get('VTPId').value,
      ClassId: this.toolsAndEquipmentStatusForm.get('ClassId').value,
      MonthId: this.toolsAndEquipmentStatusForm.get('MonthId').value,
      SchoolManagementId: this.toolsAndEquipmentStatusForm.get('SchoolManagementId').value
    };

    if (this.UserModel.RoleCode == 'HM') {
      reportParams.HMId = this.UserModel.UserTypeId;
    }

    reportParams.DistrictId = (reportParams.DistrictId != null && reportParams.DistrictId.length > 0) ? reportParams.DistrictId.toString() : null;

    this.reportService.GetToolsAndEquipmentStatusReportsByCriteria(reportParams).subscribe(response => {
      this.displayedColumns = ['SrNo', 'AcademicYear', 'SchoolAllottedYear', 'PhaseName', 'VTPName', 'VCName', 'VCMobile', 'VCEmail', 'VTName', 'VTMobile', 'VTEmail', 'VTDateOfJoining', 'HMName', 'HMMobile', 'HMEmail', 'SchoolManagement', 'DivisionName', 'DistrictName', 'BlockName', 'UDISE', 'SchoolName', 'SectorName', 'ToolsReceiptStatus', 'ToolsAvailabilityStatus', 'MonthOfReceipt'];
      if (this.UserModel.RoleCode !== 'VC') {
        this.displayedColumns.splice(23, 0, 'JobRoleName');
    }

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
      AcademicYearId: this.toolsAndEquipmentStatusForm.get('AcademicYearId').value,
      DivisionId: this.toolsAndEquipmentStatusForm.get('DivisionId').value,
      DistrictId: this.toolsAndEquipmentStatusForm.get('DistrictId').value,
      SectorId: this.toolsAndEquipmentStatusForm.get('SectorId').value,
      JobRoleId: this.toolsAndEquipmentStatusForm.get('JobRoleId').value,
      VTPId: this.toolsAndEquipmentStatusForm.get('VTPId').value,
      ClassId: this.toolsAndEquipmentStatusForm.get('ClassId').value,
      MonthId: this.toolsAndEquipmentStatusForm.get('MonthId').value,
      SchoolManagementId: this.toolsAndEquipmentStatusForm.get('SchoolManagementId').value
    };
    if (this.UserModel.RoleCode == 'HM') {
      reportParams.HMId = this.UserModel.UserTypeId;
    }
    reportParams.DistrictId = (reportParams.DistrictId != null && reportParams.DistrictId.length > 0) ? reportParams.DistrictId.toString() : null;
    this.reportService.GetToolsAndEquipmentStatusReportsByCriteria(reportParams).subscribe(response => {
      const columns = ['SrNo', 'AcademicYear', 'SchoolAllottedYear', 'PhaseName', 'VTPName', 'VCName', 'VCMobile', 'VCEmail', 'VTName', 'VTMobile', 'VTEmail', 'VTDateOfJoining', 'HMName', 'HMMobile', 'HMEmail', 'SchoolManagement', 'DivisionName', 'DistrictName', 'BlockName', 'UDISE', 'SchoolName', 'SectorName', 'ToolsReceiptStatus', 'ToolsAvailabilityStatus', 'MonthOfReceipt'];
      // Add 'JobRoleName' if the user is not a 'VC'
      if (this.UserModel.RoleCode !== 'VC') {
          columns.splice(23, 0, 'JobRoleName');
      }
      // Fill missing fields with a empty row
      const filledData = response.Results.$values.map(row => {
          let filledRow = {};
          columns.forEach(col => {
              filledRow[col] = row[col] !== undefined ? row[col] : '';
          });
          return filledRow;
      });

      this.exportExcelFromTable(filledData, "ToolsAndEquipmentStatus");
      this.IsLoading = false;
      this.SearchBy.PageIndex = 0;
      this.SearchBy.PageSize = 10;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }
}
