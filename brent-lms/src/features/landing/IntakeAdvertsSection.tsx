import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { intakeStore } from '@/lib/intakeStore'
import { formatDate } from '@/lib/utils'
import { getWhatsAppInquiryUrl } from '@/config/institution'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { IntakeSchedule } from '@/types/intake'

function IntakeCountdown({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })

  useEffect(() => {
    const calc = () => {
      const target = new Date(deadline).getTime()
      const now = Date.now()
      const diff = target - now
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true })
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false })
      }
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  if (timeLeft.isExpired) {
    return (
      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f87171' }}>
        ⚠️ Late Registrations Open
      </div>
    )
  }

  return (
    <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
      <span
        style={{
          background: 'rgba(239, 68, 68, 0.25)',
          color: '#fca5a5',
          padding: '2px 5px',
          borderRadius: '4px',
          fontWeight: 800,
          fontSize: '0.72rem',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {timeLeft.days}d
      </span>
      <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>:</span>
      <span
        style={{
          background: 'rgba(239, 68, 68, 0.25)',
          color: '#fca5a5',
          padding: '2px 5px',
          borderRadius: '4px',
          fontWeight: 800,
          fontSize: '0.72rem',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(timeLeft.hours).padStart(2, '0')}h
      </span>
      <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>:</span>
      <span
        style={{
          background: 'rgba(239, 68, 68, 0.25)',
          color: '#fca5a5',
          padding: '2px 5px',
          borderRadius: '4px',
          fontWeight: 800,
          fontSize: '0.72rem',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(timeLeft.minutes).padStart(2, '0')}m
      </span>
      <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>:</span>
      <span
        style={{
          background: 'rgba(239, 68, 68, 0.25)',
          color: '#fca5a5',
          padding: '2px 5px',
          borderRadius: '4px',
          fontWeight: 800,
          fontSize: '0.72rem',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  )
}

export function IntakeAdvertsSection() {
  const isMobile = useIsMobile(768)
  const [intakes, setIntakes] = useState<IntakeSchedule[]>(() => intakeStore.getPublishedIntakes())
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [activePosterUrl, setActivePosterUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const syncIntakes = () => {
      const pub = intakeStore.getPublishedIntakes()
      if (mounted) setIntakes(pub)
    }

    intakeStore.fetchCloudIntakes().then((list) => {
      if (mounted) {
        setIntakes(list.filter((i) => i.is_published))
      }
    })

    const handleUpdated = (e: any) => {
      if (!mounted) return
      if (e?.detail && Array.isArray(e.detail)) {
        setIntakes(e.detail.filter((i: IntakeSchedule) => i.is_published))
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

  const filteredIntakes = useMemo(() => {
    if (activeFilter === 'all') return intakes
    if (activeFilter === 'career') {
      return intakes.filter((i) => i.id.includes('2026-10') || i.id.includes('2026-09'))
    }
    if (activeFilter === 'british') {
      return intakes.filter(
        (i) =>
          i.id.includes('igcse') ||
          i.title.toLowerCase().includes('cambridge') ||
          i.title.toLowerCase().includes('british') ||
          i.title.toLowerCase().includes('edexcel')
      )
    }
    if (activeFilter === 'january') {
      return intakes.filter((i) => i.id.includes('2027-01') || i.title.toLowerCase().includes('january'))
    }
    return intakes
  }, [intakes, activeFilter])

  if (intakes.length === 0) return null

  return (
    <section
      id="intakes-section"
      style={{
        padding: isMobile ? '3rem 1rem' : '4.5rem 1.5rem',
        background: 'linear-gradient(180deg, #070b18 0%, #0c142b 50%, #070b18 100%)',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(59, 130, 246, 0.2)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '20%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '15%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Urgent Live Advert Announcement Marquee Bar */}
        <div
          style={{
            marginBottom: '2rem',
            background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2), rgba(217, 119, 6, 0.25), rgba(37, 99, 235, 0.2))',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '16px',
            padding: isMobile ? '0.75rem 1rem' : '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem', animation: 'pulse 2s infinite' }}>📢</span>
            <div>
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginRight: '8px',
                }}
              >
                Admissions Advert
              </span>
              <strong style={{ fontSize: isMobile ? '0.82rem' : '0.9rem', color: '#fef08a' }}>
                Upcoming Intakes Enrolling Now:
              </strong>{' '}
              <span style={{ fontSize: isMobile ? '0.78rem' : '0.86rem', color: '#e2e8f0' }}>
                <strong>Oct 15, 2026</strong> (Career Fast-Track) • <strong>Nov 02, 2026</strong> (Cambridge KE042 & Pearson Edexcel Years 9–11) • <strong>Jan 20, 2027</strong> (Global New Year)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#86efac', fontWeight: 800 }}>
              ⚡ 15%–20% Early Bird Scholarship
            </span>
            <a
              href={getWhatsAppInquiryUrl('Hello Éclat Institute, I would like to inquire about the upcoming intakes and scholarship registration.')}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#16a34a',
                color: '#ffffff',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>💬</span> Apply Now
            </a>
          </div>
        </div>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '1.75rem' : '2.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#93c5fd',
              padding: '6px 16px',
              borderRadius: '999px',
              fontSize: isMobile ? '0.75rem' : '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <span>🗓️</span>
            <span>Official Academic Intakes & Enrollments Hub</span>
          </div>

          <h2
            style={{
              fontSize: isMobile ? '1.75rem' : 'clamp(1.8rem, 4vw, 2.75rem)',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 1rem',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Explore Next <span style={{ color: '#d4af37' }}>Admissions & Intake Adverts</span>
          </h2>

          <p
            style={{
              fontSize: isMobile ? '0.9rem' : '1rem',
              color: '#94a3b8',
              maxWidth: '720px',
              margin: '0 auto 1.75rem',
              lineHeight: 1.6,
            }}
          >
            100% Online live interactive classes across 6 flexible daily shifts (Early Morning to Night) + Weekend Executive Cohorts. Accredited by Cambridge International (Center KE042) and Pearson Edexcel (Center EDX-98421).
          </p>

          {/* Interactive Cohort Filter Tabs */}
          <div
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '6px',
              borderRadius: '999px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              style={{
                background: activeFilter === 'all' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                color: activeFilter === 'all' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              All Upcoming Intakes ({intakes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('career')}
              style={{
                background: activeFilter === 'career' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'transparent',
                color: activeFilter === 'career' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🔥 October 2026 Fast-Track
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('british')}
              style={{
                background: activeFilter === 'british' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
                color: activeFilter === 'british' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🇬🇧 British Curriculum (Years 9–11)
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('january')}
              style={{
                background: activeFilter === 'january' ? 'linear-gradient(135deg, #d97706, #b45309)' : 'transparent',
                color: activeFilter === 'january' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              ⭐ January 2027 New Year
            </button>
          </div>
        </div>

        {/* Intakes Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: isMobile ? '1.5rem' : '2rem',
          }}
        >
          {filteredIntakes.map((intake) => {
            const isFillingFast = intake.status === 'Filling Fast'
            const isBritishCurriculum =
              intake.id.includes('igcse') ||
              intake.title.toLowerCase().includes('british') ||
              intake.title.toLowerCase().includes('cambridge')

            return (
              <div
                key={intake.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(9, 14, 28, 0.95))',
                  border: isFillingFast
                    ? '2px solid #f59e0b'
                    : isBritishCurriculum
                    ? '2px solid #38bdf8'
                    : '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isBritishCurriculum
                    ? '0 15px 35px rgba(56, 189, 248, 0.15)'
                    : '0 15px 35px rgba(0, 0, 0, 0.4)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Top Poster Image / Banner */}
                <div style={{ position: 'relative', height: '220px', background: '#090e1f', overflow: 'hidden' }}>
                  {intake.poster_image_url ? (
                    <img
                      src={intake.poster_image_url}
                      alt={intake.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
                      }}
                    >
                      <span style={{ fontSize: '4rem' }}>🎓</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.35) 60%, transparent 100%)',
                    }}
                  />

                  {/* Top Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap',
                      maxWidth: '85%',
                    }}
                  >
                    <span
                      style={{
                        background: isFillingFast ? '#f59e0b' : '#16a34a',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      }}
                    >
                      ● {intake.status}
                    </span>

                    <span
                      style={{
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                      }}
                    >
                      {intake.term_session} • {intake.academic_year}
                    </span>

                    {isBritishCurriculum && (
                      <span
                        style={{
                          background: 'rgba(2, 132, 199, 0.85)',
                          color: '#ffffff',
                          padding: '4px 8px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                        }}
                      >
                        🇬🇧 Cambridge KE042 & Pearson EDX
                      </span>
                    )}
                  </div>

                  {/* Poster Enlarge Trigger */}
                  {intake.poster_image_url && (
                    <div style={{ position: 'absolute', bottom: '12px', right: '14px', display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setActivePosterUrl(intake.poster_image_url || null)}
                        style={{
                          background: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(6px)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.35)',
                          borderRadius: '8px',
                          padding: '5px 12px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span>🖼️</span>
                        <span>View Poster</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 900,
                        color: '#ffffff',
                        margin: '0 0 0.4rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {intake.title}
                    </h3>
                    <div style={{ fontSize: '0.88rem', color: '#60a5fa', fontWeight: 700, marginBottom: '0.75rem' }}>
                      {intake.headline}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 1rem' }}>
                      {intake.description}
                    </p>

                    {/* Early Bird Offer Banner */}
                    {intake.early_bird_discount && (
                      <div
                        style={{
                          background: 'rgba(217, 119, 6, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '10px',
                          padding: '0.65rem 0.85rem',
                          color: '#fef08a',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>🎁</span>
                        <span>{intake.early_bird_discount}</span>
                      </div>
                    )}

                    {/* Key Schedule Dates Box with Live Countdown */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.6rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div
                        style={{
                          background: 'rgba(220, 38, 38, 0.12)',
                          border: '1px solid rgba(220, 38, 38, 0.35)',
                          borderRadius: '10px',
                          padding: '0.6rem 0.75rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: '#fca5a5',
                            textTransform: 'uppercase',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>⏰ App Deadline</span>
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                          {formatDate(intake.application_deadline)}
                        </div>
                        <IntakeCountdown deadline={intake.application_deadline} />
                      </div>

                      <div
                        style={{
                          background: 'rgba(22, 163, 74, 0.12)',
                          border: '1px solid rgba(22, 163, 74, 0.35)',
                          borderRadius: '10px',
                          padding: '0.6rem 0.75rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: '#86efac',
                            textTransform: 'uppercase',
                          }}
                        >
                          🚀 Classes Start
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                          {formatDate(intake.commencement_date)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700, marginTop: '4px' }}>
                          Orientation: {intake.orientation_date ? formatDate(intake.orientation_date) : 'Day Prior'}
                        </div>
                      </div>
                    </div>

                    {/* Target Programs Tag Pill List */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Featured Enrolling Programs:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {intake.target_courses.slice(0, 4).map((c, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: '#cbd5e1',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                            }}
                          >
                            📚 {c}
                          </span>
                        ))}
                        {intake.target_courses.length > 4 && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: '#93c5fd',
                              fontWeight: 700,
                              padding: '2px 4px',
                            }}
                          >
                            +{intake.target_courses.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Flexible Shifts & Installments Ribbon */}
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div>
                        <span style={{ color: '#d4af37', fontWeight: 800 }}>⚡ Flexibility:</span>{' '}
                        {intake.installment_plan || 'Flexible 2 to 3 Monthly Installments'}
                      </div>
                      <div>
                        <span style={{ color: '#38bdf8', fontWeight: 800 }}>🕒 Shifts:</span> 6 Daily Shifts (6:00 AM – 10:00 PM) + Weekend Cohorts
                      </div>
                    </div>
                  </div>

                  {/* Actions Row: WhatsApp Inquire & Online Apply */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.65rem',
                      flexWrap: 'wrap',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <a
                      href={getWhatsAppInquiryUrl(
                        `Hello Éclat Institute Admissions, I would like to enroll in the ${intake.title} (${intake.term_session}). Please guide me through registration and scholarship clearance.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        flex: '1 1 140px',
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                      }}
                    >
                      <span>💬</span>
                      <span>Apply via WhatsApp</span>
                    </a>

                    <Link
                      to={`/courses?intake=${encodeURIComponent(intake.id)}`}
                      className="btn"
                      style={{
                        flex: '1 1 130px',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      }}
                    >
                      <span>🎓</span>
                      <span>View Programs</span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Full Poster Modal */}
      {activePosterUrl && (
        <div className="modal-overlay" onClick={() => setActivePosterUrl(null)} style={{ zIndex: 999999 }}>
          <div
            className="modal-content modal-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '800px',
              width: '95%',
              textAlign: 'center',
              background: 'transparent',
              boxShadow: 'none',
              border: 'none',
            }}
          >
            <img
              src={activePosterUrl}
              alt="Intake Poster Full View"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              }}
            />
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <a
                href={getWhatsAppInquiryUrl('Hello Éclat Institute, I am viewing the intake advertisement poster and would like to register.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm"
                style={{ background: '#16a34a', color: '#ffffff', fontWeight: 800 }}
              >
                💬 Inquire on WhatsApp
              </a>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActivePosterUrl(null)}
                style={{ background: '#ffffff', color: '#000000', fontWeight: 800 }}
              >
                ✕ Close Poster
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

