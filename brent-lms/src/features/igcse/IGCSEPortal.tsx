import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { schoolStore } from '@/lib/schoolData'
import { INSTITUTION_CONFIG } from '@/config/institution'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { IGCSEStatementOfResultsModal } from '@/features/exams/IGCSEStatementOfResults'
import type { IGCSEStatementOfResults } from '@/types/school'
import {
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  FileTextIcon,
  LibraryIcon,
} from '@/components/icons/AppIcons'

interface IGCSEPortalSubject {
  code: string
  name: string
  board: 'Cambridge CAIE' | 'Pearson Edexcel'
  syllabusCode: string
  keyStage: string
  papers: string[]
  level: string
}

const IGCSE_SUBJECTS: IGCSEPortalSubject[] = [
  {
    code: '0580',
    name: 'Mathematics (Core & Extended)',
    board: 'Cambridge CAIE',
    syllabusCode: '0580',
    keyStage: 'Years 10 - 11',
    papers: ['Paper 2 (Extended Theory - 1h 30m)', 'Paper 4 (Structured Problems - 2h 30m)'],
    level: 'IGCSE (9-1 / A*-G)',
  },
  {
    code: '0625',
    name: 'Physics (Pure Science)',
    board: 'Cambridge CAIE',
    syllabusCode: '0625',
    keyStage: 'Years 10 - 11',
    papers: ['Paper 2 (Multiple Choice)', 'Paper 4 (Extended Theory)', 'Paper 6 (Alternative to Practical)'],
    level: 'IGCSE (9-1 / A*-G)',
  },
  {
    code: '0620',
    name: 'Chemistry (Pure Science)',
    board: 'Cambridge CAIE',
    syllabusCode: '0620',
    keyStage: 'Years 10 - 11',
    papers: ['Paper 2 (Multiple Choice)', 'Paper 4 (Extended Theory)', 'Paper 6 (Alternative to Practical)'],
    level: 'IGCSE (9-1 / A*-G)',
  },
  {
    code: '0610',
    name: 'Biology (Pure Science)',
    board: 'Cambridge CAIE',
    syllabusCode: '0610',
    keyStage: 'Years 10 - 11',
    papers: ['Paper 2 (Multiple Choice)', 'Paper 4 (Extended Theory)', 'Paper 6 (Alternative to Practical)'],
    level: 'IGCSE (9-1 / A*-G)',
  },
  {
    code: '0478',
    name: 'Computer Science & Python',
    board: 'Cambridge CAIE',
    syllabusCode: '0478',
    keyStage: 'Years 10 - 11',
    papers: ['Paper 1 (Computer Systems - 1h 45m)', 'Paper 2 (Algorithms & Programming - 1h 45m)'],
    level: 'IGCSE (9-1 / A*-G)',
  },
  {
    code: '0500',
    name: 'First Language English',
    board: 'Cambridge CAIE',
    syllabusCode: '0500',
    keyStage: 'Years 10 - 11',
    papers: ['Paper 1 (Reading & Summary - 2h)', 'Paper 2 (Directed Writing & Composition - 2h)'],
    level: 'IGCSE (9-1 / A*-G)',
  },
  {
    code: '0450',
    name: 'Business Studies',
    board: 'Cambridge CAIE',
    syllabusCode: '0450',
    keyStage: 'Years 10 - 11',
    papers: ['Paper 1 (Short Answer/Data Response - 1h 30m)', 'Paper 2 (Case Study - 1h 30m)'],
    level: 'IGCSE (9-1 / A*-G)',
  },
  {
    code: '4MA1',
    name: 'Mathematics A (Higher Tier)',
    board: 'Pearson Edexcel',
    syllabusCode: '4MA1',
    keyStage: 'Years 10 - 11',
    papers: ['Paper 1H (Higher Tier - 2h)', 'Paper 2H (Higher Tier - 2h)'],
    level: 'International GCSE (9-1)',
  },
  {
    code: '4CP0',
    name: 'Computer Science (Onscreen Python)',
    board: 'Pearson Edexcel',
    syllabusCode: '4CP0',
    keyStage: 'Years 10 - 11',
    papers: ['Paper 1 (Principles of Computer Science)', 'Paper 2 (Application of Computational Thinking)'],
    level: 'International GCSE (9-1)',
  },
]

