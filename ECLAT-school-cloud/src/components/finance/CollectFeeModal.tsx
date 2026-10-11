import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { XIcon, CheckIcon } from '../common/Icons'

interface CollectFeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (paymentId: string) => void
}

export const CollectFeeModal: React.FC<CollectFeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { students, recordPayment, activeSchool } = useSchoolErp()

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '')
  const [amount, setAmount] = useState('15000')
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Bank Wire' | 'Cheque' | 'Cash'>('M-Pesa')
  const [reference, setReference] = useState('QHN99X8K4L')

  if (!isOpen) return null

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !amount || Number(amount) <= 0) {
      alert('Please select a student and enter a valid payment amount.')
      return
    }

    const createdPayment = recordPayment({
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      admissionNo: selectedStudent.admissionNo,
      className: selectedStudent.className,
      amount: Number(amount),
      paymentMethod,
      reference: reference || `REF-${Date.now().toString().slice(-6)}`,
      term: activeSchool.currentTerm,
      academicYear: activeSchool.academicYear,
    })

    onSuccess(createdPayment.id)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem' }}>
              Record Fee Payment
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              {activeSchool.name} • Issues official stamped receipt & updates ledger
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '6px',
              padding: '0.4rem',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Select Student */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Select Student *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            >
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.admissionNo} — {std.fullName} ({std.className} {std.stream}) [Bal: {activeSchool.currency} {std.feeBalance.toLocaleString()}]
                </option>
              ))}
            </select>
          </div>

          {/* Student Balance Card */}
          {selectedStudent && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Outstanding:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e11d48' }}>
                  {activeSchool.currency} {selectedStudent.feeBalance.toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Paid so far:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                  {activeSchool.currency} {selectedStudent.totalFeePaid.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Payment Amount ({activeSchool.currency}) *
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="M-Pesa">M-Pesa Paybill / Till</option>
                <option value="Bank Wire">Bank Wire / Deposit</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="Cash">Cash at Bursary Desk</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Transaction Reference / Confirmation Code
              </label>
              <input
                type="text"
                placeholder="e.g. QHN99X8K4L or Cheque #004921"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.6rem 1.15rem',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.6rem 1.25rem',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5,150,105,0.3)',
              }}
            >
              <CheckIcon size={16} />
              <span>Record & Issue Stamped Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
