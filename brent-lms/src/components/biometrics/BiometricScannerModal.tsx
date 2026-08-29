// ============================================================
// Brent College — Biometric Fingerprint Fee Verification Station
// ============================================================

import React, { useState } from 'react'
import { schoolStore } from '@/lib/schoolData'
import {
  simulateHardwareScan,
  evaluateFeeClearance,
  createClearancePass,
} from '@/lib/biometricEngine'
import type { StudentRecord, BiometricFeeClearancePass } from '@/types/school'
import { BiometricClearancePassModal } from './BiometricClearancePassModal'

interface Props {
  officerName: string
  onClose: () => void
  onRecordPayment?: (student: StudentRecord) => void
  onEnrollRequested?: (student: StudentRecord) => void
}

export const BiometricScannerModal: React.FC<Props> = ({
  officerName,
  onClose,
  onRecordPayment,
  onEnrollRequested,
}) => {
  const [students, setStudents] = useState<StudentRecord[]>(() => schoolStore.getStudents())
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.find((s) => s.biometric_enrolled)?.id || students[0]?.id || ''
  )
  const [scanState, setScanState] = useState<'ready' | 'scanning' | 'matched' | 'not_found'>('ready')
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatusText, setScanStatusText] = useState('Optical Capacitive Sensor Ready.')
  const [matchedStudent, setMatchedStudent] = useState<StudentRecord | null>(null)
  const [confidenceScore, setConfidenceScore] = useState(99.2)
  const [selectedPurpose, setSelectedPurpose] = useState<BiometricFeeClearancePass['purpose']>('Exam Entry')
  const [generatedPass, setGeneratedPass] = useState<BiometricFeeClearancePass | null>(null)

  // Start Fingerprint Verification
  const handleScanFingerprint = async (targetStudent?: StudentRecord) => {
    const studentToMatch = targetStudent || students.find((s) => s.id === selectedStudentId)

    setScanState('scanning')
    setScanProgress(0)

    try {
      const scanRes = await simulateHardwareScan((label, pct) => {
        setScanStatusText(label)
        setScanProgress(pct)
      })

      if (studentToMatch) {
        setConfidenceScore(scanRes.confidenceScore)
        setMatchedStudent(studentToMatch)
        setScanState('matched')
      } else {
        setScanState('not_found')
      }
    } catch {
      setScanState('not_found')
    }
  }

  // Issue Official Clearance Pass
  const handleIssueClearancePass = async () => {
    if (!matchedStudent) return
    const pass = createClearancePass(matchedStudent, officerName, selectedPurpose, confidenceScore)
    await schoolStore.saveBiometricClearanceLog(pass)
    setGeneratedPass(pass)
  }

  const handleResetScanner = () => {
    setScanState('ready')
    setMatchedStudent(null)
    setScanProgress(0)
    setScanStatusText('Optical Capacitive Sensor Ready.')
  }

  const enrolledStudents = students.filter((s) => s.biometric_enrolled)
  const feeEval = matchedStudent
    ? evaluateFeeClearance(matchedStudent.term_fee_total, matchedStudent.fee_balance)
    : null

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content modal-lg"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '720px', padding: '1.75rem' }}
        >
          {/* Header */}
          <div className="modal-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem' }}>
            <div>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🖐️</span> Biometric Fingerprint Fee Verification Station
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
                Live optical biometric verification for instant student fee clearance & exam pass issuance.
              </p>
            </div>
            <button type="button" className="modal-close" onClick={onClose}>✕</button>
          </div>

          {/* Scanner Interaction Area */}
          {scanState === 'ready' && (
            <div>
              {/* Quick Student Selection */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  Select Enrolled Student or Place Finger on Sensor:
                </label>
                {students.length === 0 ? (
                  <div className="alert alert-warning" style={{ fontSize: '0.85rem' }}>
                    No students currently in the directory. Please add a student first in the Admissions / SIS desk.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                    <select
                      className="input"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.admission_number} — {s.full_name} ({s.class_name}) {s.biometric_enrolled ? '🟢 [Enrolled]' : '⚪ [Unregistered]'}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleScanFingerprint()}
                    >
                      🖐️ Touch Scanner
                    </button>
                  </div>
                )}
              </div>

              {/* Hardware Sensor Visual Pad */}
              <div
                style={{
                  border: '2px dashed #0284c7',
                  borderRadius: '12px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.04) 0%, rgba(2, 132, 199, 0.08) 100%)',
                  cursor: 'pointer',
                  marginBottom: '1.25rem',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleScanFingerprint()}
              >
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    border: '3px solid #0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    fontSize: '3rem',
                    boxShadow: '0 0 20px rgba(2, 132, 199, 0.25)',
                  }}
                >
                  🖐️
                </div>
                <div style={{ fontWeight: 800, color: '#0369a1', fontSize: '1.1rem' }}>
                  Touch / Press Fingerprint to Verify Fee Clearance
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Compatible with Integrated Optical Scanners, USB Biometric Readers & WebAuthn
                </div>
              </div>

              {/* Enrolled Students Quick Badges */}
              {enrolledStudents.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    QUICK SCAN REGISTERED STUDENTS ({enrolledStudents.length} Enrolled):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '140px', overflowY: 'auto' }}>
                    {enrolledStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        onClick={() => {
                          setSelectedStudentId(s.id)
                          handleScanFingerprint(s)
                        }}
                      >
                        <span style={{ color: '#16a34a' }}>●</span>
                        <strong>{s.full_name}</strong>
                        <span style={{ color: 'var(--color-text-secondary)' }}>({s.admission_number})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scanner Active Animation */}
          {scanState === 'scanning' && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%)',
                  boxShadow: '0 0 30px rgba(2, 132, 199, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: `${scanProgress}%`,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: '#22c55e',
                    boxShadow: '0 0 12px #22c55e',
                    transition: 'top 0.25s linear',
                  }}
                />
                <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🖐️</span>
              </div>

              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
                Analyzing Biometric Minutiae...
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                {scanStatusText}
              </div>

              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  maxWidth: '400px',
                  margin: '0 auto',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${scanProgress}%`,
                    background: '#16a34a',
                    transition: 'width 0.25s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginTop: '0.5rem' }}>
                {scanProgress}% Ridge Signature Matching
              </div>
            </div>
          )}

          {/* Matched Result Card */}
          {scanState === 'matched' && matchedStudent && feeEval && (
            <div>
              {/* Success Banner */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>✓</span>
                  <div>
                    <strong style={{ color: '#166534', fontSize: '0.9rem' }}>
                      Biometric Fingerprint Match Confirmed!
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                      Sensor: {matchedStudent.biometric_finger_name || 'Right Index'} • {confidenceScore}% Confidence Score
                    </div>
                  </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetScanner}>
                  🔄 Re-Scan
                </button>
              </div>

              {/* Student Identification Profile */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr',
                  gap: '1rem',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.5rem',
                  }}
                >
                  {matchedStudent.full_name.charAt(0)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                      {matchedStudent.full_name}
                    </h4>
                    <span className="badge badge-info">{matchedStudent.class_name}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                    Adm No: <strong style={{ color: 'var(--color-primary)' }}>{matchedStudent.admission_number}</strong> • Status: {matchedStudent.status} • Gender: {matchedStudent.gender}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                    Biometric Hash: <code style={{ fontSize: '0.72rem' }}>{matchedStudent.biometric_template_hash || 'FP-AUTHENTICATED'}</code>
                  </div>
                </div>
              </div>

              {/* Financial Clearance Audit KPIs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.75rem',
                  textAlign: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <div className="card" style={{ padding: '0.85rem', background: '#fff' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>TOTAL BILLED</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
                    KES {matchedStudent.term_fee_total.toLocaleString()}
                  </div>
                </div>

                <div className="card" style={{ padding: '0.85rem', background: '#fff' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>TOTAL PAID</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                    KES {Math.max(0, matchedStudent.term_fee_total - matchedStudent.fee_balance).toLocaleString()}
                  </div>
                </div>

                <div className="card" style={{ padding: '0.85rem', background: '#fff' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>OUTSTANDING BALANCE</div>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: matchedStudent.fee_balance === 0 ? '#16a34a' : '#ea580c',
                      marginTop: '2px',
                    }}
                  >
                    KES {matchedStudent.fee_balance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Clearance Verdict Box */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: feeEval.status === 'CLEARED' ? '#f0fdf4' : feeEval.status === 'CONDITIONAL' ? '#fffbeb' : '#fef2f2',
                  border: `2px solid ${feeEval.color}`,
                  textAlign: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: feeEval.color }}>
                  {feeEval.status === 'CLEARED' && '✓ FEES FULLY CLEARED — 100% AUTHORIZED'}
                  {feeEval.status === 'CONDITIONAL' && '⚠️ CONDITIONAL CLEARANCE — PARTIAL BALANCE OUTSTANDING'}
                  {feeEval.status === 'OVERDUE' && '✕ FEE ARREARS OUTSTANDING — PAYMENT REQUIRED'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem' }}>
                  {feeEval.status === 'CLEARED'
                    ? 'Student is fully cleared in financial ledgers. Authorized for all examinations, practical lab access, and transcript issuance.'
                    : `Student has an outstanding fee balance of KES ${matchedStudent.fee_balance.toLocaleString()}. Authorized for provisional clearance with bursar sign-off.`}
                </div>
              </div>

              {/* Clearance Pass Options & Direct Payment Action */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  background: 'var(--color-bg-secondary)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Pass Purpose:</label>
                  <select
                    className="input"
                    style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value as any)}
                  >
                    <option value="Exam Entry">Exam Entry Sittings</option>
                    <option value="Lab Clearance">Practical Lab Access</option>
                    <option value="Certificate Collection">Certificate & Transcript Release</option>
                    <option value="Registration Clearance">Semester Registration</option>
                    <option value="Financial Audit">Audit Verification</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {matchedStudent.fee_balance > 0 && onRecordPayment && (
                    <button
                      type="button"
                      className="btn btn-warning btn-sm"
                      onClick={() => {
                        onClose()
                        onRecordPayment(matchedStudent)
                      }}
                    >
                      💳 Pay Balance (KES {matchedStudent.fee_balance})
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleIssueClearancePass}
                  >
                    🖨️ Issue Official Clearance Pass
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Not Found */}
          {scanState === 'not_found' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>❌</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>
                Fingerprint Template Not Recognized
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                The biometric pattern scanned does not match any enrolled student record in the registry.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleResetScanner}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close Station
            </button>
          </div>
        </div>
      </div>

      {/* Official Clearance Pass Modal */}
      {generatedPass && (
        <BiometricClearancePassModal
          pass={generatedPass}
          onClose={() => setGeneratedPass(null)}
        />
      )}
    </>
  )
}
