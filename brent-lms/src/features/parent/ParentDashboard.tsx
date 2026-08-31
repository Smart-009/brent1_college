import { useState } from 'react'
import { schoolStore } from '@/lib/schoolData'
import type { ReportCard, StudentRecord } from '@/types/school'
import { ReportCardGenerator } from '@/features/exams/ReportCardGenerator'
import { Link } from 'react-router-dom'

export function ParentDashboard() {
  const [students] = useState<StudentRecord[]>(() => schoolStore.getStudents())
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '')
  const [reportCards] = useState<ReportCard[]>(() => schoolStore.getReportCards())
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [appointmentSent, setAppointmentSent] = useState(false)

  const activeWard = students.find((s) => s.id === selectedStudentId) || students[0]
  const wardReportCard = activeWard ? reportCards.find((r) => r.student_id === activeWard.id || r.admission_number === activeWard.admission_number) : null

  if (students.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Parent & Sponsor Academic Portal</h1>
          <p className="page-subtitle">
            Live attendance tracking, modular course progress, fee clearance statements, and trainer communications.
          </p>
        </div>
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>No Trainees Currently Enrolled</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1.5rem' }}>
            Once the Admissions Office enrolls your student into a practical short course cohort, their verified attendance, practical lab performance, course transcripts, and fee statements will appear here.
          </p>
          <Link to="/secretary" className="btn btn-primary">
            Go to Admissions Desk →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Parent & Sponsor Academic Portal</h1>
          <p className="page-subtitle">
            Live attendance tracking, modular course evaluations, fee receipts, and trainer communications for your sponsored trainee.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Ward:</label>
          <select
            className="input"
            style={{ width: '240px' }}
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.class_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ward Profile Banner */}
      {activeWard && (
        <div
          className="card mb-6"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
            color: '#fff',
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#3b82f6',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 700,
                border: '3px solid rgba(255,255,255,0.3)',
              }}
            >
              {activeWard.full_name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd', fontWeight: 600 }}>
                Enrolled Ward Profile
              </div>
              <h2 style={{ margin: '0.2rem 0', fontSize: '1.4rem', fontWeight: 700 }}>{activeWard.full_name}</h2>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Adm No: <strong>{activeWard.admission_number}</strong> • {activeWard.class_name} ({activeWard.grade_level})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}
              onClick={() => setShowAppointmentModal(true)}
            >
              ✉️ Message Course Tutor
            </button>
            {wardReportCard && (
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#22c55e', color: '#ffffff', fontWeight: 700 }}
                onClick={() => setSelectedReportCard(wardReportCard)}
              >
                📄 View Official Transcript
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ward Status KPIs */}
      {activeWard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Lecture Attendance Rate</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
              {activeWard.attendance_rate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>✓ Above Minimum Requirement</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Fee Clearance Status</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: activeWard.fee_cleared ? '#16a34a' : '#ea580c', marginTop: '0.25rem' }}>
              {activeWard.fee_cleared ? 'Cleared' : `$${activeWard.fee_balance.toLocaleString()}`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              {activeWard.fee_cleared ? '0.00 Balance Outstanding' : 'Due for Current Course Period'}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #7c3aed' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Academic Standing</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#7c3aed', marginTop: '0.25rem' }}>
              {wardReportCard ? wardReportCard.mean_grade : 'In Progress'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              {wardReportCard ? `Rank #${wardReportCard.class_position} in Class` : 'Short Course Active'}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ea580c' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Discipline & Conduct</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ea580c', marginTop: '0.25rem' }}>
              {activeWard.discipline_points}/100
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>
              ⭐ {activeWard.merits_count} Merit Awards
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="modal-overlay" onClick={() => setShowAppointmentModal(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Book Consultation with Head of Department</h3>
              <button type="button" className="modal-close" onClick={() => setShowAppointmentModal(false)}>✕</button>
            </div>
            {appointmentSent ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>Meeting Request Sent!</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  The Departmental Secretary will confirm your meeting schedule via SMS shortly.
                </p>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => { setAppointmentSent(false); setShowAppointmentModal(false); }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setAppointmentSent(true); }}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Ward Name</label>
                    <input type="text" className="input" disabled value={activeWard?.full_name} />
                  </div>
                  <div>
                    <label className="label">Preferred Meeting Date</label>
                    <input type="date" required className="input" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="label">Meeting Topic / Inquiries</label>
                    <textarea rows={3} required className="input" placeholder="e.g. Discuss academic performance progress and project review..." />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAppointmentModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Consultation Request</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Transcript Printable Modal */}
      {selectedReportCard && (
        <ReportCardGenerator reportCard={selectedReportCard} onClose={() => setSelectedReportCard(null)} />
      )}
    </div>
  )
}
