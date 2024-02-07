import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginComponent } from 'src/app/components/authentication/login/login.component';
import { SignupComponent } from 'src/app/components/authentication/signup/signup.component';
import { ResetPasswordComponent } from 'src/app/components/authentication/reset-password/reset-password.component';

@Component({
  selector: 'app-access-portal',
  templateUrl: './access-portal.page.html',
  styleUrls: ['./access-portal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, LoginComponent, SignupComponent, ResetPasswordComponent]
})
export class AccessPortalPage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("Access Portal");
  }

}
