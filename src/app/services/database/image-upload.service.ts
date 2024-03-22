import { Injectable } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import {Storage, getDownloadURL, ref, uploadBytes} from '@angular/fire/storage'
import { getStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const storage = getStorage();
    return new Storage(storage);
  }
})
export class ImageUploadService {

  constructor(private storage: Storage) { }

  uploadImage(image: File, path: string): Observable<string>{
    const storageRef = ref(this.storage, path);
    const uploadTask = from(uploadBytes(storageRef, image));
    return uploadTask.pipe(
      switchMap((result) => getDownloadURL(result.ref))
    );
  }
}
