// ============================================================
// Brent College — Student Biometric Fingerprint Enrollment Modal
// ============================================================

import React, { useState } from 'react'
import { schoolStore } from '@/lib/schoolData'
import { simulateHardwareScan, type FingerOption } from '@/lib/biometricEngine'
import type { StudentRecord } from '@/types/school'

interface Props {
  student: StudentRecord
  officerName: string
  onClose: () => void
  onEnrolled: (updatedStudent: StudentRecord) => void
}

export const BiometricEnrollModal: React.FC<Props> = ({ student, officerName, onClose, onEnrolled }) => {
  const [selectedFinger, setSelectedFinger] = useState<FingerOption>(
    (student.biometric_finger_name as FingerOption) || 'Right Index'
  )
  const [step, setStep] = useState<'idle' | 'scanning' | 'success'>('idle')
  const [scanStatusText, setScanStatusText] = useState('Place student finger on biometric optical scanner sensor.')
  const [scanProgress, setScanProgress] = useState(0)
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null)
  const [enrolledStudent, setEnrolledStudent] = useState<StudentRecord | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleStartEnrollment = async () => {
    setStep('scanning')
    setScanProgress(0)

    try {
      const scanResult = await simulateHardwareScan((label, pct) => {
        setScanStatusText(label)
        setScanProgress(pct)
      })

      setIsSaving(true)
      const updated = await schoolStore.enrollStudentBiometric(student.id, selectedFinger, officerName)
      setConfidenceScore(scanResult.confidenceScore)
      setEnrolledStudent(updated)
      setStep('success')
    } catch (err: any) {
      alert(`Enrollment failed: ${err?.message || 'Unknown error'}`)
      setStep('idle')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinish = () => {
    if (enrolledStudent) {
      onEnrolled(enrolledStudent)
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-md"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: '1.75rem' }}
      >
        <div className="modal-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem' }}>
          <div>
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🖐️</span> Enroll Student Fingerprint
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Register biometric template for instant fee clearance & payment verification.
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Student Preview Card */}
        <div
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            {student.full_name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{student.full_name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Adm: <strong style={{ color: 'var(--color-primary)' }}>{student.admission_number}</strong> • {student.class_name}
            </div>
          </div>
          {student.biometric_enrolled && (
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
              Already Enrolled
            </span>
          )}
        </div>

        {/* Step: IDLE / CONFIGURATION */}
        {step === 'idle' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                Select Finger to Enroll:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { id: 'Right Index', label: '👉 Right Index Finger' },
                  { id: 'Right Thumb', label: '👍 Right Thumb' },
                  { id: 'Left Index', label: '👈 Left Index Finger' },
                  { id: 'Left Thumb', label: '👍 Left Thumb' },
                  { id: 'Right Middle', label: '🖐️ Right Middle' },
                  { id: 'Left Middle', label: '🖐️ Left Middle' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`btn btn-sm ${selectedFinger === f.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
                    onClick={() => setSelectedFinger(f.id as FingerOption)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Sensor Touch Target */}
            <div
              style={{
                border: '2px dashed var(--color-primary)',
                borderRadius: '12px',
                padding: '1.75rem 1rem',
                textAlign: 'center',
                background: 'rgba(30, 58, 138, 0.03)',
                cursor: 'pointer',
                marginBottom: '1.25rem',
                transition: 'all 0.2s ease',
              }}
              onClick={handleStartEnrollment}
            >
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: 'rgba(30, 58, 138, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  fontSize: '2.5rem',
                }}
              >
                🖐️
              </div>
              <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                Click to Scan & Enroll Biometric
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Hardware Optical / WebAuthn Sensor Ready
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1rem', padding: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleStartEnrollment}>
                Start Fingerprint Capture
              </button>
            </div>
          </div>
        )}

        {/* Step: SCANNING ANIMATION */}
        {step === 'scanning' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            {/* Glowing Sensor Animation */}
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Laser Scan Line */}
              <div
                style={{
                  position: 'absolute',
                  top: `${scanProgress}%`,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: '#22c55e',
                  boxShadow: '0 0 10px #22c55e',
                  transition: 'top 0.25s linear',
                }}
              />
              <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🖐️</span>
            </div>

            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
              Scanning {selectedFinger}...
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              {scanStatusText}
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'var(--color-bg-secondary)',
                borderRadius: '999px',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
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
            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '0.5rem' }}>
              {scanProgress}% Capturing Minutiae Ridges
            </div>
          </div>
        )}

        {/* Step: SUCCESS */}
        {step === 'success' && enrolledStudent && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f0fdf4',
                border: '2px solid #22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                fontSize: '2rem',
                color: '#16a34a',
              }}
            >
              ✓
            </div>

            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', marginBottom: '0.35rem' }}>
              Biometric Fingerprint Successfully Enrolled!
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Student is now registered for biometric fee clearance and rapid payment authentication.
            </p>

            <div
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                textAlign: 'left',
                fontSize: '0.82rem',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
              }}
            >
              <div><strong>Registered Finger:</strong> {enrolledStudent.biometric_finger_name}</div>
              <div><strong>Template Signature:</strong> <code style={{ fontSize: '0.75rem' }}>{enrolledStudent.biometric_template_hash}</code></div>
              <div><strong>Scanner Match Confidence:</strong> <strong style={{ color: '#16a34a' }}>{confidenceScore}% Quality Score</strong></div>
              <div><strong>Enrolled By:</strong> {officerName}</div>
            </div>

            <div className="modal-footer" style={{ padding: 0 }}>
              <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleFinish}>
                Done & Apply Biometrics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
