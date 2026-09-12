import { useNavigate } from 'react-router-dom'
import { INSTITUTION_CONFIG } from '@/config/institution'

export function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Institutional Header */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt={INSTITUTION_CONFIG.name} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #d4af37' }} />
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.02em' }}>{INSTITUTION_CONFIG.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>100% Online Virtual Campus • Directorate of Academic Affairs</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            background: '#0f172a',
            border: 'none',
            color: '#ffffff',
            padding: '0.5rem 1.15rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          ← Return to Home
        </button>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '3.5rem 1.5rem', lineHeight: 1.75 }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Institutional Governance & Compliance
          </span>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#0f172a', margin: '0.85rem 0 0.5rem', lineHeight: 1.2 }}>
            Privacy Policy & Student Data Protection
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Official Institutional Policy • Applicable to all {INSTITUTION_CONFIG.name} online learning portals, mobile applications, and academic services.
          </p>
        </div>

        {/* Section 1 */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, marginTop: 0, borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
            1. Institutional Commitment to Privacy
          </h2>
          <p style={{ color: '#334155' }}>
            {INSTITUTION_CONFIG.name} is dedicated to protecting the confidentiality, integrity, and privacy of our students, applicants, faculty, and stakeholders. This policy sets forth our standards for collecting, maintaining, and protecting academic and personal records across all instructional and administrative portals.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, marginTop: 0, borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
            2. Information Collected
          </h2>
          <ul style={{ color: '#334155', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Student Identification & Profile:</strong> Official full name, contact telephone, email address, national identification (where required for official accreditation), and assigned admission number.</li>
            <li><strong>Academic Performance & Course Records:</strong> Course registrations, assignment submissions, examination grades, attendance logs, and verified certificate records.</li>
            <li><strong>Tuition & Billing Data:</strong> Official payment receipts, transaction reference numbers, and installment schedules necessary for bursar clearance.</li>
            <li><strong>Service Usage Information:</strong> Anonymous operational logs generated during normal platform usage to ensure reliable service delivery and account integrity.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, marginTop: 0, borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
            3. Purpose of Processing
          </h2>
          <p style={{ color: '#334155', marginBottom: '0.75rem' }}>
            Personal and academic data is collected solely for legitimate educational and institutional administration purposes, including:
          </p>
          <ul style={{ color: '#334155', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Delivering online live lectures, course materials, and virtual lab sessions.</li>
            <li>Verifying student eligibility, evaluating academic performance, and issuing accredited certificates and transcripts.</li>
            <li>Facilitating official fee billing, tuition payment processing, and Bursar clearance passes.</li>
            <li>Communicating urgent academic notices, cohort schedules, and institutional announcements.</li>
          </ul>
          <p style={{ color: '#334155', marginTop: '0.85rem' }}>
            {INSTITUTION_CONFIG.name} does not sell, rent, or commercialize student personal information to any third parties or advertising brokers.
          </p>
        </section>

        {/* Section 4 */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, marginTop: 0, borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
            4. Information Security & Protection
          </h2>
          <p style={{ color: '#334155', marginBottom: '0.75rem' }}>
            We implement comprehensive organizational, technical, and administrative measures designed to safeguard student records and personal information against unauthorized access, loss, misuse, or alteration.
          </p>
          <ul style={{ color: '#334155', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Encrypted Communications:</strong> All network traffic across our web and mobile services is protected with standard end-to-end cryptographic encryption.</li>
            <li><strong>Controlled Access:</strong> Institutional systems enforce strict role-based access controls, ensuring only authorized personnel access records on a verified need-to-know basis.</li>
            <li><strong>Account Integrity:</strong> Secure authentication mechanisms are enforced to protect student and staff accounts from unauthorized access.</li>
            <li><strong>Continuous Safeguards:</strong> Regular security audits, software updates, and routine backups are conducted to maintain service resilience.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, marginTop: 0, borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
            5. Student Rights & Data Inquiries
          </h2>
          <p style={{ color: '#334155' }}>
            Students maintain the right to review their official academic records, request profile corrections, or submit inquiries regarding institutional data practices. Inquiries may be directed to the Office of the Registrar at <strong>{INSTITUTION_CONFIG.contact.email}</strong> or via official student support desk hotlines.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '2rem 1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} {INSTITUTION_CONFIG.name} • Directorate of Academic Affairs & Compliance. All Rights Reserved.
      </footer>
    </div>
  )
}
