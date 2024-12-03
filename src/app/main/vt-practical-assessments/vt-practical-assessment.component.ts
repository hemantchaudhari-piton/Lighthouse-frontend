import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VTPracticalAssessmentModel } from './vt-practical-assessment.model';
import { VTPracticalAssessmentService } from './vt-practical-assessment.service';
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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  selector: 'data-list-view',
  templateUrl: './vt-practical-assessment.component.html',
  styleUrls: ['./vt-practical-assessment.component.scss'],
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,MatInputModule,MatSelectModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,FuseSharedModule],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class VTPracticalAssessmentComponent extends BaseListComponent<VTPracticalAssessmentModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    private vtPracticalAssessmentService: VTPracticalAssessmentService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.vtPracticalAssessmentService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['ClassName', 'AssessmentDate', 'BoysPresent', 'GirlsPresent', 'AssessorName', 'AssessorMobile', 'AssessorEmail', 'Actions'];

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

  onDeleteVTPracticalAssessment(vtPracticalAssessmentId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.vtPracticalAssessmentService.deleteVTPracticalAssessmentById(vtPracticalAssessmentId)
            .subscribe((vtPracticalAssessmentResp: any) => {

              this.zone.run(() => {
                if (vtPracticalAssessmentResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('VTPracticalAssessment deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }
}
