import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/reports/report.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VTPMonthlyInvoiceModel } from './vtp-monthly-invoice.model';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from "moment";

const moment = _rollupMoment || _moment;
import { MatDatepicker } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableExporterModule } from 'mat-table-exporter';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FuseSharedModule } from '@fuse/shared.module';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';

declare var require: any
const fileSaver = require('file-saver');

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
    selector: 'vtp-monthly-invoice',
    templateUrl: './vtp-monthly-invoice-component.html',
    styleUrls: ['./vtp-monthly-invoice-component.scss'],
    standalone: true,
    imports: [MatTableModule, MatPaginator,MatTableExporterModule,CommonModule,MatIconModule, RouterModule,ReactiveFormsModule,FuseSharedModule],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    providers: [
      {
        provide: DateAdapter,
        useClass: MomentDateAdapter,
        deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
      },
  
      { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
  })
  export class VTPMonthlyInvoiceComponent extends BaseListComponent<VTPMonthlyInvoiceModel> implements OnInit {
    monthlyInvoiceForm: FormGroup;
    monthlyAttendanceModel: VTPMonthlyInvoiceModel;
    vtList: any;
    filteredVTItems: any;
  
    constructor(public commonService: CommonService,
      public router: Router,
      public routeParams: ActivatedRoute,
      public snackBar: MatSnackBar,
      public zone: NgZone,
      private dialogService: DialogService,
      public formBuilder: FormBuilder,
      private reportService: ReportService) {
      super(commonService, router, routeParams, snackBar, zone);
  
      // Set the default school Model
      this.monthlyAttendanceModel = new VTPMonthlyInvoiceModel();
    }
  
    ngOnInit(): void {
      this.reportService.getDropdownforVTP(this.UserModel).subscribe((results) => {
        if (results[0].Success) {
          this.vtList = results[0].Results.$values;
          this.filteredVTItems = this.vtList.slice();
        }
  
        this.monthlyInvoiceForm = this.createVTPMonthlyInvoiceForm();
      });   
  
      this.monthlyInvoiceForm = this.createVTPMonthlyInvoiceForm();
    }
  
    //Create VTMonthlyAttendance form and returns {FormGroup}
    createVTPMonthlyInvoiceForm(): FormGroup {
      return this.formBuilder.group({
        VTId: new FormControl({ value: (this.UserModel.RoleCode === 'ADM' ? '' : ''), disabled: false }),
        ReportDate: new FormControl({ value: moment(), disabled: false }, Validators.required),
      });
    }
  
    chosenYearHandler(normalizedYear: Moment) {
      const ctrlValue = this.monthlyInvoiceForm.get('ReportDate').value;
      ctrlValue.year(normalizedYear.year());
      this.monthlyInvoiceForm.get('ReportDate').setValue(ctrlValue);
    }
  
    formatAndSetDate(inputDate: Date, controlName: string) {
        if (!inputDate) {
            this.monthlyInvoiceForm.controls[controlName].setValue(null);
            this.monthlyAttendanceModel[controlName] = null;
            return;
        }
        const dateObject = new Date(inputDate);
        const isoDateString = this.formatDate(dateObject);
        this.monthlyInvoiceForm.controls[controlName].setValue(isoDateString);
        this.monthlyAttendanceModel[controlName] = isoDateString;
      }
    
      formatDate(date: Date): string {
          return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
      }
    chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
      let ctrlValue = this.monthlyInvoiceForm.get('ReportDate').value;
      // Ensure ctrlValue is a moment object
      if (!moment.isMoment(ctrlValue)) {
        ctrlValue = moment(ctrlValue);
      }
      ctrlValue.month(normalizedMonth.month());
      ctrlValue.year(normalizedMonth.year())
  
      this.monthlyInvoiceForm.get('ReportDate').setValue(ctrlValue);
      datepicker.close();
    }
  
    GetVTPMonthlyInvoiceReport(): void {
      if (!this.monthlyInvoiceForm.valid) {
        this.validateAllFormFields(this.monthlyInvoiceForm);
        return;
      }
  
      let vtpId = this.monthlyInvoiceForm.get('VTId').value;
           // Store the original date as a moment object
    const originalDate = moment(this.monthlyInvoiceForm.get('ReportDate').value);
    const currentDate = moment();
    // Set the month and year based on the original date
    currentDate.month(originalDate.month());
    currentDate.year(originalDate.year());
    this.monthlyInvoiceForm.get('ReportDate').setValue(currentDate);
      this.formatAndSetDate(this.monthlyInvoiceForm.get('ReportDate').value, 'ReportDate');
      let reportDate = this.monthlyInvoiceForm.get('ReportDate').value;
      var reportParams = {
        UserId: this.UserModel.LoginId,
        VTPId: vtpId,
        ReportDate: reportDate
      }
  
      this.reportService.GetVTPMonthlyInvoiceReport(reportParams).subscribe(response => {
        if (response.Success == false){
            this.showNoDataFoundSnackBar();
        }
        else if (response.Result != null && response.Result != '') {
          let pdfReportUrl = this.Constants.Services.BaseUrl + 'Lighthouse/DownloadReportFile?fileId=' + response.Result + '&folderName=VTPMonthlyInvoicePDF';
          window.open(pdfReportUrl, '_blank', '');
          // Create a new moment object for today
          const today = moment();
          // Set the month and year based on the original date
          today.month(originalDate.month());
          today.year(originalDate.year());

          // Reset the ReportDate control value to the modified date
          this.monthlyInvoiceForm.get('ReportDate').setValue(today);
        }
      });
    }
  }