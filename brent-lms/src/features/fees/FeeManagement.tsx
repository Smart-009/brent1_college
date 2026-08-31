import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { schoolStore } from '@/lib/schoolData'
import type { FeeInvoice, FeePaymentReceipt, StudentRecord, BiometricFeeClearancePass } from '@/types/school'
import { BiometricScannerModal } from '@/components/biometrics/BiometricScannerModal'
import { BiometricEnrollModal } from '@/components/biometrics/BiometricEnrollModal'
import { BiometricClearancePassModal } from '@/components/biometrics/BiometricClearancePassModal'
import { generateBiometricVerificationCode } from '@/lib/biometricEngine'

export function FeeManagement() {
  const { profile } = useAuth()
  const defaultIssuer = profile?.full_name
    ? `${profile.full_name} (${profile.role === 'admin' ? 'Principal' : 'Bursar & Accounts Directorate'})`
    : 'Mrs. Grace Odhiambo (Bursar & Accounts Directorate)'

  const [invoices, setInvoices] = useState<FeeInvoice[]>(() => schoolStore.getInvoices())
  const [receipts, setReceipts] = useState<FeePaymentReceipt[]>(() => schoolStore.getReceipts())
  const [students, setStudents] = useState<StudentRecord[]>(() => schoolStore.getStudents())
  const [clearanceLogs, setClearanceLogs] = useState<BiometricFeeClearancePass[]>(() => schoolStore.getBiometricClearanceLogs())
  const [activeTab, setActiveTab] = useState<'invoices' | 'receipts' | 'biometric' | 'structure'>('invoices')
  const [selectedReceipt, setSelectedReceipt] = useState<FeePaymentReceipt | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showBiometricStation, setShowBiometricStation] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [studentToEnroll, setStudentToEnroll] = useState<StudentRecord | null>(null)
  const [selectedPass, setSelectedPass] = useState<BiometricFeeClearancePass | null>(null)

  // Payment Form
  const [payData, setPayData] = useState({
    student_id: '',
    admission_number: '',
    student_name: '',
    total_fee: 4500,
    amount: 4500,
    payment_method: 'M-Pesa' as 'M-Pesa' | 'Bank Transfer' | 'Cash Deposit' | 'Card',
    reference_code: `MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    paid_by: '',
    issued_by: defaultIssuer,
    biometric_verified: false,
    biometric_finger_used: 'Right Thumb',
    biometric_verification_code: '',
  })

  const totalCollected = receipts.reduce((acc, r) => acc + r.amount, 0)
  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balance, 0)
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.total_amount, 0)

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!payData.amount || payData.amount <= 0 || !payData.admission_number) return

    const student = students.find((s) => s.admission_number.toLowerCase() === payData.admission_number.toLowerCase()) || {
      id: `std-${Date.now()}`,
      full_name: payData.student_name || 'Walk-in Student',
      admission_number: payData.admission_number,
      class_name: 'Short Course Cohort',
    }

    const existingInv = invoices.find(
      (inv) => inv.admission_number.toLowerCase() === payData.admission_number.toLowerCase() || inv.student_id === student.id
    )

    const currentBill = existingInv ? existingInv.balance : Number(payData.total_fee || payData.amount)
    const remainingBalance = Math.max(0, currentBill - Number(payData.amount))
    const issuerName = payData.issued_by?.trim() || defaultIssuer

    const newReceipt: FeePaymentReceipt = {
      id: `rec-${Date.now()}`,
      receipt_number: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      student_id: student.id,
      student_name: student.full_name,
      admission_number: student.admission_number,
      amount: Number(payData.amount),
      amount_paid: Number(payData.amount),
      payment_method: payData.payment_method,
      reference_code: payData.reference_code || `REF-${Date.now().toString().slice(-6)}`,
      payment_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      paid_by: payData.paid_by || student.full_name,
      recorded_by: issuerName,
      received_by: issuerName,
      balance_after: remainingBalance,
      balance_remaining: remainingBalance,
      biometric_verified: payData.biometric_verified,
      biometric_finger_used: payData.biometric_verified ? payData.biometric_finger_used : undefined,
      biometric_verification_code: payData.biometric_verified
        ? payData.biometric_verification_code || generateBiometricVerificationCode()
        : undefined,
      biometric_verified_at: payData.biometric_verified ? new Date().toISOString() : undefined,
    }

    schoolStore.recordPayment(newReceipt)
    setInvoices(schoolStore.getInvoices())
    setReceipts(schoolStore.getReceipts())
    setStudents(schoolStore.getStudents())
    setShowPayModal(false)
    setSelectedReceipt(newReceipt)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Fees & Financial Accounts</h1>
          <p className="page-subtitle">
            Student fee billing, M-Pesa direct paybill receipts, financial statements, and biometric fingerprint clearance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: '#0284c7', borderColor: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setShowBiometricStation(true)}
          >
            <span>🖐️</span> Biometric Fee Verification
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.print()}
          >
            🖨️ Export Fee Register
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setPayData({
                student_id: '',
                admission_number: '',
                student_name: '',
                total_fee: 4500,
                amount: 4500,
                payment_method: 'M-Pesa',
                reference_code: `MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                paid_by: '',
                issued_by: defaultIssuer,
                biometric_verified: false,
                biometric_finger_used: 'Right Thumb',
                biometric_verification_code: '',
              })
              setShowPayModal(true)
            }}
          >
            💳 Record Fee Payment / M-Pesa
          </button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Billed</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            ${totalBilled.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>All Enrolled Cohorts</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Fees Collected</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#16a34a', marginTop: '0.25rem' }}>
            ${totalCollected.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>
            {Math.round((totalCollected / (totalBilled || 1)) * 100)}% Collection Rate
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ea580c' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Outstanding Fee Balance</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#ea580c', marginTop: '0.25rem' }}>
            ${totalOutstanding.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#ea580c', marginTop: '0.2rem' }}>Automatic email statements sent</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>International Payments</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669', marginTop: '0.25rem' }}>
            247247
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>Acc: Student Adm Number</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6" style={{ padding: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'invoices' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('invoices')}
          >
            📋 Invoices & Student Statements
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'receipts' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('receipts')}
          >
            🧾 Official Payment Receipts
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'biometric' ? 'btn-primary' : 'btn-ghost'}`}
            style={activeTab === 'biometric' ? { background: '#0284c7', borderColor: '#0284c7' } : { color: '#0284c7' }}
            onClick={() => {
              setClearanceLogs(schoolStore.getBiometricClearanceLogs())
              setActiveTab('biometric')
            }}
          >
            🖐️ Biometric Clearance Station & Logs
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'structure' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('structure')}
          >
            🏛️ School Fee Structure (2026)
          </button>
        </div>
      </div>

      {/* Tab 1: Invoices */}
      {activeTab === 'invoices' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Student Name</th>
                  <th>Adm No.</th>
                  <th>Class</th>
                  <th>Term</th>
                  <th>Total Billed</th>
                  <th>Paid Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{inv.invoice_number}</td>
                    <td style={{ fontWeight: 600 }}>{inv.student_name}</td>
                    <td>{inv.admission_number}</td>
                    <td><span className="badge badge-info">{inv.class_name}</span></td>
                    <td>{inv.term} {inv.academic_year}</td>
                    <td>${inv.total_amount.toLocaleString()}</td>
                    <td style={{ color: '#16a34a', fontWeight: 600 }}>${inv.paid_amount.toLocaleString()}</td>
                    <td style={{ color: inv.balance > 0 ? '#ea580c' : '#16a34a', fontWeight: 700 }}>
                      ${inv.balance.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {inv.balance > 0 ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setPayData({
                              student_id: inv.student_id,
                              admission_number: inv.admission_number,
                              student_name: inv.student_name,
                              total_fee: inv.balance,
                              amount: inv.balance,
                              payment_method: 'M-Pesa',
                              reference_code: `MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                              paid_by: inv.student_name,
                              issued_by: defaultIssuer,
                              biometric_verified: false,
                              biometric_finger_used: 'Right Thumb',
                              biometric_verification_code: '',
                            })
                            setShowPayModal(true)
                          }}
                        >
                          Clear Balance
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>✓ Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Receipts */}
      {activeTab === 'receipts' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Student Name</th>
                  <th>Adm No.</th>
                  <th>Amount Paid</th>
                  <th>Method</th>
                  <th>Ref Code</th>
                  <th>Biometric Auth</th>
                  <th>Date & Time</th>
                  <th>Paid By</th>
                  <th style={{ textAlign: 'right' }}>Print</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{rec.receipt_number}</td>
                    <td style={{ fontWeight: 600 }}>{rec.student_name}</td>
                    <td>{rec.admission_number}</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>${rec.amount.toLocaleString()}</td>
                    <td><span className="badge badge-info">{rec.payment_method}</span></td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{rec.reference_code}</td>
                    <td>
                      {rec.biometric_verified ? (
                        <span
                          className="badge badge-success"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem' }}
                          title={`Verified via ${rec.biometric_finger_used || 'Fingerprint'}`}
                        >
                          🔒 🖐️ Verified
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Standard</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{rec.payment_date}</td>
                    <td>{rec.paid_by}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedReceipt(rec)}
                      >
                        🧾 Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Biometric Clearance Terminal & Logs */}
      {activeTab === 'biometric' && (
        <div>
          {/* Biometric Quick Station Launchpad */}
          <div
            className="card mb-6"
            style={{
              padding: '1.75rem',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(30, 58, 138, 0.08) 100%)',
              border: '1px solid #bae6fd',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#0284c7',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)',
                  }}
                >
                  🖐️
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0369a1', margin: 0 }}>
                    Biometric Fingerprint Clearance & Verification Gateway
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.25rem 0 0 0' }}>
                    Instant student identification, live fee balance clearance check, and tamper-proof clearance certificate generation.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                  onClick={() => setShowBiometricStation(true)}
                >
                  🖐️ Launch Live Scanner Station
                </button>
              </div>
            </div>

            {/* Enrolled Stats Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(2, 132, 199, 0.2)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>BIOMETRICALLY ENROLLED</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>
                  {students.filter((s) => s.biometric_enrolled).length} / {students.length} Students
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CLEARANCE PASSES ISSUED</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                  {clearanceLogs.length} Official Passes
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>BIOMETRIC HARDWARE SENSOR</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                  Optical & WebAuthn Online
                </div>
              </div>
            </div>
          </div>

          {/* Biometric Clearance Logs */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1rem' }}>Authenticated Biometric Clearance History</strong>
              <span className="badge badge-info">{clearanceLogs.length} Verified Records</span>
            </div>

            {clearanceLogs.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖐️</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No Biometric Clearance Passes Issued Yet</div>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Launch the Biometric Scanner Station above to scan a student's fingerprint and issue an official clearance certificate.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Clearance Code</th>
                      <th>Student Name</th>
                      <th>Adm No.</th>
                      <th>Purpose</th>
                      <th>Finger Scanned</th>
                      <th>Match Score</th>
                      <th>Fee Status</th>
                      <th>Verified At</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clearanceLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                          {log.clearance_code}
                        </td>
                        <td style={{ fontWeight: 600 }}>{log.student_name}</td>
                        <td>{log.admission_number}</td>
                        <td><span className="badge badge-info">{log.purpose}</span></td>
                        <td>🖐️ {log.finger_scanned}</td>
                        <td><strong style={{ color: '#16a34a' }}>{log.match_confidence}%</strong></td>
                        <td>
                          <span className={`badge ${log.status === 'CLEARED' ? 'badge-success' : log.status === 'CONDITIONAL' ? 'badge-warning' : 'badge-danger'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{log.verified_at}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedPass(log)}
                          >
                            🖨️ View Pass
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Structure */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
              Vocational Short Course Tuition & Practical Lab Schedules
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              Standard 4 to 12-Week Short Course Fees • Payable in 2 Easy Installments via Paybill 247247
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>💻 Full-Stack Web Development & React 19 (12 Weeks)</span>
                <strong>$120</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>📊 Python Programming, SQL & Data Analytics (8 Weeks)</span>
                <strong>$95</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>⚡ Comprehensive Computer Packages & Digital Skills (4 Weeks)</span>
                <strong>$45</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>🛡️ Cybersecurity Fundamentals & Network Defense (6 Weeks)</span>
                <strong>$89</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>📈 Computerized Accounting (QuickBooks & International Tax) (4 Weeks)</span>
                <strong>$65</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>🌍 IELTS Exam Prep Target Band 7.5 - 9.0 (4-6 Weeks)</span>
                <strong>$85</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>🗣️ English Language Mastery & Public Speaking (6-8 Weeks)</span>
                <strong>$55</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>🌴 Arabic, French & German Foreign Languages (8 Weeks)</span>
                <strong>$79</strong>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', background: '#f8fafc' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e3a8a' }}>
              📲 Official M-Pesa Paybill Payment Steps
            </h3>
            <div style={{ fontSize: '0.88rem', lineHeight: '1.7', color: '#334155' }}>
              <ol style={{ paddingLeft: '1.25rem' }}>
                <li>Go to <strong>M-PESA</strong> on your mobile device</li>
                <li>Select <strong>Lipa na M-PESA</strong> → <strong>Paybill</strong></li>
                <li>Enter Business Number: <strong>247247</strong> (Equity / Eclat Institute)</li>
                <li>Enter Account Number: <strong>Student Adm Number</strong> (e.g. <code>BC-2024-001</code>)</li>
                <li>Enter the fee amount and your M-PESA PIN</li>
                <li>You will receive an instant SMS confirmation and your digital receipt below!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record Fee Payment</h3>
              <button type="button" className="modal-close" onClick={() => setShowPayModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="label">Student Admission Number</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={payData.admission_number}
                    onChange={(e) => {
                      const adm = e.target.value
                      const match = students.find((s) => s.admission_number.toLowerCase() === adm.toLowerCase())
                      setPayData({
                        ...payData,
                        admission_number: adm,
                        student_name: match ? match.full_name : payData.student_name,
                        student_id: match ? match.id : payData.student_id,
                        biometric_verified: match?.biometric_enrolled || payData.biometric_verified,
                        biometric_finger_used: match?.biometric_finger_name || payData.biometric_finger_used,
                        biometric_verification_code: match?.biometric_enrolled ? generateBiometricVerificationCode() : payData.biometric_verification_code,
                      })
                    }}
                  />
                </div>

                <div>
                  <label className="label">Student Full Name</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={payData.student_name}
                    onChange={(e) => setPayData({ ...payData, student_name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Amount Paid ($ USD) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input"
                      value={payData.amount}
                      onChange={(e) => setPayData({ ...payData, amount: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="label">Payment Method</label>
                    <select
                      className="input"
                      value={payData.payment_method}
                      onChange={(e) => setPayData({ ...payData, payment_method: e.target.value as any })}
                    >
                      <option value="M-Pesa">M-Pesa Paybill</option>
                      <option value="Bank Transfer">Bank Transfer (KCB / Equity)</option>
                      <option value="Cash Deposit">Bank Cash Slip</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Transaction / Ref Code *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={payData.reference_code}
                      onChange={(e) => setPayData({ ...payData, reference_code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Paid By (Payer Name) *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={payData.paid_by}
                      onChange={(e) => setPayData({ ...payData, paid_by: e.target.value })}
                    />
                  </div>
                </div>

                {/* Biometric Verification Checkbox Box */}
                <div
                  style={{
                    background: payData.biometric_verified ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${payData.biometric_verified ? '#bbf7d0' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '0.85rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={payData.biometric_verified}
                      style={{ marginTop: '0.2rem' }}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setPayData({
                          ...payData,
                          biometric_verified: checked,
                          biometric_verification_code: checked
                            ? payData.biometric_verification_code || generateBiometricVerificationCode()
                            : '',
                        })
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: payData.biometric_verified ? '#166534' : 'inherit' }}>
                        🖐️ Authenticate Payment with Student Fingerprint Biometrics
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Verifies student identity at payment desk and stamps receipt with biometric security code.
                      </div>
                    </div>
                  </label>

                  {payData.biometric_verified && (
                    <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid #bbf7d0', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Verified Finger:</strong> {payData.biometric_finger_used || 'Right Index'}
                      </div>
                      <div>
                        <strong>Auth Code:</strong> <code style={{ fontSize: '0.75rem', color: '#166534' }}>{payData.biometric_verification_code || 'BIO-PENDING'}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process & Issue Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Printable Modal */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()} style={{ padding: 0 }}>
            <div className="no-print" style={{ padding: '0.75rem 1rem', background: 'var(--color-bg-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Official Receipt Generated</strong>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨️ Print</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedReceipt(null)}>Close</button>
              </div>
            </div>

            <div style={{ padding: '2rem', background: '#fff', color: '#0f172a' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <img src="/logo.png" alt="Eclat Institute" style={{ width: '52px', height: '52px', borderRadius: '50%' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e3a8a', margin: '0.25rem 0' }}>ÉCLAT INSTITUTE</h2>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>100% Online Global Academy • eclat.institute</div>
                <div style={{ display: 'inline-block', background: '#f1f5f9', color: '#1e3a8a', padding: '2px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, marginTop: '4px' }}>
                  OFFICIAL TUITION PAYMENT RECEIPT (ORIGINAL)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div><strong>Receipt No:</strong> <span style={{ color: '#1e3a8a', fontWeight: 800 }}>{selectedReceipt.receipt_number}</span></div>
                <div><strong>Date:</strong> {selectedReceipt.payment_date}</div>
                <div><strong>Student Name:</strong> {selectedReceipt.student_name}</div>
                <div><strong>Admission No:</strong> <span style={{ fontWeight: 800 }}>{selectedReceipt.admission_number}</span></div>
                <div><strong>Payment Method:</strong> {selectedReceipt.payment_method}</div>
                <div><strong>Ref / M-Pesa Code:</strong> <code>{selectedReceipt.reference_code}</code></div>
                <div><strong>Payer Name:</strong> {selectedReceipt.paid_by}</div>
                <div><strong>Issued & Received By:</strong> <strong style={{ color: '#1e3a8a' }}>{selectedReceipt.recorded_by || selectedReceipt.received_by || defaultIssuer}</strong></div>
              </div>

              {/* Biometric Verification Badge on Receipt */}
              {selectedReceipt.biometric_verified && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔒</span>
                    <div>
                      <strong style={{ color: '#166534' }}>BIOMETRICALLY VERIFIED VIA FINGERPRINT</strong>
                      <div style={{ fontSize: '0.72rem', color: '#15803d' }}>
                        Authenticated Sensor: {selectedReceipt.biometric_finger_used || 'Right Index'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>SECURITY STAMP</div>
                    <code style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                      {selectedReceipt.biometric_verification_code || 'BIO-VERIFIED'}
                    </code>
                  </div>
                </div>
              )}

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#166534', fontWeight: 700 }}>Amount Received</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a' }}>
                  ${(selectedReceipt.amount_paid ?? selectedReceipt.amount).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#475569' }}>
                  Outstanding Balance: {' '}
                  {(selectedReceipt.balance_remaining ?? selectedReceipt.balance_after ?? 0) === 0 ? (
                    <strong style={{ color: '#16a34a' }}>$0.00 (FEE FULLY CLEARED ✓)</strong>
                  ) : (
                    <strong style={{ color: '#dc2626' }}>${(selectedReceipt.balance_remaining ?? selectedReceipt.balance_after ?? 0).toLocaleString()}</strong>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem' }}>
                Thank you for your payment. Éclat Institute • 100% Online Tech & Languages.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Scanner Terminal Modal */}
      {showBiometricStation && (
        <BiometricScannerModal
          officerName={defaultIssuer}
          onClose={() => {
            setShowBiometricStation(false)
            setClearanceLogs(schoolStore.getBiometricClearanceLogs())
          }}
          onRecordPayment={(std) => {
            setPayData({
              student_id: std.id,
              admission_number: std.admission_number,
              student_name: std.full_name,
              total_fee: std.fee_balance,
              amount: std.fee_balance,
              payment_method: 'M-Pesa',
              reference_code: `MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              paid_by: std.full_name,
              issued_by: defaultIssuer,
              biometric_verified: true,
              biometric_finger_used: std.biometric_finger_name || 'Right Index',
              biometric_verification_code: generateBiometricVerificationCode(),
            })
            setShowPayModal(true)
          }}
        />
      )}

      {/* Biometric Student Enrollment Modal */}
      {showEnrollModal && studentToEnroll && (
        <BiometricEnrollModal
          student={studentToEnroll}
          officerName={defaultIssuer}
          onClose={() => {
            setShowEnrollModal(false)
            setStudentToEnroll(null)
          }}
          onEnrolled={(updated) => {
            setStudents(schoolStore.getStudents())
          }}
        />
      )}

      {/* View Individual Clearance Pass Modal */}
      {selectedPass && (
        <BiometricClearancePassModal
          pass={selectedPass}
          onClose={() => setSelectedPass(null)}
        />
      )}
    </div>
  )
}
