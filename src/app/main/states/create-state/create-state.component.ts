import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { StateService } from '../state.service';
import { StateModel } from '../state.model';
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
  selector: 'state',
  templateUrl: './create-state.component.html',
  styleUrls: ['./create-state.component.scss'],
  encapsulation: ViewEncapsulation.None, standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatInputModule,MatSelectModule],
  animations: fuseAnimations
})
export class CreateStateComponent extends BaseComponent<StateModel> implements OnInit {
  stateForm: FormGroup;
  stateModel: StateModel;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private stateService: StateService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default state Model
    this.stateModel = new StateModel();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.keys.length > 0) {
        this.PageRights.ActionType = params.get('actionType');

        if (this.PageRights.ActionType == this.Constants.Actions.New) {
          this.stateModel = new StateModel();

        } else {
          var stateCode: string = params.get('stateCode')

          this.stateService.getStateById(stateCode)
            .subscribe((response: any) => {
              this.stateModel = response.Result;

              if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                this.stateModel.RequestType = this.Constants.PageType.Edit;
              else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                this.stateModel.RequestType = this.Constants.PageType.View;
                this.PageRights.IsReadOnly = true;
              }

              this.stateForm = this.createStateForm();
            });
        }
      }
    });

    this.stateForm = this.createStateForm();
  }

  saveOrUpdateStateDetails() {
    this.setValueFromFormGroup(this.stateForm, this.stateModel);

    this.stateService.createOrUpdateState(this.stateModel)
      .subscribe((stateResp: any) => {

        if (stateResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.State.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(stateResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('State deletion errors =>', error);
      });
  }

  //Create state form and returns {FormGroup}
  createStateForm(): FormGroup {
    return this.formBuilder.group({
      StateCode: new FormControl(this.stateModel.StateCode),
      StateId: new FormControl({ value: this.stateModel.StateId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      CountryCode: new FormControl({ value: this.stateModel.CountryCode, disabled: this.PageRights.IsReadOnly }, Validators.required),
      StateName: new FormControl({ value: this.stateModel.StateName, disabled: this.PageRights.IsReadOnly }, Validators.required),
      Description: new FormControl({ value: this.stateModel.Description, disabled: this.PageRights.IsReadOnly }),
      SequenceNo: new FormControl({ value: this.stateModel.SequenceNo, disabled: this.PageRights.IsReadOnly }, Validators.required),
      IsActive: new FormControl({ value: this.stateModel.IsActive, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
