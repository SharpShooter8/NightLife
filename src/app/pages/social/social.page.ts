import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FriendsComponent } from 'src/app/components/user/friends/friends.component';

@Component({
  selector: 'app-social',
  templateUrl: './social.page.html',
  styleUrls: ['./social.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FriendsComponent]
})
export class SocialPage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("Social Page Created");
  }

}
