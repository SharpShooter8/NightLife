import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-foursquare-card-small',
  templateUrl: './foursquare-card-small.component.html',
  styleUrls: ['./foursquare-card-small.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class FoursquareCardSmallComponent  implements OnInit {

  @Input() place: string = "";

  constructor() { }

  ngOnInit() {
    let test = 0;
  }

}
