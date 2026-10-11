import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { BuildingIcon, UserIcon, ChevronDownIcon } from '../common/Icons'
import { UserRole } from '../../types/schoolErp'

export const ErpTopHeader: React.FC = () => {
  const { activeSchool, setActiveSchool, schools, currentUser, loginAsRole } = useSchoolErp()
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false)

  const roles: { id: UserRole; label: string; color: string }[] = [
    { id: 'admin', label: 'Principal / Admin', color: '#2563eb' },
    { id: 'bursar', label: 'Bursar', color: '#059669' },
    { id: 'teacher', label: 'Teacher', color: '#d97706' },
    { id: 'student', label: 'Student / Parent', color: '#7c3aed' },
  ]

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      {/* Left: School Switcher Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <BuildingIcon size={16} color="#475569" />
          <span>{activeSchool.name}</span>
          <ChevronDownIcon size={14} color="#64748b" />
        </button>

        {showSchoolDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '6px',
              width: '320px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '0.5rem',
              zIndex: 50,
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '0.4rem 0.6rem' }}>
              Switch Partner School:
            </div>
            {schools.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSchool(s)
                  setShowSchoolDropdown(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: s.id === activeSchool.id ? '#eff6ff' : 'transparent',
                  color: s.id === activeSchool.id ? '#1d4ed8' : '#1e293b',
                  fontSize: '0.85rem',
                  fontWeight: s.id === activeSchool.id ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    backgroundColor: s.crestColor,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {s.logoText}
                </div>
                <div>
                  <div>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.curriculum}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Middle & Right: 1-Click Role Switcher & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Role Switcher Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', padding: '0 0.5rem' }}>
            Simulate Role:
          </span>
          {roles.map((r) => {
            const isCurrent = currentUser?.role === r.id
            return (
              <button
                key={r.id}
                onClick={() => loginAsRole(r.id)}
                style={{
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  backgroundColor: isCurrent ? r.color : 'transparent',
                  color: isCurrent ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  boxShadow: isCurrent ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {r.label}
              </button>
            )
          })}
        </div>

        {/* Date & Term Capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: '#475569',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
          }}
        >
          <span>📅 {today}</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <strong style={{ color: '#0f172a' }}>{activeSchool.currentTerm}</strong>
        </div>

        {/* User Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            <UserIcon size={18} />
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
              {currentUser?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {currentUser?.designation || 'Principal'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
