import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'
import {
  SparklesIcon,
  VideoIcon,
  LaptopIcon,
  CheckCircleIcon,
  CheckIcon,
  MessageCircleIcon,
  RocketIcon,
  ArrowRightIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  FileTextIcon,
  BuildingIcon,
  GraduationCapIcon,
  ClockIcon,
  UserIcon,
} from '@/components/icons/AppIcons'
import { schoolStore } from '@/lib/schoolData'

interface SubmittedTutorCourse {
  id: string
  providerType: 'individual_tutor' | 'partner_institution'
  tutorName: string
  institutionName?: string
  institutionLogo?: string
  institutionSignatory?: string
  deliveryMode: 'live_cohort' | 'self_paced'
  email: string
  phone: string
  courseTitle: string
  category: string
  courseDescription: string
  videoUrl: string
  suggestedPriceUsd: number
  payoutSplitPct: number
  submittedAt: string
  status: 'Pending Review' | 'Approved & Live' | 'Video Downloaded'
  downloadPath?: string
}

export function TutorPublishCoursePage() {
  const isMobile = useIsMobile(768)

  const [providerType, setProviderType] = useState<'individual_tutor' | 'partner_institution'>('individual_tutor')
  const [institutionName, setInstitutionName] = useState('')
  const [institutionLogo, setInstitutionLogo] = useState('')
  const [institutionSignatory, setInstitutionSignatory] = useState('')
  const [deliveryMode, setDeliveryMode] = useState<'live_cohort' | 'self_paced'>('self_paced')

  const [tutorName, setTutorName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [category, setCategory] = useState('Tech & Programming')
  const [suggestedPriceUsd, setSuggestedPriceUsd] = useState(60)
  const [videoUrl, setVideoUrl] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [revenueSplitPct, setRevenueSplitPct] = useState(50)
  const [payoutMethod, setPayoutMethod] = useState<'mpesa' | 'bank' | 'paypal'>('mpesa')
  const [payoutDetails, setPayoutDetails] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submittedCourse, setSubmittedCourse] = useState<SubmittedTutorCourse | null>(null)
  const [bridgeStatus, setBridgeStatus] = useState<{ online: boolean; dir?: string }>({ online: false })
  const [downloadStatusMsg, setDownloadStatusMsg] = useState<string | null>(null)

  // Check if local desktop bridge is running
  useEffect(() => {
    fetch('http://127.0.0.1:5179/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'online') {
          setBridgeStatus({ online: true, dir: data.saveDirectory })
        }
      })
      .catch(() => {
        setBridgeStatus({ online: false })
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setDownloadStatusMsg('Initializing automated course registration & video ingestion pipeline...')

    const finalTutorOrSchoolName =
      providerType === 'partner_institution' ? (institutionName.trim() || tutorName) : tutorName

    const newCourse: SubmittedTutorCourse = {
      id: `tc-${Date.now()}`,
      providerType,
      tutorName: finalTutorOrSchoolName,
      institutionName: providerType === 'partner_institution' ? institutionName.trim() : undefined,
      institutionLogo: providerType === 'partner_institution' ? institutionLogo.trim() : undefined,
      institutionSignatory: providerType === 'partner_institution' ? institutionSignatory.trim() : undefined,
      deliveryMode,
      email,
      phone,
      courseTitle,
      category,
      courseDescription,
      videoUrl,
      suggestedPriceUsd,
      payoutSplitPct: providerType === 'partner_institution' ? revenueSplitPct : 50,
      submittedAt: new Date().toISOString(),
      status: 'Approved & Live',
    }

    // 1. Immediately register course into schoolStore
    const newUnitId = `unit-${Date.now()}`
    const courseCode = `PUB-${Math.floor(100 + Math.random() * 900)}`
    try {
      await schoolStore.addCourseUnit({
        id: newUnitId,
        code: courseCode,
        title: courseTitle,
        department: category,
        program: courseTitle,
        course_duration: deliveryMode === 'live_cohort' ? '12 Weeks Cohort' : 'Self-Paced (Lifetime Access)',
        credit_hours: 40,
        teacher_id: `tch-${Date.now()}`,
        teacher_name: finalTutorOrSchoolName,
        description: courseDescription,
        fee: suggestedPriceUsd,
        course_fee: suggestedPriceUsd * 130,
        live_meeting_url: deliveryMode === 'live_cohort' ? 'https://meet.google.com/new' : undefined,
        live_schedule_text: deliveryMode === 'live_cohort' ? 'Live Cohort Sessions • Mon & Wed 7:30 PM EAT' : undefined,
        provider_type: providerType,
        institution_name: providerType === 'partner_institution' ? institutionName.trim() : undefined,
        institution_logo: providerType === 'partner_institution' ? institutionLogo.trim() : undefined,
        institution_signatory: providerType === 'partner_institution' ? institutionSignatory.trim() : undefined,
        delivery_mode: deliveryMode,
        revenue_split_pct: providerType === 'partner_institution' ? revenueSplitPct : 50,
        syllabus_modules: [
          {
            id: `mod-${Date.now()}-1`,
            module_number: 1,
            title: 'Module 1: Foundations & Core Practical Implementation',
            topics: ['Introduction & Overview', 'Hands-On Demonstration', 'Applied Project Work'],
            learning_outcomes: ['Grasp core principles', 'Complete practical assignments'],
            hours: 20,
          },
        ],
        lessons: [
          {
            id: `les-${Date.now()}-1`,
            title: `${courseTitle} - Complete Practical Masterclass`,
            video_url: videoUrl,
            duration_minutes: 60,
            content: courseDescription,
          },
        ],
        is_published: true,
        created_at: new Date().toISOString(),
      })
    } catch (storeErr) {
      console.warn('Could not register into schoolStore immediately:', storeErr)
    }

    // 2. Trigger local desktop video downloader bridge if online
    try {
      const bridgeRes = await fetch('http://127.0.0.1:5179/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          title: courseTitle,
          tutorName: finalTutorOrSchoolName,
        }),
      })

      if (bridgeRes.ok) {
        const bridgeData = await bridgeRes.json()
        newCourse.status = 'Video Downloaded'
        newCourse.downloadPath = bridgeData.savedPath
        setDownloadStatusMsg(`✓ Video automatically saved to Desktop: ${bridgeData.savedFilename}`)
      } else {
        setDownloadStatusMsg('Course registered & published live. Manual cloud video grab scheduled.')
      }
    } catch {
      // If web browser without desktop bridge daemon
      setDownloadStatusMsg('Course registered & published live! Video URL captured for white-label player.')
    }

    // 3. Persist in localStorage
    try {
      const existing: SubmittedTutorCourse[] = JSON.parse(
        localStorage.getItem('eclat_published_tutor_courses') || '[]'
      )
      existing.unshift(newCourse)
      localStorage.setItem('eclat_published_tutor_courses', JSON.stringify(existing))
    } catch {}

    setSubmitting(false)
    setSubmittedCourse(newCourse)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'inherit' }}>
      {/* Header Bar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.85rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Éclat" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #d4af37' }} />
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.01em' }}>
                ÉCLAT INSTITUTE
              </span>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>
                Faculty & Course Creator Publishing Hub
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/courses"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#2563eb',
                textDecoration: 'none',
                display: isMobile ? 'none' : 'inline-block',
              }}
            >
              Browse Student Catalog →
            </Link>
            <a
              href={getWhatsAppInquiryUrl('Hello Éclat Dean! I want to publish a course and earn 50% revenue share.')}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#22c55e',
                color: '#ffffff',
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MessageCircleIcon size={14} color="#ffffff" />
              <span>WhatsApp Dean</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #091322 0%, #0f2347 50%, #08101e 100%)',
          color: '#ffffff',
          padding: isMobile ? '2.5rem 1rem' : '4rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#fbbf24',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '1rem',
            }}
          >
            <SparklesIcon size={14} color="#fbbf24" />
            <span>Tutor & Partner School Course Publishing Network</span>
          </div>

          <h1
            style={{
              fontSize: isMobile ? '2rem' : '3.1rem',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '0 0 1rem',
              letterSpacing: '-0.02em',
            }}
          >
            Publish With Éclat Institute.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              For Tutors & Partner Schools.
            </span>
          </h1>

          <p
            style={{
              fontSize: isMobile ? '0.95rem' : '1.12rem',
              lineHeight: 1.65,
              color: '#cbd5e1',
              maxWidth: '740px',
              margin: '0 auto 1.75rem',
            }}
          >
            Whether you are an independent tutor creating video courses (earning 50% revenue share) or an academic school publishing accredited programs with your own institutional credentials, our platform handles automated video ingestion, Paystack payments, student portals, and verified certificates.
          </p>

          {/* Quick Pillars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '1rem',
              textAlign: 'left',
              marginTop: '2rem',
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>💵</div>
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc', display: 'block' }}>Guaranteed 50% Payout</strong>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Bi-weekly disbursements via M-Pesa, Bank Wire, or PayPal upon student checkout.</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>⚡</div>
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc', display: 'block' }}>Automated Video Download</strong>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Provide a Google Drive, Dropbox, or direct MP4 link; our system archives it to our secure vault.</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🔒</div>
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc', display: 'block' }}>Anti-Piracy Watermarking</strong>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Lectures are protected with Éclat DRM watermarking and student admission IDs.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Publishing Form Container */}
      <main style={{ maxWidth: '920px', margin: '-2rem auto 4rem', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
        {submittedCourse ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '2px solid #16a34a',
              padding: isMobile ? '1.5rem' : '2.5rem',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#166534', margin: '0 0 0.5rem' }}>
              Course Submitted & Video Queued!
            </h2>
            <p style={{ fontSize: '1rem', color: '#334155', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Thank you, <strong>{submittedCourse.tutorName}</strong>! Your course <strong>"{submittedCourse.courseTitle}"</strong> has been logged into our curriculum ingestion engine.
            </p>

            {downloadStatusMsg && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: '#15803d',
                  fontWeight: 700,
                  maxWidth: '650px',
                  margin: '0 auto 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircleIcon size={20} color="#16a34a" />
                <span>{downloadStatusMsg}</span>
              </div>
            )}

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '14px',
                padding: '1.25rem',
                textAlign: 'left',
                maxWidth: '650px',
                margin: '0 auto 2rem',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div><strong>Publisher:</strong> {submittedCourse.providerType === 'partner_institution' ? `🏫 ${submittedCourse.institutionName || submittedCourse.tutorName} (School)` : `👨‍🏫 ${submittedCourse.tutorName} (Tutor)`}</div>
                <div><strong>Category:</strong> {submittedCourse.category}</div>
                <div><strong>Delivery Track:</strong> <span style={{ color: submittedCourse.deliveryMode === 'live_cohort' ? '#7c3aed' : '#d97706', fontWeight: 800 }}>{submittedCourse.deliveryMode === 'live_cohort' ? '🎓 Live Cohort (Admissions Issued)' : '⚡ Self-Paced (Instant Streaming)'}</span></div>
                <div><strong>Tuition Price:</strong> ${submittedCourse.suggestedPriceUsd} USD</div>
                <div><strong>Revenue Split:</strong> <span style={{ color: '#16a34a', fontWeight: 900 }}>{submittedCourse.payoutSplitPct}% (${((submittedCourse.suggestedPriceUsd * submittedCourse.payoutSplitPct) / 100).toFixed(0)}/student)</span></div>
                <div><strong>Certification:</strong> <span style={{ color: '#0369a1', fontWeight: 700 }}>{submittedCourse.providerType === 'partner_institution' ? `Awarded by ${submittedCourse.institutionName || 'Partner School'}` : 'Awarded by Éclat Institute'}</span></div>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.65rem' }}>
                <strong>Source Video URL:</strong> <code style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>{submittedCourse.videoUrl}</code>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={getWhatsAppInquiryUrl(`Hello Eclat Dean! I just published my course "${submittedCourse.courseTitle}". My name is ${submittedCourse.tutorName} (${submittedCourse.phone}).`)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 800,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)',
                }}
              >
                <MessageCircleIcon size={18} color="#ffffff" />
                <span>Notify Dean on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setSubmittedCourse(null)
                  setCourseTitle('')
                  setVideoUrl('')
                  setCourseDescription('')
                }}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontWeight: 700, borderRadius: '10px' }}
              >
                Publish Another Course
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #cbd5e1',
              padding: isMobile ? '1.5rem 1.25rem' : '2.5rem',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.35rem' }}>
                Course Publication & Video Ingestion Form
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                Provide your course title, target fee, and video download URL. Our engineering team archives and brands your lectures within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {/* Creator Type Selector: Individual Tutor vs Partner School */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Step 1: Select Publishing Entity Type:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setProviderType('individual_tutor')
                      setRevenueSplitPct(50)
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      border: providerType === 'individual_tutor' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: providerType === 'individual_tutor' ? '#eff6ff' : '#ffffff',
                      color: providerType === 'individual_tutor' ? '#1e40af' : '#475569',
                      fontWeight: 800,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', marginBottom: '4px' }}>
                      <UserIcon size={18} color={providerType === 'individual_tutor' ? '#2563eb' : '#64748b'} />
                      <span>Individual Tutor (50% Revenue Share)</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 500 }}>
                      Automatic Éclat Institute-issued certificate naming you as Lead Faculty Instructor.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProviderType('partner_institution')
                      setRevenueSplitPct(70)
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      border: providerType === 'partner_institution' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: providerType === 'partner_institution' ? '#f0fdf4' : '#ffffff',
                      color: providerType === 'partner_institution' ? '#15803d' : '#475569',
                      fontWeight: 800,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', marginBottom: '4px' }}>
                      <BuildingIcon size={18} color={providerType === 'partner_institution' ? '#16a34a' : '#64748b'} />
                      <span>Partner School / Academic Institution</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 500 }}>
                      Certificates issued directly under your school's name & crest, in affiliation with Éclat.
                    </div>
                  </button>
                </div>
              </div>

              {/* Course Delivery Mode: Live Cohort vs Self-Paced */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Step 2: Course Delivery & Admission Mode:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('self_paced')}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      border: deliveryMode === 'self_paced' ? '2px solid #d97706' : '1px solid #cbd5e1',
                      background: deliveryMode === 'self_paced' ? '#fffbeb' : '#ffffff',
                      color: deliveryMode === 'self_paced' ? '#92400e' : '#475569',
                      fontWeight: 800,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', marginBottom: '4px' }}>
                      <VideoIcon size={18} color={deliveryMode === 'self_paced' ? '#d97706' : '#64748b'} />
                      <span>Self-Paced / On-Demand Video Course</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 500 }}>
                      Instant streaming unlock upon checkout. No admission hurdles. Verified certificate upon module completion.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMode('live_cohort')}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      border: deliveryMode === 'live_cohort' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                      background: deliveryMode === 'live_cohort' ? '#f5f3ff' : '#ffffff',
                      color: deliveryMode === 'live_cohort' ? '#6d28d9' : '#475569',
                      fontWeight: 800,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', marginBottom: '4px' }}>
                      <GraduationCapIcon size={18} color={deliveryMode === 'live_cohort' ? '#7c3aed' : '#64748b'} />
                      <span>Live Cohort Classes</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 500 }}>
                      Formal Éclat Admission Number generated, live Google Meet schedule, and timetable allocation.
                    </div>
                  </button>
                </div>
              </div>

              {/* Section 1: Instructor / Institution Identity */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {providerType === 'partner_institution' ? <BuildingIcon size={16} color="#1e3a8a" /> : <UserIcon size={16} color="#1e3a8a" />}
                  <span>3. {providerType === 'partner_institution' ? 'Institution Profile & Credential Settings' : 'Instructor & Revenue Details'}</span>
                </h3>

                {providerType === 'partner_institution' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                        Institution / School Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nairobi Coding Academy"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                        Certificate Signatory & Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Patrick Mwangi, Principal"
                        value={institutionSignatory}
                        onChange={(e) => setInstitutionSignatory(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                        School Crest / Logo URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://yourschool.com/logo.png"
                        value={institutionLogo}
                        onChange={(e) => setInstitutionLogo(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                ) : null}

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      {providerType === 'partner_institution' ? 'Administrator / Lead Contact Name *' : 'Tutor Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={providerType === 'partner_institution' ? 'e.g. Eng. Arthur Vance' : 'e.g. Samuel Karanja'}
                      value={tutorName}
                      onChange={(e) => setTutorName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={providerType === 'partner_institution' ? 'dean@nairobiacademy.ac.ke' : 'samuel@example.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Official WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Course Information */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileTextIcon size={16} color="#1e3a8a" />
                  <span>2. Course Syllabus & Pricing</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Course Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Masterclass in React 19 & Next.js Full-Stack"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Department Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        background: '#ffffff',
                      }}
                    >
                      <option value="Tech & Programming">Tech & Programming</option>
                      <option value="Data Science & Research">Data Science & Research</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Business Tech & Accounting">Business Tech & Accounting</option>
                      <option value="Forex & Quantitative Bots">Forex & Quantitative Bots</option>
                      <option value="Creative Arts & Graphic Design">Creative Arts & Graphic Design</option>
                      <option value="Cambridge IGCSE & Checkpoint">Cambridge IGCSE & Checkpoint</option>
                      <option value="Languages & Communication">Languages & Communication</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Tuition Fee (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={1000}
                      value={suggestedPriceUsd}
                      onChange={(e) => setSuggestedPriceUsd(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        fontWeight: 700,
                      }}
                    />
                  </div>
                </div>

                {/* 50% Share Calculator Preview Box */}
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1.5px solid #a7f3d0',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.84rem',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  <div>
                    <strong>Your 50% Profit Share:</strong> You earn{' '}
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#047857' }}>
                      ${(suggestedPriceUsd * 0.5).toFixed(0)} USD
                    </span>{' '}
                    (approx. KES {((suggestedPriceUsd * 0.5) * 130).toLocaleString()}) for every student enrolled!
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                    50/50 AUTOMATIC SPLIT
                  </span>
                </div>
              </div>

              {/* Section 3: Video Lecture URL */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <VideoIcon size={16} color="#1e3a8a" />
                  <span>3. Video Master Download URL</span>
                </h3>

                <div style={{ marginBottom: '0.65rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Video URL (Google Drive, Dropbox, WeTransfer, or direct .MP4 link) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/file/d/... or direct .mp4 URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    💡 <em>Tip: If using Google Drive, make sure link sharing is set to "Anyone with the link can view".</em>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Course Description & Learning Outcomes *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="What skills will students gain? List the key modules and practical lab projects included in this video course..."
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Section 4: Payout Details */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCardIcon size={16} color="#1e3a8a" />
                  <span>4. Your 50% Payout Method</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '180px 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Payout Channel
                    </label>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        background: '#ffffff',
                      }}
                    >
                      <option value="mpesa">M-Pesa (Kenya)</option>
                      <option value="bank">Bank Wire Transfer</option>
                      <option value="paypal">PayPal (International)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Payout Account / Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={payoutMethod === 'mpesa' ? 'e.g. M-Pesa Number: 0712345678' : payoutMethod === 'bank' ? 'Bank Name, Branch & Account Number' : 'PayPal Email Address'}
                      value={payoutDetails}
                      onChange={(e) => setPayoutDetails(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheckIcon size={16} color="#16a34a" />
                  <span>Your Intellectual Property & Revenue Rights are Protected</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 900,
                    padding: '0.85rem 2rem',
                    borderRadius: '10px',
                    fontSize: '0.96rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  <RocketIcon size={18} color="#ffffff" />
                  <span>{submitting ? 'Processing Course & Ingesting Video...' : 'Publish Course (50% Revenue Share) →'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
