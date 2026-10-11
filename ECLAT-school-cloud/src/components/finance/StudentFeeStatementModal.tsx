import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { XIcon, PrintIcon } from '../common/Icons'

interface StudentFeeStatementModalProps {
  studentId: string
  onClose: () => void
}

export const StudentFeeStatementModal: React.FC<StudentFeeStatementModalProps> = ({
  studentId,
  onClose,
}) => {
  const { students, payments, activeSchool } = useSchoolErp()

  const student = students.find((s) => s.id === studentId) || students[0]
  const studentPayments = payments.filter((p) => p.studentId === student.id)

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
          maxWidth: '740px',
          maxHeight: '90vh',
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
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Official Student Fee Ledger Statement</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Print Statement
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

        <div style={{ padding: '2.5rem', fontFamily: 'sans-serif', color: '#0f172a' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
              {activeSchool.name}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              Bursary & Accounts Directorate • Student Fee Statement of Account
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <div>
              <div>Student: <strong>{student.fullName}</strong></div>
              <div>Admission No: <strong style={{ color: '#2563eb' }}>{student.admissionNo}</strong></div>
              <div>Class: <strong>{student.className} ({student.stream})</strong></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Date Issued: <strong>{new Date().toISOString().split('T')[0]}</strong></div>
              <div>Session: <strong>{activeSchool.currentTerm} ({activeSchool.academicYear})</strong></div>
              <div>Status: <strong style={{ color: student.feeBalance === 0 ? '#059669' : '#e11d48' }}>{student.feeBalance === 0 ? 'CLEARED' : 'OUTSTANDING BALANCE'}</strong></div>
            </div>
          </div>

          {/* Ledger Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', color: '#475569' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Particulars / Description</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Ref / Mode</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Debit (Billed)</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Credit (Paid)</th>
              </tr>
            </thead>
            <tbody>
              {/* Initial Invoice */}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px' }}>{student.enrollmentDate}</td>
                <td style={{ padding: '8px', fontWeight: 600 }}>{activeSchool.currentTerm} Tuition & Operational Invoice</td>
                <td style={{ padding: '8px', color: '#64748b' }}>INV-{activeSchool.academicYear}-01</td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>
                  {activeSchool.currency} {student.totalFeeBilled.toLocaleString()}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>—</td>
              </tr>

              {/* Payments */}
              {studentPayments.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px' }}>{p.date}</td>
                  <td style={{ padding: '8px', color: '#0f172a' }}>Fee Payment ({p.receiptNo})</td>
                  <td style={{ padding: '8px', color: '#64748b' }}>{p.paymentMethod} - {p.reference}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>—</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                    {activeSchool.currency} {p.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Box */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
              <span>Total Invoiced Tuition:</span>
              <strong>{activeSchool.currency} {student.totalFeeBilled.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#059669' }}>
              <span>Total Payments Cleared:</span>
              <strong>{activeSchool.currency} {student.totalFeePaid.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', borderTop: '2px solid #cbd5e1', fontSize: '1.1rem', fontWeight: 900, color: student.feeBalance === 0 ? '#059669' : '#e11d48' }}>
              <span>Net Outstanding Balance:</span>
              <span>{activeSchool.currency} {student.feeBalance.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
            <div>Payment Options: M-Pesa Paybill <strong>400200</strong> Acc: <strong>{student.admissionNo}</strong></div>
            <div>Bursary Controller: <strong>Madam Catherine Achieng</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}
