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
    /Electron/i.test(navigator.userAgent)
  )
}

export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false

  const w = window as any

  // 1. Electron Desktop Native Laptop App (Windows / Mac)
  if (isElectronApp()) return true

  // 2. Capacitor Native Mobile Platform check (Android / iOS)
  const isCapacitor = Boolean(
    w.Capacitor?.isNativePlatform?.() ||
    w.Capacitor?.getPlatform?.() === 'android' ||
    w.Capacitor?.getPlatform?.() === 'ios' ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'ionic:' ||
    /Capacitor/i.test(navigator.userAgent) ||
    Boolean(w.AndroidSecurity)
  )

  // 3. Android Intent / Native Wrapper
  const isAndroidAppWrapper =
    typeof document !== 'undefined' &&
    typeof document.referrer === 'string' &&
    document.referrer.includes('android-app://')

  return isCapacitor || isAndroidAppWrapper
}

export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /android/i.test(navigator.userAgent)
}

export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export const OFFICIAL_APK_URL = '/downloads/eclat-institute.apk'
export const LOCAL_APK_URL = '/eclat-institute.apk'
export const OFFICIAL_DESKTOP_URL = '/downloads/eclat-institute-setup.exe'
export const LOCAL_DESKTOP_URL = '/eclat-institute-setup.exe'

