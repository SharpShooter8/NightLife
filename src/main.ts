import { APP_INITIALIZER, enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage'
import { AngularFireModule } from '@angular/fire/compat'
import { HttpClientModule } from '@angular/common/http';
import { initialize } from '@ionic/core';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(provideFirebaseApp(() => initializeApp(environment.firebase))),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideStorage(() => getStorage())),
    importProvidersFrom(AngularFireModule.initializeApp(environment.firebase)), importProvidersFrom(provideFirebaseApp(() => initializeApp({
      "projectId": "night-life-7e16c",
      "appId": "1:554954113971:web:3ead37c406677936e2c1c6",
      "storageBucket": "night-life-7e16c.appspot.com",
      // "": "us-central",
      "apiKey": "AIzaSyBriG8Aeqm_mftxZ4F8cXRovQNKAT8R9Os",
      "authDomain": "night-life-7e16c.firebaseapp.com",
      "messagingSenderId": "554954113971",
      "measurementId": "G-HKZ8BFB43M" }))), importProvidersFrom(provideAuth(() => getAuth())), importProvidersFrom(provideFirestore(() => getFirestore())), importProvidersFrom(provideStorage(() => getStorage())),
  ]
});
