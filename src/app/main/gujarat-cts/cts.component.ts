import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropdownModel } from 'app/models/dropdown.model';
import { GujaratCtsModel } from './cts.model';
import { GujaratCtsService } from './cts.service';
import { SchoolClassService } from '../school-classes/school-class.service';
import { MatSelect } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteActivatedEvent, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,TranslateModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatCardModule,MatSelect,MatSelectModule],
  selector: 'data-list-view',
  templateUrl: './cts.component.html',
  styleUrls: ['./cts.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class GujaratCTSComponent extends BaseListComponent<GujaratCtsModel> implements OnInit {
  AcademicRolloverTransferSelectedId: any = [];
  gujaratCtsModel: GujaratCtsModel;
  ctsStudentForm: FormGroup;
  ctsTrainerForm: FormGroup;

  vtpList: DropdownModel[];
  filteredVTPtems: any;
  vcList: DropdownModel[];
  filteredVCItems: any;
  schoolList: DropdownModel[];
  filteredSchoolItems: any;
  filteredSchools: DropdownModel[] = [];
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;
  vtList: DropdownModel[];
  filteredVTItems: any;
  classList: DropdownModel[];
  studentClassList: DropdownModel[];
  sectionList: DropdownModel[];
  vtSectionList: DropdownModel[];
  academicYearList: DropdownModel[];
  sectorList: DropdownModel[];
  jobRoleList: DropdownModel[];

  noSectionId = "40b2d9eb-0dbf-11eb-ba32-0a761174c048";
  studentList: any = [];
  vtpId: string;
  vcId: string;
  schoolId: string;
  udise: string;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public schoolClassServices : SchoolClassService,
    public snackBar: MatSnackBar,
    // @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger,
    private translationLoaderService: FuseTranslationLoaderService,
    public zone: NgZone,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private gujaratCtsService: GujaratCtsService) {
    super(commonService, router, routeParams, snackBar, zone);

    this.gujaratCtsModel = new GujaratCtsModel();
    this.ctsStudentForm = this.CreateSearchCTSForm();
    this.ctsTrainerForm = this.CreateStudentMappingToTrainerForm();

    this.displayedColumns = ['SchoolName', 'ClassName', 'SectionName', 'StudentName', 'Gender', 'DateOfBirth', 'StudentRollNumber', 'FatherName', 'MotherName', 'IsMapWithTrainer'];
  }

  ngOnInit(): void {
    this.gujaratCtsService.getDropdownForCts(this.UserModel).subscribe(results => {
      if (results[0].Success) {
        this.schoolList = results[0].Results.$values;
        this.filteredSchoolItems = this.schoolList.slice();
      }

      if (results[1].Success) {
        this.classList = results[1].Results.$values;
        this.studentClassList = results[1].Results.$values;
      }

      if (results[2].Success) {
        this.sectionList = results[2].Results.$values;
      }
      const school = this.schoolList.find(s => s.Id === this.gujaratCtsModel.SchoolId);
      this.setValue(school);
      this.IsLoading = true;
    });
    this.ctsStudentForm.controls['SchoolId'].valueChanges.subscribe(value => {
        if (value) {
          const inputValue = value.toString().toLowerCase();
          this.filteredSchools = this.schoolList.filter(school => {
            const schoolName = school.Name.toString().toLowerCase();
            return schoolName.includes(inputValue);
          });
        } else {
          this.filteredSchools = this.schoolList;
        }
      });
      this.ctsTrainerForm.controls['SchoolId'].valueChanges.subscribe(value => {
        if (value) {
          const inputValue = value.toString().toLowerCase();
          this.filteredSchools = this.schoolList.filter(school => {
            const schoolName = school.Name.toString().toLowerCase();
            return schoolName.includes(inputValue);
          });
        } else {
          this.filteredSchools = this.schoolList;
        }
      });
    }
  
    displaySchoolName(school: DropdownModel): string {
      return school ? school.Name : '';
    }
    onFocus(): void {
      this.filteredSchools = this.schoolList;
  }

