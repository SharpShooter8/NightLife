import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { UserService } from 'src/app/services/database/user.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class FriendsComponent implements OnInit {

  friendsList: any = [];

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

  async getFriends() {
    let uid = this.auth.currentUser.getValue()?.uid;
    if (uid) {
      this.userData.getUserData(uid).subscribe(data => {
        console.log(data.data());
        this.friendsList = data.data()?.friends;
      })
    }
  }

}
