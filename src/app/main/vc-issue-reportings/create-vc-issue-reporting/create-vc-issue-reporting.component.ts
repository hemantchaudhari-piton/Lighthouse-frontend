import { Component, OnInit, NgZone, ViewEncapsulation,ViewChild } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VCIssueReportingService } from '../vc-issue-reporting.service';
import { VCIssueReportingModel } from '../vc-issue-reporting.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { SchoolSectorJobService } from 'app/main/schoolsectorjobs//schoolsectorjob.service';
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
import { MatAutocompleteActivatedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
@Component({
  selector: 'vc-issue-reporting',
  templateUrl: './create-vc-issue-reporting.component.html',
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,MatInputModule,MatSelectModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  styleUrls: ['./create-vc-issue-reporting.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateVCIssueReportingComponent extends BaseComponent<VCIssueReportingModel> implements OnInit {
  vcIssueReportingForm: FormGroup;
  vcIssueReportingModel: VCIssueReportingModel;
  mainIssueList: [DropdownModel];
  subIssueList: [DropdownModel];
  studentClassList: [DropdownModel];
  monthList: [DropdownModel];
  minReportingDate: Date;
  studentTypeList: any;
  notApplicableId = "218";
  allClassesId = "213";

  schoolList: DropdownModel[];
  filteredSchoolItems: any;
  sectorList: DropdownModel[];
  jobRoleList: DropdownModel[];
  academicYearList: [DropdownModel];
  classList: [DropdownModel];

  SchoolInputId: string;
  SectorInputId: string;
  JobRoleInputId: string;
  AcademicYearInputId: string;
  ClassInputId: string;

  SectionInputId: string;
  sectionList: DropdownModel[];
  filteredSchools: DropdownModel[] = [];
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;

  CanUserChangeInput: boolean;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private issueReportingService: VCIssueReportingService,
    private schoolsectorjobService: SchoolSectorJobService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vcIssueReporting Model
    this.vcIssueReportingModel = new VCIssueReportingModel();
    this.minReportingDate = new Date(this.UserModel.DateOfAllocation);
  }

  ngOnInit(): void {

    this.issueReportingService.getDropdownforVCIssueReporting(this.UserModel).subscribe((results) => {
      if (results[1].Success) {
        this.monthList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.studentClassList = results[2].Results.$values;
      }

      if (results[3].Success) {
        this.studentTypeList = results[3].Results.$values;
      }

      if (results[4].Success) {
        this.mainIssueList = results[4].Results.$values;
      }

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.vcIssueReportingModel = new VCIssueReportingModel();

            if (results[0].Success) {
              this.schoolList = results[0].Results.$values;
              this.filteredSchoolItems = this.schoolList.slice();
              this.loadFormInputs(this.schoolList, 'SchoolId');
            }
            this.CanUserChangeInput = true;

          } else {
            var vcIssueReportingId: string = params.get('vcIssueReportingId')

            this.issueReportingService.getVCIssueReportingById(vcIssueReportingId)
              .subscribe((response: any) => {
                this.vcIssueReportingModel = response.Result;
                this.vcIssueReportingModel.SectionIds = response.Result.SectionIds.split(',');
                this.vcIssueReportingModel.Month = response.Result.Month.split(',');

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.vcIssueReportingModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.vcIssueReportingModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }

                this.schoolsectorjobService.getSchoolSectorJobById(this.vcIssueReportingModel.SSJId)
                  .subscribe((response: any) => {
                    var schoolsectorjobModel = response.Result;

                    this.vcIssueReportingModel.SchoolId = schoolsectorjobModel.SchoolId;
                    this.vcIssueReportingModel.SectorId = schoolsectorjobModel.SectorId;
                    this.vcIssueReportingModel.JobRoleId = schoolsectorjobModel.JobRoleId;

                    this.setInputs(this.vcIssueReportingModel.SchoolId, 'SchoolId', 'SchoolById').then(sResp => {
                      this.setInputs(this.vcIssueReportingModel.SectorId, 'SectorId', 'SectorById').then(vvResp => {
                        this.setInputs(this.vcIssueReportingModel.JobRoleId, 'JobRoleId', 'JobRoleById').then(vvResp => {
                          this.setInputs(this.vcIssueReportingModel.AcademicYearId, 'AcademicYearId', 'AcademicYearById').then(vResp => {
                            this.setInputs(this.vcIssueReportingModel.StudentClass, 'StudentClass', 'ClassById').then(vResp => {
                              this.onChangeClasses(this.vcIssueReportingModel.StudentClass).then(vResp => {
                                this.onChangeMainIssue(this.vcIssueReportingModel.MainIssue);
                                this.vcIssueReportingForm = this.createVCIssueReportingForm();
                                const school = this.schoolList.find(s => s.Id === this.vcIssueReportingModel.SchoolId);
                                this.setValue(school);
                                this.IsLoading = true;
                              });
                            });
                          });
                        });
                      });
                    });
                  });
              });
          }
          this.vcIssueReportingForm.controls['SchoolId'].valueChanges.subscribe(value => {
            if (value) {
              const inputValue = value.toString().toLowerCase();
              this.filteredSchools = this.schoolList.filter(school => {
                const schoolName = school.Name.toString().toLowerCase();
                return schoolName.includes(inputValue);
              });
            } else {
              this.filteredSchools = this.schoolList;
            }
          });        }
      });
    });

    this.vcIssueReportingForm = this.createVCIssueReportingForm();
  }
  displaySchoolName(school: DropdownModel): string {
    return school ? school.Name : '';
  }
  onFocus(): void {
    this.filteredSchools = this.schoolList;
  }

  selectSchool(event: MatAutocompleteActivatedEvent): void {
    const selectedSchool = event.option.value;
    this.vcIssueReportingForm.controls['SchoolId'].setValue(selectedSchool)
    this.onChangeSchool(selectedSchool.Id);
  }
  setValue(event) {
    console.log(event,"event")
    this.vcIssueReportingForm.controls['SchoolId'].setValue(event)
  }
  onChangeSchool(schoolId): Promise<any> {
    this.resetInputsAfter('School');
    this.setFormInputs();

    this.IsLoading = true;
    let promise = new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({
        DataType: 'SectorsBySSJ', ParentId: schoolId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: 'Sectors'
      }).subscribe((response) => {
        if (response.Success) {
          this.sectorList = response.Results.$values;

          if (response.Results.$values.length == 1) {
            this.dialogService.openShowDialog(this.getHtmlMessage([this.Constants.Messages.InvalidSchoolSectorJob]));
            this.vcIssueReportingForm.controls['SchoolId'].setValue(null);
          }

          this.loadFormInputs(response.Results.$values, 'SectorId');
        }
        resolve(true);
      });

    });
    return promise;
  }

  onChangeSector(sectorId): Promise<any> {
    this.resetInputsAfter('Sector');
    this.setFormInputs();

    return new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({
        DataType: 'JobRolesBySSJ', DataTypeID1: this.SchoolInputId['Id'], DataTypeID2: sectorId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: "Job Role"
      }).subscribe((response) => {

        if (response.Success) {
          this.jobRoleList = response.Results.$values;
          this.loadFormInputs(response.Results.$values, 'JobRoleId');
        }

        resolve(true);
      });
    });
  }

  onChangeJobRole(jobRoleId): Promise<any> {
    this.resetInputsAfter('JobRole');
    this.setFormInputs();

    return new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({
        DataType: 'YearsBySSJ', DataTypeID1: this.SchoolInputId['Id'], DataTypeID2: this.SectorInputId, DataTypeID3: jobRoleId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: "Academic Years"
      }).subscribe((response) => {

        if (response.Success) {
          this.academicYearList = response.Results.$values;

          if (response.Results.$values.length == 1) {
            this.dialogService.openShowDialog(this.getHtmlMessage([this.Constants.Messages.InvalidVTACS]));
            this.vcIssueReportingForm.controls['JobRoleId'].setValue(null);
          }

          this.loadFormInputs(response.Results.$values, 'AcademicYearId');
        }
        resolve(true);
      });
      this.setUserAction();
    });

  }

  onChangeAcademicYear(academicYearId): Promise<any> {
    this.resetInputsAfter('AcademicYear');
    this.setFormInputs();

    let promise = new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({
        DataType: 'ClassesByACS', DataTypeID1: this.SchoolInputId['Id'], DataTypeID2: this.SectorInputId, DataTypeID3: this.JobRoleInputId, ParentId: academicYearId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: 'Classes'
      }, false).subscribe((response) => {

        if (response.Success) {
          this.classList = response.Results.$values;

          this.loadFormInputs(response.Results.$values, 'StudentClass');
        }
        resolve(true);
      });
    });

    this.setUserAction();

    return promise;
  }

  onChangeClasses(classId): Promise<any> {
    this.resetInputsAfter('Class');
    this.setFormInputs();

    this.IsLoading = true;
    let promise = new Promise((resolve, reject) => {

      this.commonService.GetMasterDataByType({
        DataType: 'SectionsByACS', DataTypeID1: this.SchoolInputId['Id'],
        DataTypeID2: this.SectorInputId, DataTypeID3: this.JobRoleInputId,
        DataTypeID4: this.AcademicYearInputId, DataTypeID5: classId,
        UserId: this.UserModel.UserTypeId, roleId:
          this.UserModel.RoleCode, SelectTitle: 'Sections'
      }, false).subscribe((response) => {
        if (response.Success) {
          this.sectionList = response.Results.$values;

          if (this.PageRights.ActionType == this.Constants.Actions.Edit) {
            this.vcIssueReportingForm.controls['SectionIds'].disable();
          }
        }
        resolve(true);
      });
    });

    return promise;
  }

  setFormInputs() {
    this.SchoolInputId = this.CanUserChangeInput == true ? this.vcIssueReportingForm.get('SchoolId').value : this.vcIssueReportingModel.SchoolId;
    this.SectorInputId = this.CanUserChangeInput == true ? this.vcIssueReportingForm.get('SectorId').value : this.vcIssueReportingModel.SectorId;
    this.JobRoleInputId = this.CanUserChangeInput == true ? this.vcIssueReportingForm.get('JobRoleId').value : this.vcIssueReportingModel.JobRoleId;
    this.AcademicYearInputId = this.CanUserChangeInput == true ? this.vcIssueReportingForm.get('AcademicYearId').value : this.vcIssueReportingModel.AcademicYearId;
    this.ClassInputId = this.CanUserChangeInput == true ? this.vcIssueReportingForm.get('StudentClass').value : this.vcIssueReportingModel.StudentClass;
    this.SectionInputId = this.CanUserChangeInput == true ? this.vcIssueReportingForm.get('SectionIds').value : this.vcIssueReportingModel.SectionIds;
  }

  loadFormInputs(response, InputName) {
    if (!this.PageRights.IsReadOnly) {
        this.vcIssueReportingForm.controls[InputName].enable();
    }

    if (response.length > 0) {
        if (response.length === 1) {
            const inputId = response[0].Id;
  
            if (InputName === 'StudentClass') {
              this.vcIssueReportingForm.controls[InputName].setValue(inputId);
              this.vcIssueReportingForm.controls[InputName].disable();
                this.onChangeClasses(inputId); 
            }
        } else if (response.length === 2) {
            const inputId = response[1].Id;
            this.vcIssueReportingForm.controls[InputName].setValue(inputId);
            if (InputName != 'StudentClass' && InputName != 'SchoolId') 
            {
               this.vcIssueReportingForm.controls[InputName].disable();
            }
            if (InputName === 'SchoolId') {
                this.onChangeSchool(inputId);
            } else if (InputName === 'SectorId') {
                this.onChangeSector(inputId);
            } else if (InputName === 'JobRoleId') {
                this.onChangeJobRole(inputId);
            } else if (InputName === 'AcademicYearId') {
                this.onChangeAcademicYear(inputId);
            } else if (InputName === 'StudentClass') {
                this.onChangeClasses(inputId);
            }
        }
    }
}


  resetInputsAfter(input) {

    if (input == 'School') {
      this.vcIssueReportingForm.controls['SectorId'].setValue(null);
      this.vcIssueReportingForm.controls['JobRoleId'].setValue(null);
      this.vcIssueReportingForm.controls['AcademicYearId'].setValue(null);
      this.vcIssueReportingForm.controls['StudentClass'].setValue(null);
      this.vcIssueReportingForm.controls['SectionIds'].setValue(null);
    }

    if (input == 'Sector') {
      this.vcIssueReportingForm.controls['JobRoleId'].setValue(null);
      this.vcIssueReportingForm.controls['AcademicYearId'].setValue(null);
      this.vcIssueReportingForm.controls['StudentClass'].setValue(null);
      this.vcIssueReportingForm.controls['SectionIds'].setValue(null);
    }

    if (input == 'JobRole') {
      this.vcIssueReportingForm.controls['AcademicYearId'].setValue(null);
      this.vcIssueReportingForm.controls['StudentClass'].setValue(null);
      this.vcIssueReportingForm.controls['SectionIds'].setValue(null);
    }

    if (input == 'AcademicYear') {
      this.vcIssueReportingForm.controls['StudentClass'].setValue(null);
      this.vcIssueReportingForm.controls['SectionIds'].setValue(null);
    }

    if (input == 'Class') {
      this.vcIssueReportingForm.controls['SectionIds'].setValue(null);
    }
  }

  setUserAction() {
    this.CanUserChangeInput = true;
  }


  setInputs(parentId, InputId, dataType): Promise<any> {

    this.IsLoading = true;
    let promise = new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({
        DataType: dataType, ParentId: parentId, SelectTitle: 'Select'
      }).subscribe((response) => {
        if (response.Success) {
          if (InputId == 'SchoolId') {
            this.schoolList = response.Results.$values;
            this.filteredSchoolItems = this.schoolList.slice();
            this.vcIssueReportingForm.controls[InputId].disable();
          } else if (InputId == 'SectorId') {
            this.sectorList = response.Results.$values;
            this.vcIssueReportingForm.controls[InputId].disable();
          } else if (InputId == 'JobRoleId') {
            this.jobRoleList = response.Results.$values;
            this.vcIssueReportingForm.controls[InputId].disable();
          } else if (InputId == 'AcademicYearId') {
            this.academicYearList = response.Results.$values;
            this.vcIssueReportingForm.controls[InputId].disable();
          } else if (InputId == 'StudentClass') {
            this.classList = response.Results.$values;
            this.vcIssueReportingForm.controls[InputId].disable();
          }
        }
        resolve(true);
      });

    });
    return promise;
  }

  onStudentClassChange(selectedSectionIds) {
    if (selectedSectionIds.length == 0) {
      this.studentClassList.forEach(studentClassItem => {
        studentClassItem.IsDisabled = false;
      });
    }
    else {
      if (selectedSectionIds[0] == this.notApplicableId) {
        this.studentClassList.forEach(studentClassItem => {
          if (studentClassItem.Id != selectedSectionIds[0]) {
            studentClassItem.IsDisabled = true;
          }
        });
      }
      else {
        let studentClassItem = this.studentClassList.find(s => s.Id == this.notApplicableId);
        studentClassItem.IsDisabled = true;
      }
    }
  }

  selectAll(ev) {
    if (ev._selected) {
      this.vcIssueReportingForm.get('StudentClass').setValue(['214', '215', '216', '217']);
      ev._selected = true;
    }

    if (ev._selected == false) {
      this.vcIssueReportingForm.get('StudentClass').setValue([]);
      let studentClassItem = this.studentClassList.find(s => s.Id == this.notApplicableId);
      studentClassItem.IsDisabled = false;
    }
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vcIssueReportingForm.controls[controlName].setValue(null);
        this.vcIssueReportingModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const now = new Date();
    if (dateObject.getHours() === 0 && dateObject.getMinutes() === 0 && dateObject.getSeconds() === 0) {
        dateObject.setHours(now.getHours());
        dateObject.setMinutes(now.getMinutes());
        dateObject.setSeconds(now.getSeconds());
        dateObject.setMilliseconds(now.getMilliseconds());
    }

    const isoDateString = this.formatDate(dateObject);
    this.vcIssueReportingForm.controls[controlName].setValue(isoDateString);
    this.vcIssueReportingModel[controlName] = isoDateString;
}

