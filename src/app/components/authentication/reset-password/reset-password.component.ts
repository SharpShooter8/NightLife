import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonInput, IonItem } from "@ionic/angular/standalone";
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [IonItem, IonInput, IonButton, FormsModule]
})
export class ResetPasswordComponent  implements OnInit {

  email:string = "";

  constructor(private auth: AuthenticationService) { }

  ngOnInit() {
    console.log("Reset Password Component Created");
  }

  passwordReset():void {
    console.log(this.email);
    this.auth.resetPassword(this.email).then((p)=>{
      console.log(p);
    }).catch((e)=> {
      console.log(e);
    })
  }


}
