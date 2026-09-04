import { useState, useEffect } from 'react'

type SpinnerSize = 'sm' | 'md' | 'lg'

export function Spinner({ size = 'md', className = '' }: { size?: SpinnerSize; className?: string }) {
  const cls = ['spinner', size !== 'md' ? `spinner-${size}` : '', className].filter(Boolean).join(' ')
  return <span className={cls} role="status" aria-label="Loading…" />
}

export function LoadingScreen({ message = 'Loading Éclat Portal…' }: { message?: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'radial-gradient(circle at 50% 35%, #131d36 0%, #080d1a 50%, #03060c 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Ambient Glowing Orbs in Background */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, rgba(37, 99, 235, 0.12) 50%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        {/* Glowing Crest Container */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4af37, #3b82f6, #eab308)',
              opacity: 0.7,
              filter: 'blur(10px)',
              animation: 'pulse 2.5s ease-in-out infinite',
            }}
          />
          <img
            src="/logo.png"
            alt="Éclat Institute"
            style={{
              position: 'relative',
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              border: '3px solid #d4af37',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.45)',
              objectFit: 'cover',
              background: '#090d16',
            }}
          />
        </div>

        {/* Institution Titles */}
        <div>
          <h1
            style={{
              margin: '0 0 0.35rem',
              fontFamily: 'Cinzel, Georgia, serif',
              fontSize: '1.75rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fde047 30%, #d4af37 60%, #ca8a04 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 15px rgba(212, 175, 55, 0.25)',
            }}
          >
            ÉCLAT INSTITUTE
          </h1>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Shaping Minds, Inspiring Success
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '999px',
            padding: '4px 14px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#fbbf24',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(6px)',
          }}
        >
          🎓 100% Online Global Academy
        </div>

        {/* Animated Shimmer Loading Bar */}
        <div
          style={{
            width: '200px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginTop: '0.5rem',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '50%',
              background: 'linear-gradient(90deg, transparent, #d4af37, #60a5fa, transparent)',
              borderRadius: '999px',
              animation: 'shimmer 1.4s ease-in-out infinite',
            }}
          />
        </div>

        {/* Message */}
        <p
          style={{
            margin: 0,
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#cbd5e1',
            letterSpacing: '0.04em',
          }}
        >
          {message}
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.06); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  )
}

/**
 * Dedicated Opening Launch Splash Screen
 * Ensures a cinematic 2.5-3.0 second brand showcase when the app/website boots.
 */
export function AppOpeningSplashScreen({ onFinished }: { onFinished?: () => void }) {
  const [progress, setProgress] = useState(15)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [isRendered, setIsRendered] = useState(true)

  useEffect(() => {
    // Stage 1: Progress Increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        const delta = Math.floor(Math.random() * 12) + 6
        return Math.min(prev + delta, 100)
      })
    }, 150)

    // Stage 2: Smooth Fade-out after 2.6 seconds
    const timer = setTimeout(() => {
      setIsFadingOut(true)
      setTimeout(() => {
        setIsRendered(false)
        onFinished?.()
      }, 450)
    }, 2600)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [onFinished])

  if (!isRendered) return null

  let stageCaption = 'Initializing secure learning environment…'
  if (progress > 40 && progress <= 75) {
    stageCaption = 'Loading accredited curriculum & classrooms…'
  } else if (progress > 75 && progress < 100) {
    stageCaption = 'Finalizing institutional session…'
  } else if (progress >= 100) {
    stageCaption = 'Welcome to Éclat Institute'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: 'radial-gradient(circle at 50% 35%, #131d36 0%, #080d1a 50%, #03060c 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.45s ease-out',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Ambient Glowing Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(37, 99, 235, 0.15) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          maxWidth: '420px',
          width: '100%',
        }}
      >
        {/* Glowing Crest */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4af37, #3b82f6, #eab308)',
              opacity: 0.75,
              filter: 'blur(12px)',
              animation: 'pulse 2.2s ease-in-out infinite',
            }}
          />
          <img
            src="/logo.png"
            alt="Éclat Institute"
            style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '3px solid #d4af37',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.5)',
              objectFit: 'cover',
              background: '#090d16',
            }}
          />
        </div>

        {/* Titles */}
        <div>
          <h1
            style={{
              margin: '0 0 0.35rem',
              fontFamily: 'Cinzel, Georgia, serif',
              fontSize: '1.9rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fde047 30%, #d4af37 60%, #ca8a04 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 18px rgba(212, 175, 55, 0.3)',
            }}
          >
            ÉCLAT INSTITUTE
          </h1>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Shaping Minds, Inspiring Success
          </div>
        </div>

        {/* Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '999px',
            padding: '5px 16px',
            fontSize: '0.74rem',
            fontWeight: 800,
            color: '#fbbf24',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span>🎓</span>
          <span>100% Online Global Academy</span>
        </div>

        {/* Dynamic Progress Bar */}
        <div style={{ width: '100%', maxWidth: '240px', marginTop: '0.5rem' }}>
          <div
            style={{
              width: '100%',
              height: '5px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '999px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #d4af37 0%, #60a5fa 50%, #d4af37 100%)',
                borderRadius: '999px',
                transition: 'width 0.2s ease-out',
                boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              fontSize: '0.74rem',
              color: '#cbd5e1',
            }}
          >
            <span>{stageCaption}</span>
            <span style={{ fontWeight: 800, color: '#fbbf24' }}>{progress}%</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.06); }
        }
      `}</style>
    </div>
  )
}
