import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { user } from "./models/user";
import { loginI } from './models/loginI';
import { afile } from './models/afile';
@Injectable({
  providedIn: 'root',
  useClass: FlaskapiService
})

export class FlaskapiService {

  constructor(private httpClient: HttpClient) { }

  public server:string = "http://localhost:5000/api/";



  public getPost(postId: string){
    return this.httpClient.get<user>(this.server + `post/${postId}`)
  }


  public addUser(userObj: user){
     const {firstname, lastname, email, password} = userObj;
     const formData: FormData = new FormData();

     formData.append("firstname", firstname);
     formData.append("lastname", lastname);
     formData.append("email", email);
     formData.append("password", password);
  
     return this.httpClient.post<user>(this.server + "register", formData, { withCredentials: true })
  }

  public login(loginObj: loginI){
    const {email, password} = loginObj;
    const formData: FormData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    return this.httpClient.post<loginI>(this.server + "login", formData, { withCredentials: true })
  }
  public getuser(){
    return this.httpClient.post<user>(this.server + "getuser", "", { withCredentials: true })
  }



public addFile(filee: any){

  console.log(filee)


   const formData: FormData = new FormData();

  //  formData.append("title", title);
  //  formData.append("content", content);
   formData.append("cover", filee[0], filee["filename"]);

   return this.httpClient.post<afile>(this.server + "addpost", formData)
}


 
}
