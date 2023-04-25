import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminLayoutRoutes } from './admin-layout.routing';

import { DashboardComponent }       from '../../pages/dashboard/dashboard.component';
import { UserComponent }            from '../../pages/user/user.component';
import { TableComponent }           from '../../pages/history/table.component';
import { MapsComponent }            from '../../pages/visualisation/maps.component';
import { NotificationsComponent }   from '../../pages/addfile/notifications.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    CommonModule, 
    ColorPickerModule,
  
  ],
  declarations: [
    DashboardComponent,
    UserComponent,
    TableComponent,
    MapsComponent,
    
  ]
})

export class AdminLayoutModule {}
