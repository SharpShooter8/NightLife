import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue, serverTimestamp, arrayRemove, arrayUnion } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private planRef: AngularFirestoreCollection<PlanData>;

  constructor(private db: AngularFirestore) {
    this.planRef = this.db.collection('Plans');
  }

  async createPlan(uid: string, name: string, startDate: string | null, endDate: string | null): Promise<string> {
    try {
      const planData: PlanData = {
        name,
        created: serverTimestamp(),
        startDate: startDate || serverTimestamp(),
        endDate: endDate || serverTimestamp(),
        members: [{ uid, role: Role.Owner }],
        userLocations: [],
        placeLocations: []
      };

      const ref = await this.planRef.add(planData);
      if (!ref?.id) {
        throw new Error('Failed to create plan: document reference or ID not found');
      }

      return ref.id;
    } catch (error) {
      throw new Error('Failed to create plan: ' + error);
    }
  }

  async removePlan(uid: string, planID: string): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.Owner))) {
        throw new Error('You do not have permission to remove this plan');
      }

      await this.planRef.doc(planID).delete();
    } catch (error) {
      throw new Error('Failed to remove plan: ' + error);
    }
  }

  async updateName(uid: string, planID: string, name: string): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.CoOwner))) {
        throw new Error('You do not have permission to update the name of this plan');
      }

      if (!name.trim()) {
        throw new Error('Name cannot be empty');
      }

      await this.planRef.doc(planID).update({ name });
    } catch (error) {
      throw new Error('Failed to update name: ' + error);
    }
  }

  async updateStartDate(uid: string, planID: string, startDate: string): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.CoOwner))) {
        throw new Error('You do not have permission to update the start date of this plan');
      }

      await this.planRef.doc(planID).update({ startDate: startDate });
    } catch (error) {
      throw new Error('Failed to update start date: ' + error);
    }
  }

  async updateEndDate(uid: string, planID: string, endDate: string): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.CoOwner))) {
        throw new Error('You do not have permission to update the end date of this plan');
      }

      await this.planRef.doc(planID).update({ endDate: endDate });
    } catch (error) {
      throw new Error('Failed to update end date: ' + error);
    }
  }

  async updateMemberLocation(uid: string, planID: string, lng: number, lat: number): Promise<void> {
    try {
      await this.db.firestore.runTransaction(async (transaction) => {
        if (!(await this.hasPermission(planID, uid, Role.Attendee))) {
          throw new Error('You do not have permission to update the location of this plan');
        }

        const planDocRef = this.planRef.doc(planID).ref;
        const planDocSnapshot = await transaction.get(planDocRef);
        if (!planDocSnapshot.exists) {
          throw new Error(`Plan document with ID ${planID} does not exist`);
        }

        const existingUserLocations = planDocSnapshot.data()?.userLocations as UserLocation[] || [];
        const foundLocationIndex = existingUserLocations.findIndex(location => location.uid === uid);

        if (foundLocationIndex !== -1) {
          transaction.update(planDocRef, { userLocations: arrayRemove(existingUserLocations[foundLocationIndex]) });
        }

        transaction.update(planDocRef, { userLocations: arrayUnion({ uid, lng, lat }) });
      });
    } catch (error) {
      throw new Error('Failed to update location: ' + error);
    }
  }

  async addMember(uid: string, planID: string, newUID: string): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.CoOwner))) {
        throw new Error('You do not have permission to add a member to this plan');
      }

      await this.planRef.doc(planID).update({ members: arrayUnion({ uid: newUID, role: Role.Invited }) });
    } catch (error) {
      throw new Error('Failed to add member: ' + error);
    }
  }

  async removeMember(uid: string, planID: string, targetUID: string): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.CoOwner))) {
        throw new Error('You do not have permission to remove a member from this plan');
      }

      await this.planRef.doc(planID).update({ members: arrayRemove({ uid: targetUID }) });
    } catch (error) {
      throw new Error('Failed to remove member: ' + error);
    }
  }

  async acceptPlanInvite(uid: string, planID: string) {
    try {
      await this.db.firestore.runTransaction(async (transaction) => {
        const planDocRef = this.planRef.doc(planID).ref;
        const planDocSnapshot = await transaction.get(planDocRef);
        if (!planDocSnapshot.exists) {
          throw new Error(`Plan document with ID ${planID} does not exist`);
        }

        const members = planDocSnapshot.data()?.members as Member[] || [];
        const memberIndex = members.findIndex(member => member.uid === uid);
        if (memberIndex === -1 || members[memberIndex].role !== Role.Invited) {
          throw new Error(`Invited memeber with UID ${uid} does not exist in this plan`);
        }

        const updatedMember = { ...members[memberIndex], role: Role.Attendee };

        transaction.update(planDocRef, { members: arrayRemove(members[memberIndex]) });
        transaction.update(planDocRef, { members: arrayUnion(updatedMember) });
      });
    } catch (error) {
      throw new Error('Failed to accept plan invite: ' + error);
    }
  }

  async updateMemberRole(uid: string, planID: string, memberUID: string, newRole: Role): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.Owner))) {
        throw new Error('You do not have permission to update the role of members in this plan');
      }

      await this.db.firestore.runTransaction(async (transaction) => {
        const planDocRef = this.planRef.doc(planID).ref;
        const planDocSnapshot = await transaction.get(planDocRef);
        if (!planDocSnapshot.exists) {
          throw new Error(`Plan document with ID ${planID} does not exist`);
        }

        const members = planDocSnapshot.data()?.members as Member[] || [];
        const memberIndex = members.findIndex(member => member.uid === memberUID);
        if (memberIndex === -1) {
          throw new Error(`Member with UID ${memberUID} does not exist in this plan`);
        }

        const updatedMember = { ...members[memberIndex], role: newRole };

        transaction.update(planDocRef, { members: arrayRemove(members[memberIndex]) });
        transaction.update(planDocRef, { members: arrayUnion(updatedMember) });
      });
    } catch (error) {
      throw new Error('Failed to update member role: ' + error);
    }
  }

  async getUserPlans(uid: string): Promise<string[]> {
    try {
      const ownerQuerySnapshot = await this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.Owner })
        .get();

      const coOwnerQuerySnapshot = await this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.CoOwner })
        .get();

      const plannerQuerySnapshot = await this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.Planner })
        .get();

      const attendeeQuerySnapshot = await this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.Attendee })
        .get();

      const ownerPlans = ownerQuerySnapshot.docs.map(doc => doc.id);
      const coOwnerPlans = coOwnerQuerySnapshot.docs.map(doc => doc.id);
      const plannerPlans = plannerQuerySnapshot.docs.map(doc => doc.id);
      const attendeePlans = attendeeQuerySnapshot.docs.map(doc => doc.id);

      const userPlans = Array.from(new Set([...ownerPlans, ...coOwnerPlans, ...plannerPlans, ...attendeePlans]));

      return userPlans;
    } catch (error) {
      throw new Error('Failed to get plans for user: ' + error);
    }
  }

  async getPlanInvites(uid: string): Promise<string[]> {
    try {
      const querySnapshot = await this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.Invited })
        .get();
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      throw new Error('Failed to get plan invites for user: ' + error);
    }
  }

  async getPlanData(uid: string, planID: string): Promise<PlanData | null> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.Attendee))) {
        throw new Error('You do not have permission to get data from this plan');
      }

      const planDoc = await this.planRef.doc(planID).ref.get();
      return planDoc.exists ? planDoc.data() as PlanData : null;
    } catch (error) {
      throw new Error('Failed to get plan data: ' + error);
    }
  }

  async addLocation(uid: string, planID: string, location: Location, orderNum: number): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.Planner))) {
        throw new Error('You do not have permission to add a location to this plan');
      }

      const planDocRef = this.planRef.doc(planID).ref;
      const planDocSnapshot = await planDocRef.get();

      if (!planDocSnapshot.exists) {
        throw new Error(`Plan document with ID ${planID} does not exist`);
      }

      const placeLocations = planDocSnapshot.data()?.placeLocations as PlaceLocation[] || [];

      if (orderNum < 0 || orderNum > placeLocations.length) {
        orderNum = placeLocations.length;
      }

      placeLocations.splice(orderNum, 0, {
        location,
        locationID: this.db.createId(),
        addedBy: uid,
        timeAdded: "test added",
        timeStart: "test start",
        timeEnd: "test end",
        orderNum,
        attending: []
      });

      const organizedLocations = this.organizeLocations(placeLocations);

      await planDocRef.update({ placeLocations: organizedLocations });
    } catch (error) {
      throw new Error('Failed to add location: ' + error);
    }
  }

  async removeLocation(uid: string, planID: string, locationID: string): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.Planner))) {
        throw new Error('You do not have permission to remove a location from this plan');
      }

      const planDocRef = this.planRef.doc(planID).ref;
      const planDocSnapshot = await planDocRef.get();

      if (!planDocSnapshot.exists) {
        throw new Error(`Plan document with ID ${planID} does not exist`);
      }

      let placeLocations = planDocSnapshot.data()?.placeLocations as PlaceLocation[] || [];
      placeLocations = placeLocations.filter(location => location.locationID !== locationID);

      const organizedLocations = this.organizeLocations(placeLocations);

      await planDocRef.update({ placeLocations: organizedLocations });
    } catch (error) {
      throw new Error('Failed to remove location: ' + error);
    }
  }

  async changeLocationOrder(uid: string, planID: string, locationID: string, newOrderNum: number): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.Planner))) {
        throw new Error('You do not have permission to change the order of locations in this plan');
      }

      const planDocRef = this.planRef.doc(planID).ref;
      const planDocSnapshot = await planDocRef.get();

      if (!planDocSnapshot.exists) {
        throw new Error(`Plan document with ID ${planID} does not exist`);
      }

      let placeLocations = planDocSnapshot.data()?.placeLocations as PlaceLocation[] || [];

      if (newOrderNum < 0 || newOrderNum > placeLocations.length) {
        newOrderNum = placeLocations.length;
      }

      const locationIndex = placeLocations.findIndex(location => location.locationID === locationID);

      if (locationIndex === -1) {
        throw new Error(`Location with ID ${locationID} does not exist in this plan`);
      }

      if (locationIndex === newOrderNum) {
        throw new Error(`Location is already in requested order`);
      }

      const locationToMove = placeLocations.splice(locationIndex, 1)[0];
      placeLocations.splice(newOrderNum, 0, locationToMove);

      const organizedLocations = this.organizeLocations(placeLocations);

      await planDocRef.update({ placeLocations: organizedLocations });
    } catch (error) {
      throw new Error('Failed to change location order: ' + error);
    }
  }

  async updateLocationStartTime(uid: string, planID: string, locationID: string, newStartTime: string): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.Planner))) {
        throw new Error('You do not have permission to update the start time of a location in this plan');
      }

      const planDocRef = this.planRef.doc(planID).ref;
      const planDocSnapshot = await planDocRef.get();

      if (!planDocSnapshot.exists) {
        throw new Error(`Plan document with ID ${planID} does not exist`);
      }

      let placeLocations = planDocSnapshot.data()?.placeLocations as PlaceLocation[] || [];
      const locationIndex = placeLocations.findIndex(location => location.locationID === locationID);

      if (locationIndex === -1) {
        throw new Error(`Location with ID ${locationID} does not exist in this plan`);
      }

      placeLocations[locationIndex].timeStart = newStartTime;

      const organizedLocations = this.organizeLocations(placeLocations);

      await planDocRef.update({ placeLocations: organizedLocations });
    } catch (error) {
      throw new Error('Failed to update location start time: ' + error);
    }
  }

  async updateLocationEndTime(uid: string, planID: string, locationID: string, newEndTime: string): Promise<void> {
    try {
      if (!(await this.hasPermission(planID, uid, Role.Planner))) {
        throw new Error('You do not have permission to update the end time of a location in this plan');
      }

      const planDocRef = this.planRef.doc(planID).ref;
      const planDocSnapshot = await planDocRef.get();

      if (!planDocSnapshot.exists) {
        throw new Error(`Plan document with ID ${planID} does not exist`);
      }

      let placeLocations = planDocSnapshot.data()?.placeLocations as PlaceLocation[] || [];
      const locationIndex = placeLocations.findIndex(location => location.locationID === locationID);

      if (locationIndex === -1) {
        throw new Error(`Location with ID ${locationID} does not exist in this plan`);
      }

      placeLocations[locationIndex].timeEnd = newEndTime;

      const organizedLocations = this.organizeLocations(placeLocations);

      await planDocRef.update({ placeLocations: organizedLocations });
    } catch (error) {
      throw new Error('Failed to update location end time: ' + error);
    }
  }

  async updateMissingPlanData(planID: string): Promise<void> {
    try {
      const planDocRef = this.planRef.doc(planID).ref;
      const planDocSnapshot = await planDocRef.get();
      if (!planDocSnapshot.exists) {
        throw new Error(`Plan document with ID ${planID} does not exist`);
      }

      const planData = planDocSnapshot.data() as PlanData;
      const updatedPlanData: PlanData = { ...defaultPlanData, ...planData };

      await this.planRef.doc(planID).set(updatedPlanData);
    } catch (error) {
      throw new Error("Failed to validate plan data: " + error);
    }
  }

  private async getRole(uid: string, planID: string): Promise<Role> {
    try {
      const planDocSnapshot = await this.planRef.doc(planID).ref.get();
      if (!planDocSnapshot.exists) {
        throw new Error(`Plan document with ID ${planID} does not exist`);
      }

      const members = planDocSnapshot.data()?.members as Member[] || [];
      const memberIndex = members.findIndex(member => member.uid === uid);

      if (memberIndex === -1) {
        throw new Error(`Not a member`);
      }

      return members[memberIndex].role as Role;
    } catch (error) {
      throw new Error('Failed to get role: ' + error);
    }
  }

  private async hasPermission(uid: string, planID: string, requiredRole: Role): Promise<boolean> {
    try {
      const userRole = await this.getRole(planID, uid);
      return rolePrecedence[userRole] <= rolePrecedence[requiredRole];
    } catch (error) {
      throw new Error('Failed to check permission: ' + error);
    }
  }

  private organizeLocations(locations: PlaceLocation[]): PlaceLocation[] {
    return locations.map((location, index) => ({ ...location, order_num: index }));
  }
}

