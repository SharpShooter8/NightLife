import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue, serverTimestamp, arrayRemove, arrayUnion } from '@angular/fire/firestore';
import { Observable, catchError, defer, forkJoin, from, map, of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private planRef: AngularFirestoreCollection<PlanData>;

  constructor(private db: AngularFirestore) {
    this.planRef = this.db.collection('Plans');
  }

  createPlan(uid: string, name: string, startDate: string | null, endDate: string | null): Observable<void> {
    return defer(() => {
      const planData: PlanData = {
        name,
        created: serverTimestamp(),
        startDate: startDate || serverTimestamp(),
        endDate: endDate || serverTimestamp(),
        members: [{ uid, role: Role.Owner }],
        userLocations: [],
        placeLocations: []
      };

      return from(this.planRef.add(planData)).pipe(
        map(() => { }),
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
          if (!this.hasPermission(uid, members, Role.CoOwner)) {
            throw new Error('Not enough permissions to remove member');
          }
          return from(snapshot.ref.update({ members: arrayRemove({ uid: targetUID }) }));
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

  getUserPlans(uid: string): Observable<string[]> {
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
        from(ownerQuery.get()).pipe(switchMap(snapshot => of(snapshot.docs))),
        from(coOwnerQuery.get()).pipe(switchMap(snapshot => of(snapshot.docs))),
        from(plannerQuery.get()).pipe(switchMap(snapshot => of(snapshot.docs))),
        from(attendeeQuery.get()).pipe(switchMap(snapshot => of(snapshot.docs)))
      ]).pipe(
        map(([ownerDocs, coOwnerDocs, plannerDocs, attendeeDocs]) => {
          return [
            ...ownerDocs.map(doc => doc.id),
            ...coOwnerDocs.map(doc => doc.id),
            ...plannerDocs.map(doc => doc.id),
            ...attendeeDocs.map(doc => doc.id)
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

  getPlanInvites(uid: string): Observable<string[]> {
    return defer(() => {
      return from(this.planRef.ref
        .where('members', 'array-contains', { uid: uid, role: Role.Invited })
        .get()).pipe(
          switchMap(snapshot => {
            return of(snapshot.docs.map(doc => doc.id));
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

  addLocation(uid: string, planID: string, location: Location, orderNum: number): Observable<void> {
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
          const placeLocations = snapshot.data()?.placeLocations as PlaceLocation[];
          if (orderNum < 0 || orderNum > placeLocations.length) {
            orderNum = placeLocations.length;
          }
          placeLocations.splice(orderNum, 0, {
            location,
            locationID: this.db.createId(),
            addedBy: uid,
            timeAdded: 'test added',
            timeStart: 'test start',
            timeEnd: 'test end',
            orderNum,
            attending: []
          });
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, order_num: index }));
          return from(snapshot.ref.update({ placeLocations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to add plan location: ' + error
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
          let placeLocations = snapshot.data()?.placeLocations as PlaceLocation[];
          placeLocations = placeLocations.filter(location => location.locationID !== locationID);
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, order_num: index }));
          return from(snapshot.ref.update({ placeLocations: organizedLocations }));
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
          let placeLocations = snapshot.data()?.placeLocations as PlaceLocation[] || [];
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
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, order_num: index }));
          return from(snapshot.ref.update({ placeLocations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to changle plan location order: ' + error
          });
        })
      );
    });
  }

  updateLocationStartTime(uid: string, planID: string, locationID: string, newStartTime: string): Observable<void> {
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
          let placeLocations = snapshot.data()?.placeLocations as PlaceLocation[] || [];
          const locationIndex = placeLocations.findIndex(location => location.locationID === locationID);
          if (locationIndex === -1) {
            throw new Error(`Location with ID ${locationID} does not exist in this plan`);
          }
          placeLocations[locationIndex].timeStart = newStartTime;
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, order_num: index }));
          return from(snapshot.ref.update({ placeLocations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update plan location start time: ' + error
          });
        })
      );
    });
  }

  updateLocationEndTime(uid: string, planID: string, locationID: string, newEndTime: string): Observable<void> {
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
          let placeLocations = snapshot.data()?.placeLocations as PlaceLocation[] || [];
          const locationIndex = placeLocations.findIndex(location => location.locationID === locationID);
          if (locationIndex === -1) {
            throw new Error(`Location with ID ${locationID} does not exist in this plan`);
          }
          placeLocations[locationIndex].timeEnd = newEndTime;
          const organizedLocations = placeLocations.map((location, index) => ({ ...location, order_num: index }));
          return from(snapshot.ref.update({ placeLocations: organizedLocations }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update plan location end time: ' + error
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

  private hasPermission(uid: string, members: Member[], requiredRole: Role): boolean {
    const member = members.find(member => member.uid === uid);
    if (!member) return false;
    const role = member.role as Role;
    return rolePrecedence[role] <= rolePrecedence[requiredRole];
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
  Owner = 'owner',
  CoOwner = 'coOwner',
  Planner = 'planner',
  Attendee = 'attendee',
  Invited = 'invited'
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
  name: 'default name',
  created: 'default created date',
  startDate: 'default start date',
  endDate: 'default end date',
  members: [],
  userLocations: [],
  placeLocations: []
};
