import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eclat.volt',
  appName: 'VOLT',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allow http connection to backend if running on LAN/IP
  },
  android: {
    backgroundColor: '#0a0e17',
    allowMixedContent: true,
  }
};

export default config;
