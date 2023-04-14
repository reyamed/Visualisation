import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlaskapiService } from 'app/flaskapi.service';
import { loginI } from 'app/models/loginI';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  loginObj: any;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  color = 'red';
  constructor(public flaskApiService: FlaskapiService, private router: Router) {
    this.loginObj = {
      username:'',
      password:''
    };
  }

  public loginForm = new FormGroup({
    email: new FormControl('',  Validators.required), 
    password: new FormControl('',  Validators.required),   
  });

  public loginfunc(formData: loginI){
    
   
    //   alert('password not matching');
    // }
  this.flaskApiService.login(formData).subscribe(res => {
    console.log(formData);
    console.log(res);
    if(res["status"]){
      this.router.navigate(["/admin/dashboard"]);
    } else {
      alert('email or password incorrect');
    }
    
  });

}

  ngOnInit(): void {
  }

  login() {
    if (this.loginObj.username == 'admin' && this.loginObj.password == '1234') {
      this.router.navigateByUrl('/admin');
  } 
  else if (this.loginObj.password == '') {
    alert('Password required');
  } 
  else if (this.loginObj.username == '') {
    alert('Username required');
  }
  else {
    console.log(this.loginObj.username, this.loginObj.password);
    alert('wrong information');
  }
  } 


}
