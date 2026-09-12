import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { SafariInstallModal } from '@/components/shared/SafariInstallModal'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'

export interface CourseItem {
  id: string
  title: string
  category: 'Tech & Programming' | 'Computer & Digital Skills' | 'Languages & Communication' | 'Business Tech & Accounting' | 'Executive Masterclass' | string
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
  { id: 'All', label: '🔥 All Programs', icon: '🔥' },
  { id: 'Cambridge International (Years 9-11)', label: '🇬🇧 Cambridge (Y9-11)', icon: '🇬🇧' },
  { id: 'Pearson Edexcel International (Years 9-11)', label: '🇬🇧 Pearson Edexcel (Y9-11)', icon: '🇬🇧' },
  { id: 'Tech & Programming', label: '💻 Software & Web', icon: '💻' },
  { id: 'Data Science & Research', label: '📊 Data Science & AI', icon: '📊' },
  { id: 'Creative Design & Arts', label: '🎨 Design & Animation', icon: '🎨' },
  { id: 'Languages & Communication', label: '🗣️ Languages & IELTS', icon: '🗣️' },
  { id: 'Computer & Digital Skills', label: '⚡ Computer Packages', icon: '⚡' },
  { id: 'Business Tech & Accounting', label: '🧾 Accounting & Tax', icon: '🧾' },
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

  const copyAccount = () => {
    navigator.clipboard.writeText(INSTITUTION_CONFIG.bank.accountNumber)
    showToast(`✅ ${INSTITUTION_CONFIG.bank.name} Acc ${INSTITUTION_CONFIG.bank.accountNumber} copied to clipboard!`)
  }

