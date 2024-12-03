import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VTPMonthlyBillSubmissionStatusModel } from './vtp-monthly-bill-submission-status.model';
import { VTPMonthlyBillSubmissionStatusService } from './vtp-monthly-bill-submission-status.service';
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
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  selector: 'data-list-view',
  templateUrl: './vtp-monthly-bill-submission-status.component.html',
  styleUrls: ['./vtp-monthly-bill-submission-status.component.scss'],
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,FuseSharedModule],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class VTPMonthlyBillSubmissionStatusComponent extends BaseListComponent<VTPMonthlyBillSubmissionStatusModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    private vtpMonthlyBillSubmissionStatusService: VTPMonthlyBillSubmissionStatusService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.vtpMonthlyBillSubmissionStatusService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['VCName', 'DateSubmission', 'Incorrect', 'IncorrectDetails', 'Final', 'ApprovedPMU', 'Actions'];

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

  onDeleteVTPMonthlyBillSubmissionStatus(vtpMonthlyBillSubmissionStatusId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.vtpMonthlyBillSubmissionStatusService.deleteVTPMonthlyBillSubmissionStatusById(vtpMonthlyBillSubmissionStatusId)
            .subscribe((vtpMonthlyBillSubmissionStatusResp: any) => {

              this.zone.run(() => {
                if (vtpMonthlyBillSubmissionStatusResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('VTPMonthlyBillSubmissionStatus deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }
}
