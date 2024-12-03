import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VTGuestLectureConductedModel } from '../vt-guest-lecture-conducteds/vt-guest-lecture-conducted.model';
import { VTGuestLectureConductedService } from '../vt-guest-lecture-conducteds/vt-guest-lecture-conducted.service';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { VTGuestLectureApprovalService } from './vt-guest-lecture-approval.service';
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
  templateUrl: './vt-guest-lecture-approval.component.html',
  styleUrls: ['./vt-guest-lecture-approval.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
})

export class VTGuestLectureApprovalComponent extends BaseListComponent<VTGuestLectureConductedModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    private vtGuestLectureConductedService: VTGuestLectureConductedService,
    private vtGuestLectureApprovalService: VTGuestLectureApprovalService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.vtGuestLectureConductedService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['ClassName', 'ReportingDate', 'GLType', 'GLTopic', 'GLName', 'ApprovalStatus', 'ApprovedDate', 'Actions'];

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

  saveOrUpdateVTGuestLectureApprovalDetails(actionType: string, VTGuestLectureId: string) {

    let approvalParams = {
      VTGuestLectureId: VTGuestLectureId,

      ApprovalStatus: actionType
    };

    this.vtGuestLectureApprovalService.approvedVTGuestLectureConducted(approvalParams)
      .subscribe((vtGuestLectureConductedResp: any) => {

        if (vtGuestLectureConductedResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VTGuestLectureConducted.Approval]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vtGuestLectureConductedResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VTGuestLectureConducted deletion errors =>', error);
      });
  }


}
