import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { XIcon, PrintIcon } from '../common/Icons'

interface PrintableAdmissionLetterProps {
  studentId: string
  onClose: () => void
}

export const PrintableAdmissionLetter: React.FC<PrintableAdmissionLetterProps> = ({
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
          maxWidth: '750px',
          maxHeight: '92vh',
          overflowY: 'auto',
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
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Official Admission Letter</span>
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
              Print Letter
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

        {/* Letter Body */}
        <div style={{ padding: '3rem', fontFamily: 'serif', color: '#0f172a', lineHeight: 1.6 }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.25rem' }}>
              {activeSchool.name}
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
              "{activeSchool.motto}"
            </div>
            <div style={{ fontSize: '0.8rem', color: '#334155' }}>
              {activeSchool.address} • Tel: {activeSchool.phone} • Email: {activeSchool.email}
            </div>
            <div style={{ marginTop: '0.75rem', fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Directorate of Admissions & Student Registry
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <div>
              Date: <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </div>
            <div>
              Ref: <strong>{student.admissionNo} / ADM / {activeSchool.academicYear}</strong>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <div>To the Parent / Guardian of:</div>
            <strong style={{ fontSize: '1.1rem' }}>{student.fullName}</strong><br />
            <div>P.O. Box Nairobi, Kenya</div>
          </div>

          <h3 style={{ textDecoration: 'underline', textTransform: 'uppercase', fontSize: '1rem', marginBottom: '1rem' }}>
            RE: FORMAL LETTER OF ADMISSION INTO {student.className.toUpperCase()}
          </h3>

          <p style={{ fontSize: '0.95rem', margin: '0 0 1rem' }}>
            We are pleased to inform you that <strong>{student.fullName}</strong> has been offered a place at{' '}
            <strong>{activeSchool.name}</strong> in <strong>{student.className} ({student.stream})</strong> for the{' '}
            <strong>{activeSchool.academicYear}</strong> academic year under our accredited{' '}
            <strong>{activeSchool.curriculum}</strong> curriculum.
          </p>

          <p style={{ fontSize: '0.95rem', margin: '0 0 1.5rem' }}>
            Your official permanent admission number is <strong style={{ color: '#2563eb' }}>{student.admissionNo}</strong>.
            Please quote this number in all fee payments via M-Pesa or bank deposits and during termly academic clinics.
          </p>

          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', fontSize: '0.88rem' }}>
            <div>Term Tuition Invoiced: <strong>{activeSchool.currency} {student.totalFeeBilled.toLocaleString()}</strong></div>
            <div>Reporting Date: <strong>First Monday of Term Opening</strong></div>
            <div>Uniform & Book List: <strong>Available at Bursary Stores</strong></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem' }}>
            <div>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem', width: '220px' }}>
                <strong>Dr. James W. Kamau</strong><br />
                <span style={{ fontSize: '0.85rem' }}>Principal & Chief Administrator</span>
              </div>
            </div>

            <div style={{ border: '2px solid #2563eb', color: '#2563eb', padding: '8px 18px', textAlign: 'center', transform: 'rotate(-5deg)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900 }}>OFFICIAL ADMISSIONS SEAL</div>
              <div style={{ fontSize: '0.7rem' }}>★ MATRICULATION APPROVED ★</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
