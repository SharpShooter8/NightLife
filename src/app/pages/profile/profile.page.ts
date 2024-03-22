import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { UserService } from 'src/app/services/database/user.service'
import firebase from 'firebase/compat';
import { ImageUploadService } from 'src/app/services/database/image-upload.service';
import { HotToastService } from '@ngneat/hot-toast';
import { getStorage } from '@angular/fire/storage';
import { concatMap } from 'rxjs';
import { Storage } from '@angular/fire/storage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  providers: [ImageUploadService, {
    provide: Storage,
    useFactory: () => {
      const storage = getStorage();
      return new Storage(storage);
    }
  }
]
})
export class ProfilePage implements OnInit {


  // userEmail: string | null | undefined = "NA";
  creationDate: string | undefined = "NA";
  lastSignedIn: string | undefined = "NA";
  id: string | null | undefined = "NA";


  user$ = this.auth.currentUser

  protected userService = inject(UserService);
  protected userObject!: any;

  constructor(private auth: AuthenticationService, private imageUploadService: ImageUploadService, private toast: HotToastService) { }
  

  ngOnInit() {
    let user = this.auth.currentUser.getValue();
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

  uploadImage(event: any, user: firebase.User) {
    this.imageUploadService.uploadImage(event.target.files[0], `images/profile/${user.uid}`).pipe(
       this.toast.observe({
        loading: 'Uploading profile image...',
        success: 'Image uploaded successfully',
        error: 'There was an error in uploading the image',
       }),
       concatMap((photoURL) => this.auth.updateProfile({photoURL}))
    ).subscribe();
    console.log(this.user$)
  }

  async signOut() {
    await this.auth.signOut();
    window.location.reload();
  }

}
