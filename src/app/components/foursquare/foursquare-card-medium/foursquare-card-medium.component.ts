import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Place } from 'src/app/services/foursquare/foursquare.service';

@Component({
  selector: 'app-foursquare-card-medium',
  templateUrl: './foursquare-card-medium.component.html',
  styleUrls: ['./foursquare-card-medium.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class FoursquareCardMediumComponent  implements OnInit {

  @Input() place: Place | null = null;

  constructor() { }

  ngOnInit() {
    let test = 0;
  }

  getPhotoSrc(): string {
    if (!this.place?.photos[0]) {
      return 'https://ionicframework.com/docs/img/demos/card-media.png';
    }
    return this.place.photos[0].prefix + '800x800' + this.place.photos[0].suffix;
  }

  metersToMiles(meters: number | undefined): string {
    if (!meters) { return '0.0 mi' };
    const miles = meters * 0.000621371; // Conversion factor for meters to miles
    return miles.toFixed(2) + ' mi'; // Rounding to 2 decimal places and appending 'mi'
  }

  getStars(): string[] {
    if (!this.place?.rating) {
      return [];
    }

    const convertedRating = Math.min(Math.max(0, Math.round(this.place.rating) / 2), 5);
    const fullStars = Math.floor(convertedRating);
    const halfStar = convertedRating % 1 === 0.5 ? 1 : 0;

    const stars: string[] = Array(fullStars).fill('full_star');
    if (halfStar === 1) {
      stars.push('half_star');
    }
    return stars;
  }

}
