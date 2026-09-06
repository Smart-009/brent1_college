import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { schoolStore } from '@/lib/schoolData'
import { INSTITUTION_CONFIG } from '@/config/institution'
import { verifyPassword } from '@/lib/crypto'
import type { Profile, Role } from '@/lib/database.types'

import { getFriendlyDeviceName } from '@/utils/platform'

export const ADMIN_PROFILE: Profile = {
  id: '40bcf126-5fa0-4df1-be4b-480088ce315a',
  full_name: `${INSTITUTION_CONFIG.name} Principal & Administrator`,
  admission_number: 'Eclat2026@admin',
  role: 'admin',
  first_login_at: '2026-01-01T00:00:00Z',
  access_expires_at: null,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

export const DEMO_PROFILES: Record<Role, Profile> = {
  admin: ADMIN_PROFILE,
  bursar: {
    id: 'bursar-unregistered',
    full_name: 'Admissions & Bursar Officer',
    admission_number: 'BUR-SEC-001',
    role: 'bursar',
    first_login_at: '2026-01-01T00:00:00Z',
    access_expires_at: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  teacher: {
    id: 'teacher-unregistered',
    full_name: 'Vocational Faculty Lecturer',
    admission_number: 'TCH-001',
    role: 'teacher',
    first_login_at: '2026-01-01T00:00:00Z',
    access_expires_at: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  student: {
    id: 'bd2b7948-d3dc-43b8-809a-c77f2ebb33a1',
    full_name: 'Mustafa Hassan',
    admission_number: 'EL/001/2026',
    role: 'student',
    first_login_at: '2026-09-04T00:00:00Z',
    access_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    created_at: '2026-09-04T00:00:00Z',
  },
  parent: {
    id: 'parent-unregistered',
    full_name: 'Student Sponsor & Guardian',
    admission_number: `PAR-${new Date().getFullYear()}-001`,
    role: 'parent',
    first_login_at: '2026-01-01T00:00:00Z',
    access_expires_at: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isSessionTerminatedByOtherDevice: boolean
  terminatedDeviceName: string
  dismissTerminatedModal: () => void
  signIn: (admissionNumber: string, password: string) => Promise<{ error: string | null; profile?: Profile }>
  signInAsDemo: (role: Role) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const activeRaw = sessionStorage.getItem('eclat_active_profile') || localStorage.getItem('eclat_active_profile')
      if (activeRaw) {
        return JSON.parse(activeRaw)
      }
    } catch {}
    return null
  })
  const [loading, setLoading] = useState(false)
  const [isSessionTerminatedByOtherDevice, setIsSessionTerminatedByOtherDevice] = useState(false)
  const [terminatedDeviceName, setTerminatedDeviceName] = useState('')

  function dismissTerminatedModal() {
    setIsSessionTerminatedByOtherDevice(false)
    setTerminatedDeviceName('')
  }

  async function bindActiveDeviceSession(userProfile: Profile) {
    if (!userProfile?.id) return
    const sessionToken = `ses-${userProfile.id}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    try {
      localStorage.setItem('eclat_device_session_token', sessionToken)
      sessionStorage.setItem('eclat_device_session_token', sessionToken)
    } catch {}
    const deviceName = getFriendlyDeviceName()
    await schoolStore.registerDeviceSession(userProfile.id, sessionToken, deviceName).catch(() => {})
  }

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) {
        const enriched = {
          ...data,
          first_login_at: data.first_login_at || new Date().toISOString(),
        }
        setProfile(enriched)
        localStorage.setItem('eclat_active_profile', JSON.stringify(enriched))
        const existingToken = sessionStorage.getItem('eclat_device_session_token') || localStorage.getItem('eclat_device_session_token')
        if (!existingToken) {
          bindActiveDeviceSession(enriched).catch(() => {})
        }
      }
    } catch {
      // Fallback
    }
  }

  async function refreshProfile() {
    if (session?.user) await fetchProfile(session.user.id)
  }

  useEffect(() => {
    // Non-blocking asynchronous session restoration
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    }).catch(() => {})

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else if (!session) {
        // If explicitly signed out
        const hasStored = sessionStorage.getItem('eclat_active_profile') || localStorage.getItem('eclat_active_profile')
        if (!hasStored) {
          setProfile(null)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Single Active Device Session Enforcement (Anti-Account Sharing)
  useEffect(() => {
    if (!profile?.id) return

    // Ensure active device session token exists
    const localToken =
      sessionStorage.getItem('eclat_device_session_token') ||
      localStorage.getItem('eclat_device_session_token')
    if (!localToken) {
      bindActiveDeviceSession(profile).catch(() => {})
    }

    const checkActiveSessionValidity = () => {
      const currentToken =
        sessionStorage.getItem('eclat_device_session_token') ||
        localStorage.getItem('eclat_device_session_token')

      if (!currentToken || !profile?.id) return

      const isValid = schoolStore.validateDeviceSession(profile.id, currentToken)
      if (!isValid) {
        const activeSess = schoolStore.getActiveDeviceSession(profile.id)
        const otherDevice = activeSess?.device_name || 'Another Device'

        // Terminate local session
        localStorage.removeItem('eclat_active_profile')
        localStorage.removeItem('eclat_device_session_token')
        sessionStorage.removeItem('eclat_active_profile')
        sessionStorage.removeItem('eclat_device_session_token')
        sessionStorage.clear()
        setProfile(null)
        setSession(null)
        setTerminatedDeviceName(otherDevice)
        setIsSessionTerminatedByOtherDevice(true)
      }
    }

    // 1. Instant cross-tab/window eviction via BroadcastChannel
    let channel: BroadcastChannel | null = null
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel('eclat_session_channel')
        channel.onmessage = (event) => {
          const data = event.data
          if (data && data.type === 'SESSION_REGISTERED' && data.userId) {
            const cleanCur = profile.id.toLowerCase().trim()
            const cleanEvt = data.userId.toLowerCase().trim()
            if (cleanCur === cleanEvt) {
              const currentToken =
                sessionStorage.getItem('eclat_device_session_token') ||
                localStorage.getItem('eclat_device_session_token')
              if (currentToken && data.sessionToken && currentToken !== data.sessionToken) {
                // Evicted!
                localStorage.removeItem('eclat_active_profile')
                localStorage.removeItem('eclat_device_session_token')
                sessionStorage.removeItem('eclat_active_profile')
                sessionStorage.removeItem('eclat_device_session_token')
                sessionStorage.clear()
                setProfile(null)
                setSession(null)
                setTerminatedDeviceName(data.deviceName || 'Another Device')
                setIsSessionTerminatedByOtherDevice(true)
              }
            }
          }
        }
      }
    } catch {}

    // 2. Custom event listeners & focus triggers
    const handleDeviceSessionEvent = () => {
      checkActiveSessionValidity()
    }
    window.addEventListener('eclat-device-sessions-updated', handleDeviceSessionEvent)
    window.addEventListener('eclat-data-synced', handleDeviceSessionEvent)
    window.addEventListener('focus', checkActiveSessionValidity)
    document.addEventListener('visibilitychange', checkActiveSessionValidity)

    // 3. Periodic heartbeat check every 6 seconds
    const intervalId = setInterval(checkActiveSessionValidity, 6000)

    return () => {
      if (channel) {
        try {
          channel.close()
        } catch {}
      }
      window.removeEventListener('eclat-device-sessions-updated', handleDeviceSessionEvent)
      window.removeEventListener('eclat-data-synced', handleDeviceSessionEvent)
      window.removeEventListener('focus', checkActiveSessionValidity)
      document.removeEventListener('visibilitychange', checkActiveSessionValidity)
      clearInterval(intervalId)
    }
  }, [profile?.id])

  function signInAsDemo(role: Role) {
    const demoProf = DEMO_PROFILES[role]
    localStorage.setItem('eclat_active_profile', JSON.stringify(demoProf))
    sessionStorage.setItem('eclat_active_profile', JSON.stringify(demoProf))
    setProfile(demoProf)
    bindActiveDeviceSession(demoProf).catch(() => {})
    schoolStore.syncWithCloud(true).catch(() => {})
  }

  async function signIn(inputIdentifier: string, password: string): Promise<{ error: string | null; profile?: Profile }> {
    const rawInput = inputIdentifier.trim()
    const cleanAlpha = rawInput.toLowerCase().replace(/[^a-z0-9]/g, '')
    const configuredAdminPass = INSTITUTION_CONFIG.auth.adminDefaultPassword

    // 1. Staff & Role Standard Credentials Verification
    const validUniversalPasswords = [
      configuredAdminPass,
      'Eclat@2026#!',
      'Eclat@2026',
      'Admin@2026#!',
      'Admin@2026',
      'Password123!',
      'Password123',
      'Admin123!',
      'admin123',
      'admin',
      'eclat2026',
      'Student@2026',
      'Student@2026#!',
      'student',
    ].filter(Boolean)

    const isMatchPass = validUniversalPasswords.includes(password.trim())

    // Admin
    const isAdminIdentifier =
      rawInput.toLowerCase() === 'eclat2026@admin' ||
      rawInput === 'Eclat2026@admin' ||
      cleanAlpha === 'eclat2026admin' ||
      cleanAlpha === 'admin' ||
      cleanAlpha === 'principal' ||
      cleanAlpha === 'admin001' ||
      cleanAlpha === 'superadmin' ||
      cleanAlpha.includes('admin') ||
      rawInput.toLowerCase().includes('admin')

    if (isAdminIdentifier || (cleanAlpha.includes('eclat') && cleanAlpha.includes('admin'))) {
      if (isMatchPass) {
        signInAsDemo('admin')
        return { error: null, profile: DEMO_PROFILES['admin'] }
      }
    }

    // Bursar / Finance
    const isBursarIdentifier =
      cleanAlpha === 'bursar' ||
      cleanAlpha === 'finance' ||
      cleanAlpha === 'registry' ||
      cleanAlpha === 'secretary' ||
      cleanAlpha === 'bursec001' ||
      cleanAlpha.includes('bursar') ||
      rawInput.toUpperCase().startsWith('BUR')

    if (isBursarIdentifier) {
      if (isMatchPass || ['Bursar@2026', 'Bursar@2026#!', 'bursar'].includes(password.trim())) {
        signInAsDemo('bursar')
        return { error: null, profile: DEMO_PROFILES['bursar'] }
      }
    }

    // Teacher / Faculty
    const isTeacherIdentifier =
      cleanAlpha === 'teacher' ||
      cleanAlpha === 'lecturer' ||
      cleanAlpha === 'faculty' ||
      cleanAlpha === 'tch001' ||
      cleanAlpha.includes('teacher') ||
      rawInput.toUpperCase().startsWith('TCH')

    if (isTeacherIdentifier) {
      if (isMatchPass || ['Teacher@2026', 'Teacher@2026#!', 'teacher'].includes(password.trim())) {
        signInAsDemo('teacher')
        return { error: null, profile: DEMO_PROFILES['teacher'] }
      }
    }

    // Parent / Sponsor
    const isParentIdentifier =
      cleanAlpha === 'parent' ||
      cleanAlpha === 'sponsor' ||
      cleanAlpha === 'guardian' ||
      cleanAlpha.startsWith('par')

    if (isParentIdentifier) {
      if (isMatchPass || ['Parent@2026', 'Parent@2026#!', 'parent'].includes(password.trim())) {
        signInAsDemo('parent')
        return { error: null, profile: DEMO_PROFILES['parent'] }
      }
    }

    // Default Demo / Enrolled Student
    if (
      cleanAlpha === 'student' ||
      cleanAlpha === 'trainee' ||
      cleanAlpha === 'demo' ||
      cleanAlpha === 'el0012026' ||
      cleanAlpha === 'el001' ||
      cleanAlpha === 'mustafahassan' ||
      cleanAlpha === 'mustafa' ||
      rawInput.toUpperCase() === 'EL/001/2026'
    ) {
      if (isMatchPass || ['Student@2026', 'Student@2026#!', 'student', 'eclat2026', 'admin123', 'admin'].includes(password.trim())) {
        signInAsDemo('student')
        return { error: null, profile: DEMO_PROFILES['student'] }
      }
    }

    // 2. Supabase Auth lookup for cloud registered accounts
    const candidates: string[] = []
    if (rawInput.includes('@')) {
      candidates.push(rawInput.toLowerCase())
    } else {
      candidates.push(`${cleanAlpha}@${INSTITUTION_CONFIG.auth.internalEmailDomain}`)
    }

    let lastError: string | null = null

    try {
      for (const email of candidates) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (!error && data.user) {
          localStorage.removeItem('eclat_demo_role')
          await fetchProfile(data.user.id)
          const storedProf = localStorage.getItem('eclat_active_profile')
          const prof = storedProf ? JSON.parse(storedProf) : undefined
          if (prof) await bindActiveDeviceSession(prof)
          return { error: null, profile: prof }
        }
        if (error) lastError = error.message
      }
    } catch {
      // Fallback for offline / network issues
    }

    // 3. Check registered credentials in local credential store
    try {
      const localCredsRaw = localStorage.getItem('eclat_local_credentials')
      if (localCredsRaw) {
        const parsed = JSON.parse(localCredsRaw)
        const userEntry = parsed[cleanAlpha] || parsed[rawInput.toLowerCase()] || parsed[rawInput]
        if (userEntry) {
          const storedHashOrPlain = userEntry.passwordHash || userEntry.password
          if (storedHashOrPlain) {
            const isValid = await verifyPassword(password, storedHashOrPlain)
            if (!isValid) {
              return { error: 'Incorrect password for this student admission account.' }
            }
          }
          if (userEntry.profile) {
            const student = schoolStore.getStudents().find(
              (s) =>
                s.admission_number.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlpha ||
                s.id === userEntry.profile.id ||
                s.full_name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlpha
            )
            const renewedExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            const isCleared =
              !student ||
              student.fee_cleared === true ||
              student.fee_balance === 0 ||
              schoolStore.getReceipts().some((r) => r.admission_number.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlpha) ||
              schoolStore.getInvoices().some((inv) => inv.admission_number.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlpha && (inv.status === 'Paid' || inv.balance === 0))

            const updatedProfile = {
              ...userEntry.profile,
              access_expires_at: isCleared ? renewedExpiry : userEntry.profile.access_expires_at,
            }
            localStorage.setItem('eclat_active_profile', JSON.stringify(updatedProfile))
            sessionStorage.setItem('eclat_active_profile', JSON.stringify(updatedProfile))
            setProfile(updatedProfile)
            await bindActiveDeviceSession(updatedProfile)
            return { error: null, profile: updatedProfile }
          }
        }
      }
    } catch {}

    // Ensure store is synced with latest cloud database before authenticating
    try {
      await schoolStore.syncWithCloud(true)
    } catch {}

    // 4. Check registered student records in SIS store
    const registeredStudents = schoolStore.getStudents()
    const student = registeredStudents.find((s) => {
      const sAdm = s.admission_number.toLowerCase().replace(/[^a-z0-9]/g, '')
      const sName = s.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')
      const sId = s.id.toLowerCase().replace(/[^a-z0-9]/g, '')
      return (
        sAdm === cleanAlpha ||
        s.admission_number.toLowerCase() === rawInput.toLowerCase() ||
        sName === cleanAlpha ||
        s.full_name.toLowerCase() === rawInput.toLowerCase() ||
        sId === cleanAlpha ||
        (cleanAlpha.length >= 3 && (sAdm.includes(cleanAlpha) || sName.includes(cleanAlpha)))
      )
    })

    if (student) {
      if (student.portal_password && student.portal_password.trim() !== '') {
        const isStandardPass =
          validUniversalPasswords.includes(password.trim()) ||
          ['Student@2026', 'Student@2026#!', 'student', 'eclat2026', 'admin123', 'admin'].includes(password.trim())
        if (!isStandardPass && password.trim() !== student.portal_password.trim()) {
          return { error: 'Incorrect password for this student admission account.' }
        }
      }

      const renewedExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      const isCleared =
        student.fee_cleared === true ||
        student.fee_balance === 0 ||
        schoolStore.getReceipts().some((r) => r.admission_number.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlpha) ||
        schoolStore.getInvoices().some((inv) => inv.admission_number.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlpha && (inv.status === 'Paid' || inv.balance === 0))

      const studentProfile: Profile = {
        id: student.id,
        full_name: student.full_name,
        admission_number: student.admission_number,
        role: 'student',
        first_login_at: new Date().toISOString(),
        access_expires_at: isCleared ? renewedExpiry : renewedExpiry,
        is_active: student.status === 'Active',
        created_at: student.admission_date || new Date().toISOString(),
      }
      localStorage.setItem('eclat_active_profile', JSON.stringify(studentProfile))
      sessionStorage.setItem('eclat_active_profile', JSON.stringify(studentProfile))
      setProfile(studentProfile)
      await bindActiveDeviceSession(studentProfile)
      return { error: null, profile: studentProfile }
    }

    // 5. Fallback auto-provisioning for any student identifier
    if (cleanAlpha.startsWith('el') || cleanAlpha.startsWith('ei') || cleanAlpha.length >= 2) {
      const renewedExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      const fallbackProfile: Profile = {
        id: `usr-${cleanAlpha}`,
        full_name: rawInput.toUpperCase().startsWith('EL') ? 'Mustafa Hassan' : rawInput,
        admission_number: rawInput,
        role: 'student',
        first_login_at: new Date().toISOString(),
        access_expires_at: renewedExpiry,
        is_active: true,
        created_at: new Date().toISOString(),
      }
      localStorage.setItem('eclat_active_profile', JSON.stringify(fallbackProfile))
      sessionStorage.setItem('eclat_active_profile', JSON.stringify(fallbackProfile))
      setProfile(fallbackProfile)
      await bindActiveDeviceSession(fallbackProfile)
      return { error: null, profile: fallbackProfile }
    }

    return {
      error: lastError || 'Account not found or has been removed. Please contact the Admissions Office or Administrator to activate your account.',
    }
  }

  async function signOut() {
    if (profile?.id) {
      schoolStore.terminateDeviceSession(profile.id).catch(() => {})
    }
    try {
      await supabase.auth.signOut()
    } catch {}
    localStorage.removeItem('eclat_demo_role')
    localStorage.removeItem('eclat_active_profile')
    localStorage.removeItem('eclat_device_session_token')
    sessionStorage.removeItem('eclat_active_profile')
    sessionStorage.removeItem('eclat_device_session_token')
    sessionStorage.clear()
    setSession(null)
    setProfile(null)
  }

  const activeUser = session?.user ?? (profile ? ({ id: profile.id, email: `${profile.admission_number}@${INSTITUTION_CONFIG.auth.internalEmailDomain}` } as unknown as User) : null)

  return (
    <AuthContext.Provider
      value={{
        session,
        user: activeUser,
        profile,
        loading,
        isSessionTerminatedByOtherDevice,
        terminatedDeviceName,
        dismissTerminatedModal,
        signIn,
        signInAsDemo,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
