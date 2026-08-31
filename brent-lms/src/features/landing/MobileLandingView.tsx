import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { SafariInstallModal } from '@/components/shared/SafariInstallModal'

export interface CourseItem {
  id: string
  title: string
  category: 'Tech & Programming' | 'Computer & Digital Skills' | 'Languages & Communication' | 'Business Tech & Accounting'
  tag: string
  tagColor: string
  duration: string
  schedule: string
  fee: string
  installment: string
  careerOutcome: string
  skills: string[]
  icon: string
  popular?: boolean
  syllabus?: { week: string; topic: string; practicalLab: string }[]
}

interface MobileLandingProps {
  courses: CourseItem[]
  timeLeft: { days: number; hours: number; minutes: number; seconds: number }
  onOpenInquiry: (courseTitle?: string) => void
  onOpenPortals: () => void
  onSelectCourse: (c: CourseItem) => void
  showToast: (msg: string) => void
}

const CATEGORIES = [
  { id: 'All', label: '🔥 All Online Programs', icon: '🔥' },
  { id: 'Tech & Programming', label: '💻 Software & Python', icon: '💻' },
  { id: 'Languages & Communication', label: '🗣️ Languages & IELTS', icon: '🗣️' },
  { id: 'Computer & Digital Skills', label: '⚡ Computer Packages', icon: '⚡' },
  { id: 'Business Tech & Accounting', label: '📊 Accounting & Tax', icon: '📊' },
]

