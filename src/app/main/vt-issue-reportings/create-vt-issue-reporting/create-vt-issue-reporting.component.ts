import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VTIssueReportingService } from '../vt-issue-reporting.service';
import { VTIssueReportingModel } from '../vt-issue-reporting.model';
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
@Component({
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,MatInputModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatSelectModule],
  selector: 'vt-issue-reporting',
  templateUrl: './create-vt-issue-reporting.component.html',
  styleUrls: ['./create-vt-issue-reporting.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateVTIssueReportingComponent extends BaseComponent<VTIssueReportingModel> implements OnInit {
  vtIssueReportingForm: FormGroup;
  vtIssueReportingModel: VTIssueReportingModel;
  vtSchoolSectorList: [DropdownModel];
  mainIssueList: [DropdownModel];
  subIssueList: [DropdownModel];
  studentClassList: [DropdownModel];
  monthList: [DropdownModel];
  minReportingDate: Date;
  studentTypeList: any;
  checkUrl: any;
  approvalUrl: boolean = false;
  issueStatusList: any;
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

  CanUserChangeInput: boolean;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private issueReportingService: VTIssueReportingService,
    private schoolsectorjobService: SchoolSectorJobService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vtIssueReporting Model
    this.vtIssueReportingModel = new VTIssueReportingModel();
    this.minReportingDate = new Date(this.UserModel.DateOfAllocation);
  }

  ngOnInit(): void {
    this.issueReportingService.getDropdownforVTIssueReporting(this.UserModel).subscribe((results) => {
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
            this.vtIssueReportingModel = new VTIssueReportingModel();

            if (results[0].Success) {
              this.schoolList = results[0].Results.$values;
              this.filteredSchoolItems = this.schoolList.slice();
              this.loadFormInputs(this.schoolList, 'SchoolId');
            }
            this.CanUserChangeInput = true;

          } else {
            var vtIssueReportingId: string = params.get('vtIssueReportingId')

            this.issueReportingService.getVTIssueReportingById(vtIssueReportingId)
              .subscribe((response: any) => {
                this.vtIssueReportingModel = response.Result;

                this.vtIssueReportingModel.SectionIds = response.Result.SectionIds.split(',');
                this.vtIssueReportingModel.Month = response.Result.Month.split(',');

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.vtIssueReportingModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.vtIssueReportingModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }

                this.schoolsectorjobService.getSchoolSectorJobById(this.vtIssueReportingModel.SSJId)
                  .subscribe((response: any) => {
                    var schoolsectorjobModel = response.Result;
                    this.vtIssueReportingModel.SchoolId = schoolsectorjobModel.SchoolId;
                    this.vtIssueReportingModel.SectorId = schoolsectorjobModel.SectorId;
                    this.vtIssueReportingModel.JobRoleId = schoolsectorjobModel.JobRoleId;
                    this.setInputs(this.vtIssueReportingModel.SchoolId, 'SchoolId', 'SchoolById').then(sResp => {
                      this.setInputs(this.vtIssueReportingModel.SectorId, 'SectorId', 'SectorById').then(vvResp => {
                        this.setInputs(this.vtIssueReportingModel.JobRoleId, 'JobRoleId', 'JobRoleById').then(vvResp => {
                          this.setInputs(this.vtIssueReportingModel.AcademicYearId, 'AcademicYearId', 'AcademicYearById').then(vResp => {
                            this.setInputs(this.vtIssueReportingModel.StudentClass, 'StudentClass', 'ClassById').then(vResp => {
                              this.onChangeClasses(this.vtIssueReportingModel.StudentClass).then(vResp => {
                                this.onChangeMainIssue(this.vtIssueReportingModel.MainIssue);
                                this.vtIssueReportingForm = this.createVTIssueReportingForm();
                              });
                            });
                          });
                        });
                      });
                    });
                  });
              });
          }
        }
      });
    });
    this.vtIssueReportingForm = this.createVTIssueReportingForm();
  }

  setInputs(parentId, InputId, dataType): Promise<any> {

    this.IsLoading = true;
    let promise = new Promise((resolve) => {
      this.commonService.GetMasterDataByType({
        DataType: dataType, ParentId: parentId, SelectTitle: 'Select'
      }, false).subscribe((response) => {
        if (response.Success) {
          if (InputId == 'SchoolId') {
            this.schoolList = response.Results.$values;
            this.filteredSchoolItems = this.schoolList.slice();
          } else if (InputId == 'SectorId') {
            this.sectorList = response.Results.$values;
          } else if (InputId == 'JobRoleId') {
            this.jobRoleList = response.Results.$values;
          } else if (InputId == 'AcademicYearId') {
            this.academicYearList = response.Results.$values;
          } else if (InputId == 'StudentClass') {
            this.classList = response.Results.$values;
          }
          this.vtIssueReportingForm.controls[InputId].disable();
        }
        resolve(true);
      });
    });
    return promise;
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
            this.vtIssueReportingForm.controls['SchoolId'].setValue(null);
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
        DataType: 'JobRolesBySSJ', DataTypeID1: this.SchoolInputId, DataTypeID2: sectorId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: "Job Role"
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
    this.resetFormInputs();

    return new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({
        DataType: 'YearsBySSJ', DataTypeID1: this.SchoolInputId, DataTypeID2: this.SectorInputId, DataTypeID3: jobRoleId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: "Academic Years"
      }).subscribe((response) => {

        if (response.Success) {
          this.academicYearList = response.Results.$values;

          if (response.Results.$values.length == 1) {
            this.dialogService.openShowDialog(this.getHtmlMessage([this.Constants.Messages.InvalidVTACS]));
            this.vtIssueReportingForm.controls['JobRoleId'].setValue(null);
          }

          this.loadFormInputs(response.Results.$values, 'AcademicYearId');
        }
        resolve(true);
      });
    });
  }

  onChangeAcademicYear(academicYearId): Promise<any> {
    this.resetInputsAfter('AcademicYear');
    this.setFormInputs();

    let promise = new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({ DataType: 'ClassesByACS', DataTypeID1: this.SchoolInputId, DataTypeID2: this.SectorInputId, DataTypeID3: this.JobRoleInputId, ParentId: academicYearId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: 'Classes' }).subscribe((response) => {
        if (response.Success) {
          this.classList = response.Results.$values;
          this.loadFormInputs(response.Results.$values, 'StudentClass');
        }

        resolve(true);
      });
    });
    return promise;
  }


  onChangeClasses(classId): Promise<any> {
    this.resetInputsAfter('Class');
    this.setFormInputs();

    this.IsLoading = true;
    let promise = new Promise((resolve, reject) => {

      this.commonService.GetMasterDataByType({
        DataType: 'SectionsByACS', DataTypeID1: this.SchoolInputId,
        DataTypeID2: this.SectorInputId, DataTypeID3: this.JobRoleInputId,
        DataTypeID4: this.AcademicYearInputId, DataTypeID5: classId,
        UserId: this.UserModel.UserTypeId, roleId:
          this.UserModel.RoleCode, SelectTitle: 'Sections'
      }, false).subscribe((response) => {
        if (response.Success) {
          this.sectionList = response.Results.$values;

          if (this.PageRights.ActionType == this.Constants.Actions.Edit) {
            this.vtIssueReportingForm.controls['SectionIds'].disable();
          }
        }
        resolve(true);
      });
    });

    return promise;
  }

  setFormInputs() {
    this.SchoolInputId = this.CanUserChangeInput == true ? this.vtIssueReportingForm.get('SchoolId').value : this.vtIssueReportingModel.SchoolId;
    this.SectorInputId = this.CanUserChangeInput == true ? this.vtIssueReportingForm.get('SectorId').value : this.vtIssueReportingModel.SectorId;
    this.JobRoleInputId = this.CanUserChangeInput == true ? this.vtIssueReportingForm.get('JobRoleId').value : this.vtIssueReportingModel.JobRoleId;
    this.AcademicYearInputId = this.CanUserChangeInput == true ? this.vtIssueReportingForm.get('AcademicYearId').value : this.vtIssueReportingModel.AcademicYearId;
    this.ClassInputId = this.CanUserChangeInput == true ? this.vtIssueReportingForm.get('StudentClass').value : this.vtIssueReportingModel.StudentClass;
    this.SectionInputId = this.CanUserChangeInput == true ? this.vtIssueReportingForm.get('SectionIds').value : this.vtIssueReportingModel.SectionIds;
  }

  loadFormInputs(response, InputName) {

    if (!this.PageRights.IsReadOnly) {
      this.vtIssueReportingForm.controls[InputName].enable();
    }

    if (response.length == 2) {
      var inputId = response[1].Id;
      this.vtIssueReportingForm.controls[InputName].setValue(inputId);

      if (InputName == 'SchoolId') {
        this.onChangeSchool(inputId);
      } else if (InputName == 'SectorId') {
        this.onChangeSector(inputId);
      } else if (InputName == 'JobRoleId') {
        this.onChangeJobRole(inputId);
      } else if (InputName == 'AcademicYearId') {
        this.onChangeAcademicYear(inputId);
      } else if (InputName == 'StudentClass') {
        this.onChangeClasses(inputId);
      }
    }
  }

  resetInputsAfter(input) {

    if (input == 'School') {
      this.vtIssueReportingForm.controls['SectorId'].setValue(null);
      this.vtIssueReportingForm.controls['JobRoleId'].setValue(null);
      this.vtIssueReportingForm.controls['AcademicYearId'].setValue(null);
      this.vtIssueReportingForm.controls['StudentClass'].setValue(null);
      this.vtIssueReportingForm.controls['SectionIds'].setValue(null);
    }

    if (input == 'Sector') {
      this.vtIssueReportingForm.controls['JobRoleId'].setValue(null);
      this.vtIssueReportingForm.controls['AcademicYearId'].setValue(null);
      this.vtIssueReportingForm.controls['StudentClass'].setValue(null);
      this.vtIssueReportingForm.controls['SectionIds'].setValue(null);
    }

    if (input == 'JobRole') {
      this.vtIssueReportingForm.controls['AcademicYearId'].setValue(null);
      this.vtIssueReportingForm.controls['StudentClass'].setValue(null);
      this.vtIssueReportingForm.controls['SectionIds'].setValue(null);
    }

    if (input == 'AcademicYear') {
      this.vtIssueReportingForm.controls['StudentClass'].setValue(null);
      this.vtIssueReportingForm.controls['SectionIds'].setValue(null);
    }

    if (input == 'Class') {
      this.vtIssueReportingForm.controls['SectionIds'].setValue(null);
    }
  }

  resetFormInputs(): void {
    this.vtIssueReportingForm.controls['AcademicYearId'].setValue(null);
    this.vtIssueReportingForm.controls['StudentClass'].setValue(null);
    this.vtIssueReportingForm.controls['SectionIds'].setValue(null);
    this.vtIssueReportingForm.controls['IssueReportDate'].setValue(null);
    this.vtIssueReportingForm.controls['MainIssue'].setValue(null);
    this.vtIssueReportingForm.controls['SubIssue'].setValue(null);
    this.vtIssueReportingForm.controls['Month'].setValue(null);
    this.vtIssueReportingForm.controls['StudentType'].setValue(null);
    this.vtIssueReportingForm.controls['NoOfStudents'].setValue(null);
    this.vtIssueReportingForm.controls['IssueDetails'].setValue(null);
    this.vtIssueReportingForm.controls['IssueStatus'].setValue(null);
  }

  setUserAction() {
    this.CanUserChangeInput = true;
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vtIssueReportingForm.controls[controlName].setValue(null);
        this.vtIssueReportingModel[controlName] = null;
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
    this.vtIssueReportingForm.controls[controlName].setValue(isoDateString);
    this.vtIssueReportingModel[controlName] = isoDateString;
}

