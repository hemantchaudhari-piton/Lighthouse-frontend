import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VocationaltrainerdetailService } from '../vocationaltrainerdetail.service';
import { VocationaltrainerdetailModel } from '../vocationaltrainerdetail.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'vocationaltrainerdetail',
  templateUrl: './create-vocationaltrainerdetail.component.html',
  styleUrls: ['./create-vocationaltrainerdetail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,MatInputModule,MatSelectModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  animations: fuseAnimations
})
export class CreateVocationaltrainerdetailComponent extends BaseComponent<VocationaltrainerdetailModel> implements OnInit {
  vocationaltrainerdetailForm: FormGroup;
  vocationaltrainerdetailModel: VocationaltrainerdetailModel;
  vtpList: [DropdownModel];
  socialCategoryList: [DropdownModel];
  natureOfAppointmentList: [DropdownModel];
  academicQualificationList: [DropdownModel];
  professionalQualificationList: [DropdownModel];
  industryTrainingExperienceList: [DropdownModel];
  genderList: [DropdownModel];
  vtList: [DropdownModel];
  filteredVTItems: any;
  vocationalCoordinatorList: any;
  // vcList: [DropdownModel];
  // filteredVCItems;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vocationaltrainerdetailService: VocationaltrainerdetailService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vocationaltrainerdetail Model
    this.vocationaltrainerdetailModel = new VocationaltrainerdetailModel();
  }

  ngOnInit(): void {

    this.vocationaltrainerdetailService.getDropdownforVocationalTrainerDetail(this.UserModel).subscribe(results => {
      if (results[0].Success) {
        this.socialCategoryList = results[0].Results.$values;
      }
      if (results[1].Success) {
        this.academicQualificationList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.professionalQualificationList = results[2].Results.$values;
      }

      if (results[3].Success) {
        this.industryTrainingExperienceList = results[3].Results.$values;
      }

      if (results[4].Success) {
        this.genderList = results[4].Results.$values;
      }

      if (results[5].Success) {
        this.vtList = results[5].Results.$values;
        this.filteredVTItems = this.vtList.slice();
      }

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.vocationaltrainerdetailModel = new VocationaltrainerdetailModel();

          } else {
            var vocationaltrainerdetailId: string = params.get('vocationaltrainerdetailId')

            this.vocationaltrainerdetailService.getVocationaltrainerdetailById(vocationaltrainerdetailId)
              .subscribe((response: any) => {
                this.vocationaltrainerdetailModel = response.Result;

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.vocationaltrainerdetailModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.vocationaltrainerdetailModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }

                if (this.vocationaltrainerdetailModel.DateOfResignation != null) {
                  this.vocationaltrainerdetailForm.get("DateOfResignation").setValue(this.getDateValue(this.vocationaltrainerdetailModel.DateOfResignation));
                  let dateOfResignationCtrl = this.vocationaltrainerdetailForm.get("DateOfResignation");
                  this.onChangeDateEnableDisableCheckBox(this.vocationaltrainerdetailForm, dateOfResignationCtrl);
                }
                this.vocationaltrainerdetailForm = this.createVocationaltrainerdetailForm();
              });
          }
        }
      });
    });

    this.vocationaltrainerdetailForm = this.createVocationaltrainerdetailForm();
  }

  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vocationaltrainerdetailForm.controls[controlName].setValue(null);
        this.vocationaltrainerdetailModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vocationaltrainerdetailForm.controls[controlName].setValue(isoDateString);
    this.vocationaltrainerdetailModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }

  saveOrUpdateVocationaltrainerdetailDetails() {
    if (!this.vocationaltrainerdetailForm.valid) {
      this.validateAllFormFields(this.vocationaltrainerdetailForm);
      return;
    }
    this.formatAndSetDate(this.vocationaltrainerdetailForm.get('DateOfBirth').value, 'DateOfBirth');
    this.formatAndSetDate(this.vocationaltrainerdetailForm.get('DateOfJoining').value, 'DateOfJoining');
    this.formatAndSetDate(this.vocationaltrainerdetailForm.get('DateOfResignation').value, 'DateOfResignation');
    this.setValueFromFormGroup(this.vocationaltrainerdetailForm, this.vocationaltrainerdetailModel);

    this.vocationaltrainerdetailService.createOrUpdateVocationaltrainerdetail(this.vocationaltrainerdetailModel)
      .subscribe((vocationaltrainerdetailResp: any) => {

        if (vocationaltrainerdetailResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.Vocationaltrainerdetail.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vocationaltrainerdetailResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('Vocationaltrainerdetail deletion errors =>', error);
      });
  }

  //Create vocationaltrainerdetail form and returns {FormGroup}
  createVocationaltrainerdetailForm(): FormGroup {
    return this.formBuilder.group({
      VocationaltrainerdetailId: new FormControl(this.vocationaltrainerdetailModel.VocationaltrainerdetailId),
      VTId: new FormControl({ value: this.vocationaltrainerdetailModel.VTId, disabled: this.PageRights.IsReadOnly }),
      MiddleName: new FormControl({ value: this.vocationaltrainerdetailModel.MiddleName, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(50), Validators.pattern(this.Constants.Regex.CharWithTitleCaseSpaceAndSpecialChars)]),
      Mobile1: new FormControl({ value: this.vocationaltrainerdetailModel.Mobile1, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      Gender: new FormControl({ value: this.vocationaltrainerdetailModel.Gender, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(10)]),
      DateOfBirth: new FormControl({ value: new Date(this.vocationaltrainerdetailModel.DateOfBirth), disabled: this.PageRights.IsReadOnly }, Validators.required),
      SocialCategory: new FormControl({ value: this.vocationaltrainerdetailModel.SocialCategory, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(100)),
      NatureOfAppointment: new FormControl({ value: this.vocationaltrainerdetailModel.NatureOfAppointment, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(100)),
      AcademicQualification: new FormControl({ value: this.vocationaltrainerdetailModel.AcademicQualification, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(150)),
      ProfessionalQualification: new FormControl({ value: this.vocationaltrainerdetailModel.ProfessionalQualification, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(150)),
      ProfessionalQualificationDetails: new FormControl({ value: this.vocationaltrainerdetailModel.ProfessionalQualificationDetails, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(350)),
      IndustryExperienceMonths: new FormControl({ value: this.vocationaltrainerdetailModel.IndustryExperienceMonths, disabled: this.PageRights.IsReadOnly }, Validators.pattern(this.Constants.Regex.Number)),
      TrainingExperienceMonths: new FormControl({ value: this.vocationaltrainerdetailModel.TrainingExperienceMonths, disabled: this.PageRights.IsReadOnly }, Validators.pattern(this.Constants.Regex.Number)),
      AadhaarNumber: new FormControl({ value: this.maskingStudentAadhaarNo(this.vocationaltrainerdetailModel.AadhaarNumber), disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(12), Validators.minLength(12), Validators.pattern(this.Constants.Regex.Number)]),
      DateOfJoining: new FormControl({ value: new Date(this.vocationaltrainerdetailModel.DateOfJoining), disabled: this.PageRights.IsReadOnly }, Validators.required),
      DateOfResignation: new FormControl({ value: this.getDateValue(this.vocationaltrainerdetailModel.DateOfResignation), disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.vocationaltrainerdetailModel.IsActive, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
