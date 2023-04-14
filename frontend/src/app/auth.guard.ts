import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { FlaskapiService } from './flaskapi.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public flaskApiService: FlaskapiService, private http: HttpClient, private router: Router) {}

  canActivate() {
    return this.flaskApiService.protected().pipe(
      tap((data: any) => {
        console.log(data.authenticated)
        if (!data.authenticated) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
  
}
