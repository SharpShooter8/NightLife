import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue } from '@angular/fire/firestore';
import { Observable, catchError, defer, from, of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsernameService {

  private usernameRef: AngularFirestoreCollection<UsernameData>;

  constructor(private db: AngularFirestore) {
    this.usernameRef = this.db.collection<UsernameData>('Usernames');
  }

  createUsername(uid: string, username: string): Observable<void> {
    return defer(() => {
      return this.usernameRef.doc(username).get().pipe(
        switchMap(snapshot => {
          if (snapshot.exists) {
            throw new Error(`Username ${username} already exists`);
          }
          return from(snapshot.ref.set({ uid }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to create username: ' + error
          });
        })
      );
    });
  }

  removeUsername(username: string): Observable<void> {
    return defer(() => {
      return this.usernameRef.doc(username).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Username ${username} does not exists`);
          }
          return from(snapshot.ref.delete());
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to remove username: ' + error
          });
        })
      );
    });
  }

  updateUsername(username: string, newUsername: string): Observable<void> {
    return defer(() => {
      return this.usernameRef.doc(username).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Username ${username} does not exists`);
          }
          const uid = snapshot.data()?.uid as string;
          return from(this.db.firestore.runTransaction(async (transaction) => {
            transaction.delete(snapshot.ref);
            transaction.set(this.usernameRef.doc(newUsername).ref, { uid });
          }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update username: ' + error
          });
        })
      );
    });
  }

  usernameExists(username: string): Observable<boolean> {
    return defer(() => {
      return this.usernameRef.doc(username).get().pipe(
        switchMap(snapshot => {
          return of(snapshot.exists);
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to check username existence: ' + error
          });
        })
      );
    });
  }

  getUID(username: string): Observable<string> {
    return defer(() => {
      return this.usernameRef.doc(username).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Username ${username} does not exists`);
          }
          return of(snapshot.data()?.uid as string);
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to get UID given username: ' + error
          });
        })
      );
    });
  }

  getUsername(uid: string): Observable<string> {
    return defer(() => {
      return from(this.usernameRef.ref.where('uid', '==', uid).limit(1).get()).pipe(
        switchMap(snapshot => {
          if (snapshot.empty) {
            throw new Error(`Username associated with uid ${uid} does not exist`);
          }
          return of(snapshot.docs[0].id);
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to get username from UID: ' + error
          });
        })
      );
    });
  }

  updateMissingUsernameData(username: string): Observable<void> {
    return defer(() => {
      return this.usernameRef.doc(username).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Username document with UID ${username} does not exist`);
          }
          const usernameData = snapshot.data() as UsernameData;
          const updatedUsernameData: UsernameData = { ...defaultUsernameData, ...usernameData };
          return from(snapshot.ref.set(updatedUsernameData));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update missing username data: ' + error
          });
        })
      );
    });
  }
}

export interface UsernameData {
  uid: FieldValue | string;
}

const defaultUsernameData: UsernameData = {
  uid: 'default uid'
}
