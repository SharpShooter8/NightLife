import { Component, OnInit } from '@angular/core';
import { MapboxService } from 'src/app/services/mapbox/mapbox.service';

@Component({
  selector: 'app-mapbox',
  templateUrl: './mapbox.component.html',
  styleUrls: ['./mapbox.component.scss'],
  standalone: true,
  imports: [],
})
export class MapboxComponent  implements OnInit {

  constructor(private mapbox: MapboxService) {

  }

  ngOnInit() {
    console.log("mapbox component created");
    this.mapbox.initializeMap("map");
  }

}
