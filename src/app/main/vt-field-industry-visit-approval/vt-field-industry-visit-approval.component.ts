import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VTFieldIndustryVisitConductedModel } from '../vt-field-industry-visit-conducteds/vt-field-industry-visit-conducted.model';
import { VTFieldIndustryVisitConductedService } from '../vt-field-industry-visit-conducteds/vt-field-industry-visit-conducted.service';
import { VTFieldIndustryVisitApprovalService } from './vt-field-industry-visit-approval.service';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  selector: 'data-list-view',
  templateUrl: './vt-field-industry-visit-approval.component.html',
  styleUrls: ['./vt-field-industry-visit-approval.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
})

export class VTFieldIndustryVisitApprovalComponent extends BaseListComponent<VTFieldIndustryVisitConductedModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    private vtFieldIndustryVisitConductedService: VTFieldIndustryVisitConductedService,
    private vtFieldIndustryVisitApprovalService: VTFieldIndustryVisitApprovalService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.vtFieldIndustryVisitConductedService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['ClassName', 'ReportingDate', 'FVOrganisation', 'FVContactPersonName', 'ApprovalStatus', 'ApprovedDate', 'Actions'];

      this.tableDataSource.data = response.Results.$values;
      this.tableDataSource.sort = this.ListSort;
      this.tableDataSource.paginator = this.ListPaginator;
      this.tableDataSource.filteredData = this.tableDataSource.data;

      this.zone.run(() => {
        if (this.tableDataSource.data.length == 0) {
          this.showNoDataFoundSnackBar();
        }
      });
      this.IsLoading = false;
    }, error => {
      console.log(error);
    });
  }

  saveOrUpdateVTFieldIndustryVisitApprovalDetails(actionType: string, vtFieldIndustryVisitConductedId: string) {
    let approvalParams = {
      VTFieldIndustryVisitConductedId : vtFieldIndustryVisitConductedId,
      ApprovalStatus: actionType
    };
    
    this.vtFieldIndustryVisitApprovalService.approvedVTFieldIndustryVisitConducted(approvalParams)
      .subscribe((vtFieldIndustryVisitConductedResp: any) => {

        if (vtFieldIndustryVisitConductedResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VTFieldIndustryVisitConducted.Approval]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vtFieldIndustryVisitConductedResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VTFieldIndustryVisitConducted deletion errors =>', error);
      });
  }

}
