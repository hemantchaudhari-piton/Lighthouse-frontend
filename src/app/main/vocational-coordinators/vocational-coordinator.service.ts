import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { retry, catchError, tap } from "rxjs/operators";
import { UserModel } from "app/models/user.model";
import { BaseService } from 'app/services/base.service';

@Injectable({
    providedIn: 'root'
})
export class VocationalCoordinatorService {
    constructor(private http: BaseService) { }

    getVocationalCoordinators(): Observable<any> {
        return this.http
            .HttpGet(this.http.Services.VocationalCoordinator.GetAll)
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
            .HttpPost(this.http.Services.VocationalCoordinator.GetAllByCriteria, filters)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response.Results.$values;
                })
            );
    }

    getVocationalCoordinatorById(vcId: string) {
        let requestParams = {
            DataId: vcId
        };

        return this.http
            .HttpPost(this.http.Services.VocationalCoordinator.GetById, requestParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(function (response: any) {
                    return response.Results;
                })
            );
    }

    createOrUpdateVocationalCoordinator(formData: any) {
        return this.http
            .HttpPost(this.http.Services.VocationalCoordinator.CreateOrUpdate, formData)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    deleteVocationalCoordinatorById(vcId: string) {
        var vocationalCoordinatorParams = {
            DataId: vcId
        };

        return this.http
            .HttpPost(this.http.Services.VocationalCoordinator.Delete, vocationalCoordinatorParams)
            .pipe(
                retry(this.http.Services.RetryServieNo),
                catchError(this.http.HandleError),
                tap(response => {
                    return response;
                })
            );
    }

    getDropdownforVocationalCoordinators(userModel: UserModel): Observable<any[]> {
        // let vtpRequest = this.http.GetMasterDataByType({ DataType: 'VocationalTrainingProviders', SelectTitle: 'Vocational Training Provider' });
        // let natureOfAppointmentRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'NatureOfAppointment', SelectTitle: 'Nature Of Appointment' });
        let genderRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'Gender', SelectTitle: 'Gender' });
        let academicYearRequest = this.http.GetMasterDataByType({ DataType: 'AcademicYears', SelectTitle: 'Academic Year' });
        // let vcRequest = this.http.GetMasterDataByType({ DataType: ' VocationalCoordinatorDetails', SelectTitle: 'Vocational Coordinator Name' }, false);
        let vcRequest = this.http.GetMasterDataByType({ DataType: 'AllNewVC', RoleId: userModel.RoleCode, ParentId: 'Vocational Coordinator', SelectTitle: 'Vocational Coordinator' }, false);
        let vcEditRequest = this.http.GetMasterDataByType({ DataType: 'AllEditVC', RoleId: userModel.RoleCode, ParentId: 'Vocational Coordinator', SelectTitle: 'Vocational Coordinator' }, false);
        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([genderRequest, vcRequest, vcEditRequest,academicYearRequest]);
    }

    getInitVocationalCoordinatorsData(): Observable<any[]> {
        let academicYearRequest = this.http.GetMasterDataByType({ DataType: 'AcademicYears', SelectTitle: 'Academic Year' });
        let vtpRequest = this.http.GetMasterDataByType({ DataType: 'VocationalTrainingProviders', SelectTitle: 'Vocational Training Provider' });
        let natureOfAppointmentRequest = this.http.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'NatureOfAppointment', SelectTitle: 'Nature Of Appointment' });

        // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
        return forkJoin([academicYearRequest, vtpRequest, natureOfAppointmentRequest]);
    }
}
