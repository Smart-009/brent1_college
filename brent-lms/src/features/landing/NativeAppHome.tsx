import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { MobileAppBottomNav } from '@/components/layout/MobileAppBottomNav'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'

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

export function NativeAppHome({ courses, onSelectCourse }: { courses: CourseItem[]; onSelectCourse?: (c: CourseItem) => void }) {
  const { profile } = useAuthContext()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')

  const quote = useMemo(() => {
    const day = new Date().getDate()
    return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length]
  }, [])

  const categories = ['All', 'Tech & Programming', 'Creative Arts & Design', 'Languages & Communication', 'Computer & Digital Skills']

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesCat = activeTab === 'All' || c.category === activeTab
      const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      return matchesCat && matchesSearch
    })
  }, [courses, activeTab, search])

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
        background: '#0a0e17',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      {/* 1. Sleek Mobile App Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10, 14, 23, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.75rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img
            src="/logo.png"
            alt="Éclat"
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #d4af37', boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)' }}
          />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#d4af37', fontFamily: 'var(--font-heading)', lineHeight: 1.1, letterSpacing: '0.04em' }}>
              ÉCLAT INSTITUTE
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
              Official Learning & Campus App
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePortalClick}
          style={{
            background: profile ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            border: 'none',
            padding: '0.45rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
          }}
        >
          <span>{profile ? '🎓' : '🔐'}</span>
          <span>{profile ? 'My Portal' : 'Sign In'}</span>
        </button>
      </header>

      {/* 2. Motivational Hero Card */}
      <div style={{ padding: '0.85rem 1rem 0' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            borderRadius: '20px',
            padding: '1.25rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 800,
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              🌟 Daily Inspiration
            </span>
            <span style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 600 }}>
              Term 2026 Intake
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.4, margin: '0 0 0.3rem', fontStyle: 'italic' }}>
            "{quote.text}"
          </p>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 1rem', fontWeight: 500 }}>
            — {quote.author}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePortalClick}
              style={{
                flex: 1,
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            >
              <span>🚀</span>
              <span>{profile ? 'Enter My Learning Room' : 'Access Student Desk'}</span>
            </button>

            <Link
              to="/library"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.7rem 0.9rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <span>📖</span>
              <span>E-Library</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Native App Quick Access Workstations Grid */}
      <div style={{ padding: '1.25rem 1rem 0' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>
          Campus Workstations
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
          {/* Tile 1: Courses */}
          <button
            type="button"
            onClick={handlePortalClick}
            style={{
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc',
              cursor: 'pointer',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🎓</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textAlign: 'center' }}>My Portal</span>
          </button>

          {/* Tile 2: Timetable */}
          <Link
            to="/timetable"
            style={{
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc',
              textDecoration: 'none',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📅</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textAlign: 'center' }}>Schedule</span>
          </Link>

          {/* Tile 3: Exams */}
          <Link
            to="/exams"
            style={{
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc',
              textDecoration: 'none',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📝</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textAlign: 'center' }}>Exams</span>
          </Link>

          {/* Tile 4: Fees */}
          <Link
            to="/fees"
            style={{
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc',
              textDecoration: 'none',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>💳</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textAlign: 'center' }}>Fees & Pay</span>
          </Link>

          {/* Tile 5: Noticeboard */}
          <Link
            to="/noticeboard"
            style={{
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc',
              textDecoration: 'none',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📢</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textAlign: 'center' }}>Circulars</span>
          </Link>

          {/* Tile 6: Help Desk */}
          <a
            href={getWhatsAppInquiryUrl('Hello Eclat Academic Desk! I am reaching out from the mobile app for assistance.')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4ade80',
              textDecoration: 'none',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>💬</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textAlign: 'center' }}>Support</span>
          </a>
        </div>
      </div>

      {/* 4. Active Programs & Skill Pathways */}
      <div style={{ padding: '1.5rem 1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Master In-Demand Skills ({filteredCourses.length})
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 700 }}>
            Live & Offline
          </span>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '0.75rem' }}>
          <input
            type="text"
            placeholder="🔍 Search units, e.g. Python, IELTS, React, Excel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '12px',
              background: '#131b2e',
              border: '1px solid #24304d',
              color: '#ffffff',
              fontSize: '0.84rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveTab(cat)}
              style={{
                flexShrink: 0,
                background: activeTab === cat ? '#2563eb' : '#131b2e',
                color: activeTab === cat ? '#ffffff' : '#94a3b8',
                border: activeTab === cat ? '1px solid #3b82f6' : '1px solid #1e293b',
                borderRadius: '999px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Course Cards Stream */}
      <div style={{ padding: '0.5rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            style={{
              background: '#131b2e',
              borderRadius: '16px',
              border: '1px solid #24304d',
              padding: '1rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                  border: '1px solid #334155',
                }}
              >
                {course.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: course.tagColor || '#60a5fa', textTransform: 'uppercase' }}>
                    {course.tag}
                  </span>
                  <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '2px 6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>
                    {course.fee}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0', lineHeight: 1.3 }}>
                  {course.title}
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => onSelectCourse?.(course)}
                style={{
                  flex: 1,
                  background: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                📖 Syllabus
              </button>

              <button
                type="button"
                onClick={handlePortalClick}
                style={{
                  flex: 1,
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Start Learning →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Persistent Bottom App Navigation */}
      <MobileAppBottomNav />
    </div>
  )
}
