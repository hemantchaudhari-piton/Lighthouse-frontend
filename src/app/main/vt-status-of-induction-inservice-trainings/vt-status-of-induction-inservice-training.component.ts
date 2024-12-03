import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VTStatusOfInductionInserviceTrainingModel } from './vt-status-of-induction-inservice-training.model';
import { VTStatusOfInductionInserviceTrainingService } from './vt-status-of-induction-inservice-training.service';
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
  templateUrl: './vt-status-of-induction-inservice-training.component.html',
  styleUrls: ['./vt-status-of-induction-inservice-training.component.scss'],
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,FuseSharedModule],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class VTStatusOfInductionInserviceTrainingComponent extends BaseListComponent<VTStatusOfInductionInserviceTrainingModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    private vtStatusOfInductionInserviceTrainingService: VTStatusOfInductionInserviceTrainingService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.vtStatusOfInductionInserviceTrainingService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['SchoolName', 'SectorName', 'DateOfAllocation', 'IndustryTrainingStatus', 'InserviceTrainingStatus', 'Actions'];

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

  onDeleteVTStatusOfInductionInserviceTraining(vtStatusOfInductionInserviceTrainingId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.vtStatusOfInductionInserviceTrainingService.deleteVTStatusOfInductionInserviceTrainingById(vtStatusOfInductionInserviceTrainingId)
            .subscribe((vtStatusOfInductionInserviceTrainingResp: any) => {

              this.zone.run(() => {
                if (vtStatusOfInductionInserviceTrainingResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('VTStatusOfInductionInserviceTraining deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }
}
