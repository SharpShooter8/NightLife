import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userRef: AngularFirestoreCollection<UserData>;

  constructor(private db: AngularFirestore) {
    this.userRef = this.db.collection<UserData>('Users');
  }

  async createUser(uid: string, username: string): Promise<void> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();
      if (userDocSnapshot.exists) {
        throw new Error('User with the provided UID already exists');
      }

      const userData: UserData = {
        username,
        settings: {
          accountPrivate: true,
          locationAllowed: true
        },
      }

      await this.userRef.doc(uid).set(userData);
    } catch (error) {
      throw new Error('Failed to create user: ' + error);
    }
  }

  async removeUser(uid: string): Promise<void> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();
      if (!userDocSnapshot.exists) {
        throw new Error(`User document with UID ${uid} does not exist`);
      }

      await userDocRef.delete();
    } catch (error) {
      throw new Error('Problem in removeUser: ' + error);
    }
  }

  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();
      if (!userDocSnapshot.exists) {
        throw new Error(`User document with UID ${uid} does not exist`);
      }

      return userDocSnapshot.data() || null;
    } catch (error) {
      throw new Error("Failed to get user data: " + error);
    }
  }

  async getUidGivenUsername(username: string): Promise<string | undefined> {
    try {
      const queryRef = this.userRef.ref;
      const querySnapshot = await queryRef.where('username', '==', username).get();
      return querySnapshot.docs[0]?.id;
    } catch (error) {
      throw new Error("Problem in getUidGivenUsername: " + error);
    }
  }

  async doesUserExist(uid: string): Promise<boolean> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();
      return userDocSnapshot.exists;
    } catch (error) {
      throw new Error("Problem in doesUserDocExist: " + error);
    }
  }

  async updateSettings(uid: string, newSettingsData: Partial<Settings>): Promise<void> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();
      if (!userDocSnapshot.exists) {
        throw new Error(`User document with UID ${uid} does not exist`);
      }
      const currentSettings = userDocSnapshot.data()?.settings;
      const updatedSettings: Settings = { ...currentSettings, ...newSettingsData } as Settings;
      await this.userRef.doc(uid).update({ settings: updatedSettings });
    } catch (error) {
      throw new Error('Failed to update settings: ' + error);
    }
  }

  async updateMissingUserData(uid: string): Promise<void> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();
      if (!userDocSnapshot.exists) {
        throw new Error(`User document with UID ${uid} does not exist`);
      }

      const userData = userDocSnapshot.data() as UserData;
      const updatedUserData: UserData = { ...defaultUserValues, ...userData };
      await this.userRef.doc(uid).set(updatedUserData);
    } catch (error) {
      throw new Error("Failed to validate user data: " + error);
    }
  }
}

export interface UserData {
  username: FieldValue | string;
  settings: FieldValue | Settings;
}

export interface Settings {
  accountPrivate: FieldValue | boolean;
  locationAllowed: FieldValue | boolean;
}

const defaultUserValues: UserData = {
  username: "defaultUsername",
  settings: {
    accountPrivate: true,
    locationAllowed: true,
  }
}
