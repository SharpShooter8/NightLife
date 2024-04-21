import { CUSTOM_ELEMENTS_SCHEMA, Component, Input, OnInit } from '@angular/core';
import { Place } from 'src/app/services/foursquare/foursquare.service';
import { IonContent, IonGrid, IonRow, IonCol, IonImg, IonItem, IonText } from "@ionic/angular/standalone";

@Component({
  selector: 'app-foursquare-place-modal',
  templateUrl: './foursquare-place-modal.component.html',
  styleUrls: ['./foursquare-place-modal.component.scss'],
  standalone: true,
  imports: [IonText, IonItem, IonImg, IonCol, IonRow, IonGrid, IonContent, ],
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
