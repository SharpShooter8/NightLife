import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpencageService {

  constructor(private http: HttpClient) { }

  getDataFromLL(lat: number, lng: number): Observable<OpenCageResponse> {
    const url = `https://api.opencagedata.com/geocode/v1/json?` + `q=` + lat + `,` + lng + `&key=` + environment.opencage.apiKey;
    return this.http.get(url);
  }
}

export interface OpenCageResponse {
  documentation?: string;
  licenses?: License[];
  rate?: RateInfo;
  results?: Result[];
  status?: StatusInfo;
  stay_informed?: StayInformedInfo;
  thanks?: string;
  timestamp?: TimestampInfo;
  total_results?: number;
}

export interface License {
  name?: string;
  url?: string;
}

export interface RateInfo {
  limit?: number;
  remaining?: number;
  reset?: number;
}

export interface Result {
  annotations?: Annotations;
  bounds?: Bounds;
  components?: Components;
  confidence?: number;
  distance_from_q?: Distance;
  formatted?: string;
  geometry?: Geometry;
}

export interface Annotations {
  DMS?: DMS;
  MGRS?: string;
  Maidenhead?: string;
  Mercator?: Coordinates;
  OSM?: OSMAnnotations;
  UN_M49?: UNM49Annotations;
  callingcode?: number;
  currency?: Currency;
  flag?: string;
  geohash?: string;
  qibla?: number;
  roadinfo?: RoadInfo;
  sun?: SunInfo;
  timezone?: TimezoneInfo;
  what3words?: What3WordsInfo;
}

export interface DMS {
  lat?: string;
  lng?: string;
}

export interface Coordinates {
  lat?: number;
  lng?: number;
}

export interface OSMAnnotations {
  edit_url?: string;
  note_url?: string;
  url?: string;
}

export interface UNM49Annotations {
  regions?: { [key: string]: string };
  statistical_groupings?: string[];
}

export interface Currency {
  alternate_symbols?: string[];
  decimal_mark?: string;
  disambiguate_symbol?: string;
  format?: string;
  html_entity?: string;
  iso_code?: string;
  iso_numeric?: string;
  name?: string;
  smallest_denomination?: number;
  subunit?: string;
  subunit_to_unit?: number;
  symbol?: string;
  symbol_first?: number;
  thousands_separator?: string;
}

export interface RoadInfo {
  drive_on?: string;
  road?: string;
  speed_in?: string;
}

export interface SunInfo {
  rise?: SunTimes;
  set?: SunTimes;
}

export interface SunTimes {
  apparent?: number;
  astronomical?: number;
  civil?: number;
  nautical?: number;
}

export interface TimezoneInfo {
  name?: string;
  now_in_dst?: number;
  offset_sec?: number;
  offset_string?: string;
  short_name?: string;
}

export interface What3WordsInfo {
  words?: string;
}

export interface Bounds {
  northeast?: Coordinates;
  southwest?: Coordinates;
}

export interface Components {
  ISO_3166_1_alpha_2?: string;
  ISO_3166_1_alpha_3?: string;
  ISO_3166_2?: string[];
  _category?: string;
  _normalized_city?: string;
  _type?: string;
  city?: string;
  continent?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
  restaurant?: string;
  road?: string;
  state?: string;
  suburb?: string;
}

export interface Distance {
  meters?: number;
}

export interface Geometry {
  lat?: number;
  lng?: number;
}

export interface StatusInfo {
  code?: number;
  message?: string;
}

export interface StayInformedInfo {
  blog?: string;
  mastodon?: string;
}

export interface TimestampInfo {
  created_http?: string;
  created_unix?: number;
}
