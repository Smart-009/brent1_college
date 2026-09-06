import React, { useState, useRef, useEffect, useCallback } from 'react'
import { extractYouTubeId } from '@/lib/utils'

interface YouTubeEmbedProps {
  url: string
  title?: string
  lessonId?: string
  studentId?: string
  autoPlay?: boolean
  onEnded?: () => void
  onProgress?: (currentTime: number, duration: number) => void
}

function extractVimeoId(url: string): string | null {
  if (!url) return null
  const regExp = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/
  const match = url.match(regExp)
  return match && match[3] ? match[3] : null
}

function isDirectVideoUrl(url: string): boolean {
  if (!url) return false
  const cleanUrl = url.toLowerCase().split('?')[0]
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.includes('/storage/v1/object/') ||
    cleanUrl.includes('.r2.dev/') ||
    cleanUrl.includes('.s3.') ||
    cleanUrl.includes('blob.core.windows.net')
  )
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const hrs = Math.floor(mins / 60)
  if (hrs > 0) {
    const remMins = mins % 60
    return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
}

export function YouTubeEmbed({
  url,
  title = 'Lesson Video',
  lessonId,
  studentId,
  autoPlay = false,
  onEnded,
  onProgress,
}: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url)
  const vimeoId = extractVimeoId(url)
  const isDirect = isDirectVideoUrl(url)

  const storageKey = lessonId ? `eclat_progress_${lessonId}_${studentId || 'default'}` : null

  // Resume state
  const [initialStartTime, setInitialStartTime] = useState<number>(0)
  const [resumedNotice, setResumedNotice] = useState<string | null>(null)
  const [completedNotice, setCompletedNotice] = useState(false)
  const hasTriggeredCompleteRef = useRef(false)

  // Network State
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsNetworkOnline(true)
    const handleOffline = () => setIsNetworkOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Retrieve saved timestamp
  useEffect(() => {
    if (!storageKey) return
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = parseFloat(saved)
        if (!isNaN(parsed) && parsed > 5) {
          setInitialStartTime(parsed)
          setResumedNotice(`▶ Resumed playback from ${formatTime(parsed)}`)
          const timer = setTimeout(() => setResumedNotice(null), 5000)
          return () => clearTimeout(timer)
        }
      }
    } catch {}
  }, [storageKey])

  const saveProgress = useCallback(
    (time: number, totalDuration: number) => {
      if (!storageKey) return
      try {
        if (totalDuration > 0 && time >= totalDuration * 0.92) {
          if (!hasTriggeredCompleteRef.current) {
            hasTriggeredCompleteRef.current = true
            setCompletedNotice(true)
            localStorage.removeItem(storageKey)
            if (onEnded) onEnded()
          }
        } else if (time > 3) {
          localStorage.setItem(storageKey, time.toFixed(1))
        }
        if (onProgress) onProgress(time, totalDuration)
      } catch {}
    },
    [storageKey, onEnded, onProgress]
  )

  // Player Elements & Unified State
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrubberRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'full'>('medium')
  const [isTheater, setIsTheater] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<'hd1080' | 'hd720' | 'large' | 'auto'>('hd1080')

  const handleQualityChange = (q: 'hd1080' | 'hd720' | 'large' | 'auto') => {
    setSelectedQuality(q)
    if (videoId) {
      if (q === 'auto') {
        postToYouTube('setPlaybackQuality', ['default'])
        postToYouTube('setPlaybackQualityRange', ['default', 'highres'])
        triggerRipple('📺', 'Auto Quality')
      } else {
        postToYouTube('setPlaybackQuality', [q])
        postToYouTube('setPlaybackQualityRange', [q, 'highres'])
        postToYouTube('setSuggestedQuality', [q])
        triggerRipple('🌟', q === 'hd1080' ? '1080p Full HD' : q === 'hd720' ? '720p HD' : '480p SD')
      }
    }
  }
  const [showZoomMenu, setShowZoomMenu] = useState(false)
  const [zoomLevel, setZoomLevel] = useState<number | 'fill'>(1)
  const [rippleAction, setRippleAction] = useState<{ icon: string; text: string } | null>(null)
  const [hoverScrubTime, setHoverScrubTime] = useState<number | null>(null)
  const [hoverScrubX, setHoverScrubX] = useState<number>(0)
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // YouTube PostMessage Helper
  const postToYouTube = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      )
    }
  }, [])


  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Trigger brief visual feedback ripple
  const triggerRipple = (icon: string, text: string) => {
    setRippleAction({ icon, text })
    setTimeout(() => setRippleAction(null), 650)
  }


  // Zoom Level Cycle
  const zoomOptions: { label: string; val: number | 'fill' }[] = [
    { label: '100% Fit', val: 1 },
    { label: '125%', val: 1.25 },
    { label: '150%', val: 1.5 },
    { label: '175%', val: 1.75 },
    { label: '200%', val: 2 },
    { label: 'Fill Screen', val: 'fill' },
  ]

  const cycleZoom = () => {
    setZoomLevel((prev) => {
      const idx = zoomOptions.findIndex((o) => o.val === prev)
      const nextOpt = zoomOptions[(idx + 1) % zoomOptions.length]
      triggerRipple('🔍', nextOpt.label)
      return nextOpt.val
    })
  }

  // Direct Video Handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration
      setDuration(dur)
      if (initialStartTime > 0 && initialStartTime < dur - 5) {
        videoRef.current.currentTime = initialStartTime
        setCurrentTime(initialStartTime)
      }
    }
  }

  const handleDirectTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime
      const dur = videoRef.current.duration || duration
      setCurrentTime(curr)
      saveProgress(curr, dur)
    }
  }

  // YouTube Iframe PostMessage Listener & Polling
  useEffect(() => {
    if (!videoId || isDirect) return

    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data)
          if (data.event === 'infoDelivery' && data.info) {
            const c = data.info.currentTime
            const d = data.info.duration
            if (typeof c === 'number' && !isNaN(c) && c >= 0) {
              setCurrentTime(c)
            }
            if (typeof d === 'number' && !isNaN(d) && d > 0) {
              setDuration(d)
            }
            if (typeof c === 'number' && typeof d === 'number' && c > 0 && d > 0) {
              saveProgress(c, d)
            }
            if (data.info.playerState === 1) {
              setIsPlaying(true)
              setIsBuffering(false)
            } else if (data.info.playerState === 2) {
              setIsPlaying(false)
              setIsBuffering(false)
            } else if (data.info.playerState === 3) {
              setIsBuffering(true)
            } else if (data.info.playerState === 0) {
              setIsPlaying(false)
              setIsBuffering(false)
              if (!hasTriggeredCompleteRef.current) {
                hasTriggeredCompleteRef.current = true
                setCompletedNotice(true)
                if (storageKey) localStorage.removeItem(storageKey)
                if (onEnded) onEnded()
              }
            }
          }
        }
      } catch {}
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [videoId, isDirect, saveProgress, storageKey, onEnded])

  // Polling for smooth progress bar during YouTube playback
  useEffect(() => {
    if (!videoId || isDirect || !isPlaying) return
    const interval = setInterval(() => {
      postToYouTube('getCurrentTime')
      postToYouTube('getDuration')
    }, 400)
    return () => clearInterval(interval)
  }, [videoId, isDirect, isPlaying, postToYouTube])

  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage('{"event":"listening"}', '*')
      postToYouTube('setPlaybackQuality', ['hd1080'])
      postToYouTube('setPlaybackQualityRange', ['hd1080', 'highres'])
      postToYouTube('setSuggestedQuality', ['hd1080'])
      if (initialStartTime > 0) {
        postToYouTube('seekTo', [initialStartTime, true])
      }
      if (autoPlay) {
        postToYouTube('playVideo')
        postToYouTube('setPlaybackQuality', ['hd1080'])
        setIsPlaying(true)
      }
    }
  }

  // Play / Pause Toggle
  const togglePlay = () => {
    if (isDirect && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
        triggerRipple('▶', 'Play')
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
        triggerRipple('⏸', 'Pause')
      }
    } else if (videoId) {
      if (isPlaying) {
        postToYouTube('pauseVideo')
        setIsPlaying(false)
        triggerRipple('⏸', 'Pause')
      } else {
        postToYouTube('playVideo')
        postToYouTube('setPlaybackQuality', ['hd1080'])
        setIsPlaying(true)
        triggerRipple('▶', 'Play')
      }
    }
  }

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value)
    setCurrentTime(targetTime)
    if (isDirect && videoRef.current) {
      videoRef.current.currentTime = targetTime
    } else if (videoId) {
      postToYouTube('seekTo', [targetTime, true])
    }
    saveProgress(targetTime, duration)
  }

  // Skip
  const handleSkip = (seconds: number) => {
    const newT = Math.max(0, Math.min(currentTime + seconds, duration || 99999))
    setCurrentTime(newT)
    if (isDirect && videoRef.current) {
      videoRef.current.currentTime = newT
    } else if (videoId) {
      postToYouTube('seekTo', [newT, true])
    }
    triggerRipple(seconds > 0 ? '⏩' : '⏪', `${seconds > 0 ? '+' : ''}${seconds}s`)
    saveProgress(newT, duration)
  }

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    setIsMuted(val === 0)
    if (isDirect && videoRef.current) {
      videoRef.current.volume = val
      videoRef.current.muted = val === 0
    } else if (videoId) {
      postToYouTube('setVolume', [Math.round(val * 100)])
      if (val === 0) postToYouTube('mute')
      else postToYouTube('unMute')
    }
  }

  const toggleMute = () => {
    const newMute = !isMuted
    setIsMuted(newMute)
    if (isDirect && videoRef.current) {
      videoRef.current.muted = newMute
    } else if (videoId) {
      if (newMute) postToYouTube('mute')
      else {
        postToYouTube('unMute')
        postToYouTube('setVolume', [Math.round((volume || 1) * 100)])
      }
    }
    triggerRipple(newMute ? '🔇' : '🔊', newMute ? 'Muted' : 'Unmuted')
  }

  // Speed
  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate)
    setShowSettings(false)
    if (isDirect && videoRef.current) {
      videoRef.current.playbackRate = rate
    } else if (videoId) {
      postToYouTube('setPlaybackRate', [rate])
    }
    triggerRipple('⚡', `${rate}x Speed`)
  }


  // Screen Size Controller (Small, Medium, Full)
  const setPlayerScreenSize = (mode: 'small' | 'medium' | 'full') => {
    setScreenSize(mode)
    if (mode === 'full') {
      setIsFullscreen(true)
      if (containerRef.current && !document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {})
      }
      triggerRipple('⛶', 'Full Screen')
    } else {
      setIsFullscreen(false)
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      triggerRipple(mode === 'small' ? '📱' : '💻', mode === 'small' ? 'Small View' : 'Medium View')
    }
  }

  // Fullscreen
  const toggleFullscreen = () => {
    if (isFullscreen || screenSize === 'full') {
      setPlayerScreenSize('medium')
    } else {
      setPlayerScreenSize('full')
    }
  }

  // Picture in Picture
  const togglePiP = async () => {
    try {
      if (isDirect && videoRef.current) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else {
          await videoRef.current.requestPictureInPicture()
        }
      }
    } catch {}
  }

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false)
    }, 2800)
  }

  // Scrubber Hover Tooltip
  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || duration <= 0) return
    const rect = scrubberRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHoverScrubTime(pos * duration)
    setHoverScrubX(e.clientX - rect.left)
  }

  // Double-tap or double-click to seek/fullscreen
  const handleVideoAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width

    if (e.detail === 2) {
      // Double click
      if (clickX < width * 0.35) {
        handleSkip(-10)
      } else if (clickX > width * 0.65) {
        handleSkip(10)
      } else {
        toggleFullscreen()
      }
    } else if (e.detail === 1) {
      togglePlay()
    }
  }

  // Keyboard Shortcuts (YouTube Style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs or textareas
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        toggleMute()
      } else if (e.key === 'j' || e.key === 'J' || e.code === 'ArrowLeft') {
        e.preventDefault()
        handleSkip(-10)
      } else if (e.key === 'l' || e.key === 'L' || e.code === 'ArrowRight') {
        e.preventDefault()
        handleSkip(10)
      } else if (e.code === 'ArrowUp') {
        e.preventDefault()
        setVolume((v) => {
          const nv = Math.min(1, v + 0.1)
          if (isDirect && videoRef.current) videoRef.current.volume = nv
          else if (videoId) postToYouTube('setVolume', [Math.round(nv * 100)])
          return nv
        })
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        setVolume((v) => {
          const nv = Math.max(0, v - 0.1)
          if (isDirect && videoRef.current) videoRef.current.volume = nv
          else if (videoId) postToYouTube('setVolume', [Math.round(nv * 100)])
          return nv
        })
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault()
        cycleZoom()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        setZoomLevel((prev) => {
          const cur = typeof prev === 'number' ? prev : 1
          const nextVal = Math.min(2.5, Number((cur + 0.25).toFixed(2)))
          triggerRipple('🔍', `${Math.round(nextVal * 100)}%`)
          return nextVal
        })
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        setZoomLevel((prev) => {
          const cur = typeof prev === 'number' ? prev : 1
          const nextVal = Math.max(0.75, Number((cur - 0.25).toFixed(2)))
          triggerRipple('🔍', `${Math.round(nextVal * 100)}%`)
          return nextVal
        })
      } else if (e.key === '0') {
        e.preventDefault()
        setZoomLevel(1)
        triggerRipple('🔍', '100% Fit')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, toggleFullscreen, toggleMute, isDirect, videoId, postToYouTube])

  // Restart Handler
  const handleRestart = () => {
    setCurrentTime(0)
    if (isDirect && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    } else if (videoId) {
      postToYouTube('seekTo', [0, true])
      postToYouTube('playVideo')
    }
    setIsPlaying(true)
    if (storageKey) localStorage.removeItem(storageKey)
    setResumedNotice(null)
    setInitialStartTime(0)
    triggerRipple('↺', 'Restarted')
  }

  // 0. OFFLINE DISPLAY SCREEN
  if (!isNetworkOnline && !isDirect) {
    return (
      <div
        className="video-wrapper"
        style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #090e1f, #0f172a)',
          border: '1.5px solid rgba(239, 68, 68, 0.3)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '260px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem', animation: 'bounce 2s infinite' }}>📡</div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
            letterSpacing: '0.04em',
          }}
        >
          <span>●</span> Offline Mode
        </div>
        <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem' }}>
          You Are Currently Offline
        </h4>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '420px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
          This lecture video requires an active internet connection to stream. Please connect to WiFi or cellular data to resume learning.
        </p>
        <button
          type="button"
          onClick={() => {
            if (navigator.onLine) {
              setIsNetworkOnline(true)
            } else {
              alert('Device is still offline. Please check your network connection.')
            }
          }}
          className="btn btn-primary btn-sm"
          style={{ fontWeight: 800, padding: '0.65rem 1.35rem', borderRadius: '10px' }}
        >
          🔄 Check Connection & Retry
        </button>
      </div>
    )
  }

  // 1. VIMEO PLAYER FALLBACK
  if (vimeoId) {
    return (
      <div className="video-wrapper" style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden' }}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?dnt=1&title=0&byline=0&portrait=0`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      </div>
    )
  }

  // 2. UNIFIED SECURE YOUTUBE / DIRECT DRM CINEMA PLAYER
  if (isDirect || videoId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.youtube.com'
    const ytParams = new URLSearchParams({
      autoplay: autoPlay ? '1' : '0',
      controls: '0',
      disablekb: '1',
      fs: '0',
      iv_load_policy: '3',
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
      enablejsapi: '1',
      origin,
      widget_referrer: origin,
      vq: 'hd1080',
      hd: '1',
    })

    if (initialStartTime > 0) {
      ytParams.set('start', String(Math.floor(initialStartTime)))
    }

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Screen Size Switcher Bar (Small, Medium, Full) */}
        {!isFullscreen && screenSize !== 'full' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
              padding: '0 2px',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--color-bg-secondary)', padding: '3px 4px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-secondary)', padding: '0 4px' }}>SCREEN:</span>
              <button
                type="button"
                onClick={() => setPlayerScreenSize('small')}
                style={{
                  background: screenSize === 'small' ? '#2563eb' : 'transparent',
                  color: screenSize === 'small' ? '#ffffff' : 'var(--color-text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span>📱</span> Small
              </button>
              <button
                type="button"
                onClick={() => setPlayerScreenSize('medium')}
                style={{
                  background: screenSize === 'medium' ? '#2563eb' : 'transparent',
                  color: screenSize === 'medium' ? '#ffffff' : 'var(--color-text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span>💻</span> Medium
              </button>
              <button
                type="button"
                onClick={() => setPlayerScreenSize('full')}
                style={{
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span>⛶</span> Full Screen
              </button>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {screenSize === 'small' ? 'Compact Window' : 'Standard Cinema'}
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
          style={{
            position: isFullscreen || screenSize === 'full' ? 'fixed' : 'relative',
            top: isFullscreen || screenSize === 'full' ? 0 : 'auto',
            left: isFullscreen || screenSize === 'full' ? 0 : 'auto',
            right: isFullscreen || screenSize === 'full' ? 0 : 'auto',
            bottom: isFullscreen || screenSize === 'full' ? 0 : 'auto',
            width: isFullscreen || screenSize === 'full' ? '100vw' : '100%',
            height: isFullscreen || screenSize === 'full'
              ? '100vh'
              : (screenSize === 'small'
                ? (isMobile ? '220px' : '260px')
                : (isTheater ? 'calc(82vh)' : 'auto')),
            aspectRatio: (!isFullscreen && screenSize !== 'full' && !isTheater && screenSize !== 'small') ? '16 / 9' : 'auto',
            minHeight: isFullscreen || screenSize === 'full'
              ? '100vh'
              : (screenSize === 'small' ? (isMobile ? '200px' : '240px') : (isMobile ? '220px' : '360px')),
            maxHeight: isFullscreen || screenSize === 'full' ? '100vh' : 'none',
            zIndex: isFullscreen || screenSize === 'full' ? 999999 : 1,
            background: '#040711',
            borderRadius: isFullscreen || screenSize === 'full' ? '0' : '18px',
            overflow: 'hidden',
            boxShadow: isFullscreen || screenSize === 'full' ? 'none' : '0 16px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            userSelect: 'none',
          }}
        >
          {/* MEDIA RENDERER (WITH HARDWARE-ACCELERATED ZOOM ENGINE) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: zoomLevel === 'fill' ? 'scale(1.35)' : `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
              pointerEvents: 'none',
            }}
          >
            {isDirect ? (
              <video
                ref={videoRef}
                src={url}
                autoPlay={autoPlay}
                playsInline
                onTimeUpdate={handleDirectTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => {
                  setIsBuffering(false)
                  setIsPlaying(true)
                }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false)
                  saveProgress(duration, duration)
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <iframe
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${videoId}?${ytParams.toString()}`}
                title={title}
                onLoad={handleIframeLoad}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>

          {/* INTERACTIVE POINTER INTERCEPTOR AREA */}
          <div
            onClick={handleVideoAreaClick}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Visual Action Ripple Feedback */}
            {rippleAction && (
              <div
                style={{
                  position: 'absolute',
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 0 4px rgba(255,255,255,0.2)',
                  animation: 'pulse 0.6s ease forwards',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{rippleAction.icon}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, marginTop: '2px' }}>{rippleAction.text}</span>
              </div>
            )}

            {/* Big Play Button Overlay when Paused */}
            {!isPlaying && !isBuffering && !rippleAction && (
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  boxShadow: '0 8px 32px rgba(37, 99, 235, 0.6), 0 0 0 8px rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '2rem',
                  paddingLeft: '5px',
                  backdropFilter: 'blur(6px)',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                ▶
              </div>
            )}
          </div>

          {/* TOP BRAND WATERMARK & NOTIFICATIONS */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  background: 'rgba(9, 13, 22, 0.9)',
                  backdropFilter: 'blur(10px)',
                  color: '#f8fafc',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                <span>🎓</span>
                <span>ÉCLAT INSTITUTE • SECURE STREAM</span>
              </div>

              {(isFullscreen || screenSize === 'full') && (
                <button
                  type="button"
                  onClick={() => setPlayerScreenSize('medium')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.85)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>⤦</span> Exit Full Screen
                </button>
              )}
            </div>

            {resumedNotice && (
              <div
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.5)',
                  pointerEvents: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{resumedNotice}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRestart()
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  Restart ↺
                </button>
              </div>
            )}

            {completedNotice && (
              <div
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)',
                }}
              >
                ✓ Lecture Completed
              </div>
            )}
          </div>

          {/* BUFFERING SPINNER */}
          {isBuffering && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#3b82f6',
                fontSize: '2.8rem',
                zIndex: 15,
                animation: 'spin 1.2s linear infinite',
              }}
            >
              ⏳
            </div>
          )}

          {/* SOLID WATERMARK & LOGO BLOCKER SHIELDS */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '280px',
              height: '70px',
              zIndex: 14,
              pointerEvents: 'none',
              background: '#040711',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '140px',
              height: '70px',
              zIndex: 14,
              pointerEvents: 'none',
              background: '#040711',
            }}
          />

          {/* SETTINGS GEAR POPUP (Speed Selector) */}
          {showSettings && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: '68px',
                right: '16px',
                zIndex: 35,
                background: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '8px',
                width: '180px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                color: '#ffffff',
              }}
            >
              {/* Video Stream Quality Selector */}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#60a5fa', padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🌟</span> Video Quality
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', margin: '4px 0 8px' }}>
                {[
                  { id: 'hd1080', label: '1080p Full HD 🌟' },
                  { id: 'hd720', label: '720p HD' },
                  { id: 'large', label: '480p SD' },
                  { id: 'auto', label: 'Auto (High Bitrate)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleQualityChange(item.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: selectedQuality === item.id ? 'rgba(37, 99, 235, 0.35)' : 'transparent',
                      color: selectedQuality === item.id ? '#60a5fa' : '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: selectedQuality === item.id ? 800 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{item.label}</span>
                    {selectedQuality === item.id && <span>✓</span>}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                ⚙️ Playback Speed
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleSpeedChange(rate)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: playbackRate === rate ? 'rgba(37, 99, 235, 0.3)' : 'transparent',
                      color: playbackRate === rate ? '#60a5fa' : '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      fontWeight: playbackRate === rate ? 800 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{rate === 1 ? '1.0x Normal' : `${rate}x`}</span>
                    {playbackRate === rate && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* YOUTUBE-STYLE CONTROL BAR */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(4, 7, 17, 0.98) 0%, rgba(4, 7, 17, 0.8) 60%, transparent 100%)',
              padding: '24px 16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              opacity: showControls || !isPlaying || showSettings ? 1 : 0,
              pointerEvents: showControls || !isPlaying || showSettings ? 'auto' : 'none',
              transition: 'opacity 0.25s ease',
              zIndex: 25,
            }}
          >
            {/* YOUTUBE-STYLE SCRUBBER BAR WITH HOVER PREVIEW */}
            <div
              ref={scrubberRef}
              onMouseMove={handleScrubberMouseMove}
              onMouseLeave={() => setHoverScrubTime(null)}
              style={{
                position: 'relative',
                width: '100%',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              {/* Hover Timestamp Tooltip */}
              {hoverScrubTime !== null && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '22px',
                    left: `${hoverScrubX}px`,
                    transform: 'translateX(-50%)',
                    background: 'rgba(15, 23, 42, 0.95)',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                  }}
                >
                  {formatTime(hoverScrubTime)}
                </div>
              )}

              {/* Background Track */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255, 255, 255, 0.25)',
                }}
              />

              {/* Played Progress Track */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  width: `${progressPct}%`,
                  height: '4px',
                  borderRadius: '2px',
                  background: '#ef4444',
                }}
              />

              {/* Invisible native input range over top */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  position: 'absolute',
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  margin: 0,
                }}
              />
            </div>

            {/* BUTTON CONTROLS ROW */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '8px' }}>
              {/* Left Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={togglePlay}
                  style={{
                    background: 'none',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                  title={isPlaying ? 'Pause (k / Space)' : 'Play (k / Space)'}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip(-10)}
                  style={{
                    background: 'none',
                    color: '#cbd5e1',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title="Rewind 10s (j / ←)"
                >
                  ↺ 10
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip(10)}
                  style={{
                    background: 'none',
                    color: '#cbd5e1',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title="Forward 10s (l / →)"
                >
                  ↻ 10
                </button>

                {/* Volume & Slide-out slider with audio percentage feedback */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={toggleMute}
                    style={{
                      background: 'none',
                      color: '#cbd5e1',
                      border: 'none',
                      fontSize: '1.15rem',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={isMuted || volume === 0 ? 'Unmute (m)' : `Mute (m) • ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  >
                    {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      style={{
                        width: isMobile ? '45px' : '65px',
                        accentColor: '#3b82f6',
                        height: '4px',
                        cursor: 'pointer',
                      }}
                      title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', minWidth: '28px', fontWeight: 700 }}>
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <span style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 600, marginLeft: '4px' }}>
                  {formatTime(currentTime)} <span style={{ opacity: 0.5 }}>/</span> {formatTime(duration)}
                </span>
              </div>

              {/* Right Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Zoom Control Button & Popover */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowZoomMenu((z) => !z)}
                    style={{
                      background: zoomLevel !== 1 ? 'rgba(37, 99, 235, 0.4)' : 'none',
                      color: zoomLevel !== 1 ? '#60a5fa' : '#cbd5e1',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 7px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                    title="Zoom Video (z / + / -)"
                  >
                    <span>🔍</span>
                    <span>{zoomLevel === 'fill' ? 'Fill' : `${Math.round((typeof zoomLevel === 'number' ? zoomLevel : 1) * 100)}%`}</span>
                  </button>

                  {showZoomMenu && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        bottom: '36px',
                        right: '0',
                        zIndex: 40,
                        background: 'rgba(15, 23, 42, 0.98)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        padding: '6px',
                        width: '140px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                        color: '#ffffff',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', padding: '2px 6px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px' }}>
                        🔍 Video Zoom
                      </div>
                      {zoomOptions.map((opt) => (
                        <button
                          key={String(opt.val)}
                          type="button"
                          onClick={() => {
                            setZoomLevel(opt.val)
                            setShowZoomMenu(false)
                            triggerRipple('🔍', opt.label)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            background: zoomLevel === opt.val ? 'rgba(37, 99, 235, 0.35)' : 'transparent',
                            color: zoomLevel === opt.val ? '#60a5fa' : '#ffffff',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '5px 8px',
                            fontSize: '0.75rem',
                            fontWeight: zoomLevel === opt.val ? 800 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <span>{opt.label}</span>
                          {zoomLevel === opt.val && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Speed / Settings Button */}
                <button
                  type="button"
                  onClick={() => setShowSettings((s) => !s)}
                  style={{
                    background: showSettings ? 'rgba(37, 99, 235, 0.3)' : 'none',
                    color: '#cbd5e1',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                  title="Playback Settings"
                >
                  ⚙️ {playbackRate}x
                </button>

                {/* Picture-in-Picture (for direct videos) */}
                {isDirect && (
                  <button
                    type="button"
                    onClick={togglePiP}
                    style={{
                      background: 'none',
                      color: '#cbd5e1',
                      border: 'none',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Picture-in-Picture"
                  >
                    📺
                  </button>
                )}

                {/* Theater Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsTheater((t) => !t)}
                  style={{
                    background: isTheater ? 'rgba(37, 99, 235, 0.3)' : 'none',
                    color: '#cbd5e1',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                  title="Theater Mode"
                >
                  ⧉
                </button>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  style={{
                    background: 'none',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}
                >
                  {isFullscreen ? '⤦' : '⛶'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Streaming Status Bar */}
        <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>🔒</span>
            <span>Éclat Secure Cinema Player • Shortcuts: Space (Play/Pause), F (Fullscreen), M (Mute), J/L (±10s)</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="alert alert-warning" style={{ borderRadius: '10px', padding: '1rem' }}>
      <span className="alert-icon">⚠️</span>
      <div>
        <strong>Media stream not attached.</strong>
        <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.85 }}>
          This lecture module is currently being configured by the instructor.
        </div>
      </div>
    </div>
  )
}
