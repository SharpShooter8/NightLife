import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth'
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {


  constructor(private ngFireAuth: AngularFireAuth, private router: Router) {
    this.authStatusListener();
  }

  currentUser: any = null;
  private authStatusSub = new BehaviorSubject(this.currentUser);
  currentAuthStatus = this.authStatusSub.asObservable();

  loggedIn:boolean = false;

  authStatusListener() {
    this.ngFireAuth.onAuthStateChanged((user) => {
      if (user) {
        console.log(user);
        this.authStatusSub.next(user);
        this.loggedIn = true;
        console.log('User is logged in');
      } else {
        this.authStatusSub.next(null);
        this.loggedIn = false;
        console.log('User is logged out');
      }
    });
  }

  async getUser(){
    return await this.ngFireAuth.currentUser;
  }

  async registerUser(email: string, password: string): Promise<boolean> {
    return await this.ngFireAuth.createUserWithEmailAndPassword(email, password).then(() => {
      return true;
    }).catch((error) => {
      console.log(error);
      return false;
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

  isLoggedIn(): boolean {
    return this.loggedIn;
  }
}
