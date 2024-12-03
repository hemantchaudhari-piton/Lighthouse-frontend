import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VCSchoolVisitService } from '../vc-school-visit.service';
import { VCSchoolVisitModel } from '../vc-school-visit.model';
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
  selector: 'vc-school-visit',
  templateUrl: './create-vc-school-visit.component.html',
  styleUrls: ['./create-vc-school-visit.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,MatInputModule,MatSelectModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  animations: fuseAnimations
})
export class CreateVCSchoolVisitComponent extends BaseComponent<VCSchoolVisitModel> implements OnInit {
  vcSchoolVisitForm: FormGroup;
  vcSchoolVisitModel: VCSchoolVisitModel;
  monthList: [DropdownModel];
  minReportingDate: Date;
  
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vcSchoolVisitService: VCSchoolVisitService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vcSchoolVisit Model
    this.vcSchoolVisitModel = new VCSchoolVisitModel();
    this.minReportingDate = new Date(this.UserModel.DateOfAllocation);
  }

  ngOnInit(): void {
    this.commonService.GetMasterDataByType({DataType: 'DataValues', ParentId: 'Months', SelectTitle: 'Month'}).subscribe((response) => {
      if (response.Success) {
        this.monthList = response.Results.$values;
      }
    });

    this.route.paramMap.subscribe(params => {
      if (params.keys.length > 0) {
        this.PageRights.ActionType = params.get('actionType');

        if (this.PageRights.ActionType == this.Constants.Actions.New) {
          this.vcSchoolVisitModel = new VCSchoolVisitModel();

        } else {
          var vcSchoolVisitId: string = params.get('vcSchoolVisitId')

          this.vcSchoolVisitService.getVCSchoolVisitById(vcSchoolVisitId)
            .subscribe((response: any) => {
              this.vcSchoolVisitModel = response.Result;

              if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                this.vcSchoolVisitModel.RequestType = this.Constants.PageType.Edit;
              else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                this.vcSchoolVisitModel.RequestType = this.Constants.PageType.View;
                this.PageRights.IsReadOnly = true;
              }

              this.vcSchoolVisitForm = this.createVCSchoolVisitForm();
            });
        }
      }
    });

    this.vcSchoolVisitForm = this.createVCSchoolVisitForm();
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vcSchoolVisitForm.controls[controlName].setValue(null);
        this.vcSchoolVisitModel[controlName] = null;
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
    this.vcSchoolVisitForm.controls[controlName].setValue(isoDateString);
    this.vcSchoolVisitModel[controlName] = isoDateString;
}

formatDate(date: Date): string {
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('000' + date.getMilliseconds()).slice(-3)}Z`;
}
  saveOrUpdateVCSchoolVisitDetails() {
    if (!this.vcSchoolVisitForm.valid) {
      this.validateAllFormFields(this.vcSchoolVisitForm);  
      return;
    }
    this.formatAndSetDate(this.vcSchoolVisitForm.get('ReportDate').value, 'ReportDate');
    this.formatAndSetDate(this.vcSchoolVisitForm.get('CMDate').value, 'CMDate');
    this.formatAndSetDate(this.vcSchoolVisitForm.get('TEDate').value, 'TEDate');
    this.setValueFromFormGroup(this.vcSchoolVisitForm, this.vcSchoolVisitModel);
    this.vcSchoolVisitModel.VCId = this.UserModel.UserTypeId;

    this.vcSchoolVisitService.createOrUpdateVCSchoolVisit(this.vcSchoolVisitModel)
      .subscribe((vcSchoolVisitResp: any) => {

        if (vcSchoolVisitResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VCSchoolVisit.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vcSchoolVisitResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VCSchoolVisit deletion errors =>', error);
      });
  }

  //Create vcSchoolVisit form and returns {FormGroup}
  createVCSchoolVisitForm(): FormGroup {
    return this.formBuilder.group({
      VCSchoolVisitId: new FormControl(this.vcSchoolVisitModel.VCSchoolVisitId),
      VCSchoolSectorId: new FormControl({ value: this.vcSchoolVisitModel.VCSchoolSectorId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      ReportDate: new FormControl({ value: new Date(this.vcSchoolVisitModel.ReportDate), disabled: this.PageRights.IsReadOnly }),
      GeoLocation: new FormControl({ value: this.vcSchoolVisitModel.GeoLocation, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      Month: new FormControl({ value: this.vcSchoolVisitModel.Month, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(50)]),
      VTReportSubmitted: new FormControl({ value: this.vcSchoolVisitModel.VTReportSubmitted, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      VTWorkingDays: new FormControl({ value: this.vcSchoolVisitModel.VTWorkingDays, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      VTLeaveDays: new FormControl({ value: this.vcSchoolVisitModel.VTLeaveDays, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      VTTeachingDays: new FormControl({ value: this.vcSchoolVisitModel.VTTeachingDays, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      ClassVisited: new FormControl({ value: this.vcSchoolVisitModel.ClassVisited, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(50)]),
      ClassTeachingDays: new FormControl({ value: this.vcSchoolVisitModel.ClassTeachingDays, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      BoysEnrolledCheck: new FormControl({ value: this.vcSchoolVisitModel.BoysEnrolledCheck, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      GirlsEnrolledCheck: new FormControl({ value: this.vcSchoolVisitModel.GirlsEnrolledCheck, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      AvgStudentAttendance: new FormControl({ value: this.vcSchoolVisitModel.AvgStudentAttendance, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      CMAvailability: new FormControl({ value: this.vcSchoolVisitModel.CMAvailability, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      CMDate: new FormControl({ value: new Date(this.vcSchoolVisitModel.CMDate), disabled: this.PageRights.IsReadOnly }),
      TEAvailability: new FormControl({ value: this.vcSchoolVisitModel.TEAvailability, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      TEDate: new FormControl({ value: new Date(this.vcSchoolVisitModel.TEDate), disabled: this.PageRights.IsReadOnly }),
      NoOfGLConducted: new FormControl({ value: this.vcSchoolVisitModel.NoOfGLConducted, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      NoOfFVConducted: new FormControl({ value: this.vcSchoolVisitModel.NoOfFVConducted, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      SchoolHMVisited: new FormControl({ value: this.vcSchoolVisitModel.SchoolHMVisited, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      HMRatingVTattendance: new FormControl({ value: this.vcSchoolVisitModel.HMRatingVTattendance, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      HMRatingSyllabuscompletion: new FormControl({ value: this.vcSchoolVisitModel.HMRatingSyllabuscompletion, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      HMRatingVtreporting: new FormControl({ value: this.vcSchoolVisitModel.HMRatingVtreporting, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      HMRatingVtqualityteaching: new FormControl({ value: this.vcSchoolVisitModel.HMRatingVtqualityteaching, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      HMRatingVtglfvquality: new FormControl({ value: this.vcSchoolVisitModel.HMRatingVtglfvquality, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      HMRatingInitiativestaken: new FormControl({ value: this.vcSchoolVisitModel.HMRatingInitiativestaken, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
    });
  }
}
