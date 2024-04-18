import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController, ToastController } from '@ionic/angular';
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
  protected accountInfo: FormGroup = new FormGroup({
    password: new FormControl(),
    email: new FormControl()
  })
  protected allowLocation: boolean = false;
  protected isAccountPrivate: boolean = true;
  protected profileBio: string = "N/A"
  protected profileUsername: string = "N/A"
  private userService: UserService = inject(UserService)

  user: firebase.default.User | null = null;

  constructor(private modalCtrl: ModalController, private firestore: AngularFirestore, private auth: AuthenticationService, private toastController: ToastController) {
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

  updatePassword() {
    console.log("Changing password to: " + this.accountInfo.value.password)
    if(this.accountInfo.value.password){
      this.auth.updatePassword(this.accountInfo.value.password)
    }
    this.dismissModal();
  }

  // updateEmail() {
  //   console.log("Changing Email to: " + this.accountInfo.value.email)
  //   if(this.accountInfo.value.email){
  //     this.auth.updateEmail(this.accountInfo.value.email)
  //   }
  //   this.dismissModal();
  // }

  // profile-settings.page.ts
async updateEmail() {
  console.log("Changing Email to: " + this.accountInfo.value.email);
  if (this.accountInfo.value.email) {
    try {
      await this.auth.verifyEmail(this.accountInfo.value.email);
      console.log("Verification email sent. Please check your email and click on the verification link.");
      // Show a message to the user indicating that a verification email has been sent
      // You can use a toast, alert, or any other UI component to display the message
      // For example, using Ionic's ToastController:
      const toast = await this.toastController.create({
        message: 'Verification email sent. Please check your email and click on the verification link.',
        duration: 5000,
        position: 'bottom'
      });
      toast.present();
      
      // Optionally, you can navigate the user to a different page or close the modal
      this.dismissModal();
    } catch (error) {
      console.error("Error sending verification email:", error);
      // Handle the error, show an error message, or perform any necessary actions
    }
  }
}

// profile-settings.page.ts
async confirmEmailUpdate() {
  try {
    await this.auth.updateEmail(this.accountInfo.value.email);
    console.log("Email updated successfully");
    // Show a success message to the user
    const toast = await this.toastController.create({
      message: 'Email updated successfully.',
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
    
    // Perform any necessary actions after the email update
    this.dismissModal();
  } catch (error) {
    console.error("Error updating email:", error);
    // Handle the error, show an error message, or perform any necessary actions
  }
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
