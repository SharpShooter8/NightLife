import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue, arrayRemove, arrayUnion } from '@angular/fire/firestore';
import { Observable, catchError, defer, from, map, of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomLocationService {

  private customLocationRef: AngularFirestoreCollection<CustomLocationData>;

  constructor(private db: AngularFirestore) {
    this.customLocationRef = this.db.collection<CustomLocationData>('CustomLocations');
  }

  createLocation(uid: string, location: Location): Observable<{id: string, data: CustomLocationData}> {
    return defer(() => {
      const locationData: CustomLocationData = {
        owner: uid,
        location,
        // comments: []
      }
      return from(this.customLocationRef.ref.add(locationData)).pipe(
        switchMap(snapshot => {
          return from(snapshot.get());
        }),
        map(snapshot => {
          return { id: snapshot.id, data: snapshot.data() as CustomLocationData }
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to create custom location: ' + error
          });
        }));
    });
  }

  removeLocation(uid: string, locationID: string): Observable<void> {
    return defer(() => {
      return this.customLocationRef.doc(locationID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error('Location not found');
          }
          if (snapshot.data()?.owner as string !== uid) {
            throw new Error(`Cannot remove location UID ${uid} does not own`);
          }
          return from(snapshot.ref.delete());
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to remove location: ' + error
          });
        })
      );
    });
  }

  updateLocation(uid: string, locationID: string, updatedLocationData: Partial<Location>): Observable<void> {
    return defer(() => {
      return this.customLocationRef.doc(locationID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error('Location not found');
          }
          if (snapshot.data()?.owner as string !== uid) {
            throw new Error(`Cannot update location UID ${uid} does not own`);
          }
          const existingLocation = snapshot.data()?.location as Location;
          const updatedLocation: Location = { ...existingLocation, ...updatedLocationData } as Location;
          return from(snapshot.ref.update({ location: updatedLocation }));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to remove location: ' + error
          });
        })
      );
    });
  }

  // addComment(uid: string, locationID: string, content: string): Observable<void> {
  //   return defer(() => {
  //     return this.customLocationRef.doc(locationID).get().pipe(
  //       switchMap(snapshot => {
  //         if (!snapshot.exists) {
  //           throw new Error('Location not found');
  //         }
  //         const comment = {
  //           id: this.db.createId(),
  //           owner: uid,
  //           content,
  //           dateCreated: 'set time'
  //         };
  //         return from(snapshot.ref.update({ comments: arrayUnion(comment) }));
  //       }),
  //       catchError(error => {
  //         return throwError(() => {
  //           'Failed to add comment to custom location: ' + error
  //         });
  //       })
  //     );
  //   });
  // }

  // removeComment(uid: string, locationID: string, commentID: string): Observable<void> {
  //   return defer(() => {
  //     return this.customLocationRef.doc(locationID).get().pipe(
  //       switchMap(snapshot => {
  //         if (!snapshot.exists) {
  //           throw new Error('Location not found');
  //         }
  //         if (snapshot.data()?.owner as string !== uid) {
  //           throw new Error(`Cannot remove comment from locaiton UID ${uid} does not own`);
  //         }
  //         const comments: Comment[] = snapshot.data()?.comments as Comment[];
  //         const commentIndex = comments.findIndex(comment => comment.id === commentID);
  //         if (commentIndex === -1) {
  //           throw new Error(`Comment not found with ID ${commentID}`);
  //         }
  //         return from(snapshot.ref.update({ comments: arrayRemove(comments[commentIndex]) }));
  //       }),
  //       catchError(error => {
  //         return throwError(() => {
  //           'Failed to remove comment from custom location: ' + error
  //         });
  //       })
  //     );
  //   });
  // }

  // updateComment(uid: string, locationID: string, commentID: string, newContent: string): Observable<void> {
  //   return defer(() => {
  //     return this.customLocationRef.doc(locationID).get().pipe(
  //       switchMap(snapshot => {
  //         if (!snapshot.exists) {
  //           throw new Error('Location not found');
  //         }
  //         const comments: Comment[] = snapshot.data()?.comments as Comment[];
  //         const commentIndex = comments.findIndex(comment => comment.id === commentID);
  //         if (commentIndex === -1) {
  //           throw new Error('Comment not found');
  //         }

  //         const comment = comments[commentIndex];
  //         if (comment.owner !== uid) {
  //           throw new Error('Only the owner of the comment can update it');
  //         }
  //         const updatedComment = { ...comment, content: newContent };

  //         return from(this.db.firestore.runTransaction(async (transaction) => {
  //           transaction.update(snapshot.ref, { comments: arrayRemove(comments[commentIndex]) });
  //           transaction.update(snapshot.ref, { comments: arrayUnion(updatedComment) });
  //         }));
  //       }),
  //       catchError(error => {
  //         return throwError(() => {
  //           'Failed to update comment from custom location: ' + error
  //         });
  //       })
  //     );
  //   });
  // }

  getLocationData(locationID: string): Observable<CustomLocationData> {
    return defer(() => {
      return this.customLocationRef.doc(locationID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error('Location not found');
          }
          return of(snapshot.data() as CustomLocationData);
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to get location data from custom location: ' + error
          });
        })
      );
    });
  }

  locationsWithinRadius(lng: number, lat: number, radius: number): Observable<Location[]> {
    return defer(() => {
      return this.customLocationRef.get().pipe(
        switchMap(snapshot => {
          const locationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data().location as Location }));

          const locationsWithinRadius = locationsData.filter(locationData => {
            const { lng: locationLng, lat: locationLat } = locationData as Location;
            const distance = this.calculateDistance(lng, lat, locationLng as number, locationLat as number);
            return distance <= radius;
          });

          return of(locationsWithinRadius.map(locationData => locationData as Location));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to get locations within radius: ' + error
          });
        })
      );
    });
  }

  getUserLocations(uid: string): Observable<{ id: string, data: CustomLocationData }[]> {
    return defer(() => {
      return from(this.customLocationRef.ref.where('owner', '==', uid).get()).pipe(
        switchMap(snapshot => {
          return of(snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to get users custom locations: ' + error
          });
        })
      );
    });
  }

  updateMissingLocationData(locationID: string): Observable<void> {
    return defer(() => {
      return this.customLocationRef.doc(locationID).get().pipe(
        switchMap(snapshot => {
          if (!snapshot.exists) {
            throw new Error('Location not found');
          }
          const locationData = snapshot.data() as CustomLocationData;
          const updatedlocationData: CustomLocationData = { ...defaultCustomLocationData, ...locationData };

          return from(snapshot.ref.set(updatedlocationData));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to update users custom location data: ' + error
          });
        })
      );
    });
  }

  private calculateDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
    const r = 6371; // km
    const p = Math.PI / 180;

    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2
      + Math.cos(lat1 * p) * Math.cos(lat2 * p) *
      (1 - Math.cos((lng2 - lng1) * p)) / 2;

    return 2 * r * Math.asin(Math.sqrt(a)) * 1000; // meters
  }

}

export interface CustomLocationData {
  owner: string;
  location: Location;
  // comments: Comment[];
}

export interface Location {
  name: string,
  description: string,
  lng: number,
  lat: number,
  photos: string[],
  date: string,
  hours: Hours,
  price: Price | string,
  formattedAddress: string,
}

// export interface Comment {
//   id: string;
//   owner: string;
//   content: string;
//   dateCreated: string;
// }

export enum Price {
  Free = 'free',
  Cheap = 'cheap',
  Affordable = 'affordable',
  Pricey = 'pricey',
  Expensive = 'expensive'
}

export interface Hours {
  start: string,
  end: string
}

const defaultCustomLocationData: CustomLocationData = {
  owner: 'default owner',
  location: {
    name: 'default name',
    description: 'default description',
    lng: 0,
    lat: 0,
    photos: [],
    date: 'default date',
    hours: { start: "defaultstart", end: "defaultend" },
    price: 'default price',
    formattedAddress: 'default address'
  },
  // comments: []
};

