import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeadMasterModel } from './head-master.model';
import { HeadMasterService } from './head-master.service';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as guarati } from './i18n/gj';
import { DropdownModel } from 'app/models/dropdown.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,TranslateModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  selector: 'data-list-view',
  templateUrl: './head-master.component.html',
  styleUrls: ['./head-master.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class HeadMasterComponent extends BaseListComponent<HeadMasterModel> implements OnInit {
  hmSearchForm: FormGroup;
  hmFilterForm: FormGroup;

  vtpList: DropdownModel[];
  filteredVTPItems: any;
  vcList: DropdownModel[];
  filteredVCItems: any;
  schoolList: DropdownModel[];
  filteredSchoolItems: any;

  sectorList: DropdownModel[];
  jobRoleList: DropdownModel[];
  socialCategoryList: DropdownModel[];
  vtpId: string;
  vcId: string;
  currentUser: string;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private translationLoaderService: FuseTranslationLoaderService,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    private dialogService: DialogService,
    private headMasterService: HeadMasterService) {

    super(commonService, router, routeParams, snackBar, zone);
    this.hmSearchForm = this.formBuilder.group({ SearchText: new FormControl() });
    this.hmFilterForm = this.createHeadMasterFilterForm();

    this.translationLoaderService.loadTranslations(english, guarati);
  }

  ngOnInit(): void {
    this.SearchBy.PageIndex = 0; // delete after script changed
    this.SearchBy.PageSize = 10; // delete after script changed

    this.currentUser = this.UserModel.UserId;

    this.headMasterService.getInitHeadMastersData(this.UserModel).subscribe((results) => {
      //Load initial HeadMasters data
      this.onLoadHeadMastersByCriteria();

      this.hmSearchForm.get('SearchText').valueChanges.pipe(
        // if character length greater then 2
        filter(res => {
          this.SearchBy.PageIndex = 0;

          if (res.length == 0) {
            this.SearchBy.Name = '';
            this.onLoadHeadMastersByCriteria();
            return false;
          }

          return res.length > 2
        }),

        // Time in milliseconds between key events
        debounceTime(650),

        // If previous query is diffent from current   
        distinctUntilChanged()

        // subscription for response
      ).subscribe((searchText: string) => {
        this.SearchBy.Name = searchText;
        this.onLoadHeadMastersByCriteria();
      });
    });
  }

  ngAfterViewInit() {
    this.tableDataSource.paginator = this.ListPaginator;
  }

  onPageIndexChanged(evt) {
    this.SearchBy.PageIndex = evt.pageIndex;
    this.SearchBy.PageSize = evt.pageSize;

    this.onLoadHeadMastersByCriteria();
  }

  onLoadHeadMastersByCriteria(): void {
    this.IsLoading = true;
    let statusValue = this.hmFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;
    
    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    let hmParams = {
      UserTypeId: this.UserModel.UserTypeId,
      Status: statusToSend,
      Name: this.hmSearchForm.controls["SearchText"].value,
      CharBy: null,
      PageIndex: this.SearchBy.PageIndex,
      PageSize: this.SearchBy.PageSize
    };
    this.headMasterService.GetAllByCriteria(hmParams).subscribe(response => {
      this.displayedColumns = [
        'SchoolName',
        'FullName',
        'Mobile',
        'Email',
        'Gender',
        'YearsInSchool',
        'DateOfJoining',
        'CreatedBy',
        'UpdatedBy',
        'DateOfResignationFromSchool',
        'IsActive',
        'CreatedByUserId',
        'Actions'];

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
    },
      error => {
        console.log(error);
      });
  }

  onLoadHeadMastersByFilters(): any {
    this.SearchBy.PageIndex = 0;
    this.onLoadHeadMastersByCriteria();
  }

  resetFilters(): void {
    this.SearchBy.PageIndex = 0;

    this.hmSearchForm.reset();
    this.hmFilterForm.reset();
    this.onLoadHeadMastersByCriteria();
  }
  onDeleteHeadMaster(hmId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.headMasterService.deleteHeadMasterById(hmId)
            .subscribe((headMasterResp: any) => {

              this.zone.run(() => {
                if (headMasterResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('HeadMaster deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }

  exportExcel(): void {
    this.IsLoading = true;
    let statusValue = this.hmFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;
    
    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }

    let hmParams = {
      UserTypeId: this.UserModel.UserTypeId,
      VTPId: this.hmFilterForm.controls["VTPId"].value,
      VCId: this.hmFilterForm.controls["VCId"].value,
      VTId: (this.UserModel.RoleCode == 'VT' ? this.UserModel.UserTypeId : null),
      SchoolId: this.hmFilterForm.controls["SchoolId"].value,
      SectorId: this.hmFilterForm.controls["SectorId"].value,
      JobRoleId: this.hmFilterForm.controls["JobRoleId"].value,
      Status: statusToSend,
      Name: this.hmSearchForm.controls["SearchText"].value,
      CharBy: null,
      PageIndex: 0,
      PageSize: 100000
    };

    this.headMasterService.GetAllByCriteria(hmParams).subscribe(response => {
      response.Results.$values.forEach(
        function (obj) {
          if (obj.hasOwnProperty('IsActive')) {
            obj.IsActive = obj.IsActive ? 'Yes' : 'No';
          }

          delete obj.$id;
          delete obj.HMId;
          delete obj.IsResigned;
          delete obj.TotalRows;
        });

      this.exportExcelFromTable(response.Results.$values, "HeadMasters");

      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }
  //Create HeadMaster Filter form and returns {FormGroup}
  createHeadMasterFilterForm(): FormGroup {
    return this.formBuilder.group({
      VTPId: new FormControl(),
      VCId: new FormControl(),
      SchoolId: new FormControl(),
      SectorId: new FormControl(),
      JobRoleId: new FormControl(),
      Status: new FormControl(true)
    });
  }
}
