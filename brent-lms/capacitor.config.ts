import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eclatinstitute.lms',
  appName: 'Éclat Institute',
  webDir: 'dist',
  server: {
    url: 'https://www.eclat.institute',
    cleartext: false,
    androidScheme: 'https',
  },
};

export default config;