formatDate(date: Date): string {
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('000' + date.getMilliseconds()).slice(-3)}Z`;
}
  saveOrUpdateVTIssueReportingDetails() {
    if (!this.vtIssueReportingForm.valid) {
      this.validateAllFormFields(this.vtIssueReportingForm);
      return;
    }
    this.formatAndSetDate(this.vtIssueReportingForm.get('IssueReportDate').value, 'IssueReportDate');

    var SectionIds = this.vtIssueReportingForm.get('SectionIds').value;
    var month = this.vtIssueReportingForm.get('Month').value;
    this.setValueFromFormGroup(this.vtIssueReportingForm, this.vtIssueReportingModel);
    this.vtIssueReportingModel.SectionIds = SectionIds.join(',');
    this.vtIssueReportingModel.Month = month.join(',');
    this.vtIssueReportingModel.VTId = this.UserModel.UserTypeId;
    this.issueReportingService.createOrUpdateVTIssueReporting(this.vtIssueReportingModel)
      .subscribe((vtIssueReportingResp: any) => {

        if (vtIssueReportingResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VTIssueReporting.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vtIssueReportingResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VTIssueReporting deletion errors =>', error);
      });
  }

  onChangeMainIssue(mainIssueId: string) {
    this.commonService.GetMasterDataByType({ DataType: 'SubIssue', UserId: this.UserModel.RoleCode, ParentId: mainIssueId, SelectTitle: 'Sub Issue' }).subscribe((response: any) => {
      if (response.Success) {
        this.subIssueList = response.Results.$values;
      }
    });
  }

  //Create vtIssueReporting form and returns {FormGroup}
  createVTIssueReportingForm(): FormGroup {
    return this.formBuilder.group({
      VTIssueReportingId: new FormControl(this.vtIssueReportingModel.VTIssueReportingId),
      VTId: new FormControl(this.vtIssueReportingModel.VTId),
      SchoolId: new FormControl({ value: this.vtIssueReportingModel.SchoolId, disabled: this.PageRights.IsReadOnly }),
      SectorId: new FormControl({ value: this.vtIssueReportingModel.SectorId, disabled: this.PageRights.IsReadOnly }),
      JobRoleId: new FormControl({ value: this.vtIssueReportingModel.JobRoleId, disabled: this.PageRights.IsReadOnly }),
      AcademicYearId: new FormControl({ value: this.vtIssueReportingModel.AcademicYearId, disabled: this.PageRights.IsReadOnly }),
      StudentClass: new FormControl({ value: this.vtIssueReportingModel.StudentClass, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SectionIds: new FormControl({ value: this.vtIssueReportingModel.SectionIds, disabled: this.PageRights.IsReadOnly }),
      IssueReportDate: new FormControl({ value: new Date(this.vtIssueReportingModel.IssueReportDate), disabled: this.PageRights.IsReadOnly }, Validators.required),
      MainIssue: new FormControl({ value: this.vtIssueReportingModel.MainIssue, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SubIssue: new FormControl({ value: this.vtIssueReportingModel.SubIssue, disabled: this.PageRights.IsReadOnly }, Validators.required),
      Month: new FormControl({ value: this.vtIssueReportingModel.Month, disabled: this.PageRights.IsReadOnly }, Validators.required),
      StudentType: new FormControl({ value: this.vtIssueReportingModel.StudentType, disabled: this.PageRights.IsReadOnly }),
      NoOfStudents: new FormControl({ value: this.vtIssueReportingModel.NoOfStudents, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern("^[0-9]*$")]),
      IssueDetails: new FormControl({ value: this.vtIssueReportingModel.IssueDetails, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(350)),
      IssueStatus: new FormControl({ value: this.vtIssueReportingModel.IssueStatus, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
