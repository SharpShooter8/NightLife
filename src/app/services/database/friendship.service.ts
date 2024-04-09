import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {

  private friendshipRef: AngularFirestoreCollection<FriendshipData>;

  constructor(private db: AngularFirestore) {
    this.friendshipRef = this.db.collection<FriendshipData>('Friendships');
  }

  async createFriendship(senderUID: string, recieverUID: string): Promise<void> {
    try {
      if (senderUID === recieverUID) {
        throw new Error('Cannot create friendship between 2 of the same uid');
      }

      const friendshipQuery = await this.friendshipRef.ref
        .where('user1', 'in', [senderUID, recieverUID])
        .where('user2', 'in', [senderUID, recieverUID])
        .get();

      if (!friendshipQuery.empty) {
        throw new Error('Friendship already exists');
      }

      const friendshipData: FriendshipData = {
        user1: senderUID,
        user2: recieverUID,
        status: FriendRequestStatus.Pending
      };

      await this.friendshipRef.add(friendshipData);
    } catch (error) {
      throw new Error('Failed to create friendship: ' + error);
    }
  }

  async removeFriendship(user1: string, user2: string): Promise<void> {
    try {
      const friendshipQuery = await this.friendshipRef.ref
        .where('user1', 'in', [user1, user2])
        .where('user2', 'in', [user1, user2])
        .get();

      if (friendshipQuery.empty) {
        throw new Error('Friendship does not exists');
      }

      const batch = this.db.firestore.batch();
      friendshipQuery.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      throw new Error('Failed to remove friend: ' + error);
    }
  }

  async acceptFriendRequest(senderUID: string, recieverUID: string): Promise<void> {
    try {
      const friendshipQuery = await this.friendshipRef.ref
        .where('user1', '==', senderUID)
        .where('user2', '==', recieverUID)
        .where('status', '==', FriendRequestStatus.Pending)
        .get();

      if (friendshipQuery.empty) {
        throw new Error('Friend request not found');
      }

      const friendshipDoc = friendshipQuery.docs[0];
      await friendshipDoc.ref.update({ status: FriendRequestStatus.Accepted });
    } catch (error) {
      throw new Error('Failed to accept friend request: ' + error);
    }
  }

  async getFriends(userID: string): Promise<string[]> {
    try {
      const friends: string[] = [];

      const friendQuery1 = await this.friendshipRef.ref
        .where('user1', '==', userID)
        .where('status', '==', FriendRequestStatus.Accepted)
        .get();

      friendQuery1.forEach(doc => {
        friends.push(doc.data().user2 as string);
      });

      const friendQuery2 = await this.friendshipRef.ref
        .where('user2', '==', userID)
        .where('status', '==', FriendRequestStatus.Accepted)
        .get();

      friendQuery2.forEach(doc => {
        friends.push(doc.data().user1 as string);
      });

      return friends;
    } catch (error) {
      throw new Error('Problem getting friends: ' + error);
    }
  }

  async getPendingFriends(userID: string): Promise<string[]> {
    try {
      const pendingUIDs: string[] = [];
      const friendQuery = await this.friendshipRef.ref
        .where('user1', '==', userID)
        .where('status', '==', FriendRequestStatus.Pending)
        .get();

      friendQuery.forEach(doc => {
        pendingUIDs.push(doc.data().user2 as string);
      });

      return pendingUIDs;
    } catch (error) {
      throw new Error('Problem getting pending friends: ' + error);
    }
  }

  async getFriendRequest(userID: string): Promise<string[]> {
    try {
      const requestUIDs: string[] = [];
      const friendQuery = await this.friendshipRef.ref
        .where('user2', '==', userID)
        .where('status', '==', FriendRequestStatus.Pending)
        .get();

      friendQuery.forEach(doc => {
        requestUIDs.push(doc.data().user1 as string);
      });

      return requestUIDs;
    } catch (error) {
      throw new Error('Problem getting friend request: ' + error);
    }
  }

  async updateMissingFriendshipData(user1: string, user2: string): Promise<void> {
    try {
      const friendshipQuery = await this.friendshipRef.ref
        .where('user1', 'in', [user1, user2])
        .where('user2', 'in', [user1, user2])
        .get();

      if (friendshipQuery.empty) {
        throw new Error('Friendship document does not exist');
      }

      const friendshipDoc = friendshipQuery.docs[0];
      const friendshipData = friendshipDoc.data() as FriendshipData;
      const updatedFriendshipData: FriendshipData = { ...defaultFriendshipData, ...friendshipData };

      await friendshipDoc.ref.set(updatedFriendshipData);
    } catch (error) {
      throw new Error("Failed to validate friendship data: " + error);
    }
  }

}

export interface FriendshipData {
  user1: FieldValue | string;
  user2: FieldValue | string;
  status: FieldValue | FriendRequestStatus;
}

export enum FriendRequestStatus {
  Pending = "pending",
  Accepted = "accepted"
}

const defaultFriendshipData: FriendshipData = {
  user1: "default user 1",
  user2: "default user 2",
  status: FriendRequestStatus.Pending
}
