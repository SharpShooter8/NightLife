import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoursquareService {

  headers = new HttpHeaders().set('accept', 'application/json').set('Authorization', environment.foursquare.apiKey);

  constructor(private http: HttpClient) { }

  placeSearch(query: PlaceSearchQuery): Observable<PlaceSearchResult> {
    const url = `https://api.foursquare.com/v3/places/search`;
    return this.http.get<PlaceSearchResult>(url, {
      params: query as any,
      headers: this.headers
    });
  }

  placeDetails(fsq_id: string, query: PlaceDetailsQuery): Observable<Place> {
    const url = `https://api.foursquare.com/v3/places/${fsq_id}`;
    return this.http.get<Place>(url, {
      params: query as any,
      headers: this.headers
    });
  }

  placePhotos(fsq_id: string, query: PlacePhotosQuery): Observable<Photo[]> {
    const url = `https://api.foursquare.com/v3/places/${fsq_id}/photos`;
    return this.http.get<Photo[]>(url, {
      params: query as any,
      headers: this.headers
    });
  }

  placeTips(fsq_id: string, query: PlaceTipsQuery): Observable<PlaceTipsResult[]> {
    const url = `https://api.foursquare.com/v3/places/${fsq_id}/tips`;
    return this.http.get<PlaceTipsResult[]>(url, {
      params: query as any,
      headers: this.headers
    });
  }

  placeMatch(query: PlaceMatchQuery): Observable<Place> {
    const url = `https://api.foursquare.com/v3/places/match`;
    return this.http.get<Place>(url, {
      params: query as any,
      headers: this.headers
    });
  }

  findNearby(query: FindNearbyQuery): Observable<FindNearbyResult> {
    const url = `https://api.foursquare.com/v3/places/nearby`;
    return this.http.get<FindNearbyResult>(url, {
      params: query as any,
      headers: this.headers
    });
  }

  autoComplete(query: AutoCompleteQuery): Observable<AutoCompleteResult> {
    const url = `https://api.foursquare.com/v3/autocomplete`;
    return this.http.get<AutoCompleteResult>(url, {
      params: query as any,
      headers: this.headers
    });
  }

  addressDetails(fsq_addr_id:string, query: AddressDetailsQuery): Observable<AddressDetailsResult> {
    const url = `https://api.foursquare.com/v3/address/${fsq_addr_id}`;
    return this.http.get<AddressDetailsResult>(url, {
      params: query as any,
      headers: this.headers
    });
  }
}

export interface PlaceSearchQuery {
  query?: string;
  ll?: string;
  radius?: number;
  categories?: string;
  chains?: string;
  exclude_chains?: string;
  exclude_all_chains?: boolean;
  fields?: string;
  min_price?: number;
  max_price?: number;
  open_at?: string;
  open_now?: boolean;
  ne?: string;
  sw?: string;
  near?: string;
  polygon?: string;
  sort?: 'relevance' | 'rating' | 'distance' | 'popularity';
  limit?: number;
  session_token?: string;
  super_venue_id?: string;
}

export interface PlaceDetailsQuery {
  fields?: string;
  session_token?: string;
}

export interface PlacePhotosQuery {
  limit?: number;
  sort?: "popular" | "newest";
  classifications?: ('food' | 'indoor' | 'menu' | 'outdoor')[];
}

export interface PlaceTipsQuery {
  limit?: number;
  sort?: "popular" | "newest";
  fields?: string;
}

export interface PlaceMatchQuery {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  cc?: string;
  ll?: string;
  fields?: string;
}

export interface FindNearbyQuery {
  fields?: string;
  ll?: string;
  hacc?: number;
  altitude?: number;
  query?: string;
  limit?: number;
}

export interface AutoCompleteQuery {
  query: string;
  ll?: string;
  radius?: number;
  types?: string;
  bias?: string;
  session_token?: string;
  limit?: number;
}

export interface AddressDetailsQuery {
  session_token: string;
}

export interface PlaceSearchResult {
  context: {
    geobounds: {
      circle: {
        latitude: number;
        longitude: number;
      };
      radius: number;
    };
  };
  results: Place[];
}

export interface FindNearbyResult {
  results: Place[];
}

export interface PlaceTipsResult {
  id: string;
  created_at: string;
  text: string;
  url: string;
  photo: Photo;
  lang: string;
  agree_count: number;
  disagree_count: number;
}

