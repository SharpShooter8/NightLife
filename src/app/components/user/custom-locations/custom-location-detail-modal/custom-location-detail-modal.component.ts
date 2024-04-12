import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CustomLocationService, Location } from 'src/app/services/database/custom-location.service';
import { ModalController } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-custom-location-detail-modal',
  templateUrl: './custom-location-detail-modal.component.html',
  styleUrls: ['./custom-location-detail-modal.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class CustomLocationDetailModalComponent  implements OnInit {

  @Input() customLocation: {id: string, data: Location} | null = null;

  constructor(private modalController: ModalController, private customLocationService: CustomLocationService, private auth: AuthenticationService) { }

  ngOnInit() {
    let test = 0;
  }

  async deleteLocation(){
    const uid = this.auth.currentUser.value?.uid as string;
    this.customLocationService.removeLocation(uid, this.customLocation?.id as string).subscribe(
      () => {
        this.modalController.dismiss(null, 'deleted');
      }
    );
  }

}
