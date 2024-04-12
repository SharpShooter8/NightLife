import { Component, OnInit } from '@angular/core';
import { IonContent, IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonIcon, IonLabel, IonTabButton, IonTabBar, IonTabs, IonContent],
})
export class HomePage implements OnInit {
  constructor(private toastController: ToastController) { }

  ngOnInit(): void {
    console.log("Home Page");
    //this.presentToast('top');
  }

  // async presentToast(position: 'top' | 'middle' | 'bottom') {
  //   const toast = await this.toastController.create({
  //     message: 'Hello World!',
  //     duration: 15000,
  //     position: position,
  //   });

  //   await toast.present();
  // }

}
