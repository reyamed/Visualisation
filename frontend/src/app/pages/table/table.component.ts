
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { FlaskapiService } from 'app/flaskapi.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { HttpClient } from '@angular/common/http';

declare interface TableData {
    headerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'table-cmp',
    moduleId: module.id,
    templateUrl: 'table.component.html'
})

export class TableComponent implements OnInit{
    //contient les noms des fichiers csv
    public newArray = [];
    //contient les noms des fichiers Json
    public jsonArray = [];
    public ref: any;

    constructor(public flaskApiService: FlaskapiService, private storage: AngularFireStorage, private router: Router, private httpClient: HttpClient) {}


    // function that get the names of files 
    public getfiles(){
    
        this.flaskApiService.getfiles().subscribe(res => {
            console.log(res)
            for (const key in res) {
                if(res[key] !== 'nothing'){
                    console.log(key, res[key]);
                    this.newArray.push(res[key])
                }
                
              }
            //   this.jsonArray =  this.newArray.map(value => value + ".json");
            //   this.newArray = this.newArray.map(value => value + ".csv")
            //   console.log(this.jsonArray)
            //   console.log(this.newArray)

        });
    }


    // downloadFile() {
    //     this.http.get('https://example.com/file.pdf', { responseType: 'blob' }).subscribe((res: any) => {
    //       const url = window.URL.createObjectURL(res);
    //       const a = document.createElement('a');
    //       document.body.appendChild(a);
    //       a.style.display = 'none';
    //       a.href = url;
    //       a.download = 'file.pdf';
    //       a.click();
    //       window.URL.revokeObjectURL(url);
    //       a.remove(); // remove the element from the DOM
    //     });
    //   }

    dowloadFile(source, filename){
        
        if(source == "uploads/"){
            console.log(filename)
            this.ref = this.storage.ref(source + filename);
        }
        else if (source == "results/"){
            this.ref = this.storage.ref(source + filename);
        }
        else  {
            this.ref = this.storage.ref("uploads/" + filename);
        }

    // const ref = this.storage.ref("uploads/2280fd8b-f0f3-4d4f-b096-9a84d1d280fa.csv");
      this.ref.getDownloadURL().subscribe(url => {
        this.httpClient.get(url,  { responseType: 'blob' }).subscribe((data: any) => {
            console.log(filename)
            const url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove(); // remove the element from the DOM 
      });
    });
    }

    // this function sends the json file name to the visualisation page so it gets visualised
    visualize(filename) {
        const navigationExtras: NavigationExtras = {
            state: {
              data: filename
            }
          };
          this.router.navigate(["/admin/maps"], navigationExtras);
    }
    ngOnInit(){
        this.getfiles()
    }
}
