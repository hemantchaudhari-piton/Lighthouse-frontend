import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { VTAcademicClassSectionService } from '../vtacademicclasssection.service';
import { VTAcademicClassSectionModel } from '../vtacademicclasssection.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { VocationalTrainerService } from 'app/main/vocational-trainers/vocational-trainer.service';
import { isEmpty } from 'lodash';
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
import { MatOptionModule } from '@angular/material/core';
import {  MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FuseUtils } from '@fuse/utils';

@Component({
  selector: 'vtacademicclasssection',
  templateUrl: './create-vtacademicclasssection.component.html',
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,MatInputModule,MatSelectModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatOptionModule],
  styleUrls: ['./create-vtacademicclasssection.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateVTAcademicClassSectionComponent extends BaseComponent<VTAcademicClassSectionModel> implements OnInit {
  vtacademicclasssectionForm: FormGroup;
  vtacademicclasssectionModel: VTAcademicClassSectionModel;
  minAllocationDate: Date;
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;
  @ViewChild(MatAutocompleteTrigger) _autoVT: MatAutocompleteTrigger;
  academicYearList: [DropdownModel];
  classList: [DropdownModel];
  sectionList: [DropdownModel];
  vtList: [DropdownModel];
  // filteredVTItems:[DropdownModel];
  filteredVTItems:DropdownModel[] = [];
  gvtList: [DropdownModel];
  filteredGVTItems: DropdownModel[] = [];
  selectedVTId: any;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private vtacademicclasssectionService: VTAcademicClassSectionService,
    private vocationalTrainerService: VocationalTrainerService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default vtacademicclasssection Model
    this.vtacademicclasssectionModel = new VTAcademicClassSectionModel();
  }

  ngOnInit(): void {

    this.vtacademicclasssectionService.getVTAcademicClassSection(this.UserModel).subscribe(results => {
      if (results[0].Success) {

        this.academicYearList = results[0].Results.$values;
        this.vtacademicclasssectionForm.controls['AcademicYearId'].setValue(this.academicYearList[0].Id);
      }

      if (results[1].Success) {
          this.classList = results[1].Results.$values;
      }

      // if (results[2].Success) {
      //   this.sectionList = results[2].Results.$values;
      // }

      if (results[4].Success) {
        this.gvtList = results[4].Results.$values;
      }

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.vtacademicclasssectionModel = new VTAcademicClassSectionModel();

          } else {
            var vtacademicclasssectionId: string = params.get('vtacademicclasssectionId')

            this.vtacademicclasssectionService.getVTAcademicClassSectionById(vtacademicclasssectionId)
              .subscribe((response: any) => {
                this.vtacademicclasssectionModel = response.Result;

                if (this.PageRights.ActionType == this.Constants.Actions.Edit){
                  this.vtacademicclasssectionModel.RequestType = this.Constants.PageType.Edit;
                  this.vtacademicclasssectionForm.controls['AcademicYearId'].disable();
                  this.vtacademicclasssectionForm.controls['ClassId'].disable();
                  this.vtacademicclasssectionForm.controls['SectionId'].disable();
                  this.vtacademicclasssectionForm.controls['SSJId'].disable();
                  this.vtacademicclasssectionForm.controls['DateOfAllocation'].disable();
                  if(this.vtacademicclasssectionModel.VTId != null){
                  this.vtacademicclasssectionForm.controls['VTId'].disable();            
                  }
                }
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.vtacademicclasssectionModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }

                this.onChangeVT(this.vtacademicclasssectionModel.VTId);
                this.onChangeClass(this.vtacademicclasssectionModel.ClassId);
                this.onChangeSSJ(this.vtacademicclasssectionModel.SSJId);

                this.vtacademicclasssectionForm = this.createVTAcademicClassSectionForm();
                const ssj = this.gvtList.find(s => s.Id === this.vtacademicclasssectionModel.SSJId);
                this.setSSJValue(ssj)
                this.setSearchFilterValues();
              });
          }
        }
      });
    });

    this.vtacademicclasssectionForm = this.createVTAcademicClassSectionForm();
    this.setSearchFilterValues();
  }

  private setSearchFilterValues () {
    this.vtacademicclasssectionForm.controls['SSJId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredGVTItems = this.gvtList.filter(ssj => {
          const ssjName = ssj.Name.toString().toLowerCase();
          return ssjName.includes(inputValue);
        });
      } else {
        this.filteredGVTItems = this.gvtList;
      }
    });
    this.vtacademicclasssectionForm.controls['VTId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredVTItems = this.vtList.filter(vt => {
          const vtName = vt.Name.toString().toLowerCase();
          return vtName.includes(inputValue);
        });
      } else {
        this.filteredVTItems = this.vtList;
      }
    });
  }

  
  displaySSJName(ssj: DropdownModel): string {
    return ssj ? ssj.Name : '';
  }
  onFocus(): void {
    this.filteredGVTItems = this.gvtList;
  }

  selectSSJ(event: MatAutocompleteSelectedEvent): void {
    const selectedSSJ = event.option.value;
    this.vtacademicclasssectionForm.controls['SSJId'].setValue(selectedSSJ)
    this.onChangeSSJ(selectedSSJ.Id);
  }
  setSSJValue(event) {
    this.vtacademicclasssectionForm.controls['SSJId'].setValue(event)
  }


  displayVTName(vt: DropdownModel): string {
    return vt ? vt.Name : '';
  }
  onFocusVT(): void {
    this.filteredVTItems = this.vtList;
  }
  clearDate(controlName: string) {
    this.vtacademicclasssectionForm.controls[controlName].setValue(null);
    if (controlName === 'DateOfRemovalVTACS') {
    this.vtacademicclasssectionForm.controls["IsActive"].setValue(true)
    }
  }
  handleDateChange() {
    this.vtacademicclasssectionForm.controls.DateOfRemoval.setValue(null);
  }

  selectVT(event: MatAutocompleteSelectedEvent): void {
    const selectedVT = event.option.value;
    this.vtacademicclasssectionForm.controls['VTId'].setValue(selectedVT)
    this.onChangeVT(selectedVT.Id);
  }
  setVTValue(event) {
    this.vtacademicclasssectionForm.controls['VTId'].setValue(event)
  }

