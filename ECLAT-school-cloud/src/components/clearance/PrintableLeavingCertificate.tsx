import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { ClearanceRecord } from '../../types/schoolErp'
import { PrintIcon, XIcon } from '../common/Icons'

interface PrintableLeavingCertificateProps {
  clearance: ClearanceRecord
  onClose: () => void
}

export const PrintableLeavingCertificate: React.FC<PrintableLeavingCertificateProps> = ({ clearance, onClose }) => {
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
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
          Official School Leaving & Completion Certificate
        </span>
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
            <PrintIcon size={16} /> Print Certificate
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

      {/* Official Certificate Paper */}
      <div
        className="print-sheet"
        style={{
          width: '100%',
          maxWidth: '850px',
          backgroundColor: '#fffdfa',
          color: '#0f172a',
          padding: '3rem 3.5rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: '12px double #b45309',
          position: 'relative',
        }}
      >
        {/* Certificate Serial and School Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: activeSchool.crestColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.6rem',
                border: '2px solid rgba(0,0,0,0.1)',
              }}
            >
              {activeSchool.logoText}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {activeSchool.name}
              </h1>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                "{activeSchool.motto}"
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                {activeSchool.address} • Tel: {activeSchool.phone} • {activeSchool.email}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Serial Number</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#b45309', fontFamily: 'monospace' }}>
              {clearance.leavingCertificateNo || 'SLC/2026/0014'}
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div style={{ textAlign: 'center', margin: '2rem 0', borderBottom: '2px solid #b45309', borderTop: '2px solid #b45309', padding: '0.85rem 0' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#1e3a8a' }}>
            Official School Leaving Certificate
          </h2>
          <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginTop: '4px' }}>
            Registered by Ministry of Education • Republic of Kenya
          </div>
        </div>

        {/* Body Text */}
        <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#1e293b', marginBottom: '2rem' }}>
          <p style={{ margin: '0 0 1rem' }}>
            This is to certify that <strong>{clearance.studentName}</strong>, bearing Institutional Admission Number{' '}
            <strong style={{ fontFamily: 'monospace', color: '#1e3a8a' }}>{clearance.admissionNo}</strong>
            {clearance.kcseIndexNo ? (
              <span> and Examination Index Number <strong>{clearance.kcseIndexNo}</strong></span>
            ) : null}
            , was a bona fide student of this Institution in the class of <strong>{clearance.className}</strong>.
          </p>

          <p style={{ margin: '0 0 1rem' }}>
            The aforementioned student was officially cleared for <strong>{clearance.exitReason.toUpperCase()}</strong> on{' '}
            <strong>{clearance.clearanceDate}</strong>.
          </p>

          <div style={{ backgroundColor: '#fef3c7', padding: '1rem 1.25rem', borderRadius: '6px', borderLeft: '4px solid #b45309', margin: '1.5rem 0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
              Headteacher / Principal Conduct & Character Remarks:
            </div>
            <div style={{ fontStyle: 'italic', fontSize: '0.92rem', color: '#78350f', marginTop: '0.35rem' }}>
              "{clearance.conductRemarks}"
            </div>
          </div>
        </div>

        {/* Clearance Verification Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '2.5rem', fontSize: '0.75rem', textAlign: 'center' }}>
          <div style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
            <div style={{ fontWeight: 700, color: '#475569' }}>LIBRARY DEPT</div>
            <div style={{ color: '#16a34a', fontWeight: 800, marginTop: '2px' }}>CLEARED ✓</div>
          </div>
          <div style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
            <div style={{ fontWeight: 700, color: '#475569' }}>BURSARY & FEES</div>
            <div style={{ color: '#16a34a', fontWeight: 800, marginTop: '2px' }}>CLEARED (NIL BAL) ✓</div>
          </div>
          <div style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
            <div style={{ fontWeight: 700, color: '#475569' }}>HOSTEL & BOARDING</div>
            <div style={{ color: '#16a34a', fontWeight: 800, marginTop: '2px' }}>CLEARED ✓</div>
          </div>
          <div style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
            <div style={{ fontWeight: 700, color: '#475569' }}>GAMES & SPORTS</div>
            <div style={{ color: '#16a34a', fontWeight: 800, marginTop: '2px' }}>CLEARED ✓</div>
          </div>
        </div>

        {/* Signatures & Institutional Seal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '180px', borderBottom: '1px solid #0f172a', marginBottom: '0.4rem', height: '35px' }}></div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Director of Academics</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Date: {clearance.clearanceDate}</div>
          </div>

          {/* Institutional Stamp Placeholder */}
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              border: '2px dashed #b45309',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              color: '#b45309',
              textAlign: 'center',
              fontWeight: 700,
              padding: '6px',
            }}
          >
            <span>OFFICIAL</span>
            <span>INSTITUTIONAL</span>
            <span>SEAL</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '180px', borderBottom: '1px solid #0f172a', marginBottom: '0.4rem', height: '35px' }}></div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Chief Principal / Head of School</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Signature & Official Stamp</div>
          </div>
        </div>
      </div>
    </div>
  )
}
