import { Component, OnInit, NgZone, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SchoolModel } from './school.model';
import { SchoolService } from './school.service';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english } from './i18n/en';
import { locale as guarati } from './i18n/gj';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { DropdownModel } from 'app/models/dropdown.model';
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
  selector: 'data-list-view',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.scss'],
  animations: fuseAnimations,  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,TranslateModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None
})

export class SchoolComponent extends BaseListComponent<SchoolModel> implements OnInit {
  schoolSearchForm: FormGroup;
  schoolFilterForm: FormGroup;

  stateList: DropdownModel[];
  divisionList: DropdownModel[];
  districtList: DropdownModel[];
  filteredDistrictItems: any;
  schoolTypeList: DropdownModel[]
  schoolCategoryList: DropdownModel[];
  schoolManagementList: DropdownModel[];

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private translationLoaderService: FuseTranslationLoaderService,
    public zone: NgZone,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private schoolService: SchoolService) {

    super(commonService, router, routeParams, snackBar, zone);
    this.schoolSearchForm = this.formBuilder.group({ SearchText: new FormControl() });
    this.schoolFilterForm = this.createSchoolFilterForm();

    this.translationLoaderService.loadTranslations(english, guarati);
  }

  ngOnInit(): void {
    this.schoolService.getInitSchoolsData().subscribe(results => {
      if (results[0].Success) {
        this.stateList = results[0].Results.$values;
      }

      if (results[1].Success) {
        this.divisionList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.schoolCategoryList = results[2].Results.$values;
      }

      if (results[3].Success) {
        this.schoolTypeList = results[3].Results.$values;
      }

      if (results[4].Success) {
        this.schoolManagementList = results[4].Results.$values;
      }

      this.SearchBy.PageIndex = 0; // delete after script changed
      this.SearchBy.PageSize = 10; // delete after script changed

      //Load initial schools data
      this.onLoadSchoolsByCriteria();

      this.schoolSearchForm.get('SearchText').valueChanges.pipe(
        // if character length greater then 2
        filter(res => {
          this.SearchBy.PageIndex = 0;

          if (res.length == 0) {
            this.SearchBy.Name = '';
            this.onLoadSchoolsByCriteria();
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
        this.onLoadSchoolsByCriteria();
      });
    });
  }

  ngAfterViewInit() {
    this.tableDataSource.paginator = this.ListPaginator;
  }

  onPageIndexChanged(evt) {
    this.SearchBy.PageIndex = evt.pageIndex;
    this.SearchBy.PageSize = evt.pageSize;

    this.onLoadSchoolsByCriteria();
  }

  onLoadSchoolsByCriteria(): any {
    this.IsLoading = true;
    let statusValue = this.schoolFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;
    
    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    
    let schoolParams = {
      userTypeId: this.UserModel.UserTypeId,
      divisionId: this.schoolFilterForm.controls["DivisionId"].value,
      districtId: this.schoolFilterForm.controls["DistrictId"].value,
      schoolCategoryId: this.schoolFilterForm.controls["SchoolCategoryId"].value,
      schoolManagementId: this.schoolFilterForm.controls["SchoolManagementId"].value,
      status: statusToSend,
      name: this.schoolSearchForm.controls["SearchText"].value,
      charBy: null,
      pageIndex: this.SearchBy.PageIndex,
      pageSize: this.SearchBy.PageSize
    };

    this.schoolService.GetAllByCriteria(schoolParams).subscribe(response => {
      this.displayedColumns = ['SchoolName', /*'SchoolUniqueId',*/ 'Udise', 'SchoolManagement', 'CategoryName', 'DivisionName', 'DistrictName', 'BlockName',/*'Latitude', 'Longitude', 'Range',*/ 'CreatedBy', 'UpdatedBy', 'IsImplemented', 'IsActive', 'Actions']
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

  onLoadSchoolsByFilters(): any {
    this.SearchBy.PageIndex = 0;
    this.onLoadSchoolsByCriteria();
  }

  resetFilters(): void {
    this.SearchBy.PageIndex = 0;
    this.schoolSearchForm.reset();
    this.schoolFilterForm.reset();

    this.districtList = [];
    this.filteredDistrictItems = [];

    this.onLoadSchoolsByCriteria();
  }

  onChangeDivision(divisionId: any) {
    this.commonService.GetMasterDataByType({ DataType: 'Districts', UserId: this.UserModel.StateId, ParentId: divisionId, SelectTitle: 'District' }).subscribe((response: any) => {
      this.districtList = response.Results.$values;
      this.filteredDistrictItems = this.districtList.slice();
    });
  }

  onDeleteSchool(schoolId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.schoolService.deleteSchoolById(schoolId)
            .subscribe((schoolResp: any) => {

              this.zone.run(() => {
                if (schoolResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('School deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }

  exportExcel(): void {
    this.IsLoading = true;
    let statusValue = this.schoolFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;
    
    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    let schoolParams = {
      UserTypeId: this.UserModel.UserTypeId,
      divisionId: this.schoolFilterForm.controls["DivisionId"].value,
      districtId: this.schoolFilterForm.controls["DistrictId"].value,
      schoolCategoryId: this.schoolFilterForm.controls["SchoolCategoryId"].value,
      schoolManagementId: this.schoolFilterForm.controls["SchoolManagementId"].value,
      // status: this.schoolFilterForm.controls["Status"].value,
      status: statusToSend,
      name: this.schoolSearchForm.controls["SearchText"].value,
      charBy: null,
      pageIndex: 0,
      pageSize: 100000
    };

    this.schoolService.GetAllByCriteria(schoolParams).subscribe(response => {
      response.Results.$values.forEach(
        function (obj) {
          if (obj.hasOwnProperty('IsActive')) {
            obj.IsActive = obj.IsActive ? 'Yes' : 'No';
          }
          if (obj.hasOwnProperty('IsImplemented')) {
            obj.IsImplemented = obj.IsImplemented ? 'Yes' : 'No';
          }
          delete obj.$id;
          delete obj.SchoolId;
          delete obj.TotalRows;
        });

      this.exportExcelFromTable(response.Results.$values, "Schools");

      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }

  //Create SchoolFilter form and returns {FormGroup}
  createSchoolFilterForm(): FormGroup {
    return this.formBuilder.group({
      DivisionId: new FormControl(),
      DistrictId: new FormControl(),
      SchoolCategoryId: new FormControl(),
      SchoolManagementId: new FormControl(),
      Status: new FormControl(),
    });
  }
}
