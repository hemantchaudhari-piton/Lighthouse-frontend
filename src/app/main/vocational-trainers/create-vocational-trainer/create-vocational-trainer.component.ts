import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VocationalTrainerService } from '../vocational-trainer.service';
import { VocationalTrainerModel } from '../vocational-trainer.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { AccountService } from 'app/main/accounts/account.service';
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
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
@Component({
  selector: 'vocational-trainer',
  templateUrl: './create-vocational-trainer.component.html',
  styleUrls: ['./create-vocational-trainer.component.scss'],
  standalone : true ,
  imports: [MatPaginatorModule,MatSelectModule,MatInputModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateVocationalTrainerComponent extends BaseComponent<VocationalTrainerModel> implements OnInit {
  vocationalTrainerForm: FormGroup;
  vocationalTrainerModel: VocationalTrainerModel;
  academicYearList: [DropdownModel];
  currentAcademicYear: any;
  socialCategoryList: [DropdownModel];
  academicQualificationList: [DropdownModel];
  professionalQualificationList: [DropdownModel];
  industryTrainingExperienceList: [DropdownModel];
  genderList: [DropdownModel];
  vtList: [DropdownModel];
  isProfessionalDetails: boolean = false;
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

    // Set the default vocationalTrainer Model
    this.vocationalTrainerModel = new VocationalTrainerModel();
    this.vocationalTrainerForm = this.createVocationalTrainerForm();
  }

  ngOnInit(): void {
    this.vocationalTrainerService.getDropdownforVocationalTrainer(this.UserModel).subscribe((results) => {
      if (results[0].Success) {
        this.vtList = results[0].Results.$values;
      }
      if (results[1].Success) {
        this.socialCategoryList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.academicQualificationList = results[2].Results.$values;
      }

      if (results[3].Success) {
        this.professionalQualificationList = results[3].Results.$values;
      }

      if (results[4].Success) {
        this.industryTrainingExperienceList = results[4].Results.$values;
      }

      if (results[5].Success) {
        this.genderList = results[5].Results.$values;
      }

      if (results[6].Success) {
        let currentAcademicYear = results[6].Results.$values;
        const selectedAcademicYear = currentAcademicYear.find(ay => ay.IsSelected === true);
    
        if (selectedAcademicYear) {
            this.academicYearList = [selectedAcademicYear]; 
            // Assuming setValue expects a string
            this.vocationalTrainerForm.controls['AcademicYear'].setValue(selectedAcademicYear.Name);
        } else {
            console.error("No selected academic year found.");
        }
    }

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.vocationalTrainerModel = new VocationalTrainerModel();

          } else {
            var vtId: string = params.get('vtId')

            this.vocationalTrainerService.getVocationalTrainerById(vtId)
              .subscribe((response: any) => {
                this.vocationalTrainerModel = response.Result;

                if (results[7].Success) {
                  this.vtList = results[7].Results.$values;
                }

                if (this.PageRights.ActionType == this.Constants.Actions.Edit) {
                  this.vocationalTrainerModel.RequestType = this.Constants.PageType.Edit;
                  this.vocationalTrainerForm.controls['VTId'].disable();
                }
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.vocationalTrainerModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }

                if (this.vocationalTrainerModel.DateOfResignation != null) {
                  this.vocationalTrainerForm.get("DateOfResignation").setValue(this.getDateValue(this.vocationalTrainerModel.DateOfResignation));
                  let dateOfResignationCtrl = this.vocationalTrainerForm.get("DateOfResignation");
                  this.onChangeDateEnableDisableCheckBox(this.vocationalTrainerForm, dateOfResignationCtrl);
                }
                this.onChangeVT(this.vocationalTrainerModel.VTId);

                this.vocationalTrainerForm = this.createVocationalTrainerForm();
                const vt = this.vtList.find(s => s.Id === this.vocationalTrainerModel.VTId);
                this.setValue(vt);
              });
          }
          const hostnameParts = window.location.hostname.split('.');
          if (hostnameParts[0] === 'gujarat') {
            this.isProfessionalDetails = true;
            this.vocationalTrainerForm.get('ProfessionalQualificationDetails').setValidators([
              Validators.required,
            ]);
          }
          else {
            this.isProfessionalDetails = false;
          }
        }
      });
    });
    this.vocationalTrainerForm.controls['VTId'].valueChanges.subscribe(value => {
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
    this.vocationalTrainerForm.controls['VTId'].setValue(selectedVT)
    this.onChangeVT(selectedVT.Id);
  }
  setValue(event) {
    this.vocationalTrainerForm.controls['VTId'].setValue(event)
  }

  onChangeVT(accountId) {
    this.accountService.getAccountById(accountId).subscribe((response: any) => {
      var accountModel = response.Result;
      this.vocationalTrainerForm.controls['Email'].setValue(accountModel.EmailId);
      this.vocationalTrainerForm.controls['Email'].disable();
      this.vocationalTrainerForm.controls['Mobile'].setValue(accountModel.Mobile);
      this.vocationalTrainerForm.controls['Mobile'].disable();
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vocationalTrainerForm.controls[controlName].setValue(null);
        this.vocationalTrainerModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vocationalTrainerForm.controls[controlName].setValue(isoDateString);
    this.vocationalTrainerModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateVocationalTrainerDetails() {
    if (!this.vocationalTrainerForm.valid) {
      this.validateAllFormFields(this.vocationalTrainerForm);
      return;
    }
    const vtDetails = this.vocationalTrainerForm.get('VTId').value;
    this.vocationalTrainerForm.controls['VTId'].setValue(vtDetails.Id);
    this.formatAndSetDate(this.vocationalTrainerForm.get('DateOfJoining').value, 'DateOfJoining');
    this.formatAndSetDate(this.vocationalTrainerForm.get('DateOfResignation').value, 'DateOfResignation');
    this.formatAndSetDate(this.vocationalTrainerForm.get('DateOfBirth').value, 'DateOfBirth');

    this.setValueFromFormGroup(this.vocationalTrainerForm, this.vocationalTrainerModel);

    this.vocationalTrainerService.createOrUpdateVocationalTrainer(this.vocationalTrainerModel)
      .subscribe((vocationalTrainerResp: any) => {

        if (vocationalTrainerResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VocationalTrainer.List]);
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

  //Create vocationalTrainer form and returns {FormGroup}
  createVocationalTrainerForm(): FormGroup {
    return this.formBuilder.group({
      VTId: new FormControl({ value: this.vocationalTrainerModel.VTId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      // AcademicYear: new FormControl(this.vocationalTrainerModel.AcademicYear),
      AcademicYear: new FormControl({ value: this.vocationalTrainerModel.AcademicYear, disabled: this.PageRights.IsReadOnly || this.PageRights.ActionType == 'New' || this.PageRights.ActionType == 'edit' }),
      FullName: new FormControl({ value: this.vocationalTrainerModel.FullName, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(150)]),
      Mobile: new FormControl({ value: this.vocationalTrainerModel.Mobile, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      Mobile1: new FormControl({ value: this.vocationalTrainerModel.Mobile1, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      Email: new FormControl({ value: this.vocationalTrainerModel.Email, disabled: (this.PageRights.IsReadOnly || this.PageRights.ActionType == this.Constants.Actions.Edit) }, [Validators.maxLength(100), Validators.pattern(this.Constants.Regex.Email)]),
      Gender: new FormControl({ value: this.vocationalTrainerModel.Gender, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(10)]),
      DateOfBirth: new FormControl({ value: new Date(this.vocationalTrainerModel.DateOfBirth), disabled: this.PageRights.IsReadOnly }, Validators.required),
      SocialCategory: new FormControl({ value: this.vocationalTrainerModel.SocialCategory, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(100)),
      AcademicQualification: new FormControl({ value: this.vocationalTrainerModel.AcademicQualification, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(150)),
      ProfessionalQualification: new FormControl({ value: this.vocationalTrainerModel.ProfessionalQualification, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(150)),
      ProfessionalQualificationDetails: new FormControl({ value: this.vocationalTrainerModel.ProfessionalQualificationDetails, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(350)),
      IndustryExperienceMonths: new FormControl({ value: this.vocationalTrainerModel.IndustryExperienceMonths, disabled: this.PageRights.IsReadOnly }, Validators.pattern(this.Constants.Regex.Number)),
      TrainingExperienceMonths: new FormControl({ value: this.vocationalTrainerModel.TrainingExperienceMonths, disabled: this.PageRights.IsReadOnly }, Validators.pattern(this.Constants.Regex.Number)),
      AadhaarNumber: new FormControl({ value: this.maskingStudentAadhaarNo(this.vocationalTrainerModel.AadhaarNumber), disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(12), Validators.minLength(12), Validators.pattern(this.Constants.Regex.Number)]),
      DateOfJoining: new FormControl({ value: new Date(this.vocationalTrainerModel.DateOfJoining), disabled: this.PageRights.IsReadOnly }, Validators.required),
      DateOfResignation: new FormControl({ value: this.getDateValue(this.vocationalTrainerModel.DateOfResignation), disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.vocationalTrainerModel.IsActive, disabled: true }),
    });
  }
}
