import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { BroadcastMessagesService } from '../broadcast-messages.service';
import { BroadcastMessagesModel } from '../broadcast-messages.model';
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
  imports: [MatPaginatorModule,MatInputModule,MatSelectModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  selector: 'broadcast-messages',
  templateUrl: './create-broadcast-messages.component.html',
  styleUrls: ['./create-broadcast-messages.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateBroadcastMessagesComponent extends BaseComponent<BroadcastMessagesModel> implements OnInit {
  broadcastMessagesForm: FormGroup;
  broadcastMessagesModel: BroadcastMessagesModel;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private broadcastMessagesService: BroadcastMessagesService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default BroadcastMessages Model
    this.broadcastMessagesModel = new BroadcastMessagesModel();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.keys.length > 0) {
        this.PageRights.ActionType = params.get('actionType');

        if (this.PageRights.ActionType == this.Constants.Actions.New) {
          this.broadcastMessagesModel = new BroadcastMessagesModel();

        } else {

          var broadcastMessageId: string = params.get('broadcastMessagesId');

          this.broadcastMessagesService.getBroadcastMessagesById(broadcastMessageId)
            .subscribe((response: any) => {
              this.broadcastMessagesModel = response.Result;
              this.broadcastMessagesModel.ApplicableFor = response.Result.ApplicableFor.split(',');

              if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                this.broadcastMessagesModel.RequestType = this.Constants.PageType.Edit;
              else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                this.broadcastMessagesModel.RequestType = this.Constants.PageType.View;
                this.PageRights.IsReadOnly = true;
              }

              this.broadcastMessagesForm = this.createBroadcastMessagesForm();
            });
        }
      }
    });

    this.broadcastMessagesForm = this.createBroadcastMessagesForm();
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.broadcastMessagesForm.controls[controlName].setValue(null);
        this.broadcastMessagesModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.broadcastMessagesForm.controls[controlName].setValue(isoDateString);
    this.broadcastMessagesModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateBroadcastMessagesDetails() {
    if (!this.broadcastMessagesForm.valid) {
      this.validateAllFormFields(this.broadcastMessagesForm);  
      return;
    }
    var applicableFor = this.broadcastMessagesForm.get('ApplicableFor').value;
    this.formatAndSetDate(this.broadcastMessagesForm.get('FromDate').value, 'FromDate');
    this.formatAndSetDate(this.broadcastMessagesForm.get('ToDate').value, 'ToDate');
    
    this.setValueFromFormGroup(this.broadcastMessagesForm, this.broadcastMessagesModel);
    this.broadcastMessagesModel.ApplicableFor = applicableFor.join(',');

    this.broadcastMessagesService.createOrUpdateBroadcastMessages(this.broadcastMessagesModel)
      .subscribe((broadcastMessagesResp: any) => {

        if (broadcastMessagesResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.BroadcastMessages.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(broadcastMessagesResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('Broadcast Messages deletion errors =>', error);
      });
  }

  //Create Broadcast Messages form and returns {FormGroup}
  createBroadcastMessagesForm(): FormGroup {
    return this.formBuilder.group({
      BroadcastMessageId: new FormControl(this.broadcastMessagesModel.BroadcastMessageId),
      MessageText: new FormControl({ value: this.broadcastMessagesModel.MessageText, disabled: this.PageRights.IsReadOnly }, Validators.required),
      FromDate: new FormControl({ value: new Date(this.broadcastMessagesModel.FromDate), disabled: this.PageRights.IsReadOnly }),
      ToDate: new FormControl({ value: new Date(this.broadcastMessagesModel.ToDate), disabled: this.PageRights.IsReadOnly }),
      ApplicableFor: new FormControl({ value: this.broadcastMessagesModel.ApplicableFor, disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.broadcastMessagesModel.IsActive, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
