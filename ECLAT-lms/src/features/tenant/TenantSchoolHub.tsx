import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { tenantSchoolStore } from '@/lib/tenantSchoolStore'
import { getTenantDomainLinks } from '@/lib/tenantDomain'
import type { TenantDomainLinks } from '@/lib/tenantDomain'
import { INSTITUTION_CONFIG } from '@/config/institution'
import type { PartnerSchoolTenant } from '@/types/tenantSchool'
import {
  GraduationCapIcon,
  UserIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CalendarIcon,
  BuildingIcon,
  GlobeIcon,
  PhoneIcon,
  MailIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LockIcon,
  ExternalLinkIcon,
  SparklesIcon,
  ClockIcon,
  CreditCardIcon,
  FileTextIcon,
  UsersIcon,
  AwardIcon,
} from '@/components/icons/AppIcons'

export function TenantSchoolHub() {
  const { schoolSlug, subview } = useParams<{ schoolSlug: string; subview?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [school, setSchool] = useState<PartnerSchoolTenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [customDomainInput, setCustomDomainInput] = useState('')
  const [customDomainMessage, setCustomDomainMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'hub' | 'calendar' | 'student' | 'teacher' | 'bursar' | 'principal'>(() => {
    if (subview === 'student') return 'student'
    if (subview === 'teacher') return 'teacher'
    if (subview === 'bursar') return 'bursar'
    if (subview === 'principal' || subview === 'admin') return 'principal'
    if (subview === 'calendar') return 'calendar'
    return 'hub'
  })

  useEffect(() => {
    if (!schoolSlug) {
      setLoading(false)
      return
    }
    const found = tenantSchoolStore.getSchoolBySlug(schoolSlug)
    setSchool(found)
    if (found?.custom_domain) {
      setCustomDomainInput(found.custom_domain)
    }
    setLoading(false)
  }, [schoolSlug])

  useEffect(() => {
    if (subview === 'student') setActiveTab('student')
    else if (subview === 'teacher') setActiveTab('teacher')
    else if (subview === 'bursar') setActiveTab('bursar')
    else if (subview === 'principal' || subview === 'admin') setActiveTab('principal')
    else if (subview === 'calendar') setActiveTab('calendar')
    else setActiveTab('hub')
  }, [subview])

  const copyToClipboard = (urlPath: string, label: string) => {
    const fullUrl = `${window.location.origin}${urlPath}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedLink(label)
    setTimeout(() => setCopiedLink(null), 2500)
  }

  const copyRawText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLink(label)
    setTimeout(() => setCopiedLink(null), 2500)
  }

  const handleSaveCustomDomain = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!school) return
    const cleaned = customDomainInput.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase()
    const updated = tenantSchoolStore.updateSchoolCustomDomain(school.slug, cleaned)
    if (updated) {
      setSchool(updated)
      setCustomDomainMessage({
        type: 'success',
        text: cleaned
          ? `Custom domain "${cleaned}" linked! Point your DNS CNAME to "eclat.institute".`
          : 'Custom domain cleared successfully.',
      })
      setTimeout(() => setCustomDomainMessage(null), 4500)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Loading School Portal...</h2>
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div style={{ minHeight: '85vh', background: '#f8fafc', padding: '3rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '580px', width: '100%', background: '#ffffff', borderRadius: '24px', padding: '2.5rem', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 12px 32px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.25rem' }}>
            🏫
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem' }}>
            School Portal Not Found
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The school domain slug <strong>"{schoolSlug}"</strong> has not been registered yet on the Éclat Multi-Tenant School Cloud.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/register-school"
              style={{
                background: '#1d4ed8',
                color: '#ffffff',
                fontWeight: 800,
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>Register This School ({schoolSlug}) Now →</span>
            </Link>
            <div style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0' }}>Or explore pre-configured live partner school portals:</div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/s/hillcrest" style={{ background: '#f1f5f9', color: '#881337', padding: '0.5rem 0.9rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                🇬🇧 Hillcrest British College
              </Link>
              <Link to="/s/apex-tech" style={{ background: '#f1f5f9', color: '#047857', padding: '0.5rem 0.9rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                💻 Apex Institute of Tech
              </Link>
              <Link to="/s/st-jude" style={{ background: '#f1f5f9', color: '#1d4ed8', padding: '0.5rem 0.9rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                🏛️ St. Jude Academy
              </Link>
            </div>
            <Link to="/" style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '1rem', textDecoration: 'none' }}>
              ← Return to Éclat Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Dynamic School Theming Colors
  const primaryColor = school.primary_color || '#1e3a8a'
  const accentColor = school.accent_color || '#d4af37'
  const isSemester = school.academic_system === 'semester'
  const systemTermLabel = isSemester ? 'Semester' : 'Term'
  const systemPluralLabel = isSemester ? 'Semesters' : 'Terms'
  const domainLinks = getTenantDomainLinks(school)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* 1. Custom Branded School Top Navigation Bar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '2px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Left: Custom School Branding */}
          <Link to={`/s/${school.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', minWidth: 0 }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: primaryColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.25rem',
                boxShadow: `0 4px 12px ${primaryColor}40`,
                flexShrink: 0,
              }}
            >
              {school.name.charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {school.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {school.motto} • <span style={{ color: primaryColor, fontWeight: 700 }}>{school.city}, {school.country}</span>
              </div>
            </div>
          </Link>

          {/* Right: School Status & Switch Desks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Dedicated Domain & Special Links Trigger */}
            <button
              type="button"
              onClick={() => setShowDomainModal(true)}
              style={{
                background: `${accentColor}18`,
                color: '#0f172a',
                border: `1.5px solid ${accentColor}70`,
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Manage Dedicated Subdomains, Special Links & Custom DNS"
            >
              <GlobeIcon size={14} color={primaryColor} />
              <span>Special Links &amp; Domains</span>
              <span
                style={{
                  background: '#ffffff',
                  color: primaryColor,
                  border: `1px solid ${primaryColor}40`,
                  borderRadius: '4px',
                  padding: '1px 5px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                }}
              >
                {school.slug}.eclat.institute
              </span>
            </button>

            {/* Active Calendar Pill */}
            <div
              style={{
                background: `${primaryColor}12`,
                color: primaryColor,
                border: `1px solid ${primaryColor}30`,
                borderRadius: '999px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.76rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <CalendarIcon size={13} color={primaryColor} />
              <span>{systemTermLabel} System: <strong>{school.active_period_name}</strong></span>
            </div>

            <Link
              to="/register-school"
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>+ Register Another School</span>
            </Link>

            <Link
              to="/"
              style={{
                color: '#64748b',
                fontSize: '0.76rem',
                fontWeight: 600,
                textDecoration: 'none',
                marginLeft: '0.25rem',
              }}
            >
              Éclat Cloud ↗
            </Link>
          </div>
        </div>

        {/* School Navigation Sub-Tabs */}
        <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '0 1rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '0.25rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('hub'); navigate(`/s/${school.slug}`) }}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.65rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'hub' ? 800 : 600,
                color: activeTab === 'hub' ? primaryColor : '#64748b',
                borderBottom: activeTab === 'hub' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🏫 School Portal Hub
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('calendar'); navigate(`/s/${school.slug}/calendar`) }}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.65rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'calendar' ? 800 : 600,
                color: activeTab === 'calendar' ? primaryColor : '#64748b',
                borderBottom: activeTab === 'calendar' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🗓️ {systemTermLabel} Calendar &amp; Dates
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('student'); navigate(`/s/${school.slug}/student`) }}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.65rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'student' ? 800 : 600,
                color: activeTab === 'student' ? primaryColor : '#64748b',
                borderBottom: activeTab === 'student' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🎓 Student Portal
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('teacher'); navigate(`/s/${school.slug}/teacher`) }}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.65rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'teacher' ? 800 : 600,
                color: activeTab === 'teacher' ? primaryColor : '#64748b',
                borderBottom: activeTab === 'teacher' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              👨‍🏫 Teacher Portal
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('bursar'); navigate(`/s/${school.slug}/bursar`) }}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.65rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'bursar' ? 800 : 600,
                color: activeTab === 'bursar' ? primaryColor : '#64748b',
                borderBottom: activeTab === 'bursar' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              💼 Bursar &amp; Fees Desk
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('principal'); navigate(`/s/${school.slug}/principal`) }}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.65rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'principal' ? 800 : 600,
                color: activeTab === 'principal' ? primaryColor : '#64748b',
                borderBottom: activeTab === 'principal' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🏛️ {school.principal_title} Desk
            </button>
          </div>
        </div>
      </header>

      {/* Main Branded Portal Body */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        {/* VIEW 1: MAIN SCHOOL HUB (Directory of the 4 Portals with Direct URLs) */}
        {activeTab === 'hub' && (
          <div>
            {/* Branded Billboard */}
            <div
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`,
                borderRadius: '24px',
                color: '#ffffff',
                padding: 'clamp(2rem, 5vw, 3.5rem)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 16px 40px ${primaryColor}30`,
                marginBottom: '2.5rem',
              }}
            >
              <div style={{ maxWidth: '820px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.14)', borderRadius: '999px', padding: '0.35rem 0.95rem', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
                  <span>🏫 OFFICIAL DIGITAL CAMPUS &amp; SIMS PORTALS</span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
                  {school.name}
                </h1>
                <p style={{ fontSize: '1.05rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                  Welcome to the official online institution portal for students, faculty, bursars, and guardians. Powered by our dedicated white-label cloud with integrated {systemPluralLabel.toLowerCase()}, continuous assessment, and verified credentials.
                </p>

                {/* Instant Share Links Bar */}
                <div style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)', borderRadius: '18px', padding: '1.1rem 1.35rem', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, fontWeight: 800 }}>
                      ⚡ Official Institution Subdomain &amp; Links
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ letterSpacing: '-0.01em' }}>{domainLinks.subdomainUrl}</span>
                      <span style={{ fontSize: '0.68rem', background: '#22c55e', color: '#052e16', padding: '2px 8px', borderRadius: '999px', fontWeight: 800 }}>
                        ● Live Subdomain
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Universal Path: <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{domainLinks.pathUrl}</span>
                      {school.custom_domain && (
                        <span> • Custom Domain: <strong style={{ color: '#38bdf8' }}>{school.custom_domain}</strong></span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.subdomainUrl, 'Official Subdomain')}
                      style={{
                        background: accentColor,
                        color: '#0f172a',
                        fontWeight: 800,
                        border: 'none',
                        borderRadius: '9px',
                        padding: '0.5rem 0.95rem',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <span>{copiedLink === 'Official Subdomain' ? '✅ Copied Subdomain!' : '📋 Copy Subdomain'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDomainModal(true)}
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        color: '#ffffff',
                        fontWeight: 700,
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '9px',
                        padding: '0.5rem 0.95rem',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <GlobeIcon size={14} color="#ffffff" />
                      <span>Special Links &amp; DNS Setup</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Academic Structure</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: primaryColor, marginTop: '4px' }}>
                  {school.academic_system === 'semester' ? '2 Semesters' : '3 Terms'} / Year
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{school.curriculum_type}</div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Enrolled Students</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                  {school.stats.students.toLocaleString()} Active
                </div>
                <div style={{ fontSize: '0.76rem', color: '#16a34a', marginTop: '2px', fontWeight: 700 }}>✓ Live Biometric Attendance</div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Faculty &amp; Teachers</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                  {school.stats.teachers} Certified Staff
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>Across {school.stats.departments} Departments</div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Head of Institution</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                  {school.principal_name}
                </div>
                <div style={{ fontSize: '0.76rem', color: primaryColor, marginTop: '2px', fontWeight: 700 }}>{school.principal_title}</div>
              </div>
            </div>

            {/* SPECIAL SCHOOL LINKS & DOMAIN MANAGEMENT CENTER */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #e2e8f0',
                padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                marginBottom: '3rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${primaryColor}12`, color: primaryColor, borderRadius: '999px', padding: '0.3rem 0.85rem', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    <GlobeIcon size={14} color={primaryColor} />
                    <span>Special Links &amp; Domain Management</span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.35rem' }}>
                    Branded Web Addresses &amp; Separate Portals for {school.name}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
                    Give your students, instructors, and accountants direct branded links to their respective dashboards. You have a dedicated Éclat Cloud subdomain and can also connect your school's official domain name via DNS CNAME.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDomainModal(true)}
                  style={{
                    background: primaryColor,
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <SparklesIcon size={15} color="#ffffff" />
                  <span>Domain Manager &amp; DNS Instructions</span>
                </button>
              </div>

              {/* 3 Domain Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {/* 1. Official Branded Subdomain */}
                <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '1.5rem', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        1. Dedicated Subdomain
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '999px' }}>
                        ● SSL Active
                      </span>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                      {domainLinks.subdomainUrl}
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                      Your school's reserved public subdomain on Éclat Cloud. Visitors arriving here automatically enter <strong>{school.name}</strong>'s customized portals.
                    </p>

                    {/* Role-Specific Portal Subdomain Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <span>🎓 <strong>Student:</strong> .../student</span>
                        <button
                          type="button"
                          onClick={() => copyRawText(domainLinks.portals.student.subdomain, 'Student Subdomain URL')}
                          style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          {copiedLink === 'Student Subdomain URL' ? '✅ Copied' : 'Copy'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <span>👨‍🏫 <strong>Teacher:</strong> .../teacher</span>
                        <button
                          type="button"
                          onClick={() => copyRawText(domainLinks.portals.teacher.subdomain, 'Teacher Subdomain URL')}
                          style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          {copiedLink === 'Teacher Subdomain URL' ? '✅ Copied' : 'Copy'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <span>💼 <strong>Bursar:</strong> .../bursar</span>
                        <button
                          type="button"
                          onClick={() => copyRawText(domainLinks.portals.bursar.subdomain, 'Bursar Subdomain URL')}
                          style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          {copiedLink === 'Bursar Subdomain URL' ? '✅ Copied' : 'Copy'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <span>🏛️ <strong>Principal:</strong> .../principal</span>
                        <button
                          type="button"
                          onClick={() => copyRawText(domainLinks.portals.principal.subdomain, 'Principal Subdomain URL')}
                          style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          {copiedLink === 'Principal Subdomain URL' ? '✅ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.subdomainUrl, 'Official Subdomain')}
                      style={{
                        flex: 1,
                        background: '#1d4ed8',
                        color: '#ffffff',
                        fontWeight: 800,
                        padding: '0.6rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      {copiedLink === 'Official Subdomain' ? '✅ Copied Subdomain' : '📋 Copy Subdomain Link'}
                    </button>
                  </div>
                </div>

                {/* 2. Universal Zero-Config Path */}
                <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '1.5rem', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        2. Universal Path (Zero-Config)
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '999px' }}>
                        Instant Access
                      </span>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                      {domainLinks.pathUrl}
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                      Works everywhere immediately without any DNS configuration or propagation delay. Perfect for text messages, WhatsApp, and parent notices.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <span>🎓 <strong>Student:</strong> /s/{school.slug}/student</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`/s/${school.slug}/student`, 'Student Path')}
                          style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          {copiedLink === 'Student Path' ? '✅ Copied' : 'Copy'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <span>👨‍🏫 <strong>Teacher:</strong> /s/{school.slug}/teacher</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`/s/${school.slug}/teacher`, 'Teacher Path')}
                          style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          {copiedLink === 'Teacher Path' ? '✅ Copied' : 'Copy'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <span>💼 <strong>Bursar:</strong> /s/{school.slug}/bursar</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`/s/${school.slug}/bursar`, 'Bursar Path')}
                          style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          {copiedLink === 'Bursar Path' ? '✅ Copied' : 'Copy'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <span>🏛️ <strong>Principal:</strong> /s/{school.slug}/principal</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`/s/${school.slug}/principal`, 'Principal Path')}
                          style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          {copiedLink === 'Principal Path' ? '✅ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(`/s/${school.slug}`, 'Universal Path')}
                    style={{
                      background: '#334155',
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.6rem',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    {copiedLink === 'Universal Path' ? '✅ Copied Path URL' : '📋 Copy Universal Path'}
                  </button>
                </div>

                {/* 3. Custom School Domain (BYOD) */}
                <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '1.5rem', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        3. Custom School Domain (BYOD)
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, background: school.custom_domain ? '#dcfce7' : '#fef3c7', color: school.custom_domain ? '#15803d' : '#b45309', padding: '2px 8px', borderRadius: '999px' }}>
                        {school.custom_domain ? '● Connected' : 'Optional'}
                      </span>
                    </div>

                    <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                      Connect your school's existing official web domain (e.g. <code>portal.{school.slug}.ac.ke</code> or <code>lms.{school.slug}.edu</code>).
                    </p>

                    <form onSubmit={handleSaveCustomDomain} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={customDomainInput}
                          onChange={(e) => setCustomDomainInput(e.target.value)}
                          placeholder="e.g. portal.myschool.edu"
                          style={{
                            flex: 1,
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.82rem',
                            outline: 'none',
                            fontFamily: 'monospace',
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            background: '#7c3aed',
                            color: '#ffffff',
                            fontWeight: 800,
                            padding: '0.55rem 0.85rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </form>

                    {customDomainMessage && (
                      <div
                        style={{
                          background: customDomainMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                          color: customDomainMessage.type === 'success' ? '#15803d' : '#b91c1c',
                          border: `1px solid ${customDomainMessage.type === 'success' ? '#86efac' : '#fca5a5'}`,
                          borderRadius: '8px',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          marginBottom: '0.75rem',
                        }}
                      >
                        {customDomainMessage.text}
                      </div>
                    )}

                    <div style={{ background: '#ffffff', borderRadius: '10px', padding: '0.85rem', border: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#475569' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>DNS CNAME Record Setup:</div>
                      <div style={{ fontFamily: 'monospace', color: '#0f172a', background: '#f1f5f9', padding: '0.35rem 0.5rem', borderRadius: '6px', marginBottom: '0.35rem' }}>
                        Type: <strong>CNAME</strong> | Name: <strong>portal</strong> | Value: <strong>eclat.institute</strong>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Once configured, Éclat's domain router directs incoming requests straight to this school portal.
                      </span>
                    </div>
                  </div>

                  {school.custom_domain && (
                    <button
                      type="button"
                      onClick={() => copyRawText(`https://${school.custom_domain}`, 'Custom Domain URL')}
                      style={{
                        background: '#7c3aed',
                        color: '#ffffff',
                        fontWeight: 800,
                        padding: '0.6rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        marginTop: '0.85rem',
                      }}
                    >
                      {copiedLink === 'Custom Domain URL' ? '✅ Copied Custom Domain' : '📋 Copy Custom Domain URL'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* THE 4 DEDICATED SEPARATE PORTALS CARDS */}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.25rem' }}>
              Dedicated Separate Portals for {school.name}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {/* 1. Student Portal Card */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <GraduationCapIcon size={24} color="#1d4ed8" />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                    Student Learning Portal
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, marginBottom: '0.75rem' }}>
                    URL: /s/{school.slug}/student
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    Enrolled trainees and candidates log in to access virtual lectures, class timetables, continuous assessments, submitted homework, and stamped report cards.
                  </p>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('student'); navigate(`/s/${school.slug}/student`) }}
                      style={{
                        flex: 1,
                        background: '#1d4ed8',
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Enter Student Portal</span>
                      <ArrowRightIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`/s/${school.slug}/student`, 'Student Portal URL')}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.65rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                      title="Copy Student Portal Link"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Teacher Portal Card */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <UserIcon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                    Teacher &amp; Faculty Desk
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginBottom: '0.75rem' }}>
                    URL: /s/{school.slug}/teacher
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    Subject tutors and class teachers take morning/afternoon attendance, enter CAT and exam marks into continuous gradebooks, and upload lesson study materials.
                  </p>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('teacher'); navigate(`/s/${school.slug}/teacher`) }}
                      style={{
                        flex: 1,
                        background: '#059669',
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Enter Teacher Desk</span>
                      <ArrowRightIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`/s/${school.slug}/teacher`, 'Teacher Desk URL')}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.65rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                      title="Copy Teacher Portal Link"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Bursar & Finance Desk Card */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <BriefcaseIcon size={24} color="#b45309" />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                    Bursar &amp; Finance Office
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700, marginBottom: '0.75rem' }}>
                    URL: /s/{school.slug}/bursar
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    Finance staff generate tuition invoices for each {systemTermLabel.toLowerCase()}, record bank wire/card payments, issue official stamped receipts with QR codes, and track fee arrears.
                  </p>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('bursar'); navigate(`/s/${school.slug}/bursar`) }}
                      style={{
                        flex: 1,
                        background: '#b45309',
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Enter Bursar Desk</span>
                      <ArrowRightIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`/s/${school.slug}/bursar`, 'Bursar Desk URL')}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.65rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                      title="Copy Bursar Portal Link"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Principal & Head of School Desk Card */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${primaryColor}15`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <BuildingIcon size={24} color={primaryColor} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                    {school.principal_title} Office
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: primaryColor, fontWeight: 700, marginBottom: '0.75rem' }}>
                    URL: /s/{school.slug}/principal
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    Executive cockpit for institutional oversight: sign off on term report cards, publish school-wide circulars, configure the academic calendar ({systemPluralLabel}), and manage staff accounts.
                  </p>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('principal'); navigate(`/s/${school.slug}/principal`) }}
                      style={{
                        flex: 1,
                        background: primaryColor,
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Enter {school.principal_title} Desk</span>
                      <ArrowRightIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`/s/${school.slug}/principal`, 'Principal Portal URL')}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.65rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                      title="Copy Principal Portal Link"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* School Contact Footer Info */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 800 }}>Need Assistance with {school.name} Portals?</h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <PhoneIcon size={14} color="#64748b" /> {school.contact_phone}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <MailIcon size={14} color="#64748b" /> {school.contact_email}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <BuildingIcon size={14} color="#64748b" /> {school.address}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'right' }}>
                <div>White-Label Cloud Architecture</div>
                <div style={{ fontWeight: 700, color: '#1d4ed8' }}>⚡ Powered by Éclat Institute Multi-Tenant Engine</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ACADEMIC CALENDAR & DATES VIEW */}
        {activeTab === 'calendar' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  {school.name} — Official Academic Calendar
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                  Structured around {systemPluralLabel} ({isSemester ? 'Semester 1 & 2' : 'Term 1, 2 & 3'}) with exam windows and fee clearance milestones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`/s/${school.slug}/calendar`, 'Calendar Link')}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem 1rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
              >
                {copiedLink === 'Calendar Link' ? '✅ Copied Calendar Link' : '📋 Share Calendar Link'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {school.academic_calendar.map((period, index) => {
                const isActive = period.status === 'Active'
                return (
                  <div
                    key={period.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      border: isActive ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                      padding: '1.5rem',
                      boxShadow: isActive ? `0 8px 24px ${primaryColor}20` : '0 2px 6px rgba(0,0,0,0.03)',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: isActive ? primaryColor : '#f1f5f9', color: isActive ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                          {index + 1}
                        </span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{period.name}</h3>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Code: {period.code}</div>
                        </div>
                      </div>

                      <span
                        style={{
                          background: isActive ? '#ecfdf5' : '#f8fafc',
                          color: isActive ? '#059669' : '#64748b',
                          border: isActive ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        {isActive ? '🟢 Active Teaching Period' : period.status === 'Upcoming' ? '🕒 Upcoming' : 'Completed'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#f8fafc', borderRadius: '12px', padding: '1rem', fontSize: '0.85rem' }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>PERIOD WINDOW</div>
                        <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                          {period.start_date} → {period.end_date}
                        </div>
                      </div>

                      {period.exam_start_date && (
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>EXAMINATION SERIES</div>
                          <div style={{ fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                            {period.exam_start_date} to {period.exam_end_date}
                          </div>
                        </div>
                      )}

                      {period.fee_deadline && (
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>FEE CLEARANCE CUTOFF</div>
                          <div style={{ fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                            Due by {period.fee_deadline}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: SIMULATED BRANDED STUDENT PORTAL */}
        {activeTab === 'student' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {school.name} STUDENT WORKSPACE
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>
                    Welcome, Candidate Brian Kipchumba
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Admission: <strong>{school.slug.toUpperCase()}-2026-0042</strong> • Class: <strong>Grade 11 / Year 11 Exam Cohort</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Current Academic Session:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: primaryColor }}>{school.active_period_name}</div>
                </div>
              </div>

              {/* Student Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700 }}>ACADEMIC STATUS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>Fully Cleared ✅</div>
                  <div style={{ fontSize: '0.76rem', color: '#4b5563', marginTop: '4px' }}>Eligible for all {school.active_period_name} assessments</div>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.76rem', color: '#1d4ed8', fontWeight: 700 }}>ATTENDANCE RATE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e40af', marginTop: '2px' }}>96.4% Present</div>
                  <div style={{ fontSize: '0.76rem', color: '#4b5563', marginTop: '4px' }}>Verified biometric &amp; class log records</div>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 700 }}>TUITION FEE BALANCE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>$0.00 (Cleared)</div>
                  <div style={{ fontSize: '0.76rem', color: '#4b5563', marginTop: '4px' }}>Invoice Receipt #{school.slug.toUpperCase()}-RCP-941</div>
                </div>
              </div>

              {/* Student Timetable Preview */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Active Course Modules ({systemTermLabel} Schedule)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { code: 'ENG-201', title: 'First Language English & Rhetoric', teacher: 'Mrs. Davis', time: '08:30 - 09:40 AM' },
                  { code: 'MTH-301', title: 'Pure Mathematics & Calculus', teacher: 'Mr. Sterling', time: '10:00 - 11:10 AM' },
                  { code: 'ICT-401', title: 'Computer Science, Algorithms & Python', teacher: 'Eng. Sarah', time: '11:30 - 12:40 PM' },
                  { code: 'SCI-202', title: 'Advanced Physics Lab & Practical Science', teacher: 'Dr. Mwangi', time: '02:00 - 03:15 PM' },
                ].map((c) => (
                  <div key={c.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ color: primaryColor }}>{c.code}</strong> — <span style={{ fontWeight: 700 }}>{c.title}</span>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Instructor: {c.teacher}</div>
                    </div>
                    <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                      🕒 {c.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SIMULATED BRANDED TEACHER PORTAL */}
        {activeTab === 'teacher' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {school.name} FACULTY DESK
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>
                    Teacher Desk — Continuous Gradebook
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Faculty ID: <strong>FAC-{school.slug.toUpperCase()}-08</strong> • Active Teaching Shift: <strong>Morning Cohort</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Marking attendance for ${school.name}: 34 students logged present today!`)}
                  style={{ background: '#059669', color: '#ffffff', fontWeight: 800, padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  ✓ Take Class Attendance
                </button>
              </div>

              <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '1rem', border: '1px solid #a7f3d0', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#065f46' }}>
                💡 <strong>Gradebook Notice:</strong> CAT 2 scores for <strong>{school.active_period_name}</strong> are due for submission to the {school.principal_title} Office before Friday 5:00 PM.
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Assigned Teaching Units</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { class: 'Form 3 Alpha', subject: 'Pure Mathematics', count: '38 Students', avg: '78.4% Mean' },
                  { class: 'Year 10 Cambridge', subject: 'Computer Science (0478)', count: '24 Candidates', avg: '82.1% Mean' },
                  { class: 'Diploma Year 1', subject: 'Database Management & SQL', count: '45 Trainees', avg: '75.6% Mean' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.98rem' }}>{item.class}</strong> — <span style={{ color: '#059669', fontWeight: 700 }}>{item.subject}</span>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.count} • Class Performance: {item.avg}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => alert(`Opening continuous gradebook for ${item.class}`)} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                        📊 Gradebook
                      </button>
                      <button type="button" onClick={() => alert(`Opening lesson upload desk for ${item.subject}`)} style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                        📁 Upload Notes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: SIMULATED BRANDED BURSAR DESK */}
        {activeTab === 'bursar' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {school.name} FINANCE &amp; BURSAR DESK
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>
                    Tuition Fees &amp; Revenue Ledger
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Billing Cycle: <strong>{school.active_period_name}</strong> • Bank Account: <strong>{school.name} School Trust</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Invoice batch generated for ${school.name}: 120 digital invoices prepared for ${school.active_period_name}!`)}
                  style={{ background: '#b45309', color: '#ffffff', fontWeight: 800, padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  + Generate {systemTermLabel} Invoices
                </button>
              </div>

              {/* Financial Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.76rem', color: '#854d0e', fontWeight: 700 }}>PROJECTED {systemTermLabel.toUpperCase()} FEES</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#713f12', marginTop: '2px' }}>$72,000.00</div>
                  <div style={{ fontSize: '0.75rem', color: '#854d0e', marginTop: '2px' }}>Based on {school.stats.students} enrolled students</div>
                </div>

                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>COLLECTED REVENUE</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#065f46', marginTop: '2px' }}>$61,400.00 (85.2%)</div>
                  <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>Visa, Bank Wire &amp; Mobile Payments</div>
                </div>

                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.76rem', color: '#dc2626', fontWeight: 700 }}>OUTSTANDING ARREARS</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#991b1b', marginTop: '2px' }}>$10,600.00 (14.8%)</div>
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '2px' }}>Automated reminder SMS queued</div>
                </div>
              </div>

              {/* Recent Payment Receipts */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Recent Official Stamped Fee Receipts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { rcp: `RCP-${school.slug.toUpperCase()}-940`, student: 'Amina Hassan (Adm: 0021)', amount: '$600.00 (Full Term)', date: 'Today, 10:14 AM' },
                  { rcp: `RCP-${school.slug.toUpperCase()}-939`, student: 'David Omondi (Adm: 0035)', amount: '$300.00 (Installment 1)', date: 'Yesterday, 03:40 PM' },
                  { rcp: `RCP-${school.slug.toUpperCase()}-938`, student: 'Sophia Vance (Adm: 0014)', amount: '$600.00 (Full Term)', date: 'Oct 04, 2026' },
                ].map((r) => (
                  <div key={r.rcp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ color: '#b45309' }}>{r.rcp}</strong> — <span style={{ fontWeight: 700 }}>{r.student}</span>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Date: {r.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 900, color: '#0f172a' }}>{r.amount}</span>
                      <button type="button" onClick={() => alert(`Printing verified stamped receipt with QR for ${r.rcp}`)} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        🖨️ Print Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: SIMULATED BRANDED PRINCIPAL DESK */}
        {activeTab === 'principal' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {school.name} EXECUTIVE LEADERSHIP
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>
                    {school.principal_name} — {school.principal_title} Desk
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Institutional Authority &amp; Examination Verification Office
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Report card sign-off: All student transcripts for ${school.active_period_name} will bear the official digital seal and signature of ${school.principal_name}!`)}
                  style={{ background: primaryColor, color: '#ffffff', fontWeight: 800, padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  ✍️ Bulk Sign Report Cards
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Calendar Mode</div>
                  <div style={{ color: primaryColor, fontWeight: 700, fontSize: '0.92rem' }}>
                    {school.academic_system === 'semester' ? '2 Semesters (Higher Ed / College Mode)' : '3 Terms (British / Primary / Secondary Mode)'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
                    Active: {school.active_period_name}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Curriculum Framework</div>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.92rem' }}>
                    {school.curriculum_type}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
                    Accredited Center Registry &amp; Certificate Series
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Institutional Brand Color</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: primaryColor, border: '1px solid #cbd5e1' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{primaryColor}</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
                    Applied across student ID cards, invoices &amp; report cards
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Institution Administration Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => alert(`Broadcasting official school notice for ${school.name}...`)}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.85rem', borderRadius: '10px', textAlign: 'left', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>📢 Broadcast School Circular</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Staff accounts: 34 active faculty profiles registered under ${school.name}`)}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.85rem', borderRadius: '10px', textAlign: 'left', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>👥 Manage Staff Directory</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Printing official academic handbook for ${school.name}`)}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.85rem', borderRadius: '10px', textAlign: 'left', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>📖 Institution Rules &amp; Policies</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SPECIAL LINKS & CUSTOM DOMAIN MANAGEMENT MODAL */}
      {showDomainModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDomainModal(false)
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`, color: '#ffffff', padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: accentColor, marginBottom: '0.25rem' }}>
                  <GlobeIcon size={13} color={accentColor} />
                  <span>Domain &amp; Access Links Configuration</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  Special Links for {school.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDomainModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Notification Banner */}
              {customDomainMessage && (
                <div
                  style={{
                    background: customDomainMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: customDomainMessage.type === 'success' ? '#15803d' : '#b91c1c',
                    border: `1px solid ${customDomainMessage.type === 'success' ? '#86efac' : '#fca5a5'}`,
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    marginBottom: '1.25rem',
                  }}
                >
                  {customDomainMessage.text}
                </div>
              )}

              {/* 1. Official Subdomain Section */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1. Dedicated School Subdomain
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '999px' }}>
                    ● Active SSL Subdomain
                  </span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                  {domainLinks.subdomainUrl}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  Share this address with students and staff. You can also provide them with their specific dashboard links directly:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                    <span>🎓 <strong>Student:</strong> .../student</span>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.portals.student.subdomain, 'Modal Student Link')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedLink === 'Modal Student Link' ? '✅ Copied' : 'Copy'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                    <span>👨‍🏫 <strong>Teacher:</strong> .../teacher</span>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.portals.teacher.subdomain, 'Modal Teacher Link')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedLink === 'Modal Teacher Link' ? '✅ Copied' : 'Copy'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                    <span>💼 <strong>Bursar:</strong> .../bursar</span>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.portals.bursar.subdomain, 'Modal Bursar Link')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedLink === 'Modal Bursar Link' ? '✅ Copied' : 'Copy'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                    <span>🏛️ <strong>Principal:</strong> .../principal</span>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.portals.principal.subdomain, 'Modal Principal Link')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedLink === 'Modal Principal Link' ? '✅ Copied' : 'Copy'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                    <span>🗓️ <strong>Calendar:</strong> .../calendar</span>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.portals.calendar.subdomain, 'Modal Calendar Link')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedLink === 'Modal Calendar Link' ? '✅ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyRawText(domainLinks.subdomainUrl, 'Official Subdomain Modal')}
                  style={{
                    width: '100%',
                    background: '#1d4ed8',
                    color: '#ffffff',
                    fontWeight: 800,
                    padding: '0.65rem',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    marginTop: '0.85rem',
                  }}
                >
                  {copiedLink === 'Official Subdomain Modal' ? '✅ Copied Subdomain URL' : '📋 Copy Primary Subdomain'}
                </button>
              </div>

              {/* 2. Universal Path Section */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    2. Universal Path (Zero-Config Fallback)
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '999px' }}>
                    Works Everywhere
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                  {domainLinks.pathUrl}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                  Direct URL path that works immediately on all devices, web browsers, and platforms without waiting for custom DNS propagation.
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`/s/${school.slug}`, 'Universal Path Modal')}
                  style={{
                    background: '#334155',
                    color: '#ffffff',
                    fontWeight: 800,
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  {copiedLink === 'Universal Path Modal' ? '✅ Copied Universal Path' : '📋 Copy Universal Path'}
                </button>
              </div>

              {/* 3. Custom Domain (BYOD) Section */}
              <div style={{ background: '#faf5ff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e9d5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    3. Connect Custom Domain (BYOD)
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: school.custom_domain ? '#dcfce7' : '#fef3c7', color: school.custom_domain ? '#15803d' : '#b45309', padding: '2px 8px', borderRadius: '999px' }}>
                    {school.custom_domain ? `Connected: ${school.custom_domain}` : 'Optional'}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  Point your institution's custom subdomain (e.g. <code>portal.{school.slug}.ac.ke</code> or <code>lms.{school.slug}.edu</code>) to Éclat Cloud.
                </p>

                <form onSubmit={handleSaveCustomDomain} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    placeholder="e.g. portal.myschool.edu"
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#7c3aed',
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.6rem 1.15rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Save Domain
                  </button>
                  {school.custom_domain && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomDomainInput('')
                        tenantSchoolStore.updateSchoolCustomDomain(school.slug, '')
                        setSchool(tenantSchoolStore.getSchoolBySlug(school.slug))
                        setCustomDomainMessage({ type: 'success', text: 'Custom domain cleared.' })
                      }}
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        fontWeight: 700,
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </form>

                {/* DNS Table */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                    DNS Setup Instructions:
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '0.5rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569' }}>
                        <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0' }}>Type</th>
                        <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0' }}>Host / Name</th>
                        <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0' }}>Points To / Value</th>
                        <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0' }}>TTL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', fontWeight: 800 }}>CNAME</td>
                        <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}>portal</td>
                        <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontWeight: 800, color: '#2563eb' }}>eclat.institute</td>
                        <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0' }}>3600 (Auto)</td>
                      </tr>
                    </tbody>
                  </table>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.74rem', lineHeight: 1.5 }}>
                    After adding the CNAME record in your domain registrar (GoDaddy, Cloudflare, Namecheap, etc.), requests for your custom domain will automatically load {school.name}'s dedicated portals.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.75rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowDomainModal(false)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
