import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { CommonService } from 'app/services/common.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { AuthenticationService } from 'app/services/authentication.service';
import { UserModel } from 'app/models/user.model';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { environment } from '../../../../environments/environment.delhi';
import {ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from 'app/constants/route.constant';
import { LoginModel } from 'app/models/login.model';
import { Platform } from '@angular/cdk/platform';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolbarService } from './toolbar.service';
import { MatButtonModule } from '@angular/material/button';


@Component({
    imports: [MatButtonModule],
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, AfterViewInit, OnDestroy {
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    languages: any;
    navigation: any;
    schoolId: string;
    selectedLanguage: any;
    userStatusOptions: any[];
    currentUser: UserModel;
    loginModel: LoginModel;
    isMobile: boolean;
    isCheckedIn: boolean = false;
    checkedInDate:any;
    currentDate = new Date();
    enableGeoFencing:boolean = false;
    hostname: any;
    filepath: any;
  
    userLocation: { latitude: number, longitude: number } = null;

    public appInfo = environment;

    // Private
    private _unsubscribeAll: Subject<any>;
    showCheckInButton: boolean;
    // UserModel: any;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} _translateService
     * @param {Platform} _platform
     */
    constructor(public commonService: CommonService,
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private authenticationService: AuthenticationService,
        private fuseNavigationService: FuseNavigationService,
        private _platform: Platform,
        public router: Router,
        private dialogService: DialogService,
        public snackBar: MatSnackBar, 
        public routeParams: ActivatedRoute,
        public toolbarService: ToolbarService,
        
    ) {
        
        // Set the defaults
        this.userStatusOptions = [
            {
                title: 'Online',
                icon: 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon: 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon: 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.languages = [
            {
                id: 'en',
                title: 'English',
                flag: 'us'
            },
            {
                id: 'gj',
                title: 'Gujarati',
                flag: 'gj'
            }
        ];

        //this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.currentUser = new UserModel();
        this.isMobile = false;
        this.isMobile = this._platform.ANDROID || this._platform.IOS;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.showCheckInButton = this._platform.ANDROID || this._platform.IOS;
        this.hostname = window.location.hostname.split('.')[0];
        if (this.hostname == 'ap' || this.hostname == 'up' || this.hostname == 'gujarat')
          this.filepath = "assets/images/logos/Samagra.png";
        else
          this.filepath = "assets/images/logos/samagra-shiksha-abhiyan-dl.png";
        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });
            
        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, { id: this._translateService.currentLang });
       
        var _currentUser = this.authenticationService.getCurrentUser();
        if (_currentUser != null) {
            this.currentUser = _currentUser;
            this.commonService.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'GeoFencing', SelectTitle: 'GeoFencing' }).subscribe((response: any) => {
                if (response.Results.$values.length == 2 && response.Results.$values[1].IsDisabled == false) {
                    this.enableGeoFencing = true;
                } else {
                    this.enableGeoFencing = false;
                }
            })  
        }

        var userNavigations = this.authenticationService.getUserNavigations();
        if (userNavigations != null) {
            this.navigation = userNavigations;
        }
        // if (this.currentUser.UserTypeId){
        //     this.commonService.GetMasterDataByType({ DataType: 'UserCheckInDate', ParentId: this.currentUser.UserTypeId, SelectTitle: 'User CheckIn' }, false).subscribe((response: any) => {
        //         const checkedInDateStr = response.Results[0].Description;
        //         this.checkedInDate = new Date(checkedInDateStr);
        //         this.currentDate.setHours(0, 0, 0, 0);
        //         if (this.checkedInDate.getTime() === this.currentDate.getTime()) {
        //             this.isCheckedIn = true;
        //         } else {
        //             this.isCheckedIn = false;
        //         }
        //       });
        // }
    }
    
    checkIn(): void {
        this.getUserLocation()
        .then((userLocation) => {
            const userId = this.currentUser.UserTypeId;
            const latitude = userLocation.latitude.toString();
            const longitude = userLocation.longitude.toString();
            const Designation = this.currentUser.Designation;
            this.toolbarService.saveUserLocation(userId, latitude, longitude, Designation)
                .subscribe(
                    (response) => {
                        if ( response.Result !== 'Success') {
                            this.isCheckedIn = true;
                            this.dialogService.openShowDialog(response.Errors.$values[0]);
                        }
                    },
                    (error) => {
                        console.error('Error saving user location:', error);
                        this.snackBar.open('Failed to save location', 'OK', {
                            duration: 3000,
                            panelClass: ['error-snackbar'] 
                        });
                    }
                );
        })
        .catch((error) => {
            console.error('Error getting user location:', error);
        });
    }


    ngAfterViewInit() {
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    getUserLocation(): Promise<{ latitude: number; longitude: number }> {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLocation = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };
                        resolve(userLocation);
                    },
                    (error) => {
                        const errorMessages = "Please enable GPS for accurate location.";
                        this.dialogService.openShowDialog(errorMessages);
                        console.error('Error getting user location:', error);
                        reject(error);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
                reject('Geolocation is not supported by this browser.');
            }
        })
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Search
     *
     * @param value
     */
    search(value): void {
        // Do your search here...
        console.log(value);
    }

    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang): void {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.id);
    }

    logout() {
        let logoutParam = {
            LoginUniqueId: this.currentUser.LoginUniqueId,
            AuthToken: this.currentUser.AuthToken
        };

        this.authenticationService.logoutUser(logoutParam).subscribe((logResp: any) => {
            // Logout current user and clear all resources
            this.authenticationService.logout();
        });
    }

    changePassword() {
        // Logout current user and clear all resources
        this.router.navigate([RouteConstants.Account.ChangePassword]);
    }
}
