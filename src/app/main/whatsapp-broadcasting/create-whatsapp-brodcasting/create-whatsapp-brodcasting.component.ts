import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { DropdownModel } from 'app/models/dropdown.model';
import { whatsappBroadcastingModel } from '../whatsapp-broadcasting.model';
import { whatsappBroadcastingService } from '../whatsapp-broadcasting.service';
import { RouteConstants } from 'app/constants/route.constant';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SearchFilterModel } from 'app/models/search.filter.model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatCheckboxChange } from '@angular/material/checkbox';
export interface PeriodicElement {
  name: string;
  Description: number;
}
@Component({
  selector: 'app-create-whatsapp-brodcasting',
  templateUrl: './create-whatsapp-brodcasting.component.html',
  styleUrls: ['./create-whatsapp-brodcasting.component.scss'],
  standalone : true,
  imports : [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class CreateWhatsappBrodcastingComponent extends BaseComponent<whatsappBroadcastingModel> implements OnInit {
  messageTemplateForm: FormGroup;
  messageTemplateModel: whatsappBroadcastingModel;
  messageTypeList: [DropdownModel];
  filteredMessageVariablesItems: any;
  gifictemplate: any;
  templateId: any;
  userType: any;
  glificAccessToken: any;
  glificMessage: string = "";
  messagepreview: string = "";
  variables: string[] = [];
  fields: any[] = [];
  messageMediaResults: any;
  variableCount: number = 0;
  selection = new SelectionModel<PeriodicElement>(true, []);
  tableDataSource: MatTableDataSource<PeriodicElement> = new MatTableDataSource<PeriodicElement>([]); // Initialize with an empty array
  impNote: boolean;
  lastWorkingDay: string;

  idToLabelMap: Record<string, string> = {};

  displayedColumns: string[];
  SearchBy: SearchFilterModel;

  @ViewChild(MatPaginator)
  ListPaginator: MatPaginator;

  @ViewChild(MatSort)
  ListSort: MatSort;

  conditionList: string[] = ['All PMU Member', 'All VT', 'VT Report Not Submitted'];
  userTypeList: { label: string; value: string }[] = [
    { label: 'VT', value: 'VT' },
    { label: 'HOS', value: 'HOS' },
    { label: 'PMU-Member', value: 'PMU-Member' },
    { label: 'Government Official', value: 'Government Official' },
    { label: 'District Resource Person', value: 'District Resource Person' },
  ];

  userTypeConditionsMap: Record<string, string[]> = {
    'VT': ['All VT', 'VT Report Not Submitted'],
    'HOS': ['All HOS'],
    'PMU-Member': ['All PMU Members'],
    'Government Official': ['All Government Officials'],
    'District Resource Person': ['All District Resource Person'],
  };
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  dropdownFields:any[];

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private messageTemplatesService: whatsappBroadcastingService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);
    this.tableDataSource = new MatTableDataSource<PeriodicElement>();
    this.SearchBy = new SearchFilterModel(this.UserModel);
    this.messageTemplateModel = new whatsappBroadcastingModel();
    this.messageTemplateForm = this.createMessageTemplateForm();
  }
  ngOnInit(): void {
    this.impNote = false;
    this.messageTemplatesService.getDropdownforMessageTemplate(this.UserModel).subscribe((results) => {
      if (results[0].Success) {
        this.messageTypeList = results[0].Results;
      }
      this.SearchBy.PageIndex = 0;
      this.SearchBy.PageSize = 10;
      if (!this.tableDataSource.data.length) {
        this.tableDataSource = new MatTableDataSource<PeriodicElement>([]); // Initialize with an empty array
      }
      this.messageTemplatesService.getGlificTemplate()
        .subscribe((response: any) => {
          const data = JSON.parse(response);
          this.gifictemplate = data.data.sessionTemplates;
        })
        this.messageTemplatesService.GetContactVariables().subscribe((response: any) => {
          const data = JSON.parse(response);
          const contactNameOption = {
            key: '@contact.name'
          };
          const contactUuidOption = {
            key: '@contact.uuid'
          };
          const contactAddressOption = {
            key: '@contact.address'
          };
          const otherOptions = data.results
            .filter(result => result.key !== 'key' && result.key !== 'uuid'&& result.key !== 'address') 
            .map(result => ({
              key: `@contact.fields.${result.key}`
            }));
          this.dropdownFields =  [contactNameOption, contactUuidOption, contactAddressOption, ...otherOptions];
        });
      this.route.paramMap.subscribe(params => {
        if (params.keys.length > 0) {
          this.PageRights.ActionType = params.get('actionType');
          if (this.PageRights.ActionType == this.Constants.Actions.New) {
            this.messageTemplateModel = new whatsappBroadcastingModel();
          } else {
            var campainID: string = params.get('CampainID');
            this.messageTemplatesService.getMessageTemplateById(campainID)
              .subscribe((response: any) => {
                this.messageTemplateModel = response.Result;
                if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                  this.messageTemplateModel.RequestType = this.Constants.PageType.Edit;
                else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                  this.messageTemplateModel.RequestType = this.Constants.PageType.View;
                  this.PageRights.IsReadOnly = true;
                }
              });
          }
        }
      });
      if (this.messageTemplateForm.controls.UserType.value) {
        this.tableDataSource.paginator = this.ListPaginator;
        this.ListPaginator.pageIndex = this.SearchBy.PageIndex;
        this.ListPaginator.length = this.SearchBy.TotalResults;
      }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // If yesterday is Sunday, show Saturday's date
    if (yesterday.getDay() === 0) {
      yesterday.setDate(yesterday.getDate() - 1);
    }
    const formattedDate = yesterday.toISOString().split('T')[0];
    this.lastWorkingDay = formattedDate;
    });
  }

  ngAfterViewInit() {
    this.tableDataSource.paginator = this.ListPaginator;
  }
  onPageIndexChanged(evt) {
    this.SearchBy.PageIndex = evt.pageIndex;
    this.SearchBy.PageSize = evt.pageSize;
  }
  generateTable(): any {
    this.IsLoading = true;
    this.messageTemplatesService.getVtData().subscribe(response => {
      this.updateTableData(response);
      this.IsLoading = false;
    }, error => {
      console.log(error);
      this.IsLoading = false;
    });
  }
  
  onChangeCondition(condition) {
    this.IsLoading = true;
    let observable;
    this.selection.clear();
    if (condition === "VT Report Not Submitted") {
      this.impNote = true;
      const previousday = this.CurrentDate;
      observable = this.messageTemplatesService.getAllVTNotSubmittedReport(previousday, this.CurrentDate);
    } else if (condition === "All VT") {
      this.impNote = false;
      observable = this.messageTemplatesService.getVtData();
    }else if (condition === "All PMU Member") {
      this.impNote = false;
      observable = this.messageTemplatesService.getAllPMUMember();
    }
    if (observable) {
      observable.subscribe(response => {
        this.updateTableData(response);
        this.IsLoading = false;
      }, error => {
        console.log(error);
        this.IsLoading = false;
      });
    }
  }
  
  updateTableData(response): any {
    this.displayedColumns = ['select', 'Name', 'Description'];
    const modifiedData: PeriodicElement[] = response.Results.$values.slice(1);
    const selected = this.selection.selected;
    this.tableDataSource.data = modifiedData;
    this.tableDataSource.sort = this.ListSort;
    this.tableDataSource.paginator = this.ListPaginator;
    this.SearchBy.TotalResults = response.TotalResults;
    this.selection.clear();
    selected.forEach(row => this.selection.select(row));
  
    setTimeout(() => {
      this.ListPaginator.pageIndex = this.SearchBy.PageIndex;
      this.ListPaginator.length = this.SearchBy.TotalResults;
    });
  
    this.zone.run(() => {
      if (this.tableDataSource.data.length === 0) {
        this.showNoDataFoundSnackBar();
      }
    });
  }

  selectHandler(row: PeriodicElement) {
    this.selection.toggle(row);
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.tableDataSource.data.length;
    return numSelected === numRows;
  }

  selectAll(event: MatCheckboxChange): void {
    if (event.checked) {
      this.selection.select(...this.tableDataSource.filteredData);
    } else {
      this.selection.clear();
    }
  }
  

  onChangeTemplateType(TemplateID): Promise<any> {
    this.templateId = TemplateID;
    const templateId = parseInt(this.templateId, 10);
    this.IsLoading = true;
    var selectedTemplate = this.gifictemplate.filter((f) => f.id === TemplateID)

    this.messageMediaResults = selectedTemplate.map((item) => {
      return {
        sourceUrl: item?.MessageMedia?.sourceUrl,
        caption: item?.MessageMedia?.caption,
        url: item?.MessageMedia?.sourceUrl // url is the same as sourceUrl
      };
    });

    
    
    let promise = new Promise((resolve, reject) => {
      this.messageTemplatesService.GetTemplateDataById({ templateId }).subscribe((response: any) => {
        this.glificMessage = response.data.sessionTemplate.sessionTemplate.body;
        const regex = /{{(\d+)}}/g;
        const matches = this.glificMessage.match(regex);
        if (matches) {
          this.variables = matches.map(match => match.slice(2, -2));
          this.variableCount = this.variables.length;
          this.updateMessage();
          this.updateFields();

          this.variables.forEach((variable, index) => {
            const fieldName = `Variable${index + 1}`;
            this.messageTemplateForm.controls[fieldName].setValue(null);
            this.messageTemplateForm.controls[fieldName].clearValidators();
  
          });
        }
        else {
        this.messageTemplateForm.controls.TemplateMessage.setValue(this.glificMessage);
        this.variableCount = 0;
        this.updateFields()
        }
      });
      this.IsLoading = false;
      resolve(true);
    });
    return promise;
  }
  updateFields() {
    // Remove existing dynamic controls
    this.fields.forEach((_, index) => {
      const fieldName = `Variable${index + 1}`;
      if (this.messageTemplateForm.contains(fieldName)) {
          this.messageTemplateForm.removeControl(fieldName);
      }
  });
    this.fields = Array.from({ length: this.variableCount }, (_, index) => ({
      label: `Variable ${index + 1}`,
      value: ''
    }));
    this.fields.forEach((field, index) => {
      const fieldName = `Variable${index + 1}`;
      this.messageTemplateForm.addControl(
        fieldName,
        new FormControl('', Validators.required)
      );
    });
  }

  updateMessage() {
    let updatedMessage = this.glificMessage;
    for (let i = 0; i < this.variableCount; i++) {
      updatedMessage = updatedMessage.replace(`{{${i + 1}}}`, `{{Variable${i + 1}}}`);
    }
    this.messagepreview = updatedMessage;
  }

  updateMessagePreview() {
    let updatedMessagePreview = this.messagepreview;
    this.fields.forEach((_, index) => {
      const fieldName = `Variable${index + 1}`;
      const fieldValue = this.messageTemplateForm.controls[fieldName].value;
      if (fieldValue) {
        const variablePlaceholder = `{{${fieldName}}}`;
        updatedMessagePreview = updatedMessagePreview.replace(variablePlaceholder, fieldValue);
      }
    });
    this.messageTemplateForm.controls.TemplateMessage.setValue(updatedMessagePreview);
  }

  onChangeuserType(userType) {
    this.userType = userType;
    this.IsLoading = true;
    let observable;
    this.selection.clear();
    if (userType
       === "PMU-Member") {
      observable = this.messageTemplatesService.getAllPMUMember();
    } else if (userType
       === "VT") {
      observable = this.messageTemplatesService.getVtData();
    }else if (userType
      === "HOS") {
     observable = this.messageTemplatesService.getHOSData();
    }else if (userType
      === "Government Official") {
    observable = this.messageTemplatesService.getGOVData();
    }else if (userType
      === "District Resource Person") {
    observable = this.messageTemplatesService.getDisRPData();
    }
    if (observable) {
      observable.subscribe(response => {
        this.updateTableData(response);
        this.IsLoading = false;
      }, error => {
        console.log(error);
        this.IsLoading = false;
      });
    }
    this.conditionList = this.userTypeConditionsMap[userType] || [];
    this.messageTemplateForm.controls.ConditionId.setValue(null); // Reset the selected condition
    this.IsLoading = true;
  }

  async saveOrUpdateMessageTemplateDetails() {
    if (!this.messageTemplateForm.valid) {
      this.validateAllFormFields(this.messageTemplateForm);
      return;
    }

    const data = this.selection.selected;
    const messageMediaData = this.messageMediaResults
    const templateId = parseInt(this.templateId, 10);
    const userType = this.userType;
    const inputData = {
      isHsm: true,
      templateId: templateId,
      params: []
    };

    this.fields.forEach((_, index) => {
      const fieldName = `Variable${index + 1}`;
      const fieldValue = this.messageTemplateForm.controls[fieldName].value;
      if (fieldValue) {
        inputData.params.push(fieldValue);
      }

    });
    try {
      const TIMEOUT_DURATION = 240000; // 4 minutes
    
      // Create a timeout promise
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ Timeout: true }), TIMEOUT_DURATION)
      );
    
      // Race the backend call against the timeout
      const response: any = await Promise.race([
        this.messageTemplatesService
          .CreateContactGroup({ data }, templateId, userType, inputData, messageMediaData)
          .toPromise(),
        timeoutPromise,
      ]);
    
      // Common handling logic after receiving a response
      const handleSuccess = async (message: string) => {
        this.setValueFromFormGroup(this.messageTemplateForm, this.messageTemplateModel);
        const messageTemplateResp: any = await this.messageTemplatesService
          .createOrUpdateMessageTemplate(this.messageTemplateModel)
          .toPromise();
    
        if (messageTemplateResp?.Success) {
          this.zone.run(() => {
            this.showActionMessage(message, this.Constants.Html.SuccessSnackbar);
            this.router.navigate([RouteConstants.WhatsappBroadcasting.List]);
            setTimeout(() => window.location.reload(), 10000);
          });
        } else {
          const errorMessages = this.getHtmlMessage(messageTemplateResp.Errors);
          this.dialogService.openShowDialog(errorMessages);
        }
      };
    
      if (response.Timeout) {
        // Handle timeout response
        await handleSuccess('Success! The message has been queued and will be sent soon.');
      } else {
        // Process actual backend response
        await handleSuccess(this.Constants.Messages.RecordSavedMessage);
      }
    
      this.IsLoading = false;
      return true;
    } catch (error) {
      console.error('Error:', error);
      this.IsLoading = false;
      return false;
    }
  }

  createMessageTemplateForm(): FormGroup {
    const formGroup = this.formBuilder.group({
      CampainID: new FormControl({ value: this.messageTemplateModel.CampainID, disabled: this.PageRights.IsReadOnly }),
      GlificMessage: new FormControl({ value: this.messageTemplateModel.GlificMessage, disabled: true }),
      TemplateID: new FormControl({ value: this.messageTemplateModel.TemplateID, disabled: this.PageRights.IsReadOnly }, Validators.required),
      ConditionId: new FormControl({ value: this.messageTemplateModel.ConditionId, disabled: this.PageRights.IsReadOnly }),
      TemplateMessage: new FormControl({ value: this.messageTemplateModel.TemplateMessage, disabled: this.PageRights.IsReadOnly }, Validators.maxLength(3000)),
      UserType: new FormControl({ value: this.messageTemplateModel.UserType, disabled: this.PageRights.IsReadOnly }, [Validators.required, Validators.maxLength(150)]),
    });
    return formGroup;
  }

}