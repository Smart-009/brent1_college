import React from 'react'
import { ErpSidebar, ActiveTab } from './ErpSidebar'
import { ErpTopHeader } from './ErpTopHeader'

interface ErpLayoutProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  children: React.ReactNode
}

export const ErpLayout: React.FC<ErpLayoutProps> = ({ activeTab, setActiveTab, children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <ErpSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ErpTopHeader />
        <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
