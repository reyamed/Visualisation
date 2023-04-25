import { Component,OnInit } from '@angular/core';
// [I]
// import data from '/home/ilyes/Documents/Coding/Web/PattedV/visDataExample.json';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FlaskapiService } from 'app/flaskapi.service';
import * as html2pdf from 'html2pdf.js';
import {jsPDF}  from 'jspdf';
// declare var google: any;
import html2canvas from 'html2canvas';
@Component({
  moduleId: module.id,
  selector: 'maps-cmp',
  templateUrl: 'maps.component.html',
  styleUrls: ['maps.component.scss']
})

export class MapsComponent implements OnInit {
  JSONFileURL = '../../../assets/test.json';
  navigation = this.router.getCurrentNavigation();
  filename: any;
  jsonDataResult: any = [];
  clusterClass = true;
  wordClass = true;
  dataImported = false;
  analysefinished = false;
  color1 = 'red';
  clusterColors: string[] = ['aqua', 'blueviolet', 'coral', 'chartreuse', 'darkorange', 'darkolivegreen'];
  clusterColorsDuplicate: string[] = ['aqua', 'blueviolet', 'coral', 'chartreuse', 'darkorange', 'darkolivegreen'];
  selectedOption: string;
  defaultPauseBackgroundColor = 'red';
  shortPauseColor = 'rgb(200,0,30)';
  longPauseColor = 'rgb(255,0,0)';
  typeStyles = {
    'VRB' : {
      'font-weight' : 'bold'
    },
    'RL' : {
      'text-decoration' : 'underline'
    }
  };
  highlightedTextColor = 'black';
  unHighlightedTextBackgroundColor = 'rgb(200,200,200)';
  unHighlightedTextColor = 'rgb(180,180,180)';

  highlightedCluster: number = -1;

  constructor(public flaskApiService: FlaskapiService,private storage: AngularFireStorage, private router: Router, private httpClient: HttpClient) {
    
  }

  // Rajoute un espace avant chaque mot, sauf si ce mot est un point (ou un signe de ponctuation ?)
  spaceBefore(wordType: string): string {
    let result: string;
    // console.log(wordType);
    switch(wordType) {
      case 'PRD' :
        result = "";
        break;
      default :
        result = " ";
        break;
    }
    return result;
  }

  // Définit une classe du span de chaque burst en fonction du cluster auquel celui-ci appartient
  getClusterClass(id: number): string {
    return 'cluster-' + id;
  }

  // Définit une classe du span de chaque mot en fonction de la catégorie grammaticale de celui-ci
  getWordClass(wordType: string): string {
    return 'type-' + wordType;
  }

  // Définit le texte de la bulle qui s'affiche lorsque le curseur est placé sur un mot, en fonction du type de celui-ci
  getWordTitleProperty(wordType: string): string {
    return '' + wordType;
  }

  // Donne la couleur CSS associée à chaque cluster en fonction de son ID, et ce de ma nanière cyclique :
  // si l'ID dépasse le nombre de couleurs définies, on réutilise certaines couleurs
  getClusterColor(clusterID: number): string {
    return this.clusterColors[clusterID%(this.clusterColors.length)];
  }

  // Retourne le style associé à chaque cluster en fonction de si celui-ci est mis en évidence (curseur placé sur un burst de ce cluster) ou pas
  getHighlightedStyle(clusterID: number): any {
    if (this.highlightedCluster == clusterID) {
      return {
        'background-color': this.getClusterColor(clusterID), 'color': this.highlightedTextColor
      };
    }
    else {
      if (this.highlightedCluster > -1) {
        return {
          'background-color': this.unHighlightedTextBackgroundColor,
          'color': this.unHighlightedTextColor
        };
      }
      else {
        return {
          'background-color': this.getClusterColor(clusterID),
          'color': 'black'
      };
      }
    }
  }

  // highlightedClusterUpdater(): void {
  //   ;
  // }

