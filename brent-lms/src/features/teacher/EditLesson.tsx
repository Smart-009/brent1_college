import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { YouTubeEmbed } from '@/components/shared/YouTubeEmbed'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { isEditable, getEditTimeRemaining, extractYouTubeId } from '@/lib/utils'
import type { Lesson, Quiz } from '@/lib/database.types'

export function EditLesson() {
  const { id: lessonId } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [description, setDescription] = useState('')

  // Quiz states
  const [question, setQuestion] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [correctIndex, setCorrectIndex] = useState<number>(0)

  const [error, setError] = useState<string | null>(null)

  // Fetch lesson with quiz
  const { data: lesson, isLoading } = useQuery({
    queryKey: ['edit-lesson-detail', lessonId],
    queryFn: async () => {
      if (!lessonId) return null
      const { data, error } = await supabase
        .from('lessons')
        .select('*, quiz:quizzes(*)')
        .eq('id', lessonId)
        .single()
      if (error) throw error
      return data as Lesson & { quiz: Quiz }
    },
    enabled: !!lessonId,
  })

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '')
      setYoutubeUrl(lesson.youtube_url || '')
      setDescription(lesson.description || '')
      if (lesson.quiz) {
        setQuestion(lesson.quiz.question || '')
        setOptionA(lesson.quiz.options?.[0] || '')
        setOptionB(lesson.quiz.options?.[1] || '')
        setOptionC(lesson.quiz.options?.[2] || '')
        setOptionD(lesson.quiz.options?.[3] || '')
        setCorrectIndex(lesson.quiz.correct_option_index || 0)
      }
    }
  }, [lesson])

  const canEdit = profile?.role === 'admin' || (lesson ? isEditable(lesson.created_at) : true)

  // Save mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!lessonId) return
      if (!canEdit) throw new Error('24-hour edit window has expired. Contact admin to modify.')

      // Update lesson
      const { error: lessonErr } = await supabase
        .from('lessons')
        .update({
          title: title.trim(),
          youtube_url: youtubeUrl.trim(),
          description: description.trim() || null,
        })
        .eq('id', lessonId)

      if (lessonErr) throw lessonErr

      // Update quiz
      if (lesson?.quiz?.id) {
        const { error: quizErr } = await supabase
          .from('quizzes')
          .update({
            question: question.trim(),
            options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
            correct_option_index: correctIndex,
          })
          .eq('id', lesson.quiz.id)

        if (quizErr) throw quizErr
      }
    },
    onSuccess: () => {
      navigate('/teacher/courses')
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  if (isLoading) {
    return (
      <PageWrapper title="Loading Lesson...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (!lesson) {
    return (
      <PageWrapper title="Lesson Not Found">
        <div className="alert alert-danger">Lesson not found.</div>
      </PageWrapper>
    )
  }

  const videoId = extractYouTubeId(youtubeUrl)

  if (profile?.role !== 'admin') {
    return (
      <PageWrapper title="Access Restricted">
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            Administrator Access Only
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Only College Administrators are authorized to edit curriculum lessons and learning materials.
          </p>
          <Button variant="primary" onClick={() => navigate('/admin')}>
            ← Return to Dashboard
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={`Edit Lesson: ${lesson.title}`}>
      <Link to="/teacher/courses" className="lesson-back-link mb-4">
        ← Back to My Courses
      </Link>

      {/* 24h Lock Banner */}
      <div className="mb-6">
        {canEdit ? (
          <div className="alert alert-success">
            <span className="alert-icon">⏳</span>
            <div>
              <strong>Editable:</strong> You have {getEditTimeRemaining(lesson.created_at)} remaining to make changes before this lesson is locked.
            </div>
          </div>
        ) : (
          <div className="alert alert-warning">
            <span className="alert-icon">🔒</span>
            <div>
              <strong>24-Hour Lock Active:</strong> Uploaded lessons can only be edited within 24 hours. Contact school admin for overrides.
            </div>
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate() }} style={{ maxWidth: 760, margin: '0 auto' }}>
        {error && (
          <div className="alert alert-danger mb-4">
            <span className="alert-icon">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <div className="card mb-6">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>📹 Lesson Details</h3>
          </div>
          <div className="card-body">
            <fieldset disabled={!canEdit} style={{ border: 'none', padding: 0, margin: 0 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="editTitle">Lesson Title *</label>
                <input
                  id="editTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="editYt">YouTube Video URL *</label>
                <input
                  id="editYt"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                />
              </div>

              {videoId && (
                <div className="mt-4">
                  <YouTubeEmbed url={youtubeUrl} />
                </div>
              )}

              <div className="form-group mt-4">
                <label className="form-label" htmlFor="editDesc">Lesson Description</label>
                <textarea
                  id="editDesc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </fieldset>
          </div>
        </div>

        {/* Quiz Edit Section */}
        {lesson.quiz && (
          <div className="card mb-6">
            <div className="card-header">
              <h3 style={{ margin: 0 }}>❓ Quiz Question</h3>
            </div>
            <div className="card-body">
              <fieldset disabled={!canEdit} style={{ border: 'none', padding: 0, margin: 0 }}>
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Option A</label>
                    <input type="text" value={optionA} onChange={(e) => setOptionA(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Option B</label>
                    <input type="text" value={optionB} onChange={(e) => setOptionB(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Option C</label>
                    <input type="text" value={optionC} onChange={(e) => setOptionC(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Option D</label>
                    <input type="text" value={optionD} onChange={(e) => setOptionD(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group mt-4">
                  <label className="form-label">Correct Option</label>
                  <div className="flex gap-4 flex-wrap">
                    {['Option A', 'Option B', 'Option C', 'Option D'].map((opt, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="editCorrect"
                          checked={correctIndex === idx}
                          onChange={() => setCorrectIndex(idx)}
                          style={{ width: 'auto' }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mb-8">
          <Button type="button" variant="ghost" onClick={() => navigate('/teacher/courses')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!canEdit} loading={updateMutation.isPending}>
            Save Changes 💾
          </Button>
        </div>
      </form>
    </PageWrapper>
  )
}
