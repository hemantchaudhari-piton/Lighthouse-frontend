import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SchoolSectorJobModel } from './schoolsectorjob.model';
import { SchoolSectorJobService } from './schoolsectorjob.service';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DropdownModel } from 'app/models/dropdown.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';

@Component({
  selector: 'data-list-view',
  templateUrl: './schoolsectorjob.component.html',
  styleUrls: ['./schoolsectorjob.component.scss'],
  animations: fuseAnimations,  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None
})

export class SchoolSectorJobComponent extends BaseListComponent<SchoolSectorJobModel> implements OnInit {
  schoolSectorJobRoleFilterForm: FormGroup;
  schoolList: DropdownModel[];
  sectorList: DropdownModel[];
  jobRoleList: any;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    public zone: NgZone,
    private dialogService: DialogService,
    private schoolsectorjobService: SchoolSectorJobService) {
    super(commonService, router, routeParams, snackBar, zone);
    this.schoolSectorJobRoleFilterForm = this.createSchoolSectorJobFilterForm();
  }

  ngOnInit(): void {
    this.schoolsectorjobService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['SchoolName', 'SectorName', 'JobRoleName', 'DateOfAllocation', 'CreatedBy', 'UpdatedBy', 'DateOfRemoval', 'Actions'];
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
    this.onLoadSchoolSectorJobByCriteria();
    this.schoolsectorjobService.getDropdownforSchoolSector(this.UserModel).subscribe((results) => {

      if (results[0].Success) {
        this.schoolList = results[0].Results.$values;
      }
      if (results[1].Success) {
        this.sectorList = results[1].Results.$values;
      }
    });
  }
  onLoadSchoolSectorJobByCriteria(): any {
    this.IsLoading = true;
    let statusValue = this.schoolSectorJobRoleFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;

    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    let schoolSectorJobParams: any = {
      userTypeId: this.UserModel.UserTypeId,
      schoolId: this.schoolSectorJobRoleFilterForm.controls["SchoolId"].value,
      sectorId: this.schoolSectorJobRoleFilterForm.controls["SectorId"].value,
      jobRoleId: this.schoolSectorJobRoleFilterForm.controls['JobRoleId'].value,
      status: statusToSend,
      charBy: null,
      pageIndex: this.SearchBy.PageIndex,
      pageSize: this.SearchBy.PageSize
    };
    this.schoolsectorjobService.GetAllByCriteria(schoolSectorJobParams).subscribe(response => {
      this.displayedColumns = ['SchoolName', 'SectorName', 'JobRoleName', 'DateOfAllocation', 'DateOfRemoval', 'CreatedBy', 'UpdatedBy'];
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

  exportExcel(): void {
    this.IsLoading = true;
    let statusValue = this.schoolSectorJobRoleFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;

    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    let schoolSectorJobParams: any = {
      userTypeId: this.UserModel.UserTypeId,
      schoolId: this.schoolSectorJobRoleFilterForm.controls["SchoolId"].value,
      sectorId: this.schoolSectorJobRoleFilterForm.controls["SectorId"].value,
      jobRoleId: this.schoolSectorJobRoleFilterForm.controls['JobRoleId'].value,
      status: statusToSend,
      charBy: null,
      pageIndex: this.SearchBy.PageIndex,
      pageSize: this.SearchBy.PageSize
    };
    this.schoolsectorjobService.GetAllByCriteria(schoolSectorJobParams).subscribe(response => {
      response.Results.$values.forEach(
        function (obj) {
          if (obj.hasOwnProperty('IsActive')) {
            obj.IsActive = obj.IsActive ? 'Yes' : 'No';
          }

          delete obj.$id;
          delete obj.schoolsectorjobId;
          delete obj.TotalRows;
        });


      this.exportExcelFromTable(response.Results.$values, "SchoolSectorJobs");

      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }

  onChangeSector(sectorId: string): void {
    this.commonService.GetMasterDataByType({ DataType: 'JobRoles', ParentId: sectorId, SelectTitle: 'Job Role' }).subscribe((response: any) => {
      this.jobRoleList = response.Results.$values;
    });
  }
  onLoadGenericVTMappingByFilters(): any {
    this.SearchBy.PageIndex = 0;
    this.onLoadSchoolSectorJobByCriteria();
  }

  resetFilters(): void {
    this.schoolSectorJobRoleFilterForm.reset();
   this.jobRoleList = [];
    this.onLoadSchoolSectorJobByCriteria();
  }
  onDeleteSchoolSectorJob(schoolsectorjobId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.schoolsectorjobService.deleteSchoolSectorJobById(schoolsectorjobId)
            .subscribe((schoolsectorjobResp: any) => {

              this.zone.run(() => {
                if (schoolsectorjobResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('SchoolSectorJob deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }
  createSchoolSectorJobFilterForm(): FormGroup {
    return this.formBuilder.group({
      SchoolId: new FormControl(),
      SectorId: new FormControl(),
      JobRoleId: new FormControl(),
      Status: new FormControl(true)
    });
  }
}
