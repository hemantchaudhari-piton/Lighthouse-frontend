import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VCDailyReportingService } from '../vc-daily-reporting.service';
import { VCDailyReportingModel } from '../vc-daily-reporting.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { VCLeaveModel } from '../vc-leave.model';
import { VCHolidayModel } from '../vc-holiday.model';
import { VCIndustryExposureVisitModel } from '../vc-industry-exposure-visit.model';
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
  selector: 'vc-daily-reporting',
  templateUrl: './create-vc-daily-reporting.component.html',
  styleUrls: ['./create-vc-daily-reporting.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatInputModule,MatSelectModule],
  animations: fuseAnimations
})
export class CreateVCDailyReportingComponent extends BaseComponent<VCDailyReportingModel> implements OnInit {
  vcDailyReportingForm: FormGroup;
  vcDailyReportingModel: VCDailyReportingModel;
  vocationalCoordinatorList: [DropdownModel];
  reportTypeList: [DropdownModel];
  workTypeList: [DropdownModel];
  industryLinkageList: [DropdownModel];
  leaveApproverList: [DropdownModel];
  schoolList: [DropdownModel];

  isAllowHoliday: boolean = false;
  isAllowLeave: boolean = false;
  isAllowSchool: boolean = false;
  isAllowIndustryExposureVisit: boolean = false;
  isAllowWorkDetails: boolean = false;
  holidayTypeList: any;
  observationDayList: any;
  leaveTypeList: any;
  leaveModeList: any;
  minReportingDate: Date;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vcDailyReportingService: VCDailyReportingService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vcDailyReporting Model
    this.vcDailyReportingModel = new VCDailyReportingModel();

    let dateOfAllocation = new Date(this.UserModel.DateOfAllocation);
    let maxDate = new Date(Date.now());

