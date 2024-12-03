import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { LoginService } from './../../../app/auth/login/login.service';
@Component({
  selector: 'privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],  standalone : true ,
  imports: [MatPaginatorModule,MatTableModule,CommonModule,RouterModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule,MatDatepickerModule,FuseSharedModule],
  encapsulation: ViewEncapsulation.None

})
export class PrivacyPolicyComponent implements OnInit {
  public tenantInfo: any;
  isEnabled2ndPolicy: boolean= false;
  constructor(
    private fuseConfigService: FuseConfigService,
    private loginservice: LoginService,
  ) { 
    this.fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        toolbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        sidepanel: {
          hidden: true
        }
      }
    };
  }
  ngOnInit(): void {

    this.loginservice.getTenantInfo()
    .subscribe((logResp: any) => {

      const tenantsInfo = [];

      // Iterate through the array in logResp.Results.$values
      logResp.Results.$values.forEach((item: any) => {
          const tenant = {
              Name: item.Name,
              Identifier: item.Identifier,
              Email: item.Email,
              Content: item.Content,
              Image: item.Image,
              Mobile: item.Mobile,
              PublishDate: item.PublishDate
          };

          // Add the object to the tenantsInfo array
          tenantsInfo.push(tenant);
      });
    this.tenantInfo = tenantsInfo[0];
    if(this.tenantInfo){
      if(this.tenantInfo.Name == "Rajasthan"){
        this.isEnabled2ndPolicy = true
      }
      else{
        this.isEnabled2ndPolicy = false
      }
    }
    })

  }

}
