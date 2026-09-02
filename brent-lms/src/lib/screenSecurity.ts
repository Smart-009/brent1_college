import { registerPlugin } from '@capacitor/core';

interface ScreenSecurityPlugin {
  enable(): Promise<void>;
  disable(): Promise<void>;
}

const ScreenSecurity = registerPlugin<ScreenSecurityPlugin>('ScreenSecurity');

export const enableScreenSecurity = async () => {
  try {
    await ScreenSecurity.enable();
  } catch (e) {
    // Web fallback or not on native
  }
};

export const disableScreenSecurity = async () => {
  try {
    await ScreenSecurity.disable();
  } catch (e) {
    // Web fallback or not on native
  }
};