//   onChangeSchool(schoolId): Promise<any> {
//     let promise = new Promise((resolve, reject) => {

//       this.commonService.GetMasterDataByType({ DataType: 'VTPForCTS', SelectTitle: 'Vocational Training Provider', ParentId: schoolId }, false)
//         .subscribe((response: any) => {
//           if (response.Success) {
//             this.vtpList = response.Results;
//             this.filteredVTPtems = this.vtpList.slice();

//             this.vcList = [];
//             this.filteredVCItems = [];

//             this.vtList = [];
//             this.filteredVTItems = [];

//             this.academicYearList = [];
//             this.vtSectionList = [];
//             this.tableDataSource.data = [];

//             this.ctsTrainerForm.get('VTPId').setValue(null);
//             this.ctsTrainerForm.get('VCId').setValue(null);
//             this.ctsTrainerForm.get('VTId').setValue(null);
//           }

//           this.IsLoading = false;
//           resolve(true);
//         }, error => {
//           console.log(error);
//           resolve(false);
//         });
//     });
//     return promise;
//   }

//   onChangeVTP(vtpId): Promise<any> {
//     let promise = new Promise((resolve, reject) => {
//       let schoolId = this.ctsStudentForm.get('SchoolId').value;

//       this.commonService.GetMasterDataByType({ DataType: 'VCForCTS', UserId: vtpId, ParentId: schoolId, SelectTitle: 'Vocational Coordinator' }, false).subscribe((response: any) => {
//         if (response.Success) {
//           this.vcList = response.Results;
//           this.filteredVCItems = this.vcList.slice();

//           this.vtList = [];
//           this.filteredVTItems = [];

//           this.academicYearList = [];
//           this.vtSectionList = [];

//           this.ctsTrainerForm.get('VCId').setValue(null);
//           this.ctsTrainerForm.get('VTId').setValue(null);
//         }

//         this.IsLoading = false;
//         resolve(true);
//       }, error => {
//         console.log(error);
//         resolve(false);
//       });
//     });
//     return promise;
//   }

//   onChangeVC(vcId): Promise<any> {
//     let schoolId = this.ctsStudentForm.get('SchoolId').value;

//     let promise = new Promise((resolve, reject) => {
//       this.IsLoading = true;
//       this.commonService.GetMasterDataByType({ DataType: 'VTForCTS', UserId: vcId, ParentId: schoolId, SelectTitle: 'School' }).subscribe((response: any) => {
//         if (response.Success) {
//           this.vtList = response.Results;
//           this.filteredVTItems = this.vtList.slice();

//           this.academicYearList = [];
//           this.vtSectionList = [];

//           this.ctsTrainerForm.get('VTId').setValue(null);
//         }

//         this.IsLoading = false;
//         resolve(true);
//       }, error => {
//         console.log(error);
//         resolve(false);
//       });
//     });
//     return promise;
//   }

//   onChangeVT(vtId) {
//     this.IsLoading = true;
//     let classId = this.ctsStudentForm.get('ClassId').value;

//     this.academicYearList = [];
//     this.vtSectionList = [];

//     this.gujaratCtsService.getAYAndSectionByVT(this.UserModel.RoleCode, classId, vtId).subscribe((results: any) => {
//       if (results[0].Success) {
//         this.academicYearList = results[0].Results;
//       }

//       if (results[1].Success) {
//         this.vtSectionList = results[1].Results;
//       }

//       this.IsLoading = false;
//     }, error => {
//       console.log(error);
//       this.IsLoading = false;
//     });
//   }



selectSchool(event: MatAutocompleteSelectedEvent): void {
    const selectedSchool = event.option.value;
    this.ctsTrainerForm.controls['SchoolId'].setValue(selectedSchool)
    this.onChangeSchool(selectedSchool.Id);
  }
  setValue(event) {
    this.ctsTrainerForm.controls['SchoolId'].setValue(event)
  }

