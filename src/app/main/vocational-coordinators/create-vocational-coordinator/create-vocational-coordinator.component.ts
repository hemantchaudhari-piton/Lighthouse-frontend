import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VocationalCoordinatorService } from '../vocational-coordinator.service';
import { VocationalCoordinatorModel } from '../vocational-coordinator.model';
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

@Component({
  selector: 'vocational-coordinator',
  templateUrl: './create-vocational-coordinator.component.html',
  styleUrls: ['./create-vocational-coordinator.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone : true ,
  imports: [MatPaginatorModule,MatSelectModule,MatInputModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  animations: fuseAnimations
})
export class CreateVocationalCoordinatorComponent extends BaseComponent<VocationalCoordinatorModel> implements OnInit {
  vocationalCoordinatorForm: FormGroup;
  vocationalCoordinatorModel: VocationalCoordinatorModel;
  academicYearList: DropdownModel[];
  currentAcademicYear: any;

  vtpList: [DropdownModel];
  natureOfAppointmentList: [DropdownModel];
  genderList: [DropdownModel];
  vcList: [DropdownModel];
  filteredVcItems;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vocationalCoordinatorService: VocationalCoordinatorService,
    private accountService: AccountService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vocationalCoordinator Model
    this.vocationalCoordinatorModel = new VocationalCoordinatorModel();
    this.vocationalCoordinatorForm = this.createVocationalCoordinatorForm();
  }

  ngOnInit(): void {

    this.vocationalCoordinatorService.getDropdownforVocationalCoordinators(this.UserModel).subscribe((results: any) => {
      if (results[0].Success) {
        this.genderList = results[0].Results.$values;
      }

      if (results[1].Success) {
        this.vcList = results[1].Results.$values;
        this.filteredVcItems = this.vcList.slice();
      }

      if(results[3].Success){
            let currentAcademicYear = results[3].Results.$values;
            const selectedAcademicYear = currentAcademicYear.find(ay => ay.IsSelected === true);
              this.academicYearList = selectedAcademicYear ? [selectedAcademicYear] : [];
              this.vocationalCoordinatorForm.controls['AcademicYear'].setValue(selectedAcademicYear.Name);
          }
      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.vocationalCoordinatorModel = new VocationalCoordinatorModel();

          } else {
            var vcId: string = params.get('vcId')

            this.vocationalCoordinatorService.getVocationalCoordinatorById(vcId)
              .subscribe((response: any) => {
                this.vocationalCoordinatorModel = response.Result;

                if (results[2].Success) {
                  this.vcList = results[2].Results.$values;
                  this.filteredVcItems = this.vcList.slice();
                }

                if (this.PageRights.ActionType === this.Constants.Actions.Edit) {
                  this.vocationalCoordinatorModel.RequestType = this.Constants.PageType.Edit;
                  this.vocationalCoordinatorForm.controls['VCId'].disable();
                } else if (this.PageRights.ActionType === this.Constants.Actions.View) {
                  this.vocationalCoordinatorModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }
                this.onChangeVC(this.vocationalCoordinatorModel.VCId);
                this.vocationalCoordinatorForm = this.createVocationalCoordinatorForm();
              });
          }
        }
      });
    });
  }


  onChangeVC(VCId) {
    this.accountService.getAccountById(VCId).subscribe((response: any) => {
      var accountModel = response.Result;
      this.vocationalCoordinatorForm.controls['EmailId'].setValue(accountModel.EmailId);
      this.vocationalCoordinatorForm.controls['EmailId'].disable();
      this.vocationalCoordinatorForm.controls['Mobile'].setValue(accountModel.Mobile);
      this.vocationalCoordinatorForm.controls['Mobile'].disable();
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vocationalCoordinatorForm.controls[controlName].setValue(null);
        this.vocationalCoordinatorModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vocationalCoordinatorForm.controls[controlName].setValue(isoDateString);
    this.vocationalCoordinatorModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }

  saveOrUpdateVocationalCoordinatorDetails() {
    if (!this.vocationalCoordinatorForm.valid) {
      this.validateAllFormFields(this.vocationalCoordinatorForm);
      return;
    }
    this.formatAndSetDate(this.vocationalCoordinatorForm.get('DateOfJoining').value, 'DateOfJoining');
    this.formatAndSetDate(this.vocationalCoordinatorForm.get('DateOfResignation').value, 'DateOfResignation');
    this.setValueFromFormGroup(this.vocationalCoordinatorForm, this.vocationalCoordinatorModel);
    this.vocationalCoordinatorService.createOrUpdateVocationalCoordinator(this.vocationalCoordinatorModel)
      .subscribe((vocationalCoordinatorResp: any) => {

        if (vocationalCoordinatorResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VocationalCoordinator.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vocationalCoordinatorResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VocationalCoordinator deletion errors =>', error);
      });
  }

  //Create vocationalCoordinator form and returns {FormGroup}
  createVocationalCoordinatorForm(): FormGroup {
    return this.formBuilder.group({
      VCId: new FormControl({ value: this.vocationalCoordinatorModel.VCId, disabled: this.PageRights.IsReadOnly}),
      // AcademicYear: new FormControl(this.vocationalCoordinatorModel.AcademicYear),
      AcademicYear: new FormControl({ value: this.vocationalCoordinatorModel.AcademicYear, disabled: this.PageRights.IsReadOnly || this.PageRights.ActionType == 'New' || this.PageRights.ActionType == 'edit' }),
      FullName: new FormControl({ value: this.vocationalCoordinatorModel.FullName, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(150)]),
      Mobile: new FormControl({ value: this.vocationalCoordinatorModel.Mobile, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      Mobile1: new FormControl({ value: this.vocationalCoordinatorModel.Mobile1, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      EmailId: new FormControl({ value: this.vocationalCoordinatorModel.EmailId, disabled: (this.PageRights.IsReadOnly || this.PageRights.ActionType == this.Constants.Actions.Edit) }, [Validators.required, Validators.maxLength(50), Validators.pattern(this.Constants.Regex.Email)]),
      Gender: new FormControl({ value: this.vocationalCoordinatorModel.Gender, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(50)]),
      DateOfJoining: new FormControl({ value: new Date(this.vocationalCoordinatorModel.DateOfJoining), disabled: this.PageRights.IsReadOnly }, Validators.required),
      DateOfResignation: new FormControl({ value: this.getDateValue(this.vocationalCoordinatorModel.DateOfResignation), disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.vocationalCoordinatorModel.IsActive, disabled: true }),
    });
  }
}
