import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VTStudentVEResultService } from '../vt-student-veresult.service';
import { VTStudentVEResultModel } from '../vt-student-veresult.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'vt-student-veresult',
  templateUrl: './create-vt-student-veresult.component.html',
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,MatInputModule,MatSelectModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  styleUrls: ['./create-vt-student-veresult.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateVTStudentVEResultComponent extends BaseComponent<VTStudentVEResultModel> implements OnInit {
  vtStudentVEResultForm: FormGroup;
  vtStudentVEResultModel: VTStudentVEResultModel;
  studentList: [DropdownModel];

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vtStudentVEResultService: VTStudentVEResultService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vtStudentVEResult Model
    this.vtStudentVEResultModel = new VTStudentVEResultModel();
  }

  ngOnInit(): void {

    this.vtStudentVEResultService.getClassesAndStudents().subscribe(results => {
        if (results[0].Success) {
          this.studentList = results[0].Results.$values;
        }

        this.route.paramMap.subscribe(params => {
          if (params.keys.length > 0) {
            this.PageRights.ActionType = params.get('actionType');

            if (this.PageRights.ActionType == this.Constants.Actions.New) {
              this.vtStudentVEResultModel = new VTStudentVEResultModel();

            } else {
              var vtStudentVEResultId: string = params.get('vtStudentVEResultId')

              this.vtStudentVEResultService.getVTStudentVEResultById(vtStudentVEResultId)
                .subscribe((response: any) => {
                  this.vtStudentVEResultModel = response.Result;

                  if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                    this.vtStudentVEResultModel.RequestType = this.Constants.PageType.Edit;
                  else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                    this.vtStudentVEResultModel.RequestType = this.Constants.PageType.View;
                    this.PageRights.IsReadOnly = true;
                  }

                  this.vtStudentVEResultForm = this.createVTStudentVEResultForm();
                });
            }
          }
        });
      });

    this.vtStudentVEResultForm = this.createVTStudentVEResultForm();
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vtStudentVEResultForm.controls[controlName].setValue(null);
        this.vtStudentVEResultForm[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vtStudentVEResultForm.controls[controlName].setValue(isoDateString);
    this.vtStudentVEResultForm[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateVTStudentVEResultDetails() {
    if (!this.vtStudentVEResultForm.valid) {
      this.validateAllFormFields(this.vtStudentVEResultForm);  
      return;
    }
    this.formatAndSetDate(this.vtStudentVEResultForm.get('DateIssuence').value, 'DateIssuence');
    this.setValueFromFormGroup(this.vtStudentVEResultForm, this.vtStudentVEResultModel);

    this.vtStudentVEResultService.createOrUpdateVTStudentVEResult(this.vtStudentVEResultModel)
      .subscribe((vtStudentVEResultResp: any) => {

        if (vtStudentVEResultResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VTStudentVEResult.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vtStudentVEResultResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VTStudentVEResult deletion errors =>', error);
      });
  }

  //Create vtStudentVEResult form and returns {FormGroup}
  createVTStudentVEResultForm(): FormGroup {
    return this.formBuilder.group({
      VTStudentVEResultId: new FormControl(this.vtStudentVEResultModel.VTStudentVEResultId),      
      StudentId: new FormControl({ value: this.vtStudentVEResultModel.StudentId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      DateIssuence: new FormControl({ value: new Date(this.vtStudentVEResultModel.DateIssuence), disabled: this.PageRights.IsReadOnly }, Validators.required),
      ExternalMarks: new FormControl({ value: this.vtStudentVEResultModel.ExternalMarks, disabled: this.PageRights.IsReadOnly }, Validators.pattern(this.Constants.Regex.Number)),
      TheoryMarks: new FormControl({ value: this.vtStudentVEResultModel.TheoryMarks, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      InternalMarks: new FormControl({ value: this.vtStudentVEResultModel.InternalMarks, disabled: this.PageRights.IsReadOnly }, Validators.pattern(this.Constants.Regex.Number)),
      TotalMarks: new FormControl({ value: this.vtStudentVEResultModel.TotalMarks, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      Grade: new FormControl({ value: this.vtStudentVEResultModel.Grade, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(50), Validators.pattern(this.Constants.Regex.AlphaNumericWithDashDotMinusSpace)]),
    });
  }
}
