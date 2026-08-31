type SpinnerSize = 'sm' | 'md' | 'lg'

export function Spinner({ size = 'md', className = '' }: { size?: SpinnerSize; className?: string }) {
  const cls = ['spinner', size !== 'md' ? `spinner-${size}` : '', className].filter(Boolean).join(' ')
  return <span className={cls} role="status" aria-label="Loading…" />
}

export function LoadingScreen({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="loading-screen">
      <img src="/logo.png" alt="Eclat Institute" style={{ width: 60, height: 60, borderRadius: '50%' }} />
      <Spinner size="lg" />
      <p className="text-muted text-sm">{message}</p>
    </div>
  )
}
