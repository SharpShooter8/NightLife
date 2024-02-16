import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonInput, IonItem } from "@ionic/angular/standalone";
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { UserService } from 'src/app/services/database/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports:[IonButton, IonItem, IonInput, FormsModule]
})
export class SignupComponent  implements OnInit {

  email:string = "";
  password:string = "";

  constructor(private userData:UserService, private auth: AuthenticationService) { }

  ngOnInit() {
    console.log("Sign Up Component Created");
  }

  signup():void {
    console.log(this.email);
    console.log(this.password);
    this.auth.registerUser(this.email, this.password).then((data)=>{
      if(data?.user){
        this.userData.createUser(data.user.uid);
      }
      console.log(data);
    }).catch((e) => {
      console.log(e);
    })
  }

}
