// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    projectId: "night-life-7e16c",
    appId: "1:554954113971:web:3ead37c406677936e2c1c6",
    storageBucket: "night-life-7e16c.appspot.com",
    apiKey: "AIzaSyBriG8Aeqm_mftxZ4F8cXRovQNKAT8R9Os",
    authDomain: "night-life-7e16c.firebaseapp.com",
    messagingSenderId: "554954113971",
    measurementId: "G-HKZ8BFB43M"
  },
  mapbox: {
    accessToken: "pk.eyJ1IjoiY2hhc2VodWJiZWxsIiwiYSI6ImNsc21lYWdidDBwazkyam10dTRsNDVnOXQifQ.z4twr2mTnJE35TcLqQo0bw",
  },
  foursquare: {
    apiKey: "fsq3Mh3rBe7wCvUgPmOSMyhF41lKgDrklKDPG+AsJloDPeo=",
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