    let Time = maxDate.getTime() - dateOfAllocation.getTime();
    let Days = Math.floor(Time / (1000 * 3600 * 24));
    if (Days < this.Constants.BackDatedReportingDays) {
      this.minReportingDate = new Date(this.UserModel.DateOfAllocation);
    }
    else {
      let past7days = maxDate;
      past7days.setDate(past7days.getDate() - this.Constants.BackDatedReportingDays)
      this.minReportingDate = past7days;
    }
  }

  ngOnInit(): void {

    this.vcDailyReportingService.getDropdownForVCDailyReporting().subscribe(results => {
      if (results[0].Success) {
        this.reportTypeList = results[0].Results.$values;

        this.route.paramMap.subscribe(params => {
          if (params.keys.length > 0) {
            this.PageRights.ActionType = params.get('actionType');

            if (this.PageRights.ActionType == this.Constants.Actions.New) {
              this.vcDailyReportingModel = new VCDailyReportingModel();

            } else {
              var vcDailyReportingId: string = params.get('vcDailyReportingId')

              this.vcDailyReportingService.getVCDailyReportingById(vcDailyReportingId)
                .subscribe((response: any) => {
                  this.vcDailyReportingModel = response.Result;

                  if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                    this.vcDailyReportingModel.RequestType = this.Constants.PageType.Edit;
                  else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                    this.vcDailyReportingModel.RequestType = this.Constants.PageType.View;
                    this.PageRights.IsReadOnly = true;
                  }

                  this.vcDailyReportingForm = this.createVCDailyReportingForm();
                  this.onChangeReportType(this.vcDailyReportingModel.ReportType).then(response => {
                    if (this.vcDailyReportingModel.WorkingDayTypeIds !== null) {
                      const workingData = this.vcDailyReportingModel.WorkingDayTypeIds;
                      this.onChangeWorkingType(workingData['$values']);
                    }
                  });
                });
            }
          }
        });

      }
    });

    this.vcDailyReportingForm = this.createVCDailyReportingForm();
  }

  onChangeReportingDate(): boolean {
    let reportingDate = this.vcDailyReportingForm.get('ReportDate').value;

    if (reportingDate != null && new Date(reportingDate).getDay() == 0) {
      this.dialogService.openShowDialog("User cannot submit the VC Daily Reporting on Sunday");
      return false
    }

    return true
  }

  onChangeReportType(reportTypeId): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({ DataType: 'VCWorkType', ParentId: reportTypeId, SelectTitle: 'Working Day' }, false).subscribe((response: any) => {
        if (response.Success) {
          this.resetReportTypeFormGroups();

          // On Leave
          if (reportTypeId == 47) {
            this.isAllowLeave = true;
            this.vcDailyReportingModel.Leave = new VCLeaveModel(this.vcDailyReportingModel.Leave);

            this.vcDailyReportingForm = this.formBuilder.group({
              ...this.vcDailyReportingForm.controls,

              leaveGroup: this.formBuilder.group({
                LeaveTypeId: new FormControl({ value: this.vcDailyReportingModel.Leave.LeaveTypeId, disabled: this.PageRights.IsReadOnly }),
                LeaveModeId: new FormControl({ value: this.vcDailyReportingModel.Leave.LeaveModeId, disabled: this.PageRights.IsReadOnly }),
                LeaveApprovalStatus: new FormControl({ value: this.vcDailyReportingModel.Leave.LeaveApprovalStatus, disabled: this.PageRights.IsReadOnly }),
                LeaveApprover: new FormControl({ value: this.vcDailyReportingModel.Leave.LeaveApprover, disabled: this.PageRights.IsReadOnly }),
                LeaveReason: new FormControl({ value: this.vcDailyReportingModel.Leave.LeaveReason, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(350)]),
              })
            });

            this.leaveTypeList = response.Results.$values;
            this.onChangeLeaveApprovalStatus();
            this.commonService.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'VCLeaveApprover', SelectTitle: 'Leave Approver' }).subscribe((response) => {
              if (response.Success) {
                this.leaveApproverList = response.Results.$values;
              }
            });

            this.commonService.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'LeaveMode', SelectTitle: 'Leave Mode' }).subscribe((response) => {
              if (response.Success) {
                this.leaveModeList = response.Results.$values;
              }
            });
          }

          // Holiday/ School Off        
          else if (reportTypeId == 48) {
            this.isAllowHoliday = true;
            this.vcDailyReportingModel.Holiday = new VCHolidayModel(this.vcDailyReportingModel.Holiday);

            this.vcDailyReportingForm = this.formBuilder.group({
              ...this.vcDailyReportingForm.controls,

              holidayGroup: this.formBuilder.group({
                HolidayTypeId: new FormControl({ value: this.vcDailyReportingModel.Holiday.HolidayTypeId, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
                HolidayDetails: new FormControl({ value: this.vcDailyReportingModel.Holiday.HolidayDetails, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(250)),
              })
            });

            this.holidayTypeList = response.Results.$values;
          }

          else {
            this.vcDailyReportingForm.controls["WorkingDayTypeIds"].setValidators([Validators.required]);
            const selectedIds = this.vcDailyReportingForm.controls["WorkingDayTypeIds"].value.$values;
            this.vcDailyReportingForm.controls["WorkingDayTypeIds"].setValue(selectedIds);
            this.workTypeList = response.Results.$values;
          }

          this.onChangeReportingDate();
          resolve(true);
        }
      });

    });
    return promise;
  }

  onChangeWorkingType(workingTypes): void {
    this.resetWorkTypesFormGroups();

    workingTypes.forEach(workTypeId => {

      //1. Industry Exposure Visit
      if (workTypeId == '160') {
        this.isAllowIndustryExposureVisit = true;
        this.vcDailyReportingModel.IndustryExposureVisit = new VCIndustryExposureVisitModel(this.vcDailyReportingModel.IndustryExposureVisit);

        this.vcDailyReportingForm = this.formBuilder.group({
          ...this.vcDailyReportingForm.controls,

          industryExposureVisitGroup: this.formBuilder.group({
            TypeOfIndustryLinkage: new FormControl({ value: this.vcDailyReportingModel.IndustryExposureVisit.TypeOfIndustryLinkage, disabled: this.PageRights.IsReadOnly }),
            ContactPersonName: new FormControl({ value: this.vcDailyReportingModel.IndustryExposureVisit.ContactPersonName, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(50), Validators.pattern(this.Constants.Regex.CharsWithSpace)]),
            ContactPersonMobile: new FormControl({ value: this.vcDailyReportingModel.IndustryExposureVisit.ContactPersonMobile, disabled: this.PageRights.IsReadOnly }, [Validators.pattern(this.Constants.Regex.MobileNumber), Validators.minLength(10), Validators.maxLength(10)]),
            ContactPersonEmail: new FormControl({ value: this.vcDailyReportingModel.IndustryExposureVisit.ContactPersonEmail, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(100), Validators.pattern(this.Constants.Regex.Email)]),
          })
        });

        this.commonService.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'IndustryLinkageType', SelectTitle: 'Industry Linkage' }).subscribe((response) => {
          if (response.Success) {
            this.industryLinkageList = response.Results.$values;
          }
        });
      }
      //School
      else if (workTypeId == "153") {
        this.isAllowSchool = true;

        this.commonService.GetMasterDataByType({ DataType: 'Schools', UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: 'School' }).subscribe((response) => {
          if (response.Success) {
            this.schoolList = response.Results.$values;
          }
        });
      }

      //Work details
      if (workTypeId !== '160') {
        this.isAllowWorkDetails = true;
      }

      this.onChangeReportingDate();
    });

    if (this.PageRights.ActionType != this.Constants.Actions.View) {
      let initialFormValues = this.vcDailyReportingForm.value;
      this.vcDailyReportingForm.reset(initialFormValues);
    }
  }

  resetReportTypeFormGroups(): void {
    this.isAllowHoliday = false;
    this.isAllowLeave = false;
    this.isAllowWorkDetails = false;
    this.isAllowSchool = false;
    this.isAllowIndustryExposureVisit = false;

    if (this.PageRights.ActionType != this.Constants.Actions.View) {
      delete this.vcDailyReportingForm.controls['leaveGroup'];
      delete this.vcDailyReportingForm.value['leaveGroup'];
      delete this.vcDailyReportingForm.controls['holidayGroup'];
      delete this.vcDailyReportingForm.value['holidayGroup'];
      delete this.vcDailyReportingForm.controls['industryExposureVisitGroup'];
      delete this.vcDailyReportingForm.value['industryExposureVisitGroup'];
      this.vcDailyReportingForm.controls["WorkingDayTypeIds"].clearValidators();
      this.vcDailyReportingForm.controls["SchoolId"].clearValidators();
      this.vcDailyReportingForm.controls["WorkingDayTypeIds"].updateValueAndValidity();
      this.vcDailyReportingForm.controls["SchoolId"].updateValueAndValidity();
      let initialFormValues = this.vcDailyReportingForm.value;
      this.vcDailyReportingForm.reset(initialFormValues);
    }
  }

  resetWorkTypesFormGroups(): void {
    this.isAllowIndustryExposureVisit = false;
    this.isAllowSchool = false;
    this.isAllowWorkDetails = false;
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vcDailyReportingForm.controls[controlName].setValue(null);
        this.vcDailyReportingModel[controlName] = null;
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
    this.vcDailyReportingForm.controls[controlName].setValue(isoDateString);
    this.vcDailyReportingModel[controlName] = isoDateString;
}

