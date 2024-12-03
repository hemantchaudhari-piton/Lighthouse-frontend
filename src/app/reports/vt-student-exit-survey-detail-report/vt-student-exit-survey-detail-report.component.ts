import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VTStudentExitSurveyReportModel } from './vt-student-exit-survey-detail-report.model';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from '../report.service';
import { DropdownModel } from 'app/models/dropdown.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table'
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'data-list-view',
  templateUrl: './vt-student-exit-survey-detail-report.component.html',
  styleUrls: ['./vt-student-exit-survey-detail-report.component.scss'],
  animations: fuseAnimations,
  standalone: true,
  imports: [MatTableExporterModule, MatIconModule,CommonModule, MatPaginator, MatTableModule,RouterModule ,MatFormFieldModule,MatSelectModule,ReactiveFormsModule,FuseSharedModule,MatTooltipModule],
  encapsulation: ViewEncapsulation.None
})

export class VTStudentExitSurveyReportComponent extends BaseListComponent<VTStudentExitSurveyReportModel> implements OnInit {
  vtStudentExitSurveyForm: FormGroup;

  academicyearList: [DropdownModel];
  classList: any = [];
  class10Id: string;
  currentYear:string;
  

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    public formBuilder: FormBuilder,
    private reportService: ReportService) {
    super(commonService, router, routeParams, snackBar, zone);

    this.displayedColumns = ['AcademicYear', 'VTPName', 'VCName', 'VTName', 'VTMobile', 'Sector', 'JobRole', 'Division', 'District', 'NameOfSchool', 'UdiseCode', 'Class', 'SeatNo', 'StudentUniqueId', 'StudentFullName', 'Gender', 'DOB', 'FatherName', 'MotherName', 'Category', /*'Religion',*/ 'StudentMobileNo', 'StudentWhatsAppNo', 'ParentMobileNo', 'CityOfResidence', 'DistrictOfResidence', 'BlockOfResidence', 'PinCode', 'StudentAddress', 'WillContHigherStudies', 'IsFullTime', 'CourseToPursue', 'OtherCourse', 'StreamOfEducation', 'OtherStreamStudying', 'WillContVocEdu', 'WillContVocational11', 'ReasonsNOTToContinue', 'WillContSameSector', 'SectorForTraining', 'OtherSector', 'CurrentlyEmployed', 'DetailsOfEmployment', 'WillBeFullTime', 'SectorsOfEmployment', 'WantToPursueAnySkillTraining', 'IsFulltimeWillingness', 'HveRegisteredOnEmploymentPortal', 'EmploymentPortalName', 'WillingToGetRegisteredOnNAPS', 'WantToKnowAboutOpportunities', 'CanLahiGetInTouch', 'CollectedEmailId', 'SurveyCompletedByStudentORParent', 'DateOfIntv', 'Remark', 'ExitSurveyStatus', 'SubmissionDate'];
    this.vtStudentExitSurveyForm = this.createVTStudentExitSurveyForm();
  }

  ngOnInit(): void {
    this.SearchBy.PageIndex = 0; // delete after script changed
    this.SearchBy.PageSize = 250; // delete after script changed

    this.reportService.GetExitSurveyReportDropdown(this.UserModel).subscribe(results => {
      if (results[0].Success) {
        this.academicyearList = results[0].Results.$values;
      }
      results[1].Results.$values.forEach(classItem => {
        if (classItem.Name == 'Class 10' || classItem.Name == 'Class 12') {
            this.classList.push(classItem);
        }
        if (classItem.Name === 'Class 10') {
          this.class10Id = classItem.Id; 
      }
    });

      this.vtStudentExitSurveyForm.get('ClassId').setValue(this.class10Id );
      const selectedAcademicYear = this.academicyearList.find(ay => ay.IsSelected === true);
      this.vtStudentExitSurveyForm.get('AcademicYearId').setValue(selectedAcademicYear.Id);
    });
  }

  ngAfterViewInit() {
    this.tableDataSource.paginator = this.ListPaginator;
  }

  onPageIndexChanged(evt) {
    this.SearchBy.PageIndex = evt.pageIndex;
    this.SearchBy.PageSize = evt.pageSize;

    this.onLoadStudentExitSurveyReportByCriteria();
  }

  resetFilters(): void {
    this.SearchBy.PageIndex = 0;
    this.vtStudentExitSurveyForm.reset();
    this.vtStudentExitSurveyForm.get('ClassId').setValue(this.class10Id );
    const selectedAcademicYear = this.academicyearList.find(ay => ay.IsSelected === true);
    this.vtStudentExitSurveyForm.get('AcademicYearId').setValue(selectedAcademicYear.Id);

    this.tableDataSource.data = [];
    this.tableDataSource.filteredData = [];
  }

  onLoadStudentExitSurveyReportByCriteria() {
    this.IsLoading = true;
    let class10thId = this.class10Id;

    this.getVTStudentExitSurveyReportsData().then(response => {



      if (this.vtStudentExitSurveyForm.get('ClassId').value == class10thId ) {
        this.displayedColumns = ['AcademicYear', 'VTPName', 'VCName', 'VTName', 'VTMobile', 'Sector', 'JobRole', 'Division', 'District', 'NameOfSchool', 'UdiseCode', 'Class', 'SeatNo', 'StudentUniqueId', 'StudentFullName', 'Gender', 'DOB', 'FatherName', 'MotherName', 'Category', 'Religion', 'StudentMobileNo', 'StudentWhatsAppNo', 'ParentMobileNo', 'CityOfResidence', 'DistrictOfResidence', 'BlockOfResidence', 'PinCode', 'StudentAddress', 'WillContHigherStudies', 'IsFullTime', 'CourseToPursue', 'OtherCourse', 'StreamOfEducation', 'OtherStreamStudying', 'WillContVocEdu', 'WillContVocational11', 'ReasonsNOTToContinue', 'WillContSameSector', 'SectorForTraining', 'OtherSector', 'CurrentlyEmployed', 'DetailsOfEmployment', 'WillBeFullTime', 'SectorsOfEmployment', 'WantToPursueAnySkillTraining', 'IsFulltimeWillingness', 'HveRegisteredOnEmploymentPortal', 'EmploymentPortalName', 'WillingToGetRegisteredOnNAPS', 'WantToKnowAboutOpportunities', 'CanLahiGetInTouch', 'CollectedEmailId', 'SurveyCompletedByStudentORParent', 'DateOfIntv', 'Remark', 'ExitSurveyStatus', 'SubmissionDate', 'ReasonForNotContinuingHigherEducation', 'ContinueVocationalEducationIn11thClss', 'ReasonForNotContinuingVocationalEducationIn11thClss','OtherReasonForNotContinuingVocationalEducationIn11thClss'];
      }
      else {
        this.displayedColumns = ['AcademicYear', 'VTPName', 'VCName', 'VTName', 'VTMobile', 'Sector', 'JobRole', 'Division', 'District', 'NameOfSchool', 'UdiseCode', 'Class', 'SeatNo', 'StudentUniqueId', 'StudentFullName', 'Gender', 'DOB', 'FatherName', 'MotherName', 'Category', 'Religion', 'StudentMobileNo', 'StudentWhatsAppNo', 'ParentMobileNo', 'CityOfResidence', 'DistrictOfResidence', 'BlockOfResidence', 'PinCode', 'StudentAddress', 'DoneInternship', 'InternshipCompletedSector', 'WillContHigherStudies', 'IsFullTime', 'CourseToPursue', 'OtherCourse', 'StreamOfEducation', 'OtherStreamStudying', 'WillContVocEdu', 'WillContVocational11', 'ReasonsNOTToContinue', 'WillContSameSector', 'SectorForTraining', 'OtherSector', 'CurrentlyEmployed','DetailsOfEmployment', 'WillBeFullTime', 'SectorsOfEmployment', 'WantToPursueAnySkillTraining', 'IsFulltimeWillingness', 'HveRegisteredOnEmploymentPortal', 'EmploymentPortalName', 'WillingToGetRegisteredOnNAPS', 'IntrestedInJobOrSelfEmploymentPost12th', 'PreferredLocations', 'ParticularLocation', 'WantToKnowAboutOpportunities', 'CanLahiGetInTouch', 'WantToKnowAbtPgmsForJobsNContEdu', 'CollectedEmailId', 'SurveyCompletedByStudentORParent', 'DateOfIntv', 'Remark', 'ExitSurveyStatus', 'SubmissionDate', 'ReasonForNotContinuingHigherEducation','InterestedEmployment'];
      }

      this.tableDataSource.data = response.Results.$values;
      this.tableDataSource.sort = this.ListSort;
      this.tableDataSource.paginator = this.ListPaginator;
      this.tableDataSource.filteredData = this.tableDataSource.data;

      this.SearchBy.TotalResults = response.TotalResults;

      setTimeout(() => {
        this.ListPaginator.pageIndex = this.SearchBy.PageIndex;
        this.ListPaginator.length = this.SearchBy.TotalResults;
      });

      this.zone.run(() => {
        if (this.tableDataSource.data.length == 0) {
          this.showNoDataFoundSnackBar();
        }
      });
      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }

  getVTStudentExitSurveyReportsData(): Promise<any> {
    if (!this.vtStudentExitSurveyForm.valid) {
      this.validateAllFormFields(this.vtStudentExitSurveyForm);
      return;
    }

    let studentUniqueId: string = this.vtStudentExitSurveyForm.get('StudentUniqueId').value;

    let exitSurveyParams = {
      UserId: this.UserModel.UserTypeId,
      UserType: this.UserModel.RoleCode,
      AcademicYearId: this.vtStudentExitSurveyForm.get('AcademicYearId').value,
      ClassId: this.vtStudentExitSurveyForm.get('ClassId').value,
      StudentId: null,
      StudentUniqueId: (studentUniqueId == null || studentUniqueId.length == 0 ? null : studentUniqueId),
      PageIndex: this.SearchBy.PageIndex,
      PageSize: this.SearchBy.PageSize
    };

    let promise = new Promise((resolve, reject) => {
      this.reportService.GetVTStudentExitSurveyReportsByCriteria(exitSurveyParams).subscribe(response => {
        resolve(response);
      }, error => {
        console.log(error);
        resolve(error);
      });
    });

    return promise;
  }

  exportFilterData(): void {
    this.IsLoading = true;
    this.SearchBy.PageIndex = 0;
    this.SearchBy.PageSize = 25000000;
    AcademicYearId: this.vtStudentExitSurveyForm.get('AcademicYearId').value;
    let selectedClassId = this.vtStudentExitSurveyForm.get('ClassId').value;
    let class10thId = this.class10Id;

    this.getVTStudentExitSurveyReportsData().then(response => {

      response.Results.$values.forEach(
        function (obj) {
          obj.LhStudentId = obj.ExitStudentId;

          if (selectedClassId == class10thId ) {
            delete obj.DoneInternship;
            delete obj.InternshipCompletedSector;
            delete obj.IntrestedInJobOrSelfEmploymentPost12th;
            delete obj.PreferredLocations;
            delete obj.ParticularLocation;
            delete obj.WantToKnowAbtPgmsForJobsNContEdu;
          }

          delete obj.$id;
          delete obj.ExitStudentId;
          delete obj.AcademicYearId;
          delete obj.State;
          delete obj.StudentFirstName;
          delete obj.StudentMiddleName;
          delete obj.StudentLastName;
          delete obj.OtherReasons;
          delete obj.DoesFieldStudyHveVocSub;
          delete obj.AnyPreferredLocForEmployment;
          delete obj.TrainingType;
          delete obj.WillingToContSkillTraining;
          delete obj.SkillTrainingType;
          delete obj.CourseForTraining;
          delete obj.CourseNameIfOther;
          delete obj.OtherSectorsIfAny;
          delete obj.InterestedInJobOrSelfEmployment;
          delete obj.TopicsOfInterest;
          delete obj.IsRelevantToVocCourse;
          delete obj.SectorForSkillTraining;
          delete obj.OthersIfAny;
          delete obj.WillingToGoForTechHighEdu;
          delete obj.WantToKnowAbtSkillsUnivByGvt;
          delete obj.CanSendTheUpdates;
          delete obj.IsAssessmentRequired;
          delete obj.AssessmentConducted;
          delete obj.TotalRows;
        });

      this.exportExcelFromTable(response.Results.$values, "VTExitSurveyReport");
      this.SearchBy.PageSize = 250;
      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }

  exportBulkData(): void {
    this.IsLoading = true;
    let selectedClassId = this.vtStudentExitSurveyForm.get('ClassId').value;
    let class10thId = this.class10Id;

    let exitSurveyParams = {
      UserId: this.UserModel.UserTypeId,
      UserType: this.UserModel.RoleCode,
      AcademicYearId: this.vtStudentExitSurveyForm.get('AcademicYearId').value,
      ClassId: this.vtStudentExitSurveyForm.get('ClassId').value,
      PageIndex: 0,
      PageSize: 25000000
    };

    this.reportService.GetVTStudentExitSurveyReportsByCriteria(exitSurveyParams).subscribe(response => {

      response.Results.$values.forEach(
        function (obj) {
          obj.LhStudentId = obj.ExitStudentId;

          if (selectedClassId == class10thId ) {
            delete obj.DoneInternship;
            delete obj.InternshipCompletedSector;
            delete obj.IntrestedInJobOrSelfEmploymentPost12th;
            delete obj.PreferredLocations;
            delete obj.ParticularLocation;
            delete obj.WantToKnowAbtPgmsForJobsNContEdu;
          }

          delete obj.ExitStudentId;
          delete obj.AcademicYearId;
          delete obj.State;
          delete obj.StudentFirstName;
          delete obj.StudentMiddleName;
          delete obj.StudentLastName;
          delete obj.OtherReasons;
          delete obj.DoesFieldStudyHveVocSub;
          delete obj.AnyPreferredLocForEmployment;
          delete obj.TrainingType;
          delete obj.WillingToContSkillTraining;
          delete obj.SkillTrainingType;
          delete obj.CourseForTraining;
          delete obj.CourseNameIfOther;
          delete obj.OtherSectorsIfAny;
          delete obj.InterestedInJobOrSelfEmployment;
          delete obj.TopicsOfInterest;
          delete obj.IsRelevantToVocCourse;
          delete obj.SectorForSkillTraining;
          delete obj.OthersIfAny;
          delete obj.WillingToGoForTechHighEdu;
          delete obj.WantToKnowAbtSkillsUnivByGvt;
          delete obj.CanSendTheUpdates;
          delete obj.IsAssessmentRequired;
          delete obj.AssessmentConducted;
          delete obj.TotalRows;
        });

      this.exportExcelFromTable(response.Results.$values, "VTExitSurveyReport");
      this.SearchBy.PageSize = 250;
      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }

  //Create VTSchoolSector form and returns {FormGroup}
  createVTStudentExitSurveyForm(): FormGroup {
    return this.formBuilder.group({
      // AcademicYearId: new FormControl(),
      AcademicYearId: new FormControl({ value: '', disabled: true }, Validators.required),
      ClassId: new FormControl(),
      StudentUniqueId: new FormControl(),
    });
  }
}

