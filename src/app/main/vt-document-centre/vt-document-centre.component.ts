import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VTDocumentCenterModel } from './vt-document-centre.model';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
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
import { FuseSharedModule } from '@fuse/shared.module';
import { VocationalTrainerService } from '../vocational-trainers/vocational-trainer.service';

@Component({
  selector: 'data-list-view',
  templateUrl: './vt-document-centre.component.html',
  styleUrls: ['./vt-document-centre.component.scss'],
  animations: fuseAnimations,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,TranslateModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None
})

export class VTDocumentCentreComponent extends BaseListComponent<VTDocumentCenterModel> implements OnInit {
  vtSearchForm: FormGroup;
  vtFilterForm: FormGroup;

  academicYearList: DropdownModel[];
  vtpList: DropdownModel[];
  filteredVTPItems: any;
  vcList: DropdownModel[];
  filteredVCItems: any;

  socialCategoryList: [DropdownModel];
  vtpId: string;
  QualificationPDF: string;
  ExperiencePDF: string;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private translationLoaderService: FuseTranslationLoaderService,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    private dialogService: DialogService,
    private vocationalTrainerService: VocationalTrainerService) {

    super(commonService, router, routeParams, snackBar, zone);
    this.vtSearchForm = this.formBuilder.group({ SearchText: new FormControl() });
    this.vtFilterForm = this.createVocationalTrainerFilterForm();
    this.translationLoaderService.loadTranslations(english, guarati);
  }

  ngOnInit(): void {
    this.SearchBy.PageIndex = 0; // delete after script changed
    this.SearchBy.PageSize = 10; // delete after script changed

    this.vocationalTrainerService.getInitVocationalTrainersData(this.UserModel).subscribe(results => {
      if (results[0].Success) {
        this.academicYearList = results[0].Results.$values;
      }
      let currentYearItem = this.academicYearList.find(ay => ay.IsSelected == true)
      if (currentYearItem != null) {
        this.AcademicYearId = currentYearItem.Id;
        this.vtFilterForm.get('AcademicYearId').setValue(this.AcademicYearId);
      }

      if (results[1].Success) {
        this.socialCategoryList = results[1].Results.$values;
      }
      //Load initial VocationalTrainers data
      this.onLoadVocationalTrainersByCriteria();

      this.vtSearchForm.get('SearchText').valueChanges.pipe(
        // if character length greater then 2
        filter(res => {
          this.SearchBy.PageIndex = 0;

          if (res.length == 0) {
            this.SearchBy.Name = '';
            this.onLoadVocationalTrainersByCriteria();
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
        this.onLoadVocationalTrainersByCriteria();
      });
    });
  }

  ngAfterViewInit() {
    this.tableDataSource.paginator = this.ListPaginator;
  }

  onPageIndexChanged(evt) {
    this.SearchBy.PageIndex = evt.pageIndex;
    this.SearchBy.PageSize = evt.pageSize;

    this.onLoadVocationalTrainersByCriteria();
  }

  onLoadVocationalTrainersByCriteria(): void {
    this.IsLoading = true; 
    let statusValue = this.vtFilterForm.controls["Status"].value;
    let statusToSend: boolean | null = null;

    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    this.vtFilterForm.get('AcademicYearId').disable();
      let vtParams: any = {
      UserTypeId: this.UserModel.UserTypeId,
      AcademicYearId: this.vtFilterForm.controls["AcademicYearId"].value,
      SocialCategoryId: this.vtFilterForm.controls["SocialCategoryId"].value,
      Status: statusToSend,
      Name: this.vtSearchForm.controls["SearchText"].value,
      CharBy: null,
      PageIndex: this.SearchBy.PageIndex,
      PageSize: this.SearchBy.PageSize
    };
    this.vocationalTrainerService.GetAllVTDocumentByCriteria(vtParams).subscribe(response => {
      this.displayedColumns = [
        'AcademicYear',
        'VTName',
        'Mobile',
        'Email',
        'VCName',
        'VCEmail',
        'VTPName',
        'SchoolName',
        'UDISE',
        'DocumentUploadBy',
        'DateOfDocumentUpload',
        'Gender',
        'DateOfBirth',
        'SocialCategory',
        'AcademicQualification',
        'ProfessionalQualification',
        'ProfessionalQualificationDetails',
        'IndustryExperienceMonths',
        'StateName',
        'DivisionName',
        'DistrictName',
        'DateOfJoining',
        'ExperienceDocUpload',
        'QualificationDocUpload',
        'DateOfResignation',
        'CreatedBy',
        'UpdatedBy',
        'IsActive',
        'Actions'];
        if(this.UserModel.RoleCode=='HM'){
          this.displayedColumns ['7'] = 'SectorName';
          this.displayedColumns ['8'] = 'JobRoleName';
        }

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

  onLoadVocationalTrainersByFilters(): any {
    this.SearchBy.PageIndex = 0;
    this.onLoadVocationalTrainersByCriteria();
  }

  onChangeAY(AYId): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.vtpList = [];
      this.filteredVTPItems = [];
      let vtpRequest = this.commonService.GetVTPByAYId(this.UserModel.RoleCode, this.UserModel.UserTypeId, AYId)

      vtpRequest.subscribe((response: any) => {
        if (response.Success) {
          this.vtpList = response.Results.$values;
          this.filteredVTPItems = this.vtpList.slice();
        }

        resolve(true);
      }, error => {
        console.log(error);
        resolve(false);
      });
    });
    return promise;
  }

  onChangeVTP(vtpId): Promise<any> {
    let promise = new Promise((resolve, reject) => {

      let vcRequest = this.commonService.GetVCByAYAndVTPId(this.UserModel.RoleCode, this.UserModel.UserTypeId, this.AcademicYearId, vtpId);

      vcRequest.subscribe((response: any) => {
        if (response.Success) {
          if (this.UserModel.RoleCode == 'VC') {
            this.vtFilterForm.get('VCId').setValue(response.Results.$values[0].Id);
            this.vtFilterForm.controls['VCId'].disable();
          }
          this.vcList = response.Results.$values;
          this.filteredVCItems = this.vcList.slice();
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

  resetFilters(): void {
    this.SearchBy.PageIndex = 0;
    this.vtSearchForm.reset();
    this.vtFilterForm.reset();
    this.vtFilterForm.get('AcademicYearId').setValue(this.AcademicYearId);

    this.vcList = [];
    this.filteredVCItems = [];

    this.onLoadVocationalTrainersByCriteria();
  }

  downloadUploadedQualificationFile(vocationalTrainer) {
    let encodedFilePath = encodeURIComponent(vocationalTrainer.QualificationDocUpload);
    let pdfReportUrl = `${this.Constants.Services.BaseUrl}Lighthouse/DownloadFile?fileUrl=Documents${encodedFilePath}`;
    window.open(pdfReportUrl, '_blank', '');
}

downloadUploadedExperienceFile(vocationalTrainer) {
  let encodedFilePath = encodeURIComponent(vocationalTrainer.ExperienceDocUpload);
  let pdfReportUrl = `${this.Constants.Services.BaseUrl}Lighthouse/DownloadFile?fileUrl=Documents${encodedFilePath}`;
    window.open(pdfReportUrl, '_blank', '');
}

  exportExcel(): void {
    this.IsLoading = true;
    let statusValue = this.vtFilterForm.controls["Status"].value;
    let statusToSend: boolean | "" ;

    if (statusValue === "true") {
      statusToSend = true;
    } else if (statusValue === "false") {
      statusToSend = false;
    }
    let vtParams = {
      UserTypeId: this.UserModel.UserTypeId,
      AcademicYearId: this.vtFilterForm.controls["AcademicYearId"].value,
      VTPId: this.vtFilterForm.controls["VTPId"].value,
      VCId: this.vtFilterForm.controls["VCId"].value,
      SocialCategoryId: this.vtFilterForm.controls["SocialCategoryId"].value,
      Status: statusToSend,
      Name: this.vtSearchForm.controls["SearchText"].value,
      charBy: null,
      pageIndex: 0,
      pageSize: 100000
    };

    this.vocationalTrainerService.GetAllVTDocumentByCriteria(vtParams).subscribe(response => {
      response.Results.$values.forEach(
        function (obj) {
          if (obj.hasOwnProperty('IsActive')) {
            obj.IsActive = obj.IsActive ? 'Yes' : 'No';
          }
          if (obj.hasOwnProperty('IsResigned')) {
            obj.IsResigned = obj.IsResigned ? 'Yes' : 'No';
          }

          delete obj.$id;
          delete obj.VTId;
          delete obj.TotalRows;
        });

      this.exportExcelFromTable(response.Results.$values, "VocationalTrainers");

      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }

  onDeleteVocationalTrainer(vtId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.vocationalTrainerService.deleteVocationalTrainerById(vtId)
            .subscribe((vocationalTrainerResp: any) => {

              this.zone.run(() => {
                if (vocationalTrainerResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('VocationalTrainer deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }

  //Create VocationalTrainer form and returns {FormGroup}
  createVocationalTrainerFilterForm(): FormGroup {
    return this.formBuilder.group({
      AcademicYearId: new FormControl(),
      VTPId: new FormControl(),
      VCId: new FormControl(),
      SocialCategoryId: new FormControl(),
      Status: new FormControl(true)
    });
  }
}