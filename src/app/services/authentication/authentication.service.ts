import { Injectable } from '@angular/core';
import { Auth, User, UserInfo, updateProfile } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, concatMap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  readonly loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly currentUser: BehaviorSubject<firebase.default.User | null> = new BehaviorSubject<firebase.default.User | null>(null);

  constructor(private ngFireAuth: AngularFireAuth, private router: Router, private auth: Auth) {
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

  async registerUser(email: string, password: string, username: string): Promise<firebase.default.User | null> {
    try {
      const data = await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
      const update = await this.updateUserProfile({username: username});
      return data.user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }


  async updateUserProfile(data: Profile): Promise<void> {
    console.log(data)
    return (await this.ngFireAuth.currentUser)?.updateProfile(data);
  }

  async loginUser(email: string, password: string): Promise<boolean> {
    try {
      await this.ngFireAuth.signInWithEmailAndPassword(email, password);
      this.router.navigateByUrl('/home/map');
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      await this.ngFireAuth.sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async signOut(): Promise<boolean> {
    try {
      await this.ngFireAuth.signOut();
      this.router.navigateByUrl('access-portal');
      return true;
    } catch (error) {
      console.log(error);
      this.router.navigateByUrl('');
      return false;
    }
  }
}

export interface Profile {
  username?: string | null;
  photoURL?: string | null;
}
