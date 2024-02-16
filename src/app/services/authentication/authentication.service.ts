import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  readonly loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly currentUser: BehaviorSubject<firebase.default.User | null> = new BehaviorSubject<firebase.default.User | null>(null);

  constructor(private ngFireAuth: AngularFireAuth, private router: Router) {
    this.authStatusListener();
  }

  authStatusListener() {
    this.ngFireAuth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser.next(user);
        this.loggedIn.next(true);
        console.log('User is logged in');
      } else {
        this.currentUser.next(null);
        this.loggedIn.next(false);
        console.log('User is logged out');
      }
    });
  }

  async getUser() {
    return await this.ngFireAuth.currentUser;
  }

  async registerUser(email: string, password: string): Promise<firebase.default.auth.UserCredential | null> {
    return await this.ngFireAuth.createUserWithEmailAndPassword(email, password).then((userCred) => {
      return userCred;
    }).catch((error) => {
      console.log(error);
      return null;
    });
  }

  async loginUser(email: string, password: string): Promise<boolean> {
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password).then(() => {
      this.router.navigateByUrl('/home/map');
      return true;
    }).catch((error) => {
      console.log(error);
      return false;
    });
  }

  async resetPassword(email: string): Promise<boolean> {
    return await this.ngFireAuth.sendPasswordResetEmail(email).then(() => {
      return true;
    }).catch((error) => {
      console.log(error);
      return false;
    });
  }

  async signOut(): Promise<boolean> {
    return await this.ngFireAuth.signOut().then(() => {
      this.router.navigateByUrl('access-portal');
      return true;
    }).catch((error) => {
      console.log(error);
      this.router.navigateByUrl('');
      return false;
    });
  }
}
