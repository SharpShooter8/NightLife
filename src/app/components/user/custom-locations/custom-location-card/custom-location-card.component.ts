import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CustomLocationData, CustomLocationService, Location } from 'src/app/services/database/custom-location.service';
import { ModalController } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CustomLocationCreateModalComponent } from '../custom-location-create-modal/custom-location-create-modal.component';
import { CustomLocationDetailModalComponent } from '../custom-location-detail-modal/custom-location-detail-modal.component';

@Component({
  selector: 'app-custom-location-card',
  templateUrl: './custom-location-card.component.html',
  styleUrls: ['./custom-location-card.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class CustomLocationCardComponent implements OnInit {

  locations: { id: string, data: Location }[] = [];

  modal: HTMLIonModalElement | null = null;

  constructor(private modalCtrl: ModalController, private authService: AuthenticationService, private customLocationService: CustomLocationService) {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.getCustomLocations();
      }
    })
  }

  ngOnInit() {
    let test = 0;
  }

  async getCustomLocations() {
    this.locations = [];
    const uid = this.authService.currentUser.value?.uid as string;
    this.customLocationService.getUserLocations(uid).subscribe(
      (locationIDs) => {
        locationIDs.forEach(id => {
          this.customLocationService.getLocationData(id).subscribe(
            (data) => {
              this.locations.push({ id, data })
            }
          );
        });
      }
    )
  }

  async openCreateLocationModal() {
    this.modal = await this.modalCtrl.create({
      component: CustomLocationCreateModalComponent,
      initialBreakpoint: .5,
      breakpoints: [0, .5],
    });

    await this.modal.present();

    await this.modal.onWillDismiss().then(({ data, role }) => {
      if (role === 'created') {
        this.getCustomLocations();
      }
    });
  }

  async openLocationDetailModal(location: { id: string, data: Location }) {
    this.modal = await this.modalCtrl.create({
      component: CustomLocationDetailModalComponent,
      componentProps: {
        customLocation: location,
      },
      initialBreakpoint: .5,
      breakpoints: [0, .5],
    });

    await this.modal.present();

    await this.modal.onWillDismiss().then(({ data, role }) => {
      if (role === 'deleted') {
        this.getCustomLocations();
      }
    });
  }

}
