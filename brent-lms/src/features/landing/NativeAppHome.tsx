import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { MobileAppBottomNav } from '@/components/layout/MobileAppBottomNav'
import { IntakeAdvertsSection } from './IntakeAdvertsSection'
import { getWhatsAppInquiryUrl } from '@/config/institution'
import {
  GraduationCapIcon,
  LockIcon,
  SparklesIcon,
  RocketIcon,
  BookOpenIcon,
  CalendarIcon,
  FileTextIcon,
  CreditCardIcon,
  MegaphoneIcon,
  MessageCircleIcon,
  SearchIcon,
  CourseIcon,
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
        background: '#f8fafc',
        color: '#0f172a',
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
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img
            src="/logo.png"
            alt="Éclat"
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #1e3a8a', boxShadow: '0 2px 8px rgba(30, 58, 138, 0.15)' }}
          />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'var(--font-heading)', lineHeight: 1.1, letterSpacing: '0.04em' }}>
              ÉCLAT INSTITUTE
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
              Official Learning & Campus App
            </div>
          </div>
        </div>

<span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '0.3rem 0.75rem', borderRadius: '999px' }}>
          {profile ? `👋 ${profile.full_name?.split(' ')[0] || 'Welcome'}` : '🎓 Éclat Campus'}
        </span>
      </header>

      {/* 2. Motivational Hero Card */}
      <div style={{ padding: '0.85rem 1rem 0' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 800,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <SparklesIcon size={12} color="#fef08a" />
              <span>Daily Inspiration</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: '#fef08a', fontWeight: 700 }}>
              Term 2026 Intake
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.45, margin: '0 0 0.35rem', fontStyle: 'italic' }}>
            "{quote.text}"
          </p>
          <p style={{ fontSize: '0.75rem', color: '#bfdbfe', margin: '0 0 1rem', fontWeight: 600 }}>
            — {quote.author}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePortalClick}
              style={{
                flex: 1,
                background: '#ffffff',
                color: '#1e3a8a',
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
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <RocketIcon size={16} color="#1e3a8a" />
              <span>{profile ? 'My Learning Room' : 'Student Desk'}</span>
            </button>

            <Link
              to="/library"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.7rem 0.9rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <BookOpenIcon size={16} color="#ffffff" />
              <span>E-Library</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Native App Quick Access Workstations Grid */}
      <div style={{ padding: '1.25rem 1rem 0' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem' }}>
          Campus Workstations
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
          {/* Tile 1: Courses */}
          <button
            type="button"
            onClick={handlePortalClick}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              cursor: 'pointer',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCapIcon size={20} color="#1d4ed8" />
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textAlign: 'center', color: '#0f172a', lineHeight: 1.2 }}>My Portal</span>
          </button>

          {/* Tile 2: Schedule */}
          <Link
            to="/timetable"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              textDecoration: 'none',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarIcon size={20} color="#0284c7" />
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', color: '#0f172a' }}>Schedule</span>
          </Link>

          {/* Tile 3: Exams */}
          <Link
            to="/exams"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              textDecoration: 'none',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileTextIcon size={20} color="#7c3aed" />
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', color: '#0f172a' }}>Exams</span>
          </Link>

          {/* Tile 4: Fees */}
          <Link
            to="/fees"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              textDecoration: 'none',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCardIcon size={20} color="#059669" />
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', color: '#0f172a' }}>Fees & Pay</span>
          </Link>

          {/* Tile 5: Noticeboard */}
          <Link
            to="/noticeboard"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              textDecoration: 'none',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MegaphoneIcon size={20} color="#d97706" />
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', color: '#0f172a' }}>Circulars</span>
          </Link>

          {/* Tile 6: Help Desk */}
          <a
            href={getWhatsAppInquiryUrl('Hello Eclat Academic Desk! I am reaching out from the mobile app for assistance.')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.9rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803d',
              textDecoration: 'none',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircleIcon size={20} color="#16a34a" />
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', color: '#15803d' }}>Support</span>
          </a>
        </div>
      </div>

      {/* Featured Upcoming Academic Intakes */}
      <IntakeAdvertsSection />

      {/* 4. Active Programs & Skill Pathways */}
      <div style={{ padding: '1.5rem 1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Master In-Demand Skills ({filteredCourses.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 700 }}>
            Live & Online
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <SearchIcon size={16} color="#64748b" />
          </span>
          <input
            type="text"
            placeholder="Search units, e.g. Python, IELTS, React, Excel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.7rem 0.85rem 0.7rem 2.3rem',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.86rem',
              outline: 'none',
              boxSizing: 'border-box',
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
                background: activeTab === cat ? '#1d4ed8' : '#ffffff',
                color: activeTab === cat ? '#ffffff' : '#475569',
                border: activeTab === cat ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                borderRadius: '999px',
                padding: '0.4rem 0.8rem',
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
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1rem',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid #dbeafe',
                }}
              >
                <CourseIcon courseId={course.id} iconKey={course.icon} size={22} color="#1d4ed8" />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {course.tag}
                  </span>
                  <a
                    href={getWhatsAppInquiryUrl(`Hello Brent College Admissions, I would like to make a Fees Inquiry for ${course.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: '#ecfdf5',
                      color: '#047857',
                      border: '1px solid #a7f3d0',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MessageCircleIcon size={12} color="#047857" />
                    <span>Fees Inquiry</span>
                  </a>
                </div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', margin: '3px 0 0', lineHeight: 1.3 }}>
                  {course.title}
                </h4>
              </div>
            </div>

            <div style={{ marginTop: '0.15rem' }}>
              <button
                type="button"
                onClick={handlePortalClick}
                style={{
                  width: '100%',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(29, 78, 216, 0.2)',
                }}
              >
                <RocketIcon size={15} color="#ffffff" />
                <span>Access Student Portal</span>
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
