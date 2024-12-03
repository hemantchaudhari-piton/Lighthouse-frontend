import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/reports/report.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { VTMonthlyAttendanceModel } from './vt-monthly-attendance.model';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from "moment";
import { MatDatepickerModule } from '@angular/material/datepicker';

const moment = _rollupMoment || _moment;
import { MatDatepicker } from '@angular/material/datepicker';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
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
  selector: 'vt-monthly-attendance',
  templateUrl: './vt-monthly-attendance.component.html',
  styleUrls: ['./vt-monthly-attendance.component.scss'],
  standalone: true,
  imports: [MatTableExporterModule, MatIconModule, MatPaginator,MatDatepickerModule,MatFormFieldModule,ReactiveFormsModule,FuseSharedModule],
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
export class VTMonthlyAttendanceComponent extends BaseListComponent<VTMonthlyAttendanceModel> implements OnInit {
  monthlyAttendanceForm: FormGroup;
  monthlyAttendanceModel: VTMonthlyAttendanceModel;
  vtList: any;
  filteredVTItems: any;
  isHmIssueApproval: boolean = false;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    private reportService: ReportService) {
    super(commonService, router, routeParams, snackBar, zone);

    this.monthlyAttendanceModel = new VTMonthlyAttendanceModel();
  }

  ngOnInit(): void {
    this.commonService.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'HmIssueApproval', SelectTitle: 'HmIssueApproval' }).subscribe((response: any) => {
      if (response.Results.$values.length >= 2) {
        response.Results.$values.forEach((item: any) => {
          if (this.UserModel.RoleCode == "VT" && item.Name === "VTRegularization" && item.IsDisabled == false) {
           this.isHmIssueApproval = true;
          }
        });
      }
    })
    this.reportService.getDropdownforVocationalTrainer(this.UserModel).subscribe((results) => {
      if (results[0].Success) {
        this.vtList = results[0].Results.$values;
        this.filteredVTItems = this.vtList.slice();
      }

      this.monthlyAttendanceForm = this.createVTMonthlyAttendanceForm();
    });

    this.monthlyAttendanceForm = this.createVTMonthlyAttendanceForm();
  }

  createVTMonthlyAttendanceForm(): FormGroup {
    return this.formBuilder.group({
      VTId: new FormControl({ value: (this.UserModel.RoleCode === 'ADM' ? '' : this.UserModel.UserTypeId), disabled: false }, Validators.required),
      ReportDate: new FormControl({ value: moment(), disabled: false }, Validators.required),
    });
  }

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.monthlyAttendanceForm.get('ReportDate').value;
    ctrlValue.year(normalizedYear.year());
    this.monthlyAttendanceForm.get('ReportDate').setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.monthlyAttendanceForm.get('ReportDate').value;
    // Ensure ctrlValue is a moment object
    if (!moment.isMoment(ctrlValue)) {
      ctrlValue = moment(ctrlValue);
    }
    ctrlValue.month(normalizedMonth.month());
    ctrlValue.year(normalizedMonth.year());
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
  
  getVTMonthlyAttendanceReport(): void {
    this.fetchAndOpenReport('GetVTMonthlyAttendanceReport');
  }
  
  getVTMonthlyAttendanceReportForWithoutHMApproval(): void {
    this.fetchAndOpenReport('GetVTMonthlyAttendanceReportForWithoutHMApproval');
  }
  
  private fetchAndOpenReport(endpoint: string): void {
    if (!this.monthlyAttendanceForm.valid) {
      this.validateAllFormFields(this.monthlyAttendanceForm);
      return;
    }
  
    let vtId = this.monthlyAttendanceForm.get('VTId').value;
     // Store the original date as a moment object
    const originalDate = moment(this.monthlyAttendanceForm.get('ReportDate').value);
    const currentDate = moment();
    // Set the month and year based on the original date
    currentDate.month(originalDate.month());
    currentDate.year(originalDate.year());
    this.monthlyAttendanceForm.get('ReportDate').setValue(currentDate);

    this.formatAndSetDate(this.monthlyAttendanceForm.get('ReportDate').value, 'ReportDate');
    let reportDate = this.monthlyAttendanceForm.get('ReportDate').value;
  
    const reportParams = {
      UserId: this.UserModel.LoginId,
      VTId: vtId,
      ReportDate: reportDate
    };
  
    this.reportService[endpoint](reportParams).subscribe(response => {
      if (response.Result != null && response.Result != '') {
        const pdfReportUrl = this.Constants.Services.BaseUrl + 'Lighthouse/DownloadReportFile?fileId=' + response.Result + '&folderName=VTMonthlyAttendancePDF';
        window.open(pdfReportUrl, '_blank', '');
           // Create a new moment object for today
           const today = moment();
           // Set the month and year based on the original date
           today.month(originalDate.month());
           today.year(originalDate.year());

           // Reset the ReportDate control value to the modified date
           this.monthlyAttendanceForm.get('ReportDate').setValue(today);

      }
    });
  }
  
}
