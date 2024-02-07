import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList } from '@ionic/angular/standalone';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonList, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage implements OnInit{
  constructor() {}

  ngOnInit(): void {
      console.log("Home Page");
  }

}
