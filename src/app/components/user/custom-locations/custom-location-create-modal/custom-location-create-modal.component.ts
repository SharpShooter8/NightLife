import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CustomLocationService, Location } from 'src/app/services/database/custom-location.service';
import { UserData, UserService } from 'src/app/services/database/user.service';

@Component({
  selector: 'app-custom-location-create-modal',
  templateUrl: './custom-location-create-modal.component.html',
  styleUrls: ['./custom-location-create-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class CustomLocationCreateModalComponent  implements OnInit {

  name: string | undefined;
  description: string | undefined;
  formattedAddress: string | undefined;
  hours: string | undefined;
  price: string | undefined;

  constructor(private modalController: ModalController, private customLocationService: CustomLocationService, private auth: AuthenticationService, private user: UserService) { }

  ngOnInit() {
    let test = 0;
  }

  async createCustomLocation(){
    const uid = this.auth.currentUser.value?.uid;
    if (!uid || !this.name || !this.description || !this.formattedAddress || !this.hours || !this.price) {
      return;
    }

    const user: UserData = await firstValueFrom(this.user.getUserData(uid)) as UserData;
    const username: string = user.username as string;

    const location: Location = {
      createdBy: username,
      description: this.description,
      formattedAddress: this.formattedAddress,
      hours: this.hours,
      lat: 12,
      lng: 12,
      name: this.name,
      pictures: [],
      price: this.price
    }

    this.customLocationService.createLocation(uid, location).subscribe(
      () => {
        this.modalController.dismiss(null, 'created');
      }
    );
  }

}
