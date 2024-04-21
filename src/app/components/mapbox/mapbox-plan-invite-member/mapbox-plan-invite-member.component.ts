import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular'
import { CommonModule } from '@angular/common';
import { PlanData, PlanService, Role } from 'src/app/services/database/plan.service';
import { FriendshipService } from 'src/app/services/database/friendship.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Observable } from 'rxjs';
import { UidToUsernamePipe } from 'src/app/pipes/uid-to-username.pipe';
import { UsernameService } from 'src/app/services/database/username.service';
import { UserService } from 'src/app/services/database/user.service';
import { HideOnClickDirective } from 'src/app/directives/hide-on-click.directive';

@Component({
  selector: 'app-mapbox-plan-invite-member',
  templateUrl: './mapbox-plan-invite-member.component.html',
  styleUrls: ['./mapbox-plan-invite-member.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, UidToUsernamePipe, HideOnClickDirective]
})
export class MapboxPlanInviteMemberComponent implements OnInit {

  @Input() plan!: { id: string, data: PlanData };
  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();
  searching: boolean = false;
  friends$: Observable<string[]>;
  foundUser: string | undefined;
  foundUserUID: string | undefined;

  constructor(private planService: PlanService, private friendshipService: FriendshipService, private authService: AuthenticationService, private usernameService: UsernameService, private userService: UserService) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.friends$ = this.friendshipService.getFriends(uid);
  }

  ngOnInit() {
    let test = 0;
  }

  isInPlan(friendUID: string): boolean {
    return this.plan.data.members.some(member => member.uid === friendUID);
  }

  findUser($event: any) {
    this.foundUser = undefined;
    if (!$event || $event === "") {
      this.searching = false;
      return;
    }

    this.searching = true;
    this.usernameService.usernameExists($event as string).subscribe(
      (exist) => {
        if (exist) {
          this.usernameService.getUID($event as string).subscribe(
            (uid) => {
              this.foundUserUID = uid;
              this.foundUser = $event;
            }
          )
        }
      }
    );
  }

  inviteUserToPlan(userUID: string) {
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.addMember(uid, this.plan.id, userUID).subscribe(
      () => {
        this.plan.data.members.push({ uid: userUID, role: Role.Invited });
      }
    );
  }
}
