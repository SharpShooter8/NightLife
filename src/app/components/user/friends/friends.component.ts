import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { FriendService } from 'src/app/services/database/friend.service';
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

  constructor(private usernameData: UsernameService, private friend: FriendService, private auth: AuthenticationService) {
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

  }

  async getFriends() {

  }

  async removeFriend(friendUID: string) {

  }

  async acceptFriendRequest(friendUID: string) {

  }

}
