import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseListComponent } from 'app/common/base-list/base.list.component';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/reports/report.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataUploadModel } from './data-upload.model';
import { DropdownModel } from 'app/models/dropdown.model';
import { FileUploadModel } from 'app/models/file.upload.model';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FuseSharedModule } from '@fuse/shared.module';
@Component({
  standalone : true ,
  imports: [MatPaginatorModule,MatSelectModule,MatInputModule,MatTableModule,MaterialFileInputModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  selector: 'data-upload',
  templateUrl: './data-upload.component.html',
  styleUrls: ['./data-upload.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class DataUploadComponent extends BaseListComponent<DataUploadModel> implements OnInit {
  dataUploadForm: FormGroup;
  fileUploadModel: FileUploadModel;
  dataTypetList: DropdownModel[];
  uploadedFileUrl: string;
  isAvailableUploadedExcel: boolean = false;
  tenantInfo: string;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    public zone: NgZone,
    private dialogService: DialogService,
    public formBuilder: FormBuilder,
    private reportService: ReportService) {
    super(commonService, router, routeParams, snackBar, zone);

    // Set the default school Model
    this.fileUploadModel = new FileUploadModel();
    this.dataTypetList = <DropdownModel[]>[
      { Id: '', Name: 'Select Excel Template' },
      { Id: 'Division', Name: 'Division', Template: 'Divisions_Template.xlsx' },
      { Id: 'District', Name: 'District', Template: 'Districts_Template.xlsx' },
      { Id: 'Block', Name: 'Block', Template: 'Blocks_Template.xlsx' },
      { Id: 'Schools', Name: 'Schools', Template: 'Schools_Template.xlsx' },
      { Id: 'HeadMasters', Name: 'Head Masters', Template: 'HeadMasters_Template.xlsx' },
      { Id: 'VocationalTrainingProviders', Name: 'Vocational Training Providers', Template: 'VocationalTrainingProviders_Template.xlsx' },
      { Id: 'VocationalCoordinators', Name: 'Vocational Coordinators', Template: 'VocationalCoordinators_Template.xlsx' },
      { Id: 'VocationalTrainers', Name: 'Vocational Trainers', Template: 'VocationalTrainers_Template.xlsx' },
      { Id: 'SectorJobRoles', Name: 'Sector Job Roles',class:"data-active", Template: 'SectorJobRoles_Template.xlsx' },
      { Id: 'SchoolSectorJobRole', Name: 'School Sector JobRole', Template: 'SchoolsSectorJobRole_Template.xlsx' },
      { Id: 'VTP/VC/VTGenericMapping', Name: 'VTP/VC/VT Generic Mapping', Template: 'VTPVCVTGeneric_Mapping_Template.xlsx' },
      { Id: 'VTAcademicClassSection', Name: 'VT Academic Class Section', Template: 'VTAcademicClassSection_Template.xlsx' },
      { Id: 'Students', Name: 'Students', Template: 'Students_Template.xlsx' },
      { Id: 'CourseModules', Name: 'Course Modules', Template: 'CourseModules_Template.xlsx' }
    ]

    
    this.commonService.GetMasterDataByType({ DataType: 'DataValues', ParentId: 'BulkUpload', SelectTitle: 'BulkUpload' }).subscribe((response: any) => {

      if (!response) {
        console.warn("Response is null or undefined. dataTypetList remains unchanged.");
        return;
      }
    
      if (Array.isArray(response.Results.$values) && response.Results.$values.length > 1) {
        // Exclude the first item and extract Name and Description values from the remaining items
        const roleItems = response.Results.$values.slice(1); // Exclude the first item (index 0)
    
    
        // Get the current user's role
        const userRole = this.UserModel.RoleCode;
    
        // Check if the user's role exists in the response items
        const userRoleExists = roleItems.some(item => item.Name === userRole);
    
        if (userRoleExists) {
          // Extract descriptions for the current user's role
          const roleDescriptions = roleItems
            .filter(item => item.Name === userRole)
            .map(item => item.Description);
    
          console.log("Descriptions for user role:", roleDescriptions);
    
          // Filter dataTypetList based on role descriptions
          this.dataTypetList = this.dataTypetList.filter(item => roleDescriptions.includes(item.Name));
        } else {
          console.warn(`No matching role found for the user role: ${userRole}`);
        }
      } else {
        console.warn("Invalid or empty response data:", response.Results.$values);
      }
    });
    
    
    
    if(this.UserModel.RoleCode == 'HM'||this.UserModel.RoleCode == 'VT')
  {
      this.dataTypetList = this.dataTypetList.filter(item => item.Id === 'Students');
    }
  }

  ngOnInit(): void {
    this.dataUploadForm = this.createDataUploadForm();
    const hostnameParts = window.location.hostname.split('.');
    this.tenantInfo = hostnameParts[0];
    if (this.tenantInfo === 'delhi') {
      const schoolsTemplate = this.dataTypetList.find(item => item.Id === 'Schools');
      if (schoolsTemplate) {
        schoolsTemplate['Template'] = 'School_Template_dl.xlsx';
      }
    }
    if (this.tenantInfo === 'gujarat') {
      const schoolsTemplate = this.dataTypetList.find(item => item.Id === 'VocationalTrainers');
      if (schoolsTemplate) {
        schoolsTemplate['Template'] = 'VocationalTrainers_Template_GJ.xlsx';
      }
    }
  }

  uploadedFile(event) {

    if (event.target.files.length > 0) {
      var fileExtn = event.target.files[0].name.split('.').pop().toLowerCase();

      if (this.AllowedExcelExtensions.indexOf(fileExtn) == -1) {
        this.dataUploadForm.get('UploadFile').setValue(null);
        this.dialogService.openShowDialog("Please upload excel file only.");
        return;
      }

      this.getUploadedFileData(event, this.Constants.DocumentType.BulkUploadData).then((response: FileUploadModel) => {
        this.fileUploadModel = response;
      });

      this.isAvailableUploadedExcel = false;
    }
  }

  //Create VTMonthlyAttendance form and returns {FormGroup}
  createDataUploadForm(): FormGroup {
    return this.formBuilder.group({
      ContentType: new FormControl({ value: this.fileUploadModel.ContentType , disabled:false }, Validators.required),
      UploadFile: new FormControl({ value: this.fileUploadModel.UploadFile }, Validators.required)
    });
  }

  uploadExcelData(): void {
    let dataTypeCtrl = this.dataUploadForm.get('ContentType').value;

    if (dataTypeCtrl.Id === undefined) {
      this.dialogService.openShowDialog("Please select data type first !!!");
      return;
    }

    if (this.fileUploadModel.FileName === "") {
      this.dialogService.openShowDialog("Please upload excel template data first !!!");
      return;
    }

    let excelFormData = this.setUploadedFile(this.fileUploadModel);
    excelFormData.UserId = this.UserModel.UserTypeId;
    excelFormData.ContentType = dataTypeCtrl.Id;

    this.reportService.UploadExcelData(excelFormData).subscribe(response => {
      if (response.Success) {
        this.uploadedFileUrl = response.Messages.$values.pop();
        this.isAvailableUploadedExcel = true;
        this.dialogService.openShowDialog("Template data executed successfully for " + dataTypeCtrl.Name + '. Please download uploaded excel file and check status');
      }
      else {
        this.dialogService.openShowDialog("Data uploading failed for " + dataTypeCtrl.Name + " " + response.Errors.$values.pop());
      }
    });
  }

  downloadUploadedExcelResults() {
    let pdfReportUrl = this.Constants.Services.BaseUrl + 'Lighthouse/DownloadFile?fileUrl=' + this.uploadedFileUrl;
    window.open(pdfReportUrl, '_blank', '');
  }

  downloadTemplateExcel() {
    let dataTypeCtrl = this.dataUploadForm.get('ContentType').value;

    if (dataTypeCtrl.Template === undefined) {
      this.dialogService.openShowDialog("Please select data type first for downloading templates !!!");
      return;
    }

    let pdfReportUrl = '/assets/templates/bulk_upload/' + dataTypeCtrl.Template;
    window.open(pdfReportUrl, '_blank', '');
  }
}
