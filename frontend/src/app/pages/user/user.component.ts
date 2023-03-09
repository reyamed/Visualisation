import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlaskapiService } from 'app/flaskapi.service';
import { user } from 'app/models/user';

@Component({
    selector: 'user-cmp',
    moduleId: module.id,
    templateUrl: 'user.component.html'
})

export class UserComponent implements OnInit{
  
   public obj =  {
        id: '',
        email:'',
        firstname:'',
        lastname:'',
        password:'',
  
      };
      public f = "fuck"
    constructor(public flaskApiService: FlaskapiService, private router: Router, private cd: ChangeDetectorRef) {}

    public getUser(){
    
   
        //   alert('password not matching');
        // }
      this.flaskApiService.getuser().subscribe(res => {
  
        console.log(res["email"]);
        this.obj.id = res["id"]
        this.obj.email = res["email"]
        this.obj.firstname = res["firstname"]
        this.obj.lastname = res["lastname"]
        this.obj.password = res["password"]
        console.log("check this 2", this.obj.email)
        this.cd.detectChanges();
      });

   
  }
  fff() {
    this.router.navigate(["/./maps"]);
  }
    ngOnInit(){
        this.getUser()
        console.log("check this", this.obj)
    }
}
