import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { retry, catchError, tap } from "rxjs/operators";
import { BaseService } from 'app/services/base.service';

@Injectable({
    providedIn: 'root'
})
export class BlockService {
    constructor(private http: BaseService) { }

    getBlocks(): Observable<any> {
        return this.http
            .HttpGet(this.http.Services.Block.GetAll)
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
            .HttpPost(this.http.Services.Block.GetAllByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    getBlockById(blockId: string) {
        let requestParams = {
            DataId: blockId
        };

        return this.http
            .HttpPost(this.http.Services.Block.GetById, requestParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(function (response: any) {
                    return response.Results;
                })
            );
    }

    createOrUpdateBlock(formData: any) {
        return this.http
            .HttpPost(this.http.Services.Block.CreateOrUpdate, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }


    deleteBlockById(blockId: string) {
        var districtParams = {
            DataId: blockId
        };

        return this.http
            .HttpPost(this.http.Services.Block.Delete, districtParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }
}
