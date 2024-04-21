import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { FriendCardComponent } from 'src/app/components/user/friends/friend-card/friend-card.component';

@Component({
  selector: 'app-social',
  templateUrl: './social.page.html',
  styleUrls: ['./social.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, FriendCardComponent]
})
export class SocialPage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("Social Page Created");
  }

}
