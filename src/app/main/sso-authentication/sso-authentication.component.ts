import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FuseConfigService } from "@fuse/services/config.service";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FuseSharedModule } from "@fuse/shared.module";
import { LoginService } from "./../../../app/auth/login/login.service";
import { LoginModel } from "app/models/login.model";
import { AuthenticationService } from "app/services/authentication.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CookieService } from "ngx-cookie-service";
import { CommonService } from "app/services/common.service";
import { UserModel } from "app/models/user.model";
import { AppConstants } from "app/app.constants";
import { RouteConstants } from "app/constants/route.constant";
@Component({
    selector: "sso-authentication",
    templateUrl: "./sso-authentication.component.html",
    styleUrls: ["./sso-authentication.component.scss"],
    standalone: true,
    imports: [
        MatPaginatorModule,
        MatTableModule,
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatDatepickerModule,
        FuseSharedModule,
    ],
    encapsulation: ViewEncapsulation.None,
})
export class SsoAuthenticationComponent implements OnInit {
    public tenantInfo: any;
    public loginForm: FormGroup;
    public loginModel: LoginModel;
    isEnabled2ndPolicy: boolean = false;
    verificationToken: string;
    constructor(
        private fuseConfigService: FuseConfigService,
        private loginservice: LoginService,
        public commonService: CommonService,
        public router: Router,
        public routeParams: ActivatedRoute,
        public snackBar: MatSnackBar,
        private authenticationService: AuthenticationService,
        private cookieService: CookieService,
        private route: ActivatedRoute
    ) {
        this.fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true,
                },
                toolbar: {
                    hidden: true,
                },
                footer: {
                    hidden: true,
                },
                sidepanel: {
                    hidden: true,
                },
            },
        };
        // Set the default login Model
        this.loginModel = new LoginModel();
    }
    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.verificationToken = params["VerificationToken"];
            this.loginservice
                .ssoAuthentication(this.verificationToken)
                .subscribe((response: any) => {
                    if (response.Success) {
                    this.validateUserSSO(response);
                    } else {
                        this.showErrorMessage(
                            "Invalid User which is not found in system",
                            "info-snackbar"
                        );
                        setTimeout(() => {
                            window.close();
                        }, 5000);
                    }
                });
        });
    }
    validateUserSSO(response: any) {
        this.loginModel.UserId = response.TenantInfo.LoginId;
        this.loginModel.Password = response.Password;
        this.loginModel.RememberMe = true;
        this.loginModel.IsMobile = false;
        this.authenticationService
            .loginUser(this.loginModel)
            .subscribe((logResp: any) => {
                if (logResp.Success) {
                    var currentUser: UserModel = {
                        LoginUniqueId: logResp.Result.LoginUniqueId,
                        AcademicYearId: logResp.Result.AcademicYearId,
                        UserTypeId: logResp.Result.UserTypeId,
                        LoginId: logResp.Result.LoginId,
                        Password: logResp.Result.Password,
                        UserId: logResp.Result.UserId,
                        UserName: logResp.Result.UserName,
                        FirstName: logResp.Result.FirstName,
                        LastName: logResp.Result.LastName,
                        EmailId: logResp.Result.EmailId,
                        Mobile: logResp.Result.Mobile,
                        IsAdmin: false,
                        Designation: logResp.Result.Designation,
                        DateOfJoining: logResp.Result.DateOfJoining,
                        DateOfAllocation: logResp.Result.DateOfAllocation,
                        RoleCode: logResp.Result.RoleCode,
                        DefaultStateId: logResp.Result.DefaultStateId,
                        StateId: logResp.Result.StateId,
                        DivisionId: logResp.Result.DivisionId,
                        DistrictId: logResp.Result.DistrictId,
                        BlockId: logResp.Result.BlockId,
                        AccountType: logResp.Result.AccountType,
                        LandingPageUrl: logResp.Result.LandingPageUrl,
                        InvalidAttempt: logResp.Result.InvalidAttempt,
                        IsLocked: logResp.Result.IsLocked,
                        IsPasswordReset: logResp.Result.IsPasswordReset,
                        LastLoginDate: logResp.Result.LastLoginDate,
                        PasswordExpiredOn: logResp.Result.PasswordExpiredOn,
                        PasswordResetToken: logResp.Result.PasswordResetToken,
                        PasswordUpdateDate: logResp.Result.PasswordUpdateDate,
                        TokenExpiredOn: logResp.Result.TokenExpiredOn,
                        AuthToken: logResp.Result.AuthToken,
                        RoleTransactions: [],
                    };

                    // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                    sessionStorage.setItem(
                        "currentUser",
                        JSON.stringify(currentUser)
                    );
                    AppConstants.AuthToken = currentUser.AuthToken;

                    this.authenticationService
                        .getUserTransactionsById(this.loginModel)
                        .subscribe((tranResp: any) => {
                            if (tranResp.Success) {
                                let userNavigations = [];
                                let transHeader: any, menuItem: any;
                                tranResp.Results.$values.forEach((tranItem) => {
                                    if (tranItem.HeaderName != "Main") {
                                        let headerItem = userNavigations.find(
                                            (ob) =>
                                                ob.title === tranItem.HeaderName
                                        );
                                        if (headerItem === undefined) {
                                            transHeader = {
                                                id: tranItem.HeaderName.toLowerCase(),
                                                title: tranItem.HeaderName,
                                                translate:
                                                    "NAV." +
                                                    tranItem.HeaderName.toUpperCase(),
                                                type: "collapsable",
                                                icon: "receipt",
                                                //url: tranItem.RouteUrl,
                                                badge: [],
                                                children: [],
                                                isVissible:
                                                    tranItem.IsHeaderMenu,
                                                StakeHolders:
                                                    tranItem.StakeHolders,
                                            };

                                            let subMenuItems =
                                                tranResp.Results.$values.filter(
                                                    (ob) =>
                                                        ob.HeaderName ===
                                                        tranItem.HeaderName
                                                );

                                            if (subMenuItems.length > 0) {
                                                subMenuItems.forEach(
                                                    (tranSubItem) => {
                                                        if (
                                                            currentUser.RoleCode ==
                                                                "HM" &&
                                                            tranSubItem.PageTitle ==
                                                                "VT Daily Reporting"
                                                        ) {
                                                            tranSubItem.PageTitle =
                                                                "VT Regularization Details";
                                                        }
                                                        menuItem = {
                                                            id: tranSubItem.Name.toLowerCase(),
                                                            title: tranSubItem.PageTitle,
                                                            translate: "",
                                                            type: "item",
                                                            icon: "layers",
                                                            url: tranSubItem.RouteUrl,
                                                            badge: [],
                                                            children: [],
                                                            isVissible:
                                                                tranSubItem.IsHeaderMenu,
                                                        };

                                                        transHeader.children.push(
                                                            menuItem
                                                        );
                                                    }
                                                );
                                            }

                                            userNavigations.push(transHeader);
                                        }
                                    }
                                });
                                let filteredUserNavigation = [];

                                if (currentUser.RoleCode !== "SUR") {
                                    userNavigations.forEach((item) => {
                                        if (
                                            item.StakeHolders &&
                                            item.StakeHolders.includes(
                                                currentUser.RoleCode
                                            )
                                        ) {
                                            filteredUserNavigation.push({
                                                ...item,
                                            });
                                        }
                                    });
                                } else {
                                    filteredUserNavigation = userNavigations;
                                }

                                sessionStorage.setItem(
                                    "userNavigations",
                                    JSON.stringify(filteredUserNavigation)
                                );
                                sessionStorage.setItem(
                                    "userRoleTransactions",
                                    JSON.stringify(tranResp.Results.$values)
                                );

                                if (this.loginModel.RememberMe) {
                                    this.cookieService.set(
                                        "UserId",
                                        this.loginModel.UserId
                                    );
                                    this.cookieService.set(
                                        "Password",
                                        this.loginModel.Password
                                    );
                                } else {
                                    this.cookieService.set("UserId", "");
                                    this.cookieService.set("Password", "");
                                }

                                this.cookieService.set(
                                    "RememberMe",
                                    this.loginModel.RememberMe.toString()
                                );
                            }

                            let passwordExpiredOn = new Date(
                                logResp.Result.PasswordExpiredOn
                            );
                            let currentDate = new Date();

                            var dpasswordExpiredOn = true;

                            if (passwordExpiredOn < currentDate) {
                                this.router.navigateByUrl(
                                    RouteConstants.Account.ResetPassword
                                );
                            } else {
                                this.router.navigateByUrl(
                                    currentUser.LandingPageUrl
                                );
                            }
                        });
                } else {
                    this.showErrorMessage(
                        "Invalid User which is not found in system",
                        "info-snackbar"
                    );
                    setTimeout(() => {
                        window.close();
                    }, 5000);
                }
            });
    }
    showErrorMessage(messageText: string, messageType: string) {
        this.snackBar.open(messageText, "Dismiss", {
            duration: 2000,
            verticalPosition: "bottom",
            horizontalPosition: "center",
            panelClass: [messageType],
        });
    }
}
