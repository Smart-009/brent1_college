import { useNavigate } from 'react-router-dom'
import { INSTITUTION_CONFIG } from '@/config/institution'

export function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#070a12', color: '#f8fafc', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header
        style={{
          background: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Éclat" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #d4af37' }} />
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#d4af37' }}>{INSTITUTION_CONFIG.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Academic Learning & Management Portal</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#f8fafc',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ← Return to Home
        </button>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '850px', margin: '0 auto', padding: '3rem 1.5rem', lineHeight: 1.75 }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Legal & Compliance
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: '0.75rem 0 0.5rem' }}>
            Privacy Policy & Student Data Protection
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Last Updated: September 2026 • Applicable to Web, Android, iOS, and Microsoft Windows Applications.
          </p>
        </div>

        <section style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#60a5fa', fontWeight: 800, marginTop: 0 }}>1. Institutional Commitment to Privacy</h2>
          <p style={{ color: '#cbd5e1' }}>
            {INSTITUTION_CONFIG.name} is dedicated to safeguarding the privacy and personal data of our trainees, faculty members, parents, and administrative staff. This policy outlines how educational records, account credentials, and learning progress data are processed across all official client applications.
          </p>
        </section>

        <section style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#60a5fa', fontWeight: 800, marginTop: 0 }}>2. Information Collected</h2>
          <ul style={{ color: '#cbd5e1', paddingLeft: '1.25rem' }}>
            <li><strong>Student Identity Data:</strong> Full name, admission number, program of study, and contact email.</li>
            <li><strong>Academic Performance:</strong> Course unit registrations, exam results, lesson completion statistics, and attendance logs.</li>
            <li><strong>Financial & Fee Records:</strong> Tuition fee invoices, transaction reference codes, and installment receipts.</li>
            <li><strong>Device Security Signals:</strong> Anonymous client platform type (Windows, Android, iOS) used strictly for digital rights management (DRM) and session integrity.</li>
          </ul>
        </section>

        <section style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#60a5fa', fontWeight: 800, marginTop: 0 }}>3. Purpose of Processing</h2>
          <p style={{ color: '#cbd5e1' }}>
            Personal and academic information is collected solely for educational instruction, institutional administration, issuing academic transcripts, verifying tuition fee clearance, and delivering DRM-protected digital library resources. We do not sell, rent, or trade student data to commercial advertising brokers.
          </p>
        </section>

        <section style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#60a5fa', fontWeight: 800, marginTop: 0 }}>4. Data Security & Storage</h2>
          <p style={{ color: '#cbd5e1' }}>
            All transmissions between our client applications and database servers are protected with Transport Layer Security (TLS 1.3). Database access is strictly partitioned through Row-Level Security (RLS) policies guaranteeing multi-tenant isolation.
          </p>
        </section>

        <section style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#60a5fa', fontWeight: 800, marginTop: 0 }}>5. Student Rights & Contact</h2>
          <p style={{ color: '#cbd5e1' }}>
            Enrolled students may request access to their academic records, correction of profile details, or account deactivation by contacting the Office of the Academic Registrar or emailing <strong>support@eclat.institute</strong>.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
        © 2026 {INSTITUTION_CONFIG.name} • All Rights Reserved.
      </footer>
    </div>
  )
}
