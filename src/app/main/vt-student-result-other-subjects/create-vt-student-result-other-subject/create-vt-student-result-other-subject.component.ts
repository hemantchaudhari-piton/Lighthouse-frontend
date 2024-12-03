import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VTStudentResultOtherSubjectService } from '../vt-student-result-other-subject.service';
import { VTStudentResultOtherSubjectModel } from '../vt-student-result-other-subject.model';
import { DropdownModel } from 'app/models/dropdown.model';
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
  selector: 'vt-student-result-other-subject',
  templateUrl: './create-vt-student-result-other-subject.component.html',
  styleUrls: ['./create-vt-student-result-other-subject.component.scss'],
  standalone : true ,
  imports: [MatPaginatorModule,FuseSharedModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatInputModule,MatSelectModule],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateVTStudentResultOtherSubjectComponent extends BaseComponent<VTStudentResultOtherSubjectModel> implements OnInit {
  vtStudentResultOtherSubjectForm: FormGroup;
  vtStudentResultOtherSubjectModel: VTStudentResultOtherSubjectModel;
  studentList: [DropdownModel];

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vtStudentResultOtherSubjectService: VTStudentResultOtherSubjectService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vtStudentResultOtherSubject Model
    this.vtStudentResultOtherSubjectModel = new VTStudentResultOtherSubjectModel();
  }

  ngOnInit(): void {

    this.vtStudentResultOtherSubjectService.getClassesAndStudents().subscribe(results => {
        if (results[0].Success) {
          this.studentList = results[0].Results.$values;
        }

        this.route.paramMap.subscribe(params => {
          if (params.keys.length > 0) {
            this.PageRights.ActionType = params.get('actionType');

            if (this.PageRights.ActionType == this.Constants.Actions.New) {
              this.vtStudentResultOtherSubjectModel = new VTStudentResultOtherSubjectModel();

            } else {
              var vtStudentResultOtherSubjectId: string = params.get('vtStudentResultOtherSubjectId')

              this.vtStudentResultOtherSubjectService.getVTStudentResultOtherSubjectById(vtStudentResultOtherSubjectId)
                .subscribe((response: any) => {
                  this.vtStudentResultOtherSubjectModel = response.Result;

                  if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                    this.vtStudentResultOtherSubjectModel.RequestType = this.Constants.PageType.Edit;
                  else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                    this.vtStudentResultOtherSubjectModel.RequestType = this.Constants.PageType.View;
                    this.PageRights.IsReadOnly = true;
                  }

                  this.vtStudentResultOtherSubjectForm = this.createVTStudentResultOtherSubjectForm();
                });
            }
          }
        });
      });

    this.vtStudentResultOtherSubjectForm = this.createVTStudentResultOtherSubjectForm();
  }

  saveOrUpdateVTStudentResultOtherSubjectDetails() {
    if (!this.vtStudentResultOtherSubjectForm.valid) {
      this.validateAllFormFields(this.vtStudentResultOtherSubjectForm);  
      return;
    }
    this.setValueFromFormGroup(this.vtStudentResultOtherSubjectForm, this.vtStudentResultOtherSubjectModel);
    this.vtStudentResultOtherSubjectModel.VTId = this.UserModel.UserTypeId;
    
    this.vtStudentResultOtherSubjectService.createOrUpdateVTStudentResultOtherSubject(this.vtStudentResultOtherSubjectModel)
      .subscribe((vtStudentResultOtherSubjectResp: any) => {

        if (vtStudentResultOtherSubjectResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VTStudentResultOtherSubject.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vtStudentResultOtherSubjectResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VTStudentResultOtherSubject deletion errors =>', error);
      });
  }

  //Create vtStudentResultOtherSubject form and returns {FormGroup}
  createVTStudentResultOtherSubjectForm(): FormGroup {
    return this.formBuilder.group({
      VTStudentResultOtherSubjectId: new FormControl(this.vtStudentResultOtherSubjectModel.VTStudentResultOtherSubjectId),      
      StudentId: new FormControl({ value: this.vtStudentResultOtherSubjectModel.StudentId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SubjectName: new FormControl({ value: this.vtStudentResultOtherSubjectModel.SubjectName, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(150), Validators.pattern(this.Constants.Regex.AlphaNumericWithDashDotMinusSpace)]),
      SubjectNumber: new FormControl({ value: this.vtStudentResultOtherSubjectModel.SubjectNumber, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      SubjectMarks: new FormControl({ value: this.vtStudentResultOtherSubjectModel.SubjectMarks, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
    });
  }
}
