import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/reports/report.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { VTReportNotSubmittedReportModel } from './vt-report-not-submitted-report.model';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  selector: 'data-list-view',
  templateUrl: './vt-report-not-submitted-report.component.html',
  styleUrls: ['./vt-report-not-submitted-report.component.scss'],
  animations: fuseAnimations,
  standalone: true,
  imports: [MatTableExporterModule, MatIconModule,CommonModule, MatPaginator,MatTableModule,MatDatepickerModule,MatInputModule,ReactiveFormsModule,RouterModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None
})

export class VTReportNotSubmittedReportComponent extends BaseListComponent<VTReportNotSubmittedReportModel> implements OnInit {
  vtReportNotSubmittedForm: FormGroup;
  isShowFilterContainer = false;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    private reportService: ReportService) {
    super(commonService, router, routeParams, snackBar, zone);
  }

  ngOnInit(): void {

    this.vtReportNotSubmittedForm = this.createVTStudentTrackingForm();
  }

  //Create VTDailyAttendanceTracking form and returns {FormGroup}
  createVTStudentTrackingForm(): FormGroup {
    return this.formBuilder.group({
      FromDate: new FormControl('', Validators.required),
      ToDate: new FormControl('', Validators.required)
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vtReportNotSubmittedForm.controls[controlName].setValue(null);
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vtReportNotSubmittedForm.controls[controlName].setValue(isoDateString);
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  getVTReportNotSubmittedReports(): void {
    if (!this.vtReportNotSubmittedForm.valid) {
      this.validateAllFormFields(this.vtReportNotSubmittedForm);  
      return;
    }
    this.formatAndSetDate(this.vtReportNotSubmittedForm.get('FromDate').value, 'FromDate');
    this.formatAndSetDate(this.vtReportNotSubmittedForm.get('ToDate').value, 'ToDate');

    var reportParams = {
      UserId: this.UserModel.LoginId,
      FromDate: this.vtReportNotSubmittedForm.get('FromDate').value,
      ToDate: this.vtReportNotSubmittedForm.get('ToDate').value
    };

    this.reportService.GetVTDailyReportNotSubmittedTrackingByCriteria(reportParams).subscribe(response => {
      this.displayedColumns = ['VTPName', 'VCName', 'VCMobile', 'VCEmail', 'VTName', 'VTMobile', 'VTEmail', 'VTDateOfJoining', 'ReportingDate', 'ReportingStatus'];

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
    this.formatAndSetDate(this.vtReportNotSubmittedForm.get('FromDate').value, 'FromDate');
    this.formatAndSetDate(this.vtReportNotSubmittedForm.get('ToDate').value, 'ToDate');
    var reportParams: any = {
      UserId: this.UserModel.LoginId,
      FromDate: this.vtReportNotSubmittedForm.get('FromDate').value,
      ToDate: this.vtReportNotSubmittedForm.get('ToDate').value
    };

    this.reportService.GetVTDailyReportNotSubmittedTrackingByCriteria(reportParams).subscribe(response => {
      response.Results.$values.forEach(
        function (obj) {
          delete obj.$id;
          delete obj.DivisionName;
          delete obj.DistrictName;
          delete obj.BlockName;
          delete obj.UDISE;
          delete obj.SchoolName;
          delete obj.SectorName;
        });
      this.exportExcelFromTable(response.Results.$values, "VTReportNotSubmitted");
      this.IsLoading = false;
      this.SearchBy.PageIndex = 0;
      this.SearchBy.PageSize = 10;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }
}
