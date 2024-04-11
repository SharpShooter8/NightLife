import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore'
import { FieldValue, arrayRemove, arrayUnion } from '@angular/fire/firestore';
import { Observable, catchError, firstValueFrom, from, map, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userRef: AngularFirestoreCollection<UserData>;

  constructor(private db: AngularFirestore) {
    this.userRef = this.db.collection('Users');
  }

  async createUser(uid: string, username: string): Promise<void> {
    try {
      return await this.userRef.doc(uid).set({
        username: username,
        friends: [],
        profileInfo: {
          accountPrivate: true, 
          locationAllowed: true,
          location: 'N/A',
          bio: 'N/A',
          socials: ['N/A']
        },
      }, { merge: true });
    } catch (error) {
      console.error("Error in createUser:", error); // Log any errors
      throw error; // Rethrow the error for further handling
    }
  }

  getUserData(uid: string): Observable<firebase.default.firestore.DocumentSnapshot<UserData>> {
    return from(this.userRef.doc(uid).get()).pipe(
      catchError(error => {
        console.error("Error in getUserData:", error); // Log any errors
        throw error; // Rethrow the error to be caught by the subscriber
      })
    );
  }

  getUserObject(uid: string): Observable<any>{
    let temp = this.db.doc(`Users/${uid}`).valueChanges();
    return temp;
  }

  getUidGivenUsername(username: string): Observable<string | undefined> {
    // Fetch the document with the provided username from Firestore
    return this.db.collection('Users', ref => ref.where('username', '==', username)).get().pipe(
      map(snapshot => {
        const doc = snapshot.docs[0]; // Get the first document from the snapshot
        return doc ? doc.id : undefined; // Return the document ID if found, otherwise undefined
      }),
      catchError(error => {
        console.error("Error in getUidGivenUsername:", error); // Log any errors
        return of(undefined); // Return an observable with undefined in case of an error
      })
    );
  }

  doesUserDocExist(uid: string): Observable<boolean> {
    return from(this.userRef.doc(uid).get()).pipe(
      map(snapshot => snapshot.exists),
      catchError(error => {
        console.error("Error in doesUserDocExist:", error); // Log any errors
        return of(false); // Return false in case of an error
      })
    );
  }

  getFriendRequestStatus(uid: string, friendUID: string): Observable<FriendStatus | undefined> {
    // Fetch the user document from Firestore
    return this.userRef.doc(uid).get().pipe(
      map(data => {
        const friends = data.data()?.friends as Friend[]; // Extract the friends array from the user data
        const friend = friends.find(friend => friend.uid === friendUID); // Find the friend with the given UID
        return friend ? friend.status : undefined; // Return the status of the friend if found, otherwise undefined
      }),
      catchError(error => {
        console.error("Error in getFriendRequestStatus:", error); // Log any errors
        return of(undefined); // Return an observable with undefined in case of an error
      })
    );
  }

  async addFriend(uid: string, friendUID: string): Promise<boolean> {
    try {
      // Check if both user documents exist
      const [uidDocExist, friendUidDocExist] = await Promise.all([
        firstValueFrom(this.doesUserDocExist(uid)),
        firstValueFrom(this.doesUserDocExist(friendUID))
      ]);

      // Get friend request status for both users
      const [uidRequestStatus, friendUidRequestStatus] = await Promise.all([
        firstValueFrom(this.getFriendRequestStatus(uid, friendUID)),
        firstValueFrom(this.getFriendRequestStatus(friendUID, uid))
      ]);

      // Check if user documents exist and there are no pending friend requests
      if (uidDocExist && friendUidDocExist && !uidRequestStatus && !friendUidRequestStatus) {
        // Update both users' friend lists with the appropriate statuses
        await Promise.all([
          this.userRef.doc(uid).update({ friends: arrayUnion({ uid: friendUID, status: FriendStatus.Sent }) }),
          this.userRef.doc(friendUID).update({ friends: arrayUnion({ uid: uid, status: FriendStatus.Pending }) })
        ]);
        return true; // Operation successful
      } else {
        return false; // Operation failed
      }
    } catch (error) {
      console.error("Error in addFriend:", error); // Log any unexpected errors
      return false; // Operation failed
    }
  }

  async removeFriend(uid: string, friendUID: string): Promise<boolean> {
    try {
      // Check if both user documents exist
      const [uidDocExist, friendUidDocExist] = await Promise.all([
        firstValueFrom(this.doesUserDocExist(uid)),
        firstValueFrom(this.doesUserDocExist(friendUID))
      ]);

      // Get friend request status for both users
      const [uidRequestStatus, friendUidRequestStatus] = await Promise.all([
        firstValueFrom(this.getFriendRequestStatus(uid, friendUID)),
        firstValueFrom(this.getFriendRequestStatus(friendUID, uid))
      ]);

      // Check if user documents exist and there are pending friend requests
      if (uidDocExist && friendUidDocExist && uidRequestStatus !== undefined && friendUidRequestStatus !== undefined) {
        // Remove both users from each other's friend lists
        await Promise.all([
          this.userRef.doc(uid).update({ friends: arrayRemove({ uid: friendUID, status: uidRequestStatus }) }),
          this.userRef.doc(friendUID).update({ friends: arrayRemove({ uid: uid, status: friendUidRequestStatus }) })
        ]);
        return true; // Operation successful
      } else {
        return false; // Operation failed
      }
    } catch (error) {
      console.error("Error in removeFriend:", error); // Log any unexpected errors
      return false; // Operation failed
    }
  }

  async updateFriendRequestStatus(uid: string, friendUID: string, newStatus: FriendStatus): Promise<boolean> {
    try {
      // Check if user document exists and get the current friend request status
      const [uidDocExist, uidRequestStatus] = await Promise.all([
        firstValueFrom(this.doesUserDocExist(uid)),
        firstValueFrom(this.getFriendRequestStatus(uid, friendUID)),
      ]);

      // Check if user document exists and current status is defined and different from new status
      if (uidDocExist && uidRequestStatus !== undefined && uidRequestStatus !== newStatus) {
        // Update the friend request status in the user's friend list
        await Promise.all([
          this.userRef.doc(uid).update({ friends: arrayRemove({ uid: friendUID, status: uidRequestStatus }) }),
          this.userRef.doc(uid).update({ friends: arrayUnion({ uid: friendUID, status: newStatus }) })
        ]);
        return true; // Operation successful
      } else {
        return false; // Operation failed
      }
    } catch (error) {
      console.error("Error in updateFriendRequestStatus:", error); // Log any unexpected errors
      return false; // Operation failed
    }
  }

  async acceptFriendRequest(uid: string, friendUID: string): Promise<boolean> {
    try {
      // Check if both user documents exist
      const [uidDocExist, friendUidDocExist] = await Promise.all([
        firstValueFrom(this.doesUserDocExist(uid)),
        firstValueFrom(this.doesUserDocExist(friendUID))
      ]);

      // Get friend request status for both users
      const [uidRequestStatus, friendUidRequestStatus] = await Promise.all([
        firstValueFrom(this.getFriendRequestStatus(uid, friendUID)),
        firstValueFrom(this.getFriendRequestStatus(friendUID, uid))
      ]);

      // Check if user documents exist and friend requests are in the correct states
      if (uidDocExist && friendUidDocExist && uidRequestStatus === FriendStatus.Sent && friendUidRequestStatus === FriendStatus.Pending) {
        // Update friend request statuses for both users to "Accepted"
        await Promise.all([
          this.updateFriendRequestStatus(uid, friendUID, FriendStatus.Accepted),
          this.updateFriendRequestStatus(friendUID, uid, FriendStatus.Accepted)
        ]);
        return true; // Operation successful
      } else {
        return false; // Operation failed
      }
    } catch (error) {
      console.error("Error in acceptFriendRequest:", error); // Log any unexpected errors
      return false; // Operation failed
    }
  }

}

export interface UserData {
  username: FieldValue | string;
  friends?: FieldValue | Friend[];
  profileInfo: FieldValue | ProfileInfo;
}

export interface ProfileInfo{
  accountPrivate: boolean,
  locationAllowed: boolean,
  location: string,
  bio: string,
  socials: string[]
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
