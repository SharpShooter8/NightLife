import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Place } from 'src/app/services/foursquare/foursquare.service';

@Component({
  selector: 'app-mapbox-result-card',
  templateUrl: './mapbox-result-card.component.html',
  styleUrls: ['./mapbox-result-card.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class MapboxResultCardComponent  implements OnInit {

  @Input() placeData: Place | null = null;

  constructor() { }

  ngOnInit() {
    let test = 0;
  }

  getPhotoString(): string{
    if(this.placeData?.photos[0] !== undefined){
      return this.placeData?.photos[0].prefix + '200x300' + this.placeData?.photos[0]?.suffix;
    }
    return "https://ionicframework.com/docs/img/demos/card-media.png";
  }

}
