import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { schoolStore } from '@/lib/schoolData'
import { supabase } from '@/lib/supabase'
import { getEmbeddableDocumentUrl } from '@/lib/utils'
import type { AcademicResource } from '@/types/school'

const CATEGORIES = ['All', '⭐ Starred / Saved Books', 'Textbooks', 'Lab Manuals & Code', 'Revision Notes', 'Past Papers', 'Syllabus']

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

  // Starred / Saved Favorites State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('eclat_library_bookmarks')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      localStorage.setItem('eclat_library_bookmarks', JSON.stringify(next))
      return next
    })
  }

  // Session Read Tracking (prevents repeated view increments on open/close)
  const [readResourcesSession, setReadResourcesSession] = useState<Set<string>>(new Set())

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

  // Fullscreen In-App Viewer State
  const [readingResource, setReadingResource] = useState<AcademicResource | null>(null)
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light')
  const [drmWarning, setDrmWarning] = useState<string | null>(null)
  const [isDefocused, setIsDefocused] = useState(false)

  // DRM Anti-Screenshot, Anti-Save, Window Defocus, and Anti-Print Interceptor
  useEffect(() => {
    if (!readingResource) return

    const handleBlur = () => {
      // User switched tabs, opened screenshot snippet tool, or minimized window
      setIsDefocused(true)
    }

    const handleFocus = () => {
      setIsDefocused(false)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        setDrmWarning('🔒 Protected Academic Viewer: Screenshots and file saving are restricted.')
        setTimeout(() => setDrmWarning(null), 4000)
        return
      }

      // Intercept Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        setDrmWarning('🔒 Protected Academic Viewer: Screenshots and file saving are restricted.')
        setTimeout(() => setDrmWarning(null), 4000)
        return
      }

      // Intercept PrintScreen key & Screenshot combos (Win+Shift+S, Meta+Shift+3/4)
      if (
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === '3' || e.key === '4' || e.key === '5'))
      ) {
        e.preventDefault()
        setIsDefocused(true)
        setDrmWarning('🔒 Screenshot capture blocked by DRM policy.')
        setTimeout(() => setDrmWarning(null), 4000)
        return
      }

      // Intercept Ctrl+C / Cmd+C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        setDrmWarning('🔒 Protected Academic Viewer: Copying is restricted.')
        setTimeout(() => setDrmWarning(null), 4000)
        return
      }

      // Intercept F12 / Inspect shortcuts
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c')) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u')
      ) {
        e.preventDefault()
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [readingResource])

  // Upload Modal State (for admin only)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadSource, setUploadSource] = useState<'file' | 'gdrive'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [googleDriveUrl, setGoogleDriveUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<AcademicResource['category']>('Past Papers')
  const [newSubject, setNewSubject] = useState(storeSubjects[0] || 'General Studies')
  const [newClassLevel, setNewClassLevel] = useState('Short Course / Certificate')
  const [newYear, setNewYear] = useState<number | string>('')

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchSearch =
        res.title.toLowerCase().includes(search.toLowerCase()) ||
        res.subject.toLowerCase().includes(search.toLowerCase()) ||
        res.uploaded_by.toLowerCase().includes(search.toLowerCase())

      const matchCat =
        selectedCat === 'All'
          ? true
          : selectedCat === '⭐ Starred / Saved Books'
          ? bookmarkedIds.includes(res.id)
          : res.category === selectedCat || (selectedCat === 'Lab Manuals & Code' && (res.category === 'Lab Manuals' || res.category.includes('Lab')))

      const matchSub = selectedSub === 'All' || res.subject.toLowerCase().includes(selectedSub.toLowerCase())

      return matchSearch && matchCat && matchSub
    })
  }, [resources, search, selectedCat, selectedSub, bookmarkedIds])

  const handleOpenReader = (res: AcademicResource) => {
    setReadingResource(res)

    // Only increment unique student reads once per browser session
    if (!isAdmin && !readResourcesSession.has(res.id)) {
      setReadResourcesSession((prev) => new Set(prev).add(res.id))
      const nextCount = (res.downloads_count || 0) + 1
      const updated = resources.map((r) => (r.id === res.id ? { ...r, downloads_count: nextCount } : r))
      setResources(updated)
      schoolStore.updateResource(res.id, { downloads_count: nextCount }).catch(() => {})
      supabase
        .from('library_resources')
        .update({ downloads_count: nextCount })
        .eq('id', res.id)
        .then(() => {})
    }
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
      const isGDrive = uploadSource === 'gdrive' && googleDriveUrl.trim().length > 0
      let fileSizeFormatted = selectedFile
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : 'Academic Document'

      let fileExt: AcademicResource['file_type'] = 'PDF'
      let fileBlobUrl = ''

      if (isGDrive) {
        fileBlobUrl = googleDriveUrl.trim()
        fileSizeFormatted = 'Academic Document'
        fileExt = 'PDF'
      } else if (selectedFile) {
        const rawExt = selectedFile.name.split('.').pop()?.toUpperCase()
        fileExt =
          rawExt === 'DOCX' || rawExt === 'DOC'
            ? 'DOCX'
            : rawExt === 'PPTX' || rawExt === 'PPT'
            ? 'PPTX'
            : rawExt === 'EPUB'
            ? 'EPUB'
            : 'PDF'

        // Read file as Base64 Data URL so it is self-contained and immediately viewable everywhere
        const base64DataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(selectedFile)
        })
        fileBlobUrl = base64DataUrl

        // Also attempt upload to Supabase storage bucket 'library-resources'
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
      } else {
        fileBlobUrl = 'https://eclatinstitute.internal/docs/' + encodeURIComponent(newTitle)
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
        year: newYear ? Number(newYear) : undefined,
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
      <div className="card mb-6" style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--color-surface)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Main Search Bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', opacity: 0.6 }}>
              🔍
            </span>
            <input
              type="text"
              className="input"
              style={{
                paddingLeft: '46px',
                paddingRight: search ? '40px' : '16px',
                paddingTop: '0.85rem',
                paddingBottom: '0.85rem',
                fontSize: '0.95rem',
                borderRadius: '12px',
                border: '2px solid var(--color-border)',
                background: 'var(--color-bg)',
              }}
              placeholder="Search e-library by document title, subject, category, author, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Tag Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {['All', 'Revision Notes', 'Past Papers', 'Lab Manuals', 'Textbooks', '⭐ Starred / Saved Books'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: selectedCat === cat ? 800 : 600,
                  whiteSpace: 'nowrap',
                  border: selectedCat === cat ? '2px solid #2563eb' : '1px solid var(--color-border)',
                  background: selectedCat === cat ? '#eff6ff' : 'var(--color-surface)',
                  color: selectedCat === cat ? '#1e3a8a' : 'var(--color-text)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary" style={{ fontWeight: 700 }}>{res.category}</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      {res.file_type}
                      {res.file_size && !res.file_size.toLowerCase().includes('drive') && !res.file_size.toLowerCase().includes('cloud') ? ` • ${res.file_size}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => toggleBookmark(res.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      lineHeight: 1,
                      color: bookmarkedIds.includes(res.id) ? '#f59e0b' : '#94a3b8',
                      transition: 'transform 0.15s ease',
                    }}
                    title={bookmarkedIds.includes(res.id) ? 'Remove from Saved Books' : 'Save to My Starred Books'}
                  >
                    {bookmarkedIds.includes(res.id) ? '⭐' : '☆'}
                  </button>
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
                  {/(python|web|code|software|data|react|javascript|sql|lab)/i.test(res.subject + ' ' + res.title + ' ' + res.category) && (
                    <a
                      href="https://stackblitz.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      title="Open Interactive Code Sandbox"
                    >
                      ⚡ Lab Sandbox
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenReader(res)}
                  >
                    📖 Read Online 🔒
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Fullscreen Protected Document Viewer */}
      {readingResource && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            background: readerTheme === 'dark' ? '#0b0f19' : readerTheme === 'sepia' ? '#fbf0d9' : '#ffffff',
            color: readerTheme === 'dark' ? '#f8fafc' : '#1e293b',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            setDrmWarning('🔒 Protected Academic Viewer: Screenshots and saving are restricted.')
            setTimeout(() => setDrmWarning(null), 3000)
          }}
          onCopy={(e) => {
            e.preventDefault()
            setDrmWarning('🔒 Protected Academic Viewer: Copying is restricted.')
            setTimeout(() => setDrmWarning(null), 3000)
          }}
          onCut={(e) => e.preventDefault()}
        >
          {/* DRM Warning Toast */}
          {drmWarning && (
            <div
              style={{
                position: 'fixed',
                top: '64px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100000,
                background: '#dc2626',
                color: '#ffffff',
                padding: '0.65rem 1.4rem',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '0.85rem',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'center',
                animation: 'fadeIn 0.2s ease-in-out',
              }}
            >
              <span>🛡️</span>
              <span>{drmWarning}</span>
            </div>
          )}

          {/* Minimal Fullscreen Header Toolbar */}
          <div
            style={{
              height: '56px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 1.25rem',
              borderBottom: `1px solid ${readerTheme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
              background: readerTheme === 'dark' ? '#0f172a' : '#f8fafc',
              gap: '0.75rem',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>📖</span>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: readerTheme === 'dark' ? '#93c5fd' : '#1e3a8a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {readingResource.title}
                </h3>
                <div style={{ fontSize: '0.72rem', opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {readingResource.category} • {readingResource.subject} {readingResource.year ? `(${readingResource.year})` : ''} • 🔒 In-App Reader
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              {/* Bookmark Toggle */}
              <button
                type="button"
                onClick={() => toggleBookmark(readingResource.id)}
                className="btn btn-ghost btn-sm"
                style={{
                  color: bookmarkedIds.includes(readingResource.id) ? '#f59e0b' : 'inherit',
                  fontSize: '0.85rem',
                  padding: '4px 8px',
                  fontWeight: 700,
                }}
                title={bookmarkedIds.includes(readingResource.id) ? 'Saved in My Books' : 'Save Book'}
              >
                {bookmarkedIds.includes(readingResource.id) ? '⭐ Saved' : '☆ Save'}
              </button>

              {/* Theme Selector */}
              <div style={{ display: 'flex', gap: '2px', background: readerTheme === 'dark' ? '#1e293b' : '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
                <button
                  type="button"
                  style={{ background: readerTheme === 'light' ? '#fff' : 'transparent', color: readerTheme === 'light' ? '#000' : 'inherit', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                  onClick={() => setReaderTheme('light')}
                  title="Light Theme"
                >
                  ☀️
                </button>
                <button
                  type="button"
                  style={{ background: readerTheme === 'sepia' ? '#fdf6e2' : 'transparent', color: readerTheme === 'sepia' ? '#78350f' : 'inherit', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                  onClick={() => setReaderTheme('sepia')}
                  title="Sepia Paper Theme"
                >
                  📜
                </button>
                <button
                  type="button"
                  style={{ background: readerTheme === 'dark' ? '#334155' : 'transparent', color: readerTheme === 'dark' ? '#fff' : 'inherit', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                  onClick={() => setReaderTheme('dark')}
                  title="Night Mode"
                >
                  🌙
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setReadingResource(null)}
                style={{
                  background: readerTheme === 'dark' ? '#ef4444' : '#fee2e2',
                  color: readerTheme === 'dark' ? '#ffffff' : '#991b1b',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Fullscreen Document Content Viewport */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: readerTheme === 'dark' ? '#0b0f19' : '#f8fafc' }}>
            {/* Defocus / Screen-Capture Blackout Shield */}
            {isDefocused && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 90,
                  background: '#090d16',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  textAlign: 'center',
                  padding: '2rem',
                  backdropFilter: 'blur(25px)',
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛡️</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#60a5fa' }}>
                  Confidential Document Protected
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '420px', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                  Document viewing is secured inside the LMS app. Screen capture, external window switching, and printing are prohibited by DRM policy.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsDefocused(false)}
                  style={{ fontWeight: 800, padding: '0.65rem 1.5rem', borderRadius: '10px' }}
                >
                  ✓ Return to Document
                </button>
              </div>
            )}

            {/* Anti-Popout Click Interceptor (Prevents clicking Google Drive's "Open in New Window" top-right icon) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '75px',
                height: '75px',
                zIndex: 35,
                background: 'transparent',
                cursor: 'default',
              }}
              onClick={(e) => {
                e.stopPropagation()
                setDrmWarning('🔒 Protected Viewer: Opening documents outside the LMS app is disabled.')
                setTimeout(() => setDrmWarning(null), 3500)
              }}
              title="Protected Viewer: In-App Reading Only"
            />

            {/* Dynamic Security Watermark */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                opacity: 0.07,
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    transform: 'rotate(-20deg)',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: '#dc2626',
                    letterSpacing: '0.12em',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ÉCLAT INSTITUTE • LICENSED TO {profile?.full_name?.toUpperCase() || 'ENROLLED STUDENT'} • STRICTLY CONFIDENTIAL
                </div>
              ))}
            </div>

            {/\.(png|jpe?g|webp|gif|svg)$/i.test(readingResource.file_url || '') ? (
              <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', textAlign: 'center' }}>
                <img
                  src={readingResource.file_url}
                  alt={readingResource.title}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', pointerEvents: 'none' }}
                />
              </div>
            ) : (
              <iframe
                src={getEmbeddableDocumentUrl(readingResource.file_url, 'cloud')}
                title={readingResource.title}
                referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', border: 'none', background: '#ffffff' }}
                allow="autoplay"
              />
            )}
          </div>
        </div>
      )}

      {/* Upload Modal (Faculty Only) */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div
            className="modal-content modal-md"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: '20px',
              maxWidth: '560px',
              width: '94%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', background: '#0f172a', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.3rem' }}>📤</span>
                <h3 className="modal-title" style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  Upload Academic E-Resource
                </h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
                style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadResource} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body" style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Source Selection Tabs */}
                <div>
                  <label className="label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                    Resource Source
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => setUploadSource('file')}
                      style={{
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px',
                        border: uploadSource === 'file' ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                        background: uploadSource === 'file' ? '#eff6ff' : '#ffffff',
                        color: uploadSource === 'file' ? '#1e3a8a' : '#475569',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>📁</span> Device Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadSource('gdrive')}
                      style={{
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px',
                        border: uploadSource === 'gdrive' ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                        background: uploadSource === 'gdrive' ? '#eff6ff' : '#ffffff',
                        color: uploadSource === 'gdrive' ? '#1e3a8a' : '#475569',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>☁️</span> Google Drive Link
                    </button>
                  </div>
                </div>

                {uploadSource === 'file' ? (
                  /* Local Storage File Picker */
                  <div>
                    <label className="label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Select File from Device *
                    </label>
                    <div
                      style={{
                        border: '2px dashed #3b82f6',
                        borderRadius: '12px',
                        padding: '1.5rem 1rem',
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
                      <div style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>
                        {selectedFile ? '📄' : '📁'}
                      </div>
                      {selectedFile ? (
                        <div>
                          <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.95rem' }}>
                            {selectedFile.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                            ✓ Ready to upload • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedFile(null)
                            }}
                            style={{
                              background: '#fee2e2',
                              border: 'none',
                              color: '#991b1b',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              padding: '4px 10px',
                              cursor: 'pointer',
                              marginTop: '0.6rem',
                            }}
                          >
                            ✕ Remove / Choose different file
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>
                            Tap to Choose Document from Storage
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                            PDF, Word (DOCX), PowerPoint, Excel, ZIP or HTML
                          </div>
                          <div style={{ display: 'inline-block', background: '#2563eb', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.75rem' }}>
                            Browse Device Files
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Google Drive Link Input */
                  <div>
                    <label className="label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Google Drive or Cloud Document Link *
                    </label>
                    <div style={{ background: '#eff6ff', border: '1.5px dashed #3b82f6', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.4 }}>
                        💡 <strong>In-App Viewer:</strong> Paste any shared link from Google Drive, Docs, Slides, or Sheets. Students read seamlessly inside the LMS!
                      </div>
                      <input
                        type="url"
                        required={uploadSource === 'gdrive'}
                        className="input"
                        style={{ background: '#ffffff', fontSize: '0.9rem', padding: '0.75rem' }}
                        placeholder="https://drive.google.com/file/d/..."
                        value={googleDriveUrl}
                        onChange={(e) => {
                          setGoogleDriveUrl(e.target.value)
                          if (!newTitle.trim() && e.target.value.includes('drive.google.com')) {
                            setNewTitle('Google Drive Document')
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    style={{ fontSize: '0.9rem', padding: '0.75rem' }}
                    placeholder="e.g. 2026 Revision Guide or Lab Notes"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
                  <div style={{ flex: '1 1 180px', minWidth: '140px' }}>
                    <label className="label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Category / Document Type *
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      style={{ fontSize: '0.9rem', padding: '0.75rem' }}
                      placeholder="Type category (e.g. Revision Notes, Past Papers, Lab Manual)"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                    />
                  </div>
                  <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
                    <label className="label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      Exam Year (Optional)
                    </label>
                    <input
                      type="number"
                      className="input"
                      style={{ fontSize: '0.9rem', padding: '0.75rem' }}
                      placeholder="e.g. 2026"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                </div>

                <div>
                  <label className="label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    Subject / Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    style={{ fontSize: '0.9rem', padding: '0.75rem' }}
                    placeholder="Type subject (e.g. Full-Stack Web Development, Python, French, Accounting)"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    Class / Target Level
                  </label>
                  <input
                    type="text"
                    className="input"
                    style={{ fontSize: '0.9rem', padding: '0.75rem' }}
                    placeholder="e.g. Certificate / Diploma / All Trainees"
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(e.target.value)}
                  />
                </div>

                {/* Free Access Notice Banner */}
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🟢</span>
                  <span style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 700 }}>
                    100% Free Open Access: This e-resource will be freely accessible to all enrolled students and visitors.
                  </span>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={isUploading}
                  onClick={() => setShowUploadModal(false)}
                  style={{ fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUploading}
                  style={{ fontWeight: 800, padding: '0.75rem 1.5rem' }}
                >
                  {isUploading ? '⏳ Uploading & Saving...' : '✓ Publish to E-Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
