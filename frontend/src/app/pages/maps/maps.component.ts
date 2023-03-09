import { Component,OnInit } from '@angular/core';
// [I]
// import data from '/home/ilyes/Documents/Coding/Web/PattedV/visDataExample.json';
import { HttpClient } from '@angular/common/http';

// declare var google: any;

@Component({
  moduleId: module.id,
  selector: 'maps-cmp',
  templateUrl: 'maps.component.html'
})

export class MapsComponent implements OnInit {
  JSONFileURL = '../../../assets/test.json';

  jsonDataResult: any = [];
  clusterClass = true;
  wordClass = true;
  dataImported = false;

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

  constructor(private httpClient: HttpClient) {}

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
    let colors: string[] = ['aqua', 'blueviolet', 'coral', 'chartreuse', 'darkorange', 'darkolivegreen'];
    return colors[clusterID%(colors.length)];
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

  ngOnInit() {

    // Importation des données en format JSON
    this.httpClient.get(this.JSONFileURL).subscribe((data) => {
      this.jsonDataResult = data;
      this.dataImported = true;
      console.log('Données importées : ', this.jsonDataResult);
    });

    // Pour la mise en évidence des clusters lors du passage du curseur sur les différents bursts
    // console.log("Début du délai");
    // Timeout utilisé pour laisser le temps aux données d'être récupérées et à la page le temps d'être générée
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
