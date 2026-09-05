import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { MobileAppBottomNav } from '@/components/layout/MobileAppBottomNav'
import { isNativeApp, OFFICIAL_APK_URL, LOCAL_APK_URL, OFFICIAL_DESKTOP_URL, LOCAL_DESKTOP_URL } from '@/utils/platform'
import type { Role } from '@/lib/database.types'

export function Login() {
  const { signIn } = useAuthContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paramRole = searchParams.get('role') as Role | null

  const isNative = isNativeApp()

  // If URL has ?role=admin or ?role=bursar, start in staff mode
  const [isStaffMode, setIsStaffMode] = useState<boolean>(paramRole === 'admin' || paramRole === 'bursar')
  const [selectedRole, setSelectedRole] = useState<Role>(paramRole || (isNative ? 'student' : 'student'))
  const [admissionNumber, setAdmissionNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)

  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setInterval(() => {
        setLockoutSeconds((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [lockoutSeconds])

  useEffect(() => {
    if (paramRole && ['admin', 'bursar', 'teacher', 'student', 'parent'].includes(paramRole)) {
      setSelectedRole(paramRole)
      if (paramRole === 'admin' || paramRole === 'bursar') {
        setIsStaffMode(true)
      }
    }
  }, [paramRole])

  // Public Role Options
  const publicRoles = [
    {
      role: 'student' as Role,
      label: 'Student / Trainee Portal',
      icon: '🎓',
      route: '/student',
      desc: 'Access your registered short course units, video lessons, and transcripts.',
    },
    {
      role: 'teacher' as Role,
      label: 'Faculty & Lecturer Portal',
      icon: '👩‍🏫',
      route: '/teacher',
      desc: 'Upload practical lessons, mark attendance, and manage student gradebooks.',
    },
    {
      role: 'parent' as Role,
      label: 'Parent & Sponsor Portal',
      icon: '👨‍👩‍👧',
      route: '/parent',
      desc: 'Track student attendance, fee clearance, and academic reports.',
    },
  ]

  // Staff / Administration Role Options (Hidden from public by default)
  const staffRoles = [
    {
      role: 'admin' as Role,
      label: 'Principal & Directorate Terminal',
      icon: '🏛️',
      route: '/admin',
      desc: 'Institutional administration, student directories, user provisioning, and pricing.',
    },
    {
      role: 'bursar' as Role,
      label: 'Finance & Admissions Registry',
      icon: '💼',
      route: '/bursar',
      desc: 'Verify tuition payments, card settlements, M-Pesa receipts, and fee ledgers.',
    },
  ]

  const activeRolesList = isStaffMode ? staffRoles : publicRoles

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockoutSeconds > 0) {
      setError(`🔒 Security Lockout Active: Please wait ${lockoutSeconds}s before retrying.`)
      return
    }

    if (!admissionNumber.trim() || !password) {
      setError('Please enter your Admission Number or Staff Username and Password.')
      return
    }

    setError(null)
    setLoading(true)

    const cleanAdmission = admissionNumber.trim().replace(/[<>]/g, '')
    const res = await signIn(cleanAdmission, password)
    setLoading(false)

    if (res.error) {
      const nextFailed = failedAttempts + 1
      setFailedAttempts(nextFailed)
      if (nextFailed >= 5) {
        setLockoutSeconds(60)
        setError('🛡️ Security Lockout: 5 consecutive failed attempts. System locked for 60 seconds.')
      } else {
        setError(`${res.error} (${5 - nextFailed} attempts remaining before temporary security lock)`)
      }
    } else {
      setFailedAttempts(0)
      setLockoutSeconds(0)
      if (selectedRole === 'admin' || cleanAdmission.toLowerCase().includes('admin')) {
        navigate('/admin')
      } else if (selectedRole === 'bursar') {
        navigate('/bursar')
      } else if (selectedRole === 'student' && !isNative) {
        // Double check DRM guard redirect
        navigate('/student')
      } else {
        const allRoles = [...publicRoles, ...staffRoles]
        const activeCfg = allRoles.find((r) => r.role === selectedRole) || allRoles[0]
        navigate(activeCfg.route)
      }
    }
  }

  const currentActiveRole =
    [...publicRoles, ...staffRoles].find((r) => r.role === selectedRole) || publicRoles[0]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 0.75rem calc(80px + env(safe-area-inset-bottom, 0px))',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '890px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        }}
      >
        {/* Left Side: Workstation Selector */}
        <div
          style={{
            background: '#f8fafc',
            padding: 'clamp(1.25rem, 4vw, 2.5rem)',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <img
                src="/logo.png"
                alt="Éclat Institute Logo"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  border: '2px solid #d4af37',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '0.03em',
                    lineHeight: 1.1,
                  }}
                >
                  ÉCLAT INSTITUTE
                </div>
                <div style={{ fontSize: '0.72rem', color: '#c5a059', fontWeight: 800, letterSpacing: '0.04em' }}>
                  100% ONLINE LEARNING ACADEMY
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isStaffMode ? 'Staff Terminal' : 'Select Portal'}
              </h3>
              {isStaffMode && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 800,
                  }}
                >
                  RESTRICTED ACCESS
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 1.25rem' }}>
              {isStaffMode
                ? 'Authorized faculty and executive administrators only.'
                : 'Select your portal to access live classrooms and course units:'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {activeRolesList.map((cfg) => (
                <button
                  key={cfg.role}
                  type="button"
                  onClick={() => handleSelectRole(cfg.role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: selectedRole === cfg.role ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: selectedRole === cfg.role ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{cfg.icon}</span>
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          color: selectedRole === cfg.role ? '#1e3a8a' : '#0f172a',
                        }}
                      >
                        {cfg.label}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                        {cfg.desc}
                      </div>
                    </div>
                  </div>
                  {selectedRole === cfg.role && (
                    <span style={{ color: '#2563eb', fontWeight: 900, fontSize: '1.1rem', marginLeft: '6px' }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <Link to="/" style={{ fontSize: '0.82rem', color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>
              ← Back to Home
            </Link>

            {/* Discrete Switcher for Staff vs Student */}
            <button
              type="button"
              onClick={() => {
                const nextMode = !isStaffMode
                setIsStaffMode(nextMode)
                setSelectedRole(nextMode ? 'admin' : 'student')
                setError(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              {isStaffMode ? '🎓 Trainee & Student Portal' : '🔐 Staff Access'}
            </button>
          </div>
        </div>

        {/* Right Side: Authentication or DRM Guard on Web */}
        <div
          style={{
            padding: 'clamp(1.25rem, 4vw, 2.5rem)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: isStaffMode ? '#dc2626' : '#2563eb',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {isStaffMode ? 'ADMINISTRATIVE TERMINAL' : 'STUDENT & FACULTY PORTAL'}
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0.35rem' }}>
                {currentActiveRole.label}
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                {!isNative && selectedRole === 'student' && !isStaffMode
                  ? 'Student login & video lessons are exclusively accessed through the official Native Applications.'
                  : 'Enter your registered credentials to sign in to your dashboard.'}
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #f87171',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <span>⚠️</span>
                <div>{error}</div>
              </div>
            )}

            {!isNative && selectedRole === 'student' && !isStaffMode ? (
              /* Web Student: Exclusive Native App Download Showcase */
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span>🛡️</span> HARDWARE ENCRYPTED CLASSROOM
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                  Download the Official App to Sign In
                </h3>

                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                  Student logins, coursework, live webinars, and exams are strictly enabled through our verified native applications for mobile phones and laptops.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a
                    href={LOCAL_APK_URL}
                    download="eclat-institute.apk"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🤖</span>
                    <span>Download Android App (.APK)</span>
                  </a>

                  <a
                    href={LOCAL_DESKTOP_URL}
                    download="eclat-institute-setup.exe"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>💻</span>
                    <span>Download Desktop Laptop App (.EXE)</span>
                  </a>
                </div>

                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px dashed #cbd5e1',
                    fontSize: '0.78rem',
                    color: '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div>
                    ✨ <strong>Already installed?</strong> Open the app and log in with your Admission Number.
                  </div>
                  <div>
                    🏛️ Faculty or Staff member?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsStaffMode(true)
                        setSelectedRole('admin')
                        setError(null)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Sign In via Staff Terminal →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Native App or Staff Mode: Direct Login Form */
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.1rem' }}>
                  <label className="label" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                    {selectedRole === 'student' ? 'Admission Number' : 'Username / Admission Number'}
                  </label>
                  <input
                    type="text"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="input"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    placeholder={selectedRole === 'student' ? 'e.g. EL/001/2026 or Mustafa Hassan' : 'e.g. Eclat2026@admin or username'}
                    style={{ fontSize: '0.95rem', padding: '0.75rem 0.9rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1.3rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <label className="label" style={{ margin: 0, fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                      Password
                    </label>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{ fontSize: '0.95rem', padding: '0.75rem 0.9rem' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                  style={{ fontWeight: 800, padding: '0.85rem', borderRadius: '12px', fontSize: '0.95rem' }}
                >
                  {loading ? 'Authenticating...' : `Sign In to Portal →`}
                </button>
              </form>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1.25rem' }}>
            🔒 256-Bit SSL Encrypted • Éclat Institute Global Portal
          </div>
        </div>
      </div>

      <MobileAppBottomNav />
    </div>
  )
}
