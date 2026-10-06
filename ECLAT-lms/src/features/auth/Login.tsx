import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { MobileAppBottomNav } from '@/components/layout/MobileAppBottomNav'
import { isNativeApp } from '@/utils/platform'
import { sanitizeInput } from '@/lib/utils'
import type { Role, Profile } from '@/lib/database.types'
import { schoolStore } from '@/lib/schoolData'
import { hashPassword } from '@/lib/crypto'
import { supabase } from '@/lib/supabase'
import {
  GraduationCapIcon,
  BookOpenIcon,
  UsersIcon,
  BuildingIcon,
  CreditCardIcon,
  LockIcon,
  AlertTriangleIcon,
  CheckIcon,
  AwardIcon,
  SparklesIcon,
  VideoIcon,
  UserIcon,
} from '@/components/icons/AppIcons'

export function Login() {
  const { signIn } = useAuthContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paramRole = searchParams.get('role') as Role | null

  const isNative = isNativeApp()

  const [authMode, setAuthMode] = useState<'signin' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'signin'
  )
  const [regType, setRegType] = useState<'student' | 'tutor' | 'school'>('student')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regDeliveryTrack, setRegDeliveryTrack] = useState<'self_paced' | 'live_cohort'>('self_paced')
  const [regInstitutionName, setRegInstitutionName] = useState('')
  const [regSignatory, setRegSignatory] = useState('')
  const [regLogoUrl, setRegLogoUrl] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      setError(null)
      const redirectUrl = `${window.location.origin}/student`
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })
      if (oauthError) {
        throw oauthError
      }
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  // If URL has ?role=admin or ?role=bursar, start in staff mode
  const [isStaffMode, setIsStaffMode] = useState<boolean>(paramRole === 'admin' || paramRole === 'bursar')
  const [selectedRole, setSelectedRole] = useState<Role>(paramRole || (isNative ? 'student' : 'student'))
  const [selectedPortalKey, setSelectedPortalKey] = useState<string>(paramRole === ('igcse' as any) ? 'igcse' : (paramRole || 'student'))
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
      setSelectedPortalKey(paramRole)
      if (paramRole === 'admin' || paramRole === 'bursar') {
        setIsStaffMode(true)
      }
    }
  }, [paramRole])

  // Public Role Options
  const publicRoles = [
    {
      role: 'student' as Role,
      portalKey: 'student',
      label: 'Vocational & Short Courses Portal',
      renderIcon: () => <GraduationCapIcon size={22} color="#1d4ed8" />,
      route: '/student',
      desc: 'Access your registered short course units, practical video lessons, and transcripts.',
    },
    {
      role: 'student' as Role,
      portalKey: 'igcse',
      label: 'Cambridge & Edexcel IGCSE Portal',
      renderIcon: () => <AwardIcon size={22} color="#b45309" />,
      route: '/igcse',
      desc: 'Access Cambridge Assessment & Pearson Edexcel secondary syllabus, past papers, and statement of results.',
    },
    {
      role: 'teacher' as Role,
      portalKey: 'teacher',
      label: 'Faculty & Lecturer Portal',
      renderIcon: () => <BookOpenIcon size={22} color="#059669" />,
      route: '/teacher',
      desc: 'Upload practical lessons, mark attendance, and manage student gradebooks.',
    },
    {
      role: 'parent' as Role,
      portalKey: 'parent',
      label: 'Parent & Sponsor Portal',
      renderIcon: () => <UsersIcon size={22} color="#7c3aed" />,
      route: '/parent',
      desc: 'Track student attendance, fee clearance, and academic reports.',
    },
  ]

  // Staff / Administration Role Options (Hidden from public by default)
  const staffRoles = [
    {
      role: 'admin' as Role,
      portalKey: 'admin',
      label: 'Principal & Directorate Terminal',
      renderIcon: () => <BuildingIcon size={22} color="#d97706" />,
      route: '/admin',
      desc: 'Institutional administration, student directories, user provisioning, and pricing.',
    },
    {
      role: 'bursar' as Role,
      portalKey: 'bursar',
      label: 'Finance & Admissions Registry',
      renderIcon: () => <CreditCardIcon size={22} color="#0284c7" />,
      route: '/bursar',
      desc: 'Verify tuition payments, card settlements, M-Pesa receipts, and fee ledgers.',
    },
  ]

  const activeRolesList = isStaffMode ? staffRoles : publicRoles

  const handleSelectPortal = (cfg: { role: Role; portalKey: string }) => {
    setSelectedRole(cfg.role)
    setSelectedPortalKey(cfg.portalKey)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockoutSeconds > 0) {
      setError(`Security Lockout Active: Please wait ${lockoutSeconds}s before retrying.`)
      return
    }

    if (!admissionNumber.trim() || !password) {
      setError('Please enter your Admission Number or Staff Username and Password.')
      return
    }

    setError(null)
    setLoading(true)

    const cleanAdmission = sanitizeInput(admissionNumber)
    const res = await signIn(cleanAdmission, password)
    setLoading(false)

    if (res.error) {
      const nextFailed = failedAttempts + 1
      setFailedAttempts(nextFailed)
      if (nextFailed >= 5) {
        setLockoutSeconds(60)
        setError('Security Lockout: 5 consecutive failed attempts. System locked for 60 seconds.')
      } else {
        setError(`${res.error} (${5 - nextFailed} attempts remaining before temporary security lock)`)
      }
    } else {
      setFailedAttempts(0)
      setLockoutSeconds(0)
      const role = res.profile?.role || selectedRole
      if (role === 'admin' || cleanAdmission.toLowerCase().includes('admin')) {
        navigate('/admin')
      } else if (role === 'bursar') {
        navigate('/bursar')
      } else if (role === 'teacher') {
        navigate('/teacher')
      } else if (role === 'parent') {
        navigate('/parent')
      } else if (selectedPortalKey === 'igcse' || cleanAdmission.toLowerCase().startsWith('edx') || cleanAdmission.toLowerCase().startsWith('cai')) {
        navigate('/igcse')
      } else {
        navigate('/student')
      }
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setRegSuccessMsg(null)
    setRegLoading(true)

    try {
      const cleanName = sanitizeInput(regType === 'school' ? regInstitutionName : regName).trim()
      const cleanEmail = sanitizeInput(regEmail).toLowerCase().trim()
      const cleanPassword = regPassword.trim()
      const cleanPhone = sanitizeInput(regPhone).trim()

      if (!cleanName || !cleanPassword) {
        setError('Please provide your name/institution name and password.')
        setRegLoading(false)
        return
      }

      // Generate systematic admission / identifier code
      let generatedCode = ''
      const year = new Date().getFullYear()
      const randNum = Math.floor(1000 + Math.random() * 9000)

      if (regType === 'student') {
        generatedCode = `EI-${year}-STD${randNum}`
      } else if (regType === 'tutor') {
        generatedCode = `EI-TCH-${randNum}`
      } else {
        generatedCode = `EI-SCH-${randNum}`
      }

      const passHash = await hashPassword(cleanPassword)
      const registeredUserId = `usr-${Date.now()}`
      const userRole: Role = regType === 'student' ? 'student' : 'teacher'

      const newProfile: Profile = {
        id: registeredUserId,
        full_name: cleanName,
        admission_number: generatedCode,
        role: userRole,
        first_login_at: new Date().toISOString(),
        access_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      }

      // Store in local credentials store
      const stored = localStorage.getItem('eclat_local_credentials')
      const parsed = stored ? JSON.parse(stored) : {}
      const cleanAlpha = generatedCode.toLowerCase().replace(/[^a-z0-9]/g, '')
      const emailAlpha = cleanEmail.replace(/[^a-z0-9]/g, '')

      const credEntry = {
        id: registeredUserId,
        admission_number: generatedCode,
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: cleanPassword,
        passwordHash: passHash,
        role: userRole,
        account_type: regType,
        delivery_mode: regType === 'student' ? regDeliveryTrack : undefined,
        institution_name: regType === 'school' ? cleanName : undefined,
        institution_signatory: regType === 'school' ? regSignatory : undefined,
        institution_logo: regType === 'school' ? regLogoUrl : undefined,
        profile: newProfile,
        created_at: new Date().toISOString(),
      }

      parsed[cleanAlpha] = credEntry
      if (emailAlpha) {
        parsed[emailAlpha] = credEntry
      }
      localStorage.setItem('eclat_local_credentials', JSON.stringify(parsed))

      // If student, add to schoolStore SIS student directory
      if (regType === 'student') {
        await schoolStore.addStudent({
          id: registeredUserId,
          admission_number: generatedCode,
          full_name: cleanName,
          portal_password: cleanPassword,
          gender: 'Male',
          dob: '2004-01-01',
          class_id: 'prog-comp',
          class_name: regDeliveryTrack === 'live_cohort' ? 'Live Online Cohort' : 'Self-Paced Video Track',
          grade_level: 'Professional Certificate',
          stream: regDeliveryTrack === 'live_cohort' ? 'Live Online' : 'Self-Paced On-Demand',
          enrollment_date: new Date().toLocaleDateString('en-GB'),
          admission_date: new Date().toLocaleDateString('en-GB'),
          status: 'Active',
          guardian: {
            name: cleanName,
            relationship: 'Self',
            phone: cleanPhone,
            email: cleanEmail,
          },
          parent_phone: cleanPhone,
          emergency_contact: cleanPhone,
          fee_balance: 0,
          term_fee_total: 60,
          fee_cleared: true,
          attendance_rate: 100,
          discipline_points: 100,
          merits_count: 1,
          demerits_count: 0,
        })
      }

      // Automatically sign in
      const signInRes = await signIn(generatedCode, cleanPassword)
      setRegLoading(false)

      if (signInRes.error) {
        setRegSuccessMsg(`Account created! Your Identifier is ${generatedCode}. Please sign in.`)
        setAuthMode('signin')
        setAdmissionNumber(generatedCode)
      } else {
        if (regType === 'student') {
          navigate('/student')
        } else {
          navigate('/publish-course')
        }
      }
    } catch (err: any) {
      setRegLoading(false)
      setError(err?.message || 'Error creating account. Please try again.')
    }
  }

  const currentActiveRole =
    [...publicRoles, ...staffRoles].find((r) => r.portalKey === selectedPortalKey) || publicRoles[0]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f1f5f9 100%)',
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
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
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
                  border: '2px solid #1e3a8a',
                  boxShadow: '0 2px 8px rgba(30, 58, 138, 0.15)',
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
                <div style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 800, letterSpacing: '0.04em' }}>
                  100% ONLINE VIRTUAL CAMPUS
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
                  key={cfg.portalKey}
                  type="button"
                  onClick={() => handleSelectPortal(cfg)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: selectedPortalKey === cfg.portalKey ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: selectedPortalKey === cfg.portalKey ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: selectedPortalKey === cfg.portalKey ? '#dbeafe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {cfg.renderIcon()}
                    </span>
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          color: selectedPortalKey === cfg.portalKey ? '#1e3a8a' : '#0f172a',
                        }}
                      >
                        {cfg.label}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                        {cfg.desc}
                      </div>
                    </div>
                  </div>
                  {selectedPortalKey === cfg.portalKey && (
                    <span style={{ color: '#2563eb', marginLeft: '6px' }}>
                      <CheckIcon size={18} color="#2563eb" />
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
                setSelectedPortalKey(nextMode ? 'admin' : 'student')
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isStaffMode ? (
                <>
                  <GraduationCapIcon size={14} color="#64748b" />
                  <span>Trainee & Student Portal</span>
                </>
              ) : (
                <>
                  <LockIcon size={14} color="#64748b" />
                  <span>Staff Access</span>
                </>
              )}
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
            {/* Top Auth Mode Switcher */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin')
                  setError(null)
                  setRegSuccessMsg(null)
                }}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: authMode === 'signin' ? '#ffffff' : 'transparent',
                  fontWeight: authMode === 'signin' ? 800 : 600,
                  color: authMode === 'signin' ? '#1e3a8a' : '#64748b',
                  boxShadow: authMode === 'signin' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  transition: 'all 0.15s ease',
                }}
              >
                Sign In to Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register')
                  setError(null)
                  setRegSuccessMsg(null)
                }}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: authMode === 'register' ? '#ffffff' : 'transparent',
                  fontWeight: authMode === 'register' ? 800 : 600,
                  color: authMode === 'register' ? '#1e3a8a' : '#64748b',
                  boxShadow: authMode === 'register' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  transition: 'all 0.15s ease',
                }}
              >
                Create New Account
              </button>
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
                <AlertTriangleIcon size={18} color="#991b1b" />
                <div>{error}</div>
              </div>
            )}

            {regSuccessMsg && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: '#166534',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <CheckIcon size={18} color="#16a34a" />
                <div>{regSuccessMsg}</div>
              </div>
            )}

            {authMode === 'signin' ? (
              <>
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
                    Enter your registered credentials to sign in to your dashboard.
                  </p>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off">
                  <div style={{ marginBottom: '1.1rem' }}>
                    <label className="label" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                      {selectedPortalKey === 'igcse'
                        ? 'IGCSE Candidate Number / Unique ID'
                        : selectedRole === 'student'
                        ? 'Admission Number'
                        : 'Username / Admission Number'}
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="input"
                      value={admissionNumber}
                      onChange={(e) => setAdmissionNumber(e.target.value)}
                      placeholder={
                        selectedPortalKey === 'igcse'
                          ? 'Enter candidate number (e.g. KE042/0001/2026) or name'
                          : selectedRole === 'student'
                          ? 'Enter admission number or full name'
                          : 'Enter username or staff email'
                      }
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
                      autoComplete="new-password"
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
                    disabled={loading || googleLoading}
                    style={{ fontWeight: 800, padding: '0.85rem', borderRadius: '12px', fontSize: '0.95rem' }}
                  >
                    {loading ? 'Authenticating...' : `Sign In to Portal →`}
                  </button>

                  {/* Google OAuth Single Sign-On Button */}
                  <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>or sign in with</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#1e293b',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>{googleLoading ? 'Connecting Google Account...' : 'Continue with Google / Gmail'}</span>
                  </button>

                  <div style={{ marginTop: '1.1rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Don't have an account? Create one here →
                    </button>
                  </div>

                  {selectedPortalKey === 'igcse' && (
                    <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
                      <Link
                        to="/igcse"
                        style={{
                          fontSize: '0.82rem',
                          color: '#0284c7',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>🏛️</span>
                        <span>Open Cambridge & Edexcel Examination Center Portal →</span>
                      </Link>
                    </div>
                  )}
                </form>
              </>
            ) : (
              /* REGISTRATION FORM */
              <>
                <div style={{ marginBottom: '1.1rem' }}>
                  <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    NEW ACCOUNT REGISTRATION
                  </span>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>
                    Create Your Account
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                    Register as a Student, Individual Tutor, or Partner School to publish courses.
                  </p>
                </div>

                {/* Account Type Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '1.1rem' }}>
                  <button
                    type="button"
                    onClick={() => setRegType('student')}
                    style={{
                      padding: '0.5rem 0.35rem',
                      borderRadius: '8px',
                      border: regType === 'student' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: regType === 'student' ? '#eff6ff' : '#f8fafc',
                      color: regType === 'student' ? '#1e40af' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <span>🎓 Student</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#64748b' }}>Learn & Certify</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegType('tutor')}
                    style={{
                      padding: '0.5rem 0.35rem',
                      borderRadius: '8px',
                      border: regType === 'tutor' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                      background: regType === 'tutor' ? '#fffbeb' : '#f8fafc',
                      color: regType === 'tutor' ? '#b45309' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <span>👨‍🏫 Tutor</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#64748b' }}>Earn 50%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegType('school')}
                    style={{
                      padding: '0.5rem 0.35rem',
                      borderRadius: '8px',
                      border: regType === 'school' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: regType === 'school' ? '#f0fdf4' : '#f8fafc',
                      color: regType === 'school' ? '#15803d' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <span>🏫 School</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#64748b' }}>Publish Brand</span>
                  </button>
                </div>

                <form onSubmit={handleRegister} autoComplete="off">
                  {regType === 'school' ? (
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        Institution / School Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="e.g. Nairobi Coding Academy"
                        value={regInstitutionName}
                        onChange={(e) => setRegInstitutionName(e.target.value)}
                        style={{ fontSize: '0.9rem', padding: '0.65rem 0.85rem' }}
                      />
                    </div>
                  ) : null}

                  <div style={{ marginBottom: '0.85rem' }}>
                    <label className="label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                      {regType === 'school' ? 'Authorized Principal / Dean Name *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder={regType === 'school' ? 'e.g. Dr. Arthur Vance' : 'e.g. Samuel Karanja'}
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      style={{ fontSize: '0.9rem', padding: '0.65rem 0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
                    <div>
                      <label className="label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="input"
                        placeholder="email@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        style={{ fontSize: '0.9rem', padding: '0.65rem 0.85rem' }}
                      />
                    </div>
                    <div>
                      <label className="label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        WhatsApp Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        className="input"
                        placeholder="+254 712 345 678"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        style={{ fontSize: '0.9rem', padding: '0.65rem 0.85rem' }}
                      />
                    </div>
                  </div>

                  {regType === 'student' && (
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        Primary Learning Track
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setRegDeliveryTrack('self_paced')}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: regDeliveryTrack === 'self_paced' ? '1.5px solid #d97706' : '1px solid #cbd5e1',
                            background: regDeliveryTrack === 'self_paced' ? '#fffbeb' : '#ffffff',
                            color: regDeliveryTrack === 'self_paced' ? '#92400e' : '#475569',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          ⚡ Self-Paced Video
                          <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Instant streaming access</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegDeliveryTrack('live_cohort')}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: regDeliveryTrack === 'live_cohort' ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                            background: regDeliveryTrack === 'live_cohort' ? '#f5f3ff' : '#ffffff',
                            color: regDeliveryTrack === 'live_cohort' ? '#6d28d9' : '#475569',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          🎓 Live Cohort
                          <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Admission pass & Meet link</div>
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: '1.1rem' }}>
                    <label className="label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                      Create Password *
                    </label>
                    <input
                      type="password"
                      required
                      className="input"
                      placeholder="Minimum 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      style={{ fontSize: '0.9rem', padding: '0.65rem 0.85rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={regLoading || googleLoading}
                    style={{ fontWeight: 800, padding: '0.8rem', borderRadius: '12px', fontSize: '0.92rem' }}
                  >
                    {regLoading ? 'Registering Account...' : regType === 'student' ? 'Complete Student Registration →' : regType === 'tutor' ? 'Register Tutor & Open Publisher →' : 'Register School & Open Publisher →'}
                  </button>

                  {/* Google OAuth Single Sign-On Button for Instant Registration */}
                  <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>or sign up with</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || regLoading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#1e293b',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>{googleLoading ? 'Connecting Google Account...' : 'Sign Up with Google / Gmail'}</span>
                  </button>

                  <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Already have an account? Sign In →
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <LockIcon size={14} color="#64748b" />
            <span>256-Bit SSL Encrypted • Éclat Institute Global Portal</span>
          </div>
        </div>
      </div>

      <MobileAppBottomNav />
    </div>
  )
}
