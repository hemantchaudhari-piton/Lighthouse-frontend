import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { HeadMasterService } from '../head-master.service';
import { HeadMasterModel } from '../head-master.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteActivatedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
@Component({
  standalone : true ,
  imports: [MatPaginatorModule,MatInputModule,MatTableModule,MatSelectModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  selector: 'head-master',
  templateUrl: './create-head-master.component.html',
  styleUrls: ['./create-head-master.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateHeadMasterComponent extends BaseComponent<HeadMasterModel> implements OnInit {
  headMasterForm: FormGroup;
  headMasterModel: HeadMasterModel;
  genderList: [DropdownModel];
  yearsInSchool: number;
  academicYearList: [DropdownModel];
  schoolList: DropdownModel[];
  filteredSchoolItems: any;
  filteredSchools: DropdownModel[] = [];
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;
  VtId: any;
  AcademicYear: string;
  disableDOR: boolean;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private headMasterService: HeadMasterService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default headMaster Model
    this.headMasterModel = new HeadMasterModel();
    this.headMasterForm = this.createHeadMasterForm();

  const hostnameParts = window.location.hostname.split('.');
  if ((hostnameParts[0] === 'delhi') && this.UserModel.Designation === 'Head Master') {
    this.disableDOR = true;
  }
  }

  ngOnInit(): void {
    this.headMasterService.getDropdownforHeadMaster(this.UserModel).subscribe((results) => {
      if (results[0].Success) {
        this.schoolList = results[0].Results.$values;
      }
      if (results[1].Success) {
        this.genderList = results[1].Results.$values;
      }

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.headMasterModel = new HeadMasterModel();
          } else {
            var hmId: string = params.get('hmId')

            this.headMasterService.getHeadMasterById(hmId)
              .subscribe((response: any) => {
                this.headMasterModel = response.Result;
                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.headMasterModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.headMasterModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }
                this.onChangeDateCalculateYear(this.headMasterModel.DateOfJoining);
                this.headMasterForm = this.createHeadMasterForm();
                const school = this.schoolList.find(s => s.Id === this.headMasterModel.SchoolId);
                this.setValue(school);
                this.IsLoading = true;
              });
          }
        }
      });
    });
    this.headMasterForm.controls['SchoolId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredSchools = this.schoolList.filter(school => {
          const schoolName = school.Name.toString().toLowerCase();
          return schoolName.includes(inputValue);
        });
      } else {
        this.filteredSchools = this.schoolList;
      }
    });
  }
  
  displaySchoolName(school: DropdownModel): string {
    return school ? school.Name : '';
  }
  onFocus(): void {
    this.filteredSchools = this.schoolList;
  }

  selectSchool(event: MatAutocompleteActivatedEvent): void {
    const selectedSchool = event.option.value;
    this.headMasterForm.controls['SchoolId'].setValue(selectedSchool)
  }
  setValue(event) {
    console.log(event,"event")
    this.headMasterForm.controls['SchoolId'].setValue(event)
  }

  onChangeDateCalculateYear(event) {
    let dateOfJoining = new Date(event.value);
    let today = new Date();
    this.yearsInSchool = today.getFullYear() - dateOfJoining.getFullYear();
    this.headMasterForm.get("YearsInSchool").patchValue(this.yearsInSchool);
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.headMasterForm.controls[controlName].setValue(null);
        this.headMasterModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.headMasterForm.controls[controlName].setValue(isoDateString);
    this.headMasterModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  
  saveOrUpdateHeadMasterDetails() {
    if (!this.headMasterForm.valid) {
      this.validateAllFormFields(this.headMasterForm);

      return;
    }
    const schoolDetails = this.headMasterForm.get('SchoolId').value;
    this.headMasterForm.controls['SchoolId'].setValue(schoolDetails.Id);
    this.formatAndSetDate(this.headMasterForm.get('DateOfJoining').value, 'DateOfJoining');
    this.formatAndSetDate(this.headMasterForm.get('DateOfResignationFromSchool').value, 'DateOfResignationFromSchool');
    this.setValueFromFormGroup(this.headMasterForm, this.headMasterModel);
    this.headMasterService.createOrUpdateHeadMaster(this.headMasterModel)
      .subscribe((headMasterResp: any) => {

        if (headMasterResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.HeadMaster.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(headMasterResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('HeadMaster deletion errors =>', error);
    });
  }

  //Create headMaster form and returns {FormGroup}
  createHeadMasterForm(): FormGroup {
    return this.formBuilder.group({
      HMId: new FormControl(this.headMasterModel.HMId),
      SchoolId: new FormControl({ value: this.headMasterModel.SchoolId, disabled: this.PageRights.IsReadOnly }, /*Validators.required*/),
      FirstName: new FormControl({ value: this.headMasterModel.FirstName, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(100), Validators.pattern(this.Constants.Regex.OnlyChars)]),
      MiddleName: new FormControl({ value: this.headMasterModel.MiddleName, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(50), Validators.pattern(this.Constants.Regex.OnlyChars)]),
      LastName: new FormControl({ value: this.headMasterModel.LastName, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(50), Validators.pattern(this.Constants.Regex.OnlyChars)]),
      FullName: new FormControl({ value: this.headMasterModel.FullName, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(150)]),
      Mobile: new FormControl({ value: this.headMasterModel.Mobile, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      Mobile1: new FormControl({ value: this.headMasterModel.Mobile1, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      Email: new FormControl({ value: this.headMasterModel.Email, disabled: (this.PageRights.IsReadOnly || this.PageRights.ActionType == 'edit' ) }, [Validators.required, Validators.maxLength(100), Validators.pattern(this.Constants.Regex.Email)]),
      Gender: new FormControl({ value: this.headMasterModel.Gender, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(10)]),
      YearsInSchool: new FormControl({ value: this.headMasterModel.YearsInSchool, disabled: true }, Validators.pattern(this.Constants.Regex.Number)),
      DateOfJoining: new FormControl({ value: new Date(this.headMasterModel.DateOfJoining), disabled: this.PageRights.IsReadOnly }, Validators.required),
      DateOfResignationFromSchool: new FormControl({ value: this.getDateValue(this.headMasterModel.DateOfResignationFromSchool), disabled: this.PageRights.IsReadOnly || this.disableDOR }),
      IsActive: new FormControl({ value: this.headMasterModel.IsActive, disabled: true })
    });
  }
}
