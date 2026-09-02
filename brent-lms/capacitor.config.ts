import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eclatinstitute.lms',
  appName: 'Éclat Institute',
  webDir: 'dist',
  server: {
    url: 'https://eclat.institute',
    cleartext: true,
    androidScheme: 'https',
  },
};

export default config;
