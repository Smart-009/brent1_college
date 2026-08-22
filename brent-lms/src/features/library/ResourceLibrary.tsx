import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { schoolStore } from '@/lib/schoolData'
import { supabase } from '@/lib/supabase'
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
  const [isUploading, setIsUploading] = useState(false)

  // Fetch live resources from Supabase database on mount
  useEffect(() => {
    let isMounted = true
    async function loadDatabaseResources() {
      try {
        const { data, error } = await supabase
          .from('library_resources')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0 && isMounted) {
          const dbList: AcademicResource[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            subject: d.subject,
            class_level: d.class_level || 'Short Course / Certificate',
            file_url: d.file_url,
            file_size: d.file_size || '1.5 MB',
            file_type: d.file_type || 'PDF',
            downloads_count: d.downloads_count || 0,
            year: d.year || new Date().getFullYear(),
            uploaded_by: d.uploaded_by || 'Academic Administrator',
            created_at: d.created_at || new Date().toISOString(),
          }))

          // Merge with local store to ensure offline and online consistency
          const localList = schoolStore.getResources()
          const combinedMap = new Map<string, AcademicResource>()
          for (const item of localList) combinedMap.set(item.id, item)
          for (const item of dbList) combinedMap.set(item.id, item)
          const merged = Array.from(combinedMap.values())
          setResources(merged)
        }
      } catch {
        // Fallback to local store
      }
    }
    loadDatabaseResources()
    return () => {
      isMounted = false
    }
  }, [])

  // E-Reader Modal State
  const [readingResource, setReadingResource] = useState<AcademicResource | null>(null)
  const [readerMode, setReaderMode] = useState<'document' | 'notes'>('document')
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal')
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light')
  const [currentPage, setCurrentPage] = useState(1)

  // Upload Modal State (for admin only)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<AcademicResource['category']>('Past Papers')
  const [newSubject, setNewSubject] = useState(storeSubjects[0] || 'General Studies')
  const [newClassLevel, setNewClassLevel] = useState('Short Course / Certificate')
  const [newYear, setNewYear] = useState(() => new Date().getFullYear())

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
    // Increment read counter locally & in Supabase
    const nextCount = (res.downloads_count || 0) + 1
    const updated = resources.map((r) => (r.id === res.id ? { ...r, downloads_count: nextCount } : r))
    setResources(updated)
    setReadingResource(res)
    setCurrentPage(1)
    schoolStore.updateResource(res.id, { downloads_count: nextCount }).catch(() => {})
    supabase
      .from('library_resources')
      .update({ downloads_count: nextCount })
      .eq('id', res.id)
      .then(() => {})
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!newTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        setNewTitle(cleanName)
      }
    }
  }

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently remove this resource from the E-Library?')) return
    try {
      await supabase.from('library_resources').delete().eq('id', id)
    } catch {
      // ignore
    }
    await schoolStore.deleteResource(id)
    setResources(schoolStore.getResources())
  }

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      alert('Access Restricted: Only Administrators are authorized to upload learning materials and resources.')
      return
    }
    if (!newTitle.trim()) return

    setIsUploading(true)
    try {
      const fileSizeFormatted = selectedFile
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : '1.8 MB'

      const rawExt = selectedFile ? selectedFile.name.split('.').pop()?.toUpperCase() : 'PDF'
      const fileExt: AcademicResource['file_type'] =
        rawExt === 'DOCX' || rawExt === 'DOC'
          ? 'DOCX'
          : rawExt === 'PPTX' || rawExt === 'PPT'
          ? 'PPTX'
          : rawExt === 'EPUB'
          ? 'EPUB'
          : 'PDF'

      let fileBlobUrl = selectedFile
        ? URL.createObjectURL(selectedFile)
        : 'https://brentcollege.internal/docs/' + encodeURIComponent(newTitle)

      // Upload file directly to Supabase Storage bucket 'library-resources'
      if (selectedFile) {
        try {
          const safeName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`
          const filePath = `documents/${safeName}`
          const { error: storageErr } = await supabase.storage
            .from('library-resources')
            .upload(filePath, selectedFile, {
              contentType: selectedFile.type || 'application/pdf',
              upsert: true,
            })

          if (!storageErr) {
            const { data: publicUrlData } = supabase.storage
              .from('library-resources')
              .getPublicUrl(filePath)
            if (publicUrlData?.publicUrl) {
              fileBlobUrl = publicUrlData.publicUrl
            }
          }
        } catch (uploadErr) {
          console.warn('Storage bucket upload notice:', uploadErr)
        }
      }

      const item: AcademicResource = {
        id: `res-${Date.now()}`,
        title: newTitle.trim(),
        category: newCategory,
        subject: newSubject,
        class_level: newClassLevel,
        file_url: fileBlobUrl,
        file_size: fileSizeFormatted,
        file_type: fileExt,
        downloads_count: 0,
        year: Number(newYear) || new Date().getFullYear(),
        uploaded_by: profile?.full_name || 'Academic Administrator',
        created_at: new Date().toISOString(),
      }

      // Save into Supabase library_resources table
      try {
        await supabase.from('library_resources').insert({
          title: item.title,
          category: item.category,
          subject: item.subject,
          class_level: item.class_level,
          file_url: item.file_url,
          file_name: selectedFile?.name || item.title,
          file_size: item.file_size,
          file_type: item.file_type,
          downloads_count: item.downloads_count,
          year: item.year,
          uploaded_by: item.uploaded_by,
          uploaded_by_id: profile?.id || null,
        })
      } catch (dbErr) {
        console.warn('Supabase DB library insert notice:', dbErr)
      }

      await schoolStore.addResource(item)
      setResources(schoolStore.getResources())
      setShowUploadModal(false)
      setNewTitle('')
      setSelectedFile(null)
    } finally {
      setIsUploading(false)
    }
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
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
            >
              + 📁 Upload Material from Local Storage
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

              <div style={{ marginTop: '1.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {res.year ? `Examination Year ${res.year}` : 'Active Edition'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#dc2626' }}
                      title="Delete Resource"
                      onClick={() => handleDeleteResource(res.id)}
                    >
                      🗑️
                    </button>
                  )}
                  {res.file_url && res.file_url.startsWith('http') && (
                    <a
                      href={res.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Download / Open original file in new tab"
                    >
                      📥 Download
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenReader(res)}
                  >
                    📖 Read Online
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Document Reader & File Viewer Modal */}
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
              maxHeight: '94vh',
              height: '94vh',
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
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem' }}>📄</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: readerTheme === 'dark' ? '#93c5fd' : '#1e3a8a' }}>
                    {readingResource.title}
                  </h3>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {readingResource.category} • {readingResource.subject} ({readingResource.year || new Date().getFullYear()}) • {readingResource.file_type || 'PDF'}
                  </div>
                </div>
              </div>

              {/* Reader Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                {/* View Mode Switcher */}
                <div style={{ display: 'flex', gap: '2px', background: readerTheme === 'dark' ? '#0f172a' : '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    style={{ background: readerMode === 'document' ? 'var(--color-primary)' : 'transparent', color: readerMode === 'document' ? '#fff' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                    onClick={() => setReaderMode('document')}
                  >
                    📄 Original Document
                  </button>
                  <button
                    type="button"
                    style={{ background: readerMode === 'notes' ? 'var(--color-primary)' : 'transparent', color: readerMode === 'notes' ? '#fff' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                    onClick={() => setReaderMode('notes')}
                  >
                    📝 Study Notes
                  </button>
                </div>

                {/* Font Size Selector (for Study Notes) */}
                {readerMode === 'notes' && (
                  <div style={{ display: 'flex', gap: '2px', background: readerTheme === 'dark' ? '#0f172a' : '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                    <button
                      type="button"
                      style={{ background: readerFontSize === 'normal' ? 'var(--color-primary)' : 'transparent', color: readerFontSize === 'normal' ? '#fff' : 'inherit', border: 'none', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem' }}
                      onClick={() => setReaderFontSize('normal')}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      style={{ background: readerFontSize === 'large' ? 'var(--color-primary)' : 'transparent', color: readerFontSize === 'large' ? '#fff' : 'inherit', border: 'none', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                      onClick={() => setReaderFontSize('large')}
                    >
                      A+
                    </button>
                    <button
                      type="button"
                      style={{ background: readerFontSize === 'xlarge' ? 'var(--color-primary)' : 'transparent', color: readerFontSize === 'xlarge' ? '#fff' : 'inherit', border: 'none', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 800 }}
                      onClick={() => setReaderFontSize('xlarge')}
                    >
                      A++
                    </button>
                  </div>
                )}

                {readingResource.file_url && (
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => window.open(readingResource.file_url, '_blank')}
                    title="Open original file in new browser window"
                  >
                    ↗️ Open / Download
                  </button>
                )}

                {/* Theme Selector */}
                <div style={{ display: 'flex', gap: '2px', background: readerTheme === 'dark' ? '#0f172a' : '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    style={{ background: readerTheme === 'light' ? '#fff' : 'transparent', color: readerTheme === 'light' ? '#000' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    onClick={() => setReaderTheme('light')}
                    title="Light Theme"
                  >
                    ☀️
                  </button>
                  <button
                    type="button"
                    style={{ background: readerTheme === 'sepia' ? '#fdf6e2' : 'transparent', color: readerTheme === 'sepia' ? '#78350f' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    onClick={() => setReaderTheme('sepia')}
                    title="Sepia Paper Theme"
                  >
                    📜
                  </button>
                  <button
                    type="button"
                    style={{ background: readerTheme === 'dark' ? '#334155' : 'transparent', color: readerTheme === 'dark' ? '#fff' : 'inherit', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    onClick={() => setReaderTheme('dark')}
                    title="Night Mode"
                  >
                    🌙
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
            {readerMode === 'document' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: readerTheme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                <div
                  style={{
                    padding: '0.5rem 1rem',
                    background: readerTheme === 'dark' ? '#1e293b' : '#eff6ff',
                    borderBottom: `1px solid ${readerTheme === 'dark' ? '#334155' : '#bfdbfe'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700 }}>📄 Document Viewer:</span> {readingResource.title} ({readingResource.file_type || 'PDF'}, {readingResource.file_size || '1.5 MB'})
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={readingResource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      ⬇️ Download / Fullscreen
                    </a>
                    {readingResource.file_url?.startsWith('http') && (
                      <a
                        href={`https://docs.google.com/viewer?url=${encodeURIComponent(readingResource.file_url)}&embedded=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.75rem', textDecoration: 'none' }}
                      >
                        📱 Google Docs Viewer
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  {/\.(png|jpe?g|webp|gif|svg)$/i.test(readingResource.file_url || '') ? (
                    <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', textAlign: 'center' }}>
                      <img
                        src={readingResource.file_url}
                        alt={readingResource.title}
                        style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                    </div>
                  ) : (
                    <iframe
                      src={readingResource.file_url}
                      title={readingResource.title}
                      style={{ width: '100%', height: '100%', minHeight: '65vh', border: 'none', background: '#ffffff' }}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Study Notes Mode */
              <>
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
                  }}
                >
                  {/* Document Header */}
                  <div style={{ textAlign: 'center', borderBottom: `2px dashed ${readerTheme === 'dark' ? '#334155' : '#cbd5e1'}`, paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      BRENT COLLEGE — PROFESSIONAL SHORT COURSES DIRECTORY
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.35rem 0' }}>
                      {readingResource.subject} • {readingResource.category} ({readingResource.year || new Date().getFullYear()})
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      Curated by Faculty Instructor: <strong>{readingResource.uploaded_by}</strong> • Revision Notes
                    </div>
                  </div>

                  {currentPage === 1 && (
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid var(--color-primary)', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
                        SECTION A: CORE CONCEPTS & COMPULSORY PRINCIPLES
                      </h2>
                      <p>
                        <strong>Module Objective:</strong><br />
                        This document covers standard practical competencies, safety guidelines, and examination objectives for <strong>{readingResource.subject}</strong>.
                      </p>
                      <p>
                        <strong>Key Assessment Points:</strong><br />
                        Students must demonstrate thorough familiarity with practical workshop procedures, equipment handling, and theoretical foundations before sitting for certification.
                      </p>
                    </div>
                  )}

                  {currentPage === 2 && (
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid #16a34a', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
                        SECTION B: PRACTICAL IMPLEMENTATION & CASE STUDIES
                      </h2>
                      <p>
                        <strong>Practical Application:</strong><br />
                        Case study analysis, real-world project simulations, and industry standards aligned with TVET requirements.
                      </p>
                    </div>
                  )}

                  {currentPage === 3 && (
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid #7c3aed', paddingLeft: '0.75rem', marginBottom: '1rem' }}>
                        APPENDIX & INSTRUCTOR REVISION GUIDE
                      </h2>
                      <div style={{ background: readerTheme === 'dark' ? '#1e293b' : '#f8fafc', border: `1px solid ${readerTheme === 'dark' ? '#334155' : '#e2e8f0'}`, borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>Instructor's Study Recommendation</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
                          "Review all modules thoroughly and complete the practical lab exercises before the end-of-term evaluation."
                        </p>
                      </div>
                      <div style={{ textAlign: 'center', opacity: 0.7, fontSize: '0.8rem', marginTop: '2rem' }}>
                        — END OF NOTES — <br />
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
              </>
            )}
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
                {/* Local Storage File Picker */}
                <div>
                  <label className="label">Upload Document / File from Device *</label>
                  <div
                    style={{
                      border: '2px dashed #3b82f6',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      textAlign: 'center',
                      background: selectedFile ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => document.getElementById('libFilePicker')?.click()}
                  >
                    <input
                      id="libFilePicker"
                      type="file"
                      style={{ display: 'none' }}
                      accept=".pdf, .docx, .doc, .ppt, .pptx, .xlsx, .xls, .zip, .html, .txt, image/*"
                      onChange={handleFileChange}
                    />
                    <div style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>
                      {selectedFile ? '📄' : '📁'}
                    </div>
                    {selectedFile ? (
                      <div>
                        <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.92rem' }}>
                          {selectedFile.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                          ✓ Ready to upload • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFile(null)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginTop: '0.4rem',
                          }}
                        >
                          ✕ Choose different file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                          Click or Drag to Upload from Local Storage
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          Accepts PDF, Word (DOCX), PowerPoint, Excel, ZIP or HTML files
                        </div>
                        <div style={{ display: 'inline-block', background: '#2563eb', color: '#ffffff', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.6rem' }}>
                          Browse Files
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">Resource Title *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Enter document title (e.g. 2026 Revision Guide)"
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
                <button type="button" className="btn btn-secondary" disabled={isUploading} onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                  {isUploading ? '⏳ Uploading & Saving to Database...' : '✓ Publish to E-Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
