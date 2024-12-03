import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { SchoolService } from '../school.service';
import { SchoolModel } from '../school.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  selector: 'school',
  templateUrl: './create-school.component.html',
  styleUrls: ['./create-school.component.scss'],
  encapsulation: ViewEncapsulation.None, standalone: true,
  imports: [MatInputModule, MatSelectModule, MatPaginatorModule, MatTableModule, CommonModule, RouterModule, ReactiveFormsModule, MatRadioModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, FuseSharedModule],
  animations: fuseAnimations
})
export class CreateSchoolComponent extends BaseComponent<SchoolModel> implements OnInit {
  schoolForm: FormGroup;
  schoolModel: SchoolModel;
  schoolCategoryList: [DropdownModel];
  academicyearList: [DropdownModel];
  phaseList: [DropdownModel];
  divisionList: [DropdownModel];
  stateList: [DropdownModel];
  districtList: [DropdownModel];
  schoolTypeList: [DropdownModel];
  schoolManagementList: [DropdownModel];
  blockList: [DropdownModel];
  clusterList: [DropdownModel];
  isSchoolUniqueid : boolean;
  enableGeoFencing: boolean;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private schoolService: SchoolService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default school Model
    this.schoolModel = new SchoolModel();
  }

  ngOnInit(): void {
    this.schoolService.getDropdownforSchool().subscribe((results) => {
      if (results[0].Success) {
        this.schoolCategoryList = results[0].Results.$values;
      }

      if (results[1].Success) {
        this.academicyearList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.schoolTypeList = results[2].Results.$values;
      }

      if (results[3].Success) {
        this.stateList = results[3].Results.$values;
      }

      if (results[4].Success) {
        this.schoolManagementList = results[4].Results.$values;
      }
      this.commonService.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'GeoFencing', SelectTitle: 'GeoFencing' }).subscribe((response: any) => {
        if (response.Results.$values.length == 2 && response.Results.$values[1].IsDisabled == false) {
            this.enableGeoFencing = true;
        } else {
            this.enableGeoFencing = false;
        }
    });
      this.route.paramMap.subscribe(params => {

        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.schoolModel = new SchoolModel();
            this.onChangeState(this.schoolModel.StateName);

          } else {
            var schoolId: string = params.get('schoolId');

            this.schoolService.getSchoolById(schoolId)
              .subscribe((response: any) => {
                this.schoolModel = response.Result;

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.schoolModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.schoolModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }

                this.onChangeAcademicYear(this.schoolModel.AcademicYearId);
                this.onChangeState(this.schoolModel.StateName);
                this.onChangeDivision(this.schoolModel.DivisionId);
                this.onChangeDistrict(this.schoolModel.DistrictCode);
                this.onChangeBlock(this.schoolModel.BlockId);
                this.schoolForm = this.createSchoolForm();
                this.setSchoolUniqueIdValidators();
              });
          }
        }
      });
    });

    this.schoolForm = this.createSchoolForm();
    this.setSchoolUniqueIdValidators();
  }
  setSchoolUniqueIdValidators() {
    const hostnameParts = window.location.hostname.split('.');
        
        // The first part of the hostname is the subdomain (tenant name)
    if (hostnameParts[0] === 'delhi') {
      this.isSchoolUniqueid = true;
      this.schoolForm.get('SchoolUniqueId').setValidators([
        Validators.maxLength(7),
        Validators.minLength(7),
        Validators.required,
        Validators.pattern(this.Constants.Regex.Number)
      ]);
    }
    else {
      this.isSchoolUniqueid = false;
    }
  }
  onChangeAcademicYear(academicYearId: any) {
    this.commonService.GetMasterDataByType({ DataType: 'ApprovalPhases', ParentId: academicYearId, SelectTitle: 'Approval Phase' }).subscribe((response: any) => {
      this.phaseList = response.Results.$values;
    });
  }

  onChangeState(stateId: any) {
    this.commonService.GetMasterDataByType({ DataType: 'Divisions', ParentId: stateId, SelectTitle: 'Division' }).subscribe((response: any) => {
      this.divisionList = response.Results.$values;
    });
  }

  onChangeDivision(divisionId: any) {
    var stateCode = this.schoolForm.get('StateName').value;

    this.commonService.GetMasterDataByType({ DataType: 'Districts', UserId: stateCode, ParentId: divisionId, SelectTitle: 'District' }).subscribe((response: any) => {
      this.districtList = response.Results.$values;
    });
  }

  onChangeDistrict(districtId: any) {
    this.commonService.GetMasterDataByType({ DataType: 'Blocks', UserId: this.Constants.DefaultStateId, ParentId: districtId, SelectTitle: 'Block' }).subscribe((response: any) => {
      this.blockList = response.Results.$values;
    });
  }

  onChangeBlock(blockId: any) {
    this.commonService.GetMasterDataByType({ DataType: 'Clusters', UserId: this.Constants.DefaultStateId, ParentId: blockId, SelectTitle: 'Cluster' }).subscribe((response: any) => {
      this.clusterList = response.Results.$values;
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.schoolForm.controls[controlName].setValue(null);
        this.schoolModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.schoolForm.controls[controlName].setValue(isoDateString);
    this.schoolModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateSchoolDetails() {
    if (!this.schoolForm.valid) {
      this.validateAllFormFields(this.schoolForm);
      return;
    }
    this.formatAndSetDate(this.schoolForm.get('DateOfRemoval').value, 'DateOfRemoval');
    this.setValueFromFormGroup(this.schoolForm, this.schoolModel);
    this.schoolService.createOrUpdateSchool(this.schoolModel)
      .subscribe((schoolResp: any) => {

        if (schoolResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.School.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(schoolResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('School deletion errors =>', error);
      });
  }

  //Create school form and returns {FormGroup}
  createSchoolForm(): FormGroup {
    return this.formBuilder.group({
      SchoolId: new FormControl(this.schoolModel.SchoolId),
      SchoolName: new FormControl({ value: this.schoolModel.SchoolName, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(150)]),
      SchoolCategoryId: new FormControl({ value: this.schoolModel.SchoolCategoryId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SchoolTypeId: new FormControl({ value: this.schoolModel.SchoolTypeId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SchoolManagementId: new FormControl({ value: this.schoolModel.SchoolManagementId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      Udise: new FormControl({ value: this.schoolModel.Udise, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(11), Validators.minLength(11), Validators.required, Validators.pattern(this.Constants.Regex.Number)]),
      AcademicYearId: new FormControl({ value: this.schoolModel.AcademicYearId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      PhaseId: new FormControl({ value: this.schoolModel.PhaseId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SchoolUniqueId: new FormControl({ value: this.schoolModel.SchoolUniqueId, disabled: this.PageRights.IsReadOnly }),
      StateName: new FormControl({ value: this.Constants.DefaultStateId = this.Constants.DefaultStateId, disabled: (this.Constants.DefaultStateId == this.Constants.DefaultStateId) }),
      DivisionId: new FormControl({ value: this.schoolModel.DivisionId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      DistrictCode: new FormControl({ value: this.schoolModel.DistrictCode, disabled: this.PageRights.IsReadOnly }, Validators.required),
      BlockId: new FormControl({ value: this.schoolModel.BlockId, disabled: this.PageRights.IsReadOnly }),
      ClusterId: new FormControl({ value: this.schoolModel.ClusterId, disabled: this.PageRights.IsReadOnly }),
      Village: new FormControl({ value: this.schoolModel.Village, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(150), Validators.maxLength(150)]),
      Panchayat: new FormControl({ value: this.schoolModel.Panchayat, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(150), Validators.maxLength(150)]),
      Pincode: new FormControl({ value: this.schoolModel.Pincode, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(6), Validators.minLength(6), Validators.pattern(this.Constants.Regex.Number)]),
      Demography: new FormControl({ value: this.schoolModel.Demography, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(250)),
      IsImplemented: new FormControl({ value: this.schoolModel.IsImplemented, disabled: this.PageRights.IsReadOnly || this.PageRights.ActionType == 'edit' }),
      Latitude: new FormControl({ value: this.schoolModel.Latitude, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(20), Validators.minLength(6)]),
      Longitude: new FormControl({ value: this.schoolModel.Longitude, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(20), Validators.minLength(6)]),
      Range: new FormControl({ value: this.schoolModel.Range, disabled: this.PageRights.IsReadOnly }, [Validators.maxLength(2), Validators.minLength(1)]),
      IsActive: new FormControl({ value: this.schoolModel.IsActive, disabled: true }),
      DateOfRemoval: new FormControl({ value: this.getDateValue(this.schoolModel.DateOfRemoval), disabled: this.PageRights.IsReadOnly }),
    });
  }
}
