import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VTIssueApprovalService } from './vt-issue-approval.service';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { VTIssueReportingModel } from '../vt-issue-reportings/vt-issue-reporting.model';
import { VTIssueReportingService } from '../vt-issue-reportings/vt-issue-reporting.service';
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
  templateUrl: './vt-issue-approval.component.html',
  styleUrls: ['./vt-issue-approval.component.scss'],
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class VTIssueApprovalComponent extends BaseListComponent<VTIssueReportingModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private vtIssueReportingService: VTIssueReportingService,
    private vtIssueApprovalService: VTIssueApprovalService) {
    super(commonService, router, route, snackBar, zone);
  }

  ngOnInit(): void {
    this.SearchBy.RoleId = this.UserModel.RoleCode;
    this.vtIssueReportingService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['IssueReportDate', 'MainIssue', 'StudentClass', 'StudentType', 'NoOfStudents', 'IssueDetails', 'ApprovalStatus', 'ApprovedDate', 'IsActive', 'Actions'];

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

  saveOrUpdateVTIssueApprovalDetails(actionType: string, vtIssueReportingId: string) {

    let approvalParams = {
      VTIssueReportingId: vtIssueReportingId,
      ApprovalStatus: actionType
    };

    this.vtIssueApprovalService.approvedVTIssueReporting(approvalParams)
      .subscribe((vtIssueReportingResp: any) => {

        if (vtIssueReportingResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VTIssueReporting.Approval]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vtIssueReportingResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VTIssueReporting deletion errors =>', error);
      });
  }

}
