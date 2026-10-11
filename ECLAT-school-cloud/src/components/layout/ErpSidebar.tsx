import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import {
  DashboardIcon,
  StudentsIcon,
  StaffIcon,
  FinanceIcon,
  AcademicsIcon,
  AttendanceIcon,
  TimetableIcon,
  NoticeIcon,
  SettingsIcon,
  LogoutIcon,
  KeyIcon,
  CertificateIcon,
  BookOpenIcon,
  BusIcon,
  ShieldIcon,
  ActivityIcon,
  HeartPulseIcon,
  TicketIcon,
  BarChartIcon,
  AwardIcon,
} from '../common/Icons'

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'staff'
  | 'finance'
  | 'expenses'
  | 'payroll'
  | 'academics'
  | 'cbc'
  | 'analytics'
  | 'attendance'
  | 'timetable'
  | 'library'
  | 'hostel_transport'
  | 'clinic'
  | 'exeat'
  | 'discipline'
  | 'clearance'
  | 'accounts'
  | 'sms'
  | 'notices'
  | 'audit'
  | 'settings'

interface ErpSidebarProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
}

export const ErpSidebar: React.FC<ErpSidebarProps> = ({ activeTab, setActiveTab }) => {
  const {
    activeSchool,
    currentUser,
    logout,
    students,
    staff,
    expenses,
    libraryBooks,
    clearances,
    disciplineIncidents,
    clinicVisits,
    exeatPasses,
  } = useSchoolErp()

  // Define nav items visible based on current role
  const isStudent = currentUser?.role === 'student'
  const isTeacher = currentUser?.role === 'teacher'
  const isBursar = currentUser?.role === 'bursar'
  const isAdmin = currentUser?.role === 'admin'

  const activeInfractionsCount = disciplineIncidents.filter((d) => d.status !== 'Resolved' && d.severity !== 'Commendation').length
  const sickBayCount = clinicVisits.filter((v) => v.status === 'Admitted to Sick Bay').length
  const offCampusCount = exeatPasses.filter((p) => p.status !== 'Returned & Cleared').length

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: DashboardIcon, show: true },
    { id: 'students' as ActiveTab, label: 'Student Directory', icon: StudentsIcon, show: !isStudent, badge: students.length },
    { id: 'staff' as ActiveTab, label: 'Staff & HR Roster', icon: StaffIcon, show: !isStudent && !isTeacher, badge: staff.length },
    { id: 'finance' as ActiveTab, label: 'Bursar & Fees', icon: FinanceIcon, show: !isTeacher },
    { id: 'expenses' as ActiveTab, label: 'Campus Expenses', icon: FinanceIcon, show: isAdmin || isBursar, badge: expenses.length },
    { id: 'payroll' as ActiveTab, label: 'Staff Payroll', icon: FinanceIcon, show: isAdmin || isBursar },
    { id: 'academics' as ActiveTab, label: 'Exams & Broadsheet', icon: AcademicsIcon, show: true },
    { id: 'cbc' as ActiveTab, label: 'CBC Assessment', icon: AwardIcon, show: isAdmin || isTeacher },
    { id: 'analytics' as ActiveTab, label: 'Subject Analytics', icon: BarChartIcon, show: isAdmin || isTeacher },
    { id: 'attendance' as ActiveTab, label: 'Daily Attendance', icon: AttendanceIcon, show: !isStudent },
    { id: 'timetable' as ActiveTab, label: 'Class Timetable', icon: TimetableIcon, show: true },
    { id: 'library' as ActiveTab, label: 'Library & Textbooks', icon: BookOpenIcon, show: !isStudent, badge: libraryBooks.length },
    { id: 'hostel_transport' as ActiveTab, label: 'Hostel & Transport', icon: BusIcon, show: !isStudent },
    { id: 'clinic' as ActiveTab, label: 'Clinic & Sick Bay', icon: HeartPulseIcon, show: isAdmin || isTeacher, badge: sickBayCount > 0 ? sickBayCount : undefined },
    { id: 'exeat' as ActiveTab, label: 'Exeat & Gate Passes', icon: TicketIcon, show: isAdmin || isTeacher, badge: offCampusCount > 0 ? offCampusCount : undefined },
    { id: 'discipline' as ActiveTab, label: 'Student Discipline', icon: ShieldIcon, show: isAdmin || isTeacher, badge: activeInfractionsCount > 0 ? activeInfractionsCount : undefined },
    { id: 'clearance' as ActiveTab, label: 'Exit Clearance & Certs', icon: CertificateIcon, show: !isStudent, badge: clearances.length },
    { id: 'accounts' as ActiveTab, label: 'Accounts & Logins', icon: KeyIcon, show: isAdmin },
    { id: 'sms' as ActiveTab, label: 'Bulk SMS Broadcast', icon: NoticeIcon, show: isAdmin || isBursar },
    { id: 'notices' as ActiveTab, label: 'Noticeboard', icon: NoticeIcon, show: true },
    { id: 'audit' as ActiveTab, label: 'Security Audit Log', icon: ActivityIcon, show: isAdmin },
    { id: 'settings' as ActiveTab, label: 'School Settings', icon: SettingsIcon, show: isAdmin },
  ].filter((item) => item.show)

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1e293b',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* School Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: activeSchool.crestColor || '#1e3a8a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            flexShrink: 0,
          }}
        >
          {activeSchool.logoText}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={activeSchool.name}
          >
            {activeSchool.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {activeSchool.currentTerm} • {activeSchool.academicYear}
          </div>
        </div>
      </div>

      {/* User Info Capsule */}
      <div
        style={{
          margin: '0.85rem 1rem 0.5rem',
          padding: '0.75rem',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Logged in as:</span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              backgroundColor:
                currentUser?.role === 'admin'
                  ? 'rgba(59, 130, 246, 0.2)'
                  : currentUser?.role === 'bursar'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : currentUser?.role === 'teacher'
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(168, 85, 247, 0.2)',
              color:
                currentUser?.role === 'admin'
                  ? '#60a5fa'
                  : currentUser?.role === 'bursar'
                  ? '#34d399'
                  : currentUser?.role === 'teacher'
                  ? '#fbbf24'
                  : '#c084fc',
            }}
          >
            {currentUser?.role || 'Guest'}
          </span>
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentUser?.name || 'Administrator'}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{currentUser?.designation}</div>
      </div>

      {/* Navigation List */}
      <div style={{ flex: 1, padding: '0.5rem 0.75rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.5rem 0.75rem 0.25rem' }}>
          ERP Modules
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#1e293b'
                    e.currentTarget.style.color = '#f8fafc'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#94a3b8'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={17} color={isActive ? '#ffffff' : '#94a3b8'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#334155',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      padding: '1px 6px',
                      borderRadius: '999px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            border: '1px solid #334155',
            backgroundColor: '#1e293b',
            color: '#f87171',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ef4444'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1e293b'
            e.currentTarget.style.color = '#f87171'
          }}
        >
          <LogoutIcon size={17} />
          <span>Exit / Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
