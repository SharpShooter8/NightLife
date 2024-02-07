import { Component, OnInit } from '@angular/core';
import { IonContent, IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/angular/standalone';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonIcon, IonLabel, IonTabButton, IonTabBar, IonTabs, IonContent],
})
export class HomePage implements OnInit {
  constructor() { }

  ngOnInit(): void {
    console.log("Home Page");
  }

}
