import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HMIssueReportingModel } from './hm-issue-reporting.model';
import { HMIssueReportingService } from './hm-issue-reporting.service';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
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
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  selector: 'data-list-view',
  templateUrl: './hm-issue-reporting.component.html',
  styleUrls: ['./hm-issue-reporting.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class HMIssueReportingComponent extends BaseListComponent<HMIssueReportingModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    private hmIssueReportingService: HMIssueReportingService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.hmIssueReportingService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['IssueReportDate', 'MainIssue', 'SubIssue', 'StudentType', 'NoOfStudents', 'ApprovalStatus', 'CreatedBy', 'UpdatedBy', 'Actions'];

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

  onDeleteHMIssueReporting(hmIssueReportingId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.hmIssueReportingService.deleteHMIssueReportingById(hmIssueReportingId)
            .subscribe((hmIssueReportingResp: any) => {

              this.zone.run(() => {
                if (hmIssueReportingResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('HMIssueReporting deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }
}
