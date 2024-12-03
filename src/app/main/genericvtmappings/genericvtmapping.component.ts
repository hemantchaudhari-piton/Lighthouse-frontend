import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DropdownModel } from 'app/models/dropdown.model';
import { GenericVTMappingModel } from './genericvtmapping.model';
import { GenericVTMappingService } from './genericvtmapping.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
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
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  selector: 'data-list-view',
  templateUrl: './genericvtmapping.component.html',
  styleUrls: ['./genericvtmapping.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class GenericVTMappingComponent extends BaseListComponent<GenericVTMappingModel> implements OnInit {
  UserId: string;
  userList: DropdownModel[];
  userFilterList: any;
  gvtList: [DropdownModel];
  vtpList: [DropdownModel];
  vcList: [DropdownModel];
  vtList: [DropdownModel];
  sectorList: [DropdownModel];
  jobRoleList: any;

  genericvtmappingFilterForm: FormGroup;
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public formBuilder: FormBuilder,
    public zone: NgZone,
    private dialogService: DialogService,
    private genericvtmappingService: GenericVTMappingService) {
    super(commonService, router, routeParams, snackBar, zone);
    this.genericvtmappingFilterForm = this.creategenericvtmappingFilterForm();
  }

  ngOnInit(): void {
    this.genericvtmappingService.getGenericVTMapping(this.UserModel).subscribe(results => {
      if (results[0].Success) {
        this.gvtList = results[0].Results.$values;
      }
      if (results[1].Success) {
        this.vtpList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.vcList = results[2].Results.$values;
      }

      if (results[3].Success) {
        this.vtList = results[3].Results.$values;

      }
      if (results[4].Success) {
        this.sectorList = results[4].Results.$values;

      }
      this.onLoadGenericVTMappingByCriteria();

    });
  }

  onLoadGenericVTMappingByCriteria(): void {
    this.IsLoading = true;
    let statusValue = this.genericvtmappingFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;
    
    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    let genericvtParams: any = {
      UserTypeId: this.UserModel.UserTypeId,
      SectorId :this.genericvtmappingFilterForm.controls["SectorId"].value,
      JoRoleId :this.genericvtmappingFilterForm.controls["JobRoleId"].value,
      Status: statusToSend,
      CharBy: null,
      PageIndex: this.SearchBy.PageIndex,
      PageSize: this.SearchBy.PageSize
    };

    this.genericvtmappingService.GetAllByCriteria(genericvtParams).subscribe(response => {
      this.displayedColumns = [
        'VTPShortName',
        'VCFullName',
        'VCEmailId',
        'VTFullName',
        'VTEmail',
        'SchoolName',
        'SectorName',
        'JobRoleName',
        'DateOfAllocation',  
        'DateOfAllocationVC',
        'CreatedBy', 
        'UpdatedBy', 
        'DateOfRemoval',
        'IsActive', 
        'Actions'
      ];

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
    });
  }

  exportExcel(): void {
    this.IsLoading = true;
    let statusValue = this.genericvtmappingFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;
    
    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    let genericvtParams: any = {
      UserTypeId: this.UserModel.UserTypeId,
      SectorId :this.genericvtmappingFilterForm.controls["SectorId"].value,
      JoRoleId :this.genericvtmappingFilterForm.controls["JobRoleId"].value,
      Status: statusToSend,
      CharBy: null,
      PageIndex: this.SearchBy.PageIndex,
      PageSize: this.SearchBy.PageSize
    };

    this.genericvtmappingService.GetAllByCriteria(genericvtParams).subscribe(response => {
      response.Results.$values.forEach(
        function (obj) {
          if (obj.hasOwnProperty('IsActive')) {
            obj.IsActive = obj.IsActive ? 'Yes' : 'No';
          }
          delete obj.$id;
          delete obj.TotalRows;
        });


      this.exportExcelFromTable(response.Results.$values, "GenericVTMappings");

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
    this.onLoadGenericVTMappingByCriteria();
  }

  resetFilters(): void {
    this.genericvtmappingFilterForm.reset();
    this.jobRoleList = [];
    this.onLoadGenericVTMappingByCriteria();
  }

  onDeleteGenericVTMapping(genericvtmappingId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.genericvtmappingService.deleteGenericVTMappingById(genericvtmappingId)
            .subscribe((genericvtmappingResp: any) => {

              this.zone.run(() => {
                if (genericvtmappingResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('GenericVTMapping deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }

  creategenericvtmappingFilterForm(): FormGroup {
    return this.formBuilder.group({
      SectorId: new FormControl(),
      JobRoleId: new FormControl(),
      Status: new FormControl(true)
    });
  }
}
