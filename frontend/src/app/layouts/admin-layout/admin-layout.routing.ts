import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { UserComponent } from '../../pages/user/user.component';
import { TableComponent } from '../../pages/history/table.component';
import { MapsComponent } from '../../pages/visualisation/maps.component';
import { NotificationsComponent } from '../../pages/addfile/notifications.component';


export const AdminLayoutRoutes: Routes = [

        { path: 'dashboard', component: DashboardComponent },
        { path: 'user', component: UserComponent },
        { path: 'table', component: TableComponent },
        { path: 'maps', component: MapsComponent },
        { path: 'notifications', component: NotificationsComponent },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  ];