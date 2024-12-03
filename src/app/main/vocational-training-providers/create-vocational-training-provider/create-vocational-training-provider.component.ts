import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VocationalTrainingProviderService } from '../vocational-training-provider.service';
import { VocationalTrainingProviderModel } from '../vocational-training-provider.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { FileUploadModel } from 'app/models/file.upload.model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'vocational-training-provider',
  templateUrl: './create-vocational-training-provider.component.html',
  styleUrls: ['./create-vocational-training-provider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone : true ,
  imports: [MatPaginatorModule,MatSelectModule,MatInputModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,FuseSharedModule],
  animations: fuseAnimations
})
export class CreateVocationalTrainingProviderComponent extends BaseComponent<VocationalTrainingProviderModel> implements OnInit {
  vocationalTrainingProviderForm: FormGroup;
  vocationalTrainingProviderModel: VocationalTrainingProviderModel;
  academicYearList: [DropdownModel];
  mouDocUploadFile: FileUploadModel;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vocationalTrainingProviderService: VocationalTrainingProviderService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vocationalTrainingProvider Model
    this.mouDocUploadFile = new FileUploadModel();
    this.vocationalTrainingProviderModel = new VocationalTrainingProviderModel();
    //this.vocationalTrainingProviderModel = new VocationalTrainingProviderModel().getVocationalTrainingProviderTestData();

