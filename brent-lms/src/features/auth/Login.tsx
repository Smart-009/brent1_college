import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { MobileAppBottomNav } from '@/components/layout/MobileAppBottomNav'
import type { Role } from '@/lib/database.types'

export function Login() {
  const { signIn } = useAuthContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paramRole = searchParams.get('role') as Role | null

  const currentYear = new Date().getFullYear()

  const [selectedRole, setSelectedRole] = useState<Role>(paramRole === 'admin' ? 'admin' : 'student')
  const [admissionNumber, setAdmissionNumber] = useState(paramRole === 'admin' ? 'Eclat2026@admin' : `BC-${currentYear}-001`)
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
      if (paramRole === 'admin') {
        setAdmissionNumber('Eclat2026@admin')
        setPassword('')
      }
    }
  }, [paramRole])

  const rolesConfig: { role: Role; label: string; icon: string; defaultId: string; defaultName: string; route: string; desc: string }[] = [
    {
      role: 'student',
      label: 'Student / Trainee',
      icon: '🎓',
      defaultId: `BC-${currentYear}-001`,
      defaultName: 'Enrolled Trainee',
      route: '/student',
      desc: 'Access your registered short course units, video lessons, and transcripts.',
    },
    {
      role: 'bursar',
      label: 'Bursar & Admissions',
      icon: '💼',
      defaultId: 'BUR-SEC-001',
      defaultName: 'Admissions Registrar',
      route: '/bursar',
      desc: 'Issue official M-Pesa receipts, calling letters, and manage fee ledgers.',
    },
    {
      role: 'teacher',
      label: 'Faculty & HOD',
      icon: '👩‍🏫',
      defaultId: 'TCH-001',
      defaultName: 'Department Lecturer',
      route: '/teacher',
      desc: 'Upload practical lessons, mark attendance, and manage student gradebooks.',
    },
    {
      role: 'admin',
      label: 'Principal / Admin',
      icon: '🏛️',
      defaultId: 'Eclat2026@admin',
      defaultName: 'College Principal',
      route: '/admin',
      desc: 'Full school administration, user provisioning, course pricing, and oversight.',
    },
    {
      role: 'parent',
      label: 'Parent / Sponsor',
      icon: '👨‍👩‍👧',
      defaultId: `PAR-${currentYear}-001`,
      defaultName: 'Student Sponsor',
      route: '/parent',
      desc: 'Track student attendance, fee statements, and term academic reports.',
    },
  ]

  const handleSelectRole = (cfg: (typeof rolesConfig)[0]) => {
    setSelectedRole(cfg.role)
    setAdmissionNumber(cfg.defaultId)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockoutSeconds > 0) {
      setError(`🔒 Security Lockout Active: Please wait ${lockoutSeconds}s before retrying.`)
      return
    }

    if (!admissionNumber || !password) {
      setError('Please enter both your Admission/Staff Number and Password.')
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
      } else {
        const activeCfg = rolesConfig.find((r) => r.role === selectedRole) || rolesConfig[0]
        navigate(activeCfg.route)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 0.75rem calc(80px + env(safe-area-inset-bottom, 0px))', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '850px', width: '100%', background: '#ffffff', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        
        {/* Left Side: Workstation Selector */}
        <div style={{ background: '#f8fafc', padding: 'clamp(1.25rem, 4vw, 2.5rem)', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <img src="/logo.png" alt="Éclat Institute Logo" style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #d4af37', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', letterSpacing: '0.03em', lineHeight: 1.1 }}>ÉCLAT INSTITUTE</div>
                <div style={{ fontSize: '0.72rem', color: '#c5a059', fontWeight: 800, letterSpacing: '0.04em' }}>100% ONLINE LEARNING ACADEMY</div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Select Official Workstation
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 1.25rem' }}>
              Choose your institutional role to enter your dedicated management portal:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {rolesConfig.map((cfg) => (
                <button
                  key={cfg.role}
                  type="button"
                  onClick={() => handleSelectRole(cfg)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
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
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: selectedRole === cfg.role ? '#1e3a8a' : '#0f172a' }}>
                        {cfg.label}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                        ID: <code style={{ color: '#2563eb', fontWeight: 700 }}>{cfg.defaultId}</code>
                      </div>
                    </div>
                  </div>
                  {selectedRole === cfg.role && <span style={{ color: '#2563eb', fontWeight: 900 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ fontSize: '0.84rem', color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>
              ← Return to Main Website
            </Link>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Paybill: 247247</span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                INSTITUTIONAL LOGIN
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0.35rem' }}>
                {rolesConfig.find((r) => r.role === selectedRole)?.label} Login
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                {rolesConfig.find((r) => r.role === selectedRole)?.desc}
              </p>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '10px', padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>⚠️</span>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label className="label">Admission / Staff Number</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  placeholder="e.g. BC-2026-001"
                />
              </div>

              <div style={{ marginBottom: '1.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="label" style={{ margin: 0 }}>Password</label>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ fontWeight: 800, padding: '0.85rem', borderRadius: '12px', fontSize: '0.95rem' }}
              >
                {loading ? 'Authenticating...' : `Sign In to ${rolesConfig.find((r) => r.role === selectedRole)?.label} →`}
              </button>
            </form>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1.25rem' }}>
            🔒 256-Bit Encrypted Institutional Portal • Éclat Institute
          </div>
        </div>
      </div>

      <MobileAppBottomNav />
    </div>
  )
}
