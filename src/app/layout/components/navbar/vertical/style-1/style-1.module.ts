import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NavbarVerticalStyle1Component } from 'app/layout/components/navbar/vertical/style-1/style-1.component';

import { FuseNavigationModule } from '@fuse/components/navigation/navigation.module';
import { FuseSharedModule } from '@fuse/shared.module';

@NgModule({
    declarations: [
        NavbarVerticalStyle1Component,
    ],
    imports     : [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        FuseSharedModule,
        FuseNavigationModule
    ],
    exports     : [
        NavbarVerticalStyle1Component,
    ]
})
export class NavbarVerticalStyle1Module
{
}
