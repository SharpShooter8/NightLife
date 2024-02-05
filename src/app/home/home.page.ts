import { Component } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
  constructor(private firestore: Firestore) {
    const collectionInst = collection(this.firestore, 'users');
    addDoc(collectionInst, { email: "test", name: "person", password: "*******" }).then(() => {
      console.log("Successfull Data Save");
    }).catch((err) => {
      console.log(err);
    });
  }


}
