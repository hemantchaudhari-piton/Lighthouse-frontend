import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from 'app/common/base/base.component';
import { CommonService } from 'app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DialogService } from 'app/common/confirm-dialog/dialog.service';
import { RouteConstants } from 'app/constants/route.constant'
import { SchoolCategoryService } from '../school-category.service';
import { SchoolCategoryModel } from '../school-category.model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'school-category',
  templateUrl: './create-school-category.component.html',
  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule,MatInputModule,MatSelectModule],
  styleUrls: ['./create-school-category.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateSchoolCategoryComponent extends BaseComponent<SchoolCategoryModel> implements OnInit {
  schoolCategoryForm: FormGroup;
  schoolCategoryModel: SchoolCategoryModel;

  constructor(public commonService: CommonService,
    public router: Router,
    public routeParams: ActivatedRoute,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    private schoolCategoryService: SchoolCategoryService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder) {
    super(commonService, router, routeParams, snackBar);

    // Set the default schoolCategory Model
    this.schoolCategoryModel = new SchoolCategoryModel();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.keys.length > 0) {
        this.PageRights.ActionType = params.get('actionType');

        if (this.PageRights.ActionType == this.Constants.Actions.New) {
          this.schoolCategoryModel = new SchoolCategoryModel();

        } else {
          var schoolCategoryId: string = params.get('schoolCategoryId')

          this.schoolCategoryService.getSchoolCategoryById(schoolCategoryId)
            .subscribe((response: any) => {
              this.schoolCategoryModel = response.Result;

              if (this.PageRights.ActionType == this.Constants.Actions.Edit)
                this.schoolCategoryModel.RequestType = this.Constants.PageType.Edit;
              else if (this.PageRights.ActionType == this.Constants.Actions.View) {
                this.schoolCategoryModel.RequestType = this.Constants.PageType.View;
                this.PageRights.IsReadOnly = true;
              }

              this.schoolCategoryForm = this.createSchoolCategoryForm();
            });
        }
      }
    });

    this.schoolCategoryForm = this.createSchoolCategoryForm();
  }

  saveOrUpdateSchoolCategoryDetails() {
    this.setValueFromFormGroup(this.schoolCategoryForm, this.schoolCategoryModel);

    this.schoolCategoryService.createOrUpdateSchoolCategory(this.schoolCategoryModel)
      .subscribe((schoolCategoryResp: any) => {

        if (schoolCategoryResp.Success) {
          this.zone.run(() => {
            this.showActionMessage(
              this.Constants.Messages.RecordSavedMessage,
              this.Constants.Html.SuccessSnackbar
            );

            this.router.navigate([RouteConstants.SchoolCategory.List]);
          });
        }
        else {
          var errorMessages = this.getHtmlMessage(schoolCategoryResp.Errors.$values)
          this.dialogService.openShowDialog(errorMessages);
        }
      }, error => {
        console.log('SchoolCategory deletion errors =>', error);
      });
  }

  //Create schoolCategory form and returns {FormGroup}
  createSchoolCategoryForm(): FormGroup {
    return this.formBuilder.group({
      SchoolCategoryId: new FormControl(this.schoolCategoryModel.SchoolCategoryId),
      CategoryName: new FormControl({ value: this.schoolCategoryModel.CategoryName, disabled: this.PageRights.IsReadOnly }, Validators.required),
      Description: new FormControl({ value: this.schoolCategoryModel.Description, disabled: this.PageRights.IsReadOnly }),
      IsActive: new FormControl({ value: this.schoolCategoryModel.IsActive, disabled: this.PageRights.IsReadOnly }),
    });
  }
}
