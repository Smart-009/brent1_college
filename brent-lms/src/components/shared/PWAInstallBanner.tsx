import React, { useState } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export function PWAInstallBanner() {
  const { isInstalled, isIOS, showInstallGuide, setShowInstallGuide, promptInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('brent_pwa_dismissed') === 'true'
  })

  if (isInstalled || dismissed) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('brent_pwa_dismissed', 'true')
  }

  return (
    <>
      {/* Top Prominent Install Header Banner */}
      <aside aria-label="Install App" className="pwa-banner">
        <div className="pwa-banner-content">
          <div className="pwa-banner-icon">
            <img src="/logo.png" alt="Eclat Institute" width="36" height="36" />
          </div>
          <div className="pwa-banner-text">
            <strong>Install Eclat Institute App on Chrome</strong>
            <span>Get fast offline access, live lesson playback, and instant school notifications.</span>
          </div>
        </div>
        <div className="pwa-banner-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm pwa-install-btn"
            onClick={promptInstall}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Install App
          </button>
          <button
            type="button"
            className="pwa-dismiss-btn"
            onClick={handleDismiss}
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      </aside>

      {/* Chrome / iOS Installation Guide Modal */}
      {showInstallGuide && (
        <div className="modal-overlay" onClick={() => setShowInstallGuide(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="logo-square" style={{ width: '40px', height: '40px' }}>
                  <img src="/logo.png" alt="Eclat Logo" />
                </div>
                <div>
                  <h3 className="modal-title">Install Eclat Institute App</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Install directly via your web browser
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowInstallGuide(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {!isIOS ? (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>💻 / 📱</span> Installing on Google Chrome:
                  </h4>
                  <ol style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                    <li>
                      Look at the <strong>right side of the address bar</strong> in Chrome for the{' '}
                      <strong>Install icon (🖥️ ⬇️)</strong>.
                    </li>
                    <li>
                      Or click the <strong>3 vertical dots (⋮)</strong> in Chrome’s top right corner.
                    </li>
                    <li>
                      Select <strong>"Install Eclat Institute..."</strong> or <strong>"Save and share" → "Install app"</strong>.
                    </li>
                    <li>Click <strong>Install</strong> to launch the dedicated window!</li>
                  </ol>
                </div>
              ) : (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🍏</span> Installing on iPhone / iPad (Safari):
                  </h4>
                  <ol style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                    <li>
                      Tap the <strong>Share button</strong> (square with arrow pointing up) at the bottom of the screen.
                    </li>
                    <li>Scroll down and select <strong>"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong>Add</strong> in the top-right corner.</li>
                  </ol>
                </div>
              )}

              <div
                style={{
                  background: 'var(--color-bg-secondary)',
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                }}
              >
                <strong>⚡ App Features:</strong>
                <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0, color: 'var(--color-text-secondary)' }}>
                  <li>Offline lesson timetable and report card viewing</li>
                  <li>No browser URL bar — feels like a desktop/native app</li>
                  <li>One-click launch from Windows taskbar, Android home screen, or Mac Dock</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowInstallGuide(false)}
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
