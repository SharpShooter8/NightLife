import { Component, OnInit } from '@angular/core';
import { IonCardTitle, IonCard, IonLabel, IonCardHeader, IonButton, IonItem, IonCardContent, IonIcon, IonList } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { FriendshipService } from 'src/app/services/database/friendship.service';
import { UserService } from 'src/app/services/database/user.service';
import { FormsModule } from '@angular/forms';
import { UsernameService } from 'src/app/services/database/username.service';
import { PopoverController } from '@ionic/angular/standalone';
import { FriendOptionsPopoverComponent } from '../friend-options-popover/friend-options-popover.component';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.scss'],
  standalone: true,
  imports: [IonList, IonIcon, IonCardContent, IonItem, IonButton, IonCardHeader, IonLabel, IonCard, IonCardTitle, FormsModule],
})
export class FriendCardComponent implements OnInit {

  readonly Content = Content;
  shownContent: Content = Content.friendsList;

  friends: { uid: string, username: string }[] = [];
  friendRequest: { uid: string, username: string }[] = [];

  searchedUsername: string = '';
  foundUID: string | null = null;

  popover: HTMLIonPopoverElement | null = null;

  constructor(private popoverController: PopoverController, private authService: AuthenticationService, private friendshipService: FriendshipService, private userService: UserService, private usernameService: UsernameService) {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.getFriends();
      }
    })
  }

  ngOnInit() {
    let test = 0;
  }

  async getFriends() {
    this.friends = [];
    const uid = this.authService.currentUser.value?.uid as string;
    this.friendshipService.getFriends(uid).subscribe(
      (friendUIDs) => {
        friendUIDs.forEach(uid => {
          this.usernameService.getUsername(uid).subscribe(
            (username) => {
              this.friends.push({ uid, username })
            }
          );
        });
      }
    )
  }

  async getFriendRequest() {
    this.friendRequest = [];
    const uid = this.authService.currentUser.value?.uid as string;
    this.friendshipService.getFriendRequest(uid).subscribe(
      (friendUIDs) => {
        friendUIDs.forEach(uid => {
          this.usernameService.getUsername(uid).subscribe(
            (username) => {
              this.friendRequest.push({ uid, username })
            }
          );
        });
      }
    )
  }

  async acceptFriendRequest(friendUID: string) {
    const uid = this.authService.currentUser.value?.uid;
    if (!uid || !friendUID) { return; }
    this.friendshipService.acceptFriendRequest(friendUID, uid).subscribe(
      () => {
        this.changeContent(Content.friendsList);
      }
    );
  }

  async searchFriend() {
    this.foundUID = null;
    const exist = this.usernameService.usernameExists(this.searchedUsername).subscribe(
      (exist) => {
        if (exist) {
          this.usernameService.getUID(this.searchedUsername).subscribe(
            (uid) => {
              this.foundUID = uid;
            }
          );
        }
      }
    );
  }

  async addFriend() {
    const uid = this.authService.currentUser.value?.uid;
    if (!uid || !this.foundUID) { return; }
    this.friendshipService.createFriendship(uid, this.foundUID).subscribe();
  }

  async removeFriend(friendUID: string) {
    const uid = this.authService.currentUser.value?.uid;
    if (!uid || !friendUID) { return; }
    this.friendshipService.removeFriendship(uid, friendUID).subscribe();
    this.getFriends();
  }

  async changeContent(content: Content) {
    this.shownContent = content;
    if (this.shownContent === Content.friendsList) {
      this.getFriends();
    } else if (this.shownContent === Content.request) {
      this.getFriendRequest();
    } else if (this.shownContent === Content.searching) {
    }
  }

  async showOptionsPopover($event: any, friendUID: string) {
    this.popover = await this.popoverController.create({
      component: FriendOptionsPopoverComponent,
      componentProps: {
        friendUID: friendUID
      },
      event: $event,
      translucent: true,
      showBackdrop: false,
    });

    await this.popover.present();

    await this.popover.onDidDismiss().then(({ data, role }) => {
      if (role === 'removed') {
        this.getFriends();
      }
    });
  }

}

export enum Content {
  request = 'request',
  searching = 'searching',
  friendsList = 'friendsList'
}
