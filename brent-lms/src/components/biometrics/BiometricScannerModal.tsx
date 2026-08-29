// ============================================================
// Brent College — Real Biometric Fingerprint Fee Verification Station
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import { schoolStore } from '@/lib/schoolData'
import {
  executeRealBiometricScan,
  isWebAuthnAvailable,
  isWebUSBAvailable,
  isMobileDevice,
  triggerHaptic,
  connectWebUSBFingerprintScanner,
  evaluateFeeClearance,
  createClearancePass,
  type BiometricMode,
  type RealBiometricDevice,
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
  const isMobile = isMobileDevice()
  const [students, setStudents] = useState<StudentRecord[]>(() => schoolStore.getStudents())
  const [biometricMode, setBiometricMode] = useState<BiometricMode>('webauthn')
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.find((s) => s.biometric_enrolled)?.id || students[0]?.id || ''
  )
  const [scanState, setScanState] = useState<'ready' | 'scanning' | 'matched' | 'not_found'>('ready')
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatusText, setScanStatusText] = useState('Biometric Sensor Ready.')
  const [matchedStudent, setMatchedStudent] = useState<StudentRecord | null>(null)
  const [confidenceScore, setConfidenceScore] = useState(99.4)
  const [usedDeviceName, setUsedDeviceName] = useState<string>(isMobile ? '📱 Phone Hardware Fingerprint Scanner' : 'Platform Biometric Sensor')
  const [connectedUsbDev, setConnectedUsbDev] = useState<RealBiometricDevice | null>(null)
  const [selectedPurpose, setSelectedPurpose] = useState<BiometricFeeClearancePass['purpose']>('Exam Entry')
  const [generatedPass, setGeneratedPass] = useState<BiometricFeeClearancePass | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPressingSensor, setIsPressingSensor] = useState(false)

  const pressTimerRef = useRef<any>(null)
  const holdProgressRef = useRef(0)

  useEffect(() => {
    isWebAuthnAvailable().then((avail) => {
      if (!avail && biometricMode === 'webauthn') {
        // Keep webauthn or fallback with explanation
      }
    })
  }, [isMobile])

  const handleConnectUsbDevice = async () => {
    try {
      setErrorMessage(null)
      const dev = await connectWebUSBFingerprintScanner()
      setConnectedUsbDev(dev)
      setBiometricMode('webusb')
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to connect USB optical scanner.')
    }
  }

  // Start Real Fingerprint Verification via Phone's Native Biometrics
  const handleScanFingerprint = async (targetStudent?: StudentRecord, chosenMode: BiometricMode = biometricMode) => {
    const studentToMatch = targetStudent || students.find((s) => s.id === selectedStudentId)
    setErrorMessage(null)
    setScanState('scanning')
    setScanProgress(30)
    setScanStatusText(isMobile ? "Waiting for phone fingerprint touch..." : "Waiting for biometric sensor...")

    try {
      const scanRes = await executeRealBiometricScan({
        mode: chosenMode,
        action: 'verify',
        student: studentToMatch,
        connectedUsbDevice: connectedUsbDev,
        onProgress: (label, pct) => {
          setScanStatusText(label)
          setScanProgress(pct)
        },
      })

      if (studentToMatch) {
        setConfidenceScore(scanRes.confidenceScore)
        setUsedDeviceName(scanRes.deviceUsed)
        setMatchedStudent(studentToMatch)
        setScanState('matched')
      } else {
        setScanState('not_found')
      }
    } catch (err: any) {
      console.error('Biometric scan failed:', err)
      let msg = err?.message || 'Fingerprint verification failed.'
      if (err?.name === 'NotAllowedError') {
        msg = "Phone fingerprint sensor cancelled or timed out. Please tap 'Scan Phone Fingerprint' and place your registered finger on your phone's physical sensor."
      } else if (err?.name === 'SecurityError' || err?.name === 'NotSupportedError') {
        msg = "Your phone's hardware biometric sensor requires a Secure HTTPS connection (e.g. your live website URL). You can also use the Touch Sensor below."
      }
      setErrorMessage(msg)
      setScanState('ready')
    }
  }

  // Issue Official Clearance Pass
  const handleIssueClearancePass = async () => {
    if (!matchedStudent) return
    const pass = createClearancePass(matchedStudent, officerName, selectedPurpose, confidenceScore, usedDeviceName)
    await schoolStore.saveBiometricClearanceLog(pass)
    setGeneratedPass(pass)
  }

  const handleResetScanner = () => {
    setScanState('ready')
    setMatchedStudent(null)
    setScanProgress(0)
    setErrorMessage(null)
    setScanStatusText('Biometric Sensor Ready.')
  }

  const enrolledStudents = students.filter((s) => s.biometric_enrolled)
  const feeEval = matchedStudent
    ? evaluateFeeClearance(matchedStudent.term_fee_total, matchedStudent.fee_balance)
    : null

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, padding: '0.75rem' }}>
        <div
          className="modal-content modal-lg"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: 'clamp(1rem, 3.5vw, 1.75rem)',
            borderRadius: '16px',
          }}
        >
          {/* Header */}
          <div className="modal-header" style={{ marginBottom: '1rem', paddingBottom: '0.65rem' }}>
            <div>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🖐️</span> {isMobile ? "Phone's Fingerprint Fee Station" : 'Biometric Fee Clearance Station'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0 0' }}>
                {isMobile ? "Uses your phone's native physical fingerprint reader to verify student fees." : 'Instant live biometric verification for student exam clearance & security passes.'}
              </p>
            </div>
            <button type="button" className="modal-close" onClick={onClose}>✕</button>
          </div>

          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.8rem',
                marginBottom: '1rem',
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Scanner Interaction Area */}
          {scanState === 'ready' && (
            <div>
              {/* Hardware Biometric Mode Selection */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="label" style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Biometric Sensor Interface:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${biometricMode === 'webauthn' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '0.5rem 0.6rem', textAlign: 'left' }}
                    onClick={() => setBiometricMode('webauthn')}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{isMobile ? "📱 Phone's Fingerprint" : '🖥️ Windows Hello'}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.85 }}>{isMobile ? "Phone's native hardware reader" : 'Platform biometric sensor'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${biometricMode === 'mobile_touch' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '0.5rem 0.6rem', textAlign: 'left' }}
                    onClick={() => setBiometricMode('mobile_touch')}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>🖐️ Touch Sensor</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.85 }}>On-screen capacitive touch</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${biometricMode === 'webusb' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '0.5rem 0.6rem', textAlign: 'left' }}
                    onClick={handleConnectUsbDevice}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>🔌 USB Optical Scanner</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.85 }}>
                        {connectedUsbDev ? connectedUsbDev.name.slice(0, 14) : 'DigitalPersona / SecuGen'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${biometricMode === 'simulation' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', fontSize: '0.75rem', padding: '0.5rem 0.6rem', textAlign: 'left' }}
                    onClick={() => setBiometricMode('simulation')}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>🧪 Lab Test Rig</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.85 }}>Instant verification mode</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Student Selection */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="label" style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Select Student to Verify:
                </label>
                {students.length === 0 ? (
                  <div className="alert alert-warning" style={{ fontSize: '0.82rem' }}>
                    No students currently in the directory. Please add a student in Admissions.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.4rem' }}>
                    <select
                      className="input"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.6rem' }}
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
                      className="btn btn-primary btn-sm"
                      onClick={() => handleScanFingerprint()}
                    >
                      {isMobile ? "📱 Scan Phone Fingerprint" : "🖐️ Touch Scanner"}
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Primary Fingerprint Scanner Action Button */}
              <div
                style={{
                  border: '2px solid #0284c7',
                  borderRadius: '16px',
                  padding: '2rem 1.25rem',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.08) 0%, rgba(2, 132, 199, 0.16) 100%)',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.15)',
                }}
                onClick={() => handleScanFingerprint()}
              >
                <div
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    border: '3px solid #0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.85rem auto',
                    fontSize: '3rem',
                    boxShadow: '0 0 25px rgba(2, 132, 199, 0.35)',
                    transform: 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  🖐️
                </div>
                <div style={{ fontWeight: 900, color: '#0369a1', fontSize: '1.15rem' }}>
                  {isMobile ? "👆 Tap to Open Phone's Fingerprint Scanner" : 'Click to Verify with Physical Biometric Reader'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.35rem' }}>
                  {isMobile ? "Opens your Android / iOS native fingerprint prompt directly" : "Uses Windows Hello, WebUSB, or connected hardware sensor"}
                </div>
              </div>

              {/* Enrolled Students Quick Badges */}
              {enrolledStudents.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                    QUICK SCAN ENROLLED STUDENTS ({enrolledStudents.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '120px', overflowY: 'auto' }}>
                    {enrolledStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="btn btn-secondary btn-xs"
                        style={{ fontSize: '0.74rem', padding: '0.3rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => {
                          setSelectedStudentId(s.id)
                          handleScanFingerprint(s)
                        }}
                      >
                        <span style={{ color: '#16a34a' }}>●</span>
                        <strong>{s.full_name}</strong>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.7rem' }}>({s.admission_number})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Scanner Active Animation */}
          {scanState === 'scanning' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%)',
                  boxShadow: '0 0 30px rgba(2, 132, 199, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
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
                <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🖐️</span>
              </div>

              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                Verifying Biometric Fingerprint...
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
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
                  maxWidth: '360px',
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
              <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, marginTop: '0.4rem' }}>
                {scanProgress}% — Live Physical Fingerprint Verification
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
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>✓</span>
                  <div>
                    <strong style={{ color: '#166534', fontSize: '0.88rem' }}>
                      Biometric Match Confirmed!
                    </strong>
                    <div style={{ fontSize: '0.72rem', color: '#15803d' }}>
                      Sensor: {usedDeviceName} • {confidenceScore}% Match Score
                    </div>
                  </div>
                </div>
                <button type="button" className="btn btn-secondary btn-xs" onClick={handleResetScanner}>
                  🔄 Re-Scan
                </button>
              </div>

              {/* Student Identification Profile */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr',
                  gap: '0.85rem',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.35rem',
                  }}
                >
                  {matchedStudent.full_name.charAt(0)}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {matchedStudent.full_name}
                    </h4>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{matchedStudent.class_name}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                    Adm No: <strong style={{ color: 'var(--color-primary)' }}>{matchedStudent.admission_number}</strong> • Status: {matchedStudent.status}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                    Biometric Hash: <code style={{ fontSize: '0.68rem' }}>{matchedStudent.biometric_template_hash || 'FP-AUTHENTICATED'}</code>
                  </div>
                </div>
              </div>

              {/* Financial Clearance Audit KPIs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.5rem',
                  textAlign: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div className="card" style={{ padding: '0.65rem 0.5rem', background: '#fff' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>TOTAL BILLED</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
                    KES {matchedStudent.term_fee_total.toLocaleString()}
                  </div>
                </div>

                <div className="card" style={{ padding: '0.65rem 0.5rem', background: '#fff' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>TOTAL PAID</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                    KES {Math.max(0, matchedStudent.term_fee_total - matchedStudent.fee_balance).toLocaleString()}
                  </div>
                </div>

                <div className="card" style={{ padding: '0.65rem 0.5rem', background: '#fff' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>BALANCE</div>
                  <div
                    style={{
                      fontSize: '1.05rem',
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
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: feeEval.status === 'CLEARED' ? '#f0fdf4' : feeEval.status === 'CONDITIONAL' ? '#fffbeb' : '#fef2f2',
                  border: `2px solid ${feeEval.color}`,
                  textAlign: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: feeEval.color }}>
                  {feeEval.status === 'CLEARED' && '✓ FEES FULLY CLEARED — 100% AUTHORIZED'}
                  {feeEval.status === 'CONDITIONAL' && '⚠️ CONDITIONAL CLEARANCE — PARTIAL BALANCE OUTSTANDING'}
                  {feeEval.status === 'OVERDUE' && '✕ FEE ARREARS OUTSTANDING — PAYMENT REQUIRED'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '0.2rem' }}>
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
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  background: 'var(--color-bg-secondary)',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Purpose:</label>
                  <select
                    className="input"
                    style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value as any)}
                  >
                    <option value="Exam Entry">Exam Entry</option>
                    <option value="Lab Clearance">Practical Lab</option>
                    <option value="Certificate Collection">Certificate Release</option>
                    <option value="Registration Clearance">Semester Registration</option>
                    <option value="Financial Audit">Audit Verification</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {matchedStudent.fee_balance > 0 && onRecordPayment && (
                    <button
                      type="button"
                      className="btn btn-warning btn-sm"
                      style={{ fontSize: '0.76rem', padding: '0.35rem 0.6rem' }}
                      onClick={() => {
                        onClose()
                        onRecordPayment(matchedStudent)
                      }}
                    >
                      💳 Pay Balance
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.76rem', padding: '0.35rem 0.6rem' }}
                    onClick={handleIssueClearancePass}
                  >
                    🖨️ Issue Pass
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Not Found */}
          {scanState === 'not_found' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>❌</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#dc2626' }}>
                Fingerprint Scan Failed or Not Recognized
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                {errorMessage || 'The physical biometric signature scanned does not match this student record.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetScanner}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.65rem', marginTop: '0.4rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
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

