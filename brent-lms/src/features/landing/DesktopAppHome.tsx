import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { schoolStore } from '@/lib/schoolData'
import {
  GraduationCapIcon,
  LockIcon,
  SparklesIcon,
  RocketIcon,
  BookOpenIcon,
  LibraryIcon,
  CalendarIcon,
  FileTextIcon,
  CreditCardIcon,
  MegaphoneIcon,
  ClockIcon,
} from '@/components/icons/AppIcons'

interface CourseItem {
  id: string
  title: string
  category: string
  tag: string
  tagColor: string
  duration: string
  fee: string
  icon: string
  skills: string[]
}

const MOTIVATIONAL_QUOTES = [
  { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Learning today, leading tomorrow. Master your craft.', author: 'Éclat Academic Faculty' },
  { text: 'Your potential is limitless. Commit to 30 minutes of study today.', author: 'Dean of Studies' },
]

export function DesktopAppHome({ courses: _courses, onSelectCourse: _onSelectCourse }: { courses: CourseItem[]; onSelectCourse?: (c: CourseItem) => void }) {
  const { profile } = useAuthContext()
  const navigate = useNavigate()

  const quote = useMemo(() => {
    const day = new Date().getDate()
    return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length]
  }, [])

  const handlePortalClick = () => {
    if (profile) {
      if (profile.role === 'admin') navigate('/admin')
      else if (profile.role === 'teacher') navigate('/teacher')
      else if (profile.role === 'bursar') navigate('/bursar')
      else if (profile.role === 'parent') navigate('/parent')
      else navigate('/student')
    } else {
      navigate('/login')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Sleek Desktop Workstation Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.85rem 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img
              src="/logo.png"
              alt="Éclat"
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #1e3a8a', boxShadow: '0 2px 8px rgba(30, 58, 138, 0.15)' }}
            />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'var(--font-heading)', lineHeight: 1.1, letterSpacing: '0.04em' }}>
                ÉCLAT INSTITUTE
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                Desktop Learning & Management Console
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>Live Cloud Connected</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.74rem', color: '#1d4ed8', fontWeight: 700 }}>
            <LockIcon size={12} color="#1d4ed8" />
            <span>Distraction-Free Mode</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/library')}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '0.55rem 1.1rem',
              borderRadius: '10px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BookOpenIcon size={16} color="#1d4ed8" />
            <span>Digital Library</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/timetable')}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '0.55rem 1.1rem',
              borderRadius: '10px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CalendarIcon size={16} color="#0284c7" />
            <span>Timetable</span>
          </button>

          <button
            type="button"
            onClick={handlePortalClick}
            style={{
              background: profile ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.4rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            }}
          >
            {profile ? <GraduationCapIcon size={16} color="#ffffff" /> : <LockIcon size={16} color="#ffffff" />}
            <span>{profile ? `Enter My Portal (${profile.role.toUpperCase()})` : 'Sign In to Workstation'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Desktop Content */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Motivational Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            borderRadius: '24px',
            padding: '2rem 2.5rem',
            boxShadow: '0 12px 30px rgba(37, 99, 235, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
            gap: '2rem',
          }}
        >
          <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
              <SparklesIcon size={16} color="#fef08a" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Daily Academic Inspiration
              </span>
            </div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.4, margin: '0 0 0.5rem', fontStyle: 'italic' }}>
              "{quote.text}"
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#bfdbfe', margin: '0 0 1.5rem', fontWeight: 500 }}>
              — {quote.author}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={handlePortalClick}
                style={{
                  background: '#ffffff',
                  color: '#1e3a8a',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  padding: '0.75rem 1.6rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <RocketIcon size={16} color="#1e3a8a" />
                <span>Enter My Learning Room</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/library')}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <BookOpenIcon size={16} color="#ffffff" />
                <span>Open Digital Textbooks</span>
              </button>
            </div>
          </div>

          {/* Quick Info Box */}
          <div style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '18px', padding: '1.5rem', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#fef08a', fontWeight: 800, textTransform: 'uppercase' }}>
              Desktop Console Stats
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#ffffff' }}>Campus Portal:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#86efac' }}>Active & Synced</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: '#ffffff' }}>Digital Library:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fef08a' }}>Free In-App Access</span>
            </div>
          </div>
        </div>

        {/* 3. Campus Workstations */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem', fontFamily: 'var(--font-heading)' }}>
            Campus Workstations & Desks
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div
              onClick={() => navigate('/student')}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <GraduationCapIcon size={24} color="#1d4ed8" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>Student Portal</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Registered units & video lessons</p>
            </div>

            <div
              onClick={() => navigate('/library')}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <LibraryIcon size={24} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>Digital Library</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Textbooks & revision past papers</p>
            </div>

            <div
              onClick={() => navigate('/timetable')}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <CalendarIcon size={24} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>Master Timetable</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Live Zoom & lab practical periods</p>
            </div>

            <div
              onClick={() => navigate('/exams')}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <FileTextIcon size={24} color="#7c3aed" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>Exams & Grades</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Module results & transcripts</p>
            </div>

            <div
              onClick={() => navigate('/fees')}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <CreditCardIcon size={24} color="#d97706" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>Fees & Tuition</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Fee clearance & statements</p>
            </div>

            <div
              onClick={() => navigate('/noticeboard')}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <MegaphoneIcon size={24} color="#dc2626" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>Noticeboard</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Campus circulars & updates</p>
            </div>
          </div>
        </div>

        {/* 4. Active Instructional Units & Curriculum Modules */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Certified Course Units & Practical LMS
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                Access comprehensive vocational modules, interactive lecture players, and digital lab assignments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/courses')}
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '0.55rem 1.2rem',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <GraduationCapIcon size={16} color="#1d4ed8" />
              <span>Open My Registered Units →</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {schoolStore.getCourseUnits().slice(0, 6).map((u) => (
              <div
                key={u.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '18px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      {u.code}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>
                      100% Online
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                    {u.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                    {u.description || 'Hands-on training, interactive live video sessions, and assessment rubrics.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: '#64748b' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ClockIcon size={14} color="#64748b" />
                      {u.course_duration || '3 Months'}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpenIcon size={14} color="#64748b" />
                      {u.credit_hours || 40} Credit Hours
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/student/courses')}
                    style={{
                      flex: 1,
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '0.6rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <BookOpenIcon size={14} color="#334155" />
                    <span>Syllabus & Units</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/student/lesson/${u.lessons?.[0]?.id || u.id}`)}
                    style={{
                      flex: 1,
                      background: '#1d4ed8',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.6rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(29, 78, 216, 0.25)',
                    }}
                  >
                    <RocketIcon size={14} color="#ffffff" />
                    <span>Start Lessons</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 5. Desktop Status Footer */}
      <footer
        style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '0.75rem 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: '#64748b',
        }}
      >
        <span>© 2026 Éclat Institute • Enterprise College Management System</span>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <span><kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>Ctrl+P</kbd> Print Document</span>
          <span><kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>Ctrl+R</kbd> Refresh Cloud</span>
          <span><kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>F11</kbd> Full Screen</span>
        </div>
      </footer>
    </div>
  )
}
