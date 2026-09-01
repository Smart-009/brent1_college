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

function getDynamicScheduledClasses(): LiveClassSchedule[] {
  const units = schoolStore.getCourseUnits()
  const timetable = schoolStore.getTimetable()

  if (timetable.length > 0) {
    return timetable.map((p) => ({
      id: p.id,
      title: `${p.subject_name} (${p.class_name})`,
      shift: `${p.day_of_week} Cohort (${p.start_time} - ${p.end_time})`,
      startTime: p.start_time,
      endTime: p.end_time,
      instructor: p.teacher_name || 'Faculty Lecturer',
      joinUrl: p.room || 'https://meet.google.com',
      course: p.subject_name,
    }))
  }

  // Generate dynamic schedule from active course units
  const defaultShifts = [
    { shift: 'Morning Batch (8:30 AM - 11:30 AM)', startTime: '08:30', endTime: '11:30' },
    { shift: 'Afternoon Batch (2:00 PM - 5:00 PM)', startTime: '14:00', endTime: '17:00' },
    { shift: 'Evening Executive Batch (5:30 PM - 7:30 PM)', startTime: '17:30', endTime: '19:30' },
    { shift: 'Night Executive Batch (7:30 PM - 9:30 PM)', startTime: '19:30', endTime: '21:30' },
  ]

  if (units.length > 0) {
    return units.slice(0, 4).map((unit, idx) => {
      const shiftCfg = defaultShifts[idx % defaultShifts.length]
      return {
        id: `c-bell-${unit.id}`,
        title: unit.title,
        shift: shiftCfg.shift,
        startTime: shiftCfg.startTime,
        endTime: shiftCfg.endTime,
        instructor: unit.teacher_name || 'Faculty Instructor',
        joinUrl: unit.live_meeting_url || 'https://meet.google.com',
        course: unit.title,
      }
    })
  }

  return [
    {
      id: 'c-morning',
      title: 'Practical Coding & Skills Lab',
      shift: 'Morning Batch (8:30 AM - 11:30 AM)',
      startTime: '08:30',
      endTime: '11:30',
      instructor: 'Faculty Lecturer',
      joinUrl: 'https://meet.google.com',
      course: 'Interactive Lab Session',
    },
  ]
}

export function ClassBellReminderModal() {
  const { profile } = useAuth()
  const [activeAlert, setActiveAlert] = useState<LiveClassSchedule | null>(null)
  const [isRinging, setIsRinging] = useState(false)
  const [bellMuted, setBellMuted] = useState(false)
  const [hasPromptedAudio, setHasPromptedAudio] = useState(false)
  const lastRingTimestamp = useRef<number>(0)

  // Trigger bell sound and open modal
  const triggerBellAlert = (schedule: LiveClassSchedule) => {
    setActiveAlert(schedule)
    setIsRinging(true)

    if (!bellMuted) {
      ringSchoolBell(3.2)
    }

    setTimeout(() => {
      setIsRinging(false)
    }, 3500)
  }

  // Periodic automatic class time detector
  useEffect(() => {
    const checkSchedule = () => {
      const scheduledClasses = getDynamicScheduledClasses()
      const now = new Date()
      const currentHours = now.getHours().toString().padStart(2, '0')
      const currentMinutes = now.getMinutes().toString().padStart(2, '0')
      const currentTimeStr = `${currentHours}:${currentMinutes}`

      // Check if current time matches any class start time
      const matchingClass = scheduledClasses.find((c) => c.startTime === currentTimeStr)

      if (matchingClass) {
        const timeSinceLastRing = Date.now() - lastRingTimestamp.current
        // Avoid re-ringing within 2 minutes
        if (timeSinceLastRing > 120000) {
          lastRingTimestamp.current = Date.now()
          triggerBellAlert(matchingClass)
        }
      }
    }

    const interval = setInterval(checkSchedule, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [bellMuted])

  // Listen for custom trigger event (e.g. from navbar test button)
  useEffect(() => {
    const handleManualRing = () => {
      const scheduledClasses = getDynamicScheduledClasses()
      const randomClass = scheduledClasses[Math.floor(Math.random() * scheduledClasses.length)]
      triggerBellAlert(randomClass)
    }

    window.addEventListener('eclat-ring-school-bell', handleManualRing)
    return () => window.removeEventListener('eclat-ring-school-bell', handleManualRing)
  }, [bellMuted])

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
        <div style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', padding: '3px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          ⚡ Live Virtual Class Reminder
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
            <span style={{ color: '#64748b' }}>Course Program:</span>
            <strong style={{ color: '#1e3a8a' }}>{activeAlert.course}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
            <span style={{ color: '#64748b' }}>Faculty Lecturer:</span>
            <strong style={{ color: '#334155' }}>{activeAlert.instructor}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Class Status:</span>
            <span style={{ color: '#16a34a', fontWeight: 800 }}>● Live in Session / Starting Now</span>
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
