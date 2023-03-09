import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlaskapiService } from 'app/flaskapi.service';
import { user } from 'app/models/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  // username: string;
  // password: string;
  loginObj: any;
  // isSuccessful = false;
  // isSignUpFailed = false;
  // errorMessage = '';
  constructor(public flaskApiService: FlaskapiService, private router: Router) {  
      this.loginObj = {
      email:'',
      username:'',
      password:'',
      passconf:'',

    };
    }
  
  // constructor(private router: Router,) {
  
  // }




  public userForm = new FormGroup({
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('',  Validators.required),
    email: new FormControl('',  Validators.required), 
    password: new FormControl('',  Validators.required),   
  });



  public addUser(formData: user){
    
   
      //   alert('password not matching');
      // }
    this.flaskApiService.addUser(formData).subscribe(res => {
      console.log(formData);
      console.log(res);
      this.router.navigate(["/login"]);
    });
 
}

  ngOnInit(): void {
  }

  // login() {
  //   if (this.loginObj.password == '') {
  //   alert('Password required');
  // } else if (this.loginObj.password !== this.loginObj.passconf) {
  //   alert('password not matching');
  // }
  // else if (this.loginObj.username == '') {
  //   alert('Username required');
  // } 
  // else if (this.loginObj.email == '') {
  //   alert('email required');
  // }
  // else {
  //   this.router.navigateByUrl('/admin');
  // }
  // } 


}
