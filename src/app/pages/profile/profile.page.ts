import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { ProfileUserDetailsComponent } from 'src/app/components/profile/profile-user-details/profile-user-details.component';
import { ProfileUserSettingsComponent } from 'src/app/components/profile/profile-user-settings/profile-user-settings.component';
import { ProfileUserPersonalDataComponent } from 'src/app/components/profile/profile-user-personal-data/profile-user-personal-data.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, ProfileUserDetailsComponent, ProfileUserSettingsComponent, ProfileUserPersonalDataComponent]
})
export class ProfilePage implements OnInit {

  readonly Content = Content;
  currentContent = Content.Details;

  constructor(private auth: AuthenticationService) { }

  ngOnInit() {
    let test = 0;
  }

}

enum Content {
  Details = "details",
  Settings = "settings",
  Personal = "personal"
}
