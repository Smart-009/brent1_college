import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile, Role } from '@/lib/database.types'

export const DEMO_PROFILES: Record<Role, Profile> = {
  admin: {
    id: 'demo-admin-id',
    full_name: 'Dr. Kevin Kipruto (Principal)',
    admission_number: 'ADMIN-001',
    role: 'admin',
    first_login_at: '2024-01-01T00:00:00Z',
    access_expires_at: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  bursar: {
    id: 'demo-bursar-id',
    full_name: 'Mrs. Grace Odhiambo (Bursar & Admissions Registrar)',
    admission_number: 'BUR-SEC-001',
    role: 'bursar',
    first_login_at: '2024-01-01T00:00:00Z',
    access_expires_at: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  teacher: {
    id: 'demo-teacher-id',
    full_name: 'Mr. James Mwangi (HOD Computer Science)',
    admission_number: 'TCH-001',
    role: 'teacher',
    first_login_at: '2024-01-01T00:00:00Z',
    access_expires_at: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  student: {
    id: 'demo-student-id',
    full_name: 'Abdi Hassan Mohamed',
    admission_number: 'BC-2024-001',
    role: 'student',
    first_login_at: '2024-01-01T00:00:00Z',
    access_expires_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  parent: {
    id: 'demo-parent-id',
    full_name: 'Hassan Mohamed Farah (Guardian)',
    admission_number: 'PAR-2024-001',
    role: 'parent',
    first_login_at: '2024-01-01T00:00:00Z',
    access_expires_at: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (admissionNumber: string, password: string) => Promise<{ error: string | null }>
  signInAsDemo: (role: Role) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const stored = localStorage.getItem('brent_demo_role') as Role | null
      if (stored && DEMO_PROFILES[stored]) {
        return DEMO_PROFILES[stored]
      }
    } catch {}
    return null
  })
  const [loading, setLoading] = useState(() => {
    try {
      const stored = localStorage.getItem('brent_demo_role')
      return !stored
    } catch {
      return false
    }
  })

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) setProfile(data)
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
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        const storedRole = localStorage.getItem('brent_demo_role') as Role | null
        if (storedRole && DEMO_PROFILES[storedRole]) {
          setProfile(DEMO_PROFILES[storedRole])
        }
        setLoading(false)
      }
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        const storedRole = localStorage.getItem('brent_demo_role') as Role | null
        if (storedRole && DEMO_PROFILES[storedRole]) {
          setProfile(DEMO_PROFILES[storedRole])
        } else {
          setProfile(null)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function signInAsDemo(role: Role) {
    localStorage.setItem('brent_demo_role', role)
    setProfile(DEMO_PROFILES[role])
  }

  async function signIn(inputIdentifier: string, password: string): Promise<{ error: string | null }> {
    const clean = inputIdentifier.trim().toLowerCase()

    // Quick demo shortcuts
    if (clean === 'admin' || clean === 'principal') {
      signInAsDemo('admin')
      return { error: null }
    }
    if (clean === 'bursar' || clean === 'secretary' || clean === 'finance' || clean === 'accounts' || clean === 'registrar' || clean === 'admissions') {
      signInAsDemo('bursar')
      return { error: null }
    }
    if (clean === 'teacher' || clean === 'mwangi' || clean === 'faculty') {
      signInAsDemo('teacher')
      return { error: null }
    }
    if (clean === 'student' || clean === 'abdi' || clean === 'bc-2024-001') {
      signInAsDemo('student')
      return { error: null }
    }
    if (clean === 'parent' || clean === 'guardian' || clean === 'farah') {
      signInAsDemo('parent')
      return { error: null }
    }

    // Supabase Auth
    const candidates: string[] = []
    if (clean.includes('@')) {
      candidates.push(clean)
    } else {
      const stripped = clean.replace(/[^a-z0-9]/g, '')
      candidates.push(`${stripped}@brentcollege.internal`)
      if (stripped.startsWith('admin')) {
        candidates.push('admin@brentcollege.internal')
      }
    }

    let lastError: string | null = null

    try {
      for (const email of candidates) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (!error && data.user) {
          localStorage.removeItem('brent_demo_role')
          await fetchProfile(data.user.id)
          return { error: null }
        }
        if (error) lastError = error.message
      }
    } catch {
      if (clean.startsWith('bc-') || clean.startsWith('std') || clean.startsWith('tch') || clean.startsWith('adm') || clean.startsWith('bur') || clean.startsWith('sec')) {
        const role: Role = clean.startsWith('adm')
          ? 'admin'
          : clean.startsWith('bur') || clean.startsWith('sec')
          ? 'bursar'
          : clean.startsWith('tch')
          ? 'teacher'
          : 'student'
        signInAsDemo(role)
        return { error: null }
      }
    }

    return { error: lastError || 'Invalid admission number/staff ID or password.' }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
    } catch {}
    localStorage.removeItem('brent_demo_role')
    setSession(null)
    setProfile(null)
  }

  const activeUser = session?.user ?? (profile ? ({ id: profile.id, email: `${profile.admission_number}@brentcollege.internal` } as unknown as User) : null)

  return (
    <AuthContext.Provider value={{ session, user: activeUser, profile, loading, signIn, signInAsDemo, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
