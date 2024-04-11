import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UsernameService {

  private usernameRef: AngularFirestoreCollection<UsernameData>;

  constructor(private db: AngularFirestore) {
    this.usernameRef = this.db.collection<UsernameData>('Usernames');
  }

  async createUsername(uid: string, username: string): Promise<void> {
    try {
      const usernameExists = await this.usernameExists(username);
      if (usernameExists) {
        throw new Error('Username already exists');
      }
      await this.usernameRef.doc(username).set({ uid });
    } catch (error) {
      throw new Error('Failed to create username: ' + error);
    }
  }

  async removeUsername(username: string): Promise<void> {
    try {
      const exists = await this.usernameExists(username);
      if (!exists) {
        throw new Error('Username does not exist');
      }
      await this.usernameRef.doc(username).delete();
    } catch (error) {
      throw new Error('Failed to remove username: ' + error);
    }
  }

  async updateUsername(username: string, newUsername: string): Promise<void> {
    try {
      await this.db.firestore.runTransaction(async (transaction) => {
        const usernameDocRef = this.usernameRef.doc(username).ref;
        const usernameDocSnapshot = await transaction.get(usernameDocRef);
        if (!usernameDocSnapshot.exists) {
          throw new Error('Username not found');
        }

        const uid = usernameDocSnapshot.data()?.uid;

        transaction.delete(usernameDocRef);
        transaction.set(this.usernameRef.doc(newUsername).ref, { uid });
      });
    } catch (error) {
      throw new Error('Failed to update username: ' + error);
    }
  }

  async usernameExists(username: string): Promise<boolean> {
    try {
      return (await this.usernameRef.doc(username).ref.get()).exists;
    } catch (error) {
      throw new Error('Failed to check username existence: ' + error);
    }
  }

  async getUID(username: string): Promise<string> {
    try {
      const usernameDocRef = this.usernameRef.doc(username).ref;
      const usernameDocSnapshot = await usernameDocRef.get();
      if (!usernameDocSnapshot.exists) {
        throw new Error('Username does not exist');
      }
      return usernameDocSnapshot.data()?.uid as string;
    } catch (error) {
      throw new Error('Failed to get UID from username: ' + error);
    }
  }

  async getUsername(uid: string): Promise<string | null> {
    try {
      const usernameQuery = await this.usernameRef.ref.where('uid', '==', uid).limit(1).get();
      return usernameQuery.docs[0]?.id || null;
    } catch (error) {
      throw new Error('Failed to get username from UID: ' + error);
    }
  }

  async updateMissingUsernameData(username: string): Promise<void>{
    try {
      const usernameDocRef = this.usernameRef.doc(username).ref;
      const usernameDocSnapshot = await usernameDocRef.get();
      if (!usernameDocSnapshot.exists) {
        throw new Error(`Username document with UID ${username} does not exist`);
      }

      const usernameData = usernameDocSnapshot.data() as UsernameData;
      const updatedUsernameData: UsernameData = { ...defaultUsernameData, ...usernameData };

      await this.usernameRef.doc(username).set(updatedUsernameData);
    } catch (error) {
      throw new Error("Failed to validate username data: " + error);
    }
  }
}

export interface UsernameData {
  uid: FieldValue | string;
}

const defaultUsernameData: UsernameData = {
  uid: "default uid"
}
