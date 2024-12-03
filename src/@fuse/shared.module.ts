import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatSortModule } from '@angular/material/sort';
import { FuseDirectivesModule } from '@fuse/directives/directives'; 
import { FusePipesModule } from '@fuse/pipes/pipes.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
@NgModule({
    imports  : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        FlexLayoutModule,
        MatSelectModule,
        FuseDirectivesModule,
        FusePipesModule,
        MatSortModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        MatDividerModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatDatepickerModule,
        RouterModule
    ],
    exports  : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        FlexLayoutModule,
        MatSelectModule,
        FuseDirectivesModule,
        FusePipesModule,
        MatSortModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        MatDividerModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatTooltipModule,
        
        RouterModule
    ]
})
export class FuseSharedModule
{
}
