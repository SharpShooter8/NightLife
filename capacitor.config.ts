import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nightlife.app',
  appName: 'Night-Life',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
