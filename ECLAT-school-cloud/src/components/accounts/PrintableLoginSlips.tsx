import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { UserAccount } from '../../types/schoolErp'
import { PrintIcon, XIcon } from '../common/Icons'

interface PrintableLoginSlipsProps {
  accounts: UserAccount[]
  onClose: () => void
}

export const PrintableLoginSlips: React.FC<PrintableLoginSlipsProps> = ({ accounts, onClose }) => {
  const { activeSchool } = useSchoolErp()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
        overflowY: 'auto',
      }}
    >
      {/* Control bar */}
      <div
        className="no-print"
        style={{
          width: '100%',
          maxWidth: '850px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0f172a',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          color: '#ffffff',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Batch Parent & Student Login Slips</span>
          <span style={{ fontSize: '0.8rem', backgroundColor: '#3b82f6', padding: '2px 8px', borderRadius: '4px' }}>
            {accounts.length} Accounts Selected
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <PrintIcon size={16} /> Print Slips
          </button>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#334155',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <XIcon size={16} /> Close
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div
        className="print-sheet"
        style={{
          width: '100%',
          maxWidth: '850px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '2.5rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>{activeSchool.name}</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Official Portal Credentials & Access Slips — {activeSchool.currentTerm} ({activeSchool.academicYear})
          </p>
        </div>

        {/* 2x2 Grid of Slips */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {accounts.map((acc) => (
            <div
              key={acc.id}
              style={{
                border: '2px dashed #94a3b8',
                borderRadius: '8px',
                padding: '1.25rem',
                backgroundColor: '#f8fafc',
                pageBreakInside: 'avoid',
              }}
            >
              {/* Slip Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: activeSchool.crestColor,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                  }}
                >
                  {activeSchool.logoText}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{activeSchool.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Parent & Student Access Pass</div>
                </div>
              </div>

              {/* Student/User Info */}
              <div style={{ fontSize: '0.82rem', marginBottom: '0.65rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.72rem' }}>ACCOUNT HOLDER</div>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{acc.fullName}</div>
              </div>

              {/* Credentials Box */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>PORTAL USERNAME</span>
                  <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{acc.username}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>TEMPORARY PIN</span>
                  <strong style={{ color: '#2563eb', fontFamily: 'monospace' }}>{acc.tempPin}</strong>
                </div>
              </div>

              {/* Instructions */}
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                <strong>Portal Link:</strong> {activeSchool.website || 'https://schoolcloud.ac.ke'}/portal<br />
                <em>Keep this slip secure. You will be prompted to change your PIN upon initial sign-in.</em>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
