import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { MobileAppBottomNav } from '@/components/layout/MobileAppBottomNav'
import { DesktopCommandPalette } from '@/components/shared/DesktopCommandPalette'
import { getWhatsAppInquiryUrl } from '@/config/institution'
import { getDynamicCoursesList } from '@/config/officialCourses'
import { schoolStore } from '@/lib/schoolData'
import { intakeStore } from '@/lib/intakeStore'
import { formatDate } from '@/lib/utils'
import type { IntakeSchedule } from '@/types/intake'

export interface CourseItem {
  id: string
  title: string
  category: string
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

const buildCatalogCourses = (): CourseItem[] => {
  const subs = schoolStore.getSubjects()
  const units = schoolStore.getCourseUnits()
  const dynamic = getDynamicCoursesList(subs, units)
  return dynamic
    .filter(
      (c) =>
        c &&
        !c.id?.startsWith('aaaaaaaa-') &&
        !c.id?.startsWith('__ECLAT_') &&
        !c.title?.startsWith('__ECLAT_') &&
        !c.careerOutcome?.startsWith('{') &&
        !c.careerOutcome?.includes('{"key"')
    )
    .map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      tag: c.tag,
      tagColor: c.tagColor,
      duration: c.duration,
      schedule: c.schedule,
      fee: `$${c.feeUsd} (KES ${c.feeKes.toLocaleString()})`,
      installment: c.installmentText,
      careerOutcome: c.careerOutcome,
      skills: c.skills,
      icon: c.icon,
      popular: c.popular || c.bestseller,
      syllabus: c.syllabus,
    }))
}

const CATEGORIES = [
  'All',
  'British Curriculum (IGCSE & A-Levels)',
  'Tech & Programming',
  'Data Science & Research',
  'Computer & Digital Skills',
  'Business Tech & Accounting',
  'Languages & Communication',
]

