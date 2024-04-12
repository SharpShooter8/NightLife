import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from 'src/app/services/database/user.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ProfileSettingsPage implements OnInit {


  id: string | null | undefined = "NA";
  protected profileInfo: FormGroup = new FormGroup({
    bio: new FormControl(),
    allowLocationPermission: new FormControl(),
    username: new FormControl(),
    accountPrivate: new FormControl()
  })
  protected allowLocation: boolean = false;
  protected isAccountPrivate: boolean = true;
  protected profileBio: string = "N/A"
  protected profileUsername: string = "N/A"
  private userService: UserService = inject(UserService)

  user: firebase.default.User | null = null;

  constructor(private modalCtrl: ModalController, private firestore: AngularFirestore, private auth: AuthenticationService) {
    this.user = this.auth.currentUser.getValue();
    this.id = this.user?.uid;

    if (this.id) {
      // this.userService.getUserObject(this.id).subscribe(userData => {
      //   this.allowLocation = userData.profileInfo.locationAllowed;
      //   this.isAccountPrivate = userData.profileInfo.accountPrivate;
      //   this.profileBio = userData.profileInfo.bio;
      //   this.profileUsername = userData.username;
      // });
    }
  }

  ngOnInit() {
    let test = 0;
  }


  allowLocationChange(){}

  makeAccountPrivate(){}

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  submitForm() {
    console.log(this.profileInfo.value.locationAllowed)
    console.log(this.profileInfo.value.accountPrivate)
    this.firestore.collection('Users').doc(this.user?.uid).update({
      username: this.profileInfo.value.username ?? this.profileUsername,
      profileInfo:{
        bio: this.profileInfo.value.bio ?? this.profileBio,
        locationAllowed: this.profileInfo.value.locationAllowed ?? this.allowLocation,
        accountPrivate: this.profileInfo.value.accountPrivate ?? this.isAccountPrivate
      }
    })
    .then(() => {
      console.log('Profile info updated successfully');
      this.dismissModal();
    })
    .catch((error) => {
      console.error('Error updating profile info:', error);
    });

    this.profileInfo = new FormGroup({
      bio: new FormControl()
    })
    this.dismissModal();
  }



}
