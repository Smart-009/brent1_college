/**
 * Over-The-Air (OTA) Live Update Engine for Éclat Institute
 * Automatically pulls the latest code and assets from the cloud
 * without requiring users to manually reinstall or download APKs.
 */

const LOCAL_BUILD_TIME_KEY = 'eclat_ota_build_timestamp'
let isCheckingUpdate = false

export function getCurrentRuntimeBuildTimestamp(): number {
  try {
    if (typeof __APP_BUILD_TIMESTAMP__ !== 'undefined' && typeof __APP_BUILD_TIMESTAMP__ === 'number') {
      return __APP_BUILD_TIMESTAMP__
    }
  } catch {}
  return 0
}

export async function clearAllWebCaches(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    if ('caches' in window) {
      const cacheKeys = await caches.keys()
      await Promise.all(cacheKeys.map((k) => caches.delete(k)))
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((r) => r.unregister()))
    }
  } catch (e) {
    console.debug('[OTA] Cache clearing notice:', e)
  }
}

export async function checkForOTAUpdates(force: boolean = false): Promise<boolean> {
  if (isCheckingUpdate || typeof window === 'undefined' || !navigator.onLine) {
    return false
  }

  isCheckingUpdate = true
  try {
    const isNative = typeof window !== 'undefined' && ((window as any).Capacitor?.isNativePlatform?.() || window.location.origin.includes('localhost'))
    const versionUrl = isNative
      ? 'https://www.eclat.institute/version.json?_nocache=' + Date.now()
      : '/version.json?_nocache=' + Date.now()

    const response = await fetch(versionUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      cache: 'no-store',
    })

    if (!response.ok) return false

    const remoteManifest = await response.json()
    const remoteBuildTime = Number(remoteManifest?.buildTime) || 0
    if (!remoteBuildTime) return false

    const runtimeBuildTime = getCurrentRuntimeBuildTimestamp()
    const storedBuildTime = Number(localStorage.getItem(LOCAL_BUILD_TIME_KEY)) || 0

    const isOutdated =
      (runtimeBuildTime > 0 && remoteBuildTime > runtimeBuildTime) ||
      (storedBuildTime > 0 && remoteBuildTime > storedBuildTime) ||
      (force && remoteBuildTime !== runtimeBuildTime && remoteBuildTime !== storedBuildTime)

    if (isOutdated) {
      console.log(
        `[OTA Update] New cloud version detected: ${remoteBuildTime} (current: ${runtimeBuildTime || storedBuildTime}). Updating live...`
      )
      localStorage.setItem(LOCAL_BUILD_TIME_KEY, remoteBuildTime.toString())

      await clearAllWebCaches()

      // Perform a clean cache-busting reload to load fresh chunks immediately
      setTimeout(() => {
        const url = new URL(window.location.href)
        url.searchParams.set('_ota', remoteBuildTime.toString())
        window.location.replace(url.toString())
      }, 300)
      return true
    } else {
      // Keep stored timestamp in sync
      if (remoteBuildTime > storedBuildTime) {
        localStorage.setItem(LOCAL_BUILD_TIME_KEY, remoteBuildTime.toString())
      }
    }
  } catch (err) {
    console.debug('[OTA Update] Silent check completed:', err)
  } finally {
    isCheckingUpdate = false
  }
  return false
}

export function initOTAUpdater(): () => void {
  if (typeof window === 'undefined') return () => {}

  // 1. Check immediately on launch
  checkForOTAUpdates().catch(() => {})

  // 2. Check when app returns to foreground / wake
  const handleVisibility = () => {
    if (!document.hidden) {
      checkForOTAUpdates().catch(() => {})
    }
  }

  // 3. Check when network reconnects
  const handleOnline = () => {
    checkForOTAUpdates().catch(() => {})
  }

  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('focus', handleVisibility)
  window.addEventListener('online', handleOnline)

  // 4. Background heartbeat check every 20 seconds
  const intervalTimer = setInterval(() => {
    checkForOTAUpdates().catch(() => {})
  }, 20000)

  return () => {
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('focus', handleVisibility)
    window.removeEventListener('online', handleOnline)
    clearInterval(intervalTimer)
  }
}
