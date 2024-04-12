import { Injectable } from '@angular/core';
import { getDownloadURL, getStorage, ref, Storage, uploadBytes } from '@angular/fire/storage'
import { catchError, defer, from, Observable, of, scheduled, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private storage: Storage) { }

  uploadProfileImage(image: File, uid: string): Observable<string> {
    return defer(() => {
      const imageLocation = 'images/profile/' + uid;
      const storageRef = ref(this.storage, imageLocation);
      return from(uploadBytes(storageRef, image)).pipe(
        switchMap(imageRef => {
          return from(getDownloadURL(imageRef.ref));
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to upload profile image: ' + error;
          });
        })
      );
    });
  }

  downloadProfileImage(uid: string): Observable<string> {
    return defer(() => {
      const storage = getStorage();
      const pathRef = ref(storage, 'images/profile/' + uid);
      return from(getDownloadURL(pathRef)).pipe(
        switchMap(url => {
          return of(url);
        }),
        catchError(error => {
          return throwError(() => {
            'Failed to download profile image: ' + error;
          });
        })
      )
    });
  }
}
