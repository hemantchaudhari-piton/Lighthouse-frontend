import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { retry, catchError, tap } from "rxjs/operators";
import { BaseService } from 'app/services/base.service';

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    constructor(private http: BaseService) { }

    getAccounts(): Observable<any> {
        return this.http
            .HttpGet(this.http.Services.Account.GetAll)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    getAccountById(accountId: string) {
        let requestParams = {
            DataId: accountId
        };

        return this.http
            .HttpPost(this.http.Services.Account.GetById, requestParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(function (response: any) {
                    return response.Results;
                })
            );
    }

    GetAllByCriteria(filters: any): Observable<any> {
        return this.http
            .HttpPost(this.http.Services.Account.GetAllByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    createOrUpdateAccount(formData: any) {
        return this.http
            .HttpPost(this.http.Services.Account.CreateOrUpdate, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    deleteAccountById(accountId: string) {
        var accountParams = {
            DataId: accountId
        };

        return this.http
            .HttpPost(this.http.Services.Account.Delete, accountParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    getUserDropdowns(userModel): Observable<any[]> {
        let roleRequest = this.http.GetMasterDataByType({ DataType: 'Roles', UserId: userModel.UserTypeId, RoleId: userModel.RoleCode, SelectTitle: 'Role' });
        let stateRequest = this.http.GetMasterDataByType({ DataType: 'States', SelectTitle: 'State' });

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([roleRequest, stateRequest]);
    }
}
