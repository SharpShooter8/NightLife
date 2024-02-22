import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FoursquareLookupComponent } from "../../components/foursquare/foursquare-lookup/foursquare-lookup.component";

@Component({
    selector: 'app-browse',
    templateUrl: './browse.page.html',
    styleUrls: ['./browse.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, FoursquareLookupComponent]
})
export class BrowsePage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("Browse Page Created");
  }

}
