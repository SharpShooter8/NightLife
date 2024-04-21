import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue } from '@angular/fire/firestore';
import { Observable, catchError, defer, first, from, map, of, switchMap, take, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userRef: AngularFirestoreCollection<UserData>;

  constructor(private db: AngularFirestore) {
    this.userRef = this.db.collection<UserData>('Users');
  }

  createUser(uid: string, username: string): Observable<void> {
    return defer(() => {
      return this.userRef.doc(uid).get().pipe(
        switchMap((snapshot) => {
          if (snapshot.exists) {
            throw new Error(`User Data with uid ${uid} does not exist`)
          }
          const userData: UserData = {
            username,
            settings: {
              accountPrivate: true,
              locationAllowed: true
            },
          };
          return from(snapshot.ref.set(userData));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to create user: ' + error
          });
        })
      );
    });
  }

  removeUser(uid: string): Observable<void> {
    return defer(() => {
      return this.userRef.doc(uid).get().pipe(
        switchMap((snapshot) => {
          if (!snapshot.exists) {
            throw new Error(`User Data with uid ${uid} does not exist`)
          }
          return from(snapshot.ref.delete())
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to remove user: ' + error
          });
        })
      );
    });
  }

  getUserData(uid: string): Observable<UserData> {
    return defer(() => {
      return this.userRef.doc(uid).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`User Data with uid ${uid} does not exist`);
          }
          return of(snapshot.data() as UserData);
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to get user data: ' + error
          });
        })
      );
    });
  }

  getUidGivenUsername(username: string): Observable<string> {
    return defer(() => {
      return from(this.userRef.ref.where('username', '==', username).limit(1).get()).pipe(
        switchMap(snapshot => {
          if (snapshot.empty) {
            throw new Error(`UID associated with username ${username} does not exist`);
          }
          return of(snapshot.docs[0].id);
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to get UID given username: ' + error
          });
        })
      );
    });
  }

  doesUserExist(uid: string): Observable<boolean> {
    return defer(() => {
      return this.userRef.doc(uid).get().pipe(
        switchMap(snapshot => {
          return of(snapshot.exists);
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to check if user exist: ' + error
          });
        })
      );
    });
  }

  updateSettings(uid: string, newSettingsData: Partial<Settings>): Observable<void> {
    return defer(() => {
      return this.userRef.doc(uid).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`User Data with uid ${uid} does not exist`);
          }
          const currentSettings: Settings = snapshot.data()?.settings as Settings;
          const updatedSettings: Settings = { ...currentSettings, ...newSettingsData };
          return from(snapshot.ref.update({ settings: updatedSettings }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update settings: ' + error
          });
        })
      );
    });
  }

  updateMissingUserData(uid: string): Observable<void> {
    return defer(() => {
      return this.userRef.doc(uid).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`User Data with uid ${uid} does not exist`);
          }
          const userData = snapshot.data() as UserData;
          const updatedUserData: UserData = { ...defaultUserValues, ...userData };
          return from(snapshot.ref.set(updatedUserData));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update missing user data: ' + error
          });
        })
      );
    });
  }
}

export interface UserData {
  username: string;
  settings: Settings;
}

export interface Settings {
  accountPrivate: boolean;
  locationAllowed: boolean;
}

const defaultUserValues: UserData = {
  username: 'defaultUsername',
  settings: {
    accountPrivate: true,
    locationAllowed: true,
  }
}
