import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Place } from 'src/app/services/foursquare/foursquare.service';

@Component({
  selector: 'app-foursquare-result',
  templateUrl: './foursquare-result.component.html',
  styleUrls: ['./foursquare-result.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class FoursquareResultComponent implements OnInit {

  @Input() placeData: Place | undefined;

  constructor() {}

  ngOnInit() {
    console.log("Foursquare Result Created");
  }

}