formatDate(date: Date): string {
  return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('000' + date.getMilliseconds()).slice(-3)}Z`;
}
  saveOrUpdateVCIssueReportingDetails() {
    if (!this.vcIssueReportingForm.valid) {
      this.validateAllFormFields(this.vcIssueReportingForm);
      return;
    }
    const schoolDetails = this.vcIssueReportingForm.get('SchoolId').value;
    this.vcIssueReportingForm.controls['SchoolId'].setValue(schoolDetails.Id);
    this.formatAndSetDate(this.vcIssueReportingForm.get('IssueReportDate').value, 'IssueReportDate');

    var SectionIds = this.vcIssueReportingForm.get('SectionIds').value;
    var month = this.vcIssueReportingForm.get('Month').value;
    this.setValueFromFormGroup(this.vcIssueReportingForm, this.vcIssueReportingModel);
    this.vcIssueReportingModel.SectionIds = SectionIds.join(',');
    this.vcIssueReportingModel.Month = month.join(',');
    this.vcIssueReportingModel.VCId = this.UserModel.UserTypeId;

    this.issueReportingService.createOrUpdateVCIssueReporting(this.vcIssueReportingModel)
      .subscribe((vcIssueReportingResp: any) => {

        if (vcIssueReportingResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VCIssueReporting.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vcIssueReportingResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VCIssueReporting deletion errors =>', error);
      });
  }

  onChangeMainIssue(mainIssueId: string) {
    this.commonService.GetMasterDataByType({ DataType: 'SubIssue', UserId: this.UserModel.RoleCode, ParentId: mainIssueId, SelectTitle: 'Sub Issue' }).subscribe((response: any) => {
      if (response.Success) {
        this.subIssueList = response.Results.$values;
      }
    });
  }

  //Create vcIssueReporting form and returns {FormGroup}
  createVCIssueReportingForm(): FormGroup {
    return this.formBuilder.group({
      VCIssueReportingId: new FormControl(this.vcIssueReportingModel.VCIssueReportingId),
      VCId: new FormControl(this.vcIssueReportingModel.VCId),
      SchoolId: new FormControl({ value: this.vcIssueReportingModel.SchoolId, disabled: this.PageRights.IsReadOnly }),
      SectorId: new FormControl({ value: this.vcIssueReportingModel.SectorId, disabled: this.PageRights.IsReadOnly }),
      JobRoleId: new FormControl({ value: this.vcIssueReportingModel.JobRoleId, disabled: this.PageRights.IsReadOnly }),
      AcademicYearId: new FormControl({ value: this.vcIssueReportingModel.AcademicYearId, disabled: this.PageRights.IsReadOnly }),
      StudentClass: new FormControl({ value: this.vcIssueReportingModel.StudentClass, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SectionIds: new FormControl({ value: this.vcIssueReportingModel.SectionIds, disabled: this.PageRights.IsReadOnly }),
      IssueReportDate: new FormControl({ value: new Date(this.vcIssueReportingModel.IssueReportDate), disabled: this.PageRights.IsReadOnly }, Validators.required),
      MainIssue: new FormControl({ value: this.vcIssueReportingModel.MainIssue, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SubIssue: new FormControl({ value: this.vcIssueReportingModel.SubIssue, disabled: this.PageRights.IsReadOnly }, Validators.required),
      Month: new FormControl({ value: this.vcIssueReportingModel.Month, disabled: this.PageRights.IsReadOnly }, Validators.required),
      StudentType: new FormControl({ value: this.vcIssueReportingModel.StudentType, disabled: this.PageRights.IsReadOnly }, Validators.required),
      NoOfStudents: new FormControl({ value: this.vcIssueReportingModel.NoOfStudents, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      IssueDetails: new FormControl({ value: this.vcIssueReportingModel.IssueDetails, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(350))
    });
  }
}