// onChangeSchool(schoolId): Promise<any> {
//     return new Promise((resolve, reject) => {
//       this.commonService.GetMasterDataByType({ DataType: 'Sectors', RoleId: this.UserModel.RoleCode, UserId: this.UserModel.UserTypeId, ParentId: schoolId, SelectTitle: "Sector" }).subscribe((response) => {
//         if (response.Success) {
//           this.sectorList = response.Results.$values;
//           console.log("this.sectorList",this.sectorList)

//           if (this.IsLoading) {
//             this.ctsTrainerForm.controls['SectorId'].setValue(null);
//             this.ctsTrainerForm.controls['JobRoleId'].setValue(null);
//             this.jobRoleList = <DropdownModel[]>[];
//           }
//         }

//         resolve(true);
//       });
//     });
//   }

onChangeSchool(schoolId): Promise<any> {
    this.ctsTrainerForm.controls['SectorId'].setValue(null);
    this.ctsTrainerForm.controls['JobRoleId'].setValue(null);
    this.ctsTrainerForm.controls['AcademicYearId'].setValue(null);
    this.ctsTrainerForm.controls['VTClassId'].setValue(null);
    this.ctsTrainerForm.controls['VTSectionId'].setValue(null);
    // this.studentClassForm.controls['AcademicYearId'].setValue(null);
    // this.studentClassForm.controls['ClassId'].setValue(null);
    // this.studentClassForm.controls['SectionId'].setValue(null);
    // this.studentClassForm.controls['ClassSection'].setValue(null);

    this.IsLoading = true;
    let promise = new Promise((resolve, reject) => {
      this.commonService.GetMasterDataByType({ DataType: 'SectorsBySSJ', ParentId: schoolId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: 'Sectors' }).subscribe((response) => {
        if (response.Success) {
          this.sectorList = response.Results.$values;
          if (response.Results.$values.length == 1) {
            // var errorMessages = this.getHtmlMessage(["The selected School is not mapped with any <b>Sector</b> and <b>JobRole</b>.<br><br> Please visit the <a href='/schoolsectorjobs'><b>School Sector JobRole</b></a> page and assign a Sector & Jobrole to the required School."]);
            // this.dialogService.openShowDialog(errorMessages);
            // this.ctsTrainerForm.controls['SchoolId'].setValue(null);
          }
          if (response.Results.$values.length == 2 && this.UserModel.RoleCode == 'VT') {
            this.ctsTrainerForm.controls['SectorId'].setValue(this.sectorList[1].Id);
            this.ctsTrainerForm.controls['SectorId'].disable();
            this.onChangeSector(this.sectorList[1].Id);

          }
        }
        resolve(true);
      });

    });
    return promise;
  }


  onChangeSector(sectorId): Promise<any> {
    this.ctsTrainerForm.controls['JobRoleId'].setValue(null);
    this.ctsTrainerForm.controls['AcademicYearId'].setValue(null);
    this.ctsTrainerForm.controls['VTClassId'].setValue(null);
    this.ctsTrainerForm.controls['VTSectionId'].setValue(null);
    return new Promise((resolve, reject) => {
        let schoolId = this.ctsTrainerForm.get('SchoolId').value;
        console.log(schoolId, "this.SchoolInputId");
        this.commonService.GetMasterDataByType({ DataType: 'JobRolesBySSJ', DataTypeID1: schoolId.Id, DataTypeID2: sectorId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: "Job Role" }).subscribe((response) => {
    //   this.commonService.GetMasterDataByType({ DataType: 'JobRoles', ParentId: sectorId, SelectTitle: "Job Role" }).subscribe((response) => {
        if (response.Success) {
          this.jobRoleList = response.Results.$values;

          if (this.IsLoading) {
            this.ctsTrainerForm.controls['JobRoleId'].setValue(null);
          }
        }

        resolve(true);
      });
    });
  }

  onChangeJobRole(jobRoleId): Promise<any> {
      this.ctsTrainerForm.controls['AcademicYearId'].setValue(null);
      this.ctsTrainerForm.controls['VTClassId'].setValue(null);
      this.ctsTrainerForm.controls['VTSectionId'].setValue(null);

      var schoolId = this.ctsTrainerForm.get('SchoolId').value;
      var sectorId = this.ctsTrainerForm.get('SectorId').value;

    return new Promise((resolve, reject) => {

      this.commonService.GetMasterDataByType({ DataType: 'YearsBySSJ', DataTypeID1: schoolId.Id, DataTypeID2: sectorId, DataTypeID3: jobRoleId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: "Academic Years" }).subscribe((response) => {

        if (response.Success) {
          this.academicYearList = response.Results.$values;
          console.log("this.academicYearList",this.academicYearList);
          if (response.Results.$values.length == 1) {
            var errorMessages = this.getHtmlMessage(["The selected School Sector JobRole is not mapped with any <b>Academic Class Section</b>.<br><br> Please visit the <a href='/vtacademicclasssections'><b>VT Academic Class Sections</b></a> page."]);
            this.dialogService.openShowDialog(errorMessages);
            this.ctsTrainerForm.controls['JobRoleId'].setValue(null);
          }
          if (response.Results.$values.length == 2) {
            this.ctsTrainerForm.controls['AcademicYearId'].setValue(response.Results.$values[1].Id);
            this.ctsTrainerForm.controls['AcademicYearId'].disable();
            this.onChangeAcademicYear(response.Results.$values[1].Id);
          }
        }
        resolve(true);
      });
    });


  }

  

