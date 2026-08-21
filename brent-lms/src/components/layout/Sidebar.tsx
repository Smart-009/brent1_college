import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { RoleBadge } from '@/components/ui/Badge'

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  if (!profile) return null

  // Role-Specific Navigation Definitions
  const studentNav = [
    { to: '/student', label: 'Student Dashboard', icon: '🏠' },
    { to: '/student/courses', label: 'My Units & Lessons', icon: '📚' },
    { to: '/timetable', label: 'My Lecture Timetable', icon: '📅' },
    { to: '/exams', label: 'My Academic Transcript', icon: '📜' },
    { to: '/fees', label: 'My Fee Statement & Paybill', icon: '💳' },
    { to: '/library', label: 'E-Library & Past Papers', icon: '📖' },
    { to: '/noticeboard', label: 'Student Noticeboard', icon: '📢' },
  ]

  const teacherNav = [
    { to: '/teacher', label: 'Faculty Dashboard', icon: '👩‍🏫' },
    { to: '/teacher/courses', label: 'My Courses & Modules', icon: '📖' },
    { to: '/teacher/attendance', label: 'Mark Class Attendance', icon: '📋' },
    { to: '/teacher/gradebook', label: 'Continuous Gradebook', icon: '💯' },
    { to: '/timetable', label: 'Faculty Timetable', icon: '📅' },
    { to: '/discipline', label: 'Student Merits Registry', icon: '⭐' },
    { to: '/noticeboard', label: 'College Noticeboard', icon: '📢' },
  ]

  const parentNav = [
    { to: '/parent', label: 'Ward Overview & Attendance', icon: '👨‍👩‍👧' },
    { to: '/exams', label: 'Ward Academic Transcript', icon: '📄' },
    { to: '/fees', label: 'Fee Clearance (M-Pesa 247247)', icon: '💳' },
    { to: '/timetable', label: "Ward's Lecture Schedule", icon: '📅' },
    { to: '/noticeboard', label: 'College Circulars', icon: '📢' },
  ]

  const bursarNav = [
    { to: '/bursar', label: 'Bursar & Admissions Desk', icon: '💼' },
    { to: '/students', label: 'Student SIS & Admissions', icon: '🎓' },
    { to: '/fees', label: 'Fee Structures & Invoices', icon: '💳' },
    { to: '/timetable', label: 'Lecture Timetable', icon: '📅' },
    { to: '/noticeboard', label: 'Publish Circulars & Notices', icon: '📢' },
  ]

  const adminNav = [
    { to: '/admin', label: 'Principal Executive Desk', icon: '⚙️' },
    { to: '/students', label: 'Students SIS Directory', icon: '🎓' },
    { to: '/bursar', label: 'Bursar & Admissions Desk', icon: '💼' },
    { to: '/timetable', label: 'Master Lecture Timetable', icon: '📅' },
    { to: '/exams', label: 'Exams & Transcripts Board', icon: '📜' },
    { to: '/fees', label: 'Tuition Fees Management', icon: '💳' },
    { to: '/library', label: 'E-Library & Courseware', icon: '📖' },
    { to: '/noticeboard', label: 'College Noticeboard', icon: '📢' },
    { to: '/discipline', label: 'Discipline & Merits', icon: '⭐' },
    { to: '/admin/users', label: 'Staff & Faculty Accounts', icon: '👤' },
    { to: '/admin/classes', label: 'Academic Programs & Cohorts', icon: '🏫' },
    { to: '/admin/subjects', label: 'Curriculum Course Units', icon: '🧪' },
    { to: '/admin/terms', label: 'Intake Batches & Schedules', icon: '📅' },
  ]

  const roleNavMap: Record<string, { label: string; links: typeof studentNav }> = {
    student: { label: '🎓 Student Portal', links: studentNav },
    teacher: { label: '👩‍🏫 Faculty Desk', links: teacherNav },
    parent: { label: '👨‍👩‍👧 Guardian Portal', links: parentNav },
    bursar: { label: '💼 Bursar & Admissions Desk', links: bursarNav },
    admin: { label: '🛡️ Institutional Administration', links: adminNav },
  }

  const currentSection = roleNavMap[profile.role] || roleNavMap.student

  const handleSignOut = async () => {
    onClose()
    await signOut()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="sidebar-section-label" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
          {currentSection.label}
        </div>
        {currentSection.links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/student' || link.to === '/teacher' || link.to === '/parent' || link.to === '/admin' || link.to === '/bursar' || link.to === '/secretary'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      {/* User Account & Prominent Logout Section */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
          margin: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            {profile.full_name[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.full_name}
            </div>
            <RoleBadge role={profile.role} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="btn btn-sm btn-full"
          style={{
            background: '#dc2626',
            color: '#ffffff',
            fontWeight: 800,
            border: 'none',
            borderRadius: '8px',
            padding: '0.55rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
          }}
        >
          <span>🚪</span>
          <span>Log Out of System</span>
        </button>
      </div>
    </aside>
  )
}
