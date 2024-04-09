import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { UserService } from 'src/app/services/database/user.service'
import { ImageService } from 'src/app/services/storage/image.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {

  userEmail: string | null | undefined = "NA";
  creationDate: string | undefined = "NA";
  lastSignedIn: string | undefined = "NA";
  id: string | null | undefined = "NA";
  userProfileImage: string | null | undefined;
  userEmailVerified: boolean | undefined;

  protected userService = inject(UserService);
  protected userObject!: any;

  user: firebase.default.User | null = null;

  constructor(private auth: AuthenticationService, private image: ImageService) { }

  async ngOnInit() {
    this.user = this.auth.currentUser.getValue();
    this.userEmail = this.user?.email;
    this.id = this.user?.uid;
    this.userEmailVerified = this.user?.emailVerified;
    if (this.id != null) {
      this.userProfileImage = await this.image.downloadProfileImage(this.id);
    }
    console.log(this.user?.photoURL);
    this.creationDate = this.user?.metadata.creationTime;
    this.lastSignedIn = this.user?.metadata.lastSignInTime;
    console.log("Current User ID: " + this.id);
    console.log("Current User Email: " + this.userEmail)

  }

  async test() {
  }

  async signOut() {
    await this.auth.signOut();
  }

  async uploadImage(event: any) {
    if (this.user?.uid) {
      this.image.uploadProfileImage(event.target.files[0], this.user?.uid);
      this.auth.updateUserProfile({ photoURL: 'images/profile/' + this.user.uid });
    }
  }

}
