import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VTPracticalAssessmentService } from '../vt-practical-assessment.service';
import { VTPracticalAssessmentModel } from '../vt-practical-assessment.model';
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
  selector: 'vt-practical-assessment',
  templateUrl: './create-vt-practical-assessment.component.html',
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatInputModule,MatSelectModule],
  styleUrls: ['./create-vt-practical-assessment.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateVTPracticalAssessmentComponent extends BaseComponent<VTPracticalAssessmentModel> implements OnInit {
  vtPracticalAssessmentForm: FormGroup;
  vtPracticalAssessmentModel: VTPracticalAssessmentModel;
  vtClassList: [DropdownModel];

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vtPracticalAssessmentService: VTPracticalAssessmentService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vtPracticalAssessment Model
    this.vtPracticalAssessmentModel = new VTPracticalAssessmentModel();
  }

  ngOnInit(): void {

    this.commonService
      .GetMasterDataByType({ DataType: 'VTClasses' })
      .subscribe((response: any) => {

        if (response.Success) {
          this.vtClassList = response.Results.$values;
        }

        this.route.paramMap.subscribe(params => {
          if (params.keys.length > 0) {
            this.PageRights.ActionType = params.get('actionType');

            if (this.PageRights.ActionType == this.Constants.Actions.New) {
              this.vtPracticalAssessmentModel = new VTPracticalAssessmentModel();

            } else {
              var vtPracticalAssessmentId: string = params.get('vtPracticalAssessmentId')

              this.vtPracticalAssessmentService.getVTPracticalAssessmentById(vtPracticalAssessmentId)
                .subscribe((response: any) => {
                  this.vtPracticalAssessmentModel = response.Result;

                  if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                    this.vtPracticalAssessmentModel.RequestType = this.Constants.PageType.Edit;
                  else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                    this.vtPracticalAssessmentModel.RequestType = this.Constants.PageType.View;
                    this.PageRights.IsReadOnly = true;
                  }

                  this.vtPracticalAssessmentForm = this.createVTPracticalAssessmentForm();
                });
            }
          }
        });
      });

    this.vtPracticalAssessmentForm = this.createVTPracticalAssessmentForm();
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vtPracticalAssessmentForm.controls[controlName].setValue(null);
        this.vtPracticalAssessmentModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vtPracticalAssessmentForm.controls[controlName].setValue(isoDateString);
    this.vtPracticalAssessmentModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateVTPracticalAssessmentDetails() {
    if (!this.vtPracticalAssessmentForm.valid) {
      this.validateAllFormFields(this.vtPracticalAssessmentForm);  
      return;
    }
    this.formatAndSetDate(this.vtPracticalAssessmentForm.get('AssessmentDate').value, 'AssessmentDate');
    this.formatAndSetDate(this.vtPracticalAssessmentForm.get('AssessorTimeReached').value, 'AssessorTimeReached');
    this.setValueFromFormGroup(this.vtPracticalAssessmentForm, this.vtPracticalAssessmentModel);
    this.vtPracticalAssessmentModel.AssessorGroupPhoto = null;

    this.vtPracticalAssessmentService.createOrUpdateVTPracticalAssessment(this.vtPracticalAssessmentModel)
      .subscribe((vtPracticalAssessmentResp: any) => {

        if (vtPracticalAssessmentResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VTPracticalAssessment.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vtPracticalAssessmentResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VTPracticalAssessment deletion errors =>', error);
      });
  }

  //Create vtPracticalAssessment form and returns {FormGroup}
  createVTPracticalAssessmentForm(): FormGroup {
    return this.formBuilder.group({
      VTPracticalAssessmentId: new FormControl(this.vtPracticalAssessmentModel.VTPracticalAssessmentId),
      VTClassId: new FormControl({ value: this.vtPracticalAssessmentModel.VTClassId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      AssessmentDate: new FormControl({ value: new Date(this.vtPracticalAssessmentModel.AssessmentDate), disabled: this.PageRights.IsReadOnly }, Validators.required),
      BoysPresent: new FormControl({ value: this.vtPracticalAssessmentModel.BoysPresent, disabled: this.PageRights.IsReadOnly }, Validators.pattern(this.Constants.Regex.Number)),
      GirlsPresent: new FormControl({ value: this.vtPracticalAssessmentModel.GirlsPresent, disabled: this.PageRights.IsReadOnly }, Validators.pattern(this.Constants.Regex.Number)),
      AssessorName: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorName, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(100), Validators.pattern(this.Constants.Regex.CharsWithSpace)]),
      AssessorMobile: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorMobile, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.Constants.Regex.MobileNumber)]),
      AssessorEmail: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorEmail, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(100), Validators.pattern(this.Constants.Regex.Email)]),
      AssessorQualification: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorQualification, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(150)),
      AssessorTimeReached: new FormControl({ value: new Date(this.vtPracticalAssessmentModel.AssessorTimeReached), disabled: this.PageRights.IsReadOnly }),
      AssessorIdCheck: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorIdCheck, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      AssessorIdType: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorIdType, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(100)),
      AssessorSSCLetter: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorSSCLetter, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      AssessorBehaviour: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorBehaviour, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      AssessorDemands: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorDemands, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      AssessorBehaiourFormality: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorBehaiourFormality, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      AssessorGroupPhoto: new FormControl({ value: this.vtPracticalAssessmentModel.AssessorGroupPhoto, disabled: this.PageRights.IsReadOnly }),
      VCPMUNameVisit: new FormControl({ value: this.vtPracticalAssessmentModel.VCPMUNameVisit, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(50)),
      RemarksDetails: new FormControl({ value: this.vtPracticalAssessmentModel.RemarksDetails, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(350)),
    });
  }
}