  // Définit la couleur de surlignage des pauses en fonction de la durée de celles-ci, pour différencier les pause courtes
  // des pauses longues/significatives
  getPauseBackgroundColor(burstID: number): string {
    // console.log('getPauseBackgroundColor() called on burstID = ' + burstID); // [debugging]
    if (false) {
      console.log("getPauseBackgroundColor() : Burst ID (" + burstID + ") out of bounds (length of data array is " + this.jsonDataResult.length + "), or bursts numbered improperly !");
      return 'blue';
    }
    else {
      let laPauseLength = this.jsonDataResult[burstID-1]['pauseLength'];
      if (laPauseLength < 2.0) {
        // console.log('Short pause (' + laPauseLength + ')'); // [debugging]
        return this.shortPauseColor;
      }
      else {
        // console.log('Long pause (' + laPauseLength + ')'); // [debugging]
        return this.longPauseColor;
      }
    }
  }

  // Définit le style CSS associé aux pauses, en fonction des durées de celles-ci
  getPauseStyle(burstID: number): any {
    let leClusterID = this.jsonDataResult[burstID-1].clusterID;
    if (this.highlightedCluster > -1 && this.highlightedCluster != leClusterID) {
      return {
        'background-color': this.unHighlightedTextBackgroundColor,
        'font-weight': 'bold'
      };
    }
    else {
      return {
        'background-color': this.getPauseBackgroundColor(burstID),
        'font-weight': 'bold'
      };
    }
  }

  // Définit le texte affiché à la fin de chaque burst pour indiquer la durée de la pause qui le suit
  getPauseText(burstID: number): string {
    if (burstID > this.jsonDataResult.length) {
      console.log("getPauseText() : Burst ID (" + burstID + ") out of bounds (length of data array is " + this.jsonDataResult.length + "), or bursts numbered improperly !");
      return '';
    }
    else {
      return '[' + this.jsonDataResult[burstID-1].pauseLength + 's]';
    }
  }

  // Définit un style CSS pour chaque mot en fonction de la catégorie grammaticale de celui-ci
  getWordStyle(wordType: string): any {
    return this.typeStyles[wordType];
  }

  public analyse() {
    if (this.navigation.extras.state) {
      this.filename = this.navigation.extras.state.data;
      // if the json file already exists
      if (this.filename.endsWith(".json")) {
        // Use the data object
        const ref = this.storage.ref("uploads/"+ this.filename);
        ref.getDownloadURL().subscribe(url => {
        // Importation des données en format JSON
        this.httpClient.get(url).subscribe((data) => {
        this.jsonDataResult = data;
        this.dataImported = true;
        console.log('Données importées : ', this.jsonDataResult);
        this.analysefinished = true
        setTimeout(() => {
          // console.log("Fin du délai");
          for (let burst of this.jsonDataResult) {
           // console.log('On essaye !');
            document.getElementById('burst-' + burst.burstID).addEventListener("mouseover", () => {
              //console.log('over !');
              this.highlightedCluster = burst.clusterID;
              // console.log('highlightedCluster = ' + this.highlightedCluster);
            });

           // console.log('On essaye 2!');
            document.getElementById('burst-' + burst.burstID).addEventListener("mouseout", () => {
            //  console.log('over !2');
              this.highlightedCluster = -1;
              // console.log('highlightedCluster = ' + this.highlightedCluster);
            });
            document.getElementById('burst-' + burst.burstID).addEventListener("click", () => {
              // Que faire en cas de clic sur un cluster ?
              // window.location.href = '/admin/clusterView?clusterID=' + burst.clusterID;
              alert('Cluster d\'ID n°' + burst.clusterID);
            });
          }
        }, 500);
    });
  });
      }
      
      // if visualisation for the first time
      else {
        console.log("ggggg", this.filename)
        const obj = {
          "filename": this.filename
        };
        
        this.flaskApiService.analyse(obj).subscribe(res1 => {
    
          console.log(res1);
            if (res1["json"]=="nothing"){
              alert("This CSV file does not have the required columns and format to be analysed")
              this.router.navigate(["/admin/notifications"]);
            }
            else {
// Use the data object
          const ref = this.storage.ref(res1["json"]);
          ref.getDownloadURL().subscribe(url => {
          // Importation des données en format JSON
          this.httpClient.get(url).subscribe((data) => {
          this.jsonDataResult = data;
          this.dataImported = true;
          console.log('Données importées : ', this.jsonDataResult);
          this.analysefinished = true
          setTimeout(() => {
            // console.log("Fin du délai");
            for (let burst of this.jsonDataResult) {
              // console.log('On essaye !');
              document.getElementById('burst-' + burst.burstID).addEventListener("mouseover", () => {
                // console.log('over !');
                this.highlightedCluster = burst.clusterID;
                // console.log('highlightedCluster = ' + this.highlightedCluster);
              });
              document.getElementById('burst-' + burst.burstID).addEventListener("mouseout", () => {
                // console.log('over !');
                this.highlightedCluster = -1;
                // console.log('highlightedCluster = ' + this.highlightedCluster);
              });
              document.getElementById('burst-' + burst.burstID).addEventListener("click", () => {
                // Que faire en cas de clic sur un cluster ?
                // window.location.href = '/admin/clusterView?clusterID=' + burst.clusterID;
                alert('Cluster d\'ID n°' + burst.clusterID);
              });
            }
          }, 500);
      });
    });
            }
          
      
            });
      }
      
      
      
    }
  }
  //   generatePdf(htmlContent: string): void {
  //     const doc = new jsPDF(
  //       {
  //         orientation: "landscape",
  //         unit: "in",
  //         format: [4, 2]
  //       }
  //     );
  //     const element = document.createElement('div');
  //     element.innerHTML = htmlContent;
  //     setTimeout(() => {
  //       html2canvas(element).then((canvas) => {
  //         const imgData = canvas.toDataURL('image/png');
  //         doc.addImage(imgData, 'PNG', 0, 0, 1100,1100);
  //         doc.save('file.pdf');
  //       });
  //     }, 1000);
    
