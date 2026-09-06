import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { intakeStore } from '@/lib/intakeStore'
import { extractYouTubeId, formatDate } from '@/lib/utils'
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
            background: 'linear-gradient(145deg, #090e1f, #0d162f)',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(212, 175, 55, 0.2)',
            color: '#ffffff',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.1rem' }}>🗓️</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {currentIntake.status === 'Filling Fast' ? '🔥 Enrolling Now' : '✨ Upcoming Intake'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {intakes.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveIntakeIndex((prev) => (prev + 1) % intakes.length)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#93c5fd',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
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
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  padding: '2px 6px',
                }}
                aria-label="Close Floating Intake Modal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Intake Title & Term */}
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.35rem', lineHeight: 1.25 }}>
            {currentIntake.title}
          </h3>
          <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700, marginBottom: '0.75rem' }}>
            {currentIntake.term_session} • 100% Online Batches
          </div>

          {/* Countdown Clock Box */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '0.65rem 0.5rem',
              marginBottom: '0.85rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', marginBottom: '4px' }}>
              ⏰ Application Deadline Countdown:
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <div style={{ background: '#1e293b', padding: '4px 6px', borderRadius: '6px', minWidth: '40px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff' }}>{timeLeft.days}</span>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8', textTransform: 'uppercase' }}>Days</div>
              </div>
              <div style={{ background: '#1e293b', padding: '4px 6px', borderRadius: '6px', minWidth: '40px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff' }}>{timeLeft.hours}</span>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8', textTransform: 'uppercase' }}>Hours</div>
              </div>
              <div style={{ background: '#1e293b', padding: '4px 6px', borderRadius: '6px', minWidth: '40px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff' }}>{timeLeft.minutes}</span>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8', textTransform: 'uppercase' }}>Mins</div>
              </div>
              <div style={{ background: '#1e293b', padding: '4px 6px', borderRadius: '6px', minWidth: '40px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#38bdf8' }}>{timeLeft.seconds}</span>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8', textTransform: 'uppercase' }}>Secs</div>
              </div>
            </div>
          </div>

          {/* Early Bird Discount Pill */}
          {currentIntake.early_bird_discount && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '8px',
                padding: '0.45rem 0.65rem',
                fontSize: '0.74rem',
                color: '#fef08a',
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
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.45rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>DEADLINE:</div>
              <div style={{ fontWeight: 800, color: '#ffffff' }}>{formatDate(currentIntake.application_deadline)}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.45rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>CLASSES START:</div>
              <div style={{ fontWeight: 800, color: '#86efac' }}>{formatDate(currentIntake.commencement_date)}</div>
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
              : 'linear-gradient(135deg, #090e1f 0%, #1e3a8a 100%)',
            color: '#ffffff',
            border: '2px solid #d4af37',
            borderRadius: '999px',
            padding: '0.6rem 1.1rem',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 175, 55, 0.35)',
            transition: 'all 0.25s ease',
          }}
          aria-expanded={isOpen}
          aria-label="Toggle Upcoming Intakes"
        >
          <span style={{ fontSize: '1.1rem', animation: 'bounce 2s infinite' }}>🗓️</span>
          <span style={{ color: '#fef08a' }}>
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
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#94a3b8',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '0.7rem',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
