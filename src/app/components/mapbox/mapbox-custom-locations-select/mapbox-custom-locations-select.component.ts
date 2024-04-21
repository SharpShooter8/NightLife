import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CustomLocationData, CustomLocationService } from 'src/app/services/database/custom-location.service';
import { IonItem, IonLabel, IonIcon, IonList, IonItemSliding, IonImg, IonItemOption, IonItemOptions, IonThumbnail } from "@ionic/angular/standalone";

@Component({
  selector: 'app-mapbox-custom-locations-select',
  templateUrl: './mapbox-custom-locations-select.component.html',
  styleUrls: ['./mapbox-custom-locations-select.component.scss'],
  standalone: true,
  imports: [IonThumbnail, IonItemOptions, IonItemOption, IonImg, IonItemSliding, IonList, IonIcon, IonLabel, IonItem, CommonModule],
})
export class MapboxCustomLocationsSelectComponent implements OnInit {

  @Output() locationPressed: EventEmitter<{ id: string, data: CustomLocationData }> = new EventEmitter<{ id: string, data: CustomLocationData }>();
  @Output() editPressed: EventEmitter<{ id: string, data: CustomLocationData }> = new EventEmitter<{ id: string, data: CustomLocationData }>();
  @Output() createPressed: EventEmitter<void> = new EventEmitter<void>();

  customLocations$: Observable<{ id: string, data: CustomLocationData }[]>;

  constructor(private authService: AuthenticationService, private customLocationService: CustomLocationService) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.customLocations$ = this.customLocationService.getUserLocations(uid);
  }

  ngOnInit() {
    let test = 0;
  }

  refreshLocations() {
    const uid = this.authService.currentUser.value?.uid as string;
    this.customLocations$ = this.customLocationService.getUserLocations(uid);
  }

  deleteLocation(location: { id: string, data: CustomLocationData }) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.customLocationService.removeLocation(uid, location.id).subscribe(
      () => {
        this.refreshLocations();
      }
    )
  }
}
