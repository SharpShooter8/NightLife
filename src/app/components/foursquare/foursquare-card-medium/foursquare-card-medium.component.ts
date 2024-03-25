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

}
