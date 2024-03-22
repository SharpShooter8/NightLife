import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-foursquare-card-large',
  templateUrl: './foursquare-card-large.component.html',
  styleUrls: ['./foursquare-card-large.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class FoursquareCardLargeComponent  implements OnInit {

  @Input() place: string = "";

  constructor() { }

  ngOnInit() {
    let test = 0;
  }

}
