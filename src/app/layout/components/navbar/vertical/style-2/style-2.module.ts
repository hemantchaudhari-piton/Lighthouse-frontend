import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NavbarVerticalStyle2Component } from 'app/layout/components/navbar/vertical/style-2/style-2.component';

import { FuseNavigationModule } from '@fuse/components/navigation/navigation.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseNavigationComponent } from '@fuse/components/navigation/navigation.component';


@NgModule({
    declarations: [
        // NavbarVerticalStyle2Component,
    ],
    imports : [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        FuseSharedModule,
        // FuseNavigationModule
    ],
    exports: [
        // NavbarVerticalStyle2Component,
    ]
})
export class NavbarVerticalStyle2Module
{
}
