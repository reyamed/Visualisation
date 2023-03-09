import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { UserComponent } from '../../pages/user/user.component';
import { TableComponent } from '../../pages/table/table.component';
import { TypographyComponent } from '../../pages/typography/typography.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { NotificationsComponent } from '../../pages/addfile/notifications.component';
import { AdminLayoutComponent } from './admin-layout.component';

export const AdminLayoutRoutes: Routes = [

        { path: 'dashboard', component: DashboardComponent },
        { path: 'user', component: UserComponent },
        { path: 'table', component: TableComponent },
        { path: 'typography', component: TypographyComponent },
        { path: 'maps', component: MapsComponent },
        { path: 'notifications', component: NotificationsComponent },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  ];