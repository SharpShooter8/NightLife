import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue } from '@angular/fire/firestore';
import { Observable, catchError, defer, forkJoin, from, map, of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {

  private friendshipRef: AngularFirestoreCollection<FriendshipData>;

  constructor(private db: AngularFirestore) {
    this.friendshipRef = this.db.collection<FriendshipData>('Friendships');
  }

  createFriendship(senderUID: string, recieverUID: string): Observable<void> {
    return defer(() => {
      if (senderUID === recieverUID) {
        throw new Error('Cannot create friendship between 2 of the same uid');
      }
      return from(this.friendshipRef.ref
        .where('user1', 'in', [senderUID, recieverUID])
        .where('user2', 'in', [senderUID, recieverUID])
        .get()).pipe(
          switchMap(snapshot => {
            if (!snapshot.empty) {
              throw new Error('Friendship already exists');
            }

            const friendshipData: FriendshipData = {
              user1: senderUID,
              user2: recieverUID,
              status: FriendRequestStatus.Pending
            };
            return from(this.friendshipRef.add(friendshipData)).pipe(map(() => { }));
          }),
          catchError(error => {
            return throwError(() => {
              'Failed to create friendship: ' + error
            });
          })
        );
    });
  }

  removeFriendship(user1: string, user2: string): Observable<void> {
    return defer(() => {
      if (user1 === user2) {
        throw new Error('Cannot remove friendship between 2 of the same uid');
      }
      return from(this.friendshipRef.ref
        .where('user1', 'in', [user1, user2])
        .where('user2', 'in', [user1, user2])
        .get()).pipe(
          switchMap(snapshot => {
            if (snapshot.empty) {
              throw new Error('Friendship does not exists');
            }

            const batch = this.db.firestore.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            return from(batch.commit());
          }),
          catchError(error => {
            return throwError(() => {
              'Failed to remove friend: ' + error
            });
          })
        );
    });
  }


  acceptFriendRequest(senderUID: string, recieverUID: string): Observable<void> {
    return defer(() => {
      if (senderUID === recieverUID) {
        throw new Error('Cannot accept friendship between 2 of the same uid');
      }
      return from(this.friendshipRef.ref
        .where('user1', '==', senderUID)
        .where('user2', '==', recieverUID)
        .where('status', '==', FriendRequestStatus.Pending)
        .limit(1)
        .get()).pipe(
          switchMap(snapshot => {
            if (snapshot.empty) {
              throw new Error('Friend request does not exists');
            }
            const friendshipDoc = snapshot.docs[0];
            return from(friendshipDoc.ref.update({ status: FriendRequestStatus.Accepted }));
          }),
          catchError(error => {
            return throwError(() => {
              'Failed to accept friend request: ' + error
            });
          })
        );
    });
  }

  getFriends(userID: string): Observable<string[]> {
    return defer(() => {
      const friendsquery1 = this.friendshipRef.ref
        .where('user1', '==', userID)
        .where('status', '==', FriendRequestStatus.Accepted);
      const friendsquery2 = this.friendshipRef.ref
        .where('user2', '==', userID)
        .where('status', '==', FriendRequestStatus.Accepted);
      return forkJoin([
        from(friendsquery1.get()).pipe(switchMap(snapshot => of(snapshot.docs))),
        from(friendsquery2.get()).pipe(switchMap(snapshot => of(snapshot.docs)))
      ]).pipe(
        map(([docs1, docs2]) => {
          const friends1 = docs1.map(doc => doc.data().user2 as string);
          const friends2 = docs2.map(doc => doc.data().user1 as string);
          return [...friends1, ...friends2];
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to get friends: ' + error
          });
        })
      );
    });
  }

  getPendingFriends(userID: string): Observable<string[]> {
    return defer(() => {
      return from(this.friendshipRef.ref
        .where('user1', '==', userID)
        .where('status', '==', FriendRequestStatus.Pending)
        .get()).pipe(
          switchMap(snapshot => {
            const pendingUIDs: string[] = [];
            snapshot.docs.forEach(doc => {
              pendingUIDs.push(doc.data().user2 as string);
            });
            return of(pendingUIDs);
          }),
          catchError(error => {
            return throwError(() => {
              'Failed getting pending friends: ' + error
            });
          })
        );
    });
  }

  getFriendRequest(userID: string): Observable<string[]> {
    return defer(() => {
      return from(this.friendshipRef.ref
        .where('user2', '==', userID)
        .where('status', '==', FriendRequestStatus.Pending)
        .get()).pipe(
          switchMap(snapshot => {
            const requestUIDs: string[] = [];
            snapshot.docs.forEach(doc => {
              requestUIDs.push(doc.data().user1 as string);
            });
            return of(requestUIDs);
          }),
          catchError(error => {
            return throwError(() => {
              'Failed getting friend request: ' + error
            });
          })
        );
    });
  }

  updateMissingFriendshipData(user1: string, user2: string): Observable<void> {
    return defer(() => {
      return from(this.friendshipRef.ref
        .where('user1', 'in', [user1, user2])
        .where('user2', 'in', [user1, user2])
        .limit(1)
        .get()).pipe(
          switchMap(snapshot => {
            if (snapshot.empty) {
              throw new Error('Friendship document does not exist');
            }
            const friendshipDoc = snapshot.docs[0];
            const friendshipData = friendshipDoc.data() as FriendshipData;
            const updatedFriendshipData: FriendshipData = { ...defaultFriendshipData, ...friendshipData };
            return from(friendshipDoc.ref.set(updatedFriendshipData));
          }),
          catchError(error => {
            return throwError(() => {
              'Failed updating missing friendship data: ' + error
            });
          })
        );
    });
  }

}

export interface FriendshipData {
  user1: string;
  user2: string;
  status: FriendRequestStatus;
}

export enum FriendRequestStatus {
  Pending = 'pending',
  Accepted = 'accepted'
}

const defaultFriendshipData: FriendshipData = {
  user1: 'default user 1',
  user2: 'default user 2',
  status: FriendRequestStatus.Pending
}
