import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { isNativeApp } from '@/utils/platform'
import { schoolStore } from '@/lib/schoolData'
import { checkForOTAUpdates } from '@/lib/otaUpdater'
import {
  HomeIcon,
  BookOpenIcon,
  LibraryIcon,
  GraduationCapIcon,
  LockIcon,
  ChartBarIcon,
} from '@/components/icons/AppIcons'

export function MobileAppBottomNav() {
  const isNative = isNativeApp()
  const location = useLocation()
  const { profile } = useAuthContext()

  const currentPath = location.pathname

  // ── Automatic sync on mount + window focus (no manual button needed) ──────
  useEffect(() => {
    if (!isNative) return
    const runSync = async () => {
      try {
        await Promise.allSettled([
          schoolStore.syncWithCloud(true),
          checkForOTAUpdates(true),
        ])
        window.dispatchEvent(new CustomEvent('eclat-data-synced'))
        window.dispatchEvent(new Event('storage'))
      } catch { /* silent */ }
    }
    runSync()
    window.addEventListener('focus', runSync)
    return () => window.removeEventListener('focus', runSync)
  }, [isNative])

  // Hide on desktop / during lesson player
  if (!isNative || currentPath.includes('/lesson/') || currentPath.startsWith('/student/lesson')) {
    return null
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

  const getProgressLink = () => {
    if (!profile) return '/courses'
    if (profile.role === 'student') return '/student/progress'
    if (profile.role === 'teacher') return '/teacher'
    if (profile.role === 'admin') return '/admin'
    return '/student/progress'
  }

  const getAccountLink = () => {
    if (!profile) return '/login'
    if (profile.role === 'admin') return '/admin'
    if (profile.role === 'teacher') return '/teacher'
    return '/student'
  }

  const isHomeActive = currentPath === '/' || currentPath === getHomeLink()
  const isCoursesActive =
    currentPath === '/courses' ||
    currentPath === '/student/courses' ||
    currentPath === '/teacher/courses' ||
    currentPath === '/admin/classes'
  const isLibraryActive = currentPath === '/library'
  const isProgressActive =
    currentPath.includes('/progress') ||
    currentPath.includes('/grades') ||
    currentPath.includes('/report')
  const isAccountActive =
    currentPath === '/login' ||
    currentPath.includes('/profile') ||
    (!isHomeActive && !isCoursesActive && !isLibraryActive && !isProgressActive &&
      profile && currentPath.startsWith('/' + profile.role))

  const tabStyle = (isActive: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    textDecoration: 'none',
    color: isActive ? '#1d4ed8' : '#64748b',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '0.68rem',
    fontWeight: (isActive ? 800 : 600) as number,
    gap: '3px',
    userSelect: 'none' as const,
    transform: isActive ? 'scale(1.06)' : 'scale(1)',
    padding: '0.3rem 0',
  })

  const dot = (isActive: boolean) =>
    isActive ? (
      <span
        style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#1d4ed8',
          boxShadow: '0 0 6px rgba(29, 78, 216, 0.4)',
        }}
      />
    ) : null

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
      {/* 1. Home / Dashboard */}
      <Link
        to={getHomeLink()}
        onClick={() => { if (isHomeActive) window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        style={tabStyle(isHomeActive)}
      >
        <HomeIcon size={20} color={isHomeActive ? '#1d4ed8' : '#64748b'} strokeWidth={isHomeActive ? 2.5 : 2} />
        <span>{profile ? 'Dashboard' : 'Home'}</span>
        {dot(isHomeActive)}
      </Link>

      {/* 2. Courses / My Units */}
      <Link
        to={getCoursesLink()}
        onClick={() => { if (isCoursesActive) window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        style={tabStyle(isCoursesActive)}
      >
        <BookOpenIcon size={20} color={isCoursesActive ? '#1d4ed8' : '#64748b'} strokeWidth={isCoursesActive ? 2.5 : 2} />
        <span>{profile?.role === 'student' ? 'My Units' : 'Courses'}</span>
        {dot(isCoursesActive)}
      </Link>

      {/* 3. E-Library */}
      <Link
        to="/library"
        style={tabStyle(isLibraryActive)}
      >
        <LibraryIcon size={20} color={isLibraryActive ? '#1d4ed8' : '#64748b'} strokeWidth={isLibraryActive ? 2.5 : 2} />
        <span>E-Library</span>
        {dot(isLibraryActive)}
      </Link>

      {/* 4. My Grades / Progress */}
      <Link
        to={getProgressLink()}
        style={tabStyle(isProgressActive)}
      >
        <ChartBarIcon size={20} color={isProgressActive ? '#1d4ed8' : '#64748b'} strokeWidth={isProgressActive ? 2.5 : 2} />
        <span>{profile ? 'My Grades' : 'Results'}</span>
        {dot(isProgressActive)}
      </Link>

      {/* 5. Account (only shows Sign In when not logged in) */}
      <Link
        to={getAccountLink()}
        style={tabStyle(!!isAccountActive)}
      >
        {profile ? (
          <GraduationCapIcon size={20} color={isAccountActive ? '#1d4ed8' : '#64748b'} strokeWidth={isAccountActive ? 2.5 : 2} />
        ) : (
          <LockIcon size={20} color={isAccountActive ? '#1d4ed8' : '#64748b'} strokeWidth={isAccountActive ? 2.5 : 2} />
        )}
        <span>{profile ? 'Account' : 'Sign In'}</span>
        {dot(!!isAccountActive)}
      </Link>
    </nav>
  )
}
