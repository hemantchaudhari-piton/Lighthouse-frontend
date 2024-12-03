import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { SchoolSectorJobService } from '../schoolsectorjob.service';
import { SchoolSectorJobModel } from '../schoolsectorjob.model';
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
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
@Component({
  selector: 'schoolsectorjob',
  standalone: true,
  imports: [MatPaginatorModule, MatTableModule, CommonModule, MatAutocompleteModule, MatInputModule, MatSelectModule, RouterModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, FuseSharedModule],
  templateUrl: './create-schoolsectorjob.component.html',
  styleUrls: ['./create-schoolsectorjob.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateSchoolSectorJobComponent extends BaseComponent<SchoolSectorJobModel> implements OnInit {
  schoolsectorjobForm: FormGroup;
  schoolsectorjobModel: SchoolSectorJobModel;
  minAllocationDate: Date;
  filteredSchools: DropdownModel[] = [];
  schoolList: [DropdownModel];
  sectorList: DropdownModel[];
  jobRoleList: DropdownModel[];
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private schoolsectorjobService: SchoolSectorJobService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default schoolsectorjob Model
    this.schoolsectorjobModel = new SchoolSectorJobModel();
  }

  ngOnInit(): void {
    this.schoolsectorjobService.getSchoolSectorJob(this.UserModel).subscribe(results => {
      if (results[0].Success) {
        this.schoolList = results[0].Results.$values;
      }

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.schoolsectorjobModel = new SchoolSectorJobModel();
          } else {
            var schoolsectorjobId: string = params.get('schoolsectorjobId')

            this.schoolsectorjobService.getSchoolSectorJobById(schoolsectorjobId)
              .subscribe((response: any) => {
                this.schoolsectorjobModel = response.Result;

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.schoolsectorjobModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.schoolsectorjobModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }
                this.onChangeSchool(this.schoolsectorjobModel.SchoolId).then(response => {
                  this.onChangeSector(this.schoolsectorjobModel.SectorId).then(response => {
                    this.schoolsectorjobForm = this.createSchoolSectorJobForm();
                    const school = this.schoolList.find(s => s.Id === this.schoolsectorjobModel.SchoolId);
                    this.setValue(school);
                    this.IsLoading = true;
                  });
                });
              });
          }
        }
      });
    });

    this.schoolsectorjobForm = this.createSchoolSectorJobForm();
    this.schoolsectorjobForm.controls['SchoolId'].valueChanges.subscribe(value => {
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

  selectSchool(event: MatAutocompleteSelectedEvent): void {
    const selectedSchool = event.option.value;
    this.schoolsectorjobForm.controls['SchoolId'].setValue(selectedSchool)
    this.onChangeSchool(selectedSchool.Id);
  }
  setValue(event) {
    this.schoolsectorjobForm.controls['SchoolId'].setValue(event)
  }

  onChangeSchool(schoolId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({ DataType: 'Sectors', RoleId: this.UserModel.RoleCode, UserId: this.UserModel.UserTypeId, ParentId: schoolId, SelectTitle: "Sector" }).subscribe((response) => {
        if (response.Success) {
          this.sectorList = response.Results.$values;

          if (this.IsLoading) {
            this.schoolsectorjobForm.controls['SectorId'].setValue(null);
            this.schoolsectorjobForm.controls['JobRoleId'].setValue(null);
            this.jobRoleList = <DropdownModel[]>[];
          }
        }

        resolve(true);
      });
    });
  }


  onChangeSector(sectorId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({ DataType: 'JobRoles', ParentId: sectorId, SelectTitle: "Job Role" }).subscribe((response) => {
        if (response.Success) {
          this.jobRoleList = response.Results.$values;

          if (this.IsLoading) {
            this.schoolsectorjobForm.controls['JobRoleId'].setValue(null);
          }
        }

        resolve(true);
      });
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
      this.schoolsectorjobForm.controls[controlName].setValue(null);
      this.schoolsectorjobModel[controlName] = null;
      return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.schoolsectorjobForm.controls[controlName].setValue(isoDateString);
    this.schoolsectorjobModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }

  saveOrUpdateSchoolSectorJobDetails() {
    if (!this.schoolsectorjobForm.valid) {
      this.validateAllFormFields(this.schoolsectorjobForm);
      return;
    }
    const schoolDetails = this.schoolsectorjobForm.get('SchoolId').value;
    this.schoolsectorjobForm.controls['SchoolId'].setValue(schoolDetails.Id);
    this.formatAndSetDate(this.schoolsectorjobForm.get('DateOfAllocation').value, 'DateOfAllocation');
    this.formatAndSetDate(this.schoolsectorjobForm.get('DateOfRemoval').value, 'DateOfRemoval');
    this.setValueFromFormGroup(this.schoolsectorjobForm, this.schoolsectorjobModel);

    this.schoolsectorjobService.createOrUpdateSchoolSectorJob(this.schoolsectorjobModel)
      .subscribe((schoolsectorjobResp: any) => {

        if (schoolsectorjobResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.SchoolSectorJob.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(schoolsectorjobResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('SchoolSectorJob deletion errors =>', error);
      });
  }

  //Create schoolsectorjob form and returns {FormGroup}
  createSchoolSectorJobForm(): FormGroup {
    return this.formBuilder.group({
      SchoolSectorJobId: new FormControl(this.schoolsectorjobModel.SchoolSectorJobId),
      SchoolId: new FormControl({ value: this.schoolsectorjobModel.SchoolId, disabled: this.PageRights.IsReadOnly || this.PageRights.ActionType == 'edit' }, Validators.required),
      SectorId: new FormControl({ value: this.schoolsectorjobModel.SectorId, disabled: this.PageRights.IsReadOnly || this.PageRights.ActionType == 'edit' }, Validators.required),
      JobRoleId: new FormControl({ value: this.schoolsectorjobModel.JobRoleId, disabled: this.PageRights.IsReadOnly || this.PageRights.ActionType == 'edit' }, Validators.required),
      DateOfAllocation: new FormControl({ value: new Date(this.schoolsectorjobModel.DateOfAllocation), disabled: this.PageRights.IsReadOnly }, Validators.required),
      DateOfRemoval: new FormControl({ value: this.getDateValue(this.schoolsectorjobModel.DateOfRemoval), disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.schoolsectorjobModel.IsActive, disabled: true }),
    });
  }
}
