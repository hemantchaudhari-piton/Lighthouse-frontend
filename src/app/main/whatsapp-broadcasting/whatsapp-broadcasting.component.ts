import { Component, OnInit, NgZone, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { DropdownModel } from 'app/models/dropdown.model';
import { whatsappBroadcastingModel } from './whatsapp-broadcasting.model';
import { whatsappBroadcastingService } from './whatsapp-broadcasting.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FuseSharedModule } from '@fuse/shared.module';

@Component({
  selector: 'app-whatsapp-broadcasting',
  templateUrl: './whatsapp-broadcasting.component.html',
  styleUrls: ['./whatsapp-broadcasting.component.scss'],
  animations: fuseAnimations,
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,RouterModule,CommonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None,
})

export class WhatsappBroadcastingComponent extends BaseListComponent<whatsappBroadcastingModel> implements OnInit {
  messageTemplateSearchForm: FormGroup;
  messageTemplateFilterForm: FormGroup;
  messageTypeList: DropdownModel[];

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private messageTemplateService: whatsappBroadcastingService) {

    super(commonService, router, routeParams, snackBar, zone);
    this.messageTemplateSearchForm = this.formBuilder.group({ SearchText: new FormControl() });
    this.messageTemplateFilterForm = this.createMessageTemplateFilterForm();
  }

  ngOnInit(): void {
    //Load initial messageTemplates data
    this.onLoadMessageTemplatesByCriteria();
  }

  onLoadMessageTemplatesByCriteria(): any {
    this.IsLoading = true;

    let messageTemplateParams = {
      CampainID: this.messageTemplateFilterForm.controls["CampainID"].value,
      TemplateMessage: this.messageTemplateFilterForm.controls["TemplateMessage"].value,
      CharBy: null,
      PageIndex: this.SearchBy.PageIndex,
      PageSize: this.SearchBy.PageSize
    };

    this.messageTemplateService.GetAllByCriteria(messageTemplateParams).subscribe(response => {
      this.displayedColumns = ['TemplateID', 'TemplateMessage', 'UserType', 'CreatedBy', 'CreatedOn'];

      this.tableDataSource.data = response.Results.$values;
      this.tableDataSource.sort = this.ListSort;
      this.tableDataSource.paginator = this.ListPaginator;
      this.tableDataSource.filteredData = this.tableDataSource.data;
      this.SearchBy.TotalResults = response.TotalResults;

      setTimeout(() => {
        this.ListPaginator.pageIndex = this.SearchBy.PageIndex;
        this.ListPaginator.length = this.SearchBy.TotalResults;
      });

      this.zone.run(() => {
        if (this.tableDataSource.data.length == 0) {
          this.showNoDataFoundSnackBar();
        }
      });
      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }

  exportExcel(): void {
    this.IsLoading = true;

    let messageTemplateParams = {
      MessageTypeId: this.messageTemplateFilterForm.controls["MessageTypeId"].value,
      Status: this.messageTemplateFilterForm.controls["Status"].value,
      Name: this.messageTemplateSearchForm.controls["SearchText"].value,
      CharBy: null,
      PageIndex: 0,
      PageSize: 100000
    };

    this.messageTemplateService.GetAllByCriteria(messageTemplateParams).subscribe(response => {
      response.Results.$values.forEach(
        function (obj) {
          if (obj.hasOwnProperty('IsActive')) {
            obj.IsActive = obj.IsActive ? 'Yes' : 'No';
          }
          delete obj.MessageTemplateId;
          delete obj.TotalRows;
        });

      this.exportExcelFromTable(response.Results.$values, "MessageTemplates");

      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }

  //Create MessageTemplateFilter form and returns {FormGroup}
  createMessageTemplateFilterForm(): FormGroup {
    return this.formBuilder.group({
      CampainID: new FormControl(),
      TemplateMessage: new FormControl(),
    });
  }
}
