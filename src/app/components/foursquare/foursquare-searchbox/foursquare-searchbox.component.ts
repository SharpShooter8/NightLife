import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { FoursquareService, PlaceSearchResult } from 'src/app/services/foursquare/foursquare.service';

@Component({
  selector: 'app-foursquare-searchbox',
  templateUrl: './foursquare-searchbox.component.html',
  styleUrls: ['./foursquare-searchbox.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class FoursquareSearchboxComponent implements OnInit {

  @Output() searchResults = new EventEmitter<PlaceSearchResult>();

  constructor(private foursquare: FoursquareService) { }

  ngOnInit() {
    console.log("FourSquare Search Box Created");
  }

  async postSearchResults(query: string) {
    await firstValueFrom(this.foursquare.placeSearch({ query: query, fields: "name,location,hours,photos" })).then((data) => {
      this.searchResults.emit(data);
    }
    );
  }

  async handleInput(event: any) {
    const query = event.target.value.toLowerCase();
    await this.postSearchResults(query);
  }

}
