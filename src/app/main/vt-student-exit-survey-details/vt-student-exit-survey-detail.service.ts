import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { retry, catchError, tap } from "rxjs/operators";
import { BaseService } from 'app/services/base.service';
import { UserModel } from "app/models/user.model";

@Injectable({
    providedIn: 'root'
})
export class VTStudentExitSurveyDetailService {
    constructor(private http: BaseService) { }

    // getVTStudentExitSurveyDetails(): Observable<any> {
    //     return this.http
    //         .HttpGet(this.http.Services.VTStudentPlacementDetail.GetAll)
    //         .pipe(
    //             retry(this.http.Services.RetryServieNo),
    //             catchError(this.http.HandleError),
    //             tap(response => {
    //                 return response.Results.$values;
    //             })
    //         );
    // }

    GetStudentsForExitForm(formData: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.VTExitSurveyDetails.GetStudentsForExitForm, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    getVTStudentDetailById(exitStudentId: string) {
        var requestParams = {
            ExitStudentId: exitStudentId
        };

        return this.http
            .HttpPost(this.http.Services.VTExitSurveyDetails.GetById, requestParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(function (response: any) {
                    return response.Results;
                })
            );
    }

    getVTStudentExitSurveyReportById(formData: any) {
        return this.http
            .HttpPost(this.http.Services.VTExitSurveyDetails.GetExitSurveyDetailsById, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(function (response: any) {
                    return response.Results;
                })
            );
    }



    createOrUpdateVTStudentExitSurveyDetail(formData: any) {
        return this.http
            .HttpPost(this.http.Services.VTExitSurveyDetails.CreateOrUpdate, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    createOrUpdateExitStudentDetail(formData: any) {
        return this.http
            .HttpPost(this.http.Services.VTExitSurveyDetails.UpdateExitStudentDetails, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    createOrUpdateVTStudentDetail(formData: any) {
        return this.http
            .HttpPost(this.http.Services.VTExitSurveyDetails.CreateOrUpdateStudentDetail, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    UploadExcelData(formData: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.VTExitSurveyDetails.UploadFile, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    deleteVTStudentExitSurveyDetailById(vtStudentExitSurveyDetailId: string) {
        var vtStudentExitSurveyDetailParams = {
            DataId: vtStudentExitSurveyDetailId
        };

        return this.http
            .HttpPost(this.http.Services.VTStudentPlacementDetail.Delete, vtStudentExitSurveyDetailParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    getAcademicYearsAndClasses(): Observable<any[]> {
        let academicYearRequest = this.http.GetMasterDataByType({ DataType: 'AcademicYears', SelectTitle: 'Academic Year' });
        let classRequest = this.http.GetMasterDataByType({ DataType: 'SchoolClasses', SelectTitle: 'School Classes' });

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([academicYearRequest, classRequest]);
    }

    getClassesAndStudents(): Observable<any[]> {
        let studentRequest = this.http.GetMasterDataByType({ DataType: 'Students', SelectTitle: 'Student' });

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([studentRequest]);
    }

    getStudentExitSurveyDropdown(userModel: UserModel): Observable<any[]> {
        let districtRequest = this.http.GetMasterDataByType({ DataType: 'DistrictsBySateCode', ParentId: 'DL', SelectTitle: 'District' });
        let sectorRequest = this.http.GetMasterDataByType({ DataType: 'Sectors', SelectTitle: 'Sector' });
        let natureOfWorkRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'NatureOfWork', SelectTitle: 'Nature Of Work' });
        let sectorsOfEmploymentRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'SectorsOfEmployment', SelectTitle: 'Sector Of Employment' });
        let topicsOfJobInterestRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'TopicsOfJobInterest', SelectTitle: 'Your Interest' });
        let preferredLocationRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'PreferredLocationForEmployment', SelectTitle: 'Preferred Location For Employment' });
        let academicYearRequest = this.http.GetMasterDataByType({ DataType: 'AcademicYears', SelectTitle: 'Academic Year' });
        let religionRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'Religion', SelectTitle: 'Religion' });
        let reasonforNCHERequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId:'Reason For Not Continuing Higher Education10', SelectTitle: 'Reason For Not Continuing Higher Education10' })
        let reasonforNCHEIN11Request = this.http.GetMasterDataByType({DataType: 'DataValues', ParentId:'Reason For Not Cont VE In 11th', SelectTitle: 'Reason For Not Cont VE In 11th'})
        let classIdRequest = this.http.GetMasterDataByType({ DataType: 'ClassIdByClassName', SelectTitle: 'ClassId By ClassName' });

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([districtRequest, sectorRequest, natureOfWorkRequest, sectorsOfEmploymentRequest, topicsOfJobInterestRequest, preferredLocationRequest, academicYearRequest, religionRequest,reasonforNCHERequest,reasonforNCHEIN11Request,classIdRequest]);
    }
}
