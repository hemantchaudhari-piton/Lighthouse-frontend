import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { retry, catchError, tap } from "rxjs/operators";
import { BaseService } from 'app/services/base.service';

@Injectable({
    providedIn: 'root'
})
export class VCSchoolVisitService {
    constructor(private http: BaseService) { }

    getVCSchoolVisits(): Observable<any> {
        return this.http
            .HttpGet(this.http.Services.VCSchoolVisit.GetAll)
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
            .HttpPost(this.http.Services.VCSchoolVisit.GetAllByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    getVCSchoolVisitById(vcSchoolVisitId: string) {
        let requestParams = {
            DataId: vcSchoolVisitId
        };

        return this.http
            .HttpPost(this.http.Services.VCSchoolVisit.GetById, requestParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(function (response: any) {
                    return response.Results;
                })
            );
    }

    createOrUpdateVCSchoolVisit(formData: any) {
        return this.http
            .HttpPost(this.http.Services.VCSchoolVisit.CreateOrUpdate, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    deleteVCSchoolVisitById(vcSchoolVisitId: string) {
        var vcSchoolVisitParams = {
            DataId: vcSchoolVisitId
        };

        return this.http
            .HttpPost(this.http.Services.VCSchoolVisit.Delete, vcSchoolVisitParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }
}
