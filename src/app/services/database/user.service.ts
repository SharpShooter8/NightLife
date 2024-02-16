import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore'
import { FieldValue, arrayRemove, arrayUnion } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userRef: AngularFirestoreCollection<User>;

  constructor(private db: AngularFirestore, private auth: AuthenticationService) {
    this.userRef = this.db.collection('Users');
  }

  createUser(uid: string): Promise<void> {
    return this.userRef.doc(uid).set({
      friends: [],
    }, { merge: true });
  }

  getUserData(uid: string): Observable<firebase.default.firestore.DocumentSnapshot<User>> {
    return this.userRef.doc(uid).get();
  }

  addFriend(uid: string, friend_uid: string): Promise<void> {
    return this.userRef.doc(uid).update({
      friends: arrayUnion(friend_uid),
    });
  }

  removeFriend(uid: string, friend_uid: string): Promise<void> {
    return this.userRef.doc(uid).update({
      friends: arrayRemove(friend_uid),
    })
  }
}

export class User {
  friends?: FieldValue | string[];
}