  // }
  // cette fonction permet de telecharger l'élement html sous forme pdf
  downloadPdf() { 
    
    
    const element = document.getElementById('visuals');
    const elementHeight = element.offsetHeight;
    const pageHeight = 842; // A4 page height in pixels
    const totalPages = Math.ceil(elementHeight / pageHeight);
    const options = {
      margin:       [1, 0, 0, 1],
    filename:     'myfile.pdf',
    image:        { type: 'PNG', quality: 0.98 },
    html2canvas:  {   allowTaint: true,
      dpi: 500,
      letterRendering: true,
      logging: true,
      scale: .8
  },
    jsPDF:        { format: 'a4', orientation: 'landscape' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
    enableLinks:  true,
    header: function(currentPage, totalPages, document) {
      if (currentPage === 1) {
        return '<div style="text-align:center;"><h1 style="margin:0;">'+ this.selectedOption +'</h1></div>';
      }
    }
    };
    html2pdf().from(element).set(options).save();

  }



   
  
  onOptionSelected(){

    if(this.selectedOption == 'default') {
      setTimeout(() => {
        // console.log("Fin du délai");
        for (let burst of this.jsonDataResult) {
          // console.log('On essaye !');
          document.getElementById('burst-' + burst.burstID).addEventListener("mouseover", () => {
            // console.log('over !');
            this.highlightedCluster = burst.clusterID;
            // console.log('highlightedCluster = ' + this.highlightedCluster);
          });
          document.getElementById('burst-' + burst.burstID).addEventListener("mouseout", () => {
            // console.log('over !');
            this.highlightedCluster = -1;
            // console.log('highlightedCluster = ' + this.highlightedCluster);
          });
          document.getElementById('burst-' + burst.burstID).addEventListener("click", () => {
            // Que faire en cas de clic sur un cluster ?
            // window.location.href = '/admin/clusterView?clusterID=' + burst.clusterID;
            alert('Cluster d\'ID n°' + burst.clusterID);
          });
        }
      }, 500);
    }
  }

  

  ngOnInit() {
    this.selectedOption = 'default'
    console.log(this.navigation.extras.state)
    
    this.analyse()
   

    // Pour la mise en évidence des clusters lors du passage du curseur sur les différents bursts
    // console.log("Début du délai");
    // Timeout utilisé pour laisser le temps aux données d'être récupérées et à la page le temps d'être générée
    

    // var myLatlng = new google.maps.LatLng(40.748817, -73.985428);
    // var mapOptions = {
    //   zoom: 13,
    //   center: myLatlng,
    //   scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
    //   styles: [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}]
    //
    // }
    // // [I] ?
    // var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    //
    // // [I] ?
    // var marker = new google.maps.Marker({
    //     position: myLatlng,
    //     title:"Hello World!"
    // });
    //
    // // To add the marker to the map, call setMap();
    // // [I] ?
    // marker.setMap(map);
  }
}
