import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { DataTypeService } from '../data-type.service';
import { DataTypeModel } from '../data-type.model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
@Component({
  standalone : true ,
  imports: [MatPaginatorModule,MatSelectModule,MatInputModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  selector: 'data-type',
  templateUrl: './create-data-type.component.html',
  styleUrls: ['./create-data-type.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateDataTypeComponent extends BaseComponent<DataTypeModel> implements OnInit {
  dataTypeForm: FormGroup;
  dataTypeModel: DataTypeModel;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private dataTypeService: DataTypeService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default dataType Model
    this.dataTypeModel = new DataTypeModel();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.keys.length > 0) {
        this.PageRights.ActionType = params.get('actionType');

        if (this.PageRights.ActionType == this.Constants.Actions.New) {
          this.dataTypeModel = new DataTypeModel();

        } else {
          var dataTypeId: string = params.get('dataTypeId')

          this.dataTypeService.getDataTypeById(dataTypeId)
            .subscribe((response: any) => {
              this.dataTypeModel = response.Result;

              if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                this.dataTypeModel.RequestType = this.Constants.PageType.Edit;
              else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                this.dataTypeModel.RequestType = this.Constants.PageType.View;
                this.PageRights.IsReadOnly = true;
              }

              this.dataTypeForm = this.createDataTypeForm();
            });
        }
      }
    });

    this.dataTypeForm = this.createDataTypeForm();
  }

  saveOrUpdateDataTypeDetails() {
    this.setValueFromFormGroup(this.dataTypeForm, this.dataTypeModel);

    this.dataTypeService.createOrUpdateDataType(this.dataTypeModel)
      .subscribe((dataTypeResp: any) => {

        if (dataTypeResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.DataType.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(dataTypeResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('DataType deletion errors =>', error);
      });
  }

  //Create dataType form and returns {FormGroup}
  createDataTypeForm(): FormGroup {
    return this.formBuilder.group({
      DataTypeId: new FormControl(this.dataTypeModel.DataTypeId),
      Name: new FormControl({ value: this.dataTypeModel.Name, disabled: this.PageRights.IsReadOnly }),
      Description: new FormControl({ value: this.dataTypeModel.Description, disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.dataTypeModel.IsActive, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
