import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthGuard } from './auth.guard';

export const AppRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminLayoutComponent, canActivate: [AuthGuard],
  children: [{path: '', loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(x => x.AdminLayoutModule)}]},
  {path: '',redirectTo: 'login', pathMatch: 'full'}, 
  {path: '**', redirectTo: 'login' } 
]
