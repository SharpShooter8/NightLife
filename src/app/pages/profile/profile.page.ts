import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { UserService } from 'src/app/services/database/user.service'
import { ImageService } from 'src/app/services/storage/image.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { ModalController } from '@ionic/angular';
import { ProfileSettingsPage } from './profile-settings/profile-settings.page';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule ]

})
export class ProfilePage implements OnInit {


  userEmail: string | null | undefined = "NA";
  creationDate: string | undefined = "NA";
  lastSignedIn: string | undefined = "NA";
  id: string | null | undefined = "NA";
  userProfileImage: string | null | undefined;
  userBio: string | null | undefined;
  defaultImage: string = "../../../assets/Default_pfp.svg.png";

  protected userService = inject(UserService);
  protected userObject!: any;

  user: firebase.default.User | null = null;

  constructor(private auth: AuthenticationService, private image: ImageService, private firestore: 
    AngularFirestore, private modalCtrl: ModalController) { }

  async ngOnInit() {
    this.user = this.auth.currentUser.getValue();
    this.userEmail = this.user?.email;
    this.id = this.user?.uid;

    if (this.id != null) {
      this.userProfileImage = await this.image.downloadProfileImage(this.id);
    }
    this.creationDate = this.user?.metadata.creationTime;
    this.lastSignedIn = this.user?.metadata.lastSignInTime;
    
    if (this.id) {
      this.userService.getUserObject(this.id).subscribe(userData => {
        this.userObject = userData;
        this.userBio = userData.profileInfo.bio;
      });
    }

    if(!this.userProfileImage){
      this.userProfileImage = this.defaultImage
    }
  }

  async editForm() {
    const modal = await this.modalCtrl.create({
      component: ProfileSettingsPage
    });
    return await modal.present();
  }

  async signOut() {
    await this.auth.signOut();
    window.location.reload();
  }

  async uploadImage(event: any) {
    if (this.user?.uid) {
      this.image.uploadProfileImage(event.target.files[0], this.user?.uid);
      this.auth.updateUserProfile({ photoURL: 'images/profile/' + this.user.uid });

    }
  }
}
