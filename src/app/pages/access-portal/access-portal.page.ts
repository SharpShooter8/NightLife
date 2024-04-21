import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { LoginComponent } from 'src/app/components/authentication/login/login.component';
import { SignupComponent } from 'src/app/components/authentication/signup/signup.component';
import { ResetPasswordComponent } from 'src/app/components/authentication/reset-password/reset-password.component';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-portal',
  templateUrl: './access-portal.page.html',
  styleUrls: ['./access-portal.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, LoginComponent, SignupComponent, ResetPasswordComponent]
})
export class AccessPortalPage implements OnInit {

  constructor(private auth: AuthenticationService, private router: Router) { }

  ngOnInit() {
    console.log("Created Access Portal");
  }

}
