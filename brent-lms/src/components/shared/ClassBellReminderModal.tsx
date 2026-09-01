import { useState, useEffect, useRef } from 'react'
import { ringSchoolBell, playChime } from '@/lib/soundEffects'
import { useAuth } from '@/hooks/useAuth'
import { schoolStore } from '@/lib/schoolData'

interface LiveClassSchedule {
  id: string
  title: string
  shift: string
  startTime: string
  endTime: string
  instructor: string
  joinUrl: string
  course: string
}

interface LiveClassSchedule {
  id: string
  title: string
  shift: string
  startTime: string
  warningTime: string
  endTime: string
  instructor: string
  joinUrl: string
  course: string
  days: string[]
}

function parseTimeFromText(scheduleText: string): { startTime: string; warningTime: string; endTime: string; days: string[] } {
  const days: string[] = []
  const textLower = scheduleText.toLowerCase()
  if (textLower.includes('mon')) days.push('Monday')
  if (textLower.includes('tue')) days.push('Tuesday')
  if (textLower.includes('wed')) days.push('Wednesday')
  if (textLower.includes('thu')) days.push('Thursday')
  if (textLower.includes('fri')) days.push('Friday')
  if (textLower.includes('sat')) days.push('Saturday')
  if (textLower.includes('sun')) days.push('Sunday')
  if (days.length === 0) days.push('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')

  // Match times like 7:30 PM, 08:30 AM, 5:30 PM, etc.
  const timeMatches = scheduleText.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/gi)
  let startH = 19
  let startM = 30
  let endH = 21
  let endM = 30

  if (timeMatches && timeMatches.length >= 1) {
    const parseSingle = (raw: string) => {
      const parts = raw.trim().split(/[:\s]/)
      let h = parseInt(parts[0], 10)
      const m = parseInt(parts[1], 10) || 0
      const isPM = /pm/i.test(raw)
      const isAM = /am/i.test(raw)
      if (isPM && h < 12) h += 12
      if (isAM && h === 12) h = 0
      return { h, m }
    }
    const s = parseSingle(timeMatches[0])
    startH = s.h
    startM = s.m

    if (timeMatches.length >= 2) {
      const e = parseSingle(timeMatches[1])
      endH = e.h
      endM = e.m
    } else {
      endH = (startH + 2) % 24
      endM = startM
    }
  }

  // 10 minutes prior warning time
  let warnH = startH
  let warnM = startM - 10
  if (warnM < 0) {
    warnM += 60
    warnH = (warnH - 1 + 24) % 24
  }

  return {
    startTime: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
    warningTime: `${warnH.toString().padStart(2, '0')}:${warnM.toString().padStart(2, '0')}`,
    endTime: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
    days,
  }
}

function getStudentScheduledClasses(profile: any): LiveClassSchedule[] {
  const studentIdentifier = profile?.admission_number || profile?.id || ''
  const myUnits = profile ? schoolStore.getRegisteredUnitsForStudent(studentIdentifier) : []
  const units = myUnits.length > 0 ? myUnits : schoolStore.getCourseUnits().filter((u) => u.is_published !== false)

  if (units.length > 0) {
    return units.map((unit) => {
      const sched = parseTimeFromText(unit.live_schedule_text || 'Mon, Wed & Fri: 7:30 PM - 9:30 PM EAT')
      return {
        id: `c-bell-${unit.id}`,
        title: unit.title,
        shift: unit.live_schedule_text || 'Mon, Wed & Fri: 7:30 PM - 9:30 PM EAT',
        startTime: sched.startTime,
        warningTime: sched.warningTime,
        endTime: sched.endTime,
        instructor: unit.teacher_name || 'Faculty Instructor',
        joinUrl: unit.live_meeting_url || 'https://meet.google.com',
        course: unit.title,
        days: sched.days,
      }
    })
  }

  return [
    {
      id: 'c-default',
      title: 'Full-Stack Web Development & Modern JavaScript',
      shift: 'Mon, Wed & Fri: 7:30 PM - 9:30 PM EAT',
      startTime: '19:30',
      warningTime: '19:20',
      endTime: '21:30',
      instructor: 'Faculty Instructor',
      joinUrl: 'https://meet.google.com',
      course: 'Online Short Course Live Class',
      days: ['Monday', 'Wednesday', 'Friday'],
    },
  ]
}

