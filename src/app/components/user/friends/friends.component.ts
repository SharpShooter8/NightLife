import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { FriendshipService } from 'src/app/services/database/friendship.service';
import { UsernameService } from 'src/app/services/database/username.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class FriendsComponent implements OnInit {

  friendsList: string[] = [];
  newFriend: string = "";

  uid: string = "";

  constructor(private usernameData: UsernameService, private friendship: FriendshipService, private auth: AuthenticationService) {
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.getFriends(user.uid);
        this.uid = user.uid;
      }
    })
  }

  ngOnInit() {
    console.log("Friends Component Generated");
  }

  async addFriend() {
    const friendUID = await this.usernameData.getUID(this.newFriend) as string;
    this.friendship.createFriendship(this.uid, friendUID);
  }

  async getFriends(uid: string) {
    const friends = await this.friendship.getFriends(uid);
    console.log(friends);
    friends.forEach(friend => {
      this.friendsList.push(friend);
    });
  }

  async removeFriend(friendUID: string) {

  }

  async acceptFriendRequest(friendUID: string) {

  }

}
