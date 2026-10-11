import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { XIcon, PrintIcon } from '../common/Icons'

interface PrintableFeeReceiptProps {
  paymentId: string
  onClose: () => void
}

export const PrintableFeeReceipt: React.FC<PrintableFeeReceiptProps> = ({ paymentId, onClose }) => {
  const { payments, activeSchool, students } = useSchoolErp()

  const payment = payments.find((p) => p.id === paymentId) || payments[0]
  const student = students.find((s) => s.id === payment?.studentId)

  const handlePrint = () => {
    window.print()
  }

  if (!payment) return null

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
        zIndex: 150,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Controls Toolbar */}
        <div
          className="no-print"
          style={{
            padding: '0.85rem 1.5rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 600 }}>
            <PrintIcon size={18} color="#34d399" />
            <span>Official Fee Payment Receipt Preview</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <PrintIcon size={16} />
              <span>Print Stamped Receipt</span>
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 0.65rem',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <XIcon size={16} />
            </button>
          </div>
        </div>

        {/* Receipt Body */}
        <div style={{ padding: '2.5rem', fontFamily: 'sans-serif', color: '#0f172a' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: activeSchool.crestColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                margin: '0 auto 0.5rem',
              }}
            >
              {activeSchool.logoText}
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
              {activeSchool.name}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              Bursary & Accounts Directorate • {activeSchool.address}
            </div>
            <div style={{ marginTop: '0.5rem', display: 'inline-block', backgroundColor: '#0f172a', color: '#fff', padding: '3px 14px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Official Stamped Fee Receipt
            </div>
          </div>

          {/* Receipt Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <div>
              <div>Receipt No: <strong style={{ color: '#2563eb' }}>{payment.receiptNo}</strong></div>
              <div>Date Issued: <strong>{payment.date}</strong></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Session: <strong>{payment.term} ({payment.academicYear})</strong></div>
              <div>Payment Mode: <strong>{payment.paymentMethod}</strong></div>
            </div>
          </div>

          {/* Student Particulars */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Received From Student:</span>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{payment.studentName}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Admission Number:</span>
                <div style={{ fontWeight: 800, color: '#2563eb' }}>{payment.admissionNo}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Class & Stream:</span>
                <div style={{ fontWeight: 600 }}>{payment.className}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Transaction Reference:</span>
                <div style={{ fontWeight: 700 }}>{payment.reference}</div>
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div
            style={{
              border: '2px solid #059669',
              backgroundColor: '#ecfdf5',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '1.75rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
              Total Amount Received
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#065f46', marginTop: '4px' }}>
              {activeSchool.currency} {payment.amount.toLocaleString()}
            </div>
          </div>

          {/* Balance Breakdown */}
          {student && (
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 0', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
              <div>Total Term Invoiced: <strong>{activeSchool.currency} {student.totalFeeBilled.toLocaleString()}</strong></div>
              <div>Total Cleared: <strong style={{ color: '#059669' }}>{activeSchool.currency} {student.totalFeePaid.toLocaleString()}</strong></div>
              <div>Remaining Balance: <strong style={{ color: student.feeBalance === 0 ? '#059669' : '#e11d48' }}>{activeSchool.currency} {student.feeBalance.toLocaleString()}</strong></div>
            </div>
          )}

          {/* Stamp Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Received by: <strong>{payment.receivedBy}</strong><br />
              Generated electronically via Éclat School ERP.
            </div>

            <div style={{ border: '2px dashed #059669', color: '#059669', padding: '8px 18px', textAlign: 'center', transform: 'rotate(-5deg)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900 }}>BURSAR OFFICIAL STAMP</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700 }}>★ PAYMENT VERIFIED ★</div>
              <div style={{ fontSize: '0.65rem' }}>{payment.date}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
