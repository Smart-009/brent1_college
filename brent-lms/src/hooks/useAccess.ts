import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { isAccessExpired } from '@/lib/utils'

/**
 * Checks if the current student's access has expired.
 * If expired, redirects to /access-expired.
 * Teachers and admins are never blocked.
 */
export function useAccess() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!profile) return
    if (profile.role === 'admin' || profile.role === 'teacher') return
    if (isAccessExpired(profile.access_expires_at)) {
      navigate('/access-expired', { replace: true })
    }
  }, [profile, navigate])

  return {
    isExpired: profile ? isAccessExpired(profile.access_expires_at) : false,
    accessExpiresAt: profile?.access_expires_at ?? null,
  }
}
