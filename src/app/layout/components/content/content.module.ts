import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FuseSharedModule } from '@fuse/shared.module';

import { ContentComponent } from 'app/layout/components/content/content.component';

@NgModule({
    declarations: [
        ContentComponent
    ],
    imports     : [
        RouterModule,
        CommonModule,
        FuseSharedModule
    ],
    exports     : [
        ContentComponent
    ]
})
export class ContentModule
{
}
