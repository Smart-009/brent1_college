import { useState, useId } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { tenantSchoolStore } from '@/lib/tenantSchoolStore'
import type { AcademicCalendarSystem, PartnerSchoolTenant } from '@/types/tenantSchool'
import {
  GraduationCapIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BuildingIcon,
  CalendarIcon,
  LockIcon,
  ExternalLinkIcon,
  AwardIcon,
  UsersIcon,
  SparklesIcon,
} from '@/components/icons/AppIcons'

const PRESET_COLORS = [
  { name: 'Burgundy & Gold', primary: '#881337', accent: '#d4af37' },
  { name: 'Royal Navy & Cyan', primary: '#1e3a8a', accent: '#0284c7' },
  { name: 'Emerald & Gold', primary: '#047857', accent: '#d97706' },
  { name: 'Deep Purple & Amber', primary: '#581c87', accent: '#f59e0b' },
  { name: 'Crimson & Slate', primary: '#991b1b', accent: '#64748b' },
  { name: 'Midnight & Teal', primary: '#0f172a', accent: '#0d9488' },
]

export function SchoolRegistrationPage() {
  const navigate = useNavigate()
  const formId = useId()

  // Form State
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registeredSchool, setRegisteredSchool] = useState<PartnerSchoolTenant | null>(null)

  // Step 1: School Identity
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [motto, setMotto] = useState('')
  const [curriculumType, setCurriculumType] = useState<PartnerSchoolTenant['curriculum_type']>(
    'British Curriculum (CAIE & Edexcel)'
  )
  const [country, setCountry] = useState('Kenya')
  const [city, setCity] = useState('Nairobi')
  const [address, setAddress] = useState('')

  // Step 2: Academic Calendar & Operations
  const [academicSystem, setAcademicSystem] = useState<AcademicCalendarSystem>('term')

  // Step 3: Branding & Leadership
  const [primaryColor, setPrimaryColor] = useState('#881337')
  const [accentColor, setAccentColor] = useState('#d4af37')
  const [logoUrl, setLogoUrl] = useState('/logo.png')
  const [principalName, setPrincipalName] = useState('')
  const [principalTitle, setPrincipalTitle] = useState('Principal')
  const [principalEmail, setPrincipalEmail] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Validation errors
  const [error, setError] = useState<string | null>(null)

  // Auto-slugify school name if user hasn't typed custom slug
  const handleNameChange = (val: string) => {
    setName(val)
    if (!isSlugManual) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setSlug(generatedSlug)
    }
  }

  const handleSlugChange = (val: string) => {
    setIsSlugManual(true)
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
    )
  }

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Please provide the full official name of your institution.')
      return
    }
    if (!slug.trim()) {
      setError('Please provide a unique URL slug for your school.')
      return
    }
    if (!city.trim() || !country.trim()) {
      setError('Please specify both the city and country.')
      return
    }
    setStep(2)
  }

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!principalName.trim()) {
      setError('Please provide the Principal or Head of School full name.')
      return
    }
    if (!contactEmail.trim()) {
      setError('Please provide an official contact email for the school.')
      return
    }
    if (!contactPhone.trim()) {
      setError('Please provide an administrative phone contact.')
      return
    }

    setIsSubmitting(true)
    try {
      const newSchool = tenantSchoolStore.registerSchool({
        name: name.trim(),
        slug: slug.trim(),
        motto: motto.trim() || 'Knowledge, Discipline and Leadership',
        logo_url: logoUrl.trim() || '/logo.png',
        primary_color: primaryColor,
        accent_color: accentColor,
        academic_system: academicSystem,
        curriculum_type: curriculumType,
        country: country.trim(),
        city: city.trim(),
        address: address.trim() || `${city.trim()}, ${country.trim()}`,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        principal_name: principalName.trim(),
        principal_title: principalTitle.trim() || 'Principal',
        principal_email: principalEmail.trim() || contactEmail.trim(),
      })

      setRegisteredSchool(newSchool)
    } catch (err: any) {
      setError(err?.message || 'Failed to register school. Please check your inputs.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success Confirmation Screen
  if (registeredSchool) {
    const hubUrl = `/s/${registeredSchool.slug}`
    const fullOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://eclat.institute'

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '680px', width: '100%', background: '#ffffff', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <CheckCircleIcon size={44} />
          </div>

          <span
            style={{
              display: 'inline-block',
              background: '#dcfce7',
              color: '#15803d',
              padding: '0.35rem 0.9rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}
          >
            Institution Cloud Provisioned
          </span>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {registeredSchool.name} is Live!
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your institution management ecosystem has been created with custom branding and separate dedicated portal URLs for your staff and students.
          </p>

          {/* Quick URL Cards */}
          <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '1.25rem', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
              Your School Dedicated URLs:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>🏫 School Main Hub</span>
                <p style={{ margin: '0.2rem 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {fullOrigin}/s/{registeredSchool.slug}
                </p>
              </div>
              <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>🎓 Student Portal</span>
                <p style={{ margin: '0.2rem 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {fullOrigin}/s/{registeredSchool.slug}/student
                </p>
              </div>
              <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>👨‍🏫 Teacher Portal</span>
                <p style={{ margin: '0.2rem 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {fullOrigin}/s/{registeredSchool.slug}/teacher
                </p>
              </div>
              <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>💳 Bursar & Accounts Desk</span>
                <p style={{ margin: '0.2rem 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {fullOrigin}/s/{registeredSchool.slug}/bursar
                </p>
              </div>
              <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>🛡️ Principal Executive Desk</span>
                <p style={{ margin: '0.2rem 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {fullOrigin}/s/{registeredSchool.slug}/principal
                </p>
              </div>
              <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>📅 Academic Calendar ({registeredSchool.academic_system.toUpperCase()})</span>
                <p style={{ margin: '0.2rem 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {fullOrigin}/s/{registeredSchool.slug}/calendar
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to={hubUrl}
              style={{
                background: registeredSchool.primary_color,
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
                padding: '1rem 1.75rem',
                borderRadius: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              }}
            >
              Launch School Portal Hub Now <ArrowRightIcon size={18} />
            </Link>
            <Link
              to="/"
              style={{
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.9rem',
                padding: '0.75rem',
                textDecoration: 'none',
              }}
            >
              Return to Éclat Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Top Banner Navigation */}
      <header
        style={{
          borderBottom: '1px solid #e2e8f0',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
              }}
            >
              É
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Éclat School Cloud
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                White-Label Institution Onboarding
              </span>
            </div>
          </Link>

          <Link
            to="/courses"
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#475569',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
            }}
          >
            Explore Catalog
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
        {/* Header Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#eff6ff',
              color: '#1d4ed8',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            <SparklesIcon size={16} /> Partner School Registration
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            Launch Your School's Dedicated Digital Campus
          </h1>
          <p
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              fontSize: '1.05rem',
              color: '#64748b',
              lineHeight: 1.6,
            }}
          >
            Get instant dedicated URLs for your students, teachers, bursar, and principal portals.
            Fully customized with your school crest, colors, and choice of <strong>Terms</strong> or <strong>Semesters</strong>.
          </p>
        </div>

        {/* Wizard Progress Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step >= 1 ? '#1d4ed8' : '#e2e8f0',
                color: step >= 1 ? '#ffffff' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              1
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: step >= 1 ? '#0f172a' : '#94a3b8' }}>
              Institution Profile
            </span>
          </div>

          <div style={{ width: '40px', height: '2px', background: step >= 2 ? '#1d4ed8' : '#e2e8f0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step >= 2 ? '#1d4ed8' : '#e2e8f0',
                color: step >= 2 ? '#ffffff' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              2
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: step >= 2 ? '#0f172a' : '#94a3b8' }}>
              Calendar System
            </span>
          </div>

          <div style={{ width: '40px', height: '2px', background: step >= 3 ? '#1d4ed8' : '#e2e8f0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step >= 3 ? '#1d4ed8' : '#e2e8f0',
                color: step >= 3 ? '#ffffff' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              3
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: step >= 3 ? '#0f172a' : '#94a3b8' }}>
              Branding & Leadership
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              maxWidth: '850px',
              margin: '0 auto 2rem',
              background: '#fef2f2',
              color: '#991b1b',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid #fecaca',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Main Form Body */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 12px 32px rgba(0,0,0,0.04)',
            }}
          >
            {/* STEP 1: Institution Profile */}
            {step === 1 && (
              <form onSubmit={handleNextStep1} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    1. Institution Profile & URL
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Enter your school name and pick your dedicated portal URL handle.
                  </p>
                </div>

                <div>
                  <label htmlFor={`${formId}-name`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Official School / College Name *
                  </label>
                  <input
                    id={`${formId}-name`}
                    type="text"
                    required
                    placeholder="e.g. St. Peter's International Academy"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor={`${formId}-slug`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Dedicated URL Slug *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
                    <span style={{ padding: '0.85rem 0.75rem 0.85rem 1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                      /s/
                    </span>
                    <input
                      id={`${formId}-slug`}
                      type="text"
                      required
                      placeholder="st-peters"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.85rem 1rem',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Your portals will be accessible at: <code>eclat.institute/s/{slug || 'your-school'}</code>
                  </span>
                </div>

                <div>
                  <label htmlFor={`${formId}-motto`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    School Motto / Tagline
                  </label>
                  <input
                    id={`${formId}-motto`}
                    type="text"
                    placeholder="e.g. Inspiring Excellence in Character & Intellect"
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor={`${formId}-curriculum`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Curriculum Framework
                  </label>
                  <select
                    id={`${formId}-curriculum`}
                    value={curriculumType}
                    onChange={(e) => setCurriculumType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                      background: '#ffffff',
                    }}
                  >
                    <option value="British Curriculum (CAIE & Edexcel)">British Curriculum (CAIE & Edexcel)</option>
                    <option value="American Curriculum">American Curriculum (AP / High School)</option>
                    <option value="National / CBC Curriculum">National / CBC Curriculum</option>
                    <option value="Vocational & TVET College">Vocational & TVET College</option>
                    <option value="Custom International">Custom International Framework</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor={`${formId}-country`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Country *
                    </label>
                    <input
                      id={`${formId}-country`}
                      type="text"
                      required
                      placeholder="Kenya"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-city`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      City / County *
                    </label>
                    <input
                      id={`${formId}-city`}
                      type="text"
                      required
                      placeholder="Nairobi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`${formId}-address`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Campus Physical Address
                  </label>
                  <input
                    id={`${formId}-address`}
                    type="text"
                    placeholder="e.g. Karen Road, P.O. Box 4020, Nairobi"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#1d4ed8',
                    color: '#ffffff',
                    fontWeight: 800,
                    padding: '0.95rem',
                    borderRadius: '14px',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                  }}
                >
                  Continue to Calendar System <ArrowRightIcon size={18} />
                </button>
              </form>
            )}

            {/* STEP 2: Academic System & Calendar */}
            {step === 2 && (
              <form onSubmit={handleNextStep2} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    2. Academic Calendar Configuration
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Choose how your school structures its academic year. Portals, fee invoices, and report cards adapt automatically.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Option A: Term System */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: academicSystem === 'term' ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                      background: academicSystem === 'term' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="academic_system"
                      checked={academicSystem === 'term'}
                      onChange={() => setAcademicSystem('term')}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                          Term-Based System (3 Terms)
                        </span>
                        <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                          Popular in K-12 & British Schools
                        </span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.35rem 0 0.5rem', lineHeight: 1.5 }}>
                        Year is divided into <strong>Term 1, Term 2, and Term 3</strong>. Report cards and tuition invoices are generated thrice per year.
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          📅 Term 1 (Jan - Apr)
                        </span>
                        <span style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          📅 Term 2 (May - Aug)
                        </span>
                        <span style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          📅 Term 3 (Sep - Nov)
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Option B: Semester System */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: academicSystem === 'semester' ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                      background: academicSystem === 'semester' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="academic_system"
                      checked={academicSystem === 'semester'}
                      onChange={() => setAcademicSystem('semester')}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                          Semester-Based System (2 Semesters)
                        </span>
                        <span style={{ background: '#ecfdf5', color: '#047857', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                          Colleges, Universities & TVET
                        </span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.35rem 0 0.5rem', lineHeight: 1.5 }}>
                        Year is structured into <strong>Semester 1 and Semester 2</strong>. Course units, GPA transcripts, and tuition installment schedules adapt to 2 primary academic blocks.
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          🎓 Semester 1 (Fall Cohort)
                        </span>
                        <span style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          🎓 Semester 2 (Spring Cohort)
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Option C: Trimester System */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: academicSystem === 'trimester' ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                      background: academicSystem === 'trimester' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="academic_system"
                      checked={academicSystem === 'trimester'}
                      onChange={() => setAcademicSystem('trimester')}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                          Trimester System (3 Equal Cycles)
                        </span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.35rem 0 0', lineHeight: 1.5 }}>
                        Accelerated year-round academic calendar with 3 equal study blocks (Trimester 1, 2, 3).
                      </p>
                    </div>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 700,
                      padding: '0.85rem 1.25rem',
                      borderRadius: '14px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: '#1d4ed8',
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.85rem',
                      borderRadius: '14px',
                      border: 'none',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    Continue to Branding & Leadership <ArrowRightIcon size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Branding & Leadership */}
            {step === 3 && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    3. Branding, Colors & Administration
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Personalize your portals with your institutional colors and executive leadership details.
                  </p>
                </div>

                {/* Preset Palettes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Choose Color Preset or Customize
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                    {PRESET_COLORS.map((palette) => (
                      <button
                        key={palette.name}
                        type="button"
                        onClick={() => {
                          setPrimaryColor(palette.primary)
                          setAccentColor(palette.accent)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.6rem',
                          borderRadius: '10px',
                          border: primaryColor === palette.primary ? '2px solid #0f172a' : '1px solid #e2e8f0',
                          background: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: palette.primary }} />
                          <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: palette.accent }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {palette.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor={`${formId}-primary-color`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Primary Brand Color
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        id={`${formId}-primary-color`}
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        style={{ width: '42px', height: '42px', borderRadius: '8px', border: 'none', cursor: 'pointer', padding: 0 }}
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`${formId}-accent-color`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Accent Color
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        id={`${formId}-accent-color`}
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        style={{ width: '42px', height: '42px', borderRadius: '8px', border: 'none', cursor: 'pointer', padding: 0 }}
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Principal / Head of School */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor={`${formId}-principal-name`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Principal / Head of School Full Name *
                    </label>
                    <input
                      id={`${formId}-principal-name`}
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Sterling"
                      value={principalName}
                      onChange={(e) => setPrincipalName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-principal-title`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Title
                    </label>
                    <input
                      id={`${formId}-principal-title`}
                      type="text"
                      placeholder="Principal"
                      value={principalTitle}
                      onChange={(e) => setPrincipalTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor={`${formId}-contact-email`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Administrative Contact Email *
                    </label>
                    <input
                      id={`${formId}-contact-email`}
                      type="email"
                      required
                      placeholder="admissions@school.edu"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-contact-phone`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Official Phone / WhatsApp *
                    </label>
                    <input
                      id={`${formId}-contact-phone`}
                      type="tel"
                      required
                      placeholder="+254 700 000 000"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 700,
                      padding: '0.85rem 1.25rem',
                      borderRadius: '14px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      background: primaryColor || '#1d4ed8',
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.85rem',
                      borderRadius: '14px',
                      border: 'none',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {isSubmitting ? 'Provisioning School Cloud...' : 'Complete Registration & Deploy Portals'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Real-Time Live Preview Pane */}
          <div style={{ position: 'sticky', top: '90px', alignSelf: 'start' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                padding: '1.75rem',
                boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                  Live Portal Preview
                </span>
                <span
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {academicSystem.toUpperCase()} SYSTEM
                </span>
              </div>

              {/* Mini School Banner */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  color: '#ffffff',
                  marginBottom: '1.25rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: `1px solid ${accentColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}
                  >
                    🏫
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, lineHeight: 1.2 }}>
                      {name || 'Your School Name'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: accentColor, fontWeight: 700 }}>
                      {curriculumType}
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9, fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{motto || 'Knowledge, Discipline and Leadership'}"
                </p>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.85 }}>
                  <span>📍 {city || 'City'}, {country || 'Country'}</span>
                  <span>👤 {principalName || 'Principal Name'}</span>
                </div>
              </div>

              {/* Portal URL preview */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Dedicated Student / Staff URLs:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  <div style={{ color: '#1d4ed8' }}>🔗 /s/{slug || 'school-slug'} (Hub)</div>
                  <div style={{ color: '#047857' }}>🎓 /s/{slug || 'school-slug'}/student</div>
                  <div style={{ color: '#d97706' }}>👨‍🏫 /s/{slug || 'school-slug'}/teacher</div>
                  <div style={{ color: '#7c3aed' }}>💳 /s/{slug || 'school-slug'}/bursar</div>
                  <div style={{ color: '#dc2626' }}>🛡️ /s/{slug || 'school-slug'}/principal</div>
                </div>
              </div>

              {/* Calendar system preview pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <CalendarIcon size={20} color="#15803d" />
                <div style={{ fontSize: '0.8rem', color: '#166534' }}>
                  <strong>Calendar Mode:</strong> Configured for{' '}
                  <span style={{ textTransform: 'capitalize', fontWeight: 800 }}>
                    {academicSystem}
                  </span>{' '}
                  reporting & gradebooks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
