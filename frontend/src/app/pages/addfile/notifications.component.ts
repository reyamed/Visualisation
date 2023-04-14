import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras  } from '@angular/router';
import { FlaskapiService } from 'app/flaskapi.service';
import { afile } from 'app/models/afile';
import { resolve } from 'path/posix';



@Component({
    selector: 'notifications-cmp',
    moduleId: module.id,
    templateUrl: 'notifications.component.html'
})

export class NotificationsComponent implements OnInit{

  public filee:any = null; 
  public data: any;
  public filesent:boolean = false;

  constructor(public flaskApiService: FlaskapiService, private router: Router, private route: ActivatedRoute) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
    
  }

  public handleInput($event: Event){
    //getting the image or files
    this.filee = $event.target["files"];
    console.log(this.filee);
  }

 public clearFileInput() {
    this.filee = null;
    (document.getElementById("file-input") as HTMLInputElement).value = "";
    this.filesent = false
  }

  public fileForm = new FormGroup({
    cover: new FormControl('',  Validators.required),  
  });
  
  public addFile(formData: afile){
    this.filesent = true
    this.flaskApiService.addFile( this.filee).subscribe(res => {
      if (res["data"] !== "fail") {
        console.log(res["data"])
        this.data = res["data"]
      console.log(this.data)
      const navigationExtras: NavigationExtras = {
        state: {
          data: res["data"]
        }
      };
      this.router.navigate(["/admin/maps"], navigationExtras);
      } else {
        alert('extension not allowed');
      }
      
    });
  }
}
