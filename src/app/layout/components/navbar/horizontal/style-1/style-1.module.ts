import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { NavbarHorizontalStyle1Component } from 'app/layout/components/navbar/horizontal/style-1/style-1.component';
import { FuseNavigationComponent } from '@fuse/components/navigation/navigation.component';
import { FuseNavigationModule } from '@fuse/components/navigation/navigation.module';
import { FuseSharedModule } from '@fuse/shared.module';


@NgModule({
    declarations: [
        // NavbarHorizontalStyle1Component,
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,
        CommonModule,
        FuseSharedModule,
        // FuseNavigationModule
    ],
    exports : [
        // NavbarHorizontalStyle1Component
    ]
})
export class NavbarHorizontalStyle1Module
{
}
