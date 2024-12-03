import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { StudentClassDetailService } from '../student-class-detail.service';
import { StudentClassDetailModel } from '../student-class-detail.model';
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
  selector: 'student-class-detail',
  templateUrl: './create-student-class-detail.component.html',
  styleUrls: ['./create-student-class-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,MatInputModule,MatSelectModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  animations: fuseAnimations
})
export class CreateStudentClassDetailComponent extends BaseComponent<StudentClassDetailModel> implements OnInit {
  studentClassDetailForm: FormGroup;
  studentClassDetailModel: StudentClassDetailModel;
  studentList: [DropdownModel];
  socialCategoryList: [DropdownModel];
  religionList: [DropdownModel];

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private studentClassDetailService: StudentClassDetailService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default studentClassDetail Model
    this.studentClassDetailModel = new StudentClassDetailModel();
  }

  ngOnInit(): void {
    this.studentClassDetailService.getDropdownforStudentClassDetails(this.UserModel).subscribe((results) => {
      if (results[0].Success) {
        this.studentList = results[0].Results.$values;
      }

      if (results[1].Success) {
        this.socialCategoryList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.religionList = results[2].Results.$values;
      }

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.studentClassDetailModel = new StudentClassDetailModel();

          } else {
            var studentId: string = params.get('studentId')

            this.studentClassDetailService.getStudentClassDetailById(studentId)
              .subscribe((response: any) => {
                this.studentClassDetailModel = response.Result;

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.studentClassDetailModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.studentClassDetailModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }

                this.studentClassDetailForm = this.createStudentClassDetailForm();
              });
          }
        }
      });
    });
    this.studentClassDetailForm = this.createStudentClassDetailForm();
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.studentClassDetailForm.controls[controlName].setValue(null);
        this.studentClassDetailModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.studentClassDetailForm.controls[controlName].setValue(isoDateString);
    this.studentClassDetailModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateStudentClassDetailDetails() {
    if (!this.studentClassDetailForm.valid) {
      this.validateAllFormFields(this.studentClassDetailForm);
      return;
    }
    this.formatAndSetDate(this.studentClassDetailForm.get('DateOfBirth').value, 'DateOfBirth');
    this.setValueFromFormGroup(this.studentClassDetailForm, this.studentClassDetailModel);

    this.studentClassDetailService.createOrUpdateStudentClassDetail(this.studentClassDetailModel)
      .subscribe((studentClassDetailResp: any) => {

        if (studentClassDetailResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.StudentClassDetail.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(studentClassDetailResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('StudentClassDetail deletion errors =>', error);
      });
  }

  //Create studentClassDetail form and returns {FormGroup}
  createStudentClassDetailForm(): FormGroup {
    return this.formBuilder.group({
      StudentId: new FormControl({ value: this.studentClassDetailModel.StudentId, disabled: this.PageRights.IsReadOnly }),
      FatherName: new FormControl({ value: this.studentClassDetailModel.FatherName, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(50), Validators.pattern(this.Constants.Regex.CharsWithTitleCase)]),
      MotherName: new FormControl({ value: this.studentClassDetailModel.MotherName, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(50), Validators.pattern(this.Constants.Regex.CharsWithTitleCase)]),
      GuardianName: new FormControl({ value: this.studentClassDetailModel.GuardianName, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(50), Validators.pattern(this.Constants.Regex.CharsWithTitleCase)]),
      DateOfBirth: new FormControl({ value: new Date(this.studentClassDetailModel.DateOfBirth), disabled: this.PageRights.IsReadOnly }, Validators.required),
      AadhaarNumber: new FormControl({ value: this.maskingStudentAadhaarNo(this.studentClassDetailModel.AadhaarNumber), disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(12), Validators.minLength(12), Validators.pattern(this.Constants.Regex.Number)]),
      StudentRollNumber: new FormControl({ value: this.studentClassDetailModel.StudentRollNumber, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(30)]),
      SocialCategory: new FormControl({ value: this.studentClassDetailModel.SocialCategory, disabled: this.PageRights.IsReadOnly }, [Validators.required]),
      Religion: new FormControl({ value: this.studentClassDetailModel.Religion, disabled: this.PageRights.IsReadOnly }),
      CWSNStatus: new FormControl({ value: this.studentClassDetailModel.CWSNStatus, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(150)]),
      Mobile: new FormControl({ value: this.studentClassDetailModel.Mobile, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      Mobile1: new FormControl({ value: this.studentClassDetailModel.Mobile1, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      IsActive: new FormControl({ value: true, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
