import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { BlockService } from '../block.service';
import { BlockModel } from '../block.model';
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
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatInputModule,MatSelectModule],
  selector: 'block',
  templateUrl: './create-block.component.html',
  styleUrls: ['./create-block.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateBlockComponent extends BaseComponent<BlockModel> implements OnInit {
  blockForm: FormGroup;
  blockModel: BlockModel;
  divisionList: [DropdownModel];
  districtList: [DropdownModel];

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private blockService: BlockService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default district Model
    this.blockModel = new BlockModel();
  }

  ngOnInit(): void {
    this.commonService.GetMasterDataByType({ DataType: 'Divisions', ParentId: this.Constants.DefaultStateId, SelectTitle: 'Division' }).subscribe((response: any) => {
      this.divisionList = response.Results.$values;

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.blockModel = new BlockModel();

          } else {
            var blockId: string = params.get('blockId')

            this.blockService.getBlockById(blockId)
              .subscribe((response: any) => {
                this.blockModel = response.Result;

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.blockModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.blockModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }

                this.onChangeDivision(this.blockModel.DivisionId);
                this.blockForm = this.createBlockForm();
              });
          }
        }
      });
    });

    this.blockForm = this.createBlockForm();
  }


  onChangeDivision(divisionId: any) {
    this.commonService.GetMasterDataByType({ DataType: 'Districts', UserId: this.Constants.DefaultStateId, ParentId: divisionId, SelectTitle: 'District' }).subscribe((response: any) => {
      this.districtList = response.Results.$values;
    });
  }

  saveOrUpdateBlockDetails() {
    this.setValueFromFormGroup(this.blockForm, this.blockModel);

    this.blockService.createOrUpdateBlock(this.blockModel)
      .subscribe((blockResp: any) => {

        if (blockResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.Block.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(blockResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('Block deletion errors =>', error);
      });
  }

  //Create district form and returns {FormGroup}
  createBlockForm(): FormGroup {
    return this.formBuilder.group({
      BlockId: new FormControl(this.blockModel.BlockId),
      DivisionId: new FormControl({ value: this.blockModel.DivisionId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      DistrictId: new FormControl({ value: this.blockModel.DistrictId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      BlockName: new FormControl({ value: this.blockModel.BlockName, disabled: this.PageRights.IsReadOnly }, Validators.required),
      Description: new FormControl({ value: this.blockModel.Description, disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.blockModel.IsActive, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
