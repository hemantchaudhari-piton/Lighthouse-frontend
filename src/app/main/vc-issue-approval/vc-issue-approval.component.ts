import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VCIssueReportingModel } from '../vc-issue-reportings/vc-issue-reporting.model';
import { VCIssueReportingService } from '../vc-issue-reportings/vc-issue-reporting.service';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import {VCIssueApprovalService} from './vc-issue-approval.service';
import { RouteConstants } from 'app/constants/route.constant';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FuseSharedModule } from '@fuse/shared.module';

@Component({
  selector: 'data-list-view',
  templateUrl: './vc-issue-approval.component.html',
  styleUrls: ['./vc-issue-approval.component.scss'],
  animations: fuseAnimations,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatInputModule],
  encapsulation: ViewEncapsulation.None
})

export class VCIssueApprovalComponent extends BaseListComponent<VCIssueReportingModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    private vcIssueReportingService: VCIssueReportingService,
    private vcIssueApprovalService:VCIssueApprovalService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.vcIssueReportingService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['DateOfAllocation', 'IssueReportDate', 'MainIssue', 'StudentClass', 'StudentType', 'NoOfStudents', 'IssueDetails', 'ApprovalStatus', 'ApprovedDate', 'IsActive', 'Actions'];

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

  saveOrUpdateVCIssueApprovalDetails(actionType: string, vcIssueReportingId: string) {

    let approvalParams = {
      VCIssueReportingId: vcIssueReportingId,

      ApprovalStatus: actionType
    };
      
    this.vcIssueApprovalService.approvedVCIssueReporting(approvalParams)
      .subscribe((vcIssueReportingResp: any) => {

        if (vcIssueReportingResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VCIssueReporting.Approval]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vcIssueReportingResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VCIssueReporting deletion errors =>', error);
      });
  }

  
}
