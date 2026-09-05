/**
 * Platform Detection Utilities
 * Differentiates between the public web marketing portal and the official native secured applications.
 */

export function isElectronApp(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as any
  return Boolean(
    w.desktopAPI?.isDesktop ||
    w.electronAPI ||
    /Electron/i.test(navigator.userAgent) ||
    w.process?.versions?.electron ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('eclat_platform') === 'desktop')
  )
}

export function isCapacitorApp(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as any
  return Boolean(
    w.Capacitor?.isNativePlatform?.() ||
    w.Capacitor?.getPlatform?.() === 'android' ||
    w.Capacitor?.getPlatform?.() === 'ios' ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'ionic:' ||
    /Capacitor/i.test(navigator.userAgent) ||
    Boolean(w.AndroidSecurity) ||
    (typeof document !== 'undefined' && typeof document.referrer === 'string' && document.referrer.includes('android-app://')) ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('eclat_platform') === 'mobile')
  )
}

export function isNativeApp(): boolean {
  return isElectronApp() || isCapacitorApp()
}

export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /android/i.test(navigator.userAgent)
}

export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export const OFFICIAL_APK_URL = 'https://github.com/Smart-009/brent1_college/releases/download/latest/eclat-institute.apk'
export const LOCAL_APK_URL = '/downloads/eclat-institute.apk'
export const OFFICIAL_DESKTOP_URL = '/downloads/eclat-institute-setup.exe'
export const LOCAL_DESKTOP_URL = '/eclat-institute-setup.exe'

