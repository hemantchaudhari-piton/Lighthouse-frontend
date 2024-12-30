import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { UserModel } from 'app/models/user.model';
import { AuthenticationService } from 'app/services/authentication.service';

import { CommonService } from 'app/services/common.service';
import { CommonModule } from '@angular/common';
import { env } from 'process';
import { RoleTransactionService } from 'app/main/role-transactions/role-transaction.service';
import { environment } from '../../../../../../environments/environment.delhi';

@Component({
    // standalone : true,
    selector: 'navbar-vertical-style-1',
    // imports : [CommonModule],
    templateUrl: './style-1.component.html',
    styleUrls: ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None,
    // schemas : [CUSTOM_ELEMENTS_SCHEMA]
})
export class NavbarVerticalStyle1Component implements OnInit, OnDestroy {
    fuseConfig: any;
    navigation: any;
    currentUser: UserModel;
    schoolName: any;
    roleId: string;
    baseUrl: string;
    showInternshipBtn: boolean;


    // Private
    private _fusePerfectScrollbar: FusePerfectScrollbarDirective;
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {Router} _router
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _router: Router,
        private authenticationService: AuthenticationService,
        private roleTransactionService: RoleTransactionService,
        public commonService: CommonService,
    ) {
        // Set the private defaults
        // super(commonService);
        this._unsubscribeAll = new Subject();
        this.currentUser = new UserModel();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Directive
    @ViewChild(FusePerfectScrollbarDirective, { static: true })
    set directive(theDirective: FusePerfectScrollbarDirective) {
        if (!theDirective) {
            return;
        }

        this._fusePerfectScrollbar = theDirective;

        // Update the scrollbar on collapsable item toggle
        this._fuseNavigationService.onItemCollapseToggled
            .pipe(
                delay(500),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._fusePerfectScrollbar.update();
            });

        // Scroll to the active item position
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                take(1)
            )
            .subscribe(() => {
                setTimeout(() => {
                    this._fusePerfectScrollbar.scrollToElement('navbar .nav-link.active', -120);
                });
            }
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                if (this._fuseSidebarService.getSidebar('navbar')) {
                    this._fuseSidebarService.getSidebar('navbar').close();
                }
            }
            );

        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.fuseConfig = config;
            });

        // Get current navigation
        this._fuseNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this._fuseNavigationService.getCurrentNavigation();
            });

        var _currentUser = this.authenticationService.getCurrentUser();
        if (_currentUser != null) {
            this.currentUser = _currentUser;
            if (_currentUser.RoleCode == 'HM') {
                this.commonService.GetMasterDataByType({ DataType: 'SchoolOfHM', ParentId: _currentUser.UserTypeId, SelectTitle: 'School' }).subscribe((response: any) => {
                    this.schoolName = response.Results.$values;
                    if (this.schoolName.length == 2) {
                        this.schoolName = this.schoolName[1].Name;
                    }
                });
            }
            this.commonService.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'PathwaysBaseURL', SelectTitle: 'PathwaysBaseURL' }).subscribe((response: any) => {
                if (response.Results.$values.length == 2) {
                    this.showInternshipBtn = true;
                } else {
                    this.showInternshipBtn = false;
                }
            });
        
        }
    }

    generateAndOpenPathwaysLink(){
        const dateObj = new Date();

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        const milliseconds = String(dateObj.getMilliseconds()).padStart(3, '0');

        const formattedTime = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
        const userDetails = {
          userName: this.currentUser.UserName,
          loginId: this.currentUser.LoginId,
          roleId: this.currentUser.RoleCode,
          stateId: this.currentUser.StateId,
          email: this.currentUser.EmailId,
          timestamp: formattedTime
        };
        this.commonService.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'PathwaysBaseURL', SelectTitle: 'PathwaysBaseURL' }).subscribe((response: any) => {
            const url = response.Results.$values;
            if (url.length == 2) {
                this.baseUrl = url[1].Name;
            }
            this.authenticationService.generateEncryptedToken(userDetails)
            .subscribe(
                encryptedToken => {
                    const hostname = window.location.hostname;
                    const stateName = hostname.split('.')[0];
                    const pathwaysBaseUrl = this.baseUrl;
                    const fullUrl = `${pathwaysBaseUrl}${encryptedToken}`;
                    window.open(fullUrl, '_blank');
                },
                error => {
                    console.error('Error generating token', error);
                }
        );
        });
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar opened status
     */
    toggleSidebarOpened(): void {
        this._fuseSidebarService.getSidebar('navbar').toggleOpen();
    }

    /**
     * Toggle sidebar folded status
     */
    toggleSidebarFolded(): void {
        this._fuseSidebarService.getSidebar('navbar').toggleFold();
    }
}
