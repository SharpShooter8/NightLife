import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

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

  constructor(private auth: AuthenticationService) { }

  ngOnInit() {
    console.log("Profile Page");
    this.auth.getUser().then(async (user) => {
      this.userEmail = user?.email;
      this.id = await user?.getIdToken();
      this.creationDate = user?.metadata.creationTime;
      this.lastSignedIn = user?.metadata.lastSignInTime;
    });
  }

  async signOut(){
    this.auth.signOut();
  }

}
