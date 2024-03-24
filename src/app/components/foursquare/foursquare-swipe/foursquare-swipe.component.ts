import { CUSTOM_ELEMENTS_SCHEMA, Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FoursquareCardSmallComponent } from '../foursquare-card-small/foursquare-card-small.component';
import { FoursquareCardMediumComponent } from '../foursquare-card-medium/foursquare-card-medium.component';
import { FoursquareCardLargeComponent } from '../foursquare-card-large/foursquare-card-large.component';

@Component({
  selector: 'app-foursquare-swipe',
  templateUrl: './foursquare-swipe.component.html',
  styleUrls: ['./foursquare-swipe.component.scss'],
  standalone: true,
  imports: [IonicModule, FoursquareCardSmallComponent, FoursquareCardMediumComponent, FoursquareCardLargeComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class FoursquareSwipeComponent  implements OnInit {

  @Input() size: string = "small";

  places = ["PLACE 1", "PLACE 2", "PLACE 3", "PLACE 4", "PLACE 5", "PLACE 6", "PLACE 7", "PLACE 8", "PLACE 9", "PLACE 10",]

  constructor() { }

  ngOnInit() {
    let test = 0;
  }

}

