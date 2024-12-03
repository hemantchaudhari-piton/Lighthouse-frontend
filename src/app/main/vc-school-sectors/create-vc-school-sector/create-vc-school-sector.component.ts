
import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VCSchoolSectorService } from '../vc-school-sector.service';
import { VCSchoolSectorModel } from '../vc-school-sector.model';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
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
  selector: 'vc-school-sector',
  templateUrl: './create-vc-school-sector.component.html',
  styleUrls: ['./create-vc-school-sector.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,MatInputModule,MatSelectModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  animations: fuseAnimations
})
export class CreateVCSchoolSectorComponent extends BaseComponent<VCSchoolSectorModel> implements OnInit {
  vcSchoolSectorForm: FormGroup;
  vcSchoolSectorModel: VCSchoolSectorModel;

  academicYearList: [DropdownModel];
  vocationalCoordinatorList: [DropdownModel];
  schoolVTPSectorList: DropdownModel[];
  filteredSchoolVTPSectorItems: any;
  minAllocationDate: Date;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vcSchoolSectorService: VCSchoolSectorService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vcSchoolSector Model
    this.vcSchoolSectorModel = new VCSchoolSectorModel();
  }

  ngOnInit(): void {

    this.vcSchoolSectorService.getAcademicYearVC().subscribe(results => {
      if (results[0].Success) {
        this.academicYearList = results[0].Results.$values;
      }

      if (results[3].Success) {
        this.vocationalCoordinatorList = results[3].Results.$values;
      }

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.vcSchoolSectorModel = new VCSchoolSectorModel();

          } else {
            var vcSchoolSectorId: string = params.get('vcSchoolSectorId')

            this.vcSchoolSectorService.getVCSchoolSectorById(vcSchoolSectorId)
              .subscribe((response: any) => {
                this.vcSchoolSectorModel = response.Result;

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.vcSchoolSectorModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.vcSchoolSectorModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }
                this.onChangeVC(this.vcSchoolSectorModel.VCId);
                this.vcSchoolSectorForm = this.createVCSchoolSectorForm();
              });
          }
        }
      });
    });

    this.vcSchoolSectorForm = this.createVCSchoolSectorForm();
  }

  onChangeDateOfAllocation(event: MatDatepickerInputEvent<Date>) {
    if (event.value != null) {
      this.vcSchoolSectorForm.patchValue({ DateOfAllocation: this.DateFormatPipe.transform(event.value, 'dd/MM/yyyy') });
    }
  }

  onChangeAY(academicYearId) {
    let vcId = this.vcSchoolSectorForm.get('VCId').value;

    if (vcId != '') {
      this.onChangeVC(vcId);
    }
  }

  onChangeVC(vcId) {
    let academicYearId = this.vcSchoolSectorForm.get('AcademicYearId').value;
    if (academicYearId == '' && this.vcSchoolSectorModel.AcademicYearId != '') {
      academicYearId = this.vcSchoolSectorModel.AcademicYearId;
    }

    if (vcId !== null && vcId !== '') {
      this.vcSchoolSectorService.getVocationalCoordinatorById(vcId).subscribe((response: any) => {
        this.minAllocationDate = new Date(response.Result.DateOfJoining);
      });
    }

    this.commonService.GetSchoolVTPSectorsByUserId({ DataId: vcId, DataId1: this.UserModel.RoleCode, DataId2: academicYearId, SelectTitle: 'School VTP Sector' }).subscribe((response) => {
      if (response.Success) {
        this.schoolVTPSectorList = response.Results.$values;
        this.filteredSchoolVTPSectorItems = this.schoolVTPSectorList.slice();
      }
      else {
        this.schoolVTPSectorList = <DropdownModel[]>[];
      }
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vcSchoolSectorForm.controls[controlName].setValue(null);
        this.vcSchoolSectorModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vcSchoolSectorForm.controls[controlName].setValue(isoDateString);
    this.vcSchoolSectorModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateVCSchoolSectorDetails() {
    if (!this.vcSchoolSectorForm.valid) {
      this.validateAllFormFields(this.vcSchoolSectorForm);
      return;
    }
    this.formatAndSetDate(this.vcSchoolSectorForm.get('DateOfAllocation').value, 'DateOfAllocation');
    this.formatAndSetDate(this.vcSchoolSectorForm.get('DateOfRemoval').value, 'DateOfRemoval');
    this.setValueFromFormGroup(this.vcSchoolSectorForm, this.vcSchoolSectorModel);

    this.vcSchoolSectorService.createOrUpdateVCSchoolSector(this.vcSchoolSectorModel)
      .subscribe((vcSchoolSectorResp: any) => {

        if (vcSchoolSectorResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.VCSchoolSector.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vcSchoolSectorResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VCSchoolSector deletion errors =>', error);
      });
  }

  // Create vcSchoolSector form and returns {FormGroup}
  createVCSchoolSectorForm(): FormGroup {
    return this.formBuilder.group({
      VCSchoolSectorId: new FormControl(this.vcSchoolSectorModel.VCSchoolSectorId),
      AcademicYearId: new FormControl({ value: this.vcSchoolSectorModel.AcademicYearId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      VCId: new FormControl({ value: this.vcSchoolSectorModel.VCId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SchoolVTPSectorId: new FormControl({ value: this.vcSchoolSectorModel.SchoolVTPSectorId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      DateOfAllocation: new FormControl({ value: new Date(this.vcSchoolSectorModel.DateOfAllocation), disabled: this.PageRights.IsReadOnly }, Validators.required),
      DateOfRemoval: new FormControl({ value: this.getDateValue(this.vcSchoolSectorModel.DateOfRemoval), disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.vcSchoolSectorModel.IsActive, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