formatDate(date: Date): string {
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('000' + date.getMilliseconds()).slice(-3)}Z`;
}
  saveOrUpdateVCDailyReportingDetails() {
    if (!this.vcDailyReportingForm.valid) {
      this.validateAllFormFields(this.vcDailyReportingForm);
      return;
    }

    if (!this.onChangeReportingDate()) {
      return;
    }
    this.formatAndSetDate(this.vcDailyReportingForm.get('ReportDate').value, 'ReportDate');
   

    this.vcDailyReportingModel = this.vcDailyReportingService.getVCDailyReportingModelFromFormGroup(this.vcDailyReportingForm);
    this.vcDailyReportingModel.ReportDate = this.vcDailyReportingForm.get('ReportDate').value;
    // this.vcDailyReportingModel.ReportDate = this.DateFormatPipe.transform(this.vcDailyReportingForm.get("ReportDate").value, this.Constants.ServerDateFormat);
    this.vcDailyReportingModel.VCId = this.UserModel.UserTypeId;

    this.vcDailyReportingService.createOrUpdateVCDailyReporting(this.vcDailyReportingModel)
      .subscribe((vcDailyReportingResp: any) => {

        if (vcDailyReportingResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VCDailyReporting.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vcDailyReportingResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VCDailyReporting deletion errors =>', error);
      });
  }

  //Create vcDailyReporting form and returns {FormGroup}
  createVCDailyReportingForm(): FormGroup {
    return this.formBuilder.group({
      VCDailyReportingId: new FormControl(this.vcDailyReportingModel.VCDailyReportingId),
      VCId: new FormControl({ value: this.vcDailyReportingModel.VCId ,disabled : true }),
      ReportDate: new FormControl({ value: new Date(this.vcDailyReportingModel.ReportDate), disabled: this.PageRights.IsReadOnly }, Validators.required),
      ReportType: new FormControl({ value: this.vcDailyReportingModel.ReportType, disabled: this.PageRights.IsReadOnly }, Validators.required),
      WorkingDayTypeIds: new FormControl({ value: this.vcDailyReportingModel.WorkingDayTypeIds, disabled: this.PageRights.IsReadOnly }),
      SchoolId: new FormControl({ value: this.vcDailyReportingModel.SchoolId, disabled: this.PageRights.IsReadOnly }),
      WorkTypeDetails: new FormControl({ value: this.vcDailyReportingModel.WorkTypeDetails, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(350)),
    });
  }
  private onChangeLeaveApprovalStatus() {
    this.vcDailyReportingForm.controls.leaveGroup.get('LeaveApprovalStatus').valueChanges
      .subscribe(leaveApprovalStatusId => {

        if (leaveApprovalStatusId == 'Yes') {
          this.vcDailyReportingForm.controls.leaveGroup.get("LeaveApprover").setValidators([Validators.required]);
        }
        else {
          this.vcDailyReportingForm.controls.leaveGroup.get("LeaveApprover").clearValidators();
        }

        this.vcDailyReportingForm.controls.leaveGroup.get("LeaveApprover").updateValueAndValidity();
      });
  }
}
