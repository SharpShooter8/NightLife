import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlanCardComponent } from 'src/app/components/user/plans/plan-card/plan-card.component';
import { FriendCardComponent } from 'src/app/components/user/friends/friend-card/friend-card.component';
import { CustomLocationCardComponent } from 'src/app/components/user/custom-locations/custom-location-card/custom-location-card.component';

@Component({
  selector: 'app-social',
  templateUrl: './social.page.html',
  styleUrls: ['./social.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FriendCardComponent, PlanCardComponent, CustomLocationCardComponent]
})
export class SocialPage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("Social Page Created");
  }

}