export interface Tip {
  id: string;
  created_at: string;
  text: string;
  url: string;
  lang: string;
  agree_count: number;
  disagree_count: number;
}
export interface Photo {
  id: string;
  created_at: string;
  prefix: string;
  suffix: string;
  width: number;
  height: number;
  classifications: string[];
  tip: Tip;
};
export interface Category {
  id: number;
  name: string;
  short_name: string;
  plural_name: string;
  icon: Photo;
}
export interface Chain {
  id: string;
  name: string
}
export interface Features {
  payment: Payment;
  food_and_drink: FoodAndDrink;
  services: Services;
  amenities: Amenities;
  attributes: Attributes;
}
export interface Payment {
  credit_cards: {
    accepts_credit_cards: {};
    amex: {};
    discover: {};
    visa: {};
    diners_club: {};
    master_card: {};
    union_pay: {};
  };
  digital_wallet: {
    accepts_nfc: {};
  };
}
export interface FoodAndDrink {
  alcohol: {
    bar_service: {};
    beer: {};
    byo: {};
    cocktails: {};
    full_bar: {};
    wine: {};
  };
  meals: {
    bar_snacks: {};
    breakfast: {};
    brunch: {};
    lunch: {};
    happy_hour: {};
    dessert: {};
    dinner: {};
    tasting_menu: {};
  };
}
export interface Services {
  delivery: {};
  takeout: {};
  drive_through: {};
  dine_in: {
    reservations: {};
    online_reservations: {};
    groups_only_reservations: {};
    essential_reservations: {};
  };
}
export interface Amenities {
  restroom: {};
  smoking: {};
  jukebox: {};
  music: {};
  live_music: {};
  private_room: {};
  outdoor_seating: {};
  tvs: {};
  atm: {};
  coat_check: {};
  wheelchair_accessible: {};
  parking: {
    parking: {};
    street_parking: {};
    valet_parking: {};
    public_lot: {};
    private_lot: {};
  };
  sit_down_dining: {};
  wifi: string;
}
export interface Attributes {
  business_meeting: string;
  clean: string;
  crowded: string;
  dates_popular: string;
  dressy: string;
  families_popular: string;
  gluten_free_diet: string;
  good_for_dogs: string;
  groups_popular: string;
  healthy_diet: string;
  late_night: string;
  noisy: string;
  quick_bite: string;
  romantic: string;
  service_quality: string;
  singles_popular: string;
  special_occasion: string;
  trendy: string;
  value_for_money: string;
  vegan_diet: string;
  vegetarian_diet: string;
}
export interface GeoLocation {
  latitude: number;
  longitude: number;
}
export interface GeoCodes {
  drop_off: GeoLocation;
  front_door: GeoLocation;
  main: GeoLocation;
  road: GeoLocation;
  roof: GeoLocation;
}
export interface Hours {
  display: string;
  is_local_holiday: boolean;
  open_now: boolean;
  regular: {
    close: string;
    day: number;
    open: string;
  }[];
}
export interface HoursPopular {
  close: string;
  day: number;
  open: string;
}
export interface Location {
  address: string;
  address_extended: string;
  admin_region: string;
  census_block: string;
  country: string;
  cross_street: string;
  dma: string;
  formatted_address: string;
  locality: string;
  neighborhood: string[];
  po_box: string;
  post_town: string;
  postcode: string;
  region: string;
}
export interface SocalMedia {
  facebook_id: string;
  instagram: string;
  twitter: string;
}
export interface Stats {
  total_photos: number;
  total_ratings: number;
  total_tips: number;
}
export interface Text {
  primary: string;
  secondary: string;
  highlight: {
    start: number;
    length: number;
  }[];
}
export interface Search {
  query: string;
  category: {
    id: number;
    name: string;
    short_name: string;
    plural_name: string;
    icon: Photo;
  };
  chain: {
    id: string;
    name: string;
  };
}
export interface Geo {
  name: string;
  center: GeoLocation;
  bounds: {
    ne: GeoLocation;
    sw: GeoLocation;
  };
  cc: string;
  type: string;
}
export interface Place {
  fsq_id: string;
  categories: Category[];
  chains: Chain[];
  closed_bucket: string;
  date_closed: string;
  description: string;
  distance: number;
  email: string;
  fax: string;
  features: Features;
  geocodes: GeoCodes;
  hours: Hours;
  hours_popular: HoursPopular[];
  link: string;
  location: Location;
  menu: string;
  name: string;
  photos: Photo[];
  popularity: number;
  price: number;
  rating: number;
  related_places: {};
  social_media: SocalMedia;
  stats: Stats;
  store_id: string;
  tastes: string[];
  tel: string;
  timezone: string;
  tips: Tip[];
  venue_reality_bucket: string;
  verified: boolean;
  website: string;
}
export interface AutoCompleteResult {
  results: {
    type: string;
    text: Text;
    icon: Photo;
    link: string;
    place: Place;
    address: {
      address_id: string;
    };
    search: Search;
    geo: Geo;
    debug: {
      score: number;
    };
  }[];
}
export interface AddressDetailsResult {
  fsq_addr_id: string;
  location: Location;
  geocodes: GeoCodes;
  directory: Place[];
}