export function IGCSEPortal() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'results' | 'timetable'>('overview')
  const [searchCandidate, setSearchCandidate] = useState(profile?.admission_number || '')
  const [selectedStatement, setSelectedStatement] = useState<IGCSEStatementOfResults | null>(null)
  const [statementLookupResult, setStatementLookupResult] = useState<IGCSEStatementOfResults | null>(null)
  const [searched, setSearched] = useState(false)

  const igcseStatements = schoolStore.getIGCSEStatements()

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
    const cleanSearch = searchCandidate.trim().toLowerCase()
    if (!cleanSearch) {
      setStatementLookupResult(null)
      return
    }

    const found = igcseStatements.find((s) => {
      const cId = (s.candidate_unique_id || '').toLowerCase()
      const cNum = (s.candidate_number || '').toLowerCase()
      const cName = (s.candidate_name || '').toLowerCase()
      const cCode = (s.verification_code || '').toLowerCase()
      return (
        cId.includes(cleanSearch) ||
        cNum === cleanSearch ||
        cName.includes(cleanSearch) ||
        cCode === cleanSearch
      )
    })
    setStatementLookupResult(found || null)
  }

  return (
    <PageWrapper title="Cambridge & Edexcel IGCSE Portal">
      {/* Official Examination Center Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #31104b 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 4vw, 2.25rem)',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🏛️</span>
              <span
                style={{
                  background: 'rgba(217, 119, 6, 0.25)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  color: '#fef08a',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                Accredited International Examination Center
              </span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 0.5rem 0',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.02em',
              }}
            >
              Cambridge & Pearson Edexcel IGCSE Portal
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', maxWidth: '640px', lineHeight: 1.5, margin: 0 }}>
              Official candidate workstation for Cambridge Assessment International Education (CAIE) and Pearson Edexcel International GCSE qualification tracks.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '0.85rem 1.25rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Center Identifiers
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.2rem' }}>
              CAIE: {INSTITUTION_CONFIG.igcse.centerNumber || 'KE042'}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fca5a5', marginTop: '0.15rem' }}>
              Pearson Edexcel: EDX-98421
            </div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.35rem' }}>
              Series: {INSTITUTION_CONFIG.igcse.currentSeries || 'May/June 2026'}
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { id: 'overview', label: 'Candidate Overview', icon: '🏛️' },
            { id: 'results', label: 'Official Statement of Results', icon: '📜' },
            { id: 'syllabus', label: 'Syllabus & Subjects', icon: '📚' },
            { id: 'timetable', label: 'Exam Series Timetables', icon: '📅' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                border: activeTab === tab.id ? '1px solid #38bdf8' : '1px solid transparent',
                background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Quick Access Card 1: Statement of Results */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: '14px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
                📜
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
                Official Statement of Results
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                Access verified CAIE & Pearson Edexcel Statement of Results with syllabus grades (9-1 / A*-G), component scores, and Cambridge ICE Diploma awards.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab('results')}
              style={{ fontWeight: 800, padding: '0.65rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
            >
              <FileTextIcon size={16} />
              <span>Verify & View Results →</span>
            </button>
          </div>

          {/* Quick Access Card 2: Revision & Past Papers */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: '14px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
                📖
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
                IGCSE Past Papers & Mark Schemes
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                Download official past examination series papers (2018 - 2025), specimen papers, examiner reports, and detailed marking schemes.
              </p>
            </div>
            <Link
              to="/library"
              className="btn btn-secondary"
              style={{ fontWeight: 800, padding: '0.65rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', textDecoration: 'none' }}
            >
              <LibraryIcon size={16} />
              <span>Open IGCSE E-Library →</span>
            </Link>
          </div>

          {/* Quick Access Card 3: Key Stage Syllabuses */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: '14px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
                🎓
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
                Cambridge & Edexcel Curriculum
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                Explore the official syllabus specifications for Lower Secondary (Checkpoint Year 9) and International GCSE (Years 10 & 11).
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('syllabus')}
              style={{ fontWeight: 800, padding: '0.65rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
            >
              <BookOpenIcon size={16} />
              <span>Explore Syllabus Specs →</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL STATEMENT OF RESULTS */}
      {activeTab === 'results' && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', borderRadius: '14px', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
              Candidate Statement of Results Search & Verification
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 1.25rem 0' }}>
              Enter candidate name, unique candidate ID (e.g. KE042/0001/2026), or verification code to look up official CAIE / Pearson Edexcel transcripts.
            </p>

            <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="input"
                value={searchCandidate}
                onChange={(e) => setSearchCandidate(e.target.value)}
                placeholder="Enter candidate name or number (e.g. KE042/0001/2026)..."
                style={{ flex: 1, minWidth: '240px', padding: '0.7rem 0.9rem' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontWeight: 800, padding: '0.7rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>🔍</span>
                <span>Lookup Results</span>
              </button>
            </form>
          </div>

          {searched && (
            <div>
              {statementLookupResult ? (
                <div
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '14px',
                    border: '1.5px solid #0284c7',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span className="badge badge-success" style={{ fontWeight: 700, marginBottom: '0.4rem', display: 'inline-block' }}>
                      ✓ Verified Official Examination Record
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0' }}>
                      {statementLookupResult.candidate_name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Board: <strong>{statementLookupResult.examination_board}</strong> • Unique ID: <strong>{statementLookupResult.candidate_unique_id}</strong> • Series: <strong>{statementLookupResult.examination_series}</strong>
                    </p>
                    <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                        {statementLookupResult.total_subjects} Subjects Examined
                      </span>
                      {statementLookupResult.ice_award && (
                        <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                          ICE Award: {statementLookupResult.ice_award}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setSelectedStatement(statementLookupResult)}
                    style={{ fontWeight: 800, padding: '0.75rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <AwardIcon size={16} />
                    <span>View Official Statement of Results</span>
                  </button>
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    padding: '2.5rem',
                    borderRadius: '14px',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>📭</div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.3rem 0', color: 'var(--color-text)' }}>
                    No Official Statement Found
                  </h4>
                  <p style={{ fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.5 }}>
                    No published statement matches the search query. Official statements are issued following the international examination series grading window.
                  </p>
                </div>
              )}
            </div>
          )}

          {!searched && (
            <div
              className="card"
              style={{
                padding: '2.5rem',
                borderRadius: '14px',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>🇬🇧</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.3rem 0', color: 'var(--color-text)' }}>
                Official Examination Results Portal
              </h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.5 }}>
                Enter your candidate number above to view your statement of results, or contact the Éclat Institute Examination Officer for certification queries.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SYLLABUS & SUBJECTS */}
      {activeTab === 'syllabus' && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {IGCSE_SUBJECTS.map((sub) => (
              <div
                key={sub.code}
                className="card"
                style={{
                  padding: '1.35rem',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: sub.board === 'Cambridge CAIE' ? '#e0f2fe' : '#fee2e2',
                        color: sub.board === 'Cambridge CAIE' ? '#0369a1' : '#991b1b',
                      }}
                    >
                      {sub.board}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                      Code: {sub.syllabusCode}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.2rem 0 0.4rem 0' }}>
                    {sub.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    Level: <strong>{sub.level}</strong> • Key Stage: <strong>{sub.keyStage}</strong>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.65rem' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                      Components / Papers Examined:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
                      {sub.papers.map((p, pIdx) => (
                        <li key={pIdx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ marginTop: '1.1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link
                    to={`/courses?cat=IGCSE`}
                    style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}
                  >
                    View Course Details →
                  </Link>
                  <Link
                    to={`/library`}
                    style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Past Papers ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TIMETABLE & SERIES */}
      {activeTab === 'timetable' && (
        <div className="card" style={{ padding: '1.5rem', borderRadius: '14px', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
            International Examination Series Timetable & Session Windows
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 1.25rem 0' }}>
            Official exam administration schedule across CAIE and Pearson Edexcel testing sessions.
          </p>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Series</th>
                  <th>Session Window</th>
                  <th>Morning Session (AM)</th>
                  <th>Afternoon Session (PM)</th>
                  <th>Accreditation & Regulation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>May / June 2026</td>
                  <td>27 April 2026 – 12 June 2026</td>
                  <td>09:00 AM EAT (Strict Seating)</td>
                  <td>02:00 PM EAT (Strict Seating)</td>
                  <td><span className="badge badge-success">CAIE & Edexcel Approved</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>October / November 2026</td>
                  <td>01 October 2026 – 17 November 2026</td>
                  <td>09:00 AM EAT (Strict Seating)</td>
                  <td>02:00 PM EAT (Strict Seating)</td>
                  <td><span className="badge badge-success">CAIE & Edexcel Approved</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
            <strong style={{ color: '#0f172a' }}>Examination Room Regulations:</strong> Candidates must report 30 minutes prior to session start. Candidate statements and valid identification required for hall entry. Electronic communication devices strictly prohibited in the exam hall.
          </div>
        </div>
      )}

      {/* Statement Modal */}
      {selectedStatement && (
        <IGCSEStatementOfResultsModal
          statement={selectedStatement}
          onClose={() => setSelectedStatement(null)}
        />
      )}
    </PageWrapper>
  )
}
