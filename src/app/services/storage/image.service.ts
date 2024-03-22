import { Injectable } from '@angular/core';
import {getDownloadURL, getStorage, ref, Storage, uploadBytes} from '@angular/fire/storage'
import { from, Observable, scheduled, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private storage: Storage) { }

  uploadProfileImage(image: File, uid: string): Observable<string> {
    const imageLocation = 'images/profile/' + uid;
    const storageRef = ref(this.storage, imageLocation);
    const imageRef =  from(uploadBytes(storageRef, image));
    return imageRef.pipe(
      switchMap((result) => getDownloadURL(result.ref))
    );
  }

  async downloadProfileImage(uid: string): Promise<string>{
    const storage = getStorage();
    const pathRef = ref(storage, 'images/profile/' + uid);
    return getDownloadURL(pathRef).then((url) => {
      return url;
    }).catch((error) => {
      return "";
    })
  }
}
