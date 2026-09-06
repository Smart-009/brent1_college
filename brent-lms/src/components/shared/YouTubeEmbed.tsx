import { useState, useRef, useEffect, useCallback } from 'react'
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

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
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

  // Network Online/Offline State
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
    } catch {
      // Ignore storage errors
    }
  }, [storageKey])

  const saveProgress = useCallback(
    (time: number, totalDuration: number) => {
      if (!storageKey) return
      try {
        if (totalDuration > 0 && time >= totalDuration * 0.92) {
          // Video finished (>= 92%)
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
      } catch {
        // Ignore storage errors
      }
    },
    [storageKey, onEnded, onProgress]
  )

  // Player Elements & Unified State
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)

  // YouTube PostMessage Helper
  const postToYouTube = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      )
    }
  }, [])

  // Unified Fullscreen Listener
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
              // Playing
              setIsPlaying(true)
              setIsBuffering(false)
            } else if (data.info.playerState === 2) {
              // Paused
              setIsPlaying(false)
              setIsBuffering(false)
            } else if (data.info.playerState === 3) {
              // Buffering
              setIsBuffering(true)
            } else if (data.info.playerState === 0) {
              // Ended
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
    }, 500)
    return () => clearInterval(interval)
  }, [videoId, isDirect, isPlaying, postToYouTube])

  // Handle Iframe Initial Ready Event
  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage('{"event":"listening"}', '*')
      if (initialStartTime > 0) {
        postToYouTube('seekTo', [initialStartTime, true])
      }
      if (autoPlay) {
        postToYouTube('playVideo')
        setIsPlaying(true)
      }
    }
  }

  // Unified Play / Pause Toggle
  const togglePlay = () => {
    if (isDirect && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    } else if (videoId) {
      if (isPlaying) {
        postToYouTube('pauseVideo')
        setIsPlaying(false)
      } else {
        postToYouTube('playVideo')
        setIsPlaying(true)
      }
    }
  }

  // Unified Seek
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

  // Unified Skip (±10s)
  const handleSkip = (seconds: number) => {
    const newT = Math.max(0, Math.min(currentTime + seconds, duration || 99999))
    setCurrentTime(newT)
    if (isDirect && videoRef.current) {
      videoRef.current.currentTime = newT
    } else if (videoId) {
      postToYouTube('seekTo', [newT, true])
    }
    saveProgress(newT, duration)
  }

  // Unified Volume Control
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
  }

  // Unified Speed Control
  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate)
    if (isDirect && videoRef.current) {
      videoRef.current.playbackRate = rate
    } else if (videoId) {
      postToYouTube('setPlaybackRate', [rate])
    }
  }

  // Unified In-App Fullscreen Toggle (Never leaves our branded container)
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // Unified Auto-Hide Controls On Idle
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 2800)
  }

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
  }

  // 0. OFFLINE DISPLAY SCREEN (CONCEALS ALL URLS AND AVOIDS BROWSER ERROR PAGES)
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
      <div className="video-wrapper" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
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

  // 2. UNIFIED SECURE DRM PLAYER (FOR DIRECT MP4 OR WHITELABELED YOUTUBE STREAMS)
  if (isDirect || videoId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.youtube.com'
    const ytParams = new URLSearchParams({
      autoplay: autoPlay ? '1' : '0',
      controls: '0', // Strips YouTube bottom bar, YouTube logo & title link
      disablekb: '1', // Disables YouTube keyboard navigation
      fs: '0', // Disables YouTube native fullscreen
      iv_load_policy: '3', // Hides video annotations and external cards
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
      enablejsapi: '1',
      origin,
      widget_referrer: origin,
    })

    if (initialStartTime > 0) {
      ytParams.set('start', String(Math.floor(initialStartTime)))
    }

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: isFullscreen ? '0' : '56.25%',
            height: isFullscreen ? '100vh' : 'auto',
            background: '#090d16',
            borderRadius: isFullscreen ? '0' : '14px',
            overflow: 'hidden',
            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.45)',
            userSelect: 'none',
          }}
        >
          {/* MEDIA RENDERER */}
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
                position: isFullscreen ? 'static' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
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
                pointerEvents: 'none', // Direct all pointer interactions to our DRM interceptor layer
              }}
            />
          )}

          {/* INTERACTIVE DRM CLICK INTERCEPTOR OVERLAY */}
          <div
            onClick={togglePlay}
            onDoubleClick={toggleFullscreen}
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
            {/* Center Play Button Badge when Paused */}
            {!isPlaying && !isBuffering && (
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(37, 99, 235, 0.95)',
                  boxShadow: '0 8px 30px rgba(37, 99, 235, 0.6), 0 0 0 8px rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '1.8rem',
                  paddingLeft: '4px',
                  backdropFilter: 'blur(6px)',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                ▶
              </div>
            )}
          </div>

          {/* TOP BRAND WATERMARK & NOTIFICATION BADGES */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '14px',
              right: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(8px)',
                color: '#f8fafc',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <span>🎓</span>
              <span>ÉCLAT INSTITUTE • DRM SECURE LECTURE</span>
            </div>

            {resumedNotice && (
              <div
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
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
                    padding: '2px 6px',
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    fontWeight: 700,
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
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
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
                fontSize: '2.5rem',
                zIndex: 15,
                animation: 'spin 1.2s linear infinite',
              }}
            >
              ⏳
            </div>
          )}

          {/* SOLID BOTTOM-RIGHT CORNER MASK */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '120px',
              height: '42px',
              zIndex: 12,
              pointerEvents: 'none',
              background: 'linear-gradient(135deg, transparent 20%, rgba(9, 13, 22, 0.85) 80%)',
            }}
          />

          {/* CUSTOM IN-APP CONTROL BAR */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(9, 13, 22, 0.98) 0%, rgba(9, 13, 22, 0.8) 60%, transparent 100%)',
              padding: '28px 16px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              opacity: showControls || !isPlaying ? 1 : 0,
              pointerEvents: showControls || !isPlaying ? 'auto' : 'none',
              transition: 'opacity 0.25s ease',
              zIndex: 25,
            }}
          >
            {/* Progress Scrubber */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  flex: 1,
                  accentColor: '#3b82f6',
                  cursor: 'pointer',
                  height: '4px',
                }}
              />
              <span style={{ color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 600, minWidth: '85px', textAlign: 'right' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Bottom Button Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={togglePlay}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip(-10)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Rewind 10 seconds"
                >
                  -10s
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip(10)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Forward 10 seconds"
                >
                  +10s
                </button>

                {/* Volume & Mute */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={toggleMute}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#f8fafc',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    {isMuted || volume === 0 ? '🔇' : '🔊'}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    style={{ width: '55px', accentColor: '#3b82f6', height: '4px' }}
                  />
                </div>
              </div>

              {/* Right Controls: Speed & In-App Fullscreen */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={playbackRate}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    padding: '3px 6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <option value={0.75} style={{ background: '#090d16', color: '#ffffff' }}>0.75x</option>
                  <option value={1} style={{ background: '#090d16', color: '#ffffff' }}>1.0x Normal</option>
                  <option value={1.25} style={{ background: '#090d16', color: '#ffffff' }}>1.25x</option>
                  <option value={1.5} style={{ background: '#090d16', color: '#ffffff' }}>1.5x</option>
                  <option value={2} style={{ background: '#090d16', color: '#ffffff' }}>2.0x</option>
                </select>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? '⤦' : '⛶'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Secure In-App Streaming Label */}
        <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>🔒</span>
            <span>Éclat Institute Secure Media DRM • No External Popouts</span>
          </span>
        </div>
      </div>
    )
  }

  // 3. INVALID / EMPTY URL FALLBACK
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
