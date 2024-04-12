import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInput, IonItem, IonButton } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonButton, IonItem, IonInput, FormsModule],
})
export class LoginComponent implements OnInit {

  email:string = "";
  password:string = "";

  constructor(private auth:AuthenticationService, private router: Router) {
  }

  ngOnInit() {
    console.log("Created Login Component");
  }

  async login(): Promise<void> {
    console.log("Login: " + this.email);
    console.log("Login: " + this.password);
    this.auth.loginUser(this.email,this.password).subscribe();
  }

}
