import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { schoolStore } from '@/lib/schoolData'
import { UnitRegistrationSlip } from '@/components/shared/UnitRegistrationSlip'
import type { CourseUnit } from '@/types/school'

export function CourseList() {
  const { profile } = useAuth()
  const [selectedUnit, setSelectedUnit] = useState<CourseUnit | null>(null)
  const [showSlipModal, setShowSlipModal] = useState(false)
  const [viewMode, setViewMode] = useState<'my_courses' | 'all_catalog'>('my_courses')

  // Fetch registration for the current student
  const studentIdentifier = profile?.admission_number || profile?.id || ''
  const registrationSlip = schoolStore.getRegistrationForStudent(studentIdentifier)
  const registeredUnits = schoolStore.getRegisteredUnitsForStudent(studentIdentifier)
  const allUnits = schoolStore.getCourseUnits().filter((u) => u.is_published !== false)
  const displayedUnits = viewMode === 'my_courses' 
    ? (registeredUnits.length > 0 ? registeredUnits : allUnits.slice(0, 1))
    : allUnits

  return (
    <PageWrapper
      title="My Accredited Course Units & LMS"
      subtitle="Access your enrolled training course, lecture materials, and live interactive video sessions."
    >
      {/* Unit Registration Clearance Banner */}
      {registrationSlip ? (
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
                {registeredUnits.length} Course Unit(s) Enrolled ({registrationSlip.total_credits || 45} Credits)
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
          🎓 My Enrolled Course ({displayedUnits.length})
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>No Enrolled Units Found</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
            You are not currently enrolled in any course units. Please contact the administrator or bursar desk to register your course.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedUnits.map((unit) => (
            <div key={unit.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-primary" style={{ fontWeight: 800 }}>{unit.code}</span>
                  <span className="badge badge-info">{unit.credit_hours} Credits</span>
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
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedUnit(unit)}
                >
                  🚀 Open Course Unit
                </button>
              </div>
            </div>
          ))}
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
