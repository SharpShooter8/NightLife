import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FieldValue, arrayRemove, arrayUnion } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CustomLocationService {

  private customLocationRef: AngularFirestoreCollection<CustomLocationData>;

  constructor(private db: AngularFirestore) {
    this.customLocationRef = this.db.collection<CustomLocationData>('CustomLocations');
  }

  async createLocation(uid: string, location: Location): Promise<string> {
    try {
      const locationData: CustomLocationData = {
        owner: uid,
        location,
        comments: []
      }
      const ref = await this.customLocationRef.add(locationData);
      if (!ref?.id) {
        throw new Error('Failed to create custom location: document reference or ID not found');
      }
      return ref.id;
    } catch (error) {
      throw new Error('Failed to create location: ' + error);
    }
  }

  async deleteLocation(uid: string, locationID: string): Promise<void> {
    try {
      await this.checkAccess(uid, locationID);
      await this.customLocationRef.doc(locationID).delete();
    } catch (error) {
      throw new Error('Failed to delete location: ' + error);
    }
  }

  async updateLocation(uid: string, locationID: string, data: Partial<Location>): Promise<void> {
    try {
      await this.checkAccess(uid, locationID);
      const existingLocation = await this.getLocationData(locationID);
      const updatedLocation: Location = { ...existingLocation, ...data } as Location;
      await this.customLocationRef.doc(locationID).update({ location: updatedLocation });
    } catch (error) {
      throw new Error('Failed to update location: ' + error);
    }
  }

  async addComment(uid: string, locationID: string, content: string): Promise<void> {
    try {
      const comment = { id: this.db.createId(), owner: uid, content, dateCreated: "set time" };
      await this.customLocationRef.doc(locationID).update({ comments: arrayUnion(comment) });
    } catch (error) {
      throw new Error('Failed to add comment: ' + error);
    }
  }

  async removeComment(uid: string, locationID: string, commentID: string): Promise<void> {
    try {
      await this.checkAccess(uid, locationID);
      const locationSnapshot = await this.customLocationRef.doc(locationID).ref.get();
      const locationData = locationSnapshot.data();
      const comments: Comment[] = locationData?.comments as Comment[] || [];
      const commentIndex = comments.findIndex(comment => comment.id === commentID);
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }
      await this.customLocationRef.doc(locationID).update({ comments: arrayRemove(comments[commentIndex]) });
    } catch (error) {
      throw new Error('Failed to remove comment: ' + error);
    }
  }

  async updateComment(uid: string, locationID: string, commentID: string, newContent: string): Promise<void> {
    try {
      const locationSnapshot = await this.customLocationRef.doc(locationID).ref.get();
      const locationData = locationSnapshot.data() as CustomLocationData;

      const comments: Comment[] = locationData.comments as Comment[];
      const commentIndex = comments.findIndex(comment => comment.id === commentID);
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }

      const comment = comments[commentIndex];
      if (comment.owner !== uid) {
        throw new Error('Only the owner of the comment can update it');
      }
      const updatedComment = { ...comment, content: newContent };

      await this.customLocationRef.doc(locationID).update({ comments: arrayRemove(comments[commentIndex]) });
      await this.customLocationRef.doc(locationID).update({ comments: arrayUnion(updatedComment) });
    } catch (error) {
      throw new Error('Failed to update comment: ' + error);
    }
  }

  async getLocationData(locationID: string): Promise<Location> {
    const locationDoc = await this.customLocationRef.doc(locationID).ref.get();
    if (!locationDoc.exists) {
      throw new Error('Location not found');
    }
    return locationDoc.data()?.location as Location || {};
  }

  async getComments(locationID: string): Promise<Comment[]> {
    try {
      const locationSnapshot = await this.customLocationRef.doc(locationID).ref.get();
      const locationData = locationSnapshot.data();
      if (!locationSnapshot.exists) {
        throw new Error('Location not found');
      }
      const comments: Comment[] = locationData?.comments as Comment[] || [];
      return comments;
    } catch (error) {
      throw new Error('Failed to get comments: ' + error);
    }
  }

  async locationsWithinRadius(lng: number, lat: number, radius: number): Promise<Location[]> {
    try {
      const locationsSnapshot = await this.customLocationRef.ref.get();
      const locationsData = locationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data().location as Location }));

      const locationsWithinRadius = locationsData.filter(locationData => {
        const { lng: locationLng, lat: locationLat } = locationData as Location;
        const distance = this.calculateDistance(lng, lat, locationLng as number, locationLat as number);
        return distance <= radius;
      });

      return locationsWithinRadius.map(locationData => locationData as Location);
    } catch (error) {
      throw new Error('Failed to get locations within radius: ' + error);
    }
  }

  async getUserLocations(uid: string): Promise<CustomLocationData[]> {
    try {
      const querySnapshot = await this.customLocationRef.ref.where('owner', '==', uid).get();
      const userLocations: CustomLocationData[] = [];
      querySnapshot.forEach(doc => {
        const locationData = doc.data() as CustomLocationData;
        userLocations.push(locationData);
      });
      return userLocations;
    } catch (error) {
      throw new Error('Failed to get user locations: ' + error);
    }
  }

  private calculateDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
    const r = 6371; // km
    const p = Math.PI / 180;

    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2
      + Math.cos(lat1 * p) * Math.cos(lat2 * p) *
      (1 - Math.cos((lng2 - lng1) * p)) / 2;

    return 2 * r * Math.asin(Math.sqrt(a)) * 1000; // meters
  }

  private async checkAccess(uid: string, locationID: string): Promise<void> {
    try {
      const locationDoc = await this.customLocationRef.doc(locationID).ref.get();
      if (!locationDoc.exists) {
        throw new Error('Location not found');
      }
      const owner = locationDoc.data()?.owner;
      if (owner !== uid) {
        throw new Error('Access denied');
      }
    } catch (error) {
      throw new Error('Failed to check access: ' + error);
    }
  }
}

export interface CustomLocationData {
  owner: FieldValue | string;
  location: FieldValue | Location;
  comments: FieldValue | Comment[];
}

export interface Location {
  name: FieldValue | string,
  createdBy: FieldValue | string,
  description: FieldValue | string,
  lng: FieldValue | number,
  lat: FieldValue | number,
  pictures: FieldValue | string[],
  hours: FieldValue | string,
  price: FieldValue | Price | string,
  formattedAddress: FieldValue | string,
}

export interface Comment {
  id: FieldValue | string;
  owner: FieldValue | string;
  content: FieldValue | string;
  dateCreated: FieldValue | string;
}

export enum Price {
  Free = 'free',
  Cheap = 'cheap',
  Affordable = 'affordable',
  Pricey = 'pricey',
  Expensive = 'expensive'
}