  const copyPaybill = () => {
    navigator.clipboard.writeText(INSTITUTION_CONFIG.bank.paybillNumber)
    showToast(`✅ ${INSTITUTION_CONFIG.bank.name} Paybill ${INSTITUTION_CONFIG.bank.paybillNumber} (Acc: ${INSTITUTION_CONFIG.bank.accountNumber}) copied!`)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
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
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.65rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
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
                border: '2px solid #1d4ed8',
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
                background: '#16a34a',
                border: '2px solid #ffffff',
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'var(--font-heading)', lineHeight: 1.1, letterSpacing: '0.03em' }}>
              ÉCLAT INSTITUTE
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
              100% Online Virtual Campus
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

          <Link
            to="/library"
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '0.4rem 0.65rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span>📖</span>
            <span>Library</span>
          </Link>

          <button
            type="button"
            onClick={onOpenPortals}
            style={{
              background: '#1d4ed8',
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
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            borderRadius: '16px',
            padding: '1.1rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
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
            <span style={{ fontSize: '0.75rem', color: '#bfdbfe', fontWeight: 600 }}>
              Early Bird 15% Off
            </span>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: '0.4rem' }}>
            Master Tech & Global Languages 100% Online
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.4, marginBottom: '0.85rem' }}>
            Live interactive Zoom classes, 24/7 video LMS modules, virtual coding labs, and verified global e-certificates.
          </p>

          {/* Countdown timer strip */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              marginBottom: '0.85rem',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>{String(timeLeft.days).padStart(2, '0')}</div>
              <div style={{ fontSize: '0.6rem', color: '#e2e8f0', textTransform: 'uppercase' }}>Days</div>
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 900 }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
              <div style={{ fontSize: '0.6rem', color: '#e2e8f0', textTransform: 'uppercase' }}>Hours</div>
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 900 }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div style={{ fontSize: '0.6rem', color: '#e2e8f0', textTransform: 'uppercase' }}>Mins</div>
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 900 }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#86efac' }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div style={{ fontSize: '0.6rem', color: '#e2e8f0', textTransform: 'uppercase' }}>Secs</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => onOpenInquiry()}
              style={{
                flex: 1,
                background: '#ffffff',
                color: '#1e3a8a',
                border: 'none',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              🚀 Apply in 60s
            </button>
            <a
              href={getWhatsAppInquiryUrl()}
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
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              cursor: 'pointer',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span style={{ fontSize: '1.35rem' }}>⚡</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textAlign: 'center', color: '#0f172a' }}>Apply</span>
          </button>

          {/* Tile 2: Paybill */}
          <button
            type="button"
            onClick={copyPaybill}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              cursor: 'pointer',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span style={{ fontSize: '1.35rem' }}>💳</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textAlign: 'center', color: '#0f172a' }}>KCB / Pay</span>
          </button>

          {/* Tile 3: Timetable */}
          <Link
            to="/timetable"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              textDecoration: 'none',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span style={{ fontSize: '1.35rem' }}>📅</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textAlign: 'center', color: '#0f172a' }}>Schedule</span>
          </Link>

          {/* Tile 4: Desks/Login */}
          <button
            type="button"
            onClick={onOpenPortals}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d4ed8',
              cursor: 'pointer',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span style={{ fontSize: '1.35rem' }}>🎓</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textAlign: 'center', color: '#1d4ed8' }}>Portal</span>
          </button>
        </div>
      </div>

      {/* 4. Search & Filter Header */}
      <div id="courses" style={{ padding: '1.25rem 1rem 0.5rem', scrollMarginTop: '70px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Online Programs ({filteredCourses.length})
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            Virtual Campus
          </span>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search courses, e.g. Forex, Python, IELTS, React, Excel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.85rem',
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
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
                background: selectedCat === cat.id ? '#1d4ed8' : '#ffffff',
                color: selectedCat === cat.id ? '#ffffff' : '#334155',
                border: selectedCat === cat.id ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                borderRadius: '999px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: selectedCat === cat.id ? '0 2px 6px rgba(29, 78, 216, 0.2)' : 'none',
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
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '1rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
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
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                  border: '1px solid #e2e8f0',
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
                      color: course.tagColor || '#1d4ed8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {course.tag}
                  </span>
                  <a
                    href={getWhatsAppInquiryUrl(`Hello Brent College Admissions, I would like to make a Fees Inquiry for ${course.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    💬 Fees Inquiry
                  </a>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0', lineHeight: 1.3 }}>
                  {course.title}
                </h4>
              </div>
            </div>

            {/* Meta Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b' }}>
              <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>⏱️ {course.duration}</span>
              <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>🏛️ {course.schedule.split('/')[0]}</span>
            </div>

            {/* Skills Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {course.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#eff6ff',
                    color: '#1e40af',
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    border: '1px solid #dbeafe',
                  }}
                >
                  ✓ {skill}
                </span>
              ))}
              {course.skills.length > 3 && (
                <span style={{ fontSize: '0.68rem', color: '#1d4ed8', alignSelf: 'center', fontWeight: 700 }}>
                  +{course.skills.length - 3} more
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => onOpenInquiry(course.title)}
                style={{
                  width: '100%',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)',
                }}
              >
                ⚡ Enroll Now →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Campus Contacts & Paybill Mobile Strip */}
      <div style={{ padding: '0.5rem 1rem 1.5rem' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '0.85rem',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.78rem',
            color: '#334155',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🏦 {INSTITUTION_CONFIG.bank.name} Acc: <strong style={{ color: '#1d4ed8' }}>{INSTITUTION_CONFIG.bank.accountNumber}</strong></span>
            <button
              type="button"
              onClick={copyAccount}
              style={{
                background: '#f1f5f9',
                color: '#1d4ed8',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Copy
            </button>
          </div>
          <div>📱 M-Pesa Paybill: <strong style={{ color: '#b45309' }}>{INSTITUTION_CONFIG.bank.paybillNumber}</strong> • Acc: <strong style={{ color: '#1d4ed8' }}>{INSTITUTION_CONFIG.bank.accountNumber}</strong></div>
          <div>💳 Card: <strong style={{ color: '#0f172a' }}>Visa / Mastercard Accepted</strong> ($ USD)</div>
          <div>📞 Virtual Desk: <a href={`tel:${INSTITUTION_CONFIG.contact.phoneRaw}`} style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 700 }}>{INSTITUTION_CONFIG.contact.phone}</a></div>
          <div>🌐 Delivery: <strong style={{ color: '#0f172a' }}>100% Online Live Classes & LMS</strong></div>
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
