import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,NgbModule,MatDatepickerModule,FuseSharedModule],

  selector: 'app-progress-bar-model',
  templateUrl: './progress-bar-model.component.html',
  styleUrls: ['./progress-bar-model.component.scss']
})
export class ProgressBarModelComponent implements OnInit {

  @Input() countMinutes: number;
  @Input() countSeconds: number;
  @Input() progressCount: number;
  @Input() count: number;
  
  constructor(public dialogRef: MatDialogRef<ProgressBarModelComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }
  ngOnInit(): void {
  }

  continue() {    
    this.dialogRef.close(false);
  }
  logout() {    
    this.dialogRef.close('logout');
  }
}
