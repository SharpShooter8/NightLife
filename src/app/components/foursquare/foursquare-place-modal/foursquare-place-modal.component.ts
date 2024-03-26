import { CUSTOM_ELEMENTS_SCHEMA, Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Place } from 'src/app/services/foursquare/foursquare.service';

@Component({
  selector: 'app-foursquare-place-modal',
  templateUrl: './foursquare-place-modal.component.html',
  styleUrls: ['./foursquare-place-modal.component.scss'],
  standalone: true,
  imports: [IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FoursquarePlaceModalComponent  implements OnInit {

  constructor() { }

  @Input() place: Place | null = null;

  ngOnInit() {
    let test = 0;
  }

  getPrice(): string{
    return this.place?.price ? '$'.repeat(this.place.price) : '';
  }

  getHours(): string{
    if(!this.place?.hours.display){
      return 'unkown';
    }
    return this.place.hours.display;
  }

}
