import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VTDocumentCenterModel } from '../vt-document-centre.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { AccountService } from 'app/main/accounts/account.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { FileUploadModel } from 'app/models/file.upload.model';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { VocationalTrainerService } from 'app/main/vocational-trainers/vocational-trainer.service';
@Component({
  selector: 'vocational-trainer',
  templateUrl: './create-vt-document-centre.component.html',
  styleUrls: ['../../vocational-trainers/create-vocational-trainer/create-vocational-trainer.component.scss'],
  standalone : true ,
  imports: [MatPaginatorModule,MatSelectModule,MatInputModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MaterialFileInputModule,MatFormFieldModule,MatIconModule],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateVtDocumentCentreComponent  extends BaseComponent<VTDocumentCenterModel> implements OnInit {
  vtDocumentCentreForm: FormGroup;
  vtDocumentCentreModel: VTDocumentCenterModel;
  academicYearList: [DropdownModel];
  currentAcademicYear: any;
  academicQualificationList: [DropdownModel];
  professionalQualificationList: [DropdownModel];
  industryTrainingExperienceList: [DropdownModel];
  vtList: [DropdownModel];
  qualificationDocumentFile: FileUploadModel;
  uploadedExperienceDocuments: FileUploadModel;
  isProfessionalDetails: boolean = false;
  uploadedQualificationFile: string;
  isAvailableExperienceFile: boolean =false;
  isAvailableQualificationFile: boolean =false;
  QualificationPDF: string;
  ExperiencePDF: string;
  filteredVTs: DropdownModel[] = [];
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,

    private vocationalTrainerService: VocationalTrainerService,
    private accountService: AccountService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);
    this.vtDocumentCentreModel = new VTDocumentCenterModel();
    this.vtDocumentCentreForm = this.createVtDocumentCentreForm();
    this.qualificationDocumentFile = new FileUploadModel();
    this.uploadedExperienceDocuments = new FileUploadModel();
  }

  ngOnInit(): void {
    this.vocationalTrainerService.getDropdownforVocationalTrainer(this.UserModel).subscribe((results) => {
      if (results[0].Success) {
        this.vtList = results[0].Results.$values;
      }
      if (results[2].Success) {
        this.academicQualificationList = results[2].Results.$values;
      }
      if (results[6].Success) {
        let currentAcademicYear = results[6].Results.$values;
        const selectedAcademicYear = currentAcademicYear.find(ay => ay.IsSelected === true);
    
        if (selectedAcademicYear) {
            this.academicYearList = [selectedAcademicYear]; 
            this.vtDocumentCentreForm.controls['AcademicYear'].setValue(selectedAcademicYear.Name);
        } else {
            console.error("No selected academic year found.");
        }
    }

      this.route.paramMap.subscribe(params => {

        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.vtDocumentCentreModel = new VTDocumentCenterModel();

          } else {
            var vtId: string = params.get('vtDocumentCentreId')
            this.vocationalTrainerService.getVocationalTrainerById(vtId)
              .subscribe((response: any) => {
                this.vtDocumentCentreModel = response.Result;
                this.QualificationPDF = response.Result.QualificationDocUpload;
                this.ExperiencePDF = response.Result.ExperienceDocUpload;

                if(response.Result.QualificationDocUpload){
                  this.isAvailableQualificationFile = true;
                  this.isAvailableExperienceFile = true;
                }

                if (results[7].Success) {
                  this.vtList = results[7].Results.$values;
                }

                if (this.PageRights.ActionType == this.Constants.Actions.Edit) {
                  this.vtDocumentCentreModel.RequestType = this.Constants.PageType.Edit;
                  this.vtDocumentCentreForm.controls['VTId'].disable();
                }
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.vtDocumentCentreModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }

                if (this.vtDocumentCentreModel.DateOfResignation != null) {
                  this.vtDocumentCentreForm.get("DateOfResignation").setValue(this.getDateValue(this.vtDocumentCentreModel.DateOfResignation));
                  let dateOfResignationCtrl = this.vtDocumentCentreForm.get("DateOfResignation");
                  this.onChangeDateEnableDisableCheckBox(this.vtDocumentCentreForm, dateOfResignationCtrl);
                }
                this.onChangeVT(this.vtDocumentCentreModel.VTId);

                this.vtDocumentCentreForm = this.createVtDocumentCentreForm();
                this.vtDocumentCentreForm.controls['QualificationDocumentFile'].setValue(this.QualificationPDF)
                this.vtDocumentCentreForm.controls['ExperienceDocumentFile'].setValue(this.ExperiencePDF)

                const vt = this.vtList.find(s => s.Id === this.vtDocumentCentreModel.VTId);
                this.setValue(vt);
              });
          }
        }
      });
    });
    this.vtDocumentCentreForm.controls['VTId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredVTs = this.vtList.filter(vt => {
          const vtName = vt.Name.toString().toLowerCase();
          return vtName.includes(inputValue);
        });
      } else {
        this.filteredVTs = this.vtList;
      }
    });
  }
  
  displayVTName(vt: DropdownModel): string {
    return vt ? vt.Name : '';
  }
  onFocus(): void {
    this.filteredVTs = this.vtList;
  }

  selectVT(event: MatAutocompleteSelectedEvent): void {
    const selectedVT = event.option.value;
    this.vtDocumentCentreForm.controls['VTId'].setValue(selectedVT)
    this.onChangeVT(selectedVT.Id);
  }
  setValue(event) {
    this.vtDocumentCentreForm.controls['VTId'].setValue(event)
  }

  onChangeVT(accountId) {
    this.accountService.getAccountById(accountId).subscribe((response: any) => {
      var accountModel = response.Result;
      this.vtDocumentCentreForm.controls['Email'].setValue(accountModel.EmailId);
      this.vtDocumentCentreForm.controls['Email'].disable();
      this.vtDocumentCentreForm.controls['Mobile'].setValue(accountModel.Mobile);
      this.vtDocumentCentreForm.controls['Mobile'].disable();
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vtDocumentCentreForm.controls[controlName].setValue(null);
        this.vtDocumentCentreModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vtDocumentCentreForm.controls[controlName].setValue(isoDateString);
    this.vtDocumentCentreModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateVocationalTrainerDetails() {
    if (!this.vtDocumentCentreForm.valid) {
      this.validateAllFormFields(this.vtDocumentCentreForm);
      return;
    }
    const vtDetails = this.vtDocumentCentreForm.get('VTId').value;
    this.vtDocumentCentreForm.controls['VTId'].setValue(vtDetails.Id);
    this.formatAndSetDate(this.vtDocumentCentreForm.get('DateOfJoining').value, 'DateOfJoining');
    this.formatAndSetDate(this.vtDocumentCentreForm.get('DateOfResignation').value, 'DateOfResignation');
    this.formatAndSetDate(this.vtDocumentCentreForm.get('DateOfBirth').value, 'DateOfBirth');

    this.setValueFromFormGroup(this.vtDocumentCentreForm, this.vtDocumentCentreModel);
    console.log((this.qualificationDocumentFile.Base64Data != '' ? this.setUploadedFile(this.qualificationDocumentFile) : null),"(this.qualificationDocumentFile.Base64Data != '' ? this.setUploadedFile(this.qualificationDocumentFile) : null)")
    this.vtDocumentCentreModel.QualificationDocumentFile = (this.qualificationDocumentFile.Base64Data != '' ? this.setUploadedFile(this.qualificationDocumentFile) : null);
    this.vtDocumentCentreModel.ExperienceDocumentFile = (this.uploadedExperienceDocuments.Base64Data != '' ? this.setUploadedFile(this.uploadedExperienceDocuments) : null);
    this.vocationalTrainerService.createOrUpdateVocationalTrainer(this.vtDocumentCentreModel)
      .subscribe((vocationalTrainerResp: any) => {

        if (vocationalTrainerResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VTDocumentCentre.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vocationalTrainerResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VocationalTrainer deletion errors =>', error);
      });
  }

  uploadedQualificationDocumentUploadFile(event) {
    if (event.target.files.length > 0) {
      const filedetails = event.target.files[0];
      var fileExtn = filedetails.name.split('.').pop().toLowerCase();
      if (this.AllowedPDFExtensions.indexOf(fileExtn) == -1) {
        this.dialogService.openShowDialog("Please upload pdf file only.");
        return;
      }
      if (filedetails.size > this.Constants.MaxFileSize.MaxPdfFileSize) {
        this.dialogService.openShowDialog("Uploaded file exceeds the 20 MB limit. Please upload a smaller file.");
        return;
    }
      this.getUploadedFileData(event, this.Constants.DocumentType.VTDocuments).then((response: FileUploadModel) => {
        this.qualificationDocumentFile = response;
      });
    }
  }

  downloadUploadedQualificationFile() {
    let pdfReportUrl = this.Constants.Services.BaseUrl + 'Lighthouse/DownloadFile?fileUrl=Documents' + this.QualificationPDF;
    window.open(pdfReportUrl, '_blank', '');
  }
  downloadUploadedExperienceFile() {
    let pdfReportUrl = this.Constants.Services.BaseUrl + 'Lighthouse/DownloadFile?fileUrl=Documents' + this.ExperiencePDF;
    window.open(pdfReportUrl, '_blank', '');
  }
  uploadedExperienceUploadFile(event) {
    if (event.target.files.length > 0) {
      const filedetails = event.target.files[0];
      var fileExtn = filedetails.name.split('.').pop().toLowerCase();
      if (this.AllowedPDFExtensions.indexOf(fileExtn) == -1) {
        this.dialogService.openShowDialog("Please upload pdf file only.");
        return;
      }
      if (filedetails.size > this.Constants.MaxFileSize.MaxPdfFileSize) {
        this.dialogService.openShowDialog("Uploaded file exceeds the 20 MB limit. Please upload a smaller file.");
        return;
    }
      this.getUploadedFileData(event, this.Constants.DocumentType.VTDocuments).then((response: FileUploadModel) => {
        this.uploadedExperienceDocuments = response;
      });
    }
  }
  createVtDocumentCentreForm(): FormGroup {
    return this.formBuilder.group({
      VTId: new FormControl({ value: this.vtDocumentCentreModel.VTId, disabled: this.PageRights.IsReadOnly || this.PageRights.ActionType == 'edit' }, Validators.required),
      // AcademicYear: new FormControl(this.vtDocumentCentreModel.AcademicYear),
      AcademicYear: new FormControl({ value: this.vtDocumentCentreModel.AcademicYear, disabled: this.PageRights.IsReadOnly || this.PageRights.ActionType == 'New' || this.PageRights.ActionType == 'edit' }),
      FullName: new FormControl({ value: this.vtDocumentCentreModel.FullName, disabled: this.PageRights.IsReadOnly || this.PageRights.ActionType == 'edit'  }, [Validators.maxLength(150)]),
      Mobile: new FormControl({ value: this.vtDocumentCentreModel.Mobile, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      Mobile1: new FormControl({ value: this.vtDocumentCentreModel.Mobile1, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      Email: new FormControl({ value: this.vtDocumentCentreModel.Email, disabled: (this.PageRights.IsReadOnly || this.PageRights.ActionType == this.Constants.Actions.Edit) }, [Validators.maxLength(100), Validators.pattern(this.Constants.Regex.Email)]),
      Gender: new FormControl({ value: this.vtDocumentCentreModel.Gender, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(10)]),
      DateOfBirth: new FormControl({ value: new Date(this.vtDocumentCentreModel.DateOfBirth), disabled: this.PageRights.IsReadOnly }, Validators.required),
      SocialCategory: new FormControl({ value: this.vtDocumentCentreModel.SocialCategory, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(100)),
      AcademicQualification: new FormControl({ value: this.vtDocumentCentreModel.AcademicQualification, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(150)),
      ProfessionalQualification: new FormControl({ value: this.vtDocumentCentreModel.ProfessionalQualification, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(150)),
      ProfessionalQualificationDetails: new FormControl({ value: this.vtDocumentCentreModel.ProfessionalQualificationDetails, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(350)),
      IndustryExperienceMonths: new FormControl({ value: this.vtDocumentCentreModel.IndustryExperienceMonths, disabled: this.PageRights.IsReadOnly }, Validators.pattern(this.Constants.Regex.Number)),
      TrainingExperienceMonths: new FormControl({ value: this.vtDocumentCentreModel.TrainingExperienceMonths, disabled: this.PageRights.IsReadOnly }, Validators.pattern(this.Constants.Regex.Number)),
      AadhaarNumber: new FormControl({ value: this.maskingStudentAadhaarNo(this.vtDocumentCentreModel.AadhaarNumber), disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(12), Validators.minLength(12), Validators.pattern(this.Constants.Regex.Number)]),
      DateOfJoining: new FormControl({ value: new Date(this.vtDocumentCentreModel.DateOfJoining), disabled: this.PageRights.IsReadOnly }, Validators.required),
      DateOfResignation: new FormControl({ value: this.getDateValue(this.vtDocumentCentreModel.DateOfResignation), disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.vtDocumentCentreModel.IsActive, disabled: true }),
      QualificationDocumentFile: new FormControl({ value: this.vtDocumentCentreModel.QualificationDocumentFile, disabled: this.PageRights.IsReadOnly }),
      ExperienceDocumentFile: new FormControl({ value: this.vtDocumentCentreModel.ExperienceDocumentFile, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
