import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showInstallGuide, setShowInstallGuide] = useState(false)

  useEffect(() => {
    // Check if already installed / running in native app or standalone
    const isCapacitor =
      typeof window !== 'undefined' &&
      (Boolean((window as any).Capacitor?.isNativePlatform?.()) ||
       (window as any).Capacitor?.getPlatform?.() === 'android' ||
       (window as any).Capacitor?.getPlatform?.() === 'ios' ||
       window.location.protocol === 'capacitor:' ||
       window.location.protocol === 'ionic:')

    const isStandalone =
      isCapacitor ||
      (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)')?.matches) ||
      (typeof window !== 'undefined' && (window.navigator as unknown as { standalone?: boolean })?.standalone === true) ||
      (typeof document !== 'undefined' && typeof document.referrer === 'string' && document.referrer.includes('android-app://')) ||
      false

    setIsInstalled(isStandalone)

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setIsInstalled(true)
          setIsInstallable(false)
          setDeferredPrompt(null)
          return true
        }
      } catch (err) {
        console.warn('Install prompt error:', err)
      }
    } else {
      // Open manual Chrome/Safari installation guide modal
      setShowInstallGuide(true)
    }
    return false
  }

  return {
    isInstallable,
    isInstalled,
    isIOS,
    showInstallGuide,
    setShowInstallGuide,
    promptInstall,
  }
}
