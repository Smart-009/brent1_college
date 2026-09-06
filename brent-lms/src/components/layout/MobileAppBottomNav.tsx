import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { isNativeApp } from '@/utils/platform'
import { schoolStore } from '@/lib/schoolData'
import { checkForOTAUpdates } from '@/lib/otaUpdater'

export function MobileAppBottomNav() {
  const isNative = isNativeApp()
  const location = useLocation()
  const { profile } = useAuthContext()
  const [isSyncing, setIsSyncing] = useState(false)

  const currentPath = location.pathname

  // Hide bottom navigation on desktop web or in the video player learning environment
  if (!isNative || currentPath.includes('/lesson/') || currentPath.startsWith('/student/lesson')) {
    return null
  }

  const handleManualSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      await Promise.allSettled([
        schoolStore.syncWithCloud(true),
        checkForOTAUpdates(true),
      ])
      window.dispatchEvent(new CustomEvent('eclat-data-synced'))
      window.dispatchEvent(new Event('storage'))
    } finally {
      setTimeout(() => setIsSyncing(false), 800)
    }
  }

  const getHomeLink = () => {
    if (!profile) return '/'
    if (profile.role === 'admin') return '/admin'
    if (profile.role === 'teacher') return '/teacher'
    if (profile.role === 'bursar') return '/bursar'
    if (profile.role === 'parent') return '/parent'
    return '/student'
  }

  const getCoursesLink = () => {
    if (!profile) return '/courses'
    if (profile.role === 'student') return '/student/courses'
    if (profile.role === 'teacher') return '/teacher/courses'
    if (profile.role === 'admin') return '/admin/classes'
    return '/courses'
  }

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
  const isCoursesActive = currentPath === '/courses' || currentPath === '/student/courses' || currentPath === '/teacher/courses' || currentPath === '/admin/classes'
  const isHomeActive = currentPath === '/' || (profile && currentPath === getHomeLink())

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
        to={getHomeLink()}
        onClick={() => {
          if (currentPath === '/' || (profile && currentPath === getHomeLink())) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
        className={`mobile-nav-item ${isHomeActive ? 'active' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          textDecoration: 'none',
          color: isHomeActive ? '#60a5fa' : '#94a3b8',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: isHomeActive ? 800 : 500,
          gap: '2px',
          userSelect: 'none',
          transform: isHomeActive ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🏠</span>
        <span>{profile ? 'Dashboard' : 'Home'}</span>
        {isHomeActive && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
        )}
      </Link>

      {/* Courses Tab */}
      <Link
        to={getCoursesLink()}
        onClick={() => {
          if (currentPath === getCoursesLink()) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
        className={`mobile-nav-item ${isCoursesActive ? 'active' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          textDecoration: 'none',
          color: isCoursesActive ? '#60a5fa' : '#94a3b8',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: isCoursesActive ? 800 : 500,
          gap: '2px',
          userSelect: 'none',
          transform: isCoursesActive ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>📚</span>
        <span>{profile?.role === 'student' ? 'My Units' : 'Courses'}</span>
        {isCoursesActive && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
        )}
      </Link>

      {/* E-Library Tab */}
      <Link
        to="/library"
        className={`mobile-nav-item ${currentPath === '/library' ? 'active' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          textDecoration: 'none',
          color: currentPath === '/library' ? '#60a5fa' : '#94a3b8',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: currentPath === '/library' ? 800 : 500,
          gap: '2px',
          userSelect: 'none',
          transform: currentPath === '/library' ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>📖</span>
        <span>E-Library</span>
        {currentPath === '/library' && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
        )}
      </Link>

      {/* Live Cloud OTA Sync Button */}
      <button
        type="button"
        onClick={handleManualSync}
        className="mobile-nav-item"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          background: 'none',
          border: 'none',
          color: isSyncing ? '#38bdf8' : '#94a3b8',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: 600,
          gap: '2px',
          cursor: 'pointer',
          padding: 0,
        }}
        title="Sync Cloud Data & Live Updates"
      >
        <span style={{ fontSize: '1.25rem', lineHeight: 1, display: 'inline-block', animation: isSyncing ? 'spin 0.8s linear infinite' : 'none' }}>
          🔄
        </span>
        <span>{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
      </button>

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
