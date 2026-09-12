import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { MobileAppBottomNav } from '@/components/layout/MobileAppBottomNav'
import { DesktopCommandPalette } from '@/components/shared/DesktopCommandPalette'
import { getWhatsAppInquiryUrl, INSTITUTION_CONFIG, INSTITUTIONAL_SCHOOLS } from '@/config/institution'
import { getDynamicCoursesList } from '@/config/officialCourses'
import { schoolStore } from '@/lib/schoolData'
import { intakeStore } from '@/lib/intakeStore'
import { formatDate } from '@/lib/utils'
import type { IntakeSchedule } from '@/types/intake'
import {
  SearchIcon,
  SparklesIcon,
  BriefcaseIcon,
  CodeIcon,
  GlobeIcon,
  GraduationCapIcon,
  BookOpenIcon,
  LibraryIcon,
  HomeIcon,
  CalculatorIcon,
  CheckIcon,
  BuildingIcon,
  BritishShieldIcon,
  ClockIcon,
  CalendarIcon,
  AwardIcon,
  MessageCircleIcon,
  LockIcon,
  XIcon,
  MenuIcon,
  FlaskIcon,
  RocketIcon,
  CourseIcon,
} from '@/components/icons/AppIcons'

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
  schoolId?: string
  schoolName?: string
  departmentName?: string
  yearLevel?: string
  examBoard?: string
  syllabusCode?: string
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
      schoolId: c.schoolId,
      schoolName: c.schoolName,
      yearLevel: c.yearLevel,
      examBoard: c.examBoard,
      syllabusCode: c.syllabusCode,
    }))
}

const CATEGORIES = [
  'All',
  'School of Business',
  'School of IT and Data Science',
  'School of Language',
  'IGCSE',
]

const YEAR_LEVELS = [
  'All Years',
  'Year 9 (Foundation)',
  'Year 10 (IGCSE Year 1)',
  'Year 11 (Exam Series)',
]

