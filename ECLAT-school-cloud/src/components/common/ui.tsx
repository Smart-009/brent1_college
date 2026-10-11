import React from 'react'
import { XIcon } from './Icons'

export const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
}

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  fontSize: '0.88rem',
  boxSizing: 'border-box',
}

export const th: React.CSSProperties = { padding: '0.85rem 1rem', fontWeight: 600 }
export const td: React.CSSProperties = { padding: '0.85rem 1rem' }

export const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  padding: '0.6rem 1rem',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
}

export const btnSecondary: React.CSSProperties = {
  ...btnPrimary,
  backgroundColor: '#ffffff',
  color: '#475569',
  border: '1px solid #cbd5e1',
}

export const PageHeader: React.FC<{ title: string; subtitle: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h1>
      <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>{subtitle}</p>
    </div>
    {actions && <div style={{ display: 'flex', gap: '0.75rem' }}>{actions}</div>}
  </div>
)

export const KpiCard: React.FC<{ label: string; value: React.ReactNode; hint?: string; color?: string }> = ({ label, value, hint, color = '#0f172a' }) => (
  <div style={{ ...card, padding: '1.25rem' }}>
    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color, marginTop: '0.35rem' }}>{value}</div>
    {hint && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{hint}</div>}
  </div>
)

export const KpiGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>{children}</div>
)

export const Badge: React.FC<{ bg: string; fg: string; children: React.ReactNode }> = ({ bg, fg, children }) => (
  <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: bg, color: fg, whiteSpace: 'nowrap' }}>
    {children}
  </span>
)

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{label}</label>
    {children}
  </div>
)

export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; width?: number }> = ({ title, onClose, children, width = 520 }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(3px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}
  >
    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.75rem', width: '100%', maxWidth: `${width}px`, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <XIcon size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
)

export const nowStamp = () =>
  new Date().toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
