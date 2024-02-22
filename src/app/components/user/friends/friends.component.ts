import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { UserService } from 'src/app/services/database/user.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class FriendsComponent implements OnInit {

  friendsList: any = [];
  newFriend: string = "";

  constructor(private userData: UserService, private auth: AuthenticationService) {
    this.auth.loggedIn.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.getFriends();
      }
    })
  }

  ngOnInit() {
    console.log("Friends Component Generated");
  }

  async addFriend(){
    let uid = this.auth.currentUser.getValue()?.uid;
    let friendUid = await firstValueFrom(this.userData.getUidGivenUsername(this.newFriend));
    if (uid && friendUid) {
      await this.userData.addFriend(uid, friendUid);
    }
    this.getFriends();
  }

  async getFriends() {
    this.friendsList = [];
    const uid = this.auth.currentUser.getValue()?.uid;
    if (uid) {
      this.userData.getUserData(uid).subscribe(async data => {
        const friends = data.data()?.friends;
        if (friends && Array.isArray(friends)) {
          for (const friend of friends) {
            let username = (await firstValueFrom(this.userData.getUserData(friend.uid))).data()?.username;
            this.friendsList.push({uid: friend.uid, username: username, status: friend.status});
          }
        }
      });
    }
  }

  async removeFriend(friendUID: string){
    let uid = this.auth.currentUser.getValue()?.uid;
    if (uid) {
      await this.userData.removeFriend(uid, friendUID);
    }
    this.getFriends();
  }

  async acceptFriendRequest(friendUID: string){
    let uid = this.auth.currentUser.getValue()?.uid;
    if (uid) {
      await this.userData.acceptFriendRequest(uid, friendUID);
    }
    this.getFriends();
  }

}
