import { Injectable } from '@angular/core';
import { Auth, User, UserInfo, updateProfile } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, concatMap, of } from 'rxjs';

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

  get isVerified(): boolean{
    return !!this.currentUser.value?.emailVerified;
  }

  async registerUser(email: string, password: string, username: string): Promise<firebase.default.User | null> {
    try {
      const { user } = await this.fireAuth.createUserWithEmailAndPassword(email, password);
      await this.updateUserProfile({ username });
      await this.sendEmailVerification();
      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      return null;
    }
  }


  async updateUserProfile(data: Profile): Promise<void> {
    try {
      if (this.currentUser.value != null) {
        await this.currentUser.value.updateProfile(data);
      } else {
        throw new Error('No user is currently logged in to update profile');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  async loginUser(email: string, password: string): Promise<boolean> {
    try {
      await this.fireAuth.signInWithEmailAndPassword(email, password);
      this.router.navigateByUrl('/home/dashboard');
      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      await this.fireAuth.sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  async sendEmailVerification(): Promise<void> {
    try {
      await this.currentUser.value?.sendEmailVerification();
    } catch (error) {
      console.error('Error sending email verification:', error);
    }
  }

  async verifyEmail(newEmail: string): Promise<void> {
    try {
      await this.currentUser.value?.verifyBeforeUpdateEmail(newEmail);
      console.log("Verification email sent to the new email address");
    } catch (error) {
      throw error;
    }
  }

  async updateEmail(newEmail: string): Promise<void> {
    try {
      await this.currentUser.value?.updateEmail(newEmail);
    } catch (error) {
      console.error('Error updating email:', error);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      await this.currentUser.value?.updatePassword(newPassword);
    } catch (error) {
      console.error('Error updating password:', error);
    }
  }

  async sendPasswordResetEmail(): Promise<void> {
    try {
      const email = this.currentUser.value?.email;
      if (email) {
        await this.fireAuth.sendPasswordResetEmail(email);
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }

  async signOut(): Promise<boolean> {
    try {
      await this.fireAuth.signOut();
      this.router.navigateByUrl('');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }
}

export interface Profile {
  username?: string | null;
  photoURL?: string | null;
}
