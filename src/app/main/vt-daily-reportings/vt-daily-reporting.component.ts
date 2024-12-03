import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VTDailyReportingModel } from './vt-daily-reporting.model';
import { VTDailyReportingService } from './vt-daily-reporting.service';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DropdownModel } from 'app/models/dropdown.model';
@Component({
  selector: 'data-list-view',
  templateUrl: './vt-daily-reporting.component.html',
  styleUrls: ['./vt-daily-reporting.component.scss'],
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatSlideToggleModule],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class VTDailyReportingComponent extends BaseListComponent<VTDailyReportingModel> implements OnInit {
  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private vtDailyReportingService: VTDailyReportingService) {
    super(commonService, router, routeParams, snackBar, zone);
    this.vtdailyReportingFilterForm = this.createvtdailyReportingFilterForm();
  }
  monthList: [DropdownModel];
  vtdailyReportingFilterForm: FormGroup;
  vtlist : any;
  showAlert: boolean = false;
  CurrDate: Date;
  maxHmIssueDate : any;
  dayNumber: any;
  monthName: any;
  monthNumber: any;

  ngOnInit(): void {
    this.initializeData();
  }

  initializeData(): void {
      this.CurrDate = new Date();
      this.dayNumber = this.CurrDate.getDate();
      this.monthNumber = this.CurrDate.getMonth() + 1;
      const monthName = this.CurrDate.toLocaleString('default', { month: 'long' });

      this.loadVocationalTrainers();
      this.loadDropdownData();
      this.loadIssueApprovalData(monthName);
  }

  loadVocationalTrainers(): void {
      this.commonService.GetMasterDataByType({
          DataType: 'VTByHm',
          ParentId: this.UserModel.UserTypeId,
          SelectTitle: 'Vocational Trainer'
      }).subscribe(response => {
          if (response.Success) {
              this.vtlist = response.Results.$values;
          }
      });
  }

  loadDropdownData(): void {
      this.vtDailyReportingService.getDropdownForVTDailyReporting(this.UserModel)
          .subscribe(results => {
              this.monthList = results[2].Results.$values;
          });
  }

  loadIssueApprovalData(monthName: string): void {
      this.commonService.GetMasterDataByType({
          DataType: 'DataValues',
          ParentId: 'HmIssueApproval',
          SelectTitle: 'HmIssueApproval'
      }).subscribe(response => {
          if (response.Results.$values.length >= 2) {
            this.processIssueApprovalData(response.Results.$values, monthName);
          }else {
          this.loadVtDailyReporting();
        }
      }, error => {
        // Handle error scenario by calling loadVtDailyReporting
        this.loadVtDailyReporting();
    });
  }

  processIssueApprovalData(values: any[], monthName: string): void {
      values.forEach(item => {
          if (this.UserModel.RoleCode === "VT" && item.Name === "VTRegularization" && !item.IsDisabled) {
              this.maxHmIssueDate = parseInt(item.Description);
          }
          if (this.UserModel.RoleCode === "HM" && item.Name === "HMRegularization" && !item.IsDisabled) {
              this.maxHmIssueDate = parseInt(item.Description);
          }
      });

      if (this.maxHmIssueDate !== null && this.dayNumber >= 1 && this.dayNumber <= this.maxHmIssueDate) {
          this.showAlert = true;
          this.monthName = `${this.ordinalSuffix(this.maxHmIssueDate)} ${monthName}`;
          this.monthNumber = this.CurrDate.getMonth();
      } else {
          this.showAlert = false;
      }
      this.loadVtDailyReporting();
  }

  ordinalSuffix(day: number): string {
      const s = ["th", "st", "nd", "rd"];
      const v = day % 100;
      return day + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  loadVtDailyReporting(): void {
      const vtDailyRepotingParams = this.buildVTDailyReportingParams();

      this.vtDailyReportingService.GetAllByCriteria(vtDailyRepotingParams).subscribe(response => {
          this.processDailyReportingResults(response.Results.$values, vtDailyRepotingParams.monthId);
          this.updateDisplayedColumns();
          this.updateTableDataSource(response.Results.$values);
      }, error => {
          console.error(error);
      });
  }

  buildVTDailyReportingParams(): any {
      return {
          UserTypeId: this.UserModel.UserTypeId,
          vtId: this.vtdailyReportingFilterForm.controls["VTId"].value,
          hmReviewStatus: this.vtdailyReportingFilterForm.controls["HMReviewStatus"].value,
          monthId: this.vtdailyReportingFilterForm.controls['MonthId'].value || this.monthNumber.toString(),
          name: null,
          charBy: null,
          pageIndex: this.SearchBy.PageIndex,
          pageSize: this.SearchBy.PageSize
      };
  }

  processDailyReportingResults(results: any[], monthId: string): void {
      results.forEach(result => {
          if (this.dayNumber >= 1 && this.dayNumber <= this.maxHmIssueDate && (monthId == this.CurrDate.getMonth().toString())) {
              this.setHMReviewLabel(result);
          } else {
              this.setDefaultHMReviewLabel(result);
          }
      });
  }

  setHMReviewLabel(result: any): void {
      switch (result.HMReview) {
          case "0":
              result.HMReviewLabel = 'Not-Reviewed';
              break;
          case "1":
              result.HMReviewLabel = 'Approved';
              break;
          case "2":
              result.HMReviewLabel = 'Rejected';
              break;
          default:
              result.HMReviewLabel = 'Unknown';
              break;
      }
  }

  setDefaultHMReviewLabel(result: any): void {
      if (result.IsLocked) {
          if (result.HMReview == "0") {
              result.HMReviewLabel = 'Default Approved';
              result.HMReview = '3';
          } else {
              this.setHMReviewLabel(result);
          }
      } else {
          result.HMReviewLabel = 'Not-Reviewed';
          result.HMReview = '3';
      }
  }

  updateDisplayedColumns(): void {
      if (this.showAlert) {
          this.displayedColumns = ['SchoolName', 'SectorName', 'JobRoleName', 'ReportingDate', 'ReportType', 'WorkTypes', 'Remarks', 'CreatedBy', 'HMReview', 'Actions'];
      } else {
          this.displayedColumns = ['SchoolName', 'SectorName', 'JobRoleName', 'ReportingDate', 'ReportType', 'WorkTypes', 'CreatedBy', 'Actions'];
      }
  }

  updateTableDataSource(data: any[]): void {
      this.tableDataSource.data = data;
      this.tableDataSource.sort = this.ListSort;
      this.tableDataSource.paginator = this.ListPaginator;
      this.tableDataSource.filteredData = data;

      this.zone.run(() => {
          if (this.tableDataSource.data.length == 0) {
              this.showNoDataFoundSnackBar();
          }
      });
      this.IsLoading = false;
  }

  onLoadDailyReportingByFilters(): any {
      this.IsLoading = true;
      const vtDailyRepotingParams = this.buildVTDailyReportingParams();

      this.vtDailyReportingService.GetAllByCriteria(vtDailyRepotingParams).subscribe(response => {
          this.processDailyReportingResults(response.Results.$values, vtDailyRepotingParams.monthId);
          this.updateDisplayedColumns();
          this.updateTableDataSource(response.Results.$values);
          this.SearchBy.TotalResults = response.TotalResults;

          setTimeout(() => {
              this.ListPaginator.pageIndex = this.SearchBy.PageIndex;
              this.ListPaginator.length = this.SearchBy.TotalResults;
          });
      }, error => {
          console.error(error);
          this.IsLoading = false;
      });
  }

  onLoadVTDailyReportingByFilters(): any {
      this.SearchBy.PageIndex = 0;
      this.onLoadDailyReportingByFilters();
  }

  
    resetFilters(): void {
      this.SearchBy.PageIndex = 0;
      this.vtdailyReportingFilterForm.reset();
      this.vtdailyReportingFilterForm.reset();
      this.vtdailyReportingFilterForm.reset();
      // this.vcList = [];
      // this.filteredVCItems = [];
  
      // this.onLoadVocationalTrainersByCriteria();
      // this.onLoadVTDailyReportingByFilters.reset();
  
      this.onLoadDailyReportingByFilters();
  }

  onDeleteVTDailyReporting(vtDailyReportingId: string) {
    this.dialogService
      .openConfirmDialog(this.Constants.Messages.DeleteConfirmationMessage)
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.vtDailyReportingService.deleteVTDailyReportingById(vtDailyReportingId)
            .subscribe((vtDailyReportingResp: any) => {

              this.zone.run(() => {
                if (vtDailyReportingResp.Success) {
                  this.showActionMessage(
                    this.Constants.Messages.RecordDeletedMessage,
                    this.Constants.Html.SuccessSnackbar
                  );
                }
                this.ngOnInit();
              }, error => {
                console.log('VTDailyReporting deletion errors =>', error);
              });

            });
          this.ngOnInit();
        }
      });
  }
  createvtdailyReportingFilterForm(): FormGroup {
    return this.formBuilder.group({
      VTId: new FormControl(),
      HMReviewStatus: new FormControl(),
      MonthId: new FormControl(),
    });
  }
  exportExcel(): void {
    this.IsLoading = true;
    this.vtDailyReportingService.GetAllByCriteria(this.SearchBy).subscribe(response => {
      response.Results.$values.forEach(
        function (obj) {
          if (obj.hasOwnProperty('IsActive')) {
            obj.IsActive = obj.IsActive ? 'Yes' : 'No';
          }

          delete obj.VTDailyReportingId;
          delete obj.TotalRows;
        });


      this.exportExcelFromTable(response.Results.$values, "VTDailyReporting");

      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }
}
