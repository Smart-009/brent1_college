import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export function MobileAppBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuthContext()
  const { isInstalled, promptInstall } = usePWAInstall()

  const currentPath = location.pathname

  const getPortalLink = () => {
    if (!profile) return '/login'
    if (profile.role === 'admin') return '/admin'
    if (profile.role === 'teacher') return '/teacher'
    if (profile.role === 'bursar') return '/bursar'
    if (profile.role === 'parent') return '/parent'
    return '/student'
  }

  const portalLabel = profile ? 'My Portal' : 'Login'
  const isPortalActive = profile ? currentPath.startsWith('/' + profile.role) || currentPath.startsWith('/students') : currentPath === '/login'

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 9999,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Home Tab */}
      <Link
        to="/"
        className={`mobile-nav-item ${currentPath === '/' ? 'active' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          textDecoration: 'none',
          color: currentPath === '/' ? '#60a5fa' : '#94a3b8',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: currentPath === '/' ? 800 : 500,
          gap: '2px',
          userSelect: 'none',
          transform: currentPath === '/' ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🏠</span>
        <span>Home</span>
        {currentPath === '/' && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
        )}
      </Link>

      {/* Courses Tab */}
      <Link
        to="/#courses"
        onClick={(e) => {
          if (currentPath === '/') {
            e.preventDefault()
            const el = document.getElementById('courses')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }
        }}
        className={`mobile-nav-item ${currentPath === '/courses' ? 'active' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          textDecoration: 'none',
          color: currentPath === '/courses' ? '#60a5fa' : '#94a3b8',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: currentPath === '/courses' ? 800 : 500,
          gap: '2px',
          userSelect: 'none',
          transform: currentPath === '/courses' ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>📚</span>
        <span>Courses</span>
        {currentPath === '/courses' && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
        )}
      </Link>

      {/* Fees / M-Pesa Tab */}
      <Link
        to="/fees"
        className={`mobile-nav-item ${currentPath === '/fees' ? 'active' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          textDecoration: 'none',
          color: currentPath === '/fees' ? '#60a5fa' : '#94a3b8',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: currentPath === '/fees' ? 800 : 500,
          gap: '2px',
          userSelect: 'none',
          transform: currentPath === '/fees' ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>💳</span>
        <span>Fees 247247</span>
        {currentPath === '/fees' && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
        )}
      </Link>

      {/* Timetable Tab */}
      <Link
        to="/timetable"
        className={`mobile-nav-item ${currentPath === '/timetable' ? 'active' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          textDecoration: 'none',
          color: currentPath === '/timetable' ? '#60a5fa' : '#94a3b8',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: currentPath === '/timetable' ? 800 : 500,
          gap: '2px',
          userSelect: 'none',
          transform: currentPath === '/timetable' ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>📅</span>
        <span>Timetable</span>
        {currentPath === '/timetable' && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
        )}
      </Link>

      {/* Portal / Account Tab */}
      <Link
        to={getPortalLink()}
        className={`mobile-nav-item ${isPortalActive ? 'active' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          textDecoration: 'none',
          color: isPortalActive ? '#60a5fa' : '#94a3b8',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: isPortalActive ? 800 : 500,
          gap: '2px',
          userSelect: 'none',
          transform: isPortalActive ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{profile ? '🎓' : '🔐'}</span>
        <span>{portalLabel}</span>
        {isPortalActive && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
        )}
      </Link>
    </nav>
  )
}
