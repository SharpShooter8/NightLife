import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MapboxService } from 'src/app/services/mapbox/mapbox.service';

@Component({
  selector: 'app-mapbox-map',
  templateUrl: './mapbox-map.component.html',
  styleUrls: ['./mapbox-map.component.scss'],
  standalone: true,
  imports: [],
})
export class MapboxMapComponent  implements OnInit {

  @Output() coords: EventEmitter<Coords> = new EventEmitter();

  constructor(private mapbox: MapboxService) {

  }

  ngOnInit() {
    console.log("mapbox component created");
    this.mapbox.initializeMap("map");
    this.mapbox.map.on("click", async(e) => {
      this.coords.emit({lat: e.lngLat.lat, lng: e.lngLat.lng});
    });
    this.coords.emit({lat: this.mapbox.lat, lng: this.mapbox.lng});
  }

}

export interface Coords {
  lat: number;
  lng: number;
}
