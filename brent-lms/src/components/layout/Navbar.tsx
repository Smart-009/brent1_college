import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/lib/database.types'
import { RoleBadge } from '@/components/ui/Badge'
import { RoleSwitcher } from '@/components/shared/RoleSwitcher'
import { dispatchSchoolBellAlert } from '@/components/shared/ClassBellReminderModal'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { formatDateTime } from '@/lib/utils'

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { isInstalled, promptInstall } = usePWAInstall()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)

  useEffect(() => {
    if (!profile?.id) return

    // Fetch notifications
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setNotifications(data || []))

    // Realtime subscription
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = async () => {
    if (!profile?.id) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <nav className="navbar">
      <button className="navbar-menu-btn" onClick={onToggleSidebar} aria-label="Toggle Navigation">
        ☰
      </button>

      <Link to="/" className="navbar-brand">
        <img src="/logo.png" alt="Éclat Institute" className="navbar-logo" style={{ border: '2px solid #d4af37', borderRadius: '50%' }} />
        <div>
          <div className="navbar-school-name" style={{ fontFamily: 'var(--font-heading)', color: '#d4af37', letterSpacing: '0.04em', fontWeight: 800 }}>ÉCLAT INSTITUTE</div>
          <span className="navbar-tagline" style={{ color: '#cbd5e1', letterSpacing: '0.08em', fontSize: '0.65rem' }}>Shaping Minds, Inspiring Success</span>
        </div>
      </Link>

      <div className="navbar-spacer" />

      <div className="navbar-actions">
        {/* Live School Bell Alert Button */}
        <button
          type="button"
          onClick={() => dispatchSchoolBellAlert()}
          className="btn btn-sm"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '0.78rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
          }}
          title="School Bell & Live Class Schedule Alarm"
        >
          <span>🔔</span>
          <span className="hide-on-mobile">School Bell</span>
        </button>

        {/* PWA Install Button in Header */}
        {!isInstalled && (
          <button
            type="button"
            className="btn btn-sm hide-mobile"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
            onClick={promptInstall}
            title="Install Eclat Institute Web App on Chrome"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Install App</span>
          </button>
        )}

        {/* Role Simulator Switcher */}
        <RoleSwitcher />

        {profile && (
          <>
            {/* Notification Bell */}
            <div className="notif-bell-wrapper">
              <button
                className="notif-bell-btn"
                onClick={() => {
                  setShowNotifs(!showNotifs)
                  if (!showNotifs && unreadCount > 0) markAllAsRead()
                }}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {showNotifs && (
                <div className="notif-dropdown">
                  <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 'var(--text-sm)' }}>Notifications</strong>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="btn btn-xs btn-ghost text-xs">
                        Mark read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-muted)', fontSize: 'var(--text-xs)' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notif-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => {
                          if (n.link) navigate(n.link)
                          setShowNotifs(false)
                        }}
                      >
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">{formatDateTime(n.created_at)}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User profile badge & logout */}
            <div className="navbar-user">
              <div className="avatar">{profile.full_name[0]?.toUpperCase()}</div>
              <div className="navbar-user-name hide-mobile">
                <div>{profile.full_name}</div>
                <RoleBadge role={profile.role} />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm"
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                flexShrink: 0,
                fontSize: '0.8rem',
              }}
              onClick={() => signOut().then(() => navigate('/login'))}
              title="Sign Out of Eclat Institute Portal"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