//   onChangeClass(classId) {
//     this.ctsTrainerForm.controls['VTClassId'].setValue(classId);
//     this.vtSectionList = [];
//     this.getStudentsFromGujaratCTS();
//   }

  onChangeAcademicYear(academicYearId): Promise<any> {
      this.ctsTrainerForm.controls['VTClassId'].setValue(null);
      this.ctsTrainerForm.controls['VTSectionId'].setValue(null);
    //   this.ctsTrainerForm.controls['VTSectionId'].setValue(null);

      var schoolId = this.ctsTrainerForm.get('SchoolId').value;
      var sectorId = this.ctsTrainerForm.get('SectorId').value;
      var jobRoleId = this.ctsTrainerForm.get('JobRoleId').value;

    let promise = new Promise((resolve, reject) => {
    console.log(schoolId,"schoolIdschoolId")
      schoolId = schoolId;
      this.commonService.GetMasterDataByType({ DataType: 'ClassesByACS', DataTypeID1: schoolId.Id , DataTypeID2: sectorId, DataTypeID3: jobRoleId, ParentId: academicYearId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: 'Classes' }).subscribe((response) => {
        if (response.Success) {
          this.classList = response.Results.$values;
          if (response.Results.$values.length == 2 ) {
            this.ctsTrainerForm.controls['VTClassId'].setValue(response.Results.$values[1].Id);
            // this.ctsTrainerForm.controls['VTClassId'].disable();
            this.onChangeClass(response.Results.$values[1].Id);
          }
        }

        resolve(true);
      });
    });
    return promise;
  }
  
  onChangeClass(classId): Promise<any> {

    // this.classCheckForStream(VTClassId);

    this.getStudentsFromGujaratCTS();
      this.ctsTrainerForm.controls['VTSectionId'].setValue(null);
    //   this.ctsTrainerForm.controls['ClassSection'].setValue(null);

      var schoolId = this.ctsTrainerForm.get('SchoolId').value;
      var sectorId = this.ctsTrainerForm.get('SectorId').value;
      var jobRoleId = this.ctsTrainerForm.get('JobRoleId').value;
      var academicYearId = this.ctsTrainerForm.get('AcademicYearId').value;



    this.IsLoading = true;
    let promise = new Promise((resolve, reject) => {
   
      schoolId = schoolId['Id'];
      this.commonService.GetMasterDataByType({ DataType: 'SectionsByACS', DataTypeID1: schoolId, DataTypeID2: sectorId, DataTypeID3: jobRoleId, DataTypeID4: academicYearId, DataTypeID5: classId, UserId: this.UserModel.UserTypeId, roleId: this.UserModel.RoleCode, SelectTitle: 'Sections' }).subscribe((response) => {
        if (response.Success) {
          this.sectionList = response.Results.$values;
          if (response.Results.$values.length == 2 ) {
            this.ctsTrainerForm.controls['VTSectionId'].setValue(response.Results.$values[1].Id);
          }
        }
        resolve(true);
      });
    });


    return promise;

  }

  onStudentForVTMapping(event, sItem) {
    if (sItem == null) {
      this.studentList.forEach(s => {
        if (s.IsMapWithTrainer == 0) {
          s.IsSelected = event.checked;
        }
      });
    }
    else {
      let studentItem = this.studentList.find(s => s.CTSStudentId === sItem.CTSStudentId);
      studentItem.IsSelected = event.checked;
    }
  }

  resetFilters() {
    this.ctsStudentForm.reset();
    this.ctsTrainerForm.reset();

    this.vcList = [];
    this.filteredVCItems = [];
    this.schoolList = [];
    this.filteredSchoolItems = [];
    this.vtList = [];
    this.filteredVTItems = [];
    this.academicYearList = [];
    this.tableDataSource.data = [];

    this.ngOnInit();
  }

  getStudentsFromGujaratCTS() {
    if (!this.ctsStudentForm.valid) {
      this.validateAllFormFields(this.ctsStudentForm);
      return;
    }

    this.SearchBy.PageIndex = 0;
    this.SearchBy.PageSize = 2500;

    let studentParams = {
      SchoolId: this.ctsStudentForm.get('SchoolId').value.Id,
    //   "d8a13c9c-df18-410a-9599-16d622e74fd9",
      ClassId:this.ctsStudentForm.get('ClassId').value,
    //    "e0302e36-a8a7-49a0-b621-21d48986c43e",
      SectionId: this.ctsStudentForm.get('SectionId').value
    }

    this.gujaratCtsService.getStudentsFromGujaratCTS(studentParams).subscribe(response => {
      if (response.Success) {
        this.studentList = response.Result.$values;
        this.studentList.forEach(s => { s.IsSelected = (s.IsMapWithTrainer == 1); });

        this.tableDataSource.data = this.studentList;
        this.tableDataSource.sort = this.ListSort;
        this.tableDataSource.paginator = this.ListPaginator;
        this.tableDataSource.filteredData = this.tableDataSource.data;
        this.SearchBy.TotalResults = this.studentList.length;
      }

      setTimeout(() => {
        this.ListPaginator.pageIndex = this.SearchBy.PageIndex;
        this.ListPaginator.length = this.SearchBy.TotalResults;
      });

      this.IsLoading = false;
    }, error => {
      console.log(error);
    });
  }

  studentsMappingWithTrainer() {
    if (!this.ctsTrainerForm.valid) {
      this.validateAllFormFields(this.ctsTrainerForm);

      return;
    }

    let studentIds = this.studentList.filter(s => s.IsMapWithTrainer == 0 && s.IsSelected == true).map((s: any) => s.CTSStudentId);

    let studentForm = {
      AcademicYearId: this.ctsTrainerForm.get('AcademicYearId').value,
      SchoolId: this.ctsTrainerForm.get('SchoolId').value.Id,
      SectorId: this.ctsTrainerForm.get('SectorId').value,
      JobRoleId: this.ctsTrainerForm.get('JobRoleId').value,
    //   VTId: this.ctsTrainerForm.get('VTId').value,
      ClassId: this.ctsTrainerForm.get('VTClassId').value,
      SectionId: this.ctsTrainerForm.get('VTSectionId').value,
      StudentIds: studentIds,
      UserId: this.UserModel.UserId
    };

    this.dialogService
      .openConfirmDialog('Are you sure to transfer this record?')
      .afterClosed()
      .subscribe(confResp => {
        if (confResp) {
          this.gujaratCtsService.studentsMappingWithTrainer(this.UserModel, studentForm)
            .subscribe((resp: any) => {

              this.zone.run(() => {
                if (resp.Success) {
                  this.showActionMessage('Transfer Students completed for selected rows.', this.Constants.Html.SuccessSnackbar);
                  this.getStudentsFromGujaratCTS();
                }
              });

              this.IsLoading = false;
              this.ngOnInit();

            }, error => {
              console.log('Transfer SchoolVTPSector errors =>', error);
            });
        }
      });
  }

  syncStudentsFromGujaratCTSBySchool() {
    if (!this.ctsStudentForm.valid) {
      this.validateAllFormFields(this.ctsStudentForm);
      return;
    }

    let schoolId = this.ctsStudentForm.get('SchoolId').value.Id;
    let schoolItem: any = this.schoolList.find(s => s.Id == schoolId);
    let udis: string = null;
    
    this.commonService.GetMasterDataByType({ DataType: 'Schools', ParentId: schoolId, SelectTitle: 'School' }).subscribe((response: any) => {
        if (response.Success) {
          this.udise = response.Results.$values[1].Description;
          udis = response.Results.$values[1].Description;
          
        }
    

    let schoolParams = {
      SchoolId: schoolItem.Id,
    //   "94a2972a-40d1-4dfb-a4b3-3490d8b00905",
      UDISE:  this.udise,
    //    "24010104509",
      UserId: this.UserModel.UserId
    };

    this.gujaratCtsService.SyncStudentsFromGujaratCTS(schoolParams).subscribe(resp => {
      if (resp.Success) {
        this.zone.run(() => {
          if (resp.Success) {
            this.showActionMessage('Sync Students from Gujarat CST completed.', this.Constants.Html.SuccessSnackbar);
            this.getStudentsFromGujaratCTS();
          }
        });
      }

      this.IsLoading = false;
    }, error => {
      console.log(error);
    });
})
  }

  exportExcel(): void {
    this.IsLoading = true;

    let studentParams = {
      SchoolId: this.ctsStudentForm.get('SchoolId').value.Id,
      ClassId: this.ctsStudentForm.get('ClassId').value,
      SectionId: this.ctsStudentForm.get('SectionId').value
    }

    this.gujaratCtsService.getStudentsFromGujaratCTS(studentParams).subscribe(response => {
      this.exportExcelFromTable(response.Result.$values, "StudentsFromGujaratCTS");

      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }

  //Create CTS form and returns {FormGroup}
  CreateSearchCTSForm(): FormGroup {
    return this.formBuilder.group({
      SchoolId: new FormControl(),
      ClassId: new FormControl(),
      SectionId: new FormControl({value:this.gujaratCtsModel.SectionIds, disabled: this.PageRights.IsView}),
    });
  }

  //Create StudentMappingToTrainer form and returns {FormGroup}
  CreateStudentMappingToTrainerForm(): FormGroup {
    return this.formBuilder.group({
    //   VTPId: new FormControl(),
      SchoolId: new FormControl(),
      SectorId: new FormControl({ value: this.gujaratCtsModel.SectorId, disabled: this.PageRights.IsReadOnly }, Validators.required),
      JobRoleId: new FormControl({ value: this.gujaratCtsModel.JobRoleId, disabled: this.PageRights.IsReadOnly }, Validators.required),
    //   VCId: new FormControl(),
    //   VTId: new FormControl(),
      AcademicYearId: new FormControl(),
      VTClassId: new FormControl(),
      VTSectionId: new FormControl(),
    });
  }
}
