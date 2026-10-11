import React, { useState } from 'react'
import { useSchoolErp } from '../context/SchoolErpContext'
import { UserRole } from '../types/schoolErp'
import { BuildingIcon, UserIcon, ShieldCheckIcon } from '../components/common/Icons'

export const LoginPortal: React.FC = () => {
  const { activeSchool, setActiveSchool, schools, loginAsRole } = useSchoolErp()
  const [email, setEmail] = useState('principal@school.ac.ke')
  const [password, setPassword] = useState('••••••••')

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Identify role based on email or default to admin
    if (email.includes('bursar')) {
      loginAsRole('bursar')
    } else if (email.includes('teacher')) {
      loginAsRole('teacher')
    } else if (email.includes('student')) {
      loginAsRole('student')
    } else {
      loginAsRole('admin')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Brand Banner */}
        <div
          style={{
            backgroundColor: activeSchool.crestColor || '#1e3a8a',
            padding: '2rem 2rem 1.75rem',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800,
              margin: '0 auto 1rem',
              border: '2px solid rgba(255,255,255,0.4)',
            }}
          >
            {activeSchool.logoText}
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
            {activeSchool.name}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0, fontStyle: 'italic' }}>
            "{activeSchool.motto}"
          </p>
        </div>

        {/* School Switcher Selector */}
        <div style={{ padding: '1rem 2rem 0', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Select School Institution:
          </label>
          <select
            value={activeSchool.id}
            onChange={(e) => {
              const selected = schools.find((s) => s.id === e.target.value)
              if (selected) setActiveSchool(selected)
            }}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#0f172a',
              outline: 'none',
              marginBottom: '1rem',
            }}
          >
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.curriculum})
              </option>
            ))}
          </select>
        </div>

        {/* 1-Click Fast Role Sign-In Bar (For immediate exploration & demo testing) */}
        <div style={{ padding: '1.5rem 2rem 1rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            ⚡ 1-Click Fast Role Sign-In (Local Test & Demo):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => loginAsRole('admin')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>👑 Principal / Admin</span>
              <span style={{ fontSize: '0.72rem', color: '#60a5fa', marginTop: '2px' }}>Full ERP Control</span>
            </button>

            <button
              onClick={() => loginAsRole('bursar')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>💼 Bursar</span>
              <span style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '2px' }}>Fees & Payroll</span>
            </button>

            <button
              onClick={() => loginAsRole('teacher')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #fde68a',
                backgroundColor: '#fffbeb',
                color: '#b45309',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>📚 Teacher</span>
              <span style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '2px' }}>Grades & Roll Call</span>
            </button>

            <button
              onClick={() => loginAsRole('student')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e9d5ff',
                backgroundColor: '#faf5ff',
                color: '#7e22ce',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>🎓 Student / Parent</span>
              <span style={{ fontSize: '0.72rem', color: '#a855f7', marginTop: '2px' }}>Report Card & Fees</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 1.25rem', color: '#94a3b8', fontSize: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ padding: '0 0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>or sign in with credentials</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* Standard Login Form */}
          <form onSubmit={handleCustomLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Email / Admission Number
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
              }}
            >
              Sign In to School ERP
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          Éclat School Management ERP • Multi-Tenant Enterprise Edition
        </div>
      </div>
    </div>
  )
}
