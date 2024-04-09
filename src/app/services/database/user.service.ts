import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue, arrayRemove, arrayUnion } from '@angular/fire/firestore';

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
      const userDoc = await this.userRef.doc(uid).ref.get();
      if (userDoc.exists) {
        throw new Error('User with the provided UID already exists');
      }

      const userData = {
        username,
        friends: [],
        settings: { accountPrivate: true, locationAllowed: true },
        plans: [],
        customLocations: [],
      }

      await this.userRef.doc(uid).set(userData);
    } catch (error) {
      throw new Error('Failed to create user: ' + error);
    }
  }

  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await this.userRef.doc(uid).ref.get();
      return userDoc.data() || null;
    } catch (error) {
      throw new Error("Failed to get user data: " + error);
    }
  }

  async getUidGivenUsername(username: string): Promise<string | undefined> {
    try {
      const querySnapshot = await this.userRef.ref.where('username', '==', username).get();
      return querySnapshot.docs[0]?.id;
    } catch (error) {
      throw new Error("Problem in getUidGivenUsername: " + error);
    }
  }

  async doesUserDocExist(uid: string): Promise<boolean> {
    try {
      const snapshot = await this.userRef.doc(uid).ref.get();
      return snapshot.exists;
    } catch (error) {
      throw new Error("Problem in doesUserDocExist: " + error);
    }
  }

  async getFriendRequestStatus(uid: string, friendUID: string): Promise<FriendStatus | string | undefined> {
    try {
      const snapshot = await this.userRef.doc(uid).ref.get();
      const friends = snapshot.data()?.friends as Friend[];
      const friendIndex = friends.findIndex(friend => friend.uid === friendUID);
      return friends[friendIndex] ? friends[friendIndex].status as FriendStatus | string : undefined;
    } catch (error) {
      throw new Error("Problem in getFriendRequestStatus: " + error);
    }
  }

  async addFriend(uid: string, friendUID: string): Promise<void> {
    try {
      if (uid === friendUID) {
        throw new Error('Cannot add self as friend');
      }

      await this.db.firestore.runTransaction(async (transaction) => {
        const userDocRef = this.userRef.doc(uid).ref;
        const friendDocRef = this.userRef.doc(friendUID).ref;

        const [userDocSnapshot, friendDocSnapshot] = await Promise.all([
          transaction.get(userDocRef),
          transaction.get(friendDocRef)
        ]);

        if (!userDocSnapshot.exists) {
          throw new Error(`User document with UID ${uid} does not exist`);
        }

        if (!friendDocSnapshot.exists) {
          throw new Error(`Friend document with UID ${friendUID} does not exist`);
        }

        const userFriends = userDocSnapshot.data()?.friends as Friend[] || [];
        const friendFriends = friendDocSnapshot.data()?.friends as Friend[] || [];

        const userFriendExists = userFriends.some(friend => friend.uid === friendUID);
        const friendFriendExists = friendFriends.some(friend => friend.uid === uid);

        if (userFriendExists || friendFriendExists) {
          throw new Error(`Friend request already exists between ${uid} and ${friendUID}`);
        }

        const newFriendForUser = {
          uid: friendUID,
          status: FriendStatus.Sent
        };

        const newFriendForFriend = {
          uid,
          status: FriendStatus.Pending
        };

        transaction.update(userDocRef, { friends: arrayUnion(newFriendForUser) });
        transaction.update(friendDocRef, { friends: arrayUnion(newFriendForFriend) });
      });
    } catch (error) {
      throw new Error(`Problem in addFriend: ${error}`);
    }
  }

  async removeFriend(uid: string, friendUID: string): Promise<void> {
    try {
      await this.db.firestore.runTransaction(async (transaction) => {
        const userDocRef = this.userRef.doc(uid).ref;
        const userDocSnapshot = await transaction.get(userDocRef);
        if (!userDocSnapshot.exists) {
          throw new Error(`User document with UID ${uid} does not exist`);
        }

        const friendDocRef = this.userRef.doc(friendUID).ref;
        const friendDocSnapshot = await transaction.get(friendDocRef);
        if (!friendDocSnapshot.exists) {
          throw new Error(`Friend document with UID ${friendUID} does not exist`);
        }

        const userFriends = userDocSnapshot.data()?.friends as Friend[] || [];
        const friendFriends = friendDocSnapshot.data()?.friends as Friend[] || [];

        const userFriendIndex = userFriends.findIndex(friend => friend.uid === friendUID);
        const friendFriendIndex = friendFriends.findIndex(friend => friend.uid === uid);

        if (userFriendIndex === -1 || friendFriendIndex === -1) {
          throw new Error(`No friend request exists between ${uid} and ${friendUID}`);
        }

        transaction.update(userDocRef, { friends: arrayRemove(userFriends[userFriendIndex]) });
        transaction.update(friendDocRef, { friends: arrayRemove(friendFriends[friendFriendIndex]) });
      });
    } catch (error) {
      throw new Error('Problem in removeFriend: ' + error);
    }
  }

  async updateFriendRequestStatus(uid: string, friendUID: string, newStatus: FriendStatus): Promise<void> {
    try {
      if (uid === friendUID) {
        throw new Error('UID and Friend UID cannot be equal');
      }

      await this.db.firestore.runTransaction(async (transaction) => {
        const userDocRef = this.userRef.doc(uid).ref;
        const userDocSnapshot = await transaction.get(userDocRef);
        if (!userDocSnapshot.exists) {
          throw new Error(`User document with UID ${uid} does not exist`);
        }

        const userFriends = userDocSnapshot.data()?.friends as Friend[] || [];

        const friendIndex = userFriends.findIndex(friend => friend.uid === friendUID);
        if (friendIndex === -1) {
          throw new Error(`Friend with UID ${friendUID} not found in the user's friends list`);
        }

        const uidRequestStatus = userFriends[friendIndex].status;
        if (uidRequestStatus === undefined || uidRequestStatus === newStatus) {
          throw new Error('Invalid or duplicate status');
        }

        const updatedFriend = { uid: friendUID, status: newStatus };

        transaction.update(userDocRef, { friends: arrayRemove(userFriends[friendIndex]) });
        transaction.update(userDocRef, { friends: arrayUnion(updatedFriend) });
      });
    } catch (error) {
      throw new Error('Problem in updateFriendRequestStatus: ' + error);
    }
  }

  async acceptFriendRequest(uid: string, friendUID: string): Promise<void> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();
      if (!userDocSnapshot.exists) {
        throw new Error(`User document with UID ${uid} does not exist`);
      }

      const friendDocRef = this.userRef.doc(friendUID).ref;
      const friendDocSnapshot = await friendDocRef.get();
      if (!friendDocSnapshot.exists) {
        throw new Error(`Friend document with UID ${friendUID} does not exist`);
      }

      const uidRequestStatus = await this.getFriendRequestStatus(uid, friendUID);
      const friendUidRequestStatus = await this.getFriendRequestStatus(friendUID, uid);
      if (uidRequestStatus !== FriendStatus.Pending || friendUidRequestStatus !== FriendStatus.Sent) {
        throw new Error('Friend request statuses are not in the correct states for acceptance');
      }

      await this.updateFriendRequestStatus(uid, friendUID, FriendStatus.Accepted);
      await this.updateFriendRequestStatus(friendUID, uid, FriendStatus.Accepted);
    } catch (error) {
      throw new Error('Problem in acceptFriendRequest: ' + error);
    }
  }

  async addOwnedPlan(uid: string, planID: string): Promise<void> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();
      if (!userDocSnapshot.exists) {
        throw new Error(`User document with UID ${uid} does not exist`);
      }

      const userPlans = userDocSnapshot.data()?.plans as Plan[] || [];
      if (userPlans.some(plan => plan.planID === planID)) {
        throw new Error(`Plan with ID ${planID} already exists for user with UID ${uid}`);
      }

      const newPlan: Plan = {
        planID: planID,
        status: PlanStatus.Created
      };

      await userDocRef.update({ plans: arrayUnion(newPlan) });
    } catch (error) {
      throw new Error('Failed to add owned plan: ' + error);
    }
  }

  async inviteUserToPlan(uid: string, invitedUID: string, planID: string): Promise<void> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();
      if (!userDocSnapshot.exists) {
        throw new Error(`User document with UID ${uid} does not exist`);
      }

      const invitedUserDocRef = this.userRef.doc(invitedUID).ref;
      const invitedUserDocSnapshot = await invitedUserDocRef.get();
      if (!invitedUserDocSnapshot.exists) {
        throw new Error(`Invited user document with UID ${invitedUID} does not exist`);
      }

      const userPlans = userDocSnapshot.data()?.plans as Plan[] || [];
      const userHasPlan = userPlans.some(plan => plan.planID === planID);
      if (!userHasPlan) {
        throw new Error(`User does not have a plan with ID ${planID} to invite`);
      }

      const invitedUserPlans = invitedUserDocSnapshot.data()?.plans as Plan[] || [];
      if (invitedUserPlans.some(plan => plan.planID === planID)) {
        throw new Error(`Invited user already has a plan invite with ID ${planID}`);
      }

      const invitedUserNewPlan: Plan = {
        planID: planID,
        status: PlanStatus.Invited
      };

      await invitedUserDocRef.update({ plans: arrayUnion(invitedUserNewPlan) });
    } catch (error) {
      throw new Error('Failed to invite user to plan: ' + error);
    }
  }

  async removePlan(uid: string, planID: string): Promise<void> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();

      if (!userDocSnapshot.exists) {
        throw new Error(`User document with UID ${uid} does not exist`);
      }

      const userPlans = userDocSnapshot.data()?.plans as Plan[] || [];
      const planIndex = userPlans.findIndex(plan => plan.planID === planID);

      if (planIndex === -1) {
        throw new Error(`Plan with ID ${planID} not found for user with UID ${uid}`);
      }

      await userDocRef.update({ plans: arrayRemove(userPlans[planIndex]) });
    } catch (error) {
      throw new Error('Failed to remove plan: ' + error);
    }
  }

  async acceptPlanInvite(uid: string, planID: string): Promise<void> {
    try {
      await this.db.firestore.runTransaction(async (transaction) => {
        const userDocRef = this.userRef.doc(uid).ref;
        const userDocSnapshot = await transaction.get(userDocRef);
        if (!userDocSnapshot.exists) {
          throw new Error(`User document with UID ${uid} does not exist`);
        }

        const userPlans = userDocSnapshot.data()?.plans as Plan[] || [];
        const planIndex = userPlans.findIndex(plan => plan.planID === planID);
        if (planIndex === -1 || userPlans[planIndex].status as PlanStatus !== PlanStatus.Invited) {
          throw new Error(`User does not have a plan invite with ID ${planID}`);
        }

        const newPlan: Plan = {
          planID: userPlans[planIndex].planID,
          status: PlanStatus.Joined
        };

        transaction.update(userDocRef, { plans: arrayRemove(userPlans[planIndex]) });
        transaction.update(userDocRef, { plans: arrayUnion(newPlan) });
      });
    } catch (error) {
      throw new Error('Failed to accept plan invite: ' + error);
    }
  }

  async addCustomLocation(uid: string, locationID: string): Promise<void> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();

      if (!userDocSnapshot.exists) {
        throw new Error(`User document with UID ${uid} does not exist`);
      }

      const userCustomLocations = userDocSnapshot.data()?.customLocations as string[] || [];
      if (userCustomLocations.includes(locationID)) {
        throw new Error(`Custom location with ID ${locationID} already exists for user with UID ${uid}`);
      }

      await userDocRef.update({ customLocations: arrayUnion(locationID) });
    } catch (error) {
      throw new Error('Failed to add custom location: ' + error);
    }
  }

  async removeCustomLocation(uid: string, locationID: string): Promise<void> {
    try {
      const userDocRef = this.userRef.doc(uid).ref;
      const userDocSnapshot = await userDocRef.get();

      if (!userDocSnapshot.exists) {
        throw new Error(`User document with UID ${uid} does not exist`);
      }

      const customLocations = userDocSnapshot.data()?.customLocations as string[] || [];
      const locationIndex = customLocations.indexOf(locationID);
      if (locationIndex === -1) {
        throw new Error(`Custom Location with ID ${locationID} not found in user's custom locations`);
      }

      await userDocRef.update({ customLocations: arrayRemove(customLocations[locationIndex]) });
    } catch (error) {
      throw new Error('Failed to remove custom location: ' + error);
    }
  }
}

export interface UserData {
  username: FieldValue | string;
  friends: FieldValue | Friend[];
  settings: FieldValue | Settings;
  plans: FieldValue | Plan[];
  customLocations: FieldValue | string[];
}

export interface Settings {
  accountPrivate: FieldValue | boolean;
  locationAllowed: FieldValue | boolean;
}

export enum FriendStatus {
  Sent = "sent",
  Pending = "pending",
  Accepted = "accepted"
}

export interface Friend {
  uid: FieldValue | string;
  status: FieldValue | FriendStatus;
}

export interface Plan {
  planID: FieldValue | string;
  status: FieldValue | PlanStatus;
}

export enum PlanStatus {
  Created = "created",
  Invited = "invited",
  Joined = "joined"
}
