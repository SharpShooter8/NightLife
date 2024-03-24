import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FoursquareResultComponent } from '../foursquare-result/foursquare-result.component';
import { FoursquareService, Place } from 'src/app/services/foursquare/foursquare.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-foursquare-lookup',
  templateUrl: './foursquare-lookup.component.html',
  styleUrls: ['./foursquare-lookup.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FoursquareResultComponent],
})
export class FoursquareLookupComponent implements OnInit {

  poi: Place[] | undefined;

  test: string[] = ["testing", "testing2", "testing3", "testing4"];

  constructor(private foursquare: FoursquareService) { }

  ngOnInit() {
    console.log("Foursquare Lookup Component Created");
  }

  async handleInput(event: any) {
    const query = event.target.value.toLowerCase();
    await firstValueFrom(this.foursquare.placeSearch({ query: query , ll: '30.26618380749575,-97.73357972175239', sort:'DISTANCE', limit:10, fields:"distance,hours,rating,location,photos,name" })).then((data) => {
      this.poi = data.results;
    }
    );
  }

}
