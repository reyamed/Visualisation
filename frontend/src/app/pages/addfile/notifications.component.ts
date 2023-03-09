import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlaskapiService } from 'app/flaskapi.service';
import { afile } from 'app/models/afile';



@Component({
    selector: 'notifications-cmp',
    moduleId: module.id,
    templateUrl: 'notifications.component.html'
})

export class NotificationsComponent implements OnInit{

  public filee:any = null; 

  constructor(public flaskApiService: FlaskapiService, private router: Router, private route: ActivatedRoute) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  public handleInput($event: Event){
    //getting the image or files
    this.filee = $event.target["files"];
    console.log(this.filee);
  }


  public fileForm = new FormGroup({
    cover: new FormControl('',  Validators.required),  
  });
  
  public addFile(formData: afile){
    
    this.flaskApiService.addFile( this.filee).subscribe(res => {
      
    console.log(res);
    // this.router.navigate(["../maps"], { relativeTo: this.route});
    });
  }
}
