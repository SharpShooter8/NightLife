import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Place } from 'src/app/services/foursquare/foursquare.service';

@Component({
  selector: 'app-foursquare-card-small',
  templateUrl: './foursquare-card-small.component.html',
  styleUrls: ['./foursquare-card-small.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class FoursquareCardSmallComponent  implements OnInit {

  @Input() place: Place | null = null;

  constructor() { }

  ngOnInit() {
    let test = 0;
    console.log("small box created");
  }

}
