import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IssueApprovalModel } from './issue-approval.model';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { IssueApprovalService } from './issue-approval.service';
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
  templateUrl: './issue-approval.component.html',
  styleUrls: ['./issue-approval.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class IssueApprovalComponent extends BaseListComponent<IssueApprovalModel> implements OnInit {
  issueType: any;
  currentUrl: string = null;
  service: any;
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private issueApprovalService: IssueApprovalService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    if (this.currentUrl == '/vt-issue-approval') {
      this.issueType = 'VT';
    }
    else if (this.currentUrl == '/vc-issue-approval') {
      this.issueType = 'VC';
    }
    else if (this.currentUrl == '/hm-issue-approval') {
      this.issueType = 'HM';
    }

    var criteria =
    {
      UserId: this.UserModel.LoginId,
      UserTypeId: this.UserModel.UserTypeId,
      Name: null,
      CharBy: null,
      Filter: {},
      SortOrder: 'asc',
      PageIndex: 1,
      PageSize: 10000,
      ReportedBy: this.issueType,
    };

    this.issueApprovalService.GetAllByCriteria(criteria).subscribe(response => {
      this.displayedColumns = ['IssueReportDate', 'ReportedBy', 'IssueCategory', 'MainIssue', 'SubIssue', 'ApprovalStatus', 'ApprovedDate', 'CreatedBy', 'UpdatedBy', 'Actions'];

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
}
