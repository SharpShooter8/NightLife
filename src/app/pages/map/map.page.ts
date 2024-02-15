import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MapboxComponent } from 'src/app/components/mapbox/mapbox.component';
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, MapboxComponent]
})
export class MapPage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("Map Page");
  }

}

