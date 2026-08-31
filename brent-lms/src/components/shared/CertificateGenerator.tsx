export interface CertificateData {
  student_name: string
  admission_number: string
  course_title: string
  grade: string
  percentage: number
  issue_date: string
  certificate_no: string
  duration?: string
  trainer_name?: string
  skills_acquired?: string[]
}

export function CertificateGenerator({
  cert,
  onClose,
}: {
  cert: CertificateData
  onClose: () => void
}) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1300 }}>
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          maxHeight: '94vh',
          overflowY: 'auto',
          padding: 0,
          background: '#f8fafc',
          borderRadius: '16px',
        }}
      >
        {/* Top Actions (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            padding: '1rem 1.75rem',
            background: '#090d16',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🎓</span>
            <div>
              <strong style={{ fontSize: '1rem', color: '#ffffff' }}>Official Professional Certificate of Completion</strong>
              <div style={{ fontSize: '0.78rem', color: '#93c5fd' }}>Verified Institutional Credential • 100% Online Global Academy</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ fontWeight: 800, padding: '0.5rem 1.25rem', background: '#2563eb' }}
            >
              🖨️ Print Certificate / Save as PDF
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ fontWeight: 700, background: '#334155', color: '#ffffff' }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Certificate Canvas */}
        <div
          id="official-certificate-document"
          style={{
            padding: '2.5rem',
            background: '#ffffff',
            margin: '1.25rem',
            borderRadius: '12px',
            border: '8px double #1e3a8a',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Inner Decorative Gold Border */}
          <div
            style={{
              border: '2px solid #d97706',
              padding: '2rem',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            {/* College Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img
                src="/logo.png"
                alt="Eclat Institute Crest"
                style={{ width: '70px', height: '70px', objectFit: 'contain', marginBottom: '0.5rem' }}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  color: '#1e3a8a',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                ÉCLAT INSTITUTE
              </h1>
              <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700, letterSpacing: '0.08em', marginTop: '2px' }}>
                GLOBAL ONLINE ACADEMY FOR TECH & MODERN LANGUAGES
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                100% Online Learning • Web: eclat.institute • Tel: +254 740 027 346
              </div>
            </div>

            {/* Certificate Title */}
            <div style={{ margin: '1.5rem 0 1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                THIS IS TO CERTIFY THAT
              </div>
              <h2
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  color: '#090d16',
                  margin: '0.5rem 0',
                  textDecoration: 'underline',
                  textDecorationColor: '#d97706',
                  textUnderlineOffset: '6px',
                }}
              >
                {cert.student_name}
              </h2>
              <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>
                Admission Number: <span style={{ color: '#1e3a8a' }}>{cert.admission_number}</span>
              </div>
            </div>

            <p style={{ fontSize: '1rem', color: '#1e293b', maxWidth: '650px', margin: '1rem auto 1.5rem', lineHeight: 1.6 }}>
              has successfully satisfied all practical laboratory competencies, workshop training modules, and continuous hands-on evaluations in:
            </p>

            {/* Awarded Course Box */}
            <div
              style={{
                background: '#eff6ff',
                border: '2px solid #3b82f6',
                borderRadius: '10px',
                padding: '1rem 1.5rem',
                display: 'inline-block',
                marginBottom: '1.5rem',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  color: '#1e3a8a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                {cert.course_title}
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 800, marginTop: '4px' }}>
                Attainment: {cert.grade} ({cert.percentage}%) • Duration: {cert.duration || '4 to 12 Weeks Practical'}
              </div>
            </div>

            {/* Skills Acquired List */}
            {cert.skills_acquired && cert.skills_acquired.length > 0 && (
              <div style={{ maxWidth: '600px', margin: '0 auto 1.75rem', fontSize: '0.82rem', color: '#475569' }}>
                <strong>Key Verified Competencies:</strong> {cert.skills_acquired.join(' • ')}
              </div>
            )}

            {/* Signatures & Seal Section */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px 1fr',
                alignItems: 'center',
                gap: '1.5rem',
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px dashed #cbd5e1',
              }}
            >
              {/* Trainer Signature */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontStyle: 'italic', fontFamily: 'cursive', fontSize: '1.25rem', color: '#1e3a8a', marginBottom: '2px' }}>
                  {cert.trainer_name || 'Lead Vocational Instructor'}
                </div>
                <div style={{ borderTop: '1.5px solid #090d16', paddingTop: '4px', fontSize: '0.78rem', fontWeight: 800, color: '#090d16' }}>
                  Lead Technical Trainer / HOD
                </div>
              </div>

              {/* Gold Institutional Seal */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '3px solid #d97706',
                    background: '#fef3c7',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>⭐</span>
                  <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#b45309', textTransform: 'uppercase' }}>SEAL OF</span>
                  <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#b45309', textTransform: 'uppercase' }}>EXCELLENCE</span>
                </div>
              </div>

              {/* Principal Signature */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontStyle: 'italic', fontFamily: 'cursive', fontSize: '1.25rem', color: '#1e3a8a', marginBottom: '2px' }}>
                  Dr. Abdi M. Hassan
                </div>
                <div style={{ borderTop: '1.5px solid #090d16', paddingTop: '4px', fontSize: '0.78rem', fontWeight: 800, color: '#090d16' }}>
                  College Principal & Director
                </div>
              </div>
            </div>

            {/* Bottom Certificate Verification Code */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', fontSize: '0.72rem', color: '#64748b' }}>
              <div>
                <strong>Certificate No:</strong> <code>{cert.certificate_no}</code>
              </div>
              <div>
                <strong>Date of Conferment:</strong> {cert.issue_date}
              </div>
              <div>
                <strong>Delivery Mode:</strong> 100% Online
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
