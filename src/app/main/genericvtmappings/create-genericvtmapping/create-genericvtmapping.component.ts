import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { GenericVTMappingService } from '../genericvtmapping.service';
import { GenericVTMappingModel } from '../genericvtmapping.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { VocationalCoordinatorService } from 'app/main/vocational-coordinators/vocational-coordinator.service';
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
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FuseUtils } from '@fuse/utils';
@Component({
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,MatSelectModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatInputModule],
  selector: 'genericvtmapping',
  templateUrl: './create-genericvtmapping.component.html',
  styleUrls: ['./create-genericvtmapping.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateGenericVTMappingComponent extends BaseComponent<GenericVTMappingModel> implements OnInit {
  genericvtmappingForm: FormGroup;
  genericvtmappingModel: GenericVTMappingModel;
  UserId: string;
  userList: DropdownModel[];
  userFilterList: any;
  gvtList: [DropdownModel];
  vtpList: [DropdownModel];
  vcList: [DropdownModel];
  vtList: [DropdownModel];
  filteredVcItems:DropdownModel[] = [];
  filteredVtItems:DropdownModel[] = [];
  filteredGVTItems:DropdownModel[] = [];
  filteredVtpItems:DropdownModel[] = [];
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;
  @ViewChild(MatAutocompleteTrigger) _autoSSJ: MatAutocompleteTrigger;
  @ViewChild(MatAutocompleteTrigger) _autoVT: MatAutocompleteTrigger;
  @ViewChild(MatAutocompleteTrigger) _autoVC: MatAutocompleteTrigger;


  minAllocationDate: Date;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private genericvtmappingService: GenericVTMappingService,
    private vocationalCoordinatorService: VocationalCoordinatorService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default genericvtmapping Model
    this.genericvtmappingModel = new GenericVTMappingModel();
  }

  ngOnInit(): void {

    this.genericvtmappingService.getGenericVTMapping(this.UserModel).subscribe(results => {

      if (results[0].Success) {
        this.gvtList = results[0].Results.$values;
      }

      if (results[1].Success) {
        this.vtpList = results[1].Results.$values;
      }
      this.genericvtmappingForm.controls['DateOfAllocation'].disable();
      
      if (results[2].Success) {
        this.vcList = results[2].Results.$values;
      }
      this.genericvtmappingForm.controls['DateOfAllocationVC'].disable();


      if (results[3].Success) {
        this.vtList = results[3].Results.$values;
      }

      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');

          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.genericvtmappingModel = new GenericVTMappingModel();            

          } else {
            var genericvtmappingId: string = params.get('genericvtmappingId')

            this.genericvtmappingService.getGenericVTMappingById(genericvtmappingId)
              .subscribe((response: any) => {
                this.genericvtmappingModel = response.Result;

                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.genericvtmappingModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.genericvtmappingModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }
                this.genericvtmappingForm = this.createGenericVTMappingForm();
                const vtp = this.vtpList.find(s => s.Id === this.genericvtmappingModel.VTPId);
                this.setValue(vtp);
                const vc = this.vcList.find(s => s.Id === this.genericvtmappingModel.VCId);
                this.setVCValue(vc);
                const vt = this.vtList.find(s => s.Id === this.genericvtmappingModel.VTId);
                this.setVTValue(vt);
                const ssj = this.gvtList.find(s => s.Id === this.genericvtmappingModel.SSJId);
                this.setSSJValue(ssj);
                this.setSearchFieldValues();
              });
          }
        }
      });
    });

    this.genericvtmappingForm = this.createGenericVTMappingForm();
    this.setSearchFieldValues();
  }

  private setSearchFieldValues () {
    this.genericvtmappingForm.controls['VTPId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredVtpItems = this.vtpList.filter(vtp => {
          const vtpName = vtp.Name.toString().toLowerCase();
          return vtpName.includes(inputValue);
        });
      } else {
        this.filteredVtpItems = this.vtpList;
      }
    });
    this.genericvtmappingForm.controls['VTId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredVtItems = this.vtList.filter(vt => {
          const vtName = vt.Name.toString().toLowerCase();
          return vtName.includes(inputValue);
        });
      } else {
        this.filteredVtItems = this.vtList;
      }
    });
    this.genericvtmappingForm.controls['VCId'].valueChanges.subscribe(value => {
      if (value) {
        const inputValue = value.toString().toLowerCase();
        this.filteredVcItems = this.vcList.filter(vc => {
          const vcName = vc.Name.toString().toLowerCase();
          return vcName.includes(inputValue);
        });
      } else {
        this.filteredVcItems = this.vcList;
      }
    });
    this.genericvtmappingForm.controls['SSJId'].valueChanges.subscribe(value => {
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
  }

  selectVTP(event: MatAutocompleteSelectedEvent): void {
    const selectedVTP = event.option.value;
    this.genericvtmappingForm.controls['VTPId'].setValue(selectedVTP)
    this.onVTPIdChange();
  }
  setValue(event) {
    this.genericvtmappingForm.controls['VTPId'].setValue(event)
  }
  displayVTPName(vtp: DropdownModel): string {
    return vtp ? vtp.Name : '';
  }
  onFocus(): void {
    this.filteredVtpItems = this.vtpList;
  }


  selectVC(event: MatAutocompleteSelectedEvent): void {
    const selectedVC = event.option.value;
    this.genericvtmappingForm.controls['VCId'].setValue(selectedVC)
    this.onVCIdChange();
  }
  setVCValue(event) {
    this.genericvtmappingForm.controls['VCId'].setValue(event)
  }
  displayVCName(Vc: DropdownModel): string {
    return Vc ? Vc.Name : '';
  }
  onFocusVC(): void {
    this.filteredVcItems = this.vcList;
  }


  selectVT(event: MatAutocompleteSelectedEvent): void {
    const selectedVT = event.option.value;
    this.genericvtmappingForm.controls['VTId'].setValue(selectedVT)
  }
  setVTValue(event) {
    this.genericvtmappingForm.controls['VTId'].setValue(event)
  }
  displayVTName(VT: DropdownModel): string {
    return VT ? VT.Name : '';
  }
  onFocusVT(): void {
    this.filteredVtItems = this.vtList;
  }

  selectSSJ(event: MatAutocompleteSelectedEvent): void {
    const selectedSSJ = event.option.value;
    this.genericvtmappingForm.controls['SSJId'].setValue(selectedSSJ)
  }
  setSSJValue(event) {
    this.genericvtmappingForm.controls['SSJId'].setValue(event)
  }
  displaySSJName(SSJ: DropdownModel): string {
    return SSJ ? SSJ.Name : '';
  }
  onFocusSSJ(): void {
    this.filteredGVTItems = this.gvtList;
  }

  onVTPIdChange(): void {
    const vtpId = this.genericvtmappingForm.get('VTPId').value;
    const dateOfAllocationVTPControl = this.genericvtmappingForm.get('DateOfAllocation');
    if (vtpId) {
      dateOfAllocationVTPControl.setValidators([Validators.required]);
      this.genericvtmappingForm.controls['DateOfAllocation'].enable();
    } else {
      dateOfAllocationVTPControl.clearValidators();
    }
  }

// Inside your component class
onVCIdChange(): void {

  const vcId = this.genericvtmappingForm.get('VCId').value;
  const dateOfAllocationVCControl = this.genericvtmappingForm.get('DateOfAllocationVC'); 


  if (vcId) {
    dateOfAllocationVCControl.setValidators([Validators.required]);
    this.genericvtmappingForm.controls['DateOfAllocationVC'].enable();
  } else {
    dateOfAllocationVCControl.clearValidators();
  }
}

onChangeDateOfAllocation(): void{
  const dateOfAllocationVT = this.genericvtmappingForm.get('DateOfAllocation');
  if(dateOfAllocationVT) {
    this.genericvtmappingForm.get('DateOfAllocationVC').setValue(null);
  }
}
 formatAndSetDate(inputDate: Date, controlName: string) {
  if (!inputDate) {
      this.genericvtmappingForm.controls[controlName].setValue(null);
      this.genericvtmappingModel[controlName] = null;
      return;
  }
  const dateObject = new Date(inputDate);
  const isoDateString = this.formatDate(dateObject);
  this.genericvtmappingForm.controls[controlName].setValue(isoDateString);
  this.genericvtmappingModel[controlName] = isoDateString;
}

formatDate(date: Date): string {
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}T${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('0000000' + date.getMilliseconds()).slice(-7)}Z`;
}

  saveOrUpdateGenericVTMappingDetails() {
    if (!this.genericvtmappingForm.valid) {
      this.validateAllFormFields(this.genericvtmappingForm);
      return;
    }
    this.formatAndSetDate(this.genericvtmappingForm.get('DateOfAllocation').value, 'DateOfAllocation');
    this.formatAndSetDate(this.genericvtmappingForm.get('DateOfRemoval').value, 'DateOfRemoval');
    this.formatAndSetDate(this.genericvtmappingForm.get('DateOfRemovalVT').value, 'DateOfRemovalVT');
    this.formatAndSetDate(this.genericvtmappingForm.get('DateOfRemovalVC').value, 'DateOfRemovalVC');
    this.formatAndSetDate(this.genericvtmappingForm.get('DateOfAllocationVC').value, 'DateOfAllocationVC');
    this.formatAndSetDate(this.genericvtmappingForm.get('DateOfRemovalGVT').value, 'DateOfRemovalGVT');
    const vtpDetails = this.genericvtmappingForm.get('VTPId').value;
    this.genericvtmappingForm.controls['VTPId'].setValue(vtpDetails ? vtpDetails.Id : null);
    const vtDetails = this.genericvtmappingForm.get('VTId').value;
    this.genericvtmappingForm.controls['VTId'].setValue(vtDetails ? vtDetails.Id : null);
    const vcDetails = this.genericvtmappingForm.get('VCId').value;
    this.genericvtmappingForm.controls['VCId'].setValue(vcDetails ? vcDetails.Id : null);
    const ssjDetails = this.genericvtmappingForm.get('SSJId').value;
    this.genericvtmappingForm.controls['SSJId'].setValue(ssjDetails ? ssjDetails.Id : null);
    this.setValueFromFormGroup(this.genericvtmappingForm, this.genericvtmappingModel);
    this.genericvtmappingService.createOrUpdateGenericVTMapping(this.genericvtmappingModel)
      .subscribe((genericvtmappingResp: any) => {

        if (genericvtmappingResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );
            if(this.PageRights.ActionType = this.Constants.Actions.New){
              this.router.navigate([RouteConstants.GenericVTMapping.List]);
            }
          });
          if((this.PageRights.ActionType = this.Constants.Actions.Edit) && !this.genericvtmappingModel.DateOfRemovalGVT){
            this.optimizeAndUpdateMapping();
          }
        }
        else {
          var errorMessages = this.getHtmlMessage(genericvtmappingResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('GenericVTMapping deletion errors =>', error);
      });
  }
  handleDateChange() {
    this.genericvtmappingForm.controls.DateOfRemoval.setValue(null);
    this.genericvtmappingForm.controls.DateOfRemovalVC.setValue(null);
    this.genericvtmappingForm.controls.DateOfRemovalVT.setValue(null);
  }
  
  optimizeAndUpdateMapping() {
    const resetMapping = (resetVT: boolean, resetVC: boolean, resetMainRemoval: boolean = false) => {
      if (resetVT) {
        this.genericvtmappingModel.VTId = null;
        this.genericvtmappingModel.DateOfRemovalVT = null;
      }
      if (resetVC) {
        this.genericvtmappingModel.VCId = null;
        this.genericvtmappingModel.DateOfAllocationVC = null;
        this.genericvtmappingModel.DateOfRemovalVC = null;
      }
      if (resetMainRemoval) {
        this.genericvtmappingModel.VTPId = null;
        this.genericvtmappingModel.DateOfAllocation = null;
        this.genericvtmappingModel.DateOfRemoval = null;
      }
      this.genericvtmappingModel.RequestType = 0;
      this.genericvtmappingModel.IsActive = true;
      this.genericvtmappingModel.GenericVTMappingId = FuseUtils.NewGuid();
    };
    const { DateOfRemoval, DateOfRemovalVT, DateOfRemovalVC } = this.genericvtmappingModel;
  
      // New logic: if all three dates are present, reset specific fields
      if (DateOfRemoval && DateOfRemovalVT && DateOfRemovalVC) {
        this.genericvtmappingModel.VTId = null;
        this.genericvtmappingModel.DateOfRemovalVT = null;
        this.genericvtmappingModel.VCId = null;
        this.genericvtmappingModel.DateOfAllocationVC = null;
        this.genericvtmappingModel.DateOfRemovalVC = null;
        this.genericvtmappingModel.VTPId = null;
        this.genericvtmappingModel.DateOfAllocation = null;
        this.genericvtmappingModel.DateOfRemoval = null;
        this.genericvtmappingModel.RequestType = 0;
        this.genericvtmappingModel.IsActive = true;
        this.genericvtmappingModel.GenericVTMappingId = FuseUtils.NewGuid();
    }  else if (DateOfRemoval && DateOfRemovalVC) {
      resetMapping(false, true, true);
    } else if (DateOfRemoval && DateOfRemovalVT) {
      resetMapping(true, false, true);
    } else if (DateOfRemovalVT && DateOfRemovalVC) {
      resetMapping(true, true);
    } else if (DateOfRemoval) {
      resetMapping(false, false, true);
    } else if (DateOfRemovalVC) {
      resetMapping(false, true);
    } else if (DateOfRemovalVT) {
      resetMapping(true, false);
    } else {
      return;
    }
  
    this.genericvtmappingService.createOrUpdateGenericVTMapping(this.genericvtmappingModel)
      .subscribe(
        (genericvtmappingResp: any) => {
          if (genericvtmappingResp.Success) {
            this.zone.run(() => {
              this.showActionMessage(
                this.Constants.Messages.NewEntryCreated,
                this.Constants.Html.SuccessSnackbar
              );
              this.router.navigate([RouteConstants.GenericVTMapping.List]);
            });
          } else {
            const errorMessages = this.getHtmlMessage(genericvtmappingResp.Errors.$values);
            this.dialogService.openShowDialog(errorMessages);
          }
        },
        error => {
          console.log('GenericVTMapping deletion errors =>', error);
        }
      );
  }
  clearDate(controlName: string) {
    this.genericvtmappingForm.controls[controlName].setValue(null);
    if (controlName === 'DateOfRemovalGVT') {
      this.genericvtmappingForm.controls["IsActive"].setValue(true)
      }
  }
  //Create genericvtmapping form and returns {FormGroup}
  createGenericVTMappingForm(): FormGroup {
    return this.formBuilder.group({
      GenericVTMappingId: new FormControl(this.genericvtmappingModel.GenericVTMappingId),
      SSJId: new FormControl({ value: this.genericvtmappingModel.SSJId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      VTPId: new FormControl({ value: this.genericvtmappingModel.VTPId, disabled: this.PageRights.IsReadOnly }),
      VCId: new FormControl({ value: this.genericvtmappingModel.VCId, disabled: this.PageRights.IsReadOnly }),
      VTId: new FormControl({ value: this.genericvtmappingModel.VTId, disabled: this.PageRights.IsReadOnly }),
      DateOfAllocation: new FormControl({ value: this.getDateValue(this.genericvtmappingModel.DateOfAllocation), disabled: this.PageRights.IsReadOnly }),
      DateOfRemoval: new FormControl({ value: this.getDateValue(this.genericvtmappingModel.DateOfRemoval), disabled: this.PageRights.IsReadOnly  }),
      DateOfRemovalVT: new FormControl({ value: this.getDateValue(this.genericvtmappingModel.DateOfRemovalVT), disabled: this.PageRights.IsReadOnly  }),
      DateOfRemovalVC: new FormControl({ value: this.getDateValue(this.genericvtmappingModel.DateOfRemovalVC), disabled: this.PageRights.IsReadOnly  }),
      IsActive: new FormControl({ value: this.genericvtmappingModel.IsActive, disabled: true}),
      DateOfAllocationVC: new FormControl({ value: this.getDateValue(this.genericvtmappingModel.DateOfAllocationVC), disabled: this.PageRights.IsReadOnly  }),
      DateOfRemovalGVT: new FormControl({ value: this.getDateValue(this.genericvtmappingModel.DateOfRemovalGVT), disabled: this.PageRights.IsReadOnly  }),
    });
  }
}
