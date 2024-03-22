import { CUSTOM_ELEMENTS_SCHEMA, Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MapboxResultCardComponent } from '../mapbox-result-card/mapbox-result-card.component';
import { FoursquareService, Place } from 'src/app/services/foursquare/foursquare.service';
import { OpencageService } from 'src/app/services/opencage/opencage.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-mapbox-result-modal',
  templateUrl: './mapbox-result-modal.component.html',
  styleUrls: ['./mapbox-result-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, MapboxResultCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class MapboxResultModalComponent  implements OnInit {

  places: Place[] = [];

  constructor(private foursquare: FoursquareService, private opencage: OpencageService) { }

  ngOnInit() {
    console.log("Created result modal");
  }

  @Input()
  set modalInput(input: ModalInput){
    this.updatePlaces(input.coords);
  }

  async updatePlaces(coords: Coords){
    const opencageResults = await firstValueFrom(this.opencage.getDataFromLL(coords.lat, coords.lng));
    console.log(opencageResults.results);
    opencageResults.results?.forEach(async (result) => {
      const placeName = result.formatted?.split(',')[0].trim();
      if(placeName !== undefined && placeName != null){
        const foursquareResults = await firstValueFrom(this.foursquare.placeSearch({query: placeName, ll: coords.lat + "," + coords.lng, radius: 80, fields:"distance,hours,rating,location,photos,name"}));
        this.places = foursquareResults.results;
      }
    });
  }

}

export interface Coords {
  lat: number;
  lng: number;
}

export interface ModalInput{
  coords: Coords;
}
