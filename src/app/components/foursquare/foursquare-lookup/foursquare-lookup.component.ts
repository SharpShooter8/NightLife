import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FoursquareResultComponent } from '../foursquare-result/foursquare-result.component';
import { Place, PlaceSearchResult } from 'src/app/services/foursquare/foursquare.service';
import { FoursquareSearchboxComponent } from '../foursquare-searchbox/foursquare-searchbox.component';

@Component({
  selector: 'app-foursquare-lookup',
  templateUrl: './foursquare-lookup.component.html',
  styleUrls: ['./foursquare-lookup.component.scss'],
  standalone: true,
  imports: [IonicModule, FoursquareResultComponent, FoursquareSearchboxComponent],
})
export class FoursquareLookupComponent  implements OnInit {

  results:PlaceSearchResult | undefined;
  poi: Place[] | undefined;

  constructor() { }

  ngOnInit() {
    console.log("Foursquare Lookup Component Created");
  }

  getSearchData(searchData: any){
    this.results = searchData;
    this.poi = searchData.results;
  }

}
