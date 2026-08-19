import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { PWAInstallBanner } from '@/components/shared/PWAInstallBanner'
import { OfflineIndicator } from '@/components/shared/OfflineIndicator'
import { DesktopCommandPalette } from '@/components/shared/DesktopCommandPalette'
import { MobileAppBottomNav } from './MobileAppBottomNav'

export function LayoutShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <OfflineIndicator />
      <PWAInstallBanner />
      <DesktopCommandPalette />
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileAppBottomNav />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <footer
          className="no-print"
          style={{
            marginTop: '3rem',
            padding: '1.5rem 2rem',
            background: 'var(--color-bg-secondary)',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.82rem',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Brent College Logo" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            <div>
              <strong style={{ color: 'var(--color-text)' }}>Brent College Nairobi</strong> • Sahal Tower, 4th Street, Eastleigh
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>🏢 Paybill: <strong style={{ color: 'var(--color-primary)' }}>247247</strong></span>
            <span>📞 Support: <strong style={{ color: 'var(--color-text)' }}>+254 712 345 678</strong></span>
            <span>✉️ <a href="mailto:admissions@brentcollege.ac.ke" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>admissions@brentcollege.ac.ke</a></span>
          </div>
        </footer>
      </main>
    </div>
  )
}
