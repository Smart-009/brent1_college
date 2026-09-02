export const enableScreenSecurity = async () => {
  try {
    if (typeof window !== 'undefined' && (window as any).AndroidSecurity?.enableProtection) {
      (window as any).AndroidSecurity.enableProtection();
    }
  } catch (e) {
    // Web fallback
  }
};

export const disableScreenSecurity = async () => {
  try {
    if (typeof window !== 'undefined' && (window as any).AndroidSecurity?.disableProtection) {
      (window as any).AndroidSecurity.disableProtection();
    }
  } catch (e) {
    // Web fallback
  }
};
