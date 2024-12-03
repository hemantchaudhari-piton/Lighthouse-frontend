import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { retry, catchError, tap } from "rxjs/operators";
import { CommonService } from "app/services/common.service";

@Injectable()
export class GujaratCtsService {
    constructor(private http: CommonService) { }

    getStudentsFromGujaratCTS(studentParams: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.CTSGujrat.GetStudentsFromGujaratCTS, studentParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results;
                })
            );
    }

    SyncStudentsFromGujaratCTS(schoolParams: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.CTSGujrat.SyncStudentsFromGujaratCTS, schoolParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results;
                })
            );
    }

    studentsMappingWithTrainer(userModel: any, studentForm: any) {
        console.log("studentForm",studentForm.SectorId);
        return this.http
            .HttpPost(this.http.Services.CTSGujrat.StudentsMappingWithTrainer, studentForm)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    getDropdownForCts(userModel: any): Observable<any[]> {
        // let schoolRequest = this.http.GetMasterDataByType({ DataType: 'SchoolsByRole', RoleId: userModel.RoleCode, ParentId: userModel.UserTypeId, SelectTitle: 'School' }, false);
        let schoolRequest = this.http.GetMasterDataByType({ DataType: 'Schools', UserId: userModel.UserTypeId, RoleId: userModel.RoleCode, SelectTitle: 'School' }, false);
        let classRequest = this.http.GetMasterDataByType({ DataType: 'SchoolClasses', SelectTitle: 'School Classes' });
        let sectionRequest = this.http.GetMasterDataByType({ DataType: 'Sections', SelectTitle: 'Section' });

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([schoolRequest, classRequest, sectionRequest]);
    }

    getAYAndSectionByVT(roleId: any, vtId: any, classId: any): Observable<any[]> {
        let academicYearRequest = this.http.GetMasterDataByType({ DataType: 'AcademicYearsByVT', RoleId: roleId, ParentId: vtId, SelectTitle: 'Academic Year' });
        let sectionRequest = this.http.GetMasterDataByType({ DataType: 'SectionsByVT', RoleId: roleId, ParentId: classId, UserId: vtId, SelectTitle: 'Section' }, false);

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([academicYearRequest, sectionRequest]);
    }
}
