import { Link, useLocation } from 'react-router-dom'
import { getWhatsAppInquiryUrl } from '@/config/institution'

export function MobileQuickDock() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  const handleScrollToCalculator = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault()
      const el = document.getElementById('calculator')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleScrollToIntakes = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault()
      const el = document.getElementById('intakes-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <nav
      aria-label="Mobile Quick Navigation Dock"
      className="mobile-quick-dock"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9960,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1.5px solid #e2e8f0',
        padding: '6px 12px calc(6px + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 1. WhatsApp Admissions Desk */}
      <a
        href={getWhatsAppInquiryUrl('Hello Admissions Desk, I would like to inquire about enrolling in your online programs.')}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          textDecoration: 'none',
          color: '#15803d',
          padding: '4px 10px',
          borderRadius: '10px',
          minWidth: '60px',
          transition: 'transform 0.15s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
        onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
        onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </span>
        <span style={{ fontSize: '0.66rem', fontWeight: 800 }}>WhatsApp</span>
      </a>

      {/* 2. All Programs Catalog */}
      <Link
        to="/courses"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          textDecoration: 'none',
          color: location.pathname === '/courses' && !location.search.includes('IGCSE') ? '#1d4ed8' : '#475569',
          padding: '4px 10px',
          borderRadius: '10px',
          minWidth: '60px',
          transition: 'transform 0.15s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
        onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
        onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: location.pathname === '/courses' && !location.search.includes('IGCSE') ? '#eff6ff' : '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: location.pathname === '/courses' && !location.search.includes('IGCSE') ? '#1d4ed8' : '#64748b',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
        </span>
        <span style={{ fontSize: '0.66rem', fontWeight: 700 }}>Programs</span>
      </Link>

      {/* 3. IGCSE Integrated Hub */}
      <Link
        to="/courses?cat=IGCSE"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          textDecoration: 'none',
          color: location.search.includes('IGCSE') ? '#0284c7' : '#475569',
          padding: '4px 10px',
          borderRadius: '10px',
          minWidth: '60px',
          transition: 'transform 0.15s ease',
          WebkitTapHighlightColor: 'transparent',
          position: 'relative',
        }}
        onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
        onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: location.search.includes('IGCSE') ? '#e0f2fe' : '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
          }}
        >
          🇬🇧
        </span>
        <span style={{ fontSize: '0.66rem', fontWeight: 700 }}>IGCSE Hub</span>
      </Link>

      {/* 4. Upcoming Intakes */}
      <a
        href="#intakes-section"
        onClick={handleScrollToIntakes}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          textDecoration: 'none',
          color: '#b45309',
          padding: '4px 10px',
          borderRadius: '10px',
          minWidth: '60px',
          transition: 'transform 0.15s ease',
          WebkitTapHighlightColor: 'transparent',
          position: 'relative',
        }}
        onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
        onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 6px #ef4444',
              animation: 'pulse 1.5s infinite',
            }}
          />
        </span>
        <span style={{ fontSize: '0.66rem', fontWeight: 800 }}>Intakes</span>
      </a>

      {/* 5. Fees & Tuition */}
      <a
        href="#calculator"
        onClick={handleScrollToCalculator}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          textDecoration: 'none',
          color: '#475569',
          padding: '4px 10px',
          borderRadius: '10px',
          minWidth: '60px',
          transition: 'transform 0.15s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
        onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
        onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="16" y1="14" x2="16" y2="18" />
            <path d="M16 10h.01" />
            <path d="M12 10h.01" />
            <path d="M8 10h.01" />
            <path d="M12 14h.01" />
            <path d="M8 14h.01" />
            <path d="M12 18h.01" />
            <path d="M8 18h.01" />
          </svg>
        </span>
        <span style={{ fontSize: '0.66rem', fontWeight: 700 }}>Fees</span>
      </a>
    </nav>
  )
}
