import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Friend, UserService } from 'src/app/services/database/user.service';
import { UsernameService } from 'src/app/services/database/username.service';

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

  constructor(private usernameData: UsernameService, private userData: UserService, private auth: AuthenticationService) {
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.getFriends();
      }
    })
  }

  ngOnInit() {
    console.log("Friends Component Generated");
  }

  async addFriend() {
    let uid = this.auth.currentUser.getValue()?.uid;
    let friendUid = await this.usernameData.getUID(this.newFriend) as string;
    if (uid && friendUid) {
      await this.userData.addFriend(uid, friendUid);
    }
    this.getFriends();
  }

  async getFriends() {
    this.friendsList = [];
    const uid = this.auth.currentUser.getValue()?.uid;
    if (uid) {
      const data = await this.userData.getUserData(uid);
      const friends = data?.friends as Friend[];

      for (const friend of friends) {
        let username = await this.usernameData.getUsername(friend.uid);
        this.friendsList.push({ uid: friend.uid, username: username, status: friend.status });
      }
    }
  }

  async removeFriend(friendUID: string) {
    let uid = this.auth.currentUser.getValue()?.uid;
    if (uid) {
      await this.userData.removeFriend(uid, friendUID);
    }
    this.getFriends();
  }

  async acceptFriendRequest(friendUID: string) {
    let uid = this.auth.currentUser.getValue()?.uid;
    if (uid) {
      await this.userData.acceptFriendRequest(uid, friendUID);
    }
    this.getFriends();
  }

}
