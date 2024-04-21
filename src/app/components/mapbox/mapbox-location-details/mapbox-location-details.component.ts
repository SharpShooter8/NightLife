import { CUSTOM_ELEMENTS_SCHEMA, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopoverController, IonGrid, IonRow, IonCol, IonImg, IonThumbnail, IonLabel, IonIcon, IonItem, IonText } from '@ionic/angular/standalone'
import { Photo, Place } from 'src/app/services/foursquare/foursquare.service';

@Component({
  selector: 'app-mapbox-location-details',
  templateUrl: './mapbox-location-details.component.html',
  styleUrls: ['./mapbox-location-details.component.scss'],
  standalone: true,
  imports: [IonText, IonItem, IonIcon, IonLabel, IonImg, IonCol, IonRow, IonGrid, IonThumbnail],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapboxLocationDetailsComponent implements OnInit {

  @Input() location!: Place;
  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();
  @Output() addToPressed: EventEmitter<Place> = new EventEmitter<Place>();

  constructor(private popoverController: PopoverController) { }

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

  getStars(rating: number | undefined): string[] {
    if (!rating) {
      return [];
    }

    const convertedRating = Math.min(Math.max(0, Math.round(rating) / 2), 5);
    const fullStars = Math.floor(convertedRating);
    const halfStar = convertedRating % 1 === 0.5 ? 1 : 0;

    const stars: string[] = Array(fullStars).fill('full_star');
    if (halfStar === 1) {
      stars.push('half_star');
    }
    return stars;
  }

  getPrice(price: number | undefined): string {
    return price ? '$'.repeat(price) : "";
  }

}
