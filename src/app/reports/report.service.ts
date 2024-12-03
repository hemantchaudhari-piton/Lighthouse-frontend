import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { retry, catchError, tap } from "rxjs/operators";
import { BaseService } from 'app/services/base.service';
import { CommonService } from "app/services/common.service";

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    constructor(private http: BaseService, private commonService: CommonService) { }

    GetGuestLectureConductedReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetGuestLectureConductedReportsByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetFieldIndustryVisitConductedReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetFieldIndustryVisitConductedReportsByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }
    GetVTPMonthlyInvoiceReport(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTPMonthlyInvoiceReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results;
                })
            );
    }

    getDropdownforVTP(userModel: any): Observable<any[]> {
        let vtpRequest = this.http.GetMasterDataByType({ DataType: 'VocationalTrainingProvidersByUserId',UserId:userModel.UserTypeId ,ParentId: userModel.UserTypeId, RoleId: userModel.RoleCode, SelectTitle: 'Vocational Training Provider' });

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([vtpRequest]);
    }

    GetVTIssueReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTIssueReportsByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVCIssueReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVCIssueReportsByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVCReportingAttendanceReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVCReportingAttendanceReportsByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVCSchoolSectorReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVCSchoolSectorReportsByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVTSchoolSectorReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTSchoolSectorReportsByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetSchoolVTPSectorReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetSchoolVTPSectorReportsByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetSchoolInfoReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetSchoolInformationReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetCourseMaterialStatusReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetCourseMaterialStatusReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetfieldAndIndustryVisitStatusReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetFieldAndIndustryVisitStatusReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetGuestLectureStatusReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetGuestLectureStatusReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetStudentAttendanceReportingReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetStudentAttendanceReportingReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetStudentDetailsReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetStudentDetailsReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetStudentEnrollmentReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetStudentEnrollmentReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetToolsAndEquipmentStatusReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetToolsAndEquipmentStatusReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVCSchoolVisitSummaryReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVCSchoolVisitSummaryReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVocationalTrainerAttendanceReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVocationalTrainerAttendanceReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVTPBillSubmissionStatusReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTPBillSubmissionStatusReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVTReportingAttendanceReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTReportingAttendanceReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVTDailyAttendanceTrackingByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTDailyAttendanceTrackingByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVCDailyAttendanceTrackingByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVCDailyAttendanceTrackingByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVTMonthlyAttendanceReport(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTMonthlyAttendanceReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results;
                })
            );
    }

    GetVTMonthlyAttendanceReportForWithoutHMApproval(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTMonthlyAttendanceReportForWithoutHMApproval, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results;
                })
            );
    }

    GetVCMonthlyAttendanceReport(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVCMonthlyAttendanceReport, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results;
                })
            );
    }

    GetVTDailyReportNotSubmittedTrackingByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTDailyReportNotSubmittedTrackingByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVTStudentTrackingByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTStudentTrackingByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVTCourseModuleDailyTrackingByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTCourseModuleDailyTrackingByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVTStudentExitSurveyReportsByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTStudentExitSurveyReportsByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVTDailyMonthlyTrackingByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTDailyMonthlyTrackingByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVCDailyMonthlyTrackingByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVCDailyMonthlyTrackingByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetVTPMonthlyTrackingByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Report.GetVTPMonthlyTrackingByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    DownloadReportFile(paramValue: any): Observable<any> {
        return this.http
            .HttpGet(this.http.Services.Report.DownloadReportFile + paramValue)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    UploadExcelData(formData: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.MasterData.UploadExcelData, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    getAcademicYears(): Observable<any> {
        return this.http
            .HttpGet(this.http.Services.AcademicYear.GetAll)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetExitSurveyReportDropdown(userModel: any): Observable<any> {
        let academicYearRequest = this.http.GetMasterDataByType({ DataType: 'AcademicYears', SelectTitle: 'Academic Year' });
        let classRequest = this.http.GetMasterDataByType({ DataType: 'SchoolClasses', SelectTitle: 'School Classes' });

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([academicYearRequest, classRequest]);
    }

    GetDropdownForReports(userModel: any): Observable<any> {
        let academicYearRequest = this.http.GetMasterDataByType({ DataType: 'AcademicYears', SelectTitle: 'Academic Year' });
        let divisionRequest = this.http.GetMasterDataByType({ DataType: 'Divisions', RoleId: userModel.RoleCode, UserId: userModel.UserTypeId, ParentId: userModel.DefaultStateId, SelectTitle: 'Division' });
        let sectorRequest = this.http.GetMasterDataByType({ DataType: 'Sectors', UserId: userModel.LoginId, SelectTitle: 'Sector' });
        let classRequest = this.http.GetMasterDataByType({ DataType: 'SchoolClasses', SelectTitle: 'School Class' });
        let monthRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'Months', SelectTitle: 'Month' });
        let schoolManagementRequest = this.http.GetMasterDataByType({ DataType: 'BasicList', ParentId: 'SchoolManagement', SelectTitle: 'School Management' });
        let schoolRequest = this.http.GetMasterDataByType({ DataType: 'Schools', SelectTitle: 'School' });
        let vcrequest = this.http.GetMasterDataByType({ DataType: 'VocationalCoordinators', UserId: userModel.LoginId, SelectTitle: 'Vocational Coordinator' });


        let vtpRequest = null;
        // if (userModel.RoleCode == 'VC') {
        //     vtpRequest = this.commonService.GetVTPByAYId(userModel.RoleCode, userModel.UserTypeId, userModel.AcademicYearId);
        // }
        // else if (userModel.RoleCode == 'HM') {
        //     vtpRequest = this.commonService.GetVTPByHMId(userModel.AcademicYearId, userModel.UserTypeId);
        // }
        // else {
            vtpRequest = this.http.GetMasterDataByType({ DataType: 'VocationalTrainingProviders', UserId: userModel.LoginId, SelectTitle: 'Vocational Training Provider' });
        // }

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([academicYearRequest, divisionRequest, sectorRequest, vtpRequest, classRequest, monthRequest, schoolManagementRequest, schoolRequest,vcrequest]);
    }

    getDropdownforVocationalTrainer(userModel: any): Observable<any[]> {
        let vtRequest = this.http.GetMasterDataByType({ DataType: 'AllVTs', ParentId: userModel.UserTypeId, SelectTitle: 'Vocational Trainer' });

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([vtRequest]);
    }

    getDropdownforVTCourseModuleTrackingReport(userModel: any): Observable<any[]> {
        let vtRequest = this.http.GetMasterDataByType({ DataType: 'VocationalTrainers', ParentId: userModel.UserTypeId, SelectTitle: 'Vocational Trainer' });
        let classRequest = this.http.GetMasterDataByType({ DataType: 'SchoolClasses', SelectTitle: 'School Class' });
        let sectionRequest = this.http.GetMasterDataByType({ DataType: 'Sections', SelectTitle: 'Section' });
        let monthRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'Months', SelectTitle: 'Month' });
        let schoolRequest = this.http.GetMasterDataByType({ DataType: 'Schools', SelectTitle: 'School' });
        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([vtRequest, classRequest, sectionRequest, monthRequest, schoolRequest]);
    }

}
