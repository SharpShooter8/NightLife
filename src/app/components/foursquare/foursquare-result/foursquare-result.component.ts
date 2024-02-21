import { CUSTOM_ELEMENTS_SCHEMA, Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AutoCompletePlace, Place } from 'src/app/services/foursquare/foursquare.service';

@Component({
  selector: 'app-foursquare-result',
  templateUrl: './foursquare-result.component.html',
  styleUrls: ['./foursquare-result.component.scss'],
  standalone: true,
  imports: [IonicModule],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class FoursquareResultComponent implements OnInit {

  @Input() placeData: Place | undefined;

  constructor() {}

  ngOnInit() {
    let test = 0;
  }

  getImageURL():string{
    return this.placeData?.photos[0].prefix + "original" + this.placeData?.photos[0].suffix;
  }

}