export function MobileLandingView({
  courses,
  timeLeft,
  onOpenInquiry,
  onOpenPortals,
  onSelectCourse,
  showToast,
}: MobileLandingProps) {
  const { isInstalled, isIOS, promptInstall } = usePWAInstall()
  const [safariModalOpen, setSafariModalOpen] = useState(false)
  const [selectedCat, setSelectedCat] = useState('All')
  const [search, setSearch] = useState('')

  const handleInstallClick = async () => {
    if (isIOS) {
      setSafariModalOpen(true)
    } else {
      const installed = await promptInstall()
      if (!installed) {
        setSafariModalOpen(true)
      }
    }
  }

  const filteredCourses = courses.filter((c) => {
    const matchCat = selectedCat === 'All' || c.category === selectedCat
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const copyPaybill = () => {
    navigator.clipboard.writeText('247247')
    showToast('✅ Paybill 247247 copied to clipboard!')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        paddingBottom: 'calc(75px + env(safe-area-inset-bottom, 0px))',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      {/* 1. Mobile Native App Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0.65rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ position: 'relative' }}>
            <img
              src="/logo.png"
              alt="Eclat Logo"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #d4af37',
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#d4af37',
                border: '2px solid #0f172a',
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#d4af37', fontFamily: 'var(--font-heading)', lineHeight: 1.1, letterSpacing: '0.03em' }}>
              ÉCLAT INSTITUTE
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
              100% Online Global Academy
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {!isInstalled && (
            <button
              type="button"
              onClick={handleInstallClick}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '0.4rem 0.7rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
              }}
            >
              <span>📲</span> Install
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPortals}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🔐 Portals
          </button>
        </div>
      </header>

      {/* 2. Top Intake Card / Hero App Widget */}
      <div style={{ padding: '0.85rem 1rem 0' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
            borderRadius: '16px',
            padding: '1.1rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span
              style={{
                background: '#22c55e',
                color: '#052e16',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              ● 100% Online Intake
            </span>
            <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 600 }}>
              Early Bird 15% Off
            </span>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: '0.4rem' }}>
            Master Tech & Global Languages 100% Online
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '0.85rem' }}>
            Live interactive Zoom classes, 24/7 video LMS modules, virtual coding labs, and verified global e-certificates.
          </p>

          {/* Countdown timer strip */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '10px',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              marginBottom: '0.85rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#60a5fa' }}>{String(timeLeft.days).padStart(2, '0')}</div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>Days</div>
            </div>
            <span style={{ color: '#475569', fontWeight: 900 }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#60a5fa' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>Hours</div>
            </div>
            <span style={{ color: '#475569', fontWeight: 900 }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#60a5fa' }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>Mins</div>
            </div>
            <span style={{ color: '#475569', fontWeight: 900 }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#22c55e' }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>Secs</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => onOpenInquiry()}
              style={{
                flex: 1,
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              🚀 Apply in 60s
            </button>
            <a
              href="https://wa.me/254740027346?text=Hello%20Eclat%20Institute!%20I%20want%20to%20inquire%20about%20online%20courses%20and%20intakes."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#22c55e',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              💬 Chat
            </a>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Grid (4 App Tiles) */}
      <div style={{ padding: '1rem 1rem 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
          }}
        >
          {/* Tile 1: Apply */}
          <button
            type="button"
            onClick={() => onOpenInquiry()}
            style={{
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '0.75rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc',
              cursor: 'pointer',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '1.35rem' }}>⚡</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textAlign: 'center' }}>Apply</span>
          </button>

          {/* Tile 2: Paybill */}
          <button
            type="button"
            onClick={copyPaybill}
            style={{
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '0.75rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc',
              cursor: 'pointer',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '1.35rem' }}>💳</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textAlign: 'center' }}>Paybill</span>
          </button>

          {/* Tile 3: Timetable */}
          <Link
            to="/timetable"
            style={{
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '0.75rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc',
              textDecoration: 'none',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '1.35rem' }}>📅</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textAlign: 'center' }}>Schedule</span>
          </Link>

          {/* Tile 4: Desks/Login */}
          <button
            type="button"
            onClick={onOpenPortals}
            style={{
              background: '#131b2e',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '0.75rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
              cursor: 'pointer',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '1.35rem' }}>🎓</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textAlign: 'center' }}>Portal</span>
          </button>
        </div>
      </div>

      {/* 4. Search & Filter Header */}
      <div id="courses" style={{ padding: '1.25rem 1rem 0.5rem', scrollMarginTop: '70px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Online Programs ({filteredCourses.length})
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            Virtual Campus
          </span>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <input
            type="text"
            placeholder="🔍 Search course, e.g. Python, IELTS, React, Excel, Arabic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              background: '#182238',
              border: '1px solid #2e3d61',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Horizontal Category Pill Carousel */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            paddingBottom: '0.4rem',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              style={{
                flexShrink: 0,
                background: selectedCat === cat.id ? '#2563eb' : '#182238',
                color: selectedCat === cat.id ? '#ffffff' : '#cbd5e1',
                border: selectedCat === cat.id ? '1px solid #3b82f6' : '1px solid #2e3d61',
                borderRadius: '999px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Mobile Course Cards Feed */}
      <div style={{ padding: '0.5rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            style={{
              background: '#131b2e',
              borderRadius: '14px',
              border: '1px solid #24304d',
              padding: '1rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            {/* Header: Icon + Title + Tag */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#1f2c48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                  border: '1px solid #2e3d61',
                }}
              >
                {course.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: course.tagColor || '#60a5fa',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {course.tag}
                  </span>
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                    }}
                  >
                    {course.fee}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0', lineHeight: 1.3 }}>
                  {course.title}
                </h4>
              </div>
            </div>

            {/* Meta Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.72rem', color: '#94a3b8' }}>
              <span style={{ background: '#182238', padding: '2px 6px', borderRadius: '4px' }}>⏱️ {course.duration}</span>
              <span style={{ background: '#182238', padding: '2px 6px', borderRadius: '4px' }}>🏛️ {course.schedule.split('/')[0]}</span>
            </div>

            {/* Skills Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {course.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#1f2c48',
                    color: '#cbd5e1',
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  ✓ {skill}
                </span>
              ))}
              {course.skills.length > 3 && (
                <span style={{ fontSize: '0.68rem', color: '#60a5fa', alignSelf: 'center', fontWeight: 700 }}>
                  +{course.skills.length - 3} more
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => onSelectCourse(course)}
                style={{
                  flex: 1,
                  background: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                📖 View Syllabus
              </button>

              <button
                type="button"
                onClick={() => onOpenInquiry(course.title)}
                style={{
                  flex: 1,
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Enroll Now →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Campus Contacts & Paybill Mobile Strip */}
      <div style={{ padding: '0.5rem 1rem 1.5rem' }}>
        <div
          style={{
            background: '#131b2e',
            borderRadius: '12px',
            padding: '0.85rem',
            border: '1px solid #24304d',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.78rem',
            color: '#cbd5e1',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💳 Payment: <strong style={{ color: '#60a5fa' }}>Card (Visa/Mastercard) • Paybill</strong></span>
            <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>$ USD</span>
          </div>
          <div>📞 Virtual Desk: <a href="tel:+254740027346" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 700 }}>+254 740 027 346</a></div>
          <div>🌐 Delivery: <strong style={{ color: '#ffffff' }}>100% Online Live Classes & LMS (Worldwide)</strong></div>
        </div>
      </div>

      {/* Safari & Manual PWA Installation Guide Modal */}
      <SafariInstallModal
        isOpen={safariModalOpen}
        onClose={() => setSafariModalOpen(false)}
        isIOS={isIOS}
      />
    </div>
  )
}
