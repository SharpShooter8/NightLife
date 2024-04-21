import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { arrayRemove, arrayUnion, Timestamp } from '@angular/fire/firestore';
import { Observable, catchError, defer, forkJoin, from, map, of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private planRef: AngularFirestoreCollection<PlanData>;

  constructor(private db: AngularFirestore) {
    this.planRef = this.db.collection('Plans');
  }

  createPlan(uid: string, name: string, startDate: string, endDate: string): Observable<{ id: string, data: PlanData }> {
    return defer(() => {
      const planData: PlanData = {
        name,
        dateCreated: Timestamp.fromDate(new Date()).toString(),
        startDate: startDate,
        endDate: endDate,
        members: [{ uid, role: Role.Owner }],
        userLocations: [],
        locations: []
      };

      return from(this.planRef.add(planData)).pipe(
        switchMap(snapshot => {
          return from(snapshot.get());
        }),
        map(snapshot => {
          return { id: snapshot.id, data: snapshot.data() as PlanData }
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to create plan: ' + error
          });
        })
      );
    });
  }

  removePlan(uid: string, planID: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Owner)) {
            throw new Error('Not enough permissions to remove plan');
          }
          return from(snapshot.ref.delete());
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to remove plan: ' + error
          });
        })
      );
    });
  }

  updateName(uid: string, planID: string, name: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.CoOwner)) {
            throw new Error('Not enough permissions to update name');
          }
          if (!name.trim()) {
            throw new Error('Name cannot be empty');
          }
          return from(snapshot.ref.update({ name }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update name: ' + error
          });
        })
      );
    });
  }

  updateStartDate(uid: string, planID: string, startDate: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.CoOwner)) {
            throw new Error('Not enough permissions to update start date');
          }
          return from(snapshot.ref.update({ startDate: startDate }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update start date: ' + error
          });
        })
      );
    });
  }

  updateEndDate(uid: string, planID: string, endDate: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.CoOwner)) {
            throw new Error('Not enough permissions to update end date');
          }
          return from(snapshot.ref.update({ endDate: endDate }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update end date: ' + error
          });
        })
      );
    });
  }

  updateMemberLocation(uid: string, planID: string, lng: number, lat: number): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Attendee)) {
            throw new Error('Not enough permissions to update location');
          }
          const existingUserLocations = snapshot.data()?.userLocations as UserLocation[] || [];
          const foundLocationIndex = existingUserLocations.findIndex(location => location.uid === uid);
          return from(this.db.firestore.runTransaction(async (transaction) => {
            if (foundLocationIndex !== -1) {
              transaction.update(snapshot.ref, { userLocations: arrayRemove(existingUserLocations[foundLocationIndex]) });
            }
            transaction.update(snapshot.ref, { userLocations: arrayUnion({ uid, lng, lat }) });
          }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update member location: ' + error
          });
        })
      );
    });
  }

  addMember(uid: string, planID: string, newUID: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.CoOwner)) {
            throw new Error('Not enough permissions to add member');
          }
          return from(snapshot.ref.update({ members: arrayUnion({ uid: newUID, role: Role.Invited }) }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to add member: ' + error
          });
        })
      );
    });
  }

  removeMember(uid: string, planID: string, targetUID: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          const memberIndex = members.findIndex(member => member.uid === targetUID);
          if (memberIndex === -1) {
            throw new Error(`Member with UID ${targetUID} not found in plan`);
          }
          if (!this.hasPermission(uid, members, Role.CoOwner)) {
            throw new Error('Not enough permissions to remove member');
          }
          return from(snapshot.ref.update({ members: arrayRemove(members[memberIndex]) }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to remove member: ' + error
          });
        })
      );
    });
  }

  acceptPlanInvite(uid: string, planID: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          const memberIndex = members.findIndex(member => member.uid === uid && member.role === Role.Invited);
          if (memberIndex === -1) {
            throw new Error(`No invitation found for uid ${uid}`);
          }
          return from(this.db.firestore.runTransaction(async (transaction) => {
            transaction.update(snapshot.ref, { members: arrayRemove(members[memberIndex]) });
            transaction.update(snapshot.ref, { members: arrayUnion({ ...members[memberIndex], role: Role.Attendee }) });
          }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to accept plan invitation: ' + error
          });
        })
      );
    });
  }

  rejectPlanInvite(uid: string, planID: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          const memberIndex = members.findIndex(member => member.uid === uid && member.role === Role.Invited);
          if (memberIndex === -1) {
            throw new Error(`No invitation found for uid ${uid}`);
          }
          return from(snapshot.ref.update({ members: arrayRemove(members[memberIndex]) }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to reject plan invitation: ' + error
          });
        })
      );
    });
  }

  updateMemberRole(uid: string, planID: string, memberUID: string, newRole: Role): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Attendee)) {
            throw new Error('Not enough permissions to update location');
          }
          const memberIndex = members.findIndex(member => member.uid === memberUID);
          if (memberIndex === -1) {
            throw new Error(`Member with UID ${memberUID} does not exist in this plan`);
          }
          const updatedMember = { ...members[memberIndex], role: newRole };
          return from(this.db.firestore.runTransaction(async (transaction) => {
            transaction.update(snapshot.ref, { members: arrayRemove(members[memberIndex]) });
            transaction.update(snapshot.ref, { members: arrayUnion(updatedMember) });
          }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update member role: ' + error
          });
        })
      );
    });
  }

  getUserPlans(uid: string): Observable<{ id: string, data: PlanData }[]> {
    return defer(() => {
      const ownerQuery = this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.Owner });
      const coOwnerQuery = this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.CoOwner });
      const plannerQuery = this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.Planner });
      const attendeeQuery = this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.Attendee });
      return forkJoin([
        from(ownerQuery.get()).pipe(map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })))),
        from(coOwnerQuery.get()).pipe(map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })))),
        from(plannerQuery.get()).pipe(map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })))),
        from(attendeeQuery.get()).pipe(map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })))),
      ]).pipe(
        map(([ownerDocs, coOwnerDocs, plannerDocs, attendeeDocs]) => {
          return [
            ...ownerDocs,
            ...coOwnerDocs,
            ...plannerDocs,
            ...attendeeDocs
          ];
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to get users plans: ' + error
          });
        })
      );
    });
  }

  getPlanInvites(uid: string): Observable<{ id: string, data: PlanData }[]> {
    return defer(() => {
      return from(this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.Invited })
        .get()).pipe(
          switchMap(snapshot => {
            return of(snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
          }),
          catchError(error => {
            return throwError(() => {
              'Failed to get plan invites: ' + error
            });
          })
        );
    });
  }

  getPlanData(uid: string, planID: string): Observable<PlanData> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Invited)) {
            throw new Error('Not enough permissions to remove member');
          }
          return of(snapshot.data() as PlanData);
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to get plan data: ' + error
          });
        })
      );
    });
  }

  addLocation(uid: string, planID: string, startDate: string, endDate: string, location: Location, orderNum: number): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Planner)) {
            throw new Error('Not enough permissions to remove member');
          }
          const placeLocations = snapshot.data()?.locations as PlanLocation[];
          if (orderNum < 0 || orderNum > placeLocations.length) {
            orderNum = placeLocations.length;
          }
          placeLocations.splice(orderNum, 0, {
            location,
            locationID: this.db.createId(),
            addedBy: uid,
            addedDate: this.getFormattedTimestamp(),
            startDate: startDate,
            endDate: endDate,
            orderNum,
            attending: []
          });
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, orderNum: index + 1 }));
          return from(snapshot.ref.update({ locations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            throw new Error('Failed to add plan location: ' + error);
          });
        })
      );
    });
  }

  removeLocation(uid: string, planID: string, locationID: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Planner)) {
            throw new Error('Not enough permissions to remove member');
          }
          let placeLocations = snapshot.data()?.locations as PlanLocation[];
          placeLocations = placeLocations.filter(location => location.locationID !== locationID);
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, orderNum: index + 1 }));
          return from(snapshot.ref.update({ locations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to remove plan location: ' + error
          });
        })
      );
    });
  }

  changeLocationOrder(uid: string, planID: string, locationID: string, newOrderNum: number): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Planner)) {
            throw new Error('Not enough permissions to remove member');
          }
          let placeLocations = snapshot.data()?.locations as PlanLocation[] || [];
          if (newOrderNum <= 0 || newOrderNum > placeLocations.length) {
            newOrderNum = placeLocations.length;
          }
          const locationIndex = placeLocations.findIndex(location => location.locationID === locationID);
          if (locationIndex === -1) {
            throw new Error(`Location with ID ${locationID} does not exist in this plan`);
          }
          if (locationIndex === newOrderNum - 1) {
            throw new Error(`Location is already in requested order`);
          }
          const locationToMove = placeLocations.splice(locationIndex, 1)[0];
          placeLocations.splice(newOrderNum - 1, 0, locationToMove);
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, orderNum: index + 1 }));
          return from(snapshot.ref.update({ locations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to changle plan location order: ' + error
          });
        })
      );
    });
  }

  updateLocationStartDate(uid: string, planID: string, locationID: string, newStartDate: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Planner)) {
            throw new Error('Not enough permissions to remove member');
          }
          let placeLocations = snapshot.data()?.locations as PlanLocation[] || [];
          const locationIndex = placeLocations.findIndex(location => location.locationID === locationID);
          if (locationIndex === -1) {
            throw new Error(`Location with ID ${locationID} does not exist in this plan`);
          }
          placeLocations[locationIndex].startDate = newStartDate;
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, orderNum: index + 1 }));
          return from(snapshot.ref.update({ locations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update plan location start date: ' + error
          });
        })
      );
    });
  }

  updateLocationEndDate(uid: string, planID: string, locationID: string, newEndDate: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Planner)) {
            throw new Error('Not enough permissions to remove member');
          }
          let placeLocations = snapshot.data()?.locations as PlanLocation[] || [];
          const locationIndex = placeLocations.findIndex(location => location.locationID === locationID);
          if (locationIndex === -1) {
            throw new Error(`Location with ID ${locationID} does not exist in this plan`);
          }
          placeLocations[locationIndex].endDate = newEndDate;
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, orderNum: index + 1 }));
          return from(snapshot.ref.update({ locations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update plan location end date: ' + error
          });
        })
      );
    });
  }

  addLocationAttendee(uid: string, planID: string, locationID: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Attendee)) {
            throw new Error('Not enough permissions to add location attendee');
          }
          let placeLocations = snapshot.data()?.locations as PlanLocation[] || [];
          const locationIndex = placeLocations.findIndex(location => location.locationID === locationID);
          if (locationIndex === -1) {
            throw new Error(`Location with ID ${locationID} does not exist in this plan`);
          }
          placeLocations[locationIndex].attending.push(uid);
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, orderNum: index + 1 }));
          return from(snapshot.ref.update({ locations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update plan location attendees: ' + error
          });
        })
      );
    });
  }

  removeLocationAttendee(uid: string, planID: string, locationID: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const members = snapshot.data()?.members as Member[] || [];
          if (!this.hasPermission(uid, members, Role.Attendee)) {
            throw new Error('Not enough permissions to remove location attendee');
          }
          let placeLocations = snapshot.data()?.locations as PlanLocation[] || [];
          const locationIndex = placeLocations.findIndex(location => location.locationID === locationID);
          if (locationIndex === -1) {
            throw new Error(`Location with ID ${locationID} does not exist in this plan`);
          }
          const index = placeLocations[locationIndex].attending.indexOf(uid);
          if (index !== -1) {
            placeLocations[locationIndex].attending.splice(index, 1);
          }
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, orderNum: index + 1 }));
          return from(snapshot.ref.update({ locations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update plan location attendees: ' + error
          });
        })
      );
    });
  }

  updateMissingPlanData(planID: string): Observable<void> {
    return defer(() => {
      return this.planRef.doc(planID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error(`Plan document with ID ${planID} does not exist`);
          }
          const planData = snapshot.data() as PlanData;
          const updatedPlanData: PlanData = { ...defaultPlanData, ...planData };
          return from(snapshot.ref.set(updatedPlanData));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update missing plan data: ' + error
          });
        })
      );
    });
  }

  hasPermission(uid: string, members: Member[], requiredRole: Role): boolean {
    const member = members.find(member => member.uid === uid);
    if (!member) return false;
    const role = member.role as Role;
    return rolePrecedence[role] <= rolePrecedence[requiredRole];
  }

  getDemotedRole(currentRole: Role): Role {
    switch (currentRole) {
      case Role.Owner:
        return Role.Owner;
      case Role.CoOwner:
        return Role.Planner;
      case Role.Planner:
        return Role.Attendee;
      case Role.Attendee:
        return Role.Attendee;
      case Role.Invited:
        return Role.Invited;
      default:
        return Role.Invited; // Default case, should not happen
    }
  }

  getPromotedRole(currentRole: Role): Role {
    switch (currentRole) {
      case Role.Owner:
        return Role.Owner;
      case Role.CoOwner:
        return Role.CoOwner;
      case Role.Planner:
        return Role.CoOwner;
      case Role.Attendee:
        return Role.Planner;
      case Role.Invited:
        return Role.Invited;
      default:
        return Role.Invited; // Default case, should not happen
    }
  }

  getFormattedTimestamp(): string {
    const currentDate = new Date();

    const formatNumber = (value: number): string => (value < 10 ? `0${value}` : `${value}`);

    const year = currentDate.getFullYear().toString();
    const month = formatNumber(currentDate.getMonth() + 1);
    const day = formatNumber(currentDate.getDate());
    const hours = formatNumber(currentDate.getHours());
    const minutes = formatNumber(currentDate.getMinutes());
    const seconds = formatNumber(currentDate.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

}

export interface PlanData {
  name: string;
  dateCreated: string;
  startDate: string;
  endDate: string;
  members: Member[];
  userLocations: UserLocation[];
  locations: PlanLocation[];
}

export interface PlanLocation {
  location: Location;
  locationID: string;
  addedBy: string;
  addedDate: string;
  startDate: string;
  endDate: string;
  orderNum: number;
  attending: string[];
}

export interface Member {
  uid: string,
  role: Role
}

export enum Role {
  Owner = 'owner',
  CoOwner = 'coOwner',
  Planner = 'planner',
  Attendee = 'attendee',
  Invited = 'invited'
}

export const rolePrecedence = {
  owner: 1,
  coOwner: 2,
  planner: 3,
  attendee: 4,
  invited: 5
};

export interface UserLocation {
  uid: string;
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  name: string;
  lng: number;
  lat: number;
  type: LocationType;
}

export enum LocationType {
  Foursquare = 'foursquare',
  Custom = 'custom'
}

const defaultPlanData: PlanData = {
  name: 'default name',
  dateCreated: 'default created date',
  startDate: 'default start date',
  endDate: 'default end date',
  members: [],
  userLocations: [],
  locations: []
};
