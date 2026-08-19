import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { schoolStore } from '@/lib/schoolData'
import type { AcademicResource } from '@/types/school'

const CATEGORIES = ['All', 'Past Papers', 'Revision Notes', 'Textbooks', 'Syllabus', 'Lab Manuals']

export function ResourceLibrary() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const isStudent = profile?.role === 'student' || profile?.role === 'parent'

  // Dynamically load subjects from store
  const storeSubjects = useMemo(() => schoolStore.getSubjects().map((s) => s.name), [])
  const dynamicSubjects = useMemo(() => ['All', ...storeSubjects], [storeSubjects])

  const [resources, setResources] = useState<AcademicResource[]>(() => schoolStore.getResources())
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('All')
  const [selectedSub, setSelectedSub] = useState('All')

  // E-Reader Modal State
  const [readingResource, setReadingResource] = useState<AcademicResource | null>(null)
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal')
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light')
  const [currentPage, setCurrentPage] = useState(1)

  // Upload Modal State (for admin only)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<AcademicResource['category']>('Past Papers')
  const [newSubject, setNewSubject] = useState(storeSubjects[0] || 'General Studies')
  const [newClassLevel, setNewClassLevel] = useState('Short Course / Certificate')
  const [newYear, setNewYear] = useState(2025)

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchSearch =
        res.title.toLowerCase().includes(search.toLowerCase()) ||
        res.subject.toLowerCase().includes(search.toLowerCase()) ||
        res.uploaded_by.toLowerCase().includes(search.toLowerCase())

      const matchCat = selectedCat === 'All' || res.category === selectedCat
      const matchSub = selectedSub === 'All' || res.subject.toLowerCase().includes(selectedSub.toLowerCase())

      return matchSearch && matchCat && matchSub
    })
  }, [resources, search, selectedCat, selectedSub])

  const handleOpenReader = (res: AcademicResource) => {
    // Increment read counter
    const updated = resources.map((r) => (r.id === res.id ? { ...r, downloads_count: (r.downloads_count || 0) + 1 } : r))
    setResources(updated)
    setReadingResource(res)
    setCurrentPage(1)
  }

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      alert('Access Restricted: Only Administrators are authorized to upload learning materials and resources.')
      return
    }
    if (!newTitle.trim()) return

    const item: AcademicResource = {
      id: `res-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      subject: newSubject,
      class_level: newClassLevel,
      file_url: 'https://brentcollege.internal/docs/' + encodeURIComponent(newTitle),
      file_size: '2.4 MB',
      file_type: 'PDF',
      downloads_count: 0,
      year: Number(newYear) || 2025,
      uploaded_by: profile?.full_name || 'Academic Administrator',
      created_at: new Date().toISOString(),
    }

    await schoolStore.addResource(item)
    setResources(schoolStore.getResources())
    setShowUploadModal(false)
    setNewTitle('')
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>📖 Digital E-Library & Past Papers Hub</h1>
            {!isAdmin && (
              <span className="badge badge-info" style={{ fontWeight: 700 }}>
                🔒 Read-Only Access
              </span>
            )}
          </div>
          <p className="page-subtitle">
            {isAdmin
              ? 'Administrator Console: Curate, upload, and publish short course past examination papers and modular learning resources for trainees.'
              : 'Institutional short course past papers, marking schemes, revision handbooks, and modular lab manuals for online reading.'}
          </p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              + Upload Academic E-Resource
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-6" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="label" style={{ fontSize: '0.75rem' }}>Search E-Library</label>
            <input
              type="text"
              className="input"
              placeholder="Search past exam questions, manuals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="label" style={{ fontSize: '0.75rem' }}>Resource Type</label>
            <select
              className="input"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" style={{ fontSize: '0.75rem' }}>Subject Discipline</label>
            <select
              className="input"
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
            >
              {dynamicSubjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '3.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No E-Library Documents Found</h3>
            <p style={{ fontSize: '0.85rem' }}>
              {isStudent
                ? 'Your instructors have not published past papers or notes for this category yet.'
                : 'Upload past papers, revision notes, or lab guides using the button above.'}
            </p>
          </div>
        ) : (
          filteredResources.map((res) => (
            <div
              key={res.id}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary" style={{ fontWeight: 700 }}>{res.category}</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{res.file_type} • {res.file_size}</span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-primary)', lineHeight: 1.35 }}>
                  {res.title}
                </h3>

                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div>📚 <strong>Discipline:</strong> {res.subject}</div>
                  <div>🎯 <strong>Level:</strong> {res.class_level}</div>
                  <div>👨‍🏫 <strong>Uploaded by:</strong> {res.uploaded_by}</div>
                  <div>👁️ <strong>Readings:</strong> {res.downloads_count || 0} students</div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {res.year ? `Examination Year ${res.year}` : 'Active Edition'}
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenReader(res)}
                >
                  📖 Open & Read Online
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Read-Only Document Reader Modal */}
      {readingResource && (
        <div className="modal-overlay" onClick={() => setReadingResource(null)}>
          <div
            className="modal-content modal-xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: readerTheme === 'dark' ? '#0f172a' : readerTheme === 'sepia' ? '#fdf6e2' : '#ffffff',
              color: readerTheme === 'dark' ? '#f8fafc' : '#1e293b',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '92vh',
              height: '92vh',
              borderRadius: '12px',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            {/* Top Reader Toolbar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                borderBottom: `1px solid ${readerTheme === 'dark' ? '#334155' : '#e2e8f0'}`,
                background: readerTheme === 'dark' ? '#1e293b' : '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem' }}>📄</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: readerTheme === 'dark' ? '#93c5fd' : '#1e3a8a' }}>
                    {readingResource.title}
                  </h3>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {readingResource.category} • {readingResource.subject} ({readingResource.year || '2025'})
                  </div>
                </div>
              </div>

              {/* Reader Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* DRM Badge */}
                <span
                  style={{
                    background: readerTheme === 'dark' ? '#334155' : '#f1f5f9',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#ea580c',
                  }}
                >
                  🔒 Read-Only Mode
                </span>

                {/* Font Size Selector */}
                <div style={{ display: 'flex', gap: '2px', background: readerTheme === 'dark' ? '#0f172a' : '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    style={{ background: readerFontSize === 'normal' ? 'var(--color-primary)' : 'transparent', color: readerFontSize === 'normal' ? '#fff' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    onClick={() => setReaderFontSize('normal')}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    style={{ background: readerFontSize === 'large' ? 'var(--color-primary)' : 'transparent', color: readerFontSize === 'large' ? '#fff' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                    onClick={() => setReaderFontSize('large')}
                  >
                    A+
                  </button>
                  <button
                    type="button"
                    style={{ background: readerFontSize === 'xlarge' ? 'var(--color-primary)' : 'transparent', color: readerFontSize === 'xlarge' ? '#fff' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 800 }}
                    onClick={() => setReaderFontSize('xlarge')}
                  >
                    A++
                  </button>
                </div>

                {/* Theme Selector */}
                <div style={{ display: 'flex', gap: '2px', background: readerTheme === 'dark' ? '#0f172a' : '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    style={{ background: readerTheme === 'light' ? '#fff' : 'transparent', color: readerTheme === 'light' ? '#000' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    onClick={() => setReaderTheme('light')}
                    title="Light Theme"
                  >
                    ☀️ Light
                  </button>
                  <button
                    type="button"
                    style={{ background: readerTheme === 'sepia' ? '#fdf6e2' : 'transparent', color: readerTheme === 'sepia' ? '#78350f' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    onClick={() => setReaderTheme('sepia')}
                    title="Sepia Paper Theme"
                  >
                    📜 Sepia
                  </button>
                  <button
                    type="button"
                    style={{ background: readerTheme === 'dark' ? '#334155' : 'transparent', color: readerTheme === 'dark' ? '#fff' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    onClick={() => setReaderTheme('dark')}
                    title="Night Mode"
                  >
                    🌙 Dark
                  </button>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  style={{ position: 'static', color: 'inherit' }}
                  onClick={() => setReadingResource(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Content Viewport */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '2.5rem 3.5rem',
                fontSize: readerFontSize === 'xlarge' ? '1.25rem' : readerFontSize === 'large' ? '1.1rem' : '0.95rem',
                lineHeight: 1.8,
                maxWidth: '900px',
                margin: '0 auto',
                width: '100%',
                userSelect: 'none', // Prevents unauthorized copy-paste in read-only mode
              }}
            >
              {/* Document Header */}
              <div style={{ textAlign: 'center', borderBottom: `2px dashed ${readerTheme === 'dark' ? '#334155' : '#cbd5e1'}`, paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  BRENT COLLEGE — PROFESSIONAL SHORT COURSES DIRECTORY
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.35rem 0' }}>
                  {readingResource.subject} • {readingResource.category} ({readingResource.year || '2025/2026'})
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  Curated by Faculty Instructor: <strong>{readingResource.uploaded_by}</strong> • Read-Only Reference
                </div>
              </div>

              {/* Document Body (Simulated Academic Content & Past Examination Sections) */}
              {currentPage === 1 && (
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid var(--color-primary)', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
                    SECTION A: CORE CONCEPTS & COMPULSORY PRINCIPLES (40 MARKS)
                  </h2>
                  <p>
                    <strong>Question 1 (10 Marks):</strong><br />
                    Explain the fundamental system architecture of modern cloud-native web systems. Describe the functional distinction between reactive client-side rendering (CSR) and server-side state machines with transactional ACID compliance.
                  </p>
                  <p>
                    <strong>Question 2 (15 Marks):</strong><br />
                    A vocational enterprise software project requires an in-memory L1 cache layer combined with persistent local write-ahead journals. Construct the data flow sequence illustrating how state synchronization occurs during high-concurrency operations.
                  </p>
                  <p>
                    <strong>Question 3 (15 Marks):</strong><br />
                    Outline the step-by-step procedure for conducting modular curriculum assessment in a TVET technical institution. Highlight the validation protocols for continuous laboratory projects versus summative certification exams.
                  </p>
                </div>
              )}

              {currentPage === 2 && (
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid #16a34a', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
                    SECTION B: PRACTICAL IMPLEMENTATION & CASE STUDIES (60 MARKS)
                  </h2>
                  <p>
                    <strong>Question 4 (30 Marks): Practical System Design</strong><br />
                    Given a scenario where a vocational college delivers fast-track 1-month to 6-month short courses, design a normalized data schema and role-gated access control matrix protecting video tutorials and laboratory notes for tuition-cleared students only.
                  </p>
                  <p>
                    <strong>Question 5 (30 Marks): Examination Marking Scheme & Solutions</strong><br />
                    Provide the step-by-step scoring breakdown for:
                  </p>
                  <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                    <li>1. Database Transaction isolation level validation (10 Marks)</li>
                    <li>2. Offline PWA caching strategy & Service Worker lifecycle (10 Marks)</li>
                    <li>3. Responsive typography and accessible UI state transitions (10 Marks)</li>
                  </ul>
                </div>
              )}

              {currentPage === 3 && (
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid #7c3aed', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
                    APPENDIX & LECTURER REVISION NOTES
                  </h2>
                  <div style={{ background: readerTheme === 'dark' ? '#1e293b' : '#f8fafc', border: `1px solid ${readerTheme === 'dark' ? '#334155' : '#e2e8f0'}`, borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>Instructor's Study Guide</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
                      "Students are advised to review all modular syllabus units before attempting past paper mock tests. Focus especially on practical code challenges and continuous assessment assignments."
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', opacity: 0.7, fontSize: '0.8rem', marginTop: '2rem' }}>
                    — END OF DOCUMENT — <br />
                    Brent College Directorate of Academic Resources
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Pagination Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                borderTop: `1px solid ${readerTheme === 'dark' ? '#334155' : '#e2e8f0'}`,
                background: readerTheme === 'dark' ? '#1e293b' : '#f8fafc',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Previous Page
              </button>

              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Page {currentPage} of 3
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 3}
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              >
                Next Page →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal (Faculty Only) */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload Academic E-Resource</h3>
              <button type="button" className="modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUploadResource}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="label">Resource Title *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. 2025 Web Systems Final Examination & Marking Scheme"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="label">Category *</label>
                    <select
                      className="input"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                    >
                      <option value="Past Papers">Past Papers</option>
                      <option value="Revision Notes">Revision Notes</option>
                      <option value="Lab Manuals">Lab Manuals</option>
                      <option value="Syllabus">Syllabus</option>
                      <option value="Textbooks">Textbooks</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Examination Year</label>
                    <input
                      type="number"
                      className="input"
                      value={newYear}
                      onChange={(e) => setNewYear(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Subject Discipline</label>
                  <select className="input" value={newSubject} onChange={(e) => setNewSubject(e.target.value)}>
                    {storeSubjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Class / Target Level</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 3 Months Short Course / Certificate"
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">✓ Publish to E-Library</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
