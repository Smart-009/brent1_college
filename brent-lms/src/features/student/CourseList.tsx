import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { schoolStore, schoolEventBus } from '@/lib/schoolData'
import { UnitRegistrationSlip } from '@/components/shared/UnitRegistrationSlip'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'
import type { CourseUnit } from '@/types/school'

export function CourseList() {
  const { profile } = useAuth()
  const [selectedUnit, setSelectedUnit] = useState<CourseUnit | null>(null)
  const [enrollUnit, setEnrollUnit] = useState<CourseUnit | null>(null)
  const [showSlipModal, setShowSlipModal] = useState(false)
  const [viewMode, setViewMode] = useState<'my_courses' | 'all_catalog'>('my_courses')
  const [version, setVersion] = useState(0)

  // Enrollment checkout state
  const [mpesaCode, setMpesaCode] = useState('')
  const [paymentPhone, setPaymentPhone] = useState('')
  const [isProcessingEnrollment, setIsProcessingEnrollment] = useState(false)
  const [enrollSuccessMsg, setEnrollSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const handleSync = () => {
      if (isMounted) setVersion((v) => v + 1)
    }

    schoolStore.syncWithCloud(true).then(handleSync).catch(() => {})

    const unsubStd = schoolEventBus.subscribe('STUDENT_UPDATED', handleSync)
    const unsubReg = schoolEventBus.subscribe('UNIT_REGISTRATION_COMPLETED' as any, handleSync)
    const unsubPay = schoolEventBus.subscribe('PAYMENT_RECORDED', handleSync)
    const unsubCourse = schoolEventBus.subscribe('COURSE_UNIT_CREATED' as any, handleSync)

    window.addEventListener('eclat-data-synced', handleSync)
    window.addEventListener('eclat-courses-updated', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      isMounted = false
      unsubStd()
      unsubReg()
      unsubPay()
      unsubCourse()
      window.removeEventListener('eclat-data-synced', handleSync)
      window.removeEventListener('eclat-courses-updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Fetch registration for the current student
  const studentIdentifier = profile?.admission_number || profile?.id || ''
  const registrationSlip = schoolStore.getRegistrationForStudent(studentIdentifier)
  const registeredUnits = schoolStore.getRegisteredUnitsForStudent(studentIdentifier)
  const allUnits = schoolStore.getCourseUnits().filter((u) => u.is_published !== false)
  const displayedUnits = viewMode === 'my_courses' ? registeredUnits : allUnits

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollUnit || !studentIdentifier) return
    setIsProcessingEnrollment(true)

    try {
      // 1. Add course to student program
      await schoolStore.addCourseToStudentProgram(studentIdentifier, enrollUnit.id)

      // 2. Record fee payment if code provided
      if (mpesaCode.trim()) {
        const feeAmount = enrollUnit.course_fee || 15000
        await schoolStore.recordPayment({
          id: `pay-mpesa-${Date.now()}`,
          receipt_number: `RCT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
          student_id: profile?.id || studentIdentifier,
          student_name: profile?.full_name || 'Enrolled Student',
          admission_number: profile?.admission_number || studentIdentifier,
          amount: feeAmount,
          payment_method: 'M-Pesa',
          reference_code: mpesaCode.trim().toUpperCase(),
          payment_reference: mpesaCode.trim().toUpperCase(),
          paid_by: profile?.full_name || 'Self',
          balance_after: 0,
          payment_date: new Date().toISOString().split('T')[0],
          description: `Course Enrollment Fee: ${enrollUnit.title}`,
          recorded_by: 'Online M-Pesa Portal Gateway',
        })
      }

      setEnrollSuccessMsg(`🎉 Successfully enrolled in ${enrollUnit.title}! Your course units and lecture materials are now active.`)
      setTimeout(() => {
        setEnrollUnit(null)
        setEnrollSuccessMsg(null)
        setMpesaCode('')
        setPaymentPhone('')
        setViewMode('my_courses')
        setVersion((v) => v + 1)
      }, 2000)
    } catch (err: any) {
      alert('Enrollment error: ' + (err.message || 'Could not complete registration'))
    } finally {
      setIsProcessingEnrollment(false)
    }
  }

  return (
    <PageWrapper
      title="My Accredited Course Units & LMS"
      subtitle="Access your enrolled training course, lecture materials, and live interactive video sessions."
    >
      {/* Unit Registration Clearance Banner */}
      {registrationSlip && registeredUnits.length > 0 ? (
        <div
          className="card mb-6"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
            color: '#ffffff',
            padding: '1.5rem 2rem',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd', fontWeight: 700 }}>
                Official Clearance Slip: {registrationSlip.receipt_number}
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0' }}>
                {registeredUnits.length} Course Unit(s) Enrolled ({registrationSlip.total_credits || registeredUnits.reduce((a, b) => a + (b.credit_hours || 0), 0)} Credits)
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>
                Training Period: <strong>{registrationSlip.course_duration || registrationSlip.semester || 'Short Course'}</strong> • Fee Status: <strong style={{ color: '#86efac' }}>{registrationSlip.fee_clearance_status}</strong>
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}
              onClick={() => setShowSlipModal(true)}
            >
              📄 View Official Registration & Exam Slip
            </button>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${viewMode === 'my_courses' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setViewMode('my_courses')}
        >
          🎓 My Enrolled Courses ({registeredUnits.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${viewMode === 'all_catalog' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setViewMode('all_catalog')}
        >
          🌐 Browse Full College Catalog ({allUnits.length})
        </button>
      </div>

      {/* List of Cleared Course Units */}
      {displayedUnits.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '1rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            {viewMode === 'my_courses' ? 'No Enrolled Courses Found' : 'No Catalog Courses Available'}
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1.5rem' }}>
            {viewMode === 'my_courses'
              ? 'You do not have any enrolled courses in your current program. Browse the college catalog below to select and enroll in additional courses.'
              : 'The college course catalog is currently being updated by academic administrators.'}
          </p>
          {viewMode === 'my_courses' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setViewMode('all_catalog')}
            >
              🌐 Browse College Course Catalog ({allUnits.length}) →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedUnits.map((unit) => {
            const isEnrolled = registeredUnits.some(
              (ru) => ru.id === unit.id || ru.code?.toLowerCase() === unit.code?.toLowerCase()
            )
            const feeDisplay = unit.course_fee ? `KES ${unit.course_fee.toLocaleString()}` : 'KES 15,000'

            return (
              <div
                key={unit.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isEnrolled ? '1.5px solid rgba(37, 99, 235, 0.25)' : '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span className="badge badge-primary" style={{ fontWeight: 800 }}>{unit.code}</span>
                      <span className="badge badge-info">{unit.credit_hours} Credits</span>
                    </div>
                    {isEnrolled ? (
                      <span className="badge badge-success" style={{ fontWeight: 700 }}>
                        ✓ Enrolled
                      </span>
                    ) : (
                      <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 800 }}>
                        Fee: {feeDisplay}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>
                    {unit.title}
                  </h3>

                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                    👨‍🏫 Lecturer: <strong>{unit.teacher_name}</strong> • <strong style={{ color: 'var(--color-primary)' }}>{unit.course_duration || unit.semester || 'Short Course'}</strong>
                  </div>

                  {unit.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: '0 0 1rem' }}>
                      {unit.description}
                    </p>
                  )}

                  {/* Modules breakdown */}
                  <div style={{ background: 'var(--color-bg-secondary)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Curriculum Modules ({unit.syllabus_modules?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
                      {unit.syllabus_modules?.slice(0, 3).map((m) => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>• {m.title}</span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{m.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    🎥 {unit.lessons?.length || 0} Lessons & Labs
                  </span>
                  {isEnrolled ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedUnit(unit)}
                    >
                      🚀 Open Course Unit
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ background: '#16a34a', color: '#ffffff', fontWeight: 800 }}
                      onClick={() => setEnrollUnit(unit)}
                    >
                      💳 Enroll & Pay ({feeDisplay})
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Unit Lessons Modal */}
      {selectedUnit && (
        <div className="modal-overlay" onClick={() => setSelectedUnit(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-primary">{selectedUnit.code}</span>
                <h3 className="modal-title" style={{ marginTop: '0.25rem' }}>{selectedUnit.title}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Lecturer: {selectedUnit.teacher_name} • {selectedUnit.credit_hours} Credit Hours
                </p>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedUnit(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  Syllabus Learning Modules
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedUnit.syllabus_modules?.map((m) => (
                    <div key={m.id} style={{ background: 'var(--color-bg-secondary)', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                        <span>Module {m.module_number}: {m.title}</span>
                        <span className="badge badge-info">{m.hours} Hours</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        <strong>Topics:</strong> {m.topics?.join(', ') || 'Practical lab exercises'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  Video Lessons & Materials
                </h4>
                {selectedUnit.lessons?.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>No video lessons uploaded yet for this unit.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedUnit.lessons?.map((les, idx) => (
                      <div
                        key={les.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          background: 'var(--color-bg-secondary)',
                          borderRadius: '6px',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>Lesson {idx + 1}: {les.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            ⏱️ Duration: {les.duration_minutes} minutes {les.video_url ? '• 🎥 Video Available' : ''}
                          </div>
                        </div>
                        {les.video_url ? (
                          <Link
                            to={`/student/lesson/${les.id}`}
                            className="btn btn-primary btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            ▶️ Play Video in LMS
                          </Link>
                        ) : (
                          <Link
                            to={`/student/lesson/${les.id}`}
                            className="btn btn-secondary btn-xs"
                          >
                            📖 Read Notes
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedUnit(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Enrollment & Payment Checkout Modal */}
      {enrollUnit && (
        <div className="modal-overlay" onClick={() => setEnrollUnit(null)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-primary">{enrollUnit.code}</span>
                <h3 className="modal-title" style={{ marginTop: '0.25rem' }}>Enroll in {enrollUnit.title}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Accredited Short Course • {enrollUnit.credit_hours} Credits • {enrollUnit.course_duration || '3 Months'}
                </p>
              </div>
              <button type="button" className="modal-close" onClick={() => setEnrollUnit(null)}>✕</button>
            </div>

            <form onSubmit={handleEnrollSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {enrollSuccessMsg ? (
                  <div className="alert alert-success">
                    <span>{enrollSuccessMsg}</span>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
                        color: '#ffffff',
                        padding: '1.25rem',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 700 }}>
                        Tuition & Certification Fee
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0.25rem 0' }}>
                        {enrollUnit.course_fee ? `KES ${enrollUnit.course_fee.toLocaleString()}` : 'KES 15,000'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                        Includes full video lecture access, downloadable interactive labs, lecturer support, and official certificate.
                      </div>
                    </div>

                    <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                        📲 Official M-Pesa Payment Instructions:
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        1. Go to M-Pesa → Lipa na M-Pesa → <strong>Paybill</strong><br />
                        2. Business No: <strong>{INSTITUTION_CONFIG.bank.paybillNumber}</strong> ({INSTITUTION_CONFIG.bank.name})<br />
                        3. Account No: <strong>{INSTITUTION_CONFIG.bank.accountNumber}</strong><br />
                        4. Account Name: <strong>{INSTITUTION_CONFIG.bank.accountName}</strong><br />
                        5. Enter Amount and M-Pesa PIN, then enter your M-Pesa Confirmation Code below:
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="mpesaCode">M-Pesa Confirmation Code</label>
                      <input
                        id="mpesaCode"
                        type="text"
                        className="form-input"
                        placeholder="e.g. TKB78190XZ (or leave blank to request bursar invoice)"
                        value={mpesaCode}
                        onChange={(e) => setMpesaCode(e.target.value)}
                        style={{ textTransform: 'uppercase', fontWeight: 700 }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="paymentPhone">Student M-Pesa Phone Number</label>
                      <input
                        id="paymentPhone"
                        type="tel"
                        className="form-input"
                        placeholder="e.g. 0712 345 678"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {!enrollSuccessMsg && (
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEnrollUnit(null)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isProcessingEnrollment}
                    style={{ fontWeight: 800 }}
                  >
                    {isProcessingEnrollment ? 'Registering...' : '✅ Complete Course Enrollment'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Official Unit Registration Slip Modal */}
      {showSlipModal && registrationSlip && (
        <UnitRegistrationSlip
          receipt={registrationSlip}
          onClose={() => setShowSlipModal(false)}
        />
      )}
    </PageWrapper>
  )
}