    this.vocationalTrainingProviderForm = this.createVocationalTrainingProviderForm();
  }

  ngOnInit(): void {
    this.commonService
      .GetMasterDataByType({ DataType: 'AcademicYears', SelectTitle: 'Academic Year' })
      .subscribe((response: any) => {
console.log(response);
        if (response.Success) {
          this.academicYearList = response.Results.$values;
        }

        this.route.paramMap.subscribe(params => {
          if (params.keys.length > 0) {
            this.PageRights.ActionType = params.get('actionType');

            if (this.PageRights.ActionType == this.Constants.Actions.New) {
              this.vocationalTrainingProviderModel = new VocationalTrainingProviderModel();

            } else {
              var vtpId: string = params.get('vtpId')

              this.vocationalTrainingProviderService.getVocationalTrainingProviderById(vtpId)
                .subscribe((response: any) => {
                  this.vocationalTrainingProviderModel = response.Result;

                  if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                    this.vocationalTrainingProviderModel.RequestType = this.Constants.PageType.Edit;
                  else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                    this.vocationalTrainingProviderModel.RequestType = this.Constants.PageType.View;
                    this.PageRights.IsReadOnly = true;
                  }

                  this.vocationalTrainingProviderForm = this.createVocationalTrainingProviderForm();
                });
            }
          }
        });
      });

    
  }

  uploadedMOUDocumentUploadFile(event) {
    if (event.target.files.length > 0) {
      var fileExtn = event.target.files[0].name.split('.').pop().toLowerCase();

      if (this.AllowedPDFExtensions.indexOf(fileExtn) == -1) {
        this.vocationalTrainingProviderForm.get('MOUDocUpload').setValue(null);
        this.dialogService.openShowDialog("Please upload pdf file only.");
        return;
      }

      this.getUploadedFileData(event, this.Constants.DocumentType.VTP).then((response: FileUploadModel) => {
        this.mouDocUploadFile = response;
      });
    }
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vocationalTrainingProviderForm.controls[controlName].setValue(null);
        this.vocationalTrainingProviderModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vocationalTrainingProviderForm.controls[controlName].setValue(isoDateString);
    this.vocationalTrainingProviderModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateVocationalTrainingProviderDetails() {
    if (!this.vocationalTrainingProviderForm.valid) {
      this.validateAllFormFields(this.vocationalTrainingProviderForm);
      return;
    }
    this.formatAndSetDate(this.vocationalTrainingProviderForm.get('ContractApprovalDate').value, 'ContractApprovalDate');
    this.formatAndSetDate(this.vocationalTrainingProviderForm.get('ContractEndDate').value, 'ContractEndDate');
    this.formatAndSetDate(this.vocationalTrainingProviderForm.get('DateOfRemoval').value, 'DateOfRemoval');
    this.setValueFromFormGroup(this.vocationalTrainingProviderForm, this.vocationalTrainingProviderModel);
    this.vocationalTrainingProviderModel.MOUDocumentFile = (this.mouDocUploadFile.Base64Data != '' ? this.setUploadedFile(this.mouDocUploadFile) : null);
    this.vocationalTrainingProviderModel.AcademicYearId = this.UserModel.AcademicYearId;

    this.vocationalTrainingProviderService.createOrUpdateVocationalTrainingProvider(this.vocationalTrainingProviderModel)
      .subscribe((vocationalTrainingProviderResp: any) => {

        if (vocationalTrainingProviderResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VocationalTrainingProvider.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vocationalTrainingProviderResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VocationalTrainingProvider deletion errors =>', error);
      });
  }

  //Create vocationalTrainingProvider form and returns {FormGroup}
  createVocationalTrainingProviderForm(): FormGroup {
    return this.formBuilder.group({
      VTPId: new FormControl(this.vocationalTrainingProviderModel.VTPId),
      VTPShortName: new FormControl({ value: this.vocationalTrainingProviderModel.VTPShortName, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(50), Validators.pattern(this.Constants.Regex.CharsWithTitleCase)]),
      VTPName: new FormControl({ value: this.vocationalTrainingProviderModel.VTPName, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(150), Validators.pattern(this.Constants.Regex.CharWithTitleCaseSpaceAndSpecialChars)]),
      ApprovalYear: new FormControl({ value: this.vocationalTrainingProviderModel.ApprovalYear, disabled: this.PageRights.IsReadOnly }, Validators.required),
      CertificationNo: new FormControl({ value: this.vocationalTrainingProviderModel.CertificationNo, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(30)]),
      CertificationAgency: new FormControl({ value: this.vocationalTrainingProviderModel.CertificationAgency, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(150), Validators.pattern(this.Constants.Regex.CharWithTitleCaseSpaceAndSpecialChars)]),
      VTPMobileNo: new FormControl({ value: this.vocationalTrainingProviderModel.VTPMobileNo, disabled: this.PageRights.IsReadOnly }, [Validators.required]),
      VTPEmailId: new FormControl({ value: this.vocationalTrainingProviderModel.VTPEmailId, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(100), Validators.pattern(this.Constants.Regex.Email)]),
      VTPAddress: new FormControl({ value: this.vocationalTrainingProviderModel.VTPAddress, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(350)]),
      PrimaryContactPerson: new FormControl({ value: this.vocationalTrainingProviderModel.PrimaryContactPerson, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(100), Validators.pattern(this.Constants.Regex.CharsWithTitleCase)]),
      PrimaryMobileNumber: new FormControl({ value: this.vocationalTrainingProviderModel.PrimaryMobileNumber, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      PrimaryContactEmail: new FormControl({ value: this.vocationalTrainingProviderModel.PrimaryContactEmail, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(100), Validators.pattern(this.Constants.Regex.Email)]),
      VTPStateCoordinator: new FormControl({ value: this.vocationalTrainingProviderModel.VTPStateCoordinator, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(200), Validators.pattern(this.Constants.Regex.CharsWithTitleCase)]),
      VTPStateCoordinatorMobile: new FormControl({ value: this.vocationalTrainingProviderModel.VTPStateCoordinatorMobile, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(200), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      VTPStateCoordinatorEmail: new FormControl({ value: this.vocationalTrainingProviderModel.VTPStateCoordinatorEmail, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(200), Validators.pattern(this.Constants.Regex.Email)]),
      ContractApprovalDate: new FormControl({ value: this.getDateValue(this.vocationalTrainingProviderModel.ContractApprovalDate), disabled: this.PageRights.IsReadOnly }),
      ContractEndDate: new FormControl({ value: this.getDateValue(this.vocationalTrainingProviderModel.ContractEndDate), disabled: this.PageRights.IsReadOnly }),
      MOUDocumentFile: new FormControl({ value: this.vocationalTrainingProviderModel.MOUDocumentFile, disabled: this.PageRights.IsReadOnly }),
      DateOfRemoval: new FormControl({ value: this.getDateValue(this.vocationalTrainingProviderModel.DateOfRemoval), disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.vocationalTrainingProviderModel.IsActive, disabled: true }),
    });
  }
}
