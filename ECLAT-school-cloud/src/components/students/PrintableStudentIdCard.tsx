import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { XIcon, PrintIcon } from '../common/Icons'

interface PrintableStudentIdCardProps {
  studentId: string
  onClose: () => void
}

export const PrintableStudentIdCard: React.FC<PrintableStudentIdCardProps> = ({
  studentId,
  onClose,
}) => {
  const { students, activeSchool } = useSchoolErp()
  const student = students.find((s) => s.id === studentId) || students[0]

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 160,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '540px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          className="no-print"
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Official Student ID Card (PVC Format)</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Print ID Badge
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <XIcon size={16} />
            </button>
          </div>
        </div>

        {/* Printable Card */}
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
          <div
            style={{
              width: '380px',
              height: '240px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: `2px solid ${activeSchool.crestColor}`,
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* ID Top Header */}
            <div
              style={{
                backgroundColor: activeSchool.crestColor,
                color: '#ffffff',
                padding: '0.5rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  color: activeSchool.crestColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                {activeSchool.logoText}
              </div>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {activeSchool.name}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#e2e8f0' }}>Student Identification Card</div>
              </div>
            </div>

            {/* ID Body */}
            <div style={{ padding: '0.85rem', display: 'flex', gap: '0.85rem', flex: 1, alignItems: 'center' }}>
              {/* Photo Box */}
              <div
                style={{
                  width: '84px',
                  height: '96px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3b82f6' }}>
                  {student.fullName.charAt(0)}
                </div>
                <span>PHOTO</span>
              </div>

              {/* Particulars */}
              <div style={{ fontSize: '0.75rem', lineHeight: 1.35, color: '#0f172a' }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>{student.fullName}</div>
                <div>Adm No: <strong style={{ color: '#2563eb' }}>{student.admissionNo}</strong></div>
                <div>Class: <strong>{student.className} ({student.stream})</strong></div>
                <div>Blood Group: <strong>{student.bloodGroup || 'O+'}</strong></div>
                <div>Emergency: <strong>{student.guardianPhone}</strong></div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                  Valid: Academic Year {activeSchool.academicYear}
                </div>
              </div>
            </div>

            {/* Barcode Strip */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '0.35rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.62rem',
                color: '#64748b',
              }}
            >
              <div style={{ letterSpacing: '2px', fontWeight: 700, color: '#0f172a' }}>
                |||| | ||||| || |||| |||
              </div>
              <div>Principal Signature Verified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
