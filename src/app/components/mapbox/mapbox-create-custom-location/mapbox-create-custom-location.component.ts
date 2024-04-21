import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular'
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CustomLocationData, CustomLocationService, Location, Price } from 'src/app/services/database/custom-location.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mapbox-create-custom-location',
  templateUrl: './mapbox-create-custom-location.component.html',
  styleUrls: ['./mapbox-create-custom-location.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class MapboxCreateCustomLocationComponent implements OnInit {
  readonly Price = Price;
  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();
  @Output() locationCreated: EventEmitter<{ id: string, data: CustomLocationData }> = new EventEmitter<{ id: string, data: CustomLocationData }>();

  customPrice = false;

  locationData: Location = {
    name: "",
    description: "",
    formattedAddress: "",
    hours: {
      start: new Date().toISOString().split('T')[1].slice(0, 8),
      end: new Date().toISOString().split('T')[1].slice(0, 8)
    },
    lat: -9999,
    lng: -9999,
    photos: [],
    price: Price.Cheap,
    date: new Date().toISOString().split('T')[0]
  }

  dateTimeButtonFormat = {
    date: {
      weekday: 'short',
      month: 'long',
      day: '2-digit',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  constructor(private authService: AuthenticationService, private customLocationService: CustomLocationService) { }

  ngOnInit() {
    let test = 0;
  }

  createCustomLocation() {
    const uid = this.authService.currentUser.value?.uid;
    if (!uid || !this.locationData.name || !this.locationData.description || !this.locationData.formattedAddress || !this.locationData.hours || !this.locationData.price) {
      return;
    }

    this.customLocationService.createLocation(uid, this.locationData).subscribe(
      (data) => {
        this.locationCreated.emit(data);
      }
    );
  }
}
