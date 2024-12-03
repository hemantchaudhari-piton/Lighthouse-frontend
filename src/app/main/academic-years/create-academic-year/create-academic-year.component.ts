import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { AcademicYearService } from '../academic-year.service';
import { AcademicYearModel } from '../academic-year.model';
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
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatInputModule,MatSelectModule],
  selector: 'academic-year',
  templateUrl: './create-academic-year.component.html',
  styleUrls: ['./create-academic-year.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateAcademicYearComponent extends BaseComponent<AcademicYearModel> implements OnInit {
  academicYearForm: FormGroup;
  academicYearModel: AcademicYearModel;
  phaseList: any;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private academicYearService: AcademicYearService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default academicYear Model
    this.academicYearModel = new AcademicYearModel();
  }

  ngOnInit(): void {
    this.commonService.GetMasterDataByType({ DataType: 'Phases', SelectTitle: 'Phase' }).subscribe((response: any) => {
      this.phaseList = response.Results.$values;

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.academicYearModel = new AcademicYearModel();

          } else {
            var academicYearId: string = params.get('academicYearId')

            this.academicYearService.getAcademicYearById(academicYearId)
              .subscribe((response: any) => {
                this.academicYearModel = response.Result;

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.academicYearModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.academicYearModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }

                this.academicYearForm = this.createAcademicYearForm();
              });
          }
        }
      });
    });

    this.academicYearForm = this.createAcademicYearForm();
  }

  saveOrUpdateAcademicYearDetails() {
    this.setValueFromFormGroup(this.academicYearForm, this.academicYearModel);

    this.academicYearService.createOrUpdateAcademicYear(this.academicYearModel)
      .subscribe((academicYearResp: any) => {

        if (academicYearResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.AcademicYear.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(academicYearResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('AcademicYear deletion errors =>', error);
      });
  }

  //Create academicYear form and returns {FormGroup}
  createAcademicYearForm(): FormGroup {
    return this.formBuilder.group({
      AcademicYearId: new FormControl(this.academicYearModel.AcademicYearId),
      PhaseId: new FormControl({ value: this.academicYearModel.PhaseId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      YearName: new FormControl({ value: this.academicYearModel.YearName, disabled: this.PageRights.IsReadOnly }, Validators.required),
      AcademicYearCode: new FormControl({ value: this.academicYearModel.AcademicYearCode, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(4), Validators.minLength(4), Validators.required,]),
      Description: new FormControl({ value: this.academicYearModel.Description, disabled: this.PageRights.IsReadOnly }),
      IsCurrentAcademicYear: new FormControl({ value: this.academicYearModel.IsCurrentAcademicYear, disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.academicYearModel.IsActive, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