export interface PlanData {
  name: FieldValue | string;
  created: FieldValue | string;
  startDate: FieldValue | string;
  endDate: FieldValue | string;
  members: FieldValue | Member[];
  userLocations: FieldValue | UserLocation[];
  placeLocations: FieldValue | PlaceLocation[];
}

export interface PlaceLocation {
  location: FieldValue | Location;
  locationID: FieldValue | string;
  addedBy: FieldValue | string;
  timeAdded: FieldValue | string;
  timeStart: FieldValue | string;
  timeEnd: FieldValue | string;
  orderNum: FieldValue | number;
  attending: FieldValue | string[];
}

export interface Member {
  uid: FieldValue | string,
  role: FieldValue | Role
}

export enum Role {
  Owner = "owner",
  CoOwner = "coOwner",
  Planner = "planner",
  Attendee = "attendee",
  Invited = "invited"
}

const rolePrecedence = {
  owner: 1,
  coOwner: 2,
  planner: 3,
  attendee: 4,
  invited: 5
};

export interface UserLocation {
  uid: FieldValue | string;
  lat: FieldValue | number;
  lng: FieldValue | number;
}

export interface Location {
  id: FieldValue | string;
  name: FieldValue | string;
  lng: FieldValue | number;
  lat: FieldValue | number;
  type: FieldValue | LocationType;
}

export enum LocationType {
  Foursquare = 'foursquare',
  Custom = 'custom'
}

const defaultPlanData: PlanData = {
  name: "default name",
  created: "default created date",
  startDate: "default start date",
  endDate: "default end date",
  members: [],
  userLocations: [],
  placeLocations: []
};
