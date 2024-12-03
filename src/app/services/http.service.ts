import { Injectable } from "@angular/core";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { throwError } from 'rxjs';
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { AppConstants } from "app/app.constants";

import { AppModule } from "../app.module";
import { HelperService } from "./helper.service";

@Injectable({
    providedIn: 'root'
})
export class HttpService extends HttpClient {
    helperService: HelperService;
    router: Router;

    constructor(public httpHandler: HttpHandler, options?: any) {
        super(httpHandler);
        this.helperService = AppModule.injector.get(HelperService);
        this.router = AppModule.injector.get(Router);
    }

    createRequestOptions(options: any | Request) {

        const token: string = sessionStorage.getItem(
            AppConstants.AccessTokenLocalStorage
        );
        
        if (
            this.helperService.addContentTypeHeader &&
            typeof this.helperService.addContentTypeHeader === "string"
        ) {
            options.headers.append(
                "Content-Type",
                this.helperService.addContentTypeHeader
            );
        } else {
            const contentTypeHeader: string = options.headers.get(
                "Content-Type"
            );
            if (!contentTypeHeader && this.helperService.addContentTypeHeader) {
                options.headers.append(
                    "Content-Type",
                    AppConstants.DefaultContentTypeHeader
                );
            }
            //options.headers.append("Authorization", token);
        }
    }

    catchAuthError(self: HttpService) {

        // we have to pass HttpService's own instance here as `self`

        return (response: Response) => {
            if (response.status === 401 || response.status === 403) {
                // if not authenticated

                sessionStorage.removeItem(AppConstants.UserLocalStorage);
                sessionStorage.removeItem(AppConstants.AccessTokenLocalStorage);
                this.router.navigate([AppConstants.LoginPageUrl]);
            }

            return throwError(() => new Error(`${ response }`));
        };
    }
}
