import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, concat, defer, forkJoin, from, map, of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  currentUser: BehaviorSubject<firebase.default.User | null> = new BehaviorSubject<firebase.default.User | null>(null);

  constructor(private fireAuth: AngularFireAuth, private router: Router) {
    this.authStatusListener();
  }

  authStatusListener() {
    this.fireAuth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser.next(user);
        console.log('User is logged in');
      } else {
        this.currentUser.next(null);
        console.log('User is logged out');
        this.router.navigateByUrl('');
      }
    });
  }

  // Get if the user logged in
  get isAuthenticated(): boolean {
    return !!this.currentUser.value;
  }

  get isVerified(): boolean {
    return !!this.currentUser.value?.emailVerified;
  }

  registerUser(email: string, password: string, username: string): Observable<firebase.default.User | null> {
    return defer(() => {
      return from(this.fireAuth.createUserWithEmailAndPassword(email, password)).pipe(
        switchMap(data => {
          return concat([
            this.updateUserProfile({ username }),
            this.sendEmailVerification()
          ]).pipe(
            switchMap(() => {
              return of(data.user);
            })
          )
        })
      )
    });
  }

  updateUserProfile(data: Profile): Observable<void> {
    return defer(() => {
      return this.currentUser.asObservable().pipe(
        switchMap(user => {
          if (!user) {
            throw new Error('Invalid User');
          }
          return from(user.updateProfile(data));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update user profile: ' + error
          });
        })
      )
    });
  }

  loginUser(email: string, password: string): Observable<void> {
    return defer(() => {
      return from(this.fireAuth.signInWithEmailAndPassword(email, password)).pipe(
        switchMap(user => {
          if (!user) {
            throw new Error('Invalid User');
          }
          ;
          return of(this.router.navigateByUrl('/home/dashboard')).pipe(map(() => { }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to login: ' + error
          });
        })
      )
    });
  }

  resetPassword(email: string): Observable<void> {
    return defer(() => {
      return from(this.fireAuth.sendPasswordResetEmail(email)).pipe(
        catchError(error => {
          return throwError(() => {
            'Failed to reset password: ' + error
          });
        })
      )
    });
  }

  sendEmailVerification(): Observable<void> {
    return defer(() => {
      return this.currentUser.asObservable().pipe(
        switchMap(user => {
          if (!user) {
            throw new Error('Invalid User');
          }
          return from(user.sendEmailVerification());
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to send email verification: ' + error
          });
        })
      )
    });
  }

  updateEmail(newEmail: string): Observable<void> {
    return defer(() => {
      return this.currentUser.asObservable().pipe(
        switchMap(user => {
          if (!user) {
            throw new Error('Invalid User');
          }
          return from(user.updateEmail(newEmail));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update user email: ' + error
          });
        })
      )
    });
  }

  updatePassword(newPassword: string): Observable<void> {
    return defer(() => {
      return this.currentUser.asObservable().pipe(
        switchMap(user => {
          if (!user) {
            throw new Error('Invalid User');
          }
          return from(user.updatePassword(newPassword));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update user password: ' + error
          });
        })
      )
    });
  }

  sendPasswordResetEmail(): Observable<void> {
    return defer(() => {
      return this.currentUser.asObservable().pipe(
        switchMap(user => {
          if (!user) {
            throw new Error('Invalid User');
          }
          if (!user.email) {
            throw new Error('User has invalid email');
          }
          return from(this.fireAuth.sendPasswordResetEmail(user.email));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to send password reset email: ' + error
          });
        })
      )
    });
  }

  signOut(): Observable<void> {
    return defer(() => {
      return from(this.fireAuth.signOut()).pipe(
        switchMap(() => {
          return of(this.router.navigateByUrl('')).pipe(map(() => { }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to login: ' + error
          });
        })
      )
    });
  }
}

export interface Profile {
  username?: string | null;
  photoURL?: string | null;
}
