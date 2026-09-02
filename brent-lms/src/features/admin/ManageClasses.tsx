import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'

export interface DbSubject {
  id: string
  name: string
  color_hex?: string | null
  created_at?: string
}

export interface DbCourse {
  id: string
  title: string
  description: string | null
  subject_id: string | null
  teacher_id?: string | null
  class_id?: string | null
  is_published: boolean
  created_at?: string
  updated_at?: string
  subjects?: DbSubject | null
}

export function ManageClasses() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'courses' | 'subjects'>('courses')
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Fetch live courses with joined subject from Supabase
  const { data: courses = [], isLoading: isLoadingCourses, isError: isErrorCourses, refetch: refetchCourses } = useQuery<DbCourse[]>({
    queryKey: ['db-courses-live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, is_published, subject_id, created_at, updated_at, subjects(id, name, color_hex)')
        .order('created_at', { ascending: false })

      if (error) throw error
      const rows = (data || []) as any[]
      return rows.map((r) => ({
        ...r,
        subjects: Array.isArray(r.subjects) ? (r.subjects[0] || null) : (r.subjects || null),
      })) as DbCourse[]
    },
  })

  // 2. Fetch live subjects from Supabase
  const { data: subjects = [], isLoading: isLoadingSubjects, refetch: refetchSubjects } = useQuery<DbSubject[]>({
    queryKey: ['db-subjects-live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, color_hex, created_at')
        .order('name', { ascending: true })

      if (error) throw error
      return (data || []) as DbSubject[]
    },
  })

  // Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<DbCourse | null>(null)
  const [courseTitle, setCourseTitle] = useState('')
  const [courseDesc, setCourseDesc] = useState('')
  const [courseSubjectId, setCourseSubjectId] = useState('')
  const [coursePublished, setCoursePublished] = useState(true)
  const [courseToDelete, setCourseToDelete] = useState<DbCourse | null>(null)

  // Subject Modal State
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState<DbSubject | null>(null)
  const [subjectName, setSubjectName] = useState('')
  const [subjectColor, setSubjectColor] = useState('#2563eb')
  const [subjectToDelete, setSubjectToDelete] = useState<DbSubject | null>(null)

  // Open Create Course Modal
  const handleOpenCreateCourse = () => {
    setEditingCourse(null)
    setCourseTitle('')
    setCourseDesc('')
    setCourseSubjectId(subjects[0]?.id || '')
    setCoursePublished(true)
    setShowCourseModal(true)
  }

  // Open Edit Course Modal
  const handleOpenEditCourse = (course: DbCourse) => {
    setEditingCourse(course)
    setCourseTitle(course.title || '')
    setCourseDesc(course.description || '')
    setCourseSubjectId(course.subject_id || '')
    setCoursePublished(course.is_published ?? true)
    setShowCourseModal(true)
  }

  // Save (Create or Update) Course Mutation
  const saveCourseMutation = useMutation({
    mutationFn: async () => {
      if (!courseTitle.trim()) return

      const payload = {
        title: courseTitle.trim(),
        description: courseDesc.trim() || null,
        subject_id: courseSubjectId || null,
        is_published: coursePublished,
        updated_at: new Date().toISOString(),
      }

      if (editingCourse) {
        // Update Course in Supabase
        const { error } = await supabase.from('courses').update(payload).eq('id', editingCourse.id)
        if (error) throw error
      } else {
        // Insert new Course in Supabase
        const { error } = await supabase.from('courses').insert([{ ...payload, created_at: new Date().toISOString() }])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-courses-live'] })
      setShowCourseModal(false)
      setEditingCourse(null)
    },
    onError: (err: any) => {
      alert(`Database Operation Error: ${err?.message || 'Could not save course'}`)
    },
  })

  // Delete Course Mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-courses-live'] })
      setCourseToDelete(null)
    },
    onError: (err: any) => {
      alert(`Database Delete Error: ${err?.message || 'Could not delete course'}`)
    },
  })

  // Open Create Subject Modal
  const handleOpenCreateSubject = () => {
    setEditingSubject(null)
    setSubjectName('')
    setSubjectColor('#2563eb')
    setShowSubjectModal(true)
  }

  // Open Edit Subject Modal
  const handleOpenEditSubject = (sub: DbSubject) => {
    setEditingSubject(sub)
    setSubjectName(sub.name || '')
    setSubjectColor(sub.color_hex || '#2563eb')
    setShowSubjectModal(true)
  }

  // Save (Create or Update) Subject Mutation
  const saveSubjectMutation = useMutation({
    mutationFn: async () => {
      if (!subjectName.trim()) return

      const payload = {
        name: subjectName.trim(),
        color_hex: subjectColor,
      }

      if (editingSubject) {
        // Update Subject in Supabase
        const { error } = await supabase.from('subjects').update(payload).eq('id', editingSubject.id)
        if (error) throw error
      } else {
        // Insert Subject in Supabase
        const { error } = await supabase.from('subjects').insert([{ ...payload, created_at: new Date().toISOString() }])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-subjects-live'] })
      queryClient.invalidateQueries({ queryKey: ['db-courses-live'] })
      setShowSubjectModal(false)
      setEditingSubject(null)
    },
    onError: (err: any) => {
      alert(`Database Subject Error: ${err?.message || 'Could not save subject'}`)
    },
  })

  // Delete Subject Mutation
  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-subjects-live'] })
      queryClient.invalidateQueries({ queryKey: ['db-courses-live'] })
      setSubjectToDelete(null)
    },
    onError: (err: any) => {
      alert(`Database Delete Error: ${err?.message || 'Could not delete subject'}`)
    },
  })

  // Filtered lists based on search
  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.subjects?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSubjects = subjects.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <PageWrapper title="Academic Programs & Live Database">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="card p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', borderRadius: '16px' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: '1.4rem' }}>🗄️</span>
                <h1 className="text-2xl font-bold tracking-tight text-white m-0">
                  Live Academic Database Console
                </h1>
                <span className="badge" style={{ background: '#10b981', color: '#ffffff', fontWeight: 800, fontSize: '0.72rem' }}>
                  🟢 REAL-TIME SUPABASE SYNC
                </span>
              </div>
              <p className="text-slate-300 text-sm m-0">
                Direct live synchronization with your database <code className="text-emerald-400 font-mono">courses</code> and <code className="text-emerald-400 font-mono">subjects</code> tables.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="primary"
                onClick={activeTab === 'courses' ? handleOpenCreateCourse : handleOpenCreateSubject}
                style={{ fontWeight: 800, padding: '0.65rem 1.25rem' }}
              >
                {activeTab === 'courses' ? '+ Add New Course' : '+ Add Subject Discipline'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  refetchCourses()
                  refetchSubjects()
                }}
                className="btn btn-secondary btn-sm"
                style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: 'none' }}
                title="Refresh from Supabase"
              >
                🔄 Refresh Cloud Data
              </button>
            </div>
          </div>

          {/* Database Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-700">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Online Courses</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">{courses.length}</div>
              <div className="text-xs text-slate-400 mt-0.5">Live in courses table</div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Subject Disciplines</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">{subjects.length}</div>
              <div className="text-xs text-slate-400 mt-0.5">Live in subjects table</div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Published Status</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
                {courses.filter((c) => c.is_published).length}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Active Student Enrollments</div>
            </div>
          </div>
        </div>

        {/* Tab & Search Control Bar */}
        <div className="card p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Table Switcher Tabs */}
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'courses'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>📚</span>
              <span>Online Courses ({courses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('subjects')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'subjects'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>🏷️</span>
              <span>Subject Disciplines ({subjects.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              className="input pl-9 text-sm"
              placeholder={activeTab === 'courses' ? 'Search courses by title or discipline...' : 'Search subjects...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: COURSES TABLE VIEW */}
        {activeTab === 'courses' && (
          <div>
            {isLoadingCourses ? (
              <div className="card p-12 text-center">
                <Spinner />
                <p className="text-slate-500 mt-2 text-sm">Querying Supabase courses table...</p>
              </div>
            ) : isErrorCourses ? (
              <div className="card p-8 text-center text-red-600">
                <p className="font-bold">Error loading courses from Supabase database.</p>
                <button type="button" onClick={() => refetchCourses()} className="btn btn-secondary btn-sm mt-2">
                  Try Again
                </button>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="card p-12 text-center text-slate-500">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No Courses Found</h3>
                <p className="text-xs text-slate-400 mt-1">Add your first course using the "+ Add New Course" button above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    className="card p-5 flex flex-col justify-between border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-extrabold"
                          style={{
                            backgroundColor: c.subjects?.color_hex ? `${c.subjects.color_hex}15` : '#eff6ff',
                            color: c.subjects?.color_hex || '#2563eb',
                            border: `1px solid ${c.subjects?.color_hex ? `${c.subjects.color_hex}35` : '#bfdbfe'}`,
                          }}
                        >
                          {c.subjects?.name || 'General Studies'}
                        </span>
                        <span className={`badge ${c.is_published ? 'badge-success' : 'badge-neutral'} text-[11px]`}>
                          {c.is_published ? '🟢 Published' : 'Draft'}
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2">
                        {c.title}
                      </h3>

                      {/* Syllabus / Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                        {c.description || 'No detailed syllabus curriculum provided yet.'}
                      </p>
                    </div>

                    {/* Footer Controls */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                      <span className="font-mono text-[11px]">ID: {c.id.slice(0, 8)}...</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCourse(c)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourseToDelete(c)}
                          className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                          style={{ padding: '4px 8px' }}
                          title="Delete course from database"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUBJECTS TABLE VIEW */}
        {activeTab === 'subjects' && (
          <div>
            {isLoadingSubjects ? (
              <div className="card p-12 text-center">
                <Spinner />
                <p className="text-slate-500 mt-2 text-sm">Querying Supabase subjects table...</p>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="card p-12 text-center text-slate-500">
                <div className="text-3xl mb-2">🏷️</div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No Subjects Found</h3>
                <p className="text-xs text-slate-400 mt-1">Add a new discipline using the "+ Add Subject Discipline" button.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((s) => {
                  const linkedCoursesCount = courses.filter((c) => c.subject_id === s.id).length
                  return (
                    <div
                      key={s.id}
                      className="card p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: s.color_hex || '#2563eb' }}
                        />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white m-0">{s.name}</h4>
                          <span className="text-xs text-slate-500">
                            {linkedCoursesCount} {linkedCoursesCount === 1 ? 'Linked Course' : 'Linked Courses'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSubject(s)}
                          className="btn btn-ghost btn-sm text-blue-600"
                          title="Edit Subject"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubjectToDelete(s)}
                          className="btn btn-ghost btn-sm text-red-600"
                          title="Delete Subject"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT COURSE */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title={editingCourse ? 'Edit Database Course' : 'Create New Course (Supabase Live)'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            saveCourseMutation.mutate()
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">Course Title *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Full-Stack Web Development (React 19, Node.js)"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Subject Discipline *</label>
            <select
              className="input"
              required
              value={courseSubjectId}
              onChange={(e) => setCourseSubjectId(e.target.value)}
            >
              <option value="">-- Select or Assign Subject --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Course Syllabus and Description</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Outline the modular units, course competencies, and practical lab training objectives..."
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <input
              type="checkbox"
              id="coursePublishCheck"
              checked={coursePublished}
              onChange={(e) => setCoursePublished(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <label htmlFor="coursePublishCheck" className="text-sm font-semibold cursor-pointer m-0">
              Publish Course (Make visible for student enrollment and LMS modules)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="secondary" onClick={() => setShowCourseModal(false)} disabled={saveCourseMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saveCourseMutation.isPending}>
              {editingCourse ? 'Save Changes' : '+ Create Course in Supabase'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD / EDIT SUBJECT */}
      <Modal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        title={editingSubject ? 'Edit Subject Discipline' : 'Add Subject Discipline (Supabase Live)'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            saveSubjectMutation.mutate()
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">Subject Discipline Name *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Artificial Intelligence and Cloud Computing"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Color Identifier Tag</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={subjectColor}
                onChange={(e) => setSubjectColor(e.target.value)}
                className="w-12 h-10 p-1 rounded border cursor-pointer"
              />
              <input
                type="text"
                className="input flex-1"
                placeholder="#2563eb"
                value={subjectColor}
                onChange={(e) => setSubjectColor(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="secondary" onClick={() => setShowSubjectModal(false)} disabled={saveSubjectMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saveSubjectMutation.isPending}>
              {editingSubject ? 'Update Subject' : '+ Add Subject to Database'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE COURSE */}
      <ConfirmModal
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (courseToDelete) deleteCourseMutation.mutate(courseToDelete.id)
        }}
        title="Delete Course"
        message={`Are you sure you want to permanently delete "${courseToDelete?.title}" from the database? All linked lessons will be removed.`}
        confirmLabel="Yes, Delete Course"
        loading={deleteCourseMutation.isPending}
      />

      {/* CONFIRM DELETE SUBJECT */}
      <ConfirmModal
        isOpen={Boolean(subjectToDelete)}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={() => {
          if (subjectToDelete) deleteSubjectMutation.mutate(subjectToDelete.id)
        }}
        title="Delete Subject Discipline"
        message={`Are you sure you want to permanently delete "${subjectToDelete?.name}"? Any courses assigned to this subject will have their discipline unlinked.`}
        confirmLabel="Yes, Delete Subject"
        loading={deleteSubjectMutation.isPending}
      />
    </PageWrapper>
  )
}
