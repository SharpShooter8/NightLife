import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore'
import { FieldValue, arrayRemove, arrayUnion } from '@angular/fire/firestore';
import * as firebase from 'firebase/compat';
import { Observable, firstValueFrom, map, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userRef: AngularFirestoreCollection<UserData>;

  constructor(private db: AngularFirestore) {
    this.userRef = this.db.collection('Users');
  }

  createUser(uid: string, username: string): Promise<void> {
    return this.userRef.doc(uid).set({
      username: username,
      friends: [],
    }, { merge: true });
  }

  getUserData(uid: string): Observable<firebase.default.firestore.DocumentSnapshot<UserData>> {
    return this.userRef.doc(uid).get();
  }

  getUidGivenUsername(username: string): Observable<string | undefined> {
    return this.db.collection('Users', ref => ref.where('username', '==', username)).get().pipe(
      map(data => {
        const doc = data.docs[0];
        return doc ? doc.id : undefined;
      })
    );
  }

  doesUserDocExist(uid: string): Observable<boolean> {
    return this.userRef.doc(uid).get().pipe(map(data => { return data.exists }));
  }

  getFriendRequestStatus(uid: string, friendUID: string): Observable<FriendStatus | undefined> {
    return this.userRef.doc(uid).get().pipe(
      map(data => {
        const friends = data.data()?.friends as Friend[];
        const friend = friends.find(friend => friend.uid === friendUID);
        return friend ? friend.status : undefined;
      })
    );
  }

  async addFriend(uid: string, friendUID: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let uidDoc = await firstValueFrom(this.doesUserDocExist(uid));
        let friendUidDoc = await firstValueFrom(this.doesUserDocExist(friendUID));
        let uidRequestStatus = await firstValueFrom(this.getFriendRequestStatus(uid, friendUID));
        let friendUidRequestStatus = await firstValueFrom(this.getFriendRequestStatus(friendUID, uid));

        if (uidDoc && friendUidDoc && (uidRequestStatus == undefined) && (friendUidRequestStatus == undefined)) {
          this.userRef.doc(uid).update({ friends: arrayUnion({ uid: friendUID, status: FriendStatus.Sent }) });
          this.userRef.doc(friendUID).update({ friends: arrayUnion({ uid: uid, status: FriendStatus.Pending }) });
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (e) {
        resolve(false);
      }
    });
  }

  removeFriend(uid: string, friendUID: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let uidDoc = await firstValueFrom(this.doesUserDocExist(uid));
        let friendUidDoc = await firstValueFrom(this.doesUserDocExist(friendUID));
        let uidRequestStatus = await firstValueFrom(this.getFriendRequestStatus(uid, friendUID));
        let friendUidRequestStatus = await firstValueFrom(this.getFriendRequestStatus(friendUID, uid));

        if (uidDoc && friendUidDoc && (uidRequestStatus != undefined) && (friendUidRequestStatus != undefined)) {
          this.userRef.doc(uid).update({ friends: arrayRemove({ uid: friendUID, status: uidRequestStatus }) });
          this.userRef.doc(friendUID).update({ friends: arrayRemove({ uid: uid, status: friendUidRequestStatus }) });
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (e) {
        resolve(false);
      }
    });
  }

  updateFriendRequestStatus(uid: string, friendUID: string, newStatus: FriendStatus): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let uidDoc = await firstValueFrom(this.doesUserDocExist(uid));
        let uidRequestStatus = await firstValueFrom(this.getFriendRequestStatus(uid, friendUID));

        if (uidDoc && (uidRequestStatus != newStatus) && (uidRequestStatus != undefined)) {
          this.userRef.doc(uid).update({ friends: arrayRemove({ uid: friendUID, status: uidRequestStatus }) });
          this.userRef.doc(uid).update({ friends: arrayUnion({ uid: friendUID, status: newStatus }) });
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (e) {
        resolve(false);
      }
    });
  }

  acceptFriendRequest(uid: string, friendUID: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let uidDoc = await firstValueFrom(this.doesUserDocExist(uid));
        let friendUidDoc = await firstValueFrom(this.doesUserDocExist(friendUID));
        let uidRequestStatus = await firstValueFrom(this.getFriendRequestStatus(uid, friendUID));
        let friendUidRequestStatus = await firstValueFrom(this.getFriendRequestStatus(friendUID, uid));

        if (uidDoc && friendUidDoc && (uidRequestStatus == FriendStatus.Sent) && (friendUidRequestStatus == FriendStatus.Pending)) {
          this.updateFriendRequestStatus(uid, friendUID, FriendStatus.Accepted);
          this.updateFriendRequestStatus(friendUID, uid, FriendStatus.Accepted);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (e) {
        resolve(false);
      }
    });
  }

}

export interface UserData {
  username: FieldValue | string;
  friends?: FieldValue | Friend[];
}
export enum FriendStatus {
  Sent = "sent",
  Pending = "pending",
  Accepted = "accepted"
}
export interface Friend {
  uid: string,
  status?: FriendStatus
}
