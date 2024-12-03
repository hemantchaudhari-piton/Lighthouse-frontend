import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { HMIssueReportingService } from '../../hm-issue-reportings/hm-issue-reporting.service';
import { VCIssueReportingService } from '../../vc-issue-reportings/vc-issue-reporting.service';
import { VTIssueReportingService } from '../../vt-issue-reportings/vt-issue-reporting.service';
import { IssueApprovalModel } from '../issue-approval.model';
import { IssueApprovalService } from '../issue-approval.service';
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
  imports: [MatPaginatorModule,MatSelectModule,CommonModule,MatTableModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatInputModule],
  selector: 'hm-issue-reporting',
  templateUrl: './create-issue-approval.component.html',
  styleUrls: ['./create-issue-approval.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateIssueApprovalComponent extends BaseComponent<IssueApprovalModel> implements OnInit {
  issueApprovalForm: FormGroup;
  issueApprovalModel: IssueApprovalModel;
  headMasterList: [DropdownModel];
  vtSchoolSectorList: [DropdownModel];
  mainIssueList: [DropdownModel];
  subIssueList: [DropdownModel];
  studentClassList: [DropdownModel];
  monthList: [DropdownModel];
  studentTypeList: any;
  service: any;
  updateService: any;
  issueStatusList: any;
  type: any;
  backToApprovalPage: string;
  approvalParams: any;

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
    private issueApprovalService: IssueApprovalService,
    private hmIssueReportingService: HMIssueReportingService,
    private vtIssueReportingService: VTIssueReportingService,
    private vcIssueReportingService: VCIssueReportingService,
    private schoolsectorjobService: SchoolSectorJobService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default hmIssueReporting Model
    this.issueApprovalModel = new IssueApprovalModel();
  }

  ngOnInit(): void {
    this.issueApprovalService.getDropdownforIssueReporting(this.UserModel).subscribe((results) => {
      if (results[0].Success) {
        this.monthList = results[0].Results.$values;
      }

      if (results[1].Success) {
        this.studentClassList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.studentTypeList = results[2].Results.$values;
      }

      if (results[3].Success) {
        this.mainIssueList = results[3].Results.$values;
      }

      if (results[4].Success) {
        this.issueStatusList = results[4].Results.$values;
      }

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');
          this.type = params.get('type');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.issueApprovalModel = new IssueApprovalModel();

            this.CanUserChangeInput = true;

          } else {
            var issueReportingId: string = params.get('issueReportingId');

            if (this.type == 'HM') {
              this.service = this.issueApprovalService.getHMIssueReportingById(issueReportingId)
              this.backToApprovalPage = '/hm-issue-approval';
            }
            else if (this.type == 'VT') {
              this.service = this.issueApprovalService.getVTIssueReportingById(issueReportingId)
              this.backToApprovalPage = '/vt-issue-approval';
            }
            else if (this.type == 'VC') {
              this.service = this.issueApprovalService.getVCIssueReportingById(issueReportingId)
              this.backToApprovalPage = '/vt-issue-approval';
            }

            this.service.subscribe((response: any) => {
              this.issueApprovalModel = response.Result;
              if (response.Result.SectionIds) {
                this.issueApprovalModel.SectionIds = response.Result.SectionIds.split(',');
              }
              this.issueApprovalModel.Month = response.Result.Month.split(',');

              if (this.PageRights.ActionType == this.Constants.Actions.Edit) {
                this.issueApprovalModel.RequestType = this.Constants.PageType.Edit;
                this.PageRights.IsReadOnly = true;
              }
              else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                this.issueApprovalModel.RequestType = this.Constants.PageType.View;
                this.PageRights.IsReadOnly = true;
              }

              this.schoolsectorjobService.getSchoolSectorJobById(this.issueApprovalModel.SSJId)
                .subscribe((response: any) => {
                  var schoolsectorjobModel = response.Result;

                  this.issueApprovalModel.SchoolId = schoolsectorjobModel.SchoolId;
                  this.issueApprovalModel.SectorId = schoolsectorjobModel.SectorId;
                  this.issueApprovalModel.JobRoleId = schoolsectorjobModel.JobRoleId;

                  this.setInputs(this.issueApprovalModel.SchoolId, 'SchoolId', 'SchoolById').then(sResp => {
                    this.setInputs(this.issueApprovalModel.SectorId, 'SectorId', 'SectorById').then(vvResp => {
                      this.setInputs(this.issueApprovalModel.JobRoleId, 'JobRoleId', 'JobRoleById').then(vvResp => {
                        this.setInputs(this.issueApprovalModel.AcademicYearId, 'AcademicYearId', 'AcademicYearById').then(vResp => {
                          this.setInputs(this.issueApprovalModel.StudentClass, 'StudentClass', 'ClassById').then(vResp => {
                            this.onChangeClasses(this.issueApprovalModel.StudentClass).then(vResp => {
                              this.onChangeMainIssue(this.issueApprovalModel.MainIssue);
                              this.onChangeMainIssue(this.issueApprovalModel.MainIssue);
                              this.issueApprovalForm.get('Remarks').setValue(this.issueApprovalModel.Remarks);
                              this.issueApprovalForm = this.createIssueApprovalForm();

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

    this.issueApprovalForm = this.createIssueApprovalForm();
  }


  onChangeClasses(classId): Promise<any> {
    this.setFormInputs();

    this.IsLoading = true;
    let promise = new Promise((resolve, reject) => {

      this.commonService.GetMasterDataByType({
        DataType: 'SectionsByACS',
        DataTypeID1: this.SchoolInputId,
        DataTypeID2: this.SectorInputId,
        DataTypeID3: this.JobRoleInputId,
        DataTypeID4: this.AcademicYearInputId,
        DataTypeID5: classId,
        UserId: this.UserModel.UserTypeId, roleId:
          this.UserModel.RoleCode, SelectTitle: 'Sections'
      }, false).subscribe((response) => {
        if (response.Success) {
          this.sectionList = response.Results.$values;

          if (this.PageRights.ActionType == this.Constants.Actions.Edit) {
            this.issueApprovalForm.controls['SectionIds'].disable();
          }
        }
        resolve(true);
      });
    });
    this.setUserAction();
    return promise;
  }

  setUserAction() {
    this.CanUserChangeInput = true;
  }

  onChangeAcademicYear(academicYearId): Promise<any> {

    let promise = new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({
        DataType: 'ClassesByACS', DataTypeID1: this.issueApprovalModel.SchoolId, DataTypeID2: this.issueApprovalModel.SectorId, DataTypeID3: this.issueApprovalModel.JobRoleId, ParentId: academicYearId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: 'Classes'
      }, false).subscribe((response) => {

        if (response.Success) {
          this.classList = response.Results.$values;
        }
        resolve(true);
      });
    });

    return promise;
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
            this.issueApprovalForm.controls[InputId].disable();
          } else if (InputId == 'SectorId') {
            this.sectorList = response.Results.$values;
            this.issueApprovalForm.controls[InputId].disable();
          } else if (InputId == 'JobRoleId') {
            this.jobRoleList = response.Results.$values;
            this.issueApprovalForm.controls[InputId].disable();
          } else if (InputId == 'AcademicYearId') {
            this.academicYearList = response.Results.$values;
            this.issueApprovalForm.controls[InputId].disable();
          } else if (InputId == 'StudentClass') {
            this.classList = response.Results.$values;
            this.issueApprovalForm.controls[InputId].disable();
          }
        }
        resolve(true);
      });

    });
    return promise;
  }

  setFormInputs() {
    this.SchoolInputId = this.CanUserChangeInput == true ? this.issueApprovalForm.get('SchoolId').value : this.issueApprovalModel.SchoolId;
    this.SectorInputId = this.CanUserChangeInput == true ? this.issueApprovalForm.get('SectorId').value : this.issueApprovalModel.SectorId;
    this.JobRoleInputId = this.CanUserChangeInput == true ? this.issueApprovalForm.get('JobRoleId').value : this.issueApprovalModel.JobRoleId;
    this.AcademicYearInputId = this.CanUserChangeInput == true ? this.issueApprovalForm.get('AcademicYearId').value : this.issueApprovalModel.AcademicYearId;
    this.ClassInputId = this.CanUserChangeInput == true ? this.issueApprovalForm.get('StudentClass').value : this.issueApprovalModel.StudentClass;
    this.SectionInputId = this.CanUserChangeInput == true ? this.issueApprovalForm.get('SectionIds').value : this.issueApprovalModel.SectionIds;
  }

  onChangeMainIssue(mainIssueId: string) {
    this.commonService.GetMasterDataByType({ DataType: 'SubIssueView', UserId: this.UserModel.RoleCode, ParentId: mainIssueId, SelectTitle: 'Sub Issue' }).subscribe((response: any) => {
      if (response.Success) {
        this.subIssueList = response.Results.$values;
      }
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.issueApprovalForm.controls[controlName].setValue(null);
        this.issueApprovalModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.issueApprovalForm.controls[controlName].setValue(isoDateString);
    this.issueApprovalModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateHMIssueReportingDetails() {
    if (!this.issueApprovalForm.valid) {
      this.validateAllFormFields(this.issueApprovalForm);
      return;
    }
    this.formatAndSetDate(this.issueApprovalForm.get('IssueReportDate').value, 'IssueReportDate');

    if (this.type == 'HM') {
      this.issueApprovalForm.addControl('HMIssueReportingId', this.formBuilder.control(this.issueApprovalModel.HMIssueReportingId));

      let hmIssueReportingId = this.issueApprovalForm.get('HMIssueReportingId').value;
      let approvalStatus = this.issueApprovalForm.get('ApprovalStatus').value;
      let remarks = this.issueApprovalForm.get('Remarks').value;

      this.approvalParams = {
        hmIssueReportingId: hmIssueReportingId,
        approvalStatus: approvalStatus,
        remarks: remarks
      }
      this.updateService = this.issueApprovalService.approvedHMIssueReporting(this.approvalParams);
    }
    else if (this.type == 'VC') {
      this.issueApprovalForm.addControl('VCIssueReportingId', this.formBuilder.control(this.issueApprovalModel.VCIssueReportingId));

      let vcIssueReportingId = this.issueApprovalForm.get('VCIssueReportingId').value;
      let approvalStatus = this.issueApprovalForm.get('ApprovalStatus').value;
      let remarks = this.issueApprovalForm.get('Remarks').value;

      this.approvalParams = {
        vcIssueReportingId: vcIssueReportingId,
        approvalStatus: approvalStatus,
        remarks: remarks
      }
      this.updateService = this.issueApprovalService.approvedVCIssueReporting(this.approvalParams);
    }
    else if (this.type == 'VT') {
      this.issueApprovalForm.addControl('VTIssueReportingId', this.formBuilder.control(this.issueApprovalModel.VTIssueReportingId));

      let vtIssueReportingId = this.issueApprovalForm.get('VTIssueReportingId').value;
      let approvalStatus = this.issueApprovalForm.get('ApprovalStatus').value;
      let remarks = this.issueApprovalForm.get('Remarks').value;

      this.approvalParams = {
        vtIssueReportingId: vtIssueReportingId,
        approvalStatus: approvalStatus,
        remarks: remarks
      }
      this.updateService = this.issueApprovalService.approvedVTIssueReporting(this.approvalParams);
    }

    this.updateService.subscribe((approvalResp: any) => {
      if (approvalResp.Success) {
        this.zone.run(() => {
          this.showActionMessage(
            this.Constants.Messages.RecordSavedMessage,
            this.Constants.Html.SuccessSnackbar
          );
          if (this.type == 'HM') {
            this.router.navigate([RouteConstants.HMIssueReporting.Approval]);
          }
          if (this.type == 'VC') {
            this.router.navigate([RouteConstants.VTIssueReporting.Approval]);
          }
          if (this.type == 'VT') {
            this.router.navigate([RouteConstants.VTIssueReporting.Approval]);
          }
        });
      }
      else {
        var errorMessages = this.getHtmlMessage(approvalResp.Errors.$values)
        this.dialogService.openShowDialog(errorMessages);
      }
    }, error => {
      console.log('HMIssueReporting deletion errors =>', error);
    });
  }

  //Create hmIssueReporting form and returns {FormGroup}
  createIssueApprovalForm(): FormGroup {
    return this.formBuilder.group({
      IssueReportDate: new FormControl({ value: new Date(this.issueApprovalModel.IssueReportDate), disabled: this.PageRights.IsReadOnly }, Validators.required),

      SchoolId: new FormControl({ value: this.issueApprovalModel.SchoolId, disabled: this.PageRights.IsReadOnly }),
      SectorId: new FormControl({ value: this.issueApprovalModel.SectorId, disabled: this.PageRights.IsReadOnly }),
      JobRoleId: new FormControl({ value: this.issueApprovalModel.JobRoleId, disabled: this.PageRights.IsReadOnly }),
      AcademicYearId: new FormControl({ value: this.issueApprovalModel.AcademicYearId, disabled: this.PageRights.IsReadOnly }),
      StudentClass: new FormControl({ value: this.issueApprovalModel.StudentClass, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SectionIds: new FormControl({ value: this.issueApprovalModel.SectionIds, disabled: this.PageRights.IsReadOnly }),
      MainIssue: new FormControl({ value: this.issueApprovalModel.MainIssue, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      SubIssue: new FormControl({ value: this.issueApprovalModel.SubIssue, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      Month: new FormControl({ value: this.issueApprovalModel.Month, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      StudentType: new FormControl({ value: this.issueApprovalModel.StudentType, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      NoOfStudents: new FormControl({ value: this.issueApprovalModel.NoOfStudents, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      IssueDetails: new FormControl({ value: this.issueApprovalModel.IssueDetails, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      ApprovalStatus: new FormControl({ value: this.issueApprovalModel.ApprovalStatus, disabled: false }, Validators.maxLength(50)),
      Remarks: new FormControl({ value: this.issueApprovalModel.Remarks, disabled: false }, Validators.maxLength(350)),
    });
  }
}
