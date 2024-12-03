import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { retry, catchError, tap } from "rxjs/operators";
import { BaseService } from 'app/services/base.service';

@Injectable({
    providedIn: 'root'
})
export class VTPMonthlyBillSubmissionStatusService {
    constructor(private http: BaseService) { }

    getVTPMonthlyBillSubmissionStatus(): Observable<any> {
        return this.http
            .HttpGet(this.http.Services.VTPMonthlyBillSubmissionStatus.GetAll)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    GetAllByCriteria(filters:any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.VTPMonthlyBillSubmissionStatus.GetAllByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    getVTPMonthlyBillSubmissionStatusById(vtpMonthlyBillSubmissionStatusId: string) {
        var requestParams = {
            DataId: vtpMonthlyBillSubmissionStatusId
        };
        
        return this.http
            .HttpPost(this.http.Services.VTPMonthlyBillSubmissionStatus.GetById, requestParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(function (response: any) {
                    return response.Results;
                })
            );
    }

    createOrUpdateVTPMonthlyBillSubmissionStatus(formData: any) {
        return this.http
            .HttpPost(this.http.Services.VTPMonthlyBillSubmissionStatus.CreateOrUpdate, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    deleteVTPMonthlyBillSubmissionStatusById(vtpMonthlyBillSubmissionStatusId: string) {
        var vtpMonthlyBillSubmissionStatusParams = {
            DataId: vtpMonthlyBillSubmissionStatusId
        };

        return this.http
            .HttpPost(this.http.Services.VTPMonthlyBillSubmissionStatus.Delete, vtpMonthlyBillSubmissionStatusParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }
}
