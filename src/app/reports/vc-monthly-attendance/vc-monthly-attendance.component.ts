import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/reports/report.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { VCMonthlyAttendanceModel } from './vc-monthly-attendance.model';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from "moment";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

const moment = _rollupMoment || _moment;
import { MatDatepicker } from '@angular/material/datepicker';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { FuseSharedModule } from '@fuse/shared.module';
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
  selector: 'vc-monthly-attendance',
  templateUrl: './vc-monthly-attendance.component.html',
  styleUrls: ['./vc-monthly-attendance.component.scss'],
  standalone: true,
  imports: [MatTableExporterModule,CommonModule, MatIconModule, MatPaginator,MatDatepickerModule,MatTableModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,FuseSharedModule],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class VCMonthlyAttendanceComponent extends BaseListComponent<VCMonthlyAttendanceModel> implements OnInit {
  monthlyAttendanceForm: FormGroup;
  monthlyAttendanceModel: VCMonthlyAttendanceModel;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    private reportService: ReportService) {
    super(commonService, router, routeParams, snackBar, zone);

    // Set the default school Model
    this.monthlyAttendanceModel = new VCMonthlyAttendanceModel();
  }

  ngOnInit(): void {
    this.monthlyAttendanceForm = this.createVCMonthlyAttendanceForm();
  }

  //Create VCMonthlyAttendance form and returns {FormGroup}
  createVCMonthlyAttendanceForm(): FormGroup {
    return this.formBuilder.group({
      ReportDate: new FormControl(moment(), Validators.required),
    });
  }

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.monthlyAttendanceForm.get('ReportDate').value;
    ctrlValue.year(normalizedYear.year());
    this.monthlyAttendanceForm.get('ReportDate').setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.monthlyAttendanceForm.get('ReportDate').value;
    ctrlValue.month(normalizedMonth.month());
    ctrlValue.year(normalizedMonth.year())

    this.monthlyAttendanceForm.get('ReportDate').setValue(ctrlValue);
    datepicker.close();
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.monthlyAttendanceForm.controls[controlName].setValue(null);
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.monthlyAttendanceForm.controls[controlName].setValue(isoDateString);
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  getVCMonthlyAttendanceReport(): void {
    this.formatAndSetDate(this.monthlyAttendanceForm.get('ReportDate').value, 'ReportDate');

    let reportDate = this.monthlyAttendanceForm.get('ReportDate').value;

    var reportParams = {
      UserId: this.UserModel.LoginId,
      VCId: this.UserModel.UserTypeId,
      ReportDate: reportDate
    }

    this.reportService.GetVCMonthlyAttendanceReport(reportParams).subscribe(response => {
      if (response.Result != null && response.Result != '') {
        let pdfReportUrl = this.Constants.Services.BaseUrl + 'Lighthouse/DownloadReportFile?fileId=' + response.Result + '&folderName=VCMonthlyAttendancePDF';
        window.open(pdfReportUrl, '_blank', '');
      }
    });
  }
}
