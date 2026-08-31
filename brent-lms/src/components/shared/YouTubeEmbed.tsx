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

  // Direct Custom Video Player State
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime
      const dur = videoRef.current.duration || duration
      setCurrentTime(curr)
      saveProgress(curr, dur)
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime
      setCurrentTime(targetTime)
      saveProgress(targetTime, duration)
    }
  }

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newT = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration))
      videoRef.current.currentTime = newT
      setCurrentTime(newT)
      saveProgress(newT, duration)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
      videoRef.current.muted = val === 0
      setIsMuted(val === 0)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const newMute = !isMuted
    videoRef.current.muted = newMute
    setIsMuted(newMute)
  }

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 2800)
  }

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
    if (storageKey) localStorage.removeItem(storageKey)
    setResumedNotice(null)
    setInitialStartTime(0)
  }

  // --- YouTube IFrame API Integration for Auto-Resume & End Detection ---
  const ytPlayerContainerRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)
  const ytPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!videoId || isDirect) return

    // Ensure YT API script is loaded
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)
    }

    const initYTPlayer = () => {
      if (!ytPlayerContainerRef.current || !window.YT || !window.YT.Player) return

      const startSeconds = Math.floor(initialStartTime)

      try {
        ytPlayerRef.current = new window.YT.Player(ytPlayerContainerRef.current, {
          videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            playsinline: 1,
            controls: 1,
            enablejsapi: 1,
            fs: 1,
            start: startSeconds > 0 ? startSeconds : 0,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onStateChange: (event: any) => {
              // 1 = PLAYING
              if (event.data === 1) {
                if (ytPollIntervalRef.current) clearInterval(ytPollIntervalRef.current)
                ytPollIntervalRef.current = setInterval(() => {
                  if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
                    const c = ytPlayerRef.current.getCurrentTime() || 0
                    const d = ytPlayerRef.current.getDuration() || 0
                    saveProgress(c, d)
                  }
                }, 2500)
              } else {
                if (ytPollIntervalRef.current) clearInterval(ytPollIntervalRef.current)
              }

              // 0 = ENDED
              if (event.data === 0) {
                if (!hasTriggeredCompleteRef.current) {
                  hasTriggeredCompleteRef.current = true
                  setCompletedNotice(true)
                  if (storageKey) localStorage.removeItem(storageKey)
                  if (onEnded) onEnded()
                }
              }
            },
          },
        })
      } catch {
        // Fallback to normal iframe if YT API fails
      }
    }

    if (window.YT && window.YT.Player) {
      initYTPlayer()
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initYTPlayer()
      }
    }

    return () => {
      if (ytPollIntervalRef.current) clearInterval(ytPollIntervalRef.current)
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try {
          ytPlayerRef.current.destroy()
        } catch {}
      }
    }
  }, [videoId, isDirect, initialStartTime, saveProgress, storageKey, onEnded])

  // 1. DIRECT MP4 / CLOUDFLARE R2 / CUSTOM WHITELABEL PLAYER
  if (isDirect) {
    return (
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
          borderRadius: isFullscreen ? '0' : '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        }}
      >
        <video
          ref={videoRef}
          src={url}
          autoPlay={autoPlay}
          playsInline
          onTimeUpdate={handleTimeUpdate}
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
          onClick={togglePlay}
          style={{
            position: isFullscreen ? 'static' : 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            cursor: 'pointer',
          }}
        />

        {/* Top Badges & Notifications */}
        <div style={{ position: 'absolute', top: '12px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 10 }}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#f8fafc',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <span>🎓</span>
            <span>ÉCLAT INSTITUTE • HD STREAM</span>
          </div>

          {resumedNotice && (
            <div
              style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{resumedNotice}</span>
              <button
                type="button"
                onClick={handleRestart}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '0.68rem', cursor: 'pointer' }}
              >
                Restart ↺
              </button>
            </div>
          )}

          {completedNotice && (
            <div style={{ background: '#16a34a', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
              ✓ Video Module Completed
            </div>
          )}
        </div>

        {/* Buffering Spinner */}
        {isBuffering && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#3b82f6',
              fontSize: '2rem',
              zIndex: 15,
            }}
          >
            ⏳
          </div>
        )}

        {/* Custom Whitelabel Control Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(9, 13, 22, 0.95) 0%, rgba(9, 13, 22, 0.75) 60%, transparent 100%)',
            padding: '24px 16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.25s',
            zIndex: 20,
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

              {/* Volume */}
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

            {/* Right Controls: Speed & Fullscreen */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  padding: '3px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <option value={0.75} style={{ color: '#000' }}>0.75x</option>
                <option value={1} style={{ color: '#000' }}>1.0x Normal</option>
                <option value={1.25} style={{ color: '#000' }}>1.25x</option>
                <option value={1.5} style={{ color: '#000' }}>1.5x</option>
                <option value={2} style={{ color: '#000' }}>2.0x</option>
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
                title="Fullscreen"
              >
                {isFullscreen ? '⤦' : '⛶'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. VIMEO PLAYER
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

  // 3. YOUTUBE ULTRA-CLEAN AD-FREE EMBED WITH SMART RESUME & END DETECTION
  if (videoId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const startParam = initialStartTime > 0 ? `&start=${Math.floor(initialStartTime)}` : ''

    return (
      <div
        className="video-wrapper"
        style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          background: '#090d16',
        }}
      >
        {/* Custom Academy Watermark Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '14px',
            right: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#f8fafc',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <span>🎓</span>
            <span>ÉCLAT INSTITUTE • ONLINE CLASS</span>
          </div>

          {resumedNotice && (
            <div
              style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              }}
            >
              {resumedNotice}
            </div>
          )}

          {completedNotice && (
            <div style={{ background: '#16a34a', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
              ✓ Video Module Completed
            </div>
          )}
        </div>

        {/* Dynamic YouTube Iframe / Container */}
        <div ref={ytPlayerContainerRef} style={{ width: '100%', height: '100%' }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&controls=1&enablejsapi=1&fs=1&color=white${startParam}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </div>
    )
  }

  // 4. INVALID / EMPTY URL FALLBACK
  return (
    <div className="alert alert-warning" style={{ borderRadius: '10px', padding: '1rem' }}>
      <span className="alert-icon">⚠️</span>
      <div>
        <strong>Video link not detected.</strong>
        <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.85 }}>
          Paste a YouTube link (e.g. <code>https://youtube.com/watch?v=...</code>), Vimeo link, or direct MP4/R2 cloud storage URL.
        </div>
      </div>
    </div>
  )
}
