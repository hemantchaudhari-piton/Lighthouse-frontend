import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VTAcademicClassSectionModel } from './vtacademicclasssection.model';
import { VTAcademicClassSectionService } from './vtacademicclasssection.service';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { DropdownModel } from 'app/models/dropdown.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  selector: 'data-list-view',
  templateUrl: './vtacademicclasssection.component.html',
  styleUrls: ['./vtacademicclasssection.component.scss'],
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,FuseSharedModule],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class VTAcademicClassSectionComponent extends BaseListComponent<VTAcademicClassSectionModel> implements OnInit {
  vtAcedemicClassSectionFilterForm: FormGroup;
  academicYearList: [DropdownModel];
  classList: [DropdownModel];
  sectionList: [DropdownModel];
  vtList: [DropdownModel];
  schoolList: [DropdownModel];
  sectorList: [DropdownModel];
  jobRoleList: [DropdownModel];

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private vtacademicclasssectionService: VTAcademicClassSectionService) {
    super(commonService, router, routeParams, snackBar, zone);
    this.vtAcedemicClassSectionFilterForm = this.createvtAcedemicClassSectionFilterForm();
  }

  ngOnInit(): void {

    this.vtacademicclasssectionService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['VTPShortName', 'VCFullName','SchoolName', 'AcademicYear', 'ClassName', 'SectionName', 'VTName', 'VTEmailId', 'SectorName', 'JobRoleName', 'DateOfAllocation', 'CreatedBy', 'UpdatedBy', 'DateOfRemoval',  'IsActive', 'Actions'];

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
    this.SearchBy.PageIndex = 0; 
    this.SearchBy.PageSize = 10;
    this.onLoadAcedemicClassSectionsByFilters();
    this.vtacademicclasssectionService.getVTAcademicClassSection(this.UserModel).subscribe(results => {
      this.commonService.GetMasterDataByType({ DataType: 'AcademicYears', SelectTitle: 'Academic Year' }).subscribe((response: any) => {
        this.academicYearList = response.Results.$values;
        let currentYearItem = this.academicYearList.find(ay => ay.IsSelected == true)
        if (currentYearItem != null) {
          this.AcademicYearId = currentYearItem.Id;
          this.vtAcedemicClassSectionFilterForm.get('AcademicYearId').setValue(this.AcademicYearId);
        }
      }); 
       
      

      if (results[1].Success) {
        this.classList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.sectionList = results[2].Results.$values;
      }
      if (results[3].Success) {
        this.sectorList = results[3].Results.$values;
      }

    });
  }
  
  onLoadAcedemicClassSectionsByFilters(): any {
    this.IsLoading = true;
    let statusValue = this.vtAcedemicClassSectionFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;
    
    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    this.vtAcedemicClassSectionFilterForm.get('AcademicYearId').disable();
    let schoolSectorJobParams: any = {
      vtId: this.vtAcedemicClassSectionFilterForm.controls["VTId"].value,
      userTypeId: this.UserModel.UserTypeId,
      schoolId: this.vtAcedemicClassSectionFilterForm.controls["SchoolId"].value,
      sectorId: this.vtAcedemicClassSectionFilterForm.controls["SectorId"].value,
      jobRoleId: this.vtAcedemicClassSectionFilterForm.controls['JobRoleId'].value,
      academicYearId: this.vtAcedemicClassSectionFilterForm.controls["AcademicYearId"].value,
      classId: this.vtAcedemicClassSectionFilterForm.controls["ClassId"].value,
      sectionId: this.vtAcedemicClassSectionFilterForm.controls["SectionId"].value,
      status: statusToSend,
      charBy: null,
      pageIndex: this.SearchBy.PageIndex,
      pageSize: this.SearchBy.PageSize
    };


    this.vtacademicclasssectionService.GetAllByCriteria(schoolSectorJobParams).subscribe(response => {
      this.displayedColumns = ['SchoolName', 'AcademicYear', 'ClassName', 'SectionName', 'VTName', 'VTEmailId', 'SectorName', 'JobRoleName', 'DateOfAllocation', 'CreatedBy', 'UpdatedBy', 'DateOfRemoval',  'IsActive', 'Actions'];

      this.tableDataSource.data = response.Results.$values;
      this.tableDataSource.sort = this.ListSort;
      this.tableDataSource.paginator = this.ListPaginator;
      this.tableDataSource.filteredData = this.tableDataSource.data;
      this.SearchBy.TotalResults = response.TotalResults;
      console.log("response.TotalResults",response.TotalResults);
      console.log("this.SearchBy.TotalResults",  this.SearchBy.TotalResults);
      

      setTimeout(() => {
        this.ListPaginator.pageIndex = this.SearchBy.PageIndex;
        this.ListPaginator.length = this.SearchBy.TotalResults;
        console.log("  this.ListPaginator.length",  this.ListPaginator.length); 

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
    let statusValue = this.vtAcedemicClassSectionFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;
    
    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    let schoolSectorJobParams: any = {
      vtId: this.vtAcedemicClassSectionFilterForm.controls["VTId"].value,
      userTypeId: this.UserModel.UserTypeId,
      schoolId: this.vtAcedemicClassSectionFilterForm.controls["SchoolId"].value,
      sectorId: this.vtAcedemicClassSectionFilterForm.controls["SectorId"].value,
      jobRoleId: this.vtAcedemicClassSectionFilterForm.controls['JobRoleId'].value,
      academicYearId: this.vtAcedemicClassSectionFilterForm.controls["AcademicYearId"].value,
      classId: this.vtAcedemicClassSectionFilterForm.controls["ClassId"].value,
      sectionId: this.vtAcedemicClassSectionFilterForm.controls["SectionId"].value,
      status: statusToSend,
      charBy: null,
      pageIndex: this.SearchBy.PageIndex,
      pageSize: this.SearchBy.PageSize
    };


    this.vtacademicclasssectionService.GetAllByCriteria(schoolSectorJobParams).subscribe(response => {
      response.Results.$values.forEach(
        function (obj) {
          if (obj.hasOwnProperty('IsActive')) {
            obj.IsActive = obj.IsActive ? 'Yes' : 'No';
          }

          delete obj.$id;
          delete obj.TotalRows;
        });


      this.exportExcelFromTable(response.Results.$values, "VTAcademicClassSections");

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
  onLoadVtAcedemicClassSectionsByFilters(): any {
    this.SearchBy.PageIndex = 0;
    this.onLoadAcedemicClassSectionsByFilters();
  }

  
  ngAfterViewInit() {
    this.tableDataSource.paginator = this.ListPaginator;
    console.log("this.ListPaginator",this.ListPaginator);
    
  }
  
  onPageIndexChanged(evt) {
    this.SearchBy.PageIndex = evt.pageIndex;
    this.SearchBy.PageSize = evt.pageSize;

    this.onLoadAcedemicClassSectionsByFilters();
  }

  resetFilters(): void {
    this.vtAcedemicClassSectionFilterForm.reset();

    this.onLoadAcedemicClassSectionsByFilters();
  }
  onDeleteVTAcademicClassSection(vtacademicclasssectionId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.vtacademicclasssectionService.deleteVTAcademicClassSectionById(vtacademicclasssectionId)
            .subscribe((vtacademicclasssectionResp: any) => {

              this.zone.run(() => {
                if (vtacademicclasssectionResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('VTAcademicClassSection deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }

  createvtAcedemicClassSectionFilterForm(): FormGroup {
    return this.formBuilder.group({
      AcademicYearId: new FormControl(),
      VTId: new FormControl(),
      SectorId: new FormControl(),
      JobRoleId: new FormControl(),
      SchoolId: new FormControl(),
      ClassId: new FormControl(),
      SectionId: new FormControl(),
      Status: new FormControl(true)
    });
  }
}
