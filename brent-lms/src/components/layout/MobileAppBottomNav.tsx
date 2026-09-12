import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { isNativeApp } from '@/utils/platform'
import { schoolStore } from '@/lib/schoolData'
import { checkForOTAUpdates } from '@/lib/otaUpdater'
import {
  HomeIcon,
  BookOpenIcon,
  LibraryIcon,
  RefreshCwIcon,
  GraduationCapIcon,
  LockIcon,
} from '@/components/icons/AppIcons'

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
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 9999,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
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
          color: isHomeActive ? '#1d4ed8' : '#64748b',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: isHomeActive ? 800 : 600,
          gap: '3px',
          userSelect: 'none',
          transform: isHomeActive ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <HomeIcon size={20} color={isHomeActive ? '#1d4ed8' : '#64748b'} strokeWidth={isHomeActive ? 2.5 : 2} />
        <span>{profile ? 'Dashboard' : 'Home'}</span>
        {isHomeActive && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1d4ed8', boxShadow: '0 0 6px rgba(29, 78, 216, 0.4)' }} />
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
          color: isCoursesActive ? '#1d4ed8' : '#64748b',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: isCoursesActive ? 800 : 600,
          gap: '3px',
          userSelect: 'none',
          transform: isCoursesActive ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <BookOpenIcon size={20} color={isCoursesActive ? '#1d4ed8' : '#64748b'} strokeWidth={isCoursesActive ? 2.5 : 2} />
        <span>{profile?.role === 'student' ? 'My Units' : 'Courses'}</span>
        {isCoursesActive && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1d4ed8', boxShadow: '0 0 6px rgba(29, 78, 216, 0.4)' }} />
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
          color: currentPath === '/library' ? '#1d4ed8' : '#64748b',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: currentPath === '/library' ? 800 : 600,
          gap: '3px',
          userSelect: 'none',
          transform: currentPath === '/library' ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <LibraryIcon size={20} color={currentPath === '/library' ? '#1d4ed8' : '#64748b'} strokeWidth={currentPath === '/library' ? 2.5 : 2} />
        <span>E-Library</span>
        {currentPath === '/library' && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1d4ed8', boxShadow: '0 0 6px rgba(29, 78, 216, 0.4)' }} />
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
          color: isSyncing ? '#0284c7' : '#64748b',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: 600,
          gap: '3px',
          cursor: 'pointer',
          padding: 0,
        }}
        title="Sync Cloud Data & Live Updates"
      >
        <span style={{ display: 'inline-block', animation: isSyncing ? 'spin 0.8s linear infinite' : 'none' }}>
          <RefreshCwIcon size={20} color={isSyncing ? '#0284c7' : '#64748b'} />
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
          color: isPortalActive ? '#1d4ed8' : '#64748b',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: isPortalActive ? 800 : 600,
          gap: '3px',
          userSelect: 'none',
          transform: isPortalActive ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {profile ? (
          <GraduationCapIcon size={20} color={isPortalActive ? '#1d4ed8' : '#64748b'} strokeWidth={isPortalActive ? 2.5 : 2} />
        ) : (
          <LockIcon size={20} color={isPortalActive ? '#1d4ed8' : '#64748b'} strokeWidth={isPortalActive ? 2.5 : 2} />
        )}
        <span>{portalLabel}</span>
        {isPortalActive && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1d4ed8', boxShadow: '0 0 6px rgba(29, 78, 216, 0.4)' }} />
        )}
      </Link>
    </nav>
  )
}
