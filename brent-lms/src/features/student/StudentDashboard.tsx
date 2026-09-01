import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { CourseCard } from '@/components/shared/CourseCard'
import { AnnouncementCard } from '@/components/shared/AnnouncementCard'
import { Spinner } from '@/components/ui/Spinner'
import { CertificateGenerator } from '@/components/shared/CertificateGenerator'
import { schoolStore } from '@/lib/schoolData'
import type { Course, Enrollment, Announcement } from '@/lib/database.types'

export function StudentDashboard() {
  const { profile } = useAuth()
  const [showCertModal, setShowCertModal] = useState(false)

  // Read current student records from schoolStore
  const allStudents = schoolStore.getStudents()
  const currentStudent =
    allStudents.find((s) => s.admission_number === profile?.admission_number) || null

  const reportCards = schoolStore.getReportCards()
  const studentTranscript = currentStudent
    ? reportCards.find(
        (r) => r.admission_number === currentStudent.admission_number || r.student_id === currentStudent.id
      )
    : null

  const currentDayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(
    new Date().toLocaleDateString('en-US', { weekday: 'long' })
  )
    ? new Date().toLocaleDateString('en-US', { weekday: 'long' })
    : 'Monday'

  const todayPeriods = schoolStore
    .getTimetable()
    .filter((p) => p.day_of_week === currentDayOfWeek)
    .slice(0, 3)

  // Fetch enrollments with course details from Supabase (if online)
  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['student-enrollments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return []
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, course:courses(*, subject:subjects(*), teacher:profiles!teacher_id(full_name))')
        .eq('student_id', profile.id)
      if (error) return []
      return (data || []) as unknown as (Enrollment & { course: Course })[]
    },
    enabled: !!profile?.id,
  })

  // Fetch announcements
  const { data: announcements } = useQuery({
    queryKey: ['announcements-student'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, author:profiles!author_id(full_name)')
        .in('target', ['all', 'students'])
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(2)
      if (error) return []
      return (data || []) as Announcement[]
    },
  })

  if (loadingEnrollments) {
    return (
      <PageWrapper title="My Student Dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      title={`Welcome, ${currentStudent?.full_name || profile?.full_name || 'Trainee'}! 👋`}
      subtitle={`Admission No: ${currentStudent?.admission_number || profile?.admission_number || 'N/A'} • ${currentStudent?.class_name || 'Enrolled Student'}`}
    >
      {showCertModal && (
        <CertificateGenerator 
          cert={{
            student_name: currentStudent?.full_name || profile?.full_name || 'Enrolled Trainee',
            admission_number: currentStudent?.admission_number || profile?.admission_number || `EI-${new Date().getFullYear()}-001`,
            course_title: currentStudent?.class_name || 'Comprehensive Practical Short Course',
            grade: studentTranscript?.mean_grade || 'Distinction (A)',
            percentage: studentTranscript?.mean_percentage || 90,
            issue_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            certificate_no: `EI-CERT-${(currentStudent?.admission_number || `${new Date().getFullYear()}`).replace(/[^a-zA-Z0-9]/g, '')}`,
            duration: '4 to 12 Weeks Intensive Practical Training',
            trainer_name: 'Lead Vocational Instructor',
            skills_acquired: ['Hands-on Laboratory Mastery', 'Technical Workflow & Safety', 'Industry Standards'],
          }}
          onClose={() => setShowCertModal(false)} 
        />
      )}

      {/* Top Academic Status Card */}
      <div
        className="card mb-6"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
          color: '#ffffff',
          padding: '1.5rem 2rem',
          border: 'none',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd', fontWeight: 700 }}>
              College Academic Standing: Active Short Course Cohort
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '1.45rem', fontWeight: 800, margin: '0.25rem 0 0.4rem' }}>
              {studentTranscript ? `${studentTranscript.mean_grade} — Mean: ${studentTranscript.mean_percentage}%` : 'Enrolled — In Progress'}
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0 }}>
              {studentTranscript
                ? `Rank #${studentTranscript.class_position} of ${studentTranscript.total_students_in_class} in Class`
                : 'Modular practical assessments and final evaluation grades will appear here upon completion.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {currentStudent?.certificate_granted ? (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setShowCertModal(true)}
                style={{ background: '#f59e0b', color: '#090d16', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                title="Your Certificate has been officially granted and verified by the Academic Registrar."
              >
                🎓 Certificate of Completion (Granted ✓)
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled
                  title="Certificate locked: Awaiting course evaluation and graduation clearance by the College Administrator."
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#cbd5e1',
                    fontWeight: 700,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  🔒 Certificate (Pending Admin Clearance)
                </button>
              </div>
            )}
            <Link to="/exams" className="btn btn-sm" style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}>
              📜 View Official Transcript
            </Link>
            <Link to="/fees" className="btn btn-sm" style={{ background: '#22c55e', color: '#ffffff', fontWeight: 700 }}>
              💳 Tuition Statement
            </Link>
          </div>
        </div>
      </div>

      {/* Student Personal KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Lecture Attendance</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {currentStudent ? `${currentStudent.attendance_rate}%` : '0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>
            {currentStudent && currentStudent.attendance_rate >= 75 ? '✓ Meets Exam Minimum (75%)' : 'Attendance Logged Daily'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Fee Clearance</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: currentStudent?.fee_cleared ? '#16a34a' : '#ea580c', marginTop: '0.25rem' }}>
            {currentStudent ? (currentStudent.fee_cleared ? 'Cleared' : `$${currentStudent.fee_balance.toLocaleString()}`) : '$0'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            {currentStudent?.fee_cleared ? 'Exam Card Active' : 'Pay Online / Bursar'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Registered Course Units</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.25rem' }}>
            {schoolStore.getRegisteredUnitsForStudent(currentStudent?.admission_number || profile?.admission_number || '').length} Units
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            {schoolStore.getRegistrationForStudent(currentStudent?.admission_number || profile?.admission_number || '') ? '✓ Formally Cleared' : 'Pending Registration'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ea580c' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Merits & Conduct</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ea580c', marginTop: '0.25rem' }}>
            ⭐ {currentStudent?.merits_count || 0} Merits
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>Conduct Index: 100/100</div>
        </div>
      </div>

      {/* Today's Schedule Preview & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Schedule */}
        <div className="card" style={{ padding: '1.25rem', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>📅 Today’s Lecture Schedule</h3>
            <Link to="/timetable" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              View Full Week →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {todayPeriods.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                No active lectures scheduled for today. Check your full timetable for upcoming practical lab sessions.
              </div>
            ) : (
              todayPeriods.map((period) => (
                <div
                  key={period.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'var(--color-bg-secondary)',
                    borderLeft: `4px solid ${period.color_hex || '#2563eb'}`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      <span style={{ color: period.color_hex || '#2563eb', marginRight: '6px' }}>{period.subject_code}</span>
                      {period.subject_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      📍 {period.room} • 👨‍🏫 Lecturer: {period.teacher_name}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {period.start_time} - {period.end_time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>⚡ Student Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/student/courses" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
              📚 Online Lessons & LMS
            </Link>
            <Link to="/exams" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
              📜 Download Transcript PDF
            </Link>
            <Link to="/fees" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
              💳 Pay Tuition via M-Pesa
            </Link>
            <Link to="/library" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
              📖 Past Papers & Lab Manuals
            </Link>
            <Link to="/noticeboard" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
              📢 Student Noticeboard
            </Link>
          </div>
        </div>
      </div>

      {/* Online LMS Courses Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)', margin: 0 }}>
            📖 Active Online Course Units & Live Classes
          </h2>
          <Link to="/student/courses" className="btn btn-sm btn-outline">
            Browse All Units ({schoolStore.getCourseUnits().length}) →
          </Link>
        </div>

        {schoolStore.getCourseUnits().length === 0 && (!enrollments || enrollments.length === 0) ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No courses published yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schoolStore.getCourseUnits().slice(0, 6).map((unit) => (
              <div key={unit.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span className="badge badge-primary" style={{ fontWeight: 800 }}>{unit.code}</span>
                    <span className="badge badge-info">{unit.credit_hours} Credits</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--color-text-primary)' }}>
                    {unit.title}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.65rem' }}>
                    👨‍🏫 {unit.teacher_name} • {unit.department}
                  </div>
                  {unit.live_schedule_text && (
                    <div style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1e3a8a', padding: '3px 6px', borderRadius: '4px', marginBottom: '0.65rem' }}>
                      📅 {unit.live_schedule_text}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.65rem' }}>
                  {unit.live_meeting_url && (
                    <a
                      href={unit.live_meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs"
                      style={{ background: '#059669', color: '#ffffff', fontWeight: 700, flex: 1, textAlign: 'center' }}
                    >
                      🎥 Live Meet ↗
                    </a>
                  )}
                  <Link
                    to={`/student/lesson/${unit.lessons?.[0]?.id || unit.id}`}
                    className="btn btn-xs btn-primary"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    📚 Open LMS
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcements */}
      {announcements && announcements.length > 0 && (
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', color: 'var(--color-primary)' }}>
            📢 College Circulars & Announcements
          </h2>
          <div className="flex flex-col gap-3">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
