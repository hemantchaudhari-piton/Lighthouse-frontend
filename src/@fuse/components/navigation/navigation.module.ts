import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { FuseNavigationComponent } from './navigation.component';
import { FuseNavVerticalItemComponent } from './vertical/item/item.component';
import { FuseNavVerticalCollapsableComponent } from './vertical/collapsable/collapsable.component';
import { FuseNavVerticalGroupComponent } from './vertical/group/group.component';
import { FuseNavHorizontalItemComponent } from './horizontal/item/item.component';
import { FuseNavHorizontalCollapsableComponent } from './horizontal/collapsable/collapsable.component';

@NgModule({
    declarations: [
        FuseNavigationComponent,
        FuseNavVerticalGroupComponent,
        FuseNavVerticalItemComponent,
        FuseNavVerticalCollapsableComponent,
        FuseNavHorizontalItemComponent,
        FuseNavHorizontalCollapsableComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatRippleModule,
        TranslateModule
    ],
    exports: [
        FuseNavigationComponent,
    ]
})
export class FuseNavigationModule { }
