import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { schoolStore } from '@/lib/schoolData'

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
        background: '#070a12',
        color: '#f8fafc',
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
          background: 'rgba(11, 15, 25, 0.96)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.85rem 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img
              src="/logo.png"
              alt="Éclat"
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #d4af37', boxShadow: '0 0 12px rgba(212, 175, 55, 0.35)' }}
            />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#d4af37', fontFamily: 'var(--font-heading)', lineHeight: 1.1, letterSpacing: '0.04em' }}>
                ÉCLAT INSTITUTE
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                Desktop Learning & Management Console
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.74rem', color: '#34d399', fontWeight: 700 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>Live Cloud Connected</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.74rem', color: '#60a5fa', fontWeight: 700 }}>
            <span>🔒</span>
            <span>Distraction-Free Mode</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/library')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
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
            <span>📖</span>
            <span>Digital Library</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/timetable')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
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
            <span>📅</span>
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
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            }}
          >
            <span>{profile ? '🎓' : '🔐'}</span>
            <span>{profile ? `Enter My Portal (${profile.role.toUpperCase()})` : 'Sign In to Workstation'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Desktop Content */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Motivational Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)',
            borderRadius: '24px',
            padding: '2rem 2.5rem',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
            gap: '2rem',
          }}
        >
          <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🌟</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Daily Academic Inspiration
              </span>
            </div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.4, margin: '0 0 0.5rem', fontStyle: 'italic' }}>
              "{quote.text}"
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 1.5rem', fontWeight: 500 }}>
              — {quote.author}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={handlePortalClick}
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #f59e0b 100%)',
                  color: '#090d16',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  padding: '0.75rem 1.6rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
                }}
              >
                <span>🚀</span>
                <span>Enter My Learning Room</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/library')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>📖</span>
                <span>Open Digital Textbooks</span>
              </button>
            </div>
          </div>

          {/* Quick Info Box */}
          <div style={{ background: 'rgba(11, 15, 25, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.5rem', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
              Desktop Console Stats
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Campus Portal:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399' }}>Active & Synced</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Digital Library:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#60a5fa' }}>Free In-App Access</span>
            </div>
          </div>
        </div>

        {/* 3. Campus Workstations */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem', fontFamily: 'var(--font-heading)' }}>
            Campus Workstations & Desks
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div
              onClick={() => navigate('/student')}
              style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🎓</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>Student Portal</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Registered units & video lessons</p>
            </div>

            <div
              onClick={() => navigate('/library')}
              style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📖</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>Digital Library</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Textbooks & revision past papers</p>
            </div>

            <div
              onClick={() => navigate('/timetable')}
              style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📅</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>Master Timetable</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Live Zoom & lab practical periods</p>
            </div>

            <div
              onClick={() => navigate('/exams')}
              style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📜</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>Exams & Grades</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Module results & transcripts</p>
            </div>

            <div
              onClick={() => navigate('/fees')}
              style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>💳</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>Fees & Tuition</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Fee clearance & statements</p>
            </div>

            <div
              onClick={() => navigate('/noticeboard')}
              style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(14, 165, 233, 0.25)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📢</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>Noticeboard</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Campus circulars & updates</p>
            </div>
          </div>
        </div>

        {/* 4. Active Instructional Units & Curriculum Modules */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Accredited Course Units & Practical LMS
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                Access comprehensive vocational modules, interactive lecture players, and digital lab assignments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/courses')}
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '0.5rem 1.1rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🎓 Open My Registered Units →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {schoolStore.getCourseUnits().slice(0, 6).map((u) => (
              <div
                key={u.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#93c5fd', background: 'rgba(59, 130, 246, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                      {u.code}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                      ⚡ 100% Online
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                    {u.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                    {u.description || 'Hands-on training, interactive live video sessions, and assessment rubrics.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: '#cbd5e1' }}>
                    <span>⏱️ {u.course_duration || '3 Months'}</span>
                    <span>•</span>
                    <span>📚 {u.credit_hours || 40} Credit Hours</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/student/courses')}
                    style={{
                      flex: 1,
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
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
                    <span>📖</span>
                    <span>Syllabus & Units</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/student/lesson/${u.lessons?.[0]?.id || u.id}`)}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                    }}
                  >
                    <span>▶️</span>
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
          background: '#04060a',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>Ctrl+P</kbd> Print Document</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>Ctrl+R</kbd> Refresh Cloud</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>F11</kbd> Full Screen</span>
        </div>
      </footer>
    </div>
  )
}
