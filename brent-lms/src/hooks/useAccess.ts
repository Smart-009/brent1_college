import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { isAccessExpired } from '@/lib/utils'
import { schoolStore } from '@/lib/schoolData'
import { supabase } from '@/lib/supabase'

/**
 * Checks if the current student's access has expired.
 * If expired and NOT fee-cleared at Bursar Desk, redirects to /access-expired.
 * Teachers, admins, bursars, and fee-cleared students are NEVER blocked.
 */
export function useAccess() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  // Determine if student has active fee clearance or payments from Bursar desk
  const studentIdentifier = profile?.admission_number || profile?.id || ''
  const studentRecord = schoolStore
    .getStudents()
    .find(
      (s) =>
        (profile?.admission_number && s.admission_number.toLowerCase() === profile.admission_number.toLowerCase()) ||
        s.id === profile?.id
    )

  const studentInvoices = schoolStore
    .getInvoices()
    .filter(
      (inv) =>
        (profile?.admission_number && inv.admission_number.toLowerCase() === profile.admission_number.toLowerCase()) ||
        inv.student_id === profile?.id
    )

  const studentReceipts = schoolStore
    .getReceipts()
    .filter(
      (rcpt) =>
        (profile?.admission_number && rcpt.admission_number.toLowerCase() === profile.admission_number.toLowerCase()) ||
        rcpt.student_id === profile?.id
    )

  const hasClearedInvoice = studentInvoices.some((inv) => inv.status === 'Paid' || inv.balance === 0)
  const hasValidReceipt = studentReceipts.some((r) => (r.amount_paid ?? r.amount) > 0)
  const isBiometricCleared = schoolStore
    .getBiometricClearanceLogs()
    .some((p) => p.admission_number.toLowerCase() === studentIdentifier.toLowerCase())

  const isFeeCleared =
    studentRecord?.fee_cleared === true ||
    (studentRecord && studentRecord.fee_balance === 0) ||
    hasClearedInvoice ||
    hasValidReceipt ||
    isBiometricCleared

  useEffect(() => {
    if (!profile) return
    if (profile.role === 'admin' || profile.role === 'teacher' || (profile.role as any) === 'bursar') return

    // If student is fee-cleared at Bursar desk, they have full academic access!
    if (isFeeCleared) {
      // If access_expires_at was expired in Supabase, auto-renew it in the background
      if (isAccessExpired(profile.access_expires_at)) {
        const renewed = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        Promise.resolve(
          supabase
            .from('profiles')
            .update({ access_expires_at: renewed })
            .eq('id', profile.id)
        ).catch(() => {})
      }
      return
    }

    if (isAccessExpired(profile.access_expires_at)) {
      navigate('/access-expired', { replace: true })
    }
  }, [profile, isFeeCleared, navigate])

  return {
    isExpired: isFeeCleared ? false : profile ? isAccessExpired(profile.access_expires_at) : false,
    accessExpiresAt: isFeeCleared ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : profile?.access_expires_at ?? null,
    isFeeCleared,
  }
}
