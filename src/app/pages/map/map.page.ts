import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MapboxCardComponent } from 'src/app/components/mapbox/mapbox-card/mapbox-card.component';
import { Coords, MapboxMapComponent } from 'src/app/components/mapbox/mapbox-map/mapbox-map.component';
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, MapboxMapComponent, MapboxCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapPage implements OnInit {

  coords!: Coords;
  modal: HTMLIonModalElement | null = null;

  constructor() { }

  async ngOnInit() {
    console.log("Map Page");
  }

  async updateResults(coords: Coords) {
    this.coords = coords;
  }
}



