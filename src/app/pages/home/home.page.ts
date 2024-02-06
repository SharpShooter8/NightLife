import { Component } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList } from '@ionic/angular/standalone';
import { LoginComponent } from 'src/app/components/authentication/login/login.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonList, IonHeader, IonToolbar, IonTitle, IonContent, LoginComponent],
})
export class HomePage {
  constructor(private firestore: Firestore) {
    // const collectionInst = collection(this.firestore, 'users');
    // addDoc(collectionInst, { email: "test", name: "person", password: "*******" }).then(() => {
    //   console.log("Successfull Data Save");
    // }).catch((err) => {
    //   console.log(err);
    // });
  }


}
