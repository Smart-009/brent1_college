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

  // Read current departments from store
  const [departments, setDepartments] = useState<CollegeDepartment[]>(() => schoolStore.getDepartments())

  // Course Basic Information
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [feeUsd, setFeeUsd] = useState<number>(75)
  const [category, setCategory] = useState('Tech & Programming')
  const [icon, setIcon] = useState('💻')
  const [courseDuration, setCourseDuration] = useState('3 Months (Certificate Course)')
  const [creditHours, setCreditHours] = useState(40)
  const [description, setDescription] = useState('')
  const [careerOutcomes, setCareerOutcomes] = useState('')

  // Department & Program Handling (Supports existing OR brand-new custom)
  const [isCustomDept, setIsCustomDept] = useState(departments.length === 0)
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || '')
  const [customDeptName, setCustomDeptName] = useState('')
  const [customDeptCode, setCustomDeptCode] = useState('')

  const [selectedProgram, setSelectedProgram] = useState<string>('')

  // Active department details
  const currentDept = useMemo(() => {
    return departments.find((d) => d.id === selectedDeptId) || departments[0]
  }, [departments, selectedDeptId])

  // Modules Builder State
  const [modules, setModules] = useState<SyllabusModule[]>([
    {
      id: `mod-${Date.now()}-1`,
      module_number: 1,
      title: 'Module 1: Foundations & Core Concepts',
      hours: 10,
      topics: ['Introduction to Core Architecture', 'Live Practical Code Lab'],
      learning_outcomes: ['Understand fundamental architecture and setup environment'],
    },
  ])

  // Lessons State
  const [lessons, setLessons] = useState<CourseUnit['lessons']>([
    {
      id: `les-${Date.now()}-1`,
      title: 'Lesson 1: Introduction & Environment Setup',
      video_url: '',
      duration_minutes: 45,
      content: 'Overview of the course prerequisites and software tools installation.',
    },
  ])

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
        title: `Module ${nextNum}: Advanced Practical Topic`,
        hours: 10,
        topics: ['Core concept analysis', 'Hands-on practical project lab'],
        learning_outcomes: ['Demonstrate practical mastery and implement lab project'],
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
    const nextNum = lessons.length + 1
    setLessons([
      ...lessons,
      {
        id: `les-${Date.now()}-${nextNum}`,
        title: `Lesson ${nextNum}: Practical Application & Live Demo`,
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
      setError('Course Code (e.g. CYB-101) and Course Title are required.')
      return
    }

    const deptNameFinal = isCustomDept
      ? customDeptName.trim()
      : (currentDept ? currentDept.name : 'Department of Computing & Tech')

    if (!deptNameFinal) {
      setError('Please provide an Academic Department name.')
      return
    }

    const programFinal = selectedProgram || (currentDept?.programs?.[0] || 'Short Course Certificate Program')

    setIsSubmitting(true)

    try {
      // 1. If custom department was introduced, persist it
      let finalDeptId = selectedDeptId
      if (isCustomDept && customDeptName.trim()) {
        const newDeptCode = (customDeptCode.trim() || code.trim().split('-')[0] || 'DEPT').toUpperCase()
        const newDept: CollegeDepartment = {
          id: `dept-${Date.now()}`,
          code: newDeptCode,
          name: customDeptName.trim(),
          hod_name: profile?.full_name || 'Department Faculty Lead',
          programs: programFinal ? [programFinal] : ['Certificate Program'],
          created_at: new Date().toISOString(),
        }
        await schoolStore.addDepartment(newDept)
        finalDeptId = newDept.id
        setDepartments(schoolStore.getDepartments())
      }

      // 2. Build CourseUnit record
      const cleanCode = code.trim().toUpperCase()
      const newUnit: CourseUnit = {
        id: `unit-${Date.now()}`,
        code: cleanCode,
        title: title.trim(),
        department: deptNameFinal,
        program: programFinal || title.trim(),
        course_duration: courseDuration,
        credit_hours: Number(creditHours) || 40,
        teacher_id: profile?.id || 'tch-lead',
        teacher_name: profile?.full_name || 'Faculty Lecturer',
        description: description.trim() || `Comprehensive online course in ${title.trim()}.`,
        syllabus_modules: modules,
        lessons,
        is_published: true,
        created_at: new Date().toISOString(),
      }

      // 3. Save CourseUnit to store
      await schoolStore.addCourseUnit(newUnit)

      // 4. Also register as a CollegeSubject (for Pricing, Bursar & Frontpage Catalog)
      const careersList = careerOutcomes
        ? careerOutcomes.split(',').map((c) => c.trim()).filter(Boolean)
        : [title.trim() + ' Specialist', 'Certified Professional']

      const newSubject: CollegeSubject = {
        id: `sub-${Date.now()}`,
        code: cleanCode,
        name: title.trim(),
        description: description.trim() || `Accredited ${courseDuration} course program.`,
        department_id: finalDeptId,
        department_name: deptNameFinal,
        fee: Number(feeUsd) || 75,
        duration: courseDuration,
        icon: icon || '💻',
        badge: 'New Course',
        category: category,
        careers: careersList,
        color_hex: '#1e3a8a',
        created_at: new Date().toISOString(),
      }

      await schoolStore.addSubject(newSubject)

      // 5. Cloud Supabase Insertion
      try {
        await supabase.from('courses').insert({
          title: newUnit.title,
          description: newUnit.description || '',
          teacher_id: profile?.id,
          is_published: true,
        })
      } catch (cloudErr) {
        console.warn('Cloud sync fallback to local store:', cloudErr)
      }

      // Broadcast storage event for live frontpage & catalog updates
      window.dispatchEvent(new Event('storage'))

      navigate('/teacher/courses')
    } catch (err: any) {
      setError(err.message || 'Failed to create course. Please verify input fields.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Allow both admin and teacher roles
  if (profile?.role !== 'admin' && profile?.role !== 'teacher') {
    return (
      <PageWrapper title="Access Restricted">
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            Faculty & Admin Access Only
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Only Faculty Instructors and College Administrators can introduce or publish courses.
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            ← Return Home
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      title="Create & Introduce New Course"
      subtitle="Introduce brand-new accredited short courses, define tuition fees, build syllabus modules, and publish video lectures."
    >
      <Link to="/teacher/courses" className="lesson-back-link mb-4">
        ← Back to Course Catalog
      </Link>

      <form onSubmit={handleSubmit} style={{ maxWidth: '960px', margin: '0 auto' }}>
        {error && (
          <div className="card mb-4" style={{ background: '#fee2e2', border: '1.5px solid #f87171', color: '#991b1b', padding: '1rem 1.25rem', borderRadius: '10px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.3rem' }}>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* 1. Core Course Identification & Pricing */}
        <div className="card mb-6" style={{ padding: '1.75rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>✨</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-primary)' }}>
              1. Course Identity & Tuition Fee
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="label">Course Code *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. CYB-101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Course Title *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. Cybersecurity & Ethical Hacking Masterclass"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Tuition Fee ($ USD) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#16a34a' }}>$</span>
                <input
                  type="number"
                  min="1"
                  required
                  className="input"
                  style={{ paddingLeft: '1.75rem', fontWeight: 800, color: '#16a34a' }}
                  value={feeUsd}
                  onChange={(e) => setFeeUsd(Number(e.target.value))}
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                Installment: 2x ${(feeUsd / 2).toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 100px', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Category */}
            <div>
              <label className="label">Course Category *</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Tech & Programming">💻 Tech & Programming</option>
                <option value="Languages & Communication">🗣️ Languages & Communication</option>
                <option value="Business Tech & Accounting">📊 Business Tech & Accounting</option>
                <option value="Computer & Digital Skills">🎨 Computer & Digital Skills</option>
                <option value="Executive Masterclass">🌟 Executive Masterclass</option>
              </select>
            </div>

            {/* Course Duration */}
            <div>
              <label className="label">Course Duration / Period *</label>
              <select className="input" value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)}>
                <option value="1 Month (Intensive Bootcamp)">1 Month (Intensive Bootcamp)</option>
                <option value="6 Weeks (Fast-Track Skills)">6 Weeks (Fast-Track Skills)</option>
                <option value="2 Months (8 Weeks Comprehensive)">2 Months (8 Weeks Comprehensive)</option>
                <option value="3 Months (Certificate Course)">3 Months (Certificate Course)</option>
                <option value="4 Months (Professional Short Course)">4 Months (Professional Short Course)</option>
                <option value="6 Months (Modular Diploma)">6 Months (Modular Diploma)</option>
                <option value="Self-Paced Short Course">Self-Paced Short Course</option>
              </select>
            </div>

            {/* Training Hours */}
            <div>
              <label className="label">Training Hours</label>
              <input
                type="number"
                min="5"
                max="300"
                className="input"
                value={creditHours}
                onChange={(e) => setCreditHours(Number(e.target.value))}
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="label">Icon</label>
              <select className="input" value={icon} onChange={(e) => setIcon(e.target.value)}>
                <option value="💻">💻</option>
                <option value="🛡️">🛡️</option>
                <option value="🤖">🤖</option>
                <option value="🌐">🌐</option>
                <option value="🗣️">🗣️</option>
                <option value="📱">📱</option>
                <option value="📊">📊</option>
                <option value="🎨">🎨</option>
                <option value="💼">💼</option>
                <option value="🇩🇪">🇩🇪</option>
                <option value="🇫🇷">🇫🇷</option>
                <option value="🇰🇪">🇰🇪</option>
                <option value="🌴">🌴</option>
              </select>
            </div>
          </div>

          {/* Department Selection & Custom Toggle */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>Academic Department & Accredited Program</strong>
              <button
                type="button"
                onClick={() => setIsCustomDept(!isCustomDept)}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
              >
                {isCustomDept ? '← Choose Existing Department' : '➕ Type New Custom Department'}
              </button>
            </div>

            {isCustomDept ? (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.75rem' }}>New Custom Department Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Department of Cybersecurity & Cloud Defense"
                    value={customDeptName}
                    onChange={(e) => setCustomDeptName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.75rem' }}>Dept Code</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. CYB"
                    value={customDeptCode}
                    onChange={(e) => setCustomDeptCode(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.75rem' }}>Select Existing Department</label>
                  <select
                    className="input"
                    value={selectedDeptId}
                    onChange={(e) => {
                      setSelectedDeptId(e.target.value)
                      const target = departments.find((d) => d.id === e.target.value)
                      if (target?.programs?.length) {
                        setSelectedProgram(target.programs[0])
                      }
                    }}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.75rem' }}>Program Track / Cohort</label>
                  {currentDept?.programs?.length ? (
                    <select className="input" value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
                      {currentDept.programs.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Certificate in Cybersecurity"
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description & Career Prospects */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Course Description & Objectives</label>
              <textarea
                rows={3}
                className="input"
                placeholder="Overview of syllabus, hands-on labs, and key technical learning goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Target Career Roles & Skills (Comma separated)</label>
              <textarea
                rows={3}
                className="input"
                placeholder="e.g. Cybersecurity Analyst, Security Auditor, Ethical Hacker, IT Security Officer"
                value={careerOutcomes}
                onChange={(e) => setCareerOutcomes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 2. Syllabus Topic Breakdown */}
        <div className="card mb-6" style={{ padding: '1.75rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>📑</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-primary)' }}>
                  2. Modular Syllabus & Topic Breakdown
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                Structure weekly practical modules, lab exercises, and expected competency outcomes.
              </p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddModule}>
              + Add Module
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {modules.map((mod, idx) => (
              <div
                key={mod.id}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      Module {mod.module_number}
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{mod.title}</strong>
                  </div>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                      onClick={() => handleDeleteModule(idx)}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
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
                  <label className="label" style={{ fontSize: '0.74rem' }}>Key Topics (Comma separated)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Topic 1, Topic 2, Practical lab..."
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

        {/* 3. Video Lessons & Lab Resources */}
        <div className="card mb-6" style={{ padding: '1.75rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🎬</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-primary)' }}>
                  3. Video Lectures & Online Lab Materials
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                Add YouTube, direct MP4, Vimeo, or Cloudflare R2 links for student streaming.
              </p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddLesson}>
              + Add Video Lecture
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lessons.map((les, idx) => (
              <div
                key={les.id}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      Lesson {idx + 1}
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{les.title}</strong>
                  </div>
                  {lessons.length > 1 && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                      onClick={() => handleDeleteLesson(idx)}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2.5fr 1fr', gap: '0.75rem' }}>
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
                    placeholder="YouTube URL, MP4 or Cloudflare R2 Link"
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingBottom: '3rem' }}>
          <Link to="/teacher/courses" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
            style={{ padding: '0.75rem 2rem', fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
          >
            {isSubmitting ? 'Publishing Course...' : '🚀 Publish Course to Academy & Student Portal'}
          </button>
        </div>
      </form>
    </PageWrapper>
  )
}