export function CourseCatalogPage() {
  const { profile } = useAuthContext()
  const [searchParams] = useSearchParams()
  const intakeParam = searchParams.get('intake')

  const [selectedCat, setSelectedCat] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null)
  const [courses, setCourses] = useState<CourseItem[]>(() => buildCatalogCourses())
  const [intakes, setIntakes] = useState<IntakeSchedule[]>(() => intakeStore.getPublishedIntakes())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    intakeStore.fetchCloudIntakes().then((list) => {
      setIntakes(list.filter((i) => i.is_published))
    })
  }, [])

  useEffect(() => {
    const refreshCourses = () => {
      setCourses(buildCatalogCourses())
    }
    window.addEventListener('storage', refreshCourses)
    window.addEventListener('focus', refreshCourses)
    window.addEventListener('eclat-courses-updated', refreshCourses)
    return () => {
      window.removeEventListener('storage', refreshCourses)
      window.removeEventListener('focus', refreshCourses)
      window.removeEventListener('eclat-courses-updated', refreshCourses)
    }
  }, [])

  const matchedIntake = useMemo(() => {
    if (!intakeParam) return intakes.find((i) => i.featured) || intakes[0] || null
    return intakes.find((i) => i.id === intakeParam || i.title.toLowerCase().includes(intakeParam.toLowerCase())) || intakes[0] || null
  }, [intakes, intakeParam])

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = selectedCat === 'All' || c.category === selectedCat
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        c.careerOutcome.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [courses, selectedCat, search])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <DesktopCommandPalette />

      {/* Top Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(9, 13, 22, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img src="/logo.png" alt="Éclat Emblem" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #d4af37' }} />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#d4af37', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                ÉCLAT INSTITUTE
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
                Academic Programs & Syllabus Directory
              </div>
            </div>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link
            to="/about"
            className="hidden md:inline-flex"
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            🏛️ About Us
          </Link>

          <Link
            to="/library"
            className="hidden md:inline-flex"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            📖 E-Library
          </Link>

          <Link
            to={profile ? (profile.role === 'admin' ? '/admin' : profile.role === 'teacher' ? '/teacher' : '/student') : '/login'}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            {profile ? '🎓 My Portal' : '🔐 Sign In'}
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="md:hidden"
            style={{
              background: mobileMenuOpen ? '#0f172a' : '#1e293b',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              lineHeight: 1,
              flexShrink: 0,
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Slide-Over Navigation Drawer Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(5, 8, 15, 0.72)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 9998,
              animation: 'fadeIn 0.2s ease',
            }}
          />
        )}

        {/* Mobile Slide-Over Navigation Drawer Panel */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(330px, 86vw)',
              background: '#090d16',
              borderLeft: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 23, 42, 0.8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src="/logo.png"
                  alt="Éclat Institute Logo"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #d4af37' }}
                />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#d4af37', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                    ÉCLAT INSTITUTE
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>
                    100% Online Virtual Campus
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 900,
                }}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '1rem 1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0.35rem 0 0.25rem 0.35rem' }}>
                Academic Directory
              </div>

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#f8fafc',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <span>🏠</span>
                <span>Home</span>
              </Link>

              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#38bdf8',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                <span>📚</span>
                <span>Course Catalog & Programs</span>
              </Link>

              <Link
                to="/courses?cat=British+Curriculum"
                onClick={() => {
                  setSelectedCat('British Curriculum (IGCSE & A-Levels)')
                  setMobileMenuOpen(false)
                }}
                style={{
                  color: '#d4af37',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                }}
              >
                <span>🇬🇧</span>
                <span>Cambridge IGCSE & A-Levels</span>
              </Link>

              <Link
                to="/#intakes-section"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#fbbf24',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: 'rgba(251, 191, 36, 0.08)',
                }}
              >
                <span>🗓️</span>
                <span>Upcoming Intakes & Admissions</span>
              </Link>

              <Link
                to="/library"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#f8fafc',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <span>📖</span>
                <span>Free E-Library & Past Papers</span>
              </Link>

              <Link
                to="/#calculator"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#f8fafc',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <span>💳</span>
                <span>Tuition Fees Inquiry</span>
              </Link>

              <Link
                to="/timetable"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#f8fafc',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <span>📅</span>
                <span>Virtual Class Timetable</span>
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#f8fafc',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <span>🏛️</span>
                <span>About Éclat Institute</span>
              </Link>
            </div>

            {/* Drawer Footer Actions */}
            <div
              style={{
                padding: '1rem 1.1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 23, 42, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <Link
                to={profile ? (profile.role === 'admin' ? '/admin' : profile.role === 'teacher' ? '/teacher' : '/student') : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-sm btn-primary"
                style={{
                  fontWeight: 800,
                  textAlign: 'center',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                }}
              >
                <span>🔐</span>
                <span>{profile ? 'Student & Staff Portals' : 'Portal Sign In'}</span>
              </Link>

              <a
                href={getWhatsAppInquiryUrl('Hello Eclat Admissions! I need assistance with course enrollment.')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 800,
                  textAlign: 'center',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                }}
              >
                <span>💬</span>
                <span>WhatsApp Admissions Desk</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Header Strip */}
      <div style={{ background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.25) 0%, transparent 100%)', padding: '2rem 1.25rem 1.5rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <span style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', padding: '3px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
          📚 2026 Academic Catalog
        </span>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#ffffff', margin: '0.75rem 0 0.4rem', fontFamily: 'var(--font-heading)' }}>
          Explore Certified Career Masterclasses
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
          100% online live classes across flexible shifts (Early Morning, Late Morning, Midday, Afternoon, Evening & Night), verifiable global certificates, real-world practical projects, and flexible 2-month installment fee plans.
        </p>

        {/* Matched Intake Cohort Highlight Banner */}
        {matchedIntake && (
          <div
            style={{
              marginTop: '1.25rem',
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              textAlign: 'left',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ background: '#16a34a', color: '#ffffff', padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>
                  ● {matchedIntake.status}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: 800 }}>
                  🗓️ {matchedIntake.title}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '3px' }}>
                ⏰ Deadline: <strong>{formatDate(matchedIntake.application_deadline)}</strong> • 🚀 Classes Start: <strong>{formatDate(matchedIntake.commencement_date)}</strong>
              </div>
              {matchedIntake.early_bird_discount && (
                <div style={{ fontSize: '0.78rem', color: '#fef08a', fontWeight: 700, marginTop: '2px' }}>
                  🎁 {matchedIntake.early_bird_discount}
                </div>
              )}
            </div>

            <a
              href={getWhatsAppInquiryUrl(`Hello, I would like to register for the ${matchedIntake.title}. Please assist me with enrollment.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>💬</span>
              <span>Enroll in this Intake</span>
            </a>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search programs by skill or title (e.g. Python, IELTS, SPSS, React, Figma, QuickBooks, German)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1.1rem',
                borderRadius: '14px',
                background: '#131b2e',
                border: '1px solid #24304d',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              }}
            />
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              scrollbarWidth: 'none',
            }}
          >
            {CATEGORIES.map((cat) => {
              const label =
                cat === 'All'
                  ? '🔥 All Programs'
                  : cat === 'British Curriculum (IGCSE & A-Levels)'
                  ? '🇬🇧 Cambridge IGCSE'
                  : cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    flexShrink: 0,
                    background: selectedCat === cat ? '#2563eb' : '#131b2e',
                    color: selectedCat === cat ? '#ffffff' : '#94a3b8',
                    border: selectedCat === cat ? '1px solid #3b82f6' : '1px solid #24304d',
                    borderRadius: '999px',
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    minHeight: '38px',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem 2rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', fontWeight: 600 }}>
          Showing <strong style={{ color: '#ffffff' }}>{filteredCourses.length}</strong> program{filteredCourses.length === 1 ? '' : 's'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              style={{
                background: '#131b2e',
                borderRadius: '18px',
                border: '1px solid #24304d',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      border: '1px solid #334155',
                      flexShrink: 0,
                    }}
                  >
                    {course.icon}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        background: `${course.tagColor}22`,
                        color: course.tagColor,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        display: 'inline-block',
                        marginBottom: '4px',
                      }}
                    >
                      {course.tag}
                    </span>
                    <a
                      href={getWhatsAppInquiryUrl(`Hello Brent College Admissions! I would like to make a Fees Inquiry for ${course.title}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(37, 99, 235, 0.2)',
                        color: '#60a5fa',
                        border: '1px solid rgba(96, 165, 250, 0.4)',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                      }}
                    >
                      💬 Fees Inquiry
                    </a>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                  {course.title}
                </h3>

                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                  💼 Career Outcome: <strong style={{ color: '#cbd5e1' }}>{course.careerOutcome}</strong>
                </p>

                {/* Duration & Schedule Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span style={{ background: '#182238', padding: '3px 8px', borderRadius: '6px', border: '1px solid #2e3d61' }}>⏱️ {course.duration}</span>
                  <span style={{ background: '#182238', padding: '3px 8px', borderRadius: '6px', border: '1px solid #2e3d61' }}>🏛️ {course.schedule.split('(')[0]}</span>
                </div>

                {/* Skills Learned */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {course.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#1e293b',
                        color: '#cbd5e1',
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <a
                  href={getWhatsAppInquiryUrl(`Hello Admissions! I would like to enroll in ${course.title}. Please provide registration steps.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    background: '#2563eb',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '0.65rem 0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  Enroll Now →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Syllabus Modal */}
      {selectedCourse && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedCourse(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#131b2e',
              border: '1px solid #24304d',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '1.5rem',
              color: '#f8fafc',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #24304d' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase' }}>
                  {selectedCourse.category}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>
                  {selectedCourse.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                style={{ background: '#1e293b', border: 'none', color: '#94a3b8', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', background: '#0a0e17', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
              <div>⏱️ <strong>Duration:</strong> {selectedCourse.duration}</div>
              <a
                href={getWhatsAppInquiryUrl(`Hello Brent College Admissions! I would like to make a Fees Inquiry for the course: ${selectedCourse.title}.`)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(37, 99, 235, 0.25)',
                  color: '#93c5fd',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textDecoration: 'none',
                }}
              >
                💬 Fees Inquiry
              </a>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#93c5fd', margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Weekly Syllabus & Practical Labs
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {selectedCourse.syllabus?.map((s, idx) => (
                <div key={idx} style={{ background: '#182238', borderRadius: '10px', padding: '0.75rem', border: '1px solid #2e3d61' }}>
                  <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 800 }}>{s.week}</div>
                  <div style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 700, margin: '2px 0' }}>{s.topic}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>🧪 Lab: {s.practicalLab}</div>
                </div>
              ))}
            </div>

            <a
              href={getWhatsAppInquiryUrl(`Hello Eclat Admissions! I reviewed the syllabus for ${selectedCourse.title} and would like to register.`)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%',
                background: '#2563eb',
                color: '#ffffff',
                padding: '0.8rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            >
              <span>🚀</span>
              <span>Enroll in This Program</span>
            </a>
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Nav */}
      <MobileAppBottomNav />
    </div>
  )
}
