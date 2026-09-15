import { useState, useEffect } from 'react'

export function ScrollToTopFAB() {
  const [visible, setVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScroll / scrollHeight) * 100))
        setScrollProgress(progress)
      }
      if (currentScroll > 280) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!visible) return null

  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Scroll to top"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: '#ffffff',
        border: 'none',
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.15), 0 0 12px rgba(29, 78, 216, 0.2)',
        cursor: 'pointer',
        zIndex: 9970,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
        animation: 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)'
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(29, 78, 216, 0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(15, 23, 42, 0.15), 0 0 12px rgba(29, 78, 216, 0.2)'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.92)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)'
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = 'scale(0.92)'
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        style={{
          position: 'absolute',
          inset: 0,
          transform: 'rotate(-90deg)',
          pointerEvents: 'none',
        }}
      >
        <circle
          cx="23"
          cy="23"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <circle
          cx="23"
          cy="23"
          r={radius}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.15s ease-out',
          }}
        />
      </svg>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1d4ed8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  )
}
