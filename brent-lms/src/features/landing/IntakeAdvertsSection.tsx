import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { intakeStore } from '@/lib/intakeStore'
import { extractYouTubeId, formatDate } from '@/lib/utils'
import { getWhatsAppInquiryUrl } from '@/config/institution'
import type { IntakeSchedule } from '@/types/intake'

export function IntakeAdvertsSection() {
  const [intakes, setIntakes] = useState<IntakeSchedule[]>(() => intakeStore.getPublishedIntakes())
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)
  const [activePosterUrl, setActivePosterUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    intakeStore.fetchCloudIntakes().then((list) => {
      if (mounted) {
        setIntakes(list.filter((i) => i.is_published))
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  if (intakes.length === 0) return null

  return (
    <section
      id="intakes-section"
      style={{
        padding: '4.5rem 1.5rem',
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
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
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
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <span>🗓️</span>
            <span>Upcoming Academic Intakes & Enrollments</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 1rem',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Join Our Next <span style={{ color: '#d4af37' }}>Accredited Cohort</span>
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: '#94a3b8',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            100% Online live interactive classes, flexible evening labs, and weekend executive masterclasses. Secure your admission and scholarship offer today!
          </p>
        </div>

        {/* Intakes Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {intakes.map((intake) => {
            const ytId = intake.promo_video_url ? extractYouTubeId(intake.promo_video_url) : null
            const isFillingFast = intake.status === 'Filling Fast'

            return (
              <div
                key={intake.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(9, 14, 28, 0.95))',
                  border: isFillingFast ? '2px solid #f59e0b' : '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Top Poster Image / Video Banner */}
                <div style={{ position: 'relative', height: '210px', background: '#090e1f', overflow: 'hidden' }}>
                  {intake.poster_image_url ? (
                    <img
                      src={intake.poster_image_url}
                      alt={intake.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : ytId ? (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt={intake.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a, #0f172a)' }}>
                      <span style={{ fontSize: '4rem' }}>🎓</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.3) 60%, transparent 100%)',
                    }}
                  />

                  {/* Status & Year Badges */}
                  <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                        background: 'rgba(0,0,0,0.65)',
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
                  </div>

                  {/* Poster Enlarge or Video Play Trigger */}
                  <div style={{ position: 'absolute', bottom: '12px', right: '14px', display: 'flex', gap: '8px' }}>
                    {intake.poster_image_url && (
                      <button
                        type="button"
                        onClick={() => setActivePosterUrl(intake.poster_image_url || null)}
                        style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>🖼️</span>
                        <span>View Poster</span>
                      </button>
                    )}

                    {intake.promo_video_url && (
                      <button
                        type="button"
                        onClick={() => setActiveVideoUrl(intake.promo_video_url || null)}
                        style={{
                          background: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.5)',
                        }}
                      >
                        <span>▶</span>
                        <span>Watch Video Trailer</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.4rem', lineHeight: 1.3 }}>
                      {intake.title}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: '#60a5fa', fontWeight: 700, marginBottom: '0.75rem' }}>
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

                    {/* Key Schedule Dates Box */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                      <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '10px', padding: '0.6rem 0.75rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase' }}>
                          ⏰ App Deadline
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                          {formatDate(intake.application_deadline)}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.3)', borderRadius: '10px', padding: '0.6rem 0.75rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#86efac', textTransform: 'uppercase' }}>
                          🚀 Classes Start
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                          {formatDate(intake.commencement_date)}
                        </div>
                      </div>
                    </div>

                    {/* Target Programs Tag Pill List */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Accredited Programs Enrolling:
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
                          <span style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 700, padding: '2px 4px' }}>
                            +{intake.target_courses.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row: WhatsApp Inquire & Online Apply */}
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <a
                      href={getWhatsAppInquiryUrl(`Hello, I would like to apply for the ${intake.title} (${intake.term_session}). Please assist me with registration.`)}
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
            style={{ maxWidth: '800px', width: '95%', textAlign: 'center', background: 'transparent', boxShadow: 'none', border: 'none' }}
          >
            <img
              src={activePosterUrl}
              alt="Intake Poster Full View"
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActivePosterUrl(null)}
              style={{ marginTop: '1rem', background: '#ffffff', color: '#000000', fontWeight: 800 }}
            >
              ✕ Close Poster
            </button>
          </div>
        </div>
      )}

      {/* Video Trailer Modal */}
      {activeVideoUrl && (
        <div className="modal-overlay" onClick={() => setActiveVideoUrl(null)} style={{ zIndex: 999999 }}>
          <div
            className="modal-content modal-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '850px',
              width: '95%',
              background: '#090e1f',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #1e293b', color: '#ffffff' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎬</span>
                <span>Promotional Intake Video Trailer</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoUrl(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%', background: '#000000' }}>
              {extractYouTubeId(activeVideoUrl) ? (
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  src={`https://www.youtube.com/embed/${extractYouTubeId(activeVideoUrl)}?autoplay=1&rel=0`}
                  title="Promotional Intake Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideoUrl}
                  controls
                  autoPlay
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
