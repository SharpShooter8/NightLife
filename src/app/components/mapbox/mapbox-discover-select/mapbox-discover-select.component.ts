import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular'
import { Observable, map } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CustomLocationData } from 'src/app/services/database/custom-location.service';
import { FoursquareService, Photo, Place, PlaceSearchQuery } from 'src/app/services/foursquare/foursquare.service';

@Component({
  selector: 'app-mapbox-discover-select',
  templateUrl: './mapbox-discover-select.component.html',
  styleUrls: ['./mapbox-discover-select.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapboxDiscoverSelectComponent  implements OnInit {

  @Output() selectedPlace: EventEmitter<Place | {id: string, data: CustomLocationData}> = new EventEmitter<Place | {id: string, data: CustomLocationData}>();

  places$: Observable<Place[]>;
  placeSearchQuery: PlaceSearchQuery = {
    ll: '30.26618380749575,-97.73357972175239',
    sort: 'DISTANCE',
    limit: 12,
    fields: "distance,hours,rating,location,photos,name,price,tips,website,fsq_id,geocodes"
  }

  constructor(private authService: AuthenticationService, private foursquareService: FoursquareService) {
    this.places$ = this.foursquareService.placeSearch(this.placeSearchQuery).pipe(map(results => { return results.results }));
  }

  ngOnInit() {
    let test = 0;
  }

  getPlacePhotoSrc(photo: Photo | undefined): string {
    if (!photo) {
      return 'https://ionicframework.com/docs/img/demos/card-media.png';
    }
    return photo.prefix + '800x800' + photo.suffix;
  }

  metersToMiles(meters: number | undefined): string {
    if (!meters) { return '0.0 mi' };
    const miles = meters * 0.000621371;
    return miles.toFixed(2) + ' mi';
  }

}
