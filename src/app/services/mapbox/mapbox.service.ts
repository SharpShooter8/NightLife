import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {

  map: mapboxgl.Map | undefined;
  style = 'mapbox://styles/mapbox/standard';
  lat: number = 30.2672;
  lng: number = -97.7431;

  constructor() {}

  initializeMap(container:string){
    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: container,
      style: this.style,
      zoom: 19,
      center: [this.lng, this.lat],
      pitch: 90,
      doubleClickZoom: false,
      projection: {
        name: 'mercator',
      }
    });

    // Render Removes Weird Size Issue On Load
    this.map.once('render', () => {
      this.map?.resize();
    })
    // Render Has Small Size Issue, So Load Is Called To Fix That
    // This Can Be Seen At The Bottom Of The Map On Load
    this.map?.once('load', () => {
      this.map?.resize();
    });
  }

  setStyle(style:string){
    this.map?.setStyle(style);
  }

  setZoom(zoom:number){
    this.map?.setZoom(zoom);
  }

  setCenter(lng:number, lat:number){
    this.map?.setCenter([lng, lat]);
  }

}