export function ClassBellReminderModal() {
  const { profile } = useAuth()
  const [activeAlert, setActiveAlert] = useState<LiveClassSchedule | null>(null)
  const [alertType, setAlertType] = useState<'starting_now' | '10min_warning'>('starting_now')
  const [isRinging, setIsRinging] = useState(false)
  const [bellMuted, setBellMuted] = useState(false)
  const [notificationGranted, setNotificationGranted] = useState(false)
  const lastRingTimestamp = useRef<number>(0)

  // Request native OS background push & notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationGranted(true)
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          setNotificationGranted(permission === 'granted')
        })
      }
    }
  }, [])

  // Send native OS background notification (rings even if app is minimized or in background)
  const sendBackgroundNotification = (title: string, body: string, url: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [300, 100, 300, 100, 600],
            data: { url },
            tag: 'class-bell-reminder',
            renotify: true,
          } as any)
        })
      } else {
        new Notification(title, {
          body,
          icon: '/logo.png',
        })
      }
    } catch (err) {
      console.warn('Background notification error:', err)
    }
  }

  // Trigger bell sound, native notification, and open reminder modal
  const triggerBellAlert = (schedule: LiveClassSchedule, type: 'starting_now' | '10min_warning' = 'starting_now') => {
    setActiveAlert(schedule)
    setAlertType(type)
    setIsRinging(true)

    if (!bellMuted) {
      ringSchoolBell(3.5)
    }

    const notifTitle = type === '10min_warning'
      ? `🔔 Class in 10 Mins: ${schedule.course}`
      : `🔔 Live Class Starting Now: ${schedule.course}`

    const notifBody = type === '10min_warning'
      ? `Your session with ${schedule.instructor} starts in 10 minutes (${schedule.startTime}). Prepare your workspace!`
      : `Class is live now! Click to join your interactive video lecture with ${schedule.instructor}.`

    sendBackgroundNotification(notifTitle, notifBody, schedule.joinUrl)

    setTimeout(() => {
      setIsRinging(false)
    }, 4000)
  }

  // Periodic automatic class time detector configured to student's program and time
  useEffect(() => {
    const checkSchedule = () => {
      const scheduledClasses = getStudentScheduledClasses(profile)
      const now = new Date()
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
      const currentHours = now.getHours().toString().padStart(2, '0')
      const currentMinutes = now.getMinutes().toString().padStart(2, '0')
      const currentTimeStr = `${currentHours}:${currentMinutes}`

      for (const cls of scheduledClasses) {
        if (!cls.days.includes(currentDay)) continue

        const timeSinceLastRing = Date.now() - lastRingTimestamp.current
        if (timeSinceLastRing < 120000) continue // Prevent re-ringing within 2 minutes

        // 1. Check exact Start Time
        if (cls.startTime === currentTimeStr) {
          lastRingTimestamp.current = Date.now()
          triggerBellAlert(cls, 'starting_now')
          break
        }

        // 2. Check 10-Minute Prior Warning Time
        if (cls.warningTime === currentTimeStr) {
          lastRingTimestamp.current = Date.now()
          triggerBellAlert(cls, '10min_warning')
          break
        }
      }
    }

    const interval = setInterval(checkSchedule, 20000) // Check every 20 seconds
    return () => clearInterval(interval)
  }, [profile, bellMuted])

  // Listen for manual trigger (e.g. from School Bell button in Navbar)
  useEffect(() => {
    const handleManualRing = () => {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then((p) => setNotificationGranted(p === 'granted'))
      }
      const scheduledClasses = getStudentScheduledClasses(profile)
      const activeOrFirst = scheduledClasses[0]
      triggerBellAlert(activeOrFirst, 'starting_now')
    }

    window.addEventListener('eclat-ring-school-bell', handleManualRing)
    return () => window.removeEventListener('eclat-ring-school-bell', handleManualRing)
  }, [profile, bellMuted])

  if (!activeAlert) {
    return null
  }

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 99999,
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modal-content animate-scale-up"
        style={{
          maxWidth: '540px',
          width: '100%',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          border: '3px solid #f59e0b',
          boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.35)',
          padding: '2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Ringing Bell Header */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '3px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.8rem',
              margin: '0 auto',
              animation: isRinging ? 'bell-shake 0.35s infinite alternate ease-in-out' : 'none',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
            }}
          >
            🔔
          </div>
          {isRinging && (
            <div
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '0.7rem',
                fontWeight: 900,
                animation: 'pulse 1s infinite',
              }}
            >
              RINGING!
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{
          display: 'inline-block',
          background: alertType === '10min_warning' ? '#fef3c7' : '#dcfce7',
          color: alertType === '10min_warning' ? '#92400e' : '#166534',
          padding: '4px 14px',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
        }}>
          {alertType === '10min_warning' ? '⏳ 10-Minute Prior Warning Alert' : '⚡ Live Virtual Class Starting Now!'}
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e3a8a', margin: '0 0 0.5rem', lineHeight: 1.3 }}>
          {activeAlert.title}
        </h2>
        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '1.25rem' }}>
          {activeAlert.shift}
        </div>

        {/* Details Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
            fontSize: '0.84rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
            <span style={{ color: '#64748b' }}>Your Enrolled Program:</span>
            <strong style={{ color: '#1e3a8a' }}>{activeAlert.course}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
            <span style={{ color: '#64748b' }}>Faculty Lecturer:</span>
            <strong style={{ color: '#334155' }}>{activeAlert.instructor}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Scheduled Class Time:</span>
            <span style={{ color: '#2563eb', fontWeight: 800 }}>
              {activeAlert.startTime} - {activeAlert.endTime}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <a
            href={activeAlert.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setActiveAlert(null)}
            className="btn btn-primary"
            style={{
              fontWeight: 800,
              fontSize: '1rem',
              padding: '0.85rem',
              borderRadius: '10px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
            }}
          >
            <span>🚀</span> Join Live Classroom (Zoom / Meet) →
          </a>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsRinging(true)
                ringSchoolBell(3.2)
                setTimeout(() => setIsRinging(false), 3500)
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.6rem' }}
            >
              🔔 Ring Bell Again
            </button>

            <button
              type="button"
              onClick={() => setActiveAlert(null)}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.6rem' }}
            >
              ✓ Acknowledge & Close
            </button>
          </div>
        </div>

        {/* Mute Toggle */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={bellMuted}
              onChange={(e) => setBellMuted(e.target.checked)}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Mute school bell sound</span>
          </label>
        </div>
      </div>

      <style>{`
        @keyframes bell-shake {
          0% { transform: rotate(-16deg); }
          50% { transform: rotate(16deg); }
          100% { transform: rotate(-12deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * Helper to manually dispatch school bell alert anywhere in the app
 */
export function dispatchSchoolBellAlert() {
  window.dispatchEvent(new CustomEvent('eclat-ring-school-bell'))
}
