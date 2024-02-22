import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { UserService } from 'src/app/services/database/user.service'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {

  userEmail: string | null | undefined = "NA";
  creationDate: string | undefined = "NA";
  lastSignedIn: string | undefined = "NA";
  id: string | null | undefined = "NA";

  protected userService = inject(UserService);
  protected userObject!: any;

  constructor(private auth: AuthenticationService) { }

  ngOnInit() {
    let user = this.auth.currentUser.getValue();
    this.userEmail = user?.email;
    this.id = user?.uid;
    this.creationDate = user?.metadata.creationTime;
    this.lastSignedIn = user?.metadata.lastSignInTime;
    if(this.id){
      this.userService.getUserObject(this.id).subscribe(userData =>{
        this.userObject = userData;
      });
    }
    
  }

  async test() {
  }

  async signOut() {
    await this.auth.signOut();
  }

}
