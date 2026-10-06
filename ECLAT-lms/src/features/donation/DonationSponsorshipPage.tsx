import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { initializePaystackCheckout } from '@/lib/paystack'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'
import {
  HeartHandshakeIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  GraduationCapIcon,
  BuildingIcon,
  CheckCircleIcon,
  MessageCircleIcon,
  PhoneIcon,
  MailIcon,
  CreditCardIcon,
  SmartphoneIcon,
  LockIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@/components/icons/AppIcons'

export function DonationSponsorshipPage() {
  useEffect(() => {
    document.title = `Sponsor a Student & Education Grants — ${INSTITUTION_CONFIG.name} Foundation`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [customAmount, setCustomAmount] = useState<number | ''>(50)
  const [presetAmount, setPresetAmount] = useState<number | null>(50)
  const [currency, setCurrency] = useState<'USD' | 'KES'>('USD')
  const [sponsorshipTrack, setSponsorshipTrack] = useState<
    'physical_institution' | 'vocational_bootcamp' | 'general_scholarship'
  >('physical_institution')
  const [donorMessage, setDonorMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [donationSuccess, setDonationSuccess] = useState<{
    reference: string
    amount: number
    currency: string
    donorName: string
    track: string
    date: string
  } | null>(null)

  const PRESET_TIERS_USD = [
    { amount: 25, label: '$25 USD', impact: 'Provides essential textbooks, exam revision sets, and e-learning data bundles' },
    { amount: 50, label: '$50 USD', impact: 'Funds 1 full month of immersive vocational tuition & practical software lab training' },
    { amount: 150, label: '$150 USD', impact: 'Covers complete accredited certification fee + live cohort mentorship for 1 underprivileged student' },
    { amount: 350, label: '$350 USD', impact: 'Full Term Institutional Placement: Directly sponsors 1 student into a verified physical partner college or academy' },
    { amount: 800, label: '$800 USD', impact: 'Full Year Physical Education Sponsorship: Covers boarding/tuition fees for a student at an accredited physical institution' },
  ]

  const PRESET_TIERS_KES = [
    { amount: 3000, label: 'KES 3,000', impact: 'Provides revision packs, exam fees, and online learning connectivity' },
    { amount: 6500, label: 'KES 6,500', impact: 'Sponsors 1 full month of intensive vocational skill acquisition & digital training' },
    { amount: 18000, label: 'KES 18,000', impact: 'Full credential course sponsorship with verified certificate & project lab' },
    { amount: 45000, label: 'KES 45,000', impact: 'Direct term enrollment into a brick-and-mortar partner high school or technical college' },
    { amount: 100000, label: 'KES 100,000', impact: 'Comprehensive full-year institutional scholarship for high-potential needy youth' },
  ]

  const currentTiers = currency === 'USD' ? PRESET_TIERS_USD : PRESET_TIERS_KES

  const handleSelectTier = (amount: number) => {
    setPresetAmount(amount)
    setCustomAmount(amount)
  }

  const handleCustomChange = (val: string) => {
    const num = Number(val)
    if (!isNaN(num) && num >= 0) {
      setCustomAmount(num)
      setPresetAmount(null)
    } else if (val === '') {
      setCustomAmount('')
      setPresetAmount(null)
    }
  }

  const effectiveAmount = typeof customAmount === 'number' ? customAmount : 0

  const handleInitiateDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (effectiveAmount <= 0) {
      alert('Please enter a valid contribution amount.')
      return
    }

    if (!donorEmail.trim()) {
      alert('Please enter your email address so we can issue your official donation receipt and impact updates.')
      return
    }

    setSubmitting(true)

    try {
      await initializePaystackCheckout({
        email: donorEmail.trim(),
        amount: effectiveAmount,
        currency,
        studentName: isAnonymous ? 'Anonymous Benefactor' : donorName.trim() || 'Generous Donor',
        purpose: `Sponsorship Fund: ${
          sponsorshipTrack === 'physical_institution'
            ? 'Physical Institution Enrollment Placement'
            : sponsorshipTrack === 'vocational_bootcamp'
            ? 'Vocational & Tech Career Sponsorship'
            : 'General Education & Less Fortunate Support Fund'
        }`,
        onSuccess: (ref) => {
          setSubmitting(false)
          setDonationSuccess({
            reference: ref,
            amount: effectiveAmount,
            currency,
            donorName: isAnonymous ? 'Anonymous Benefactor' : donorName.trim() || 'Generous Donor',
            track:
              sponsorshipTrack === 'physical_institution'
                ? 'Physical Institutional Placement Fund'
                : sponsorshipTrack === 'vocational_bootcamp'
                ? 'Vocational Bootcamp Sponsorship'
                : 'General Education Support Fund',
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          })

          // Save record in localStorage for reporting & transparency
          try {
            const existing = JSON.parse(localStorage.getItem('eclat_donations_ledger') || '[]')
            existing.unshift({
              reference: ref,
              amount: effectiveAmount,
              currency,
              donorName: isAnonymous ? 'Anonymous' : donorName,
              donorEmail,
              donorPhone,
              track: sponsorshipTrack,
              message: donorMessage,
              timestamp: new Date().toISOString(),
            })
            localStorage.setItem('eclat_donations_ledger', JSON.stringify(existing))
          } catch {}
        },
        onClose: () => {
          setSubmitting(false)
        },
      })
    } catch (err) {
      setSubmitting(false)
      alert('Could not launch payment window. Please try again.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Top Banner Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.65rem 1.25rem',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <img
              src="/logo.png"
              alt="Éclat Institute Logo"
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #d4af37' }}
            />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                ÉCLAT INSTITUTE
              </div>
              <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Education For All • Sponsorship Foundation
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/courses"
              className="btn btn-sm"
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                fontWeight: 700,
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                textDecoration: 'none',
              }}
            >
              Browse Programs
            </Link>
            <Link
              to="/"
              className="btn btn-sm btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section
        style={{
          background: 'radial-gradient(ellipse at top, #14532d 0%, #064e3b 50%, #022c22 100%)',
          color: '#ffffff',
          padding: '3.5rem 1.25rem 4rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(212, 175, 55, 0.12) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(134, 239, 172, 0.35)',
              padding: '0.35rem 1rem',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#86efac',
              marginBottom: '1.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <HeartHandshakeIcon size={16} color="#86efac" />
            <span>Éclat Community Education & Opportunity Initiative</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              fontFamily: 'var(--font-heading)',
              margin: '0 0 1.25rem',
              color: '#ffffff',
            }}
          >
            Empower the Less Fortunate Through the Gift of Education
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              lineHeight: 1.65,
              color: '#d1fae5',
              maxWidth: '740px',
              margin: '0 auto 1.5rem',
            }}
          >
            100% of your contributions go directly toward funding education for underprivileged students. 
            When funds reach the threshold, we directly enroll deserving youth into accredited{' '}
            <strong style={{ color: '#fef08a' }}>physical brick-and-mortar institutions</strong> or provide full 
            tuition for our online professional bootcamps.
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: '1.25rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <CheckCircleIcon size={16} color="#4ade80" />
              <span>Direct Physical School Enrollment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <CheckCircleIcon size={16} color="#4ade80" />
              <span>Full Tuition & Examination Coverage</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <CheckCircleIcon size={16} color="#4ade80" />
              <span>100% Transparent Financial Accounting</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1180px', margin: '-2.5rem auto 4rem', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Donation Form or Receipt */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12)',
            }}
          >
            {donationSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    border: '3px solid #22c55e',
                  }}
                >
                  <HeartIcon size={32} color="#16a34a" />
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  DONATION VERIFIED & RECORDED
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.5rem' }}>
                  Thank You for Your Generosity!
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                  Your donation of <strong>{donationSuccess.currency} {donationSuccess.amount.toLocaleString()}</strong> has been 
                  successfully received. You are actively opening life-transforming academic doors for an underprivileged learner!
                </p>

                {/* Stamped Receipt Slip */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '2px solid #86efac',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textAlign: 'left',
                    fontSize: '0.84rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b' }}>Reference ID:</span>
                    <strong style={{ color: '#1e3a8a', fontFamily: 'monospace' }}>{donationSuccess.reference}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#64748b' }}>Benefactor:</span>
                    <strong>{donationSuccess.donorName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#64748b' }}>Designated Fund:</span>
                    <strong style={{ color: '#166534' }}>{donationSuccess.track}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#64748b' }}>Date:</span>
                    <span>{donationSuccess.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Amount Cleared:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#16a34a' }}>
                      {donationSuccess.currency} {donationSuccess.amount.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={getWhatsAppInquiryUrl(`Hello Eclat Foundation! I just made a sponsorship donation of ${donationSuccess.currency} ${donationSuccess.amount} (Ref: ${donationSuccess.reference}). My name is ${donationSuccess.donorName}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{
                      background: '#22c55e',
                      color: '#ffffff',
                      padding: '0.65rem 1.25rem',
                      fontWeight: 800,
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <MessageCircleIcon size={16} color="#ffffff" />
                    <span>Confirm Receipt on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setDonationSuccess(null)
                      setCustomAmount(50)
                      setPresetAmount(50)
                    }}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: '0.65rem 1.25rem', fontWeight: 700, borderRadius: '8px' }}
                  >
                    Make Another Donation
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInitiateDonation}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      Sponsorship Contribution Desk
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                      Processed securely via Paystack (Cards, Apple Pay & M-Pesa)
                    </p>
                  </div>

                  {/* Currency Switcher */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency('USD')
                        setPresetAmount(50)
                        setCustomAmount(50)
                      }}
                      style={{
                        padding: '4px 10px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: currency === 'USD' ? '#ffffff' : 'transparent',
                        color: currency === 'USD' ? '#1e3a8a' : '#64748b',
                        boxShadow: currency === 'USD' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      USD ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency('KES')
                        setPresetAmount(6500)
                        setCustomAmount(6500)
                      }}
                      style={{
                        padding: '4px 10px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: currency === 'KES' ? '#ffffff' : 'transparent',
                        color: currency === 'KES' ? '#166534' : '#64748b',
                        boxShadow: currency === 'KES' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      KES (KSh)
                    </button>
                  </div>
                </div>

                {/* Step 1: Select or Enter Amount */}
                <div style={{ marginBottom: '1.35rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                    1. Choose Donation Tier:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    {currentTiers.map((tier) => (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => handleSelectTier(tier.amount)}
                        style={{
                          padding: '0.7rem 0.5rem',
                          borderRadius: '10px',
                          border: `2px solid ${presetAmount === tier.amount ? '#16a34a' : '#e2e8f0'}`,
                          background: presetAmount === tier.amount ? '#f0fdf4' : '#ffffff',
                          color: presetAmount === tier.amount ? '#166534' : '#1e293b',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Field */}
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>
                      {currency === 'USD' ? '$' : 'KES'}
                    </span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Or enter custom amount..."
                      value={customAmount}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem 0.65rem 2.5rem',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Dynamic Impact Statement */}
                  {effectiveAmount > 0 && (
                    <div style={{ marginTop: '0.65rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: '#065f46', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SparklesIcon size={16} color="#059669" />
                      <span>
                        <strong>Your Impact:</strong>{' '}
                        {currency === 'USD'
                          ? effectiveAmount >= 350
                            ? 'Sponsors direct admission and tuition placement into a verified physical partner academy or technical college!'
                            : effectiveAmount >= 150
                            ? 'Funds an entire accredited vocational bootcamp curriculum + certification for 1 learner.'
                            : effectiveAmount >= 50
                            ? 'Covers 1 month of full courseware, virtual classes, and practical coding labs.'
                            : 'Supports textbooks, past paper series, and internet data bundles.'
                          : effectiveAmount >= 45000
                          ? 'Directly enrolls an underprivileged student into a brick-and-mortar physical secondary school or college!'
                          : effectiveAmount >= 18000
                          ? 'Covers complete accredited vocational training & official certificate.'
                          : effectiveAmount >= 6500
                          ? 'Funds one month of vocational skills acquisition and digital workstation training.'
                          : 'Provides study materials, revisions packs, and online exam fees.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Step 2: Allocation Track */}
                <div style={{ marginBottom: '1.35rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                    2. Designated Education Allocation:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${sponsorshipTrack === 'physical_institution' ? '#16a34a' : '#e2e8f0'}`,
                        background: sponsorshipTrack === 'physical_institution' ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="sponsorshipTrack"
                        value="physical_institution"
                        checked={sponsorshipTrack === 'physical_institution'}
                        onChange={() => setSponsorshipTrack('physical_institution')}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <BuildingIcon size={16} color="#166534" />
                          Direct Enrollment in a Physical Institution (Recommended)
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', lineHeight: 1.45 }}>
                          Funds accumulate to formally pay tuition, admission fees, and admission registration for needy students to attend physical high schools, technical colleges, or universities.
                        </div>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${sponsorshipTrack === 'vocational_bootcamp' ? '#16a34a' : '#e2e8f0'}`,
                        background: sponsorshipTrack === 'vocational_bootcamp' ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="sponsorshipTrack"
                        value="vocational_bootcamp"
                        checked={sponsorshipTrack === 'vocational_bootcamp'}
                        onChange={() => setSponsorshipTrack('vocational_bootcamp')}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <GraduationCapIcon size={16} color="#2563eb" />
                          Virtual Vocational & Technology Bootcamp
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', lineHeight: 1.45 }}>
                          Sponsors an underprivileged youth into Éclat's online coding, data science, digital literacy, or business accounting programs with full hardware/data support.
                        </div>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${sponsorshipTrack === 'general_scholarship' ? '#16a34a' : '#e2e8f0'}`,
                        background: sponsorshipTrack === 'general_scholarship' ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="sponsorshipTrack"
                        value="general_scholarship"
                        checked={sponsorshipTrack === 'general_scholarship'}
                        onChange={() => setSponsorshipTrack('general_scholarship')}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <HeartHandshakeIcon size={16} color="#d97706" />
                          Where It's Needed Most (General Scholarship Pool)
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', lineHeight: 1.45 }}>
                          Empowers our scholarship board to allocate funds to immediate student needs, emergency exam fees, and textbooks.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Step 3: Benefactor Contact Info */}
                <div style={{ marginBottom: '1.35rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                    3. Benefactor Details:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <input
                        type="text"
                        placeholder="Your Full Name (or Organization)"
                        disabled={isAnonymous}
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.86rem',
                          outline: 'none',
                          background: isAnonymous ? '#f1f5f9' : '#ffffff',
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Email Address (for receipt & updates) *"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.86rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone / WhatsApp (Optional)"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.86rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Words of encouragement / Dedication"
                        value={donorMessage}
                        onChange={(e) => setDonorMessage(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.86rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <span>Keep my name anonymous on the public benefactors registry</span>
                  </label>
                </div>

                {/* Gateway Trust Box */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheckIcon size={18} color="#16a34a" />
                    <span style={{ fontSize: '0.78rem', color: '#334155' }}>
                      Processed via <strong>Paystack</strong> • 256-Bit SSL Encrypted
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                    <span>Visa</span> • <span>Mastercard</span> • <span>M-Pesa STK</span> • <span>Apple Pay</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || effectiveAmount <= 0}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.5rem',
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    borderColor: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(22, 163, 74, 0.35)',
                    cursor: submitting ? 'wait' : 'pointer',
                  }}
                >
                  <HeartHandshakeIcon size={20} color="#ffffff" />
                  <span>
                    {submitting
                      ? 'Opening Secure Payment Gateway...'
                      : `Donate ${currency} ${effectiveAmount ? effectiveAmount.toLocaleString() : '0'} to Education →`}
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Mission, Process, & Accountability */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Direct Physical Schooling Guarantee Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                borderRadius: '18px',
                padding: '1.75rem',
                border: '1.5px solid #86efac',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.85rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BuildingIcon size={22} color="#166534" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#166534', margin: 0 }}>
                    Our Physical Institution Enrollment Commitment
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                    Bridge From Virtual Support to Concrete Physical Classrooms
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1rem' }}>
                While Éclat Institute is an online campus, many brilliant children lack electricity, computers, or home stability to study virtually. 
                When funds accumulated for a student reach the target, <strong>we physically enroll them in recognized local secondary schools, vocational technical institutes, or academies</strong>, covering:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: '#1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckIcon size={14} color="#16a34a" />
                  <span>Direct bank tuition disbursements to the physical institution</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckIcon size={14} color="#16a34a" />
                  <span>Provision of official school uniforms, books, and laboratory sets</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckIcon size={14} color="#16a34a" />
                  <span>National exam registration (KCSE, KNEC, TVET, or British IGCSE)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckIcon size={14} color="#16a34a" />
                  <span>Quarterly academic transcripts sent directly to donors for verification</span>
                </div>
              </div>
            </div>

            {/* How It Works Flow */}
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem' }}>
                How Your Donation Transforms Lives:
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  {
                    step: '1',
                    title: 'Student Vetting & Needs Assessment',
                    desc: 'We verify needy students via local community recommendations, single-parent household checks, and academic aptitude interviews.',
                  },
                  {
                    step: '2',
                    title: 'Direct Institution Sponsoring',
                    desc: 'Once the tuition threshold is reached, payment is wired directly to the designated physical school or academy registrar — no cash is handed to intermediaries.',
                  },
                  {
                    step: '3',
                    title: 'Continuous Mentorship & Tracking',
                    desc: 'Students receive continuous academic monitoring, exam coaching, and career guidance until graduation.',
                  },
                  {
                    step: '4',
                    title: 'Donor Impact Ledger & Transparency',
                    desc: 'Benefactors receive an annual impact statement and progress letters documenting the students they have sponsored.',
                  },
                ].map((item) => (
                  <div key={item.step} style={{ display: 'flex', gap: '12px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, marginTop: '2px' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inquiries / Direct Partnership Helpdesk */}
            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                Have questions or want to sponsor a full cohort of students?
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={getWhatsAppInquiryUrl('Hello Eclat Foundation! I am interested in partnering to sponsor students or donate directly to your education fund.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{
                    background: '#22c55e',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <MessageCircleIcon size={14} color="#ffffff" />
                  <span>WhatsApp Foundation Desk</span>
                </a>
                <a
                  href={`tel:${INSTITUTION_CONFIG.contact.phoneRaw}`}
                  className="btn btn-sm btn-secondary"
                  style={{ fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none' }}
                >
                  Call {INSTITUTION_CONFIG.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2.5rem 1rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="Éclat Institute" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>Éclat Institute Foundation</span>
          </div>
          <p style={{ fontSize: '0.82rem', maxWidth: '640px', margin: 0, lineHeight: 1.6 }}>
            The Éclat Education & Scholarship Program is dedicated to breaking generational poverty through direct educational access. 
            All payments are cleared transparently via Paystack. Official receipts are issued with unique verification codes.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Home</Link>
            <Link to="/courses" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Courses</Link>
            <Link to="/about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>About Us</Link>
            <Link to="/donate" style={{ color: '#4ade80', fontWeight: 800, textDecoration: 'none' }}>Donate & Sponsor</Link>
            <Link to="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Privacy Policy</Link>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            © {new Date().getFullYear()} Éclat Institute. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
