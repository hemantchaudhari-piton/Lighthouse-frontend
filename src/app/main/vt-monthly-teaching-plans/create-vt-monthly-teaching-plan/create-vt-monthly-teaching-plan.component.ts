import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VTMonthlyTeachingPlanService } from '../vt-monthly-teaching-plan.service';
import { VTMonthlyTeachingPlanModel } from '../vt-monthly-teaching-plan.model';
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
  selector: 'vt-monthly-teaching-plan',
  templateUrl: './create-vt-monthly-teaching-plan.component.html',
  styleUrls: ['./create-vt-monthly-teaching-plan.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,MatInputModule,MatSelectModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  animations: fuseAnimations
})
export class CreateVTMonthlyTeachingPlanComponent extends BaseComponent<VTMonthlyTeachingPlanModel> implements OnInit {
  vtMonthlyTeachingPlanForm: FormGroup;
  vtMonthlyTeachingPlanModel: VTMonthlyTeachingPlanModel;
  monthList: [DropdownModel];

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vtMonthlyTeachingPlanService: VTMonthlyTeachingPlanService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vtMonthlyTeachingPlan Model
    this.vtMonthlyTeachingPlanModel = new VTMonthlyTeachingPlanModel();
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
          this.vtMonthlyTeachingPlanModel = new VTMonthlyTeachingPlanModel();

        } else {
          var vtMonthlyTeachingPlanId: string = params.get('vtMonthlyTeachingPlanId')

          this.vtMonthlyTeachingPlanService.getVTMonthlyTeachingPlanById(vtMonthlyTeachingPlanId)
            .subscribe((response: any) => {
              this.vtMonthlyTeachingPlanModel = response.Result;

              if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                this.vtMonthlyTeachingPlanModel.RequestType = this.Constants.PageType.Edit;
              else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                this.vtMonthlyTeachingPlanModel.RequestType = this.Constants.PageType.View;
                this.PageRights.IsReadOnly = true;
              }

              this.vtMonthlyTeachingPlanForm = this.createVTMonthlyTeachingPlanForm();
            });
        }
      }
    });

    this.vtMonthlyTeachingPlanForm = this.createVTMonthlyTeachingPlanForm();
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vtMonthlyTeachingPlanForm.controls[controlName].setValue(null);
        this.vtMonthlyTeachingPlanModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vtMonthlyTeachingPlanForm.controls[controlName].setValue(isoDateString);
    this.vtMonthlyTeachingPlanModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateVTMonthlyTeachingPlanDetails() {
    if (!this.vtMonthlyTeachingPlanForm.valid) {
      this.validateAllFormFields(this.vtMonthlyTeachingPlanForm);  
      return;
    }
    this.formatAndSetDate(this.vtMonthlyTeachingPlanForm.get('WeekStartDate').value, 'WeekStartDate');
    this.formatAndSetDate(this.vtMonthlyTeachingPlanForm.get('WeekendDate').value, 'WeekendDate');
    this.formatAndSetDate(this.vtMonthlyTeachingPlanForm.get('IVPlannedDate').value, 'IVPlannedDate');
    this.formatAndSetDate(this.vtMonthlyTeachingPlanForm.get('FVPlannedDate').value, 'FVPlannedDate');
    this.formatAndSetDate(this.vtMonthlyTeachingPlanForm.get('GLPlannedDate').value, 'GLPlannedDate');
    this.setValueFromFormGroup(this.vtMonthlyTeachingPlanForm, this.vtMonthlyTeachingPlanModel);
    this.vtMonthlyTeachingPlanModel.VTId = this.UserModel.UserTypeId;

    this.vtMonthlyTeachingPlanService.createOrUpdateVTMonthlyTeachingPlan(this.vtMonthlyTeachingPlanModel)
      .subscribe((vtMonthlyTeachingPlanResp: any) => {

        if (vtMonthlyTeachingPlanResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VTMonthlyTeachingPlan.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vtMonthlyTeachingPlanResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VTMonthlyTeachingPlan deletion errors =>', error);
      });
  }

  //Create vtMonthlyTeachingPlan form and returns {FormGroup}
  createVTMonthlyTeachingPlanForm(): FormGroup {
    return this.formBuilder.group({
      VTMonthlyTeachingPlanId: new FormControl(this.vtMonthlyTeachingPlanModel.VTMonthlyTeachingPlanId),
      VTClassId: new FormControl({ value: this.vtMonthlyTeachingPlanModel.VTClassId, disabled: this.PageRights.IsReadOnly }),
      Month: new FormControl({ value: this.vtMonthlyTeachingPlanModel.Month, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(20)]),
      WeekStartDate: new FormControl({ value: new Date(this.vtMonthlyTeachingPlanModel.WeekStartDate), disabled: this.PageRights.IsReadOnly }, Validators.required),
      WeekendDate: new FormControl({ value: new Date(this.vtMonthlyTeachingPlanModel.WeekendDate), disabled: this.PageRights.IsReadOnly }, Validators.required),
      ModulesPlanned: new FormControl({ value: this.vtMonthlyTeachingPlanModel.ModulesPlanned, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(100)),
      IVPlannedDate: new FormControl({ value: this.getDateValue(this.vtMonthlyTeachingPlanModel.IVPlannedDate), disabled: this.PageRights.IsReadOnly }),
      IVVCAttend: new FormControl({ value: this.vtMonthlyTeachingPlanModel.IVVCAttend, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      FVPlannedDate: new FormControl({ value: this.getDateValue(this.vtMonthlyTeachingPlanModel.FVPlannedDate), disabled: this.PageRights.IsReadOnly }),
      FVPurpose: new FormControl({ value: this.vtMonthlyTeachingPlanModel.FVPurpose, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(150)),
      FVLocation: new FormControl({ value: this.vtMonthlyTeachingPlanModel.FVLocation, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(100)),
      GLPlannedDate: new FormControl({ value: this.getDateValue(this.vtMonthlyTeachingPlanModel.GLPlannedDate), disabled: this.PageRights.IsReadOnly }),
      OtherDetails: new FormControl({ value: this.vtMonthlyTeachingPlanModel.OtherDetails, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
    });
  }
}
