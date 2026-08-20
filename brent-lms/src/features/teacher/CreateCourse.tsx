import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { schoolStore } from '@/lib/schoolData'
import type { CourseUnit, SyllabusModule, CollegeDepartment, CollegeSubject } from '@/types/school'

export function CreateCourse() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  // Read admin-configured departments and subjects
  const [departments] = useState<CollegeDepartment[]>(() => schoolStore.getDepartments())
  const [subjects] = useState<CollegeSubject[]>(() => schoolStore.getSubjects())

  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || '')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [courseDuration, setCourseDuration] = useState('3 Months Certificate Course')
  const [creditHours, setCreditHours] = useState(40)
  const [description, setDescription] = useState('')

  // Active department details
  const currentDept = useMemo(() => {
    return departments.find((d) => d.id === selectedDeptId) || departments[0]
  }, [departments, selectedDeptId])

  // Filtered subjects for the selected department
  const availableSubjects = useMemo(() => {
    if (!currentDept) return subjects
    const filtered = subjects.filter((s) => s.department_id === currentDept.id || s.department_name === currentDept.name)
    return filtered.length > 0 ? filtered : subjects
  }, [subjects, currentDept])

  // Modules Builder State
  const [modules, setModules] = useState<SyllabusModule[]>([])

  // Lessons State
  const [lessons, setLessons] = useState<CourseUnit['lessons']>([])

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Module actions
  const handleAddModule = () => {
    const nextNum = modules.length + 1
    setModules([
      ...modules,
      {
        id: `mod-${Date.now()}-${nextNum}`,
        module_number: nextNum,
        title: `Module ${nextNum}: Topic Area`,
        hours: 10,
        topics: ['Sub-topic 1', 'Practical lab exercise'],
        learning_outcomes: ['Demonstrate practical mastery of this module'],
      },
    ])
  }

  const handleUpdateModule = (idx: number, updated: Partial<SyllabusModule>) => {
    const list = [...modules]
    list[idx] = { ...list[idx], ...updated }
    setModules(list)
  }

  const handleDeleteModule = (idx: number) => {
    setModules(modules.filter((_, i) => i !== idx))
  }

  // Lesson actions
  const handleAddLesson = () => {
    setLessons([
      ...lessons,
      {
        id: `les-${Date.now()}-${lessons.length + 1}`,
        title: `Lesson ${lessons.length + 1}: Practical Application`,
        video_url: '',
        duration_minutes: 50,
        content: '',
      },
    ])
  }

  const handleUpdateLesson = (idx: number, updated: Partial<CourseUnit['lessons'][0]>) => {
    const list = [...lessons]
    list[idx] = { ...list[idx], ...updated }
    setLessons(list)
  }

  const handleDeleteLesson = (idx: number) => {
    setLessons(lessons.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!code.trim() || !title.trim()) {
      setError('Course Unit Code and Title are required.')
      return
    }

    if (!currentDept) {
      setError('An Academic Department must be selected. Please contact Admin if none exist.')
      return
    }

    setIsSubmitting(true)
    try {
      const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0]
      const chosenProgram = selectedProgram || currentDept.programs?.[0] || currentDept.name

      const newUnit: CourseUnit = {
        id: `unit-${Date.now()}`,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        department: currentDept.name,
        program: chosenProgram,
        course_duration: courseDuration,
        credit_hours: Number(creditHours) || 30,
        teacher_id: profile?.id || 'tch-current',
        teacher_name: profile?.full_name || 'Faculty Lecturer',
        description: description.trim() || (activeSubject ? `Curriculum Discipline: ${activeSubject.name}` : ''),
        syllabus_modules: modules,
        lessons,
        is_published: true,
        created_at: new Date().toISOString(),
      }

      await schoolStore.addCourseUnit(newUnit)

      // Synchronize to Supabase Cloud Database
      try {
        await supabase.from('courses').insert({
          title: newUnit.title,
          description: newUnit.description || '',
          teacher_id: profile?.id,
          is_published: true,
        })
      } catch {}

      // Broadcast live sync event for frontpage
      window.dispatchEvent(new Event('storage'))

      navigate('/teacher/courses')
    } catch (err: any) {
      setError(err.message || 'Failed to create course unit.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <PageWrapper title="Access Restricted">
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            Administrator Access Only
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Only College Administrators and the Academic Registrar are authorized to create or upload new courses and curriculum units.
          </p>
          <Button variant="primary" onClick={() => navigate('/admin')}>
            ← Return to Dashboard
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      title="Curriculum & Short Course Builder"
      subtitle="Select accredited departments and subjects established by Administration to build your professional short courses."
    >
      <Link to="/teacher/courses" className="lesson-back-link mb-4">
        ← Back to Faculty Courses
      </Link>

      {/* Admin Setup Warning if No Departments Exist */}
      {departments.length === 0 && (
        <div className="card mb-6" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '1.5rem', borderRadius: '10px' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '2rem' }}>🏛️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#b45309' }}>
                No Academic Departments Introduced Yet
              </h3>
              <p style={{ margin: '0.25rem 0 0.75rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Under institutional governance rules, the <strong>College Administrator</strong> is responsible for introducing Academic Departments and Subject Disciplines. Once introduced, they will appear in the dropdown menus below for course creation.
              </p>
              {profile?.role === 'admin' && (
                <Link to="/admin/subjects" className="btn btn-primary btn-sm">
                  + Configure Departments & Subjects in Admin Desk →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '920px', margin: '0 auto' }}>
        {error && (
          <div className="card mb-4" style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '0.85rem 1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* 1. Unit Overview Details */}
        <div className="card mb-6" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)' }}>
            1. Department, Program & Subject Discipline Selection
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Department Dropdown */}
            <div>
              <label className="label">Academic Department * (Admin Introduced)</label>
              {departments.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#dc2626', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>
                  No departments created yet.
                </div>
              ) : (
                <select
                  className="input"
                  required
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value)
                    const targetDept = departments.find((d) => d.id === e.target.value)
                    if (targetDept && targetDept.programs?.length > 0) {
                      setSelectedProgram(targetDept.programs[0])
                    }
                  }}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Program Dropdown */}
            <div>
              <label className="label">Accredited Program / Cohort *</label>
              {currentDept && currentDept.programs && currentDept.programs.length > 0 ? (
                <select
                  className="input"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                >
                  {currentDept.programs.map((prog, idx) => (
                    <option key={idx} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Certificate in Web & Cloud Systems"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Subject Area Dropdown */}
            <div>
              <label className="label">Subject Discipline * (Admin Introduced)</label>
              {availableSubjects.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', padding: '0.5rem' }}>
                  No subjects configured.
                </div>
              ) : (
                <select
                  className="input"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Course Duration Dropdown */}
            <div>
              <label className="label">Course Duration / Training Period *</label>
              <select className="input" value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)}>
                <option value="1 Month (Intensive Bootcamp)">1 Month (Intensive Bootcamp)</option>
                <option value="2 Months (Fast-Track Skills)">2 Months (Fast-Track Skills)</option>
                <option value="3 Months (Certificate Course)">3 Months (Certificate Course)</option>
                <option value="4 Months (Professional Short Course)">4 Months (Professional Short Course)</option>
                <option value="6 Months (Modular Diploma)">6 Months (Modular Diploma)</option>
                <option value="2 Weeks (Executive Masterclass)">2 Weeks (Executive Masterclass)</option>
                <option value="1 Week (Accelerated Workshop)">1 Week (Accelerated Workshop)</option>
                <option value="Self-Paced Short Course">Self-Paced Short Course</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 120px', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="label">Course Unit Code *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. CS 201"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Course Unit Title *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. Advanced Web & Mobile Applications with React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Credits</label>
              <input
                type="number"
                min="1"
                max="8"
                className="input"
                value={creditHours}
                onChange={(e) => setCreditHours(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="label">Course Scope & Prerequisites (Optional)</label>
            <textarea
              rows={2}
              className="input"
              placeholder="Brief summary of the course unit, prerequisites, and learning objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* 2. Modular Curriculum Syllabus Outline */}
        <div className="card mb-6" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
                2. Modular Syllabus & Topic Breakdown
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0' }}>
                Structure the instructional modules, lecture contact hours, and key topic areas.
              </p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddModule}>
              + Add Syllabus Module
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {modules.map((mod, idx) => (
              <div
                key={mod.id}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-primary">Module {mod.module_number}</span>
                    <strong style={{ fontSize: '0.95rem' }}>{mod.title}</strong>
                  </div>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                      onClick={() => handleDeleteModule(idx)}
                    >
                      🗑️ Remove Module
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Module Title"
                    value={mod.title}
                    onChange={(e) => handleUpdateModule(idx, { title: e.target.value })}
                  />
                  <input
                    type="number"
                    className="input"
                    placeholder="Contact Hours"
                    value={mod.hours}
                    onChange={(e) => handleUpdateModule(idx, { hours: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="label" style={{ fontSize: '0.75rem' }}>Key Topics (Comma separated)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Topic 1, Topic 2, Lab practical..."
                    value={mod.topics.join(', ')}
                    onChange={(e) =>
                      handleUpdateModule(idx, {
                        topics: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Lessons & Lecture Notes */}
        <div className="card mb-6" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
                3. Video Lessons & Lab Resources
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0' }}>
                Add video lectures (YouTube / Cloud links) and lecture materials for registered students.
              </p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddLesson}>
              + Add Video Lesson
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lessons.map((les, idx) => (
              <div
                key={les.id}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-info">Lesson {idx + 1}</span>
                    <strong style={{ fontSize: '0.9rem' }}>{les.title}</strong>
                  </div>
                  {lessons.length > 1 && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                      onClick={() => handleDeleteLesson(idx)}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Lesson Title"
                    value={les.title}
                    onChange={(e) => handleUpdateLesson(idx, { title: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="YouTube Video URL (optional)"
                    value={les.video_url || ''}
                    onChange={(e) => handleUpdateLesson(idx, { video_url: e.target.value })}
                  />
                  <input
                    type="number"
                    className="input"
                    placeholder="Minutes"
                    value={les.duration_minutes}
                    onChange={(e) => handleUpdateLesson(idx, { duration_minutes: Number(e.target.value) })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/teacher/courses" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting || departments.length === 0}>
            {isSubmitting ? 'Saving Course Unit...' : '🚀 Publish & Save Course Unit'}
          </button>
        </div>
      </form>
    </PageWrapper>
  )
}
