import { Component, OnInit } from '@angular/core';
import { IonContent, IonList, IonInput, IonItem, IonFab, IonFabButton, IonIcon, IonText, IonTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonTitle, IonText, IonIcon, IonFabButton, IonFab, IonItem, IonInput, IonList, IonContent]
})
export class LoginComponent implements OnInit {
  constructor() {

  }

  ngOnInit() {
    console.log("Created Login Component");
  }

  login(): void {
  }

}