export function CourseCatalogPage() {
  const { profile } = useAuthContext()
  const [searchParams] = useSearchParams()
  const intakeParam = searchParams.get('intake')
  const catParam = searchParams.get('cat')

  const [selectedCat, setSelectedCat] = useState('All')
  const [selectedYear, setSelectedYear] = useState('All Years')
  const [viewMode, setViewMode] = useState<'courses' | 'schools'>('courses')
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null)
  const [courses, setCourses] = useState<CourseItem[]>(() => buildCatalogCourses())
  const [intakes, setIntakes] = useState<IntakeSchedule[]>(() => intakeStore.getPublishedIntakes())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (catParam) {
      const lower = catParam.toLowerCase()
      if (lower.includes('business') || lower.includes('commerce') || lower.includes('accounting') || lower.includes('forex') || lower.includes('trading')) {
        setSelectedCat('School of Business')
      } else if (lower.includes('it') || lower.includes('data') || lower.includes('tech') || lower.includes('software') || lower.includes('programming') || lower.includes('design')) {
        setSelectedCat('School of IT and Data Science')
      } else if (lower.includes('lang') || lower.includes('ielts') || lower.includes('english')) {
        setSelectedCat('School of Language')
      } else if (lower.includes('igcse') || lower.includes('cambridge') || lower.includes('edexcel') || lower.includes('british')) {
        setSelectedCat('IGCSE')
      } else {
        const found = CATEGORIES.find((c) => c.toLowerCase().includes(lower))
        if (found) setSelectedCat(found)
      }
    }
  }, [catParam])

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
      let matchCat = selectedCat === 'All'
      if (!matchCat) {
        if (selectedCat === 'School of Business') {
          matchCat =
            c.schoolId === 'school-business' ||
            c.category === 'School of Business' ||
            c.category === 'Business Tech & Accounting' ||
            c.category === 'Business & Finance' ||
            (!c.yearLevel && (c.departmentName?.toLowerCase().includes('business') || c.tag?.toLowerCase().includes('business')))
        } else if (selectedCat === 'School of IT and Data Science') {
          matchCat =
            c.schoolId === 'school-it-data' ||
            c.schoolId === 'school-software' ||
            c.schoolId === 'school-data' ||
            c.schoolId === 'school-design' ||
            c.category === 'School of IT and Data Science' ||
            c.category === 'Tech & Programming' ||
            c.category === 'Data Science & Research' ||
            c.category === 'Computer & Digital Skills' ||
            c.category === 'Creative Arts & Design'
        } else if (selectedCat === 'School of Language') {
          matchCat =
            c.schoolId === 'school-languages' ||
            c.category === 'School of Language' ||
            c.category === 'Languages & Communication'
        } else if (selectedCat === 'IGCSE') {
          matchCat =
            c.schoolId === 'school-igcse' ||
            c.schoolId === 'school-cambridge' ||
            c.schoolId === 'school-edexcel' ||
            c.category === 'IGCSE' ||
            c.category.includes('International (Years 9-11)') ||
            Boolean(c.yearLevel)
        } else {
          matchCat = c.category === selectedCat
        }
      }

      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        c.careerOutcome.toLowerCase().includes(search.toLowerCase()) ||
        c.schoolName?.toLowerCase().includes(search.toLowerCase()) ||
        c.syllabusCode?.toLowerCase().includes(search.toLowerCase()) ||
        c.examBoard?.toLowerCase().includes(search.toLowerCase())
      
      const matchYear =
        selectedYear === 'All Years' ||
        !c.yearLevel ||
        c.yearLevel === 'All Years' ||
        c.yearLevel === selectedYear ||
        (selectedYear === 'Year 9 (Foundation)' && c.yearLevel.includes('9')) ||
        (selectedYear === 'Year 10 (IGCSE Year 1)' && c.yearLevel.includes('10')) ||
        (selectedYear === 'Year 11 (Exam Series)' && c.yearLevel.includes('11'))

      return matchCat && matchSearch && matchYear
    })
  }, [courses, selectedCat, search, selectedYear])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
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
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img src="/logo.png" alt="Éclat Emblem" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #1d4ed8' }} />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                ÉCLAT INSTITUTE
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
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
              background: '#eff6ff',
              color: '#1d4ed8',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none',
              border: '1px solid #bfdbfe',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BuildingIcon size={14} color="#1d4ed8" />
            <span>About Us</span>
          </Link>

          <Link
            to="/library"
            className="hidden md:inline-flex"
            style={{
              background: '#f8fafc',
              color: '#334155',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none',
              border: '1px solid #cbd5e1',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LibraryIcon size={14} color="#64748b" />
            <span>E-Library</span>
          </Link>

          <Link
            to={profile ? (profile.role === 'admin' ? '/admin' : profile.role === 'teacher' ? '/teacher' : '/student') : '/login'}
            style={{
              background: '#1d4ed8',
              color: '#ffffff',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(29, 78, 216, 0.25)',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {profile ? <GraduationCapIcon size={14} color="#ffffff" /> : <LockIcon size={14} color="#ffffff" />}
            <span>{profile ? 'My Portal' : 'Sign In'}</span>
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="md:hidden"
            style={{
              background: mobileMenuOpen ? '#eff6ff' : '#f1f5f9',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <XIcon size={18} color="#0f172a" /> : <MenuIcon size={18} color="#0f172a" />}
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
              background: 'rgba(15, 23, 42, 0.5)',
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
              background: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.15)',
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
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src="/logo.png"
                  alt="Éclat Institute Logo"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #1d4ed8' }}
                />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                    ÉCLAT INSTITUTE
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>
                    100% Online Virtual Campus
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
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
                <XIcon size={18} color="#0f172a" />
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
                background: '#ffffff',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0.35rem 0 0.25rem 0.35rem' }}>
                Academic Directory
              </div>

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#0f172a',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <HomeIcon size={18} color="#0f172a" />
                <span>Home</span>
              </Link>

              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#1d4ed8',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                }}
              >
                <BookOpenIcon size={18} color="#1d4ed8" />
                <span>Course Catalog & Programs</span>
              </Link>

              <Link
                to="/courses?cat=Cambridge"
                onClick={() => {
                  setSelectedCat('Cambridge International (Years 9-11)')
                  setMobileMenuOpen(false)
                }}
                style={{
                  color: '#0284c7',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                }}
              >
                <BritishShieldIcon size={18} />
                <span>Cambridge Assessment (Years 9-11)</span>
              </Link>

              <Link
                to="/courses?cat=Edexcel"
                onClick={() => {
                  setSelectedCat('Pearson Edexcel International (Years 9-11)')
                  setMobileMenuOpen(false)
                }}
                style={{
                  color: '#dc2626',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                }}
              >
                <BritishShieldIcon size={18} />
                <span>Pearson Edexcel International (Years 9-11)</span>
              </Link>

              <Link
                to="/#intakes-section"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#b45309',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                }}
              >
                <CalendarIcon size={18} color="#b45309" />
                <span>Upcoming Intakes & Admissions</span>
              </Link>

              <Link
                to="/library"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#0f172a',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <LibraryIcon size={18} color="#0f172a" />
                <span>Free E-Library & Past Papers</span>
              </Link>

              <Link
                to="/#calculator"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#0f172a',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <CalculatorIcon size={18} color="#0f172a" />
                <span>Tuition Fees Inquiry</span>
              </Link>

              <Link
                to="/timetable"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#0f172a',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <ClockIcon size={18} color="#0f172a" />
                <span>Virtual Class Timetable</span>
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#0f172a',
                  textDecoration: 'none',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <BuildingIcon size={18} color="#0f172a" />
                <span>About Éclat Institute</span>
              </Link>
            </div>

            {/* Drawer Footer Actions */}
            <div
              style={{
                padding: '1rem 1.1rem',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
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
                  gap: '8px',
                  textDecoration: 'none',
                }}
              >
                <LockIcon size={16} color="#ffffff" />
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
                  gap: '8px',
                  fontSize: '0.84rem',
                }}
              >
                <MessageCircleIcon size={16} color="#ffffff" />
                <span>WhatsApp Admissions Desk</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Header Strip */}
      <div style={{ background: '#f8fafc', padding: '2rem 1.25rem 1.5rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <BookOpenIcon size={14} color="#1d4ed8" />
          <span>2026 Academic Catalog</span>
        </span>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#0f172a', margin: '0.75rem 0 0.4rem', fontFamily: 'var(--font-heading)' }}>
          Explore Certified Career Masterclasses
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
          100% online live classes across flexible shifts (Early Morning, Late Morning, Midday, Afternoon, Evening & Night), verifiable global certificates, real-world practical projects, and flexible 2-month installment fee plans.
        </p>

        {/* Matched Intake Cohort Highlight Banner */}
        {matchedIntake && (
          <div
            style={{
              marginTop: '1.25rem',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
              border: '1.5px solid #d4af37',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              textAlign: 'left',
              boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#16a34a', color: '#ffffff', padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>
                  ● {matchedIntake.status}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#d4af37', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CalendarIcon size={14} color="#d4af37" />
                  <span>{matchedIntake.title}</span>
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ClockIcon size={13} color="#94a3b8" />
                  <span>Deadline: <strong>{formatDate(matchedIntake.application_deadline)}</strong></span>
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <RocketIcon size={13} color="#60a5fa" />
                  <span>Classes Start: <strong>{formatDate(matchedIntake.commencement_date)}</strong></span>
                </span>
              </div>
              {matchedIntake.early_bird_discount && (
                <div style={{ fontSize: '0.78rem', color: '#fef08a', fontWeight: 700, marginTop: '3px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <AwardIcon size={13} color="#fef08a" />
                  <span>{matchedIntake.early_bird_discount}</span>
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
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              <MessageCircleIcon size={16} color="#ffffff" />
              <span>Enroll in this Intake</span>
            </a>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: '1rem', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
              <SearchIcon size={18} color="#64748b" />
            </div>
            <input
              type="text"
              placeholder="Search programs by skill, title, or exam board (e.g. Forex, Python, IELTS, SPSS, React, Accounting, German)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1.1rem 0.85rem 2.8rem',
                borderRadius: '14px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.9rem',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
              const isSel = selectedCat === cat
              const icon =
                cat === 'All' ? (
                  <SparklesIcon size={14} color={isSel ? '#ffffff' : '#475569'} />
                ) : cat === 'School of Business' ? (
                  <BriefcaseIcon size={14} color={isSel ? '#ffffff' : '#475569'} />
                ) : cat === 'School of IT and Data Science' ? (
                  <CodeIcon size={14} color={isSel ? '#ffffff' : '#475569'} />
                ) : cat === 'School of Language' ? (
                  <GlobeIcon size={14} color={isSel ? '#ffffff' : '#475569'} />
                ) : cat === 'IGCSE' ? (
                  <BritishShieldIcon size={14} />
                ) : (
                  <GraduationCapIcon size={14} color={isSel ? '#ffffff' : '#475569'} />
                )

              const label =
                cat === 'All'
                  ? 'All Academic Programs'
                  : cat === 'School of Business'
                  ? 'School of Business'
                  : cat === 'School of IT and Data Science'
                  ? 'School of IT and Data Science'
                  : cat === 'School of Language'
                  ? 'School of Language'
                  : cat === 'IGCSE'
                  ? 'IGCSE (Cambridge & Edexcel)'
                  : cat

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    flexShrink: 0,
                    background: isSel ? '#1d4ed8' : '#ffffff',
                    color: isSel ? '#ffffff' : '#334155',
                    border: isSel ? '1.5px solid #1d4ed8' : '1.5px solid #cbd5e1',
                    borderRadius: '999px',
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    minHeight: '38px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isSel ? '0 2px 8px rgba(29, 78, 216, 0.2)' : '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              )
            })}
          </div>

          {/* Year Level Filter Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              padding: '0.45rem 0.75rem',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', paddingLeft: '4px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <GraduationCapIcon size={14} color="#1d4ed8" />
              <span>Year Level:</span>
            </span>
            {YEAR_LEVELS.map((lvl) => {
              const isSel = selectedYear === lvl
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedYear(lvl)}
                  style={{
                    flexShrink: 0,
                    background: isSel ? '#1d4ed8' : '#f1f5f9',
                    color: isSel ? '#ffffff' : '#334155',
                    border: isSel ? '1px solid #1d4ed8' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.76rem',
                    fontWeight: isSel ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {lvl}
                </button>
              )
            })}
          </div>

          {/* View Mode Toggle: All Courses vs Browse by School & Department */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.35rem' }}>
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <button
                type="button"
                onClick={() => setViewMode('courses')}
                style={{
                  background: viewMode === 'courses' ? '#1d4ed8' : 'transparent',
                  color: viewMode === 'courses' ? '#ffffff' : '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <BookOpenIcon size={14} color={viewMode === 'courses' ? '#ffffff' : '#475569'} />
                <span>Courses & Syllabi ({filteredCourses.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('schools')}
                style={{
                  background: viewMode === 'schools' ? '#1d4ed8' : 'transparent',
                  color: viewMode === 'schools' ? '#ffffff' : '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <BuildingIcon size={14} color={viewMode === 'schools' ? '#ffffff' : '#475569'} />
                <span>Browse Schools & Departments ({INSTITUTIONAL_SCHOOLS.length})</span>
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <BritishShieldIcon size={14} />
              <span>Centres: <strong style={{ color: '#1e3a8a' }}>CAIE KE042</strong> &bull; <strong style={{ color: '#b91c1c' }}>Edexcel EDX-98421</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Schools Directory OR Programs Grid */}
      {viewMode === 'schools' ? (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem 2rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <BuildingIcon size={22} color="#1d4ed8" />
              <span>Academic Faculties & Specialized Departments</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 0' }}>
              Explore our 4 academic faculties: School of Business, School of IT and Data Science, School of Language, and IGCSE (British International Curriculum).
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {INSTITUTIONAL_SCHOOLS.map((school) => (
              <div
                key={school.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: `1.5px solid ${school.color}33`,
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.2rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, width: '90px', height: '90px', background: `${school.color}0d`, borderRadius: '0 0 0 100%' }} />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: `${school.color}11`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${school.color}44`,
                          flexShrink: 0,
                        }}
                      >
                        <CourseIcon courseId={school.id} iconKey={school.icon} size={24} color={school.color} />
                      </div>
                      <div>
                        <span style={{ background: `${school.color}18`, color: school.color, padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase' }}>
                          {school.code}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                          {school.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 1rem', lineHeight: 1.45 }}>
                    {school.description}
                  </p>

                  <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.65rem 0.85rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Dean of Faculty</div>
                    <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>{school.dean_name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#1d4ed8' }}>{school.dean_email}</div>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    Departments ({school.departments.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {school.departments.map((dept) => (
                      <div
                        key={dept.id}
                        style={{
                          background: '#f8fafc',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                            {dept.name}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>
                            {dept.code}
                          </span>
                        </div>
                        {dept.programs && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                            {dept.programs.slice(0, 2).join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCat(school.category)
                    setViewMode('courses')
                  }}
                  style={{
                    background: school.color,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.65rem',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: `0 4px 14px ${school.color}33`,
                  }}
                >
                  <span>Explore {school.shortName} Courses</span>
                  <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Programs Grid */
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem 2rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', fontWeight: 600 }}>
            Showing <strong style={{ color: '#0f172a' }}>{filteredCourses.length}</strong> program{filteredCourses.length === 1 ? '' : 's'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #e2e8f0',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
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
                        background: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #bfdbfe',
                        flexShrink: 0,
                      }}
                    >
                      <CourseIcon courseId={course.id} iconKey={course.icon} size={26} color="#1d4ed8" />
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          background: `${course.tagColor}18`,
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
                        {course.tag.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Extended_Pictographic}/gu, '').trim()}
                      </span>
                      <a
                        href={getWhatsAppInquiryUrl(`Hello ${INSTITUTION_CONFIG.name} Admissions! I would like to make a Fees Inquiry for ${course.title}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                        }}
                      >
                        <MessageCircleIcon size={12} color="#1d4ed8" />
                        <span>Fees Inquiry</span>
                      </a>
                    </div>
                  </div>

                  {/* Board & Year Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
                    {course.examBoard && (
                      <span
                        style={{
                          background: course.examBoard.includes('Cambridge') ? '#eff6ff' : '#fef2f2',
                          color: course.examBoard.includes('Cambridge') ? '#1d4ed8' : '#b91c1c',
                          border: `1px solid ${course.examBoard.includes('Cambridge') ? '#bfdbfe' : '#fecaca'}`,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <BritishShieldIcon size={12} />
                        <span>{course.examBoard}</span>
                      </span>
                    )}
                    {course.yearLevel && (
                      <span
                        style={{
                          background: '#fefce8',
                          color: '#854d0e',
                          border: '1px solid #fef08a',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <GraduationCapIcon size={12} color="#854d0e" />
                        <span>{course.yearLevel}</span>
                      </span>
                    )}
                    {course.syllabusCode && (
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                        }}
                      >
                        Code: {course.syllabusCode}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem', lineHeight: 1.35, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                    {course.title}
                  </h3>

                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BriefcaseIcon size={14} color="#1d4ed8" />
                    <span>Career Outcome: <strong style={{ color: '#0f172a' }}>{course.careerOutcome}</strong></span>
                  </p>

                {/* Duration & Schedule Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem', fontSize: '0.74rem', color: '#475569' }}>
                  <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ClockIcon size={13} color="#64748b" />
                    <span>{course.duration}</span>
                  </span>
                  <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <BuildingIcon size={13} color="#64748b" />
                    <span>{course.schedule.split('(')[0]}</span>
                  </span>
                </div>

                {/* Skills Learned */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {course.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#eff6ff',
                        color: '#1e3a8a',
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        border: '1px solid #dbeafe',
                      }}
                    >
                      <CheckIcon size={12} color="#1d4ed8" style={{ marginRight: '4px', verticalAlign: 'middle' }} />{skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <a
                  href={getWhatsAppInquiryUrl(`Hello Admissions! I would like to enroll in ${course.title}. Please provide registration steps.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    background: '#1d4ed8',
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
                    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
                  }}
                >
                  Enroll Now →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Syllabus Modal */}
      {selectedCourse && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedCourse(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
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
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '1.5rem',
              color: '#0f172a',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase' }}>
                  {selectedCourse.category}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>
                  {selectedCourse.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close modal"
              >
                <XIcon size={16} color="#475569" />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ClockIcon size={14} color="#1d4ed8" />
                <span><strong>Duration:</strong> {selectedCourse.duration}</span>
              </div>
              <a
                href={getWhatsAppInquiryUrl(`Hello ${INSTITUTION_CONFIG.name} Admissions! I would like to make a Fees Inquiry for the course: ${selectedCourse.title}.`)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textDecoration: 'none',
                }}
              >
                <MessageCircleIcon size={13} color="#1d4ed8" />
                <span>Fees Inquiry</span>
              </a>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e3a8a', margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FlaskIcon size={14} color="#1d4ed8" />
              <span>Weekly Syllabus & Practical Labs</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {selectedCourse.syllabus?.map((s, idx) => (
                <div key={idx} style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 800 }}>{s.week}</div>
                  <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 700, margin: '2px 0' }}>{s.topic}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <FlaskIcon size={12} color="#64748b" />
                    <span>Lab: {s.practicalLab}</span>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={getWhatsAppInquiryUrl(`Hello Eclat Admissions! I reviewed the syllabus for ${selectedCourse.title} and would like to register.`)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%',
                background: '#1d4ed8',
                color: '#ffffff',
                padding: '0.8rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
              }}
            >
              <RocketIcon size={16} color="#ffffff" />
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
