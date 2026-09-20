import { Link } from 'react-router-dom'
import { OFFICIAL_APK_URL, OFFICIAL_APKPURE_URL, LOCAL_DESKTOP_URL } from '@/utils/platform'
import { ShieldCheckIcon, LockIcon, LaptopIcon, GlobeIcon, BuildingIcon, PhoneIcon } from '@/components/icons/AppIcons'

interface NativeAppDRMGuardProps {
  title?: string
  description?: string
  onContinueInWeb?: () => void
}

export function NativeAppDRMGuard({
  title = 'Hardware DRM Protected Classroom & Portals',
  description = 'To protect academic intellectual property, student examinations, and video lecture materials against unauthorized screen recording or piracy, student learning and student portals are strictly accessible through the Official Éclat Native Applications.',
  onContinueInWeb,
}: NativeAppDRMGuardProps) {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '580px',
          width: '100%',
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 5vw, 2.5rem)',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Shield & Badge */}
        <div style={{ display: 'inline-flex', position: 'relative', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#eff6ff',
              border: '2px solid #1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(29, 78, 216, 0.15)',
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
              background: '#ffffff',
              borderRadius: '50%',
              padding: '4px',
              border: '1.5px solid #1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheckIcon size={16} color="#1d4ed8" />
          </span>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#1e3a8a',
              textTransform: 'uppercase',
              background: '#eff6ff',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #bfdbfe',
            }}
          >
            ANTI-SCREENSHOT HARDWARE DRM
          </span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(1.25rem, 3.5vw, 1.6rem)',
            fontWeight: 900,
            color: '#0f172a',
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
            color: '#475569',
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
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem 0.85rem',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <LockIcon size={14} color="#1d4ed8" />
              <span>OS Flag Secure</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
              Blocks screenshot capture and screen recording software.
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem 0.85rem',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheckIcon size={14} color="#15803d" />
              <span>Secure Native Sync</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
              Full access to study notes, assignments, exams, and ledgers.
            </div>
          </div>
        </div>

        {/* App Action Buttons (Android & Desktop Laptop) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* APKPure Store Verified Install Button */}
          <a
            href={OFFICIAL_APKPURE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '0.9rem 1.4rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.96rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
              transition: 'all 0.2s',
            }}
          >
            <ShieldCheckIcon size={18} color="#ffffff" />
            <span>Install via APKPure Store (Official)</span>
          </a>

          {/* Android Direct APK Button */}
          <a
            href={OFFICIAL_APK_URL}
            download="eclat-institute.apk"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '0.75rem 1.4rem',
              borderRadius: '14px',
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <PhoneIcon size={16} color="#475569" />
            <span>Direct Standalone .APK Download</span>
          </a>

          {/* Laptop / Desktop App Button */}
          <a
            href={LOCAL_DESKTOP_URL}
            download="eclat-institute-setup.exe"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '0.9rem 1.4rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.96rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(29, 78, 216, 0.25)',
              transition: 'all 0.2s',
            }}
          >
            <LaptopIcon size={18} color="#ffffff" />
            <span>Download Desktop Laptop App (Windows / Mac)</span>
          </a>

          {onContinueInWeb && (
            <button
              type="button"
              onClick={onContinueInWeb}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.85rem 1.4rem',
                borderRadius: '14px',
                background: '#f1f5f9',
                color: '#1e293b',
                border: '1.5px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <GlobeIcon size={16} color="#475569" />
              <span>Open Online Classroom in Web Browser</span>
            </button>
          )}

          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/courses"
              style={{
                color: '#1d4ed8',
                fontSize: '0.82rem',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              ← Explore Course Catalog
            </Link>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <Link
              to="/login?role=admin"
              style={{
                color: '#475569',
                fontSize: '0.82rem',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <BuildingIcon size={14} color="#64748b" />
              <span>Staff Terminal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

