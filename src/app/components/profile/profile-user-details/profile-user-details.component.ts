import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular'
import { Observable, map } from 'rxjs';
import { UidToUsernamePipe } from 'src/app/pipes/uid-to-username.pipe';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CustomLocationService } from 'src/app/services/database/custom-location.service';
import { FriendshipService } from 'src/app/services/database/friendship.service';
import { PlanService } from 'src/app/services/database/plan.service';

@Component({
  selector: 'app-profile-user-details',
  templateUrl: './profile-user-details.component.html',
  styleUrls: ['./profile-user-details.component.scss'],
  standalone: true,
  imports: [IonicModule, UidToUsernamePipe, CommonModule]
})
export class ProfileUserDetailsComponent implements OnInit {

  @Output() settingsPressed: EventEmitter<void> = new EventEmitter<void>();
  @Output() personalPressed: EventEmitter<void> = new EventEmitter<void>();

  uid: string;
  planCount$: Observable<number>;
  friendCount$: Observable<number>;
  customLocationCount$: Observable<number>;

  constructor(private authService: AuthenticationService, private friendshipService: FriendshipService, private planService: PlanService, private customLocationService: CustomLocationService) {
    this.uid = this.authService.currentUser.value?.uid as string;
    this.planCount$ = this.planService.getUserPlans(this.uid).pipe(map((plans) => { return plans.length; }));
    this.friendCount$ = this.friendshipService.getFriends(this.uid).pipe(map((friends) => { return friends.length; }));
    this.customLocationCount$ = this.customLocationService.getUserLocations(this.uid).pipe(map((locations) => { return locations.length; }))
  }

  ngOnInit() {
    let test = 0;
  }

}
