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
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', paddingBottom: '5rem' }}>
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
            <img src="/logo.png" alt="Éclat Institute Logo" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #d4af37' }} />
            <div>
              <strong style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>Éclat Institute</strong> • 100% Online Tech & Languages Institute
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>🏢 Paybill: <strong style={{ color: 'var(--color-primary)' }}>247247</strong></span>
            <span>📞 Support: <strong style={{ color: 'var(--color-text)' }}>+254 740 027 346</strong></span>
            <span>✉️ <a href="mailto:admissions@eclat.institute" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>admissions@eclat.institute</a></span>
          </div>
        </footer>
      </main>
    </div>
  )
}
