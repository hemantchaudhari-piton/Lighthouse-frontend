import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { TermsConditionService } from '../terms-condition.service';
import { TermsConditionModel } from '../terms-condition.model';
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
  selector: 'terms-condition',
  templateUrl: './create-terms-condition.component.html',
  styleUrls: ['./create-terms-condition.component.scss'],standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,MatInputModule,MatSelectModule,RouterModule,ReactiveFormsModule,CommonModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateTermsConditionComponent extends BaseComponent<TermsConditionModel> implements OnInit {
  termsConditionForm: FormGroup;
  termsConditionModel: TermsConditionModel;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private termsConditionService: TermsConditionService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default termsCondition Model
    this.termsConditionModel = new TermsConditionModel();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.keys.length > 0) {
        this.PageRights.ActionType = params.get('actionType');

        if (this.PageRights.ActionType == this.Constants.Actions.New) {
          this.termsConditionModel = new TermsConditionModel();

        } else {
          var termsConditionId: string = params.get('termsConditionId')

          this.termsConditionService.getTermsConditionById(termsConditionId)
            .subscribe((response: any) => {
              this.termsConditionModel = response.Result;

              if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                this.termsConditionModel.RequestType = this.Constants.PageType.Edit;
              else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                this.termsConditionModel.RequestType = this.Constants.PageType.View;
                this.PageRights.IsReadOnly = true;
              }

              this.termsConditionForm = this.createTermsConditionForm();
            });
        }
      }
    });

    this.termsConditionForm = this.createTermsConditionForm();
  }

  saveOrUpdateTermsConditionDetails() {
    this.setValueFromFormGroup(this.termsConditionForm, this.termsConditionModel);

    this.termsConditionService.createOrUpdateTermsCondition(this.termsConditionModel)
      .subscribe((termsConditionResp: any) => {

        if (termsConditionResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.TermsCondition.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(termsConditionResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('TermsCondition deletion errors =>', error);
      });
  }

  //Create termsCondition form and returns {FormGroup}
  createTermsConditionForm(): FormGroup {
    return this.formBuilder.group({
      TermsConditionId: new FormControl(this.termsConditionModel.TermsConditionId),
      Name: new FormControl({ value: this.termsConditionModel.Name, disabled: this.PageRights.IsReadOnly }, Validators.required),
      Description: new FormControl({ value: this.termsConditionModel.Description, disabled: this.PageRights.IsReadOnly }, Validators.required),
      ApplicableFrom: new FormControl({ value: this.termsConditionModel.ApplicableFrom, disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.termsConditionModel.IsActive, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
