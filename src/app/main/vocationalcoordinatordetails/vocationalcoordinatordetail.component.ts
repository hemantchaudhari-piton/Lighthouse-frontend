import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VocationalcoordinatordetailModel } from './vocationalcoordinatordetail.model';
import { VocationalcoordinatordetailService } from './vocationalcoordinatordetail.service';
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
  selector: 'data-list-view',
  templateUrl: './vocationalcoordinatordetail.component.html',
  styleUrls: ['./vocationalcoordinatordetail.component.scss'],
  animations: fuseAnimations,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None
})

export class VocationalcoordinatordetailComponent extends BaseListComponent<VocationalcoordinatordetailModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    private vocationalcoordinatordetailService: VocationalcoordinatordetailService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.vocationalcoordinatordetailService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = [
        'Name',
        'EmailId',
        'Gender',
        'DateOfJoining',
        'DateOfResignation',
        'AadhaarNumber',
        'AcademicQualification',
        'DateOfBirth',
        'ProfessionalQualification',
        'ProfessionalQualificationDetails',
        'TrainingExperienceMonths',
        'IsActive', 
        'Actions'];
      console.log(response);

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

  onDeleteVocationalcoordinatordetail(vocationalcoordinatordetailId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.vocationalcoordinatordetailService.deleteVocationalcoordinatordetailById(vocationalcoordinatordetailId)
            .subscribe((vocationalcoordinatordetailResp: any) => {

              this.zone.run(() => {
                if (vocationalcoordinatordetailResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('Vocationalcoordinatordetail deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }
}
