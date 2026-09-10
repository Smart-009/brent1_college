import { FC } from 'react'
import type { IGCSEStatementOfResults } from '@/types/school'
import { INSTITUTION_CONFIG } from '@/config/institution'

interface IGCSEStatementOfResultsProps {
  statement: IGCSEStatementOfResults
  onClose: () => void
}

export const IGCSEStatementOfResultsModal: FC<IGCSEStatementOfResultsProps> = ({ statement, onClose }) => {
  const handlePrint = () => {
    window.print()
  }

  const iceColor =
    statement.ice_award === 'Distinction'
      ? '#059669'
      : statement.ice_award === 'Merit'
      ? '#0284c7'
      : statement.ice_award === 'Pass'
      ? '#d97706'
      : '#6b7280'

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '920px', maxHeight: '94vh', overflowY: 'auto', padding: 0 }}
      >
        {/* Toolbar Header (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            padding: '1rem 1.5rem',
            background: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🇬🇧</span>
            <div>
              <strong style={{ fontSize: '1rem', display: 'block' }}>Official Cambridge IGCSE Statement of Results</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Center No: {statement.center_number} • Candidate: {statement.candidate_number} • {statement.examination_series}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              style={{ fontWeight: 700, minHeight: '38px', padding: '0.45rem 0.9rem' }}
            >
              🖨️ Print / Save PDF
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ fontWeight: 700, minHeight: '38px', padding: '0.45rem 0.9rem' }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Official Cambridge Statement Body */}
        <div
          id="igcse-statement-sheet"
          style={{
            padding: 'clamp(1.25rem, 3.5vw, 2.5rem)',
            background: '#ffffff',
            color: '#0f172a',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              borderBottom: '2px solid #0f172a',
              paddingBottom: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '8px',
                    background: '#0f172a',
                    color: '#d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.5rem',
                    fontFamily: 'serif',
                  }}
                >
                  É
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                    {statement.center_name}
                  </h1>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                    BRITISH CURRICULUM & INTERNATIONAL EXAMINATIONS CENTRE
                  </p>
                </div>
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Accredited Exam Venue for Cambridge Assessment International Education (CAIE) & Pearson Edexcel
              </p>
            </div>

            <div style={{ textAlign: 'right', borderLeft: '2px solid #e2e8f0', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
                Statement Document
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>
                IGCSE RESULTS
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>
                Series: <strong>{statement.examination_series}</strong>
              </div>
            </div>
          </div>

          {/* Candidate Bio Information Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem 1.25rem',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase' }}>Candidate Name</span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{statement.candidate_name}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase' }}>Center / Candidate No</span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                {statement.center_number} / {statement.candidate_number}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase' }}>Date of Birth / Gender</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{statement.date_of_birth} • {statement.gender}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase' }}>Unique Candidate ID</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#0284c7' }}>{statement.candidate_unique_id}</span>
            </div>
          </div>

          {/* Cambridge ICE Diploma Banner (If Eligible) */}
          {statement.ice_award !== 'Not Eligible' && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                background: '#f0fdf4',
                border: `1.5px solid ${iceColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🎖️</span>
                <div>
                  <strong style={{ color: iceColor, fontSize: '0.95rem' }}>
                    CAMBRIDGE ICE DIPLOMA: {statement.ice_award.toUpperCase()}
                  </strong>
                  <div style={{ fontSize: '0.78rem', color: '#166534' }}>
                    Candidate satisfied Cambridge International Certificate of Education requirements across 5 curriculum groups.
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: iceColor }}>
                Overall Mean Points: {statement.mean_points.toFixed(2)} / 9.00
              </div>
            </div>
          )}

          {/* Subject Results Table */}
          <div style={{ marginBottom: '1.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table
              style={{
                width: '100%',
                minWidth: '640px',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '0.65rem 0.75rem', border: '1px solid #0f172a' }}>Code</th>
                  <th style={{ padding: '0.65rem 0.75rem', border: '1px solid #0f172a' }}>Syllabus Title & Components</th>
                  <th style={{ padding: '0.65rem 0.75rem', border: '1px solid #0f172a', textAlign: 'center' }}>Tier</th>
                  <th style={{ padding: '0.65rem 0.75rem', border: '1px solid #0f172a', textAlign: 'center' }}>Weighted %</th>
                  <th style={{ padding: '0.65rem 0.75rem', border: '1px solid #0f172a', textAlign: 'center' }}>Grade (9-1)</th>
                  <th style={{ padding: '0.65rem 0.75rem', border: '1px solid #0f172a', textAlign: 'center' }}>A*-G Equivalent</th>
                  <th style={{ padding: '0.65rem 0.75rem', border: '1px solid #0f172a', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {statement.results.map((r, idx) => (
                  <tr
                    key={r.syllabus_code}
                    style={{
                      background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                      {r.syllabus_code}
                    </td>
                    <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{r.subject_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                        {r.components.map((c) => `${c.paper_number}: ${c.raw_mark}/${c.max_mark} (${c.weight_percentage}%)`).join(' • ')}
                      </div>
                      {r.examiner_feedback && (
                        <div style={{ fontSize: '0.73rem', color: '#475569', fontStyle: 'italic', marginTop: '0.25rem' }}>
                          Note: {r.examiner_feedback}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: r.tier === 'Extended' ? '#eff6ff' : '#fef3c7',
                          color: r.tier === 'Extended' ? '#1d4ed8' : '#92400e',
                        }}
                      >
                        {r.tier}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700 }}>
                      {r.weighted_percentage}%
                    </td>
                    <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                      {r.grade_9to1}
                    </td>
                    <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>
                      {r.grade_AtoG}
                    </td>
                    <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          background: r.status === 'Pass' ? '#dcfce7' : '#fee2e2',
                          color: r.status === 'Pass' ? '#15803d' : '#b91c1c',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Explanatory Notes on 9-1 and A*-G Scale */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#475569',
              marginBottom: '1.5rem',
            }}
          >
            <strong>Explanatory Grading Guide:</strong> Grade 9 represents exceptional performance above Grade 8 (A*).
            Grade 7 aligns with Grade A; Grade 4 represents a Standard Pass (Grade C); Grade 5 represents a Strong Pass (Grade B).
            Grades 9 to 1 are reported on the national 9-1 qualification framework. Performance below minimum standard is reported as Ungraded (U).
          </div>

          {/* Institutional Signatures & Verification */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#1e293b' }}>Dr. M. Davies</span>
              </div>
              <div style={{ width: '180px', borderTop: '1px solid #0f172a', margin: '0.2rem 0' }}></div>
              <strong>Dr. Michael Davies</strong>
              <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Center Examinations Officer</div>
            </div>

            {/* Official Center Stamp Seal */}
            <div
              style={{
                width: '90px',
                height: '90px',
                border: '2px dashed #0284c7',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                fontSize: '0.65rem',
                fontWeight: 800,
                textAlign: 'center',
                padding: '0.25rem',
              }}
            >
              <span>ÉCLAT INST.</span>
              <span style={{ fontSize: '0.8rem' }}>★ KE042 ★</span>
              <span>VERIFIED</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#1e293b' }}>Prof. E. Thorne</span>
              </div>
              <div style={{ width: '180px', borderTop: '1px solid #0f172a', margin: '0.2rem 0' }}></div>
              <strong>Head of Center / Principal</strong>
              <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Date: {new Date(statement.issued_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Secure Online Verification Footer */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px dashed #cbd5e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              color: '#64748b',
            }}
          >
            <span>
              Official Academic Transcript • Verification Code:{' '}
              <strong style={{ color: '#0f172a' }}>{statement.verification_code}</strong>
            </span>
            <span>Verify online at: {INSTITUTION_CONFIG.websiteUrl}/verify</span>
          </div>
        </div>
      </div>
    </div>
  )
}
