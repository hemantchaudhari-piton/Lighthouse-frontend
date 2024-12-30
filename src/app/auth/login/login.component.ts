import { Component, OnInit, ViewEncapsulation, NgZone } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LoginModel } from 'app/models/login.model';
import { UserModel } from 'app/models/user.model';
import { AppConstants } from 'app/app.constants';
import { AuthenticationService } from 'app/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeviceDetectorService } from 'ngx-device-detector';
import { environment } from '../../../environments/environment.delhi';
import { CookieService } from 'ngx-cookie-service';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { RouteConstants } from 'app/constants/route.constant';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseSharedModule } from '@fuse/shared.module';
import { LoginService } from './login.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
standalone : true ,
  imports: [MatPaginatorModule,CommonModule,MatTableModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,CommonModule, MatInputModule, MatSelectModule],
  providers: [AppConstants],
  selector: 'igmite-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class LoginComponent extends BaseComponent<LoginModel> implements OnInit {
  public loginForm: FormGroup;
  public loginModel: LoginModel;
  public returnUrl: string;
  public isVisiblePassword: boolean = false;
  private deviceInfo: any;
  public appInfo = environment;
  public tenantInfo: any;
  isHmApproval: boolean = false;
  public sanitizedContent: SafeHtml;
  public isDocumentNeedToUpload: string;


  constructor(
    public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private fuseConfigService: FuseConfigService,
    private authenticationService: AuthenticationService,
    private loginservice: LoginService,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private sanitizer: DomSanitizer,
    private deviceService: DeviceDetectorService,
    public formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Configure the Login layout
    this.fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        toolbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        sidepanel: {
          hidden: true
        }
      }
    };

    // Redirect to home if already logged in
    if (this.authenticationService.authUser) {
      this.router.navigate(['/']);
    }

    this.authenticationService.resetLogin();

    // Set the default login Model
    this.loginModel = new LoginModel();
  }

  ngOnInit(): void {
    // reset login status
    this.authenticationService.resetLogin();

    this.loginservice.getTenantInfo()
    .subscribe((logResp: any) => {

      const tenantsInfo = [];

      // Iterate through the array in logResp.Results.$values
      logResp.Results.$values.forEach((item: any) => {
          // Create an object containing the 'Name' and 'Identifier' properties from each element
          const tenant = {
              Name: item.Name,
              Identifier: item.Identifier,
              Email: item.Email,
              Content: item.Content,
              Image: item.Image,
              Mobile: item.Mobile,
              StateCode: item.StateCode
          };

          // Add the object to the tenantsInfo array
          tenantsInfo.push(tenant);
      });
    this.tenantInfo = tenantsInfo[0];
    if (this.tenantInfo && this.tenantInfo.Content) {
      this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.tenantInfo.Content);
    }
    })
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (window.location.hostname === 'localhost') {
      //this.loginModel.UserId = 'ritesh.gtmcs@gmail.com';
      this.loginModel.UserId = 'rakesh.gtmcs@gmail.com';
      this.loginModel.Password = 'Pass$123';
    }

    //this.cookieService.set('UserId', this.loginModel.UserId);
    let rememberMe = (this.cookieService.get('RememberMe') == 'true');

    if (rememberMe) {
      this.loginModel.UserId = this.cookieService.get('UserId');
      this.loginModel.Password = this.cookieService.get('Password');
      this.loginModel.RememberMe = true;
    }

    this.loginForm = this.createLoginForm();  

  }

  setVisiblePassword(): void {
    this.isVisiblePassword = !this.isVisiblePassword;
  }

  validateUserAuth() {
    this.loginModel.UserId = this.loginForm.value.UserId;
    this.loginModel.Password = this.loginForm.value.Password;
    this.loginModel.RememberMe = this.loginForm.value.RememberMe;
    this.loginModel.IsMobile = false;

    this.authenticationService.loginUser(this.loginModel)
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
            RoleTransactions: []
          };

          // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
          AppConstants.AuthToken = currentUser.AuthToken;
          
          this.authenticationService.getUserTransactionsById(this.loginModel)
            .subscribe((tranResp: any) => {
              if (tranResp.Success) {

                let userNavigations = [];
                let transHeader: any, menuItem: any;

                tranResp.Results.$values.forEach(tranItem => {

                  if (tranItem.HeaderName != 'Main') {
                    let headerItem = userNavigations.find(ob => ob.title === tranItem.HeaderName);

                    if (headerItem === undefined) {
                      transHeader = {
                        id: tranItem.HeaderName.toLowerCase(),
                        title: tranItem.HeaderName,
                        translate: 'NAV.' + tranItem.HeaderName.toUpperCase(),
                        type: 'collapsable',
                        icon: 'receipt',
                        //url: tranItem.RouteUrl,
                        badge: [],
                        children: [],
                        isVissible: tranItem.IsHeaderMenu,
                        StakeHolders: tranItem.StakeHolders
                      };

                      let subMenuItems = tranResp.Results.$values.filter(ob => ob.HeaderName === tranItem.HeaderName);

                      if (subMenuItems.length > 0) {
                        subMenuItems.forEach(tranSubItem => {
                          if (currentUser.RoleCode == "HM" && tranSubItem.PageTitle == 'VT Daily Reporting'){
                            tranSubItem.PageTitle = 'VT Regularization Details';
                          }
                          menuItem = {
                            id: tranSubItem.Name.toLowerCase(),
                            title: tranSubItem.PageTitle,
                            translate: '',
                            type: 'item',
                            icon: 'layers',
                            url: tranSubItem.RouteUrl,
                            badge: [],
                            children: [],
                            isVissible: tranSubItem.IsHeaderMenu
                          }

                          transHeader.children.push(menuItem);
                        });
                      }

                      userNavigations.push(transHeader);
                    }
                  }
                });
                let filteredUserNavigation = [];
                
                if (currentUser.RoleCode !== "SUR")
                {
                    userNavigations.forEach(item => {
                      if (item.StakeHolders && item.StakeHolders.includes(currentUser.RoleCode)) {
                        filteredUserNavigation.push({ ...item });
                      }
                    });
                  }
                  else
                  {
                    filteredUserNavigation = userNavigations;
                  }

                sessionStorage.setItem('userNavigations', JSON.stringify(filteredUserNavigation));
                sessionStorage.setItem('userRoleTransactions', JSON.stringify(tranResp.Results.$values));

                if (this.loginModel.RememberMe) {
                  this.cookieService.set('UserId', this.loginModel.UserId);
                  this.cookieService.set('Password', this.loginModel.Password);
                }
                else {
                  this.cookieService.set('UserId', '');
                  this.cookieService.set('Password', '');
                }

                this.cookieService.set('RememberMe', this.loginModel.RememberMe.toString());
              }

              let passwordExpiredOn = new Date(logResp.Result.PasswordExpiredOn);
              let currentDate = new Date();

              var dpasswordExpiredOn = true;

              if (passwordExpiredOn < currentDate) {
                this.router.navigateByUrl(RouteConstants.Account.ResetPassword);
              }
              else {
                const userRoleTransactions = JSON.parse(sessionStorage.getItem('userRoleTransactions'));
                const hasVTDocumentCentre = userRoleTransactions?.some(transaction => 
                    transaction.Name === "VT Document Centre" || transaction.Code === "VDC"
                );
                if (currentUser.RoleCode === "VT" && hasVTDocumentCentre) {
                  this.loginservice.getVtDocumentsDetails(logResp.Result.LoginId).subscribe((logResp) => {
                    this.isDocumentNeedToUpload = logResp?.Results?.$values?.[1]?.Description;
                    
                    const targetUrl = this.isDocumentNeedToUpload === "false" 
                        ? RouteConstants.VTDocumentCentre.List 
                        : currentUser.LandingPageUrl;
                    
                    this.router.navigateByUrl(targetUrl);
                  });
                } else {
                  this.router.navigateByUrl(currentUser.LandingPageUrl);
                }
              }
            });
        }
        else {
          this.showErrorMessage(
            'Invalid UserId or Password',
            'info-snackbar'
          );
        }
      });
  }

  //Create login form and returns {FormGroup}
  createLoginForm(): FormGroup {
    return this.formBuilder.group({
      UserId: new FormControl({ value: this.loginModel.UserId, disabled: false }, [Validators.maxLength(100), Validators.pattern(this.Constants.Regex.Email)]),
      Password: new FormControl(this.loginModel.Password, [Validators.required, Validators.maxLength(50), Validators.pattern(this.Constants.Regex.Password)]),
      RememberMe: [this.loginModel.RememberMe]
    });
  }

  showErrorMessage(messageText: string, messageType: string) {
    this.snackBar.open(messageText, "Dismiss", {
      duration: 2000,
      verticalPosition: "bottom",
      horizontalPosition: "center",
      panelClass: [messageType]
    });
  }
}
