import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JobRoleModel } from './job-role.model';
import { JobRoleService } from './job-role.service';
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
  templateUrl: './job-role.component.html',
  styleUrls: ['./job-role.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class JobRoleComponent extends BaseListComponent<JobRoleModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    private jobRoleService: JobRoleService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {
    this.jobRoleService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      this.displayedColumns = ['SectorName', 'JobRoleName', 'QPCode', 'DisplayOrder', 'IsActive', 'Actions'];
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

  exportExcel(): void {
    this.IsLoading = true;

    this.jobRoleService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      response.Results.$values.forEach(
        function (obj) {
          if (obj.hasOwnProperty('IsActive')) {
            obj.IsActive = obj.IsActive ? 'Yes' : 'No';
          }
          if (obj.hasOwnProperty('IsImplemented')) {
            obj.IsImplemented = obj.IsImplemented ? 'Yes' : 'No';
          }
          delete obj.SchoolId;
          delete obj.TotalRows;
        });

      this.exportExcelFromTable(response.Results.$values, "SectorJobRole");

      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }
  onDeleteJobRole(jobRoleId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.jobRoleService.deleteJobRoleById(jobRoleId)
            .subscribe((jobRoleResp: any) => {

              this.zone.run(() => {
                if (jobRoleResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('JobRole deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }
}
