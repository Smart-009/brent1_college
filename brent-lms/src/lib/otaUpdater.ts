/**
 * Over-The-Air (OTA) Live Update Engine for Éclat Institute
 * Automatically pulls the latest code and assets from the cloud
 * without requiring users to manually reinstall or download APKs.
 */

const LOCAL_BUILD_TIME_KEY = 'eclat_ota_build_timestamp'
let isCheckingUpdate = false

export async function checkForOTAUpdates(): Promise<boolean> {
  if (isCheckingUpdate || typeof window === 'undefined' || !navigator.onLine) {
    return false
  }

  isCheckingUpdate = true
  try {
    const versionUrl = '/version.json?_nocache=' + Date.now()
    const response = await fetch(versionUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
    })

    if (!response.ok) return false

    const remoteManifest = await response.json()
    const remoteBuildTime = Number(remoteManifest?.buildTime) || 0
    if (!remoteBuildTime) return false

    const storedBuildTime = Number(localStorage.getItem(LOCAL_BUILD_TIME_KEY)) || 0

    if (storedBuildTime === 0) {
      // First run: save current timestamp baseline
      localStorage.setItem(LOCAL_BUILD_TIME_KEY, remoteBuildTime.toString())
      return false
    }

    if (remoteBuildTime > storedBuildTime) {
      console.log('[OTA Update] New cloud version detected:', remoteBuildTime, '(current:', storedBuildTime, '). Applying live update...')
      localStorage.setItem(LOCAL_BUILD_TIME_KEY, remoteBuildTime.toString())

      // Invalidate web cache storage if supported
      if ('caches' in window) {
        try {
          const cacheKeys = await caches.keys()
          await Promise.all(cacheKeys.map((k) => caches.delete(k)))
        } catch {}
      }

      // Hot-reload the app to load new bundles seamlessly
      setTimeout(() => {
        window.location.reload()
      }, 500)
      return true
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

  // 4. Background heartbeat check every 30 seconds
  const intervalTimer = setInterval(() => {
    checkForOTAUpdates().catch(() => {})
  }, 30000)

  return () => {
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('focus', handleVisibility)
    window.removeEventListener('online', handleOnline)
    clearInterval(intervalTimer)
  }
}
