import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonInput, IonItem, IonHeader, IonContent, IonImg, IonIcon } from "@ionic/angular/standalone";
import { NavController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [IonHeader, IonItem, IonInput, IonButton, FormsModule, IonContent, IonImg, IonIcon]
})
export class ResetPasswordComponent  implements OnInit {

  email:string = "";

  @Output()
  resetButtonClicked = new EventEmitter<void>();

  constructor(private auth: AuthenticationService, private navCtrl: NavController) { }

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

    this.resetButtonClicked.emit();
  }


}
