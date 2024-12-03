import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { ClusterService } from '../cluster.service';
import { ClusterModel } from '../cluster.model';
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
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatInputModule,MatSelectModule],
  selector: 'cluster',
  templateUrl: './create-cluster.component.html',
  styleUrls: ['./create-cluster.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateClusterComponent extends BaseComponent<ClusterModel> implements OnInit {
  clusterForm: FormGroup;
  clusterModel: ClusterModel;
  districtList: any;
  divisionList: any;
  blockList: any;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private clusterService: ClusterService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default district Model
    this.clusterModel = new ClusterModel();
  }

  ngOnInit(): void {
    this.commonService.GetMasterDataByType({ DataType: 'Divisions', ParentId: this.Constants.DefaultStateId, SelectTitle: 'Division' }).subscribe((response: any) => {
      this.divisionList = response.Results.$values;

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.clusterModel = new ClusterModel();

          } else {
            var clusterId: string = params.get('clusterId')

            this.clusterService.getClusterById(clusterId)
              .subscribe((response: any) => {
                this.clusterModel = response.Result;

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.clusterModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.clusterModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }
                this.onChangeDivision(this.clusterModel.DivisionId);
                this.onChangeDistrict(this.clusterModel.DistrictId);
                this.clusterForm = this.createClusterForm();
              });
          }
        }
      });
    });

    this.clusterForm = this.createClusterForm();
  }

  onChangeDivision(divisionId: any) {
    this.commonService.GetMasterDataByType({ DataType: 'Districts', UserId: this.Constants.DefaultStateId, ParentId: divisionId, SelectTitle: 'District' }).subscribe((response: any) => {
      this.districtList = response.Results.$values;
    });
  }

  onChangeDistrict(districtId: any) {
    this.commonService.GetMasterDataByType({ DataType: 'Blocks', UserId: this.Constants.DefaultStateId, ParentId: districtId, SelectTitle: 'Block' }).subscribe((response: any) => {
      this.blockList = response.Results.$values;
    });
  }

  saveOrUpdateClusterDetails() {
    this.setValueFromFormGroup(this.clusterForm, this.clusterModel);

    this.clusterService.createOrUpdateCluster(this.clusterModel)
      .subscribe((clusterResp: any) => {

        if (clusterResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.Cluster.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(clusterResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('Cluster deletion errors =>', error);
      });
  }

  //Create district form and returns {FormGroup}
  createClusterForm(): FormGroup {
    return this.formBuilder.group({
      ClusterId: new FormControl(this.clusterModel.ClusterId),
      DivisionId: new FormControl({ value: this.clusterModel.DivisionId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      DistrictId: new FormControl({ value: this.clusterModel.DistrictId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      BlockId: new FormControl({ value: this.clusterModel.BlockId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      ClusterName: new FormControl({ value: this.clusterModel.ClusterName, disabled: this.PageRights.IsReadOnly }, Validators.required),
      Description: new FormControl({ value: this.clusterModel.Description, disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.clusterModel.IsActive, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
