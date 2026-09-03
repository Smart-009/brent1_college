import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { PWAInstallBanner } from '@/components/shared/PWAInstallBanner'
import { OfflineIndicator } from '@/components/shared/OfflineIndicator'
import { DesktopCommandPalette } from '@/components/shared/DesktopCommandPalette'
import { ClassBellReminderModal } from '@/components/shared/ClassBellReminderModal'
import { MobileAppBottomNav } from './MobileAppBottomNav'
import { INSTITUTION_CONFIG } from '@/config/institution'

export function LayoutShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <OfflineIndicator />
      <PWAInstallBanner />
      <DesktopCommandPalette />
      <ClassBellReminderModal />
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileAppBottomNav />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', paddingBottom: '5rem' }}>
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <footer
          className="no-print"
          style={{
            marginTop: '3rem',
            padding: '1.25rem 2rem',
            background: 'var(--color-bg-secondary)',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img src="/logo.png" alt={`${INSTITUTION_CONFIG.name} Logo`} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #d4af37' }} />
            <div>
              <strong style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>{INSTITUTION_CONFIG.name}</strong> • {INSTITUTION_CONFIG.tagline}
            </div>
          </div>
          <div>
            <span>© {new Date().getFullYear()} {INSTITUTION_CONFIG.name}. All rights reserved.</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
