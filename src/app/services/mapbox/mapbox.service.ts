import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FoursquareService } from '../foursquare/foursquare.service';
import { Map, Marker, Popup } from 'mapbox-gl'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { OpencageService } from '../opencage/opencage.service';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {

  map!: Map;
  style = 'mapbox://styles/chasehubbell/clsmhrqwd01pr01qrfchy9w51';
  lat: number = 30.2672;
  lng: number = -97.7431;

  constructor(private opencage: OpencageService, private foursquare: FoursquareService, private http: HttpClient) { }

  initializeMap(container: string) {

    this.map = new Map({
      accessToken: environment.mapbox.accessToken,
      container: container,
      style: this.style,
      zoom: 19,
      center: [this.lng, this.lat],
      pitch: 90,
      doubleClickZoom: false,
      projection: {
        name: 'mercator',
      },
      antialias: true,
    });

    // Render Removes Weird Size Issue On Load
    this.map.once('render', () => {
      this.map.resize();
    });

    // Render Has Small Size Issue, So Load Is Called To Fix That
    // This Can Be Seen At The Bottom Of The Map On Load
    this.map.once('load', async () => {
      this.map.resize();
      this.map.on("click", async (e) => {
        const features = this.map.queryRenderedFeatures(e.point);
        console.log(features);
        if (this.map === undefined) { return; }
        await this.createMarker(e.lngLat.lng, e.lngLat.lat);
        this.createPopup(e.lngLat.lng, e.lngLat.lat, features[0]?.id?.toString())
        let value = await firstValueFrom(this.opencage.getDataFromLL(e.lngLat.lat, e.lngLat.lng));
        console.log(value);
      });
    });
  }

  setStyle(style: string) {
    this.map.setStyle(style);
  }

  setZoom(zoom: number) {
    this.map.setZoom(zoom);
  }

  setCenter(lng: number, lat: number) {
    this.map.setCenter({ lng: lng, lat: lat });
  }

  async createMarker(lng: number, lat: number) {
    new Marker().setLngLat({ lat: lat, lng: lng }).addTo(this.map);
    console.log(lat.toString() + "," + lng.toString());
  }

  createPopup(lng: number, lat: number, data: string | undefined) {
    new Popup().setLngLat({ lat: lat, lng: lng }).setHTML("<p style='color:black;'> " + data + "</p>").addTo(this.map);
  }

  flyTo(lng: number, lat: number) {
    this.map.flyTo({
      center: { lng: lng, lat: lat },
      essential: true
    })
  }

  getGeoCoderData(lat: number, lng: number): Observable<GeoCodingResult> {
    const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=` +
      lng + `&latitude=` + lat + `&access_token=` + environment.mapbox.accessToken;
    return this.http.get(url);
  }

  async getAddressesFromLngLat(lat: number, lng: number): Promise<string[]> {
    const geoCoderData = await firstValueFrom(this.getGeoCoderData(lat, lng));
    const combinedNames: string[] | undefined = geoCoderData?.features?.map(feature => `${feature.properties?.name} ${feature.properties?.place_formatted}`);
    return combinedNames ? combinedNames : [];
  }

}

export interface GeoCodingResult {
  type?: string;
  attribution?: string;
  features?: Feature[];
}

export interface Feature {
  id?: string;
  type?: string;
  geometry?: Geometry;
  properties?: Properties;
}

export interface Geometry {
  type?: string;
  coordinates?: number[];
}

export interface Properties {
  mapbox_id?: string;
  feature_type?: string;
  name?: string;
  name_preferred?: string;
  place_formatted?: string;
  context?: Context;
  coordinates?: Coordinates;
  bbox?: number;
  match_code?: Match_Code;
}

export interface Address {
  mapbox_id?: string;
  address_number?: string;
  street_name?: string;
  name?: string;
}

export interface Street {
  mapbox_id?: string;
  name?: string;
}

export interface Neighborhood {
  alternate?: {
    mapbox_id?: string;
    name?: string;
  };
  mapbox_id?: string;
  name?: string;
  translations?: Translations;
}

export interface Postcode {
  mapbox_id?: string;
  name?: string;
}

export interface Place {
  mapbox_id?: string;
  name?: string;
  wikidata_id?: string;
  translations?: Translations;
}

export interface District {
  mapbox_id?: string;
  name?: string;
  wikidata_id?: string;
  translations?: Translations;
}

export interface Region {
  mapbox_id?: string;
  name?: string;
  region_code?: string;
  region_code_full?: string;
  wikidata_id?: string;
  translations?: Translations;
}

export interface Country {
  mapbox_id?: string;
  name?: string;
  country_code?: string;
  country_code_alpha_3?: string;
  wikidata_id?: string;
  translations?: Translations;
}

export interface Translations {
  [language: string]: Translation;
}

export interface Translation {
  language?: string;
  name?: string;
}

export interface Context {
  address?: Address;
  street?: Street;
  neighborhood?: Neighborhood;
  postcode?: Postcode;
  place?: Place;
  district?: District;
  region?: Region;
  country?: Country;
}

export interface Coordinates {
  longitude?: number;
  latitiude?: number;
  accuracy?: 'rooftop' | 'parcel' | 'proximate';
}

export interface Match_Code {
  address_number?: 'plausible' | 'inferred' | 'not_applicable' | 'unmatched' | 'matched';
  street?: 'plausible' | 'inferred' | 'not_applicable' | 'unmatched' | 'matched';
  postcode?: 'plausible' | 'inferred' | 'not_applicable' | 'unmatched' | 'matched';
  place?: 'plausible' | 'inferred' | 'not_applicable' | 'unmatched' | 'matched';
  region?: 'plausible' | 'inferred' | 'not_applicable' | 'unmatched' | 'matched';
  locality?: 'plausible' | 'inferred' | 'not_applicable' | 'unmatched' | 'matched';
  country?: 'plausible' | 'inferred' | 'not_applicable' | 'unmatched' | 'matched';
  confidence?: 'low' | 'medium' | 'high' | 'exact';
}

