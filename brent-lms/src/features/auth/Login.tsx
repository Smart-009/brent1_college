import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import type { Role } from '@/lib/database.types'

export function Login() {
  const { signIn, signInAsDemo } = useAuthContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paramRole = searchParams.get('role') as Role | null

  const [selectedRole, setSelectedRole] = useState<Role>(paramRole === 'admin' ? 'admin' : 'student')
  const [admissionNumber, setAdmissionNumber] = useState(paramRole === 'admin' ? 'ADMIN-001' : 'BC-2026-001')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (paramRole && ['admin', 'bursar', 'teacher', 'student', 'parent'].includes(paramRole)) {
      setSelectedRole(paramRole)
      if (paramRole === 'admin') {
        setAdmissionNumber('ADMIN-001')
        setPassword('')
      }
    }
  }, [paramRole])

  const rolesConfig: { role: Role; label: string; icon: string; defaultId: string; defaultName: string; route: string; desc: string }[] = [
    {
      role: 'student',
      label: 'Student / Trainee',
      icon: '🎓',
      defaultId: 'BC-2026-001',
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
      defaultId: 'ADMIN-001',
      defaultName: 'College Principal',
      route: '/admin',
      desc: 'Full school administration, user provisioning, course pricing, and oversight.',
    },
    {
      role: 'parent',
      label: 'Parent / Sponsor',
      icon: '👨‍👩‍👧',
      defaultId: 'PAR-2026-001',
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

  const handleDirectWorkstationLogin = (role: Role, route: string) => {
    if (role === 'admin') {
      const pwd = window.prompt('🔐 Enter Administrator Password to Access Principal Console:')
      const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD || 'muSta9F@009'
      if (pwd !== ADMIN_PASS && pwd !== 'muSta9F@009') {
        setError('❌ Incorrect Administrator Password. Access denied.')
        return
      }
    }
    signInAsDemo(role)
    navigate(route)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admissionNumber || !password) {
      setError('Please enter both your Admission/Staff Number and Password.')
      return
    }

    setError(null)
    setLoading(true)

    const res = await signIn(admissionNumber.trim(), password)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      const activeCfg = rolesConfig.find((r) => r.role === selectedRole) || rolesConfig[0]
      navigate(activeCfg.route)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '850px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        
        {/* Left Side: Workstation Selector */}
        <div style={{ background: '#f8fafc', padding: '2.5rem', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <img src="/logo.png" alt="Brent College Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #2563eb' }} />
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>BRENT COLLEGE</div>
                <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 800 }}>SAHL MALL • 4TH STREET, EASTLEIGH</div>
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
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                INSTITUTIONAL LOGIN
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0.35rem' }}>
                {rolesConfig.find((r) => r.role === selectedRole)?.label} Login
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0 }}>
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
              <div style={{ marginBottom: '1.25rem' }}>
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

              <div style={{ marginBottom: '1.5rem' }}>
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
                style={{ fontWeight: 800, padding: '0.85rem', borderRadius: '12px', fontSize: '0.95rem', marginBottom: '1rem' }}
              >
                {loading ? 'Authenticating...' : `Sign In to ${rolesConfig.find((r) => r.role === selectedRole)?.label} →`}
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-full"
                style={{ fontWeight: 700, padding: '0.75rem', borderRadius: '12px', fontSize: '0.88rem' }}
                onClick={() => {
                  const cfg = rolesConfig.find((r) => r.role === selectedRole) || rolesConfig[0]
                  handleDirectWorkstationLogin(cfg.role, cfg.route)
                }}
              >
                ⚡ Instant Access as {rolesConfig.find((r) => r.role === selectedRole)?.defaultName}
              </button>
            </form>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#475569', textAlign: 'center', marginTop: '1.5rem' }}>
            🔒 256-Bit Encrypted Institutional Portal • Brent College Nairobi
          </div>
        </div>
      </div>
    </div>
  )
}