onChangeSSJ(SSJId){
  let promise = new Promise((resolve) => {
    this.commonService.GetMasterDataByType({ DataType: 'UsersByRole',  UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode,ParentId: SSJId, SelectTitle: "SSJId" }, false).subscribe((response) => {
      if (response.Success) {
        this.vtList = response.Results.$values;
        if(this.PageRights.ActionType !== this.Constants.Actions.New){
        const vt = this.vtList.find(s => s.Id === this.vtacademicclasssectionModel.VTId);
        this.setVTValue(vt)
        }
      }
      resolve(true);
    });
  });
}

  onChangeVT(accountId) { 
    if(accountId){
    this.vocationalTrainerService.getVocationalTrainerById(accountId).subscribe((response: any) => {
      var VtModel = response.Result;
        this.vtacademicclasssectionForm.controls['DateOfAllocation'].setValidators([Validators.required]); 
      if (VtModel == null) {
        var errorMessages = this.getHtmlMessage(["The selected VT details are not present in <b>Vocational Trainner</b>.<br><br> Please visit the <a href='/vocational-trainers'><b>Vocational Trainer</b></a> page and provide required details for the selected VT."]);
        this.dialogService.openShowDialog(errorMessages);
        this.vtacademicclasssectionForm.controls['VTId'].setValue(null);
      }
     });
   }
    this.commonService.GetMasterDataByType({
      DataType: 'DateOfAllocationVT', ParentId: accountId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: "Date of Allocation VT"
    }, false).subscribe((response) => {
      if (response.Success) {
        this.minAllocationDate = new Date( response.Results.$values[0].Description);
        if (response.Results.$values.length == 0) {
        }
      }
  });
  }

  onChangeClass(classId) {
    var SSJDetails = this.vtacademicclasssectionForm.get('SSJId').value;
    var SSJId = SSJDetails.Id;
    let promise = new Promise((resolve) => {
      this.commonService.GetMasterDataByType({ DataType: 'SectionsByVTACS', DataTypeID1:SSJId, ParentId: classId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: 'Sections' }, false).subscribe((response) => {
        if (response.Success) {
          this.sectionList = response.Results.$values;
          if(isEmpty(this.sectionList)){
            var errorMessages = this.getHtmlMessage(["The selected class sections already mapped  <b>Sections</b>.<br><br>"]);
            this.dialogService.openShowDialog(errorMessages);
          }
        }
        resolve(true);
      });
    });
  }
  formatAndSetDate(inputDate: Date, controlName: string) {
    if (!inputDate) {
        this.vtacademicclasssectionForm.controls[controlName].setValue(null);
        this.vtacademicclasssectionModel[controlName] = null;
        return;
    }
    const dateObject = new Date(inputDate);
    const isoDateString = this.formatDate(dateObject);
    this.vtacademicclasssectionForm.controls[controlName].setValue(isoDateString);
    this.vtacademicclasssectionModel[controlName] = isoDateString;
  }

  formatDate(date: Date): string {
      return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
  }
  saveOrUpdateVTAcademicClassSectionDetails() {
    if (!this.vtacademicclasssectionForm.valid) {
      this.validateAllFormFields(this.vtacademicclasssectionForm);
      return;
    }
    const SSJDetails = this.vtacademicclasssectionForm.get('SSJId').value;
    this.vtacademicclasssectionForm.controls['SSJId'].setValue(SSJDetails.Id);
    const VTDetails = this.vtacademicclasssectionForm.get('VTId').value;
    if(VTDetails != null)
    {
      this.vtacademicclasssectionForm.controls['VTId'].setValue(VTDetails.Id);
    }
    this.formatAndSetDate(this.vtacademicclasssectionForm.get('DateOfAllocation').value, 'DateOfAllocation');
    this.formatAndSetDate(this.vtacademicclasssectionForm.get('DateOfRemoval').value, 'DateOfRemoval');
    this.formatAndSetDate(this.vtacademicclasssectionForm.get('DateOfRemovalVTACS').value, 'DateOfRemovalVTACS');
    this.setValueFromFormGroup(this.vtacademicclasssectionForm, this.vtacademicclasssectionModel);

    this.vtacademicclasssectionService.createOrUpdateVTAcademicClassSection(this.vtacademicclasssectionModel)
      .subscribe((vtacademicclasssectionResp: any) => {
        if (vtacademicclasssectionResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );
            console.log("this.vtacademicclasssectionModel.DateOfRemoval",this.vtacademicclasssectionModel.DateOfRemoval)
            if (!this.vtacademicclasssectionModel.DateOfRemoval){
            console.log("this.vtacademicclasssectionModel.DateOfRemoval",this.vtacademicclasssectionModel.DateOfRemoval)

              this.router.navigate([RouteConstants.VTAcademicClassSection.List]);
            }
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vtacademicclasssectionResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VTAcademicClassSection deletion errors =>', error);
      });

      if (this.PageRights.ActionType == this.Constants.Actions.Edit && this.vtacademicclasssectionModel.DateOfRemoval !=null){
          this.vtacademicclasssectionModel.IsActive = true;
          this.vtacademicclasssectionModel.DateOfRemoval = null;
          this.vtacademicclasssectionModel.DateOfAllocation = null;
          this.vtacademicclasssectionModel.RequestType = 0;
          this.vtacademicclasssectionModel.VTId = null;
          this.vtacademicclasssectionModel.VTAcademicClassSectionId = FuseUtils.NewGuid();
          this.vtacademicclasssectionService.createOrUpdateVTAcademicClassSection(this.vtacademicclasssectionModel)
      .subscribe((vtacademicclasssectionResp: any) => {

        if (vtacademicclasssectionResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.NewEntryCreated,
              this.Constants.Html.SuccessSnackbar
            );
            this.router.navigate([RouteConstants.VTAcademicClassSection.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(vtacademicclasssectionResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('VTAcademicClassSection deletion errors =>', error);
      });
      }
  }

  //Create vtacademicclasssection form and returns {FormGroup}
  createVTAcademicClassSectionForm(): FormGroup {
    return this.formBuilder.group({
      VTAcademicClassSectionId: new FormControl(this.vtacademicclasssectionModel.VTAcademicClassSectionId),
      AcademicYearId: new FormControl({ value: this.vtacademicclasssectionModel.AcademicYearId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      ClassId: new FormControl({ value: this.vtacademicclasssectionModel.ClassId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      SectionId: new FormControl({ value: this.vtacademicclasssectionModel.SectionId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      VTId: new FormControl({ value: this.vtacademicclasssectionModel.VTId, disabled: this.PageRights.IsReadOnly }),
      SSJId: new FormControl({ value: this.vtacademicclasssectionModel.SSJId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      DateOfAllocation: new FormControl({ value: this.getDateValue(this.vtacademicclasssectionModel.DateOfAllocation), disabled: this.PageRights.IsReadOnly }),
      DateOfRemoval: new FormControl({ value: this.getDateValue(this.vtacademicclasssectionModel.DateOfRemoval), disabled: this.PageRights.IsReadOnly }),
      DateOfRemovalVTACS: new FormControl({ value: this.getDateValue(this.vtacademicclasssectionModel.DateOfRemovalVTACS), disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.vtacademicclasssectionModel.IsActive, disabled: true }),
    });
  }
}
