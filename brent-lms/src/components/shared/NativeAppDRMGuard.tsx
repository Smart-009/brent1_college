import { Link } from 'react-router-dom'
import { OFFICIAL_APK_URL, LOCAL_APK_URL, OFFICIAL_DESKTOP_URL, LOCAL_DESKTOP_URL } from '@/utils/platform'

interface NativeAppDRMGuardProps {
  title?: string
  description?: string
}

export function NativeAppDRMGuard({
  title = 'Hardware DRM Protected Classroom & Portals',
  description = 'To protect academic intellectual property, student examinations, and video lecture materials against unauthorized screen recording or piracy, student learning and student portals are strictly accessible through the Official Éclat Native Applications.',
}: NativeAppDRMGuardProps) {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 60%, #1e293b 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '580px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 5vw, 2.5rem)',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 175, 55, 0.12)',
        }}
      >
        {/* Shield & Badge */}
        <div style={{ display: 'inline-flex', position: 'relative', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              border: '2px solid #d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(212, 175, 55, 0.3)',
            }}
          >
            <img
              src="/logo.png"
              alt="Éclat Crest"
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'contain' }}
            />
          </div>
          <span
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              fontSize: '1.4rem',
              background: '#090d16',
              borderRadius: '50%',
              padding: '2px',
              border: '1px solid #d4af37',
            }}
          >
            🛡️
          </span>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#d4af37',
              textTransform: 'uppercase',
              background: 'rgba(212, 175, 55, 0.12)',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
            }}
          >
            ANTI-SCREENSHOT HARDWARE DRM
          </span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(1.25rem, 3.5vw, 1.6rem)',
            fontWeight: 900,
            color: '#f8fafc',
            marginTop: '0.75rem',
            marginBottom: '0.75rem',
            fontFamily: 'var(--font-heading, "Cinzel", serif)',
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontSize: '0.9rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
          }}
        >
          {description}
        </p>

        {/* Security Feature Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '0.75rem 0.85rem',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', marginBottom: '2px' }}>
              🔒 OS Flag Secure
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
              Blocks screenshot capture and screen recording software.
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '0.75rem 0.85rem',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4ade80', marginBottom: '2px' }}>
              ⚡ Secure Native Sync
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
              Full access to study notes, assignments, exams, and ledgers.
            </div>
          </div>
        </div>

        {/* App Action Buttons (Android & Desktop Laptop) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Android App Button */}
          <a
            href={LOCAL_APK_URL}
            download="eclat-institute.apk"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '0.85rem 1.4rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🤖</span>
            <span>Download Official Android App (.APK)</span>
          </a>

          {/* Laptop / Desktop App Button */}
          <a
            href={LOCAL_DESKTOP_URL}
            download="Eclat-Institute-Setup.exe"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '0.85rem 1.4rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>💻</span>
            <span>Download Desktop Laptop App (Windows / Mac)</span>
          </a>

          {/* GitHub Mirrors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <a
              href={OFFICIAL_APK_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontWeight: 700,
                fontSize: '0.78rem',
                textDecoration: 'none',
              }}
            >
              <span>🔗</span>
              <span>Android Mirror</span>
            </a>
            <a
              href={OFFICIAL_DESKTOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontWeight: 700,
                fontSize: '0.78rem',
                textDecoration: 'none',
              }}
            >
              <span>🔗</span>
              <span>Desktop Mirror</span>
            </a>
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/courses"
              style={{
                color: '#93c5fd',
                fontSize: '0.82rem',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              ← Explore Course Catalog
            </Link>
            <span style={{ color: '#475569' }}>•</span>
            <Link
              to="/login?role=admin"
              style={{
                color: '#cbd5e1',
                fontSize: '0.82rem',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              🏛️ Staff Terminal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

