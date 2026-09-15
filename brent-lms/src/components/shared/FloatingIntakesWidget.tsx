import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { intakeStore } from '@/lib/intakeStore'
import { formatDate } from '@/lib/utils'
import { getWhatsAppInquiryUrl } from '@/config/institution'
import { isNativeApp } from '@/utils/platform'
import type { IntakeSchedule } from '@/types/intake'

export function FloatingIntakesWidget() {
  const location = useLocation()
  const [intakes, setIntakes] = useState<IntakeSchedule[]>(() => intakeStore.getPublishedIntakes())
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [activeIntakeIndex, setActiveIntakeIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Do not render on native app or if dismissed
  const shouldRender = !isNativeApp() && !isDismissed && intakes.length > 0

  useEffect(() => {
    let mounted = true

    const syncIntakes = () => {
      const pub = intakeStore.getPublishedIntakes().filter((i) => i.status !== 'Closed')
      if (mounted && pub.length > 0) setIntakes(pub)
    }

    intakeStore.fetchCloudIntakes().then((list) => {
      if (mounted) {
        const pub = list.filter((i) => i.is_published && i.status !== 'Closed')
        if (pub.length > 0) setIntakes(pub)
      }
    })

    const handleUpdated = (e: any) => {
      if (!mounted) return
      if (e?.detail && Array.isArray(e.detail)) {
        const pub = e.detail.filter((i: IntakeSchedule) => i.is_published && i.status !== 'Closed')
        if (pub.length > 0) setIntakes(pub)
      } else {
        syncIntakes()
      }
    }

    window.addEventListener('eclat-intakes-updated', handleUpdated)
    window.addEventListener('eclat-data-synced', syncIntakes)
    window.addEventListener('focus', syncIntakes)

    return () => {
      mounted = false
      window.removeEventListener('eclat-intakes-updated', handleUpdated)
      window.removeEventListener('eclat-data-synced', syncIntakes)
      window.removeEventListener('focus', syncIntakes)
    }
  }, [])

  const currentIntake = useMemo(() => {
    return intakes[activeIntakeIndex] || intakes[0] || null
  }, [intakes, activeIntakeIndex])

  // Countdown timer calculation
  useEffect(() => {
    if (!currentIntake?.application_deadline) return

    const updateTimer = () => {
      const target = new Date(currentIntake.application_deadline).getTime()
      const now = new Date().getTime()
      const difference = target - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [currentIntake])

  if (!shouldRender || !currentIntake) return null

  const handleScrollToIntakes = () => {
    setIsOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById('intakes-section')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <aside
      aria-label="Upcoming Academic Intakes Widget"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9980,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 1. Expanded Floating Intake Card */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            left: '0',
            width: 'min(360px, calc(100vw - 36px))',
            background: '#ffffff',
            border: '2px solid #d4af37',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18), 0 0 25px rgba(212, 175, 55, 0.2)',
            color: '#0f172a',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.1rem' }}>🗓️</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {currentIntake.status === 'Filling Fast' ? '🔥 Enrolling Now' : '✨ Upcoming Intake'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {intakes.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveIntakeIndex((prev) => (prev + 1) % intakes.length)}
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  title="Next Intake"
                >
                  Next ({activeIntakeIndex + 1}/{intakes.length}) →
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close Floating Intake Modal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Intake Title & Term */}
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.35rem', lineHeight: 1.25 }}>
            {currentIntake.title}
          </h3>
          <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, marginBottom: '0.75rem' }}>
            {currentIntake.term_session} • 100% Online Live Classes
          </div>

          {/* Countdown Clock Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.65rem 0.5rem',
              marginBottom: '0.85rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', marginBottom: '4px' }}>
              ⏰ Application Deadline Countdown:
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 6px', borderRadius: '6px', minWidth: '40px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>{timeLeft.days}</span>
                <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase' }}>Days</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 6px', borderRadius: '6px', minWidth: '40px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>{timeLeft.hours}</span>
                <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase' }}>Hours</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 6px', borderRadius: '6px', minWidth: '40px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>{timeLeft.minutes}</span>
                <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase' }}>Mins</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 6px', borderRadius: '6px', minWidth: '40px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#2563eb' }}>{timeLeft.seconds}</span>
                <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase' }}>Secs</div>
              </div>
            </div>
          </div>

          {/* Early Bird Discount Pill */}
          {currentIntake.early_bird_discount && (
            <div
              style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '0.45rem 0.65rem',
                fontSize: '0.74rem',
                color: '#92400e',
                fontWeight: 700,
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🎁</span>
              <span>{currentIntake.early_bird_discount}</span>
            </div>
          )}

          {/* Key Dates Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{ background: '#fef2f2', padding: '0.45rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <div style={{ color: '#b91c1c', fontSize: '0.65rem', fontWeight: 700 }}>DEADLINE:</div>
              <div style={{ fontWeight: 800, color: '#991b1b' }}>{formatDate(currentIntake.application_deadline)}</div>
            </div>
            <div style={{ background: '#ecfdf5', padding: '0.45rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <div style={{ color: '#166534', fontSize: '0.65rem', fontWeight: 700 }}>CLASSES START:</div>
              <div style={{ fontWeight: 800, color: '#15803d' }}>{formatDate(currentIntake.commencement_date)}</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              href={getWhatsAppInquiryUrl(`Hello Admissions, I would like to register for the ${currentIntake.title} (${currentIntake.term_session}).`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.78rem',
                padding: '0.6rem 0.75rem',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
              }}
            >
              <span>💬</span>
              <span>Apply on WhatsApp</span>
            </a>

            {location.pathname === '/' ? (
              <button
                type="button"
                onClick={handleScrollToIntakes}
                className="btn"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>📜</span>
                <span>View Full Details</span>
              </button>
            ) : (
              <Link
                to="/#intakes-section"
                onClick={() => setIsOpen(false)}
                className="btn"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>📜</span>
                <span>View Intakes</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 2. Floating Trigger Pill Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #d4af37 0%, #b45309 100%)'
              : '#ffffff',
            color: isOpen ? '#ffffff' : '#0f172a',
            border: '2px solid #d4af37',
            borderRadius: '999px',
            padding: '0.6rem 1.15rem',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12), 0 0 15px rgba(212, 175, 55, 0.25)',
            transition: 'all 0.25s ease',
          }}
          aria-expanded={isOpen}
          aria-label="Toggle Upcoming Intakes"
        >
          <span style={{ fontSize: '1.1rem', animation: 'bounce 2s infinite' }}>🗓️</span>
          <span style={{ color: isOpen ? '#ffffff' : '#0f172a', fontWeight: 800 }}>
            {isOpen ? 'Close Intakes' : `Intakes: ${currentIntake.term_session}`}
          </span>
          <span
            style={{
              background: currentIntake.status === 'Filling Fast' ? '#f59e0b' : '#16a34a',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {currentIntake.status}
          </span>
        </button>

        {/* Small Dismiss Cross for users who want to hide it completely */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            color: '#64748b',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            fontSize: '0.75rem',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
          title="Dismiss Intakes Badge"
          aria-label="Dismiss Intakes Badge"
        >
          ✕
        </button>
      </div>
    </aside>
  )
}
