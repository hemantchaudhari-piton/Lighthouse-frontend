import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { retry, catchError, tap } from "rxjs/operators";
import { BaseService } from 'app/services/base.service';
import { UserModel } from 'app/models/user.model';
import { CommonService } from "app/services/common.service";

@Injectable({
    providedIn: 'root'
})
export class HeadMasterService {
    constructor(private http: BaseService, private commonService: CommonService) { }

    getHeadMasters(): Observable<any> {
        return this.http
            .HttpGet(this.http.Services.HeadMaster.GetAll)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetAllByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.HeadMaster.GetAllByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    getHeadMasterById(hmId: string) {
        let requestParams = {
            DataId: hmId
        };

        return this.http
            .HttpPost(this.http.Services.HeadMaster.GetById, requestParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(function (response: any) {
                    return response.Results;
                })
            );
    }

    createOrUpdateHeadMaster(formData: any) {
        return this.http
            .HttpPost(this.http.Services.HeadMaster.CreateOrUpdate, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    deleteHeadMasterById(hmId: string) {
        var headMasterParams = {
            DataId: hmId
        };

        return this.http
            .HttpPost(this.http.Services.HeadMaster.Delete, headMasterParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    getDropdownforHeadMaster(userModel: UserModel): Observable<any[]> {
        let schoolRequest = this.http.GetMasterDataByType({ DataType: 'Schools', UserId: userModel.UserTypeId, RoleId: userModel.RoleCode, SelectTitle: 'School' }, false);
        let genderRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'Gender', SelectTitle: 'Gender' }, false);
        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([schoolRequest, genderRequest]);
    }

    getInitHeadMastersData(userModel: UserModel): Observable<any[]> {
        let academicYearRequest = this.http.GetMasterDataByType({ DataType: 'AcademicYears', SelectTitle: 'Academic Year' });

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([
            academicYearRequest]);
    }

}
