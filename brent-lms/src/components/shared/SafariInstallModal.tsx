import React from 'react'

interface SafariInstallModalProps {
  isOpen: boolean
  onClose: () => void
  isIOS: boolean
}

export function SafariInstallModal({ isOpen, onClose, isIOS }: SafariInstallModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modal-content modal-md"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0f172a',
          color: '#f8fafc',
          borderRadius: '20px',
          border: '1px solid #334155',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          padding: '1.75rem',
          maxWidth: '460px',
          width: '100%',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <img
            src="/logo.png"
            alt="Eclat Institute"
            style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #2563eb' }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>
              Install Eclat Institute App
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              {isIOS ? 'Download for Apple iPhone / iPad Safari' : 'Download for Web Browser'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#1e293b',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            ✕
          </button>
        </div>

        {/* Step-by-Step Instructions for Safari iOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          {/* Step 1 */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              border: '1px solid #334155',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
                fontWeight: 900,
              }}
            >
              1
            </div>
            <div style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
              Tap the <strong>Share icon</strong> (
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 5px', background: '#334155', borderRadius: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </span>
              ) in Safari’s bottom toolbar.
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              border: '1px solid #334155',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
                fontWeight: 900,
              }}
            >
              2
            </div>
            <div style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
              Scroll down and tap <strong>"Add to Home Screen"</strong> (
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 5px', background: '#334155', borderRadius: '4px', fontWeight: 800 }}>
                ➕
              </span>
              ).
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              border: '1px solid #334155',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#22c55e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
                fontWeight: 900,
              }}
            >
              3
            </div>
            <div style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
              Tap <strong>"Add"</strong> in the top right corner. The Eclat Institute app will appear on your Home Screen!
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div
          style={{
            background: 'rgba(37, 99, 235, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '10px',
            padding: '0.75rem 0.85rem',
            fontSize: '0.78rem',
            color: '#93c5fd',
            marginBottom: '1.25rem',
          }}
        >
          ✓ Fullscreen experience with zero browser address bar<br />
          ✓ Offline timetable & fee calculator access<br />
          ✓ 1-Tap instant access from your phone home screen
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Got It, Done!
        </button>
      </div>
    </div>
  )
}
