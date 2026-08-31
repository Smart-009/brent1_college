import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export function AccessExpired() {
  const { profile, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !profile?.id) return

    setError(null)
    setLoading(true)

    const cleanCode = code.trim().toUpperCase()

    // Query activation code
    const { data: actCode, error: fetchErr } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', cleanCode)
      .eq('student_id', profile.id)
      .is('used_at', null)
      .single()

    if (fetchErr || !actCode) {
      setLoading(false)
      setError('Invalid or already used activation code. Please check with school admin.')
      return
    }

    // Mark code as used
    await supabase.from('activation_codes').update({ used_at: new Date().toISOString() }).eq('id', actCode.id)

    // Extend student's access_expires_at by duration_days
    const currentExpiry = profile.access_expires_at ? new Date(profile.access_expires_at) : new Date()
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date()
    const newExpiry = new Date(baseDate.getTime() + actCode.duration_days * 24 * 60 * 60 * 1000)

    await supabase.from('profiles').update({ access_expires_at: newExpiry.toISOString() }).eq('id', profile.id)

    await refreshProfile()
    setLoading(false)
    setSuccess(`Access successfully renewed for ${actCode.duration_days} days! 🎉`)

    setTimeout(() => {
      navigate('/student')
    }, 1500)
  }

  return (
    <div className="access-wall">
      <div className="access-wall-icon">⏳</div>
      <h1 className="access-wall-title">30-Day Access Window Expired</h1>
      <p style={{ maxWidth: 500, margin: '0 auto var(--space-6)', color: 'var(--color-text-secondary)' }}>
        Your standard 30-day learning portal access period has ended. To continue watching lessons and taking quizzes, enter your renewal activation code below or ask school administration for direct activation.
      </p>

      {error && (
        <div className="alert alert-danger" style={{ maxWidth: 440, margin: '0 auto var(--space-4)' }}>
          <span className="alert-icon">⚠️</span>
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ maxWidth: 440, margin: '0 auto var(--space-4)' }}>
          <span className="alert-icon">✅</span>
          <div>{success}</div>
        </div>
      )}

      <form onSubmit={handleRedeemCode} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
        <input
          type="text"
          className="access-code-input"
          placeholder="ECLAT-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <Button variant="accent" size="lg" loading={loading} type="submit" style={{ minWidth: 240 }}>
          Redeem Activation Code 🔑
        </Button>
      </form>

      <div style={{ marginTop: 'var(--space-8)', display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
        <Button variant="ghost" onClick={() => signOut().then(() => navigate('/login'))}>
          Sign Out & Return to Login
        </Button>
      </div>

      <div style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
        Éclat Institute • 100% Online Global Academy
      </div>
    </div>
  )
}
