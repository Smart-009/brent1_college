import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export function ChangePassword() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError(null)
    setLoading(true)

    // Update Auth Password
    const { error: authErr } = await supabase.auth.updateUser({ password: newPassword })
    if (authErr) {
      setLoading(false)
      setError(authErr.message)
      return
    }

    // Set first_login_at timestamp and access_expires_at (30 days from now)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (profile?.id) {
      await supabase
        .from('profiles')
        .update({
          first_login_at: now.toISOString(),
          access_expires_at: profile.access_expires_at || expiresAt.toISOString(),
        })
        .eq('id', profile.id)

      await refreshProfile()
    }

    setLoading(false)

    // Navigate to respective role portal
    if (profile?.role === 'admin') navigate('/admin')
    else if (profile?.role === 'teacher') navigate('/teacher')
    else navigate('/student')
  }

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <div className="change-password-icon">🔑</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
          Set Your New Password
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
          Welcome to Éclat Institute LMS! Since this is your first login, please update your temporary password to secure your account.
        </p>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)', textAlign: 'left' }}>
            <span className="alert-icon">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="newPass">New Password</label>
            <input
              id="newPass"
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPass">Confirm New Password</label>
            <input
              id="confirmPass"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <Button variant="primary" fullWidth size="lg" loading={loading} type="submit">
              Save Password & Continue →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
