import { useEffect, type ReactNode } from 'react'

interface PageWrapperProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export function PageWrapper({ title, subtitle, action, children }: PageWrapperProps) {
  useEffect(() => {
    document.title = `${title} | Eclat Institute`
  }, [title])

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}
