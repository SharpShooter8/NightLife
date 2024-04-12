import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular'
import { FoursquareService, Place } from 'src/app/services/foursquare/foursquare.service';

@Component({
  selector: 'app-mapbox-card',
  templateUrl: './mapbox-card.component.html',
  styleUrls: ['./mapbox-card.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class MapboxCardComponent implements OnInit {

  readonly Content = Content;
  currentContent: Content = Content.SelectPath;
  places: Place[] = []
  constructor(private foursquareService: FoursquareService) { }

  async discoverPlaces() {
    //this.foursquareService.placeSearch({});
  }

  async getUserPlans(){

  }

  async getUserCustomLocations(){

  }

  ngOnInit() {
    let test = 0;
  }

  changeContent(content: Content) {
    this.currentContent = content;
  }

}

export enum Content {
  SelectPath = 'SelectPath',
  DiscoverSelect = 'DiscoverSelect',
  DiscoverLocation = 'DiscoverLocation',
  PlansSelect = 'PlansSelect',
  PlansData = 'PlansData',
  PlansLocation = 'PlansLocation',
  CustomLocationsSelect = 'CustomLocationsSelect',
  CustomLocationsData = 'CustomLocationsData',
}

export namespace Content {
  export function getPrevious(current: Content): Content {
    switch (current) {
      case Content.DiscoverLocation:
        return Content.DiscoverSelect;
      case Content.PlansData:
        return Content.PlansSelect;
      case Content.PlansLocation:
        return Content.PlansData;
      case Content.CustomLocationsData:
        return Content.CustomLocationsSelect;
      default:
        return Content.SelectPath;
    }
  }
}
