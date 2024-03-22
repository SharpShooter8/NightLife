import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Coords, MapboxMapComponent } from 'src/app/components/mapbox/mapbox-map/mapbox-map.component';
import { MapboxResultModalComponent } from 'src/app/components/mapbox/mapbox-result-modal/mapbox-result-modal.component';
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, MapboxMapComponent, MapboxResultModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapPage implements OnInit {

  coords!: Coords;

  constructor() { }

  ngOnInit() {
    console.log("Map Page");
  }

  updateResults(coords: Coords){
    this.coords = coords;
  }

}

