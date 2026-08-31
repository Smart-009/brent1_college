import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useAccess } from '@/hooks/useAccess'
import { supabase } from '@/lib/supabase'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { YouTubeEmbed } from '@/components/shared/YouTubeEmbed'
import { QuizWidget } from '@/components/shared/QuizWidget'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { schoolStore } from '@/lib/schoolData'
import type { Lesson, Course, Quiz, LessonResource, Enrollment, QuizAttempt } from '@/lib/database.types'

function HtmlViewer({ fileUrl, title }: { fileUrl: string; title: string }) {
  const { data: htmlContent, isLoading } = useQuery({
    queryKey: ['html-file-body', fileUrl],
    queryFn: async () => {
      const res = await fetch(fileUrl)
      if (!res.ok) throw new Error('Failed to load file content')
      return res.text()
    },
    staleTime: 1000 * 60 * 10,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted">
        <Spinner size="sm" /> Rendering interactive HTML web page...
      </div>
    )
  }

  return (
    <iframe
      srcDoc={htmlContent || ''}
      title={title}
      sandbox="allow-scripts allow-same-origin allow-forms"
      style={{
        width: '100%',
        height: 520,
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        background: '#ffffff',
      }}
    />
  )
}

export function LessonPlayer() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const { profile } = useAuth()
  useAccess()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeHtmlUrl, setActiveHtmlUrl] = useState<string | null>(null)
  const [activeDocUrl, setActiveDocUrl] = useState<string | null>(null)
  const [docEngine, setDocEngine] = useState<'cloud' | 'direct'>('cloud')

  // Combined instant parallel query (eliminates network waterfall delays)
  const { data, isLoading, error } = useQuery({
    queryKey: ['lesson-player-instant-v3', lessonId, profile?.id],
    queryFn: async () => {
      if (!lessonId) return null

      // Step 1: Fetch lesson record
      const { data: lessonData, error: lessonErr } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (lessonErr || !lessonData) throw lessonErr || new Error('Lesson not found')

      // Step 2: Fetch all sub-resources in parallel
      const [resourcesRes, quizzesRes, courseRes, courseLessonsRes, enrollmentRes] = await Promise.all([
        supabase.from('lesson_resources').select('*').eq('lesson_id', lessonId),
        supabase.from('quizzes').select('*').eq('lesson_id', lessonId),
        supabase.from('courses').select('*').eq('id', lessonData.course_id).single(),
        supabase.from('lessons').select('id, title, order_index').eq('course_id', lessonData.course_id).order('order_index', { ascending: true }),
        profile?.id
          ? supabase.from('enrollments').select('*').eq('course_id', lessonData.course_id).eq('student_id', profile.id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ])

      const quizIds = (quizzesRes.data || []).map((q) => q.id)
      const attemptsRes = quizIds.length > 0 && profile?.id
        ? await supabase.from('quiz_attempts').select('*').in('quiz_id', quizIds).eq('student_id', profile.id)
        : { data: [] }

      // Also merge any local CourseUnit syllabus module attachments & Google Meet classroom links
      const storeUnits = schoolStore.getCourseUnits()
      const matchingUnit = storeUnits.find(
        (u) => u.id === lessonData.course_id || u.title?.toLowerCase() === courseRes.data?.title?.toLowerCase()
      )

      const storeResources: LessonResource[] = []
      matchingUnit?.syllabus_modules?.forEach((m) => {
        m.resources?.forEach((r) => {
          storeResources.push({
            id: r.id,
            lesson_id: lessonData.id,
            file_name: r.file_name,
            file_url: r.file_url,
            file_type: r.file_type || 'application/pdf',
            uploaded_by: matchingUnit?.teacher_id || 'tch-lead',
            edit_locked_at: '' as any,
            created_at: new Date().toISOString(),
          } as unknown as LessonResource)
        })
      })

      const finalMeetingUrl = (lessonData as any).meeting_url || matchingUnit?.live_meeting_url || matchingUnit?.lessons?.find((l) => l.id === lessonId)?.meeting_url

      return {
        lesson: {
          ...(lessonData as Lesson),
          meeting_url: finalMeetingUrl,
        } as Lesson & { meeting_url?: string },
        resources: [...(resourcesRes.data || []), ...storeResources] as LessonResource[],
        quizzes: (quizzesRes.data || []) as Quiz[],
        course: courseRes.data as Course | null,
        courseLessons: (courseLessonsRes.data || []) as Array<{ id: string; title: string; order_index: number }>,
        enrollment: enrollmentRes.data as Enrollment | null,
        attempts: (attemptsRes.data || []) as QuizAttempt[],
        unit: matchingUnit,
      }
    },
    enabled: !!lessonId,
    staleTime: 1000 * 60 * 5, // 5 minute cache for instant loads
    retry: 1,
  })

  // Open HTML in new tab as rendered web page (overrides plain text CDN headers)
  const handleOpenHtmlInNewTab = async (fileUrl: string) => {
    try {
      const res = await fetch(fileUrl)
      const text = await res.text()
      const blob = new Blob([text], { type: 'text/html;charset=utf-8' })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    } catch {
      window.open(fileUrl, '_blank')
    }
  }

  if (isLoading) {
    return (
      <PageWrapper title="Loading Lesson...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !data || !data.lesson) {
    return (
      <PageWrapper title="Lesson Not Found">
        <div className="alert alert-danger mb-4">
          Lesson record not found or error loading data ({error ? String(error) : 'Unknown'}).
        </div>
        <Link to="/student/courses" className="lesson-back-link">
          ← Return to All Courses
        </Link>
      </PageWrapper>
    )
  }

  const { lesson, resources, quizzes, course, courseLessons, enrollment, attempts } = data

  const quizIds = quizzes.map((q) => q.id)
  const isLessonAlreadyCompleted = enrollment?.completed_lesson_ids?.includes(lessonId!) || false
  const hasPassed = isLessonAlreadyCompleted || (quizIds.length > 0 && quizIds.every((qid) => attempts?.some((a) => a.quiz_id === qid && a.is_correct)))

  // Handle multi-question quiz completion and course progress update
  const handleQuizComplete = async (
    allCorrect: boolean,
    attemptList: Array<{ quizId: string; selectedIndex: number; isCorrect: boolean }>
  ) => {
    if (!profile?.id || !lessonId || !lesson.course_id) return

    // 1. Bulk insert attempts for all questions
    const records = attemptList.map((att) => ({
      student_id: profile.id,
      quiz_id: att.quizId,
      selected_option: att.selectedIndex,
      is_correct: att.isCorrect,
    }))

    await supabase.from('quiz_attempts').insert(records)

    if (allCorrect) {
      const currentCompleted = enrollment?.completed_lesson_ids || []
      const updatedCompleted = Array.from(new Set([...currentCompleted, lessonId]))
      const isAllCompleted = courseLessons && courseLessons.length > 0 && updatedCompleted.length >= courseLessons.length

      // 2. Upsert enrollment progress
      await supabase.from('enrollments').upsert({
        student_id: profile.id,
        course_id: lesson.course_id,
        completed_lesson_ids: updatedCompleted,
        completed_at: isAllCompleted ? new Date().toISOString() : enrollment?.completed_at || null,
      })

      // 3. Award badges via DB RPC
      await supabase.rpc('award_badge', { p_student_id: profile.id, p_criteria_type: 'first_lesson' })
      await supabase.rpc('award_badge', { p_student_id: profile.id, p_criteria_type: 'lessons_count' })
      if (isAllCompleted) {
        await supabase.rpc('award_badge', { p_student_id: profile.id, p_criteria_type: 'course_complete' })
      }

      // 4. Create notification
      await supabase.from('notifications').insert({
        user_id: profile.id,
        message: `Module completed: ${lesson.title} ✅`,
        link: `/student/courses/${lesson.course_id}`,
      })

      queryClient.invalidateQueries({ queryKey: ['lesson-player-instant-v3'] })
    }
  }

  const [videoCompletedToast, setVideoCompletedToast] = useState(false)

  // Handle smart auto-completion when student finishes video
  const handleVideoComplete = async () => {
    setVideoCompletedToast(true)
    setTimeout(() => setVideoCompletedToast(false), 8000)

    if (!profile?.id || !lessonId || !lesson.course_id) return

    // If lesson has no quizzes, automatically mark the whole lesson as completed in Supabase
    if (!quizzes || quizzes.length === 0) {
      const currentCompleted = enrollment?.completed_lesson_ids || []
      const updatedCompleted = Array.from(new Set([...currentCompleted, lessonId]))
      const isAllCompleted = courseLessons && courseLessons.length > 0 && updatedCompleted.length >= courseLessons.length

      await supabase.from('enrollments').upsert({
        student_id: profile.id,
        course_id: lesson.course_id,
        completed_lesson_ids: updatedCompleted,
        completed_at: isAllCompleted ? new Date().toISOString() : enrollment?.completed_at || null,
      })

      await supabase.rpc('award_badge', { p_student_id: profile.id, p_criteria_type: 'first_lesson' })
      await supabase.rpc('award_badge', { p_student_id: profile.id, p_criteria_type: 'lessons_count' })
      if (isAllCompleted) {
        await supabase.rpc('award_badge', { p_student_id: profile.id, p_criteria_type: 'course_complete' })
      }

      await supabase.from('notifications').insert({
        user_id: profile.id,
        message: `Video finished & module cleared: ${lesson.title} 🎓`,
        link: `/student/courses/${lesson.course_id}`,
      })

      queryClient.invalidateQueries({ queryKey: ['lesson-player-instant-v3'] })
    }
  }

  // Find next lesson
  const currentIndex = courseLessons?.findIndex((l) => l.id === lessonId) ?? -1
  const nextLesson = currentIndex !== -1 && courseLessons && currentIndex < courseLessons.length - 1
    ? courseLessons[currentIndex + 1]
    : null

  // Check if student has paid and is cleared
  const allStudents = schoolStore.getStudents()
  const currentStudent = allStudents.find(
    (s) => s.admission_number === profile?.admission_number || s.id === profile?.id
  )
  const isPaidAndCleared =
    profile?.role !== 'student' ||
    (currentStudent ? currentStudent.fee_cleared || currentStudent.fee_balance === 0 : true)

  return (
    <div className="lesson-page animate-fade-in">
      {/* Navigation link back to course */}
      <Link to={`/student/courses/${lesson.course_id}`} className="lesson-back-link">
        ← Back to {course?.title || 'Course'}
      </Link>

      <h1 className="lesson-title">{lesson.title}</h1>
      {lesson.description && <p className="lesson-desc">{lesson.description}</p>}

      {/* Access Gate: Locked if Unpaid Student */}
      {!isPaidAndCleared ? (
        <div className="card my-8" style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', maxWidth: '680px', margin: '2rem auto' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#92400e', margin: '0 0 0.5rem' }}>
            Access Restricted — Tuition Fee Clearance Required
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#78350f', lineHeight: '1.6', margin: '0 0 1.5rem' }}>
            This lecture video and downloadable course notes are exclusively accessible to students with verified tuition clearance.
          </p>
          <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '1.5rem', display: 'inline-block', textAlign: 'left', minWidth: '320px' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              Student: {currentStudent?.full_name || profile?.full_name} ({currentStudent?.admission_number || profile?.admission_number})
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626', margin: '0.25rem 0' }}>
              Outstanding Balance: ${currentStudent ? currentStudent.fee_balance.toLocaleString() : '85'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}>
              Settle tuition balance via the Student Bursar Portal or Cards/Bank/Mobile Money
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/fees" className="btn btn-primary">
              💳 Settle Tuition Balance
            </Link>
            <Link to="/student" className="btn btn-secondary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Live Virtual Classroom Google Meet / Zoom Banner */}
          {((lesson as any).meeting_url || data?.unit?.live_meeting_url) && (
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 4px 15px rgba(37,99,235,0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.2rem', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>🎥</div>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>Live Virtual Classroom & Interactive Lab</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    {data?.unit?.live_schedule_text || 'Interactive live session active. Click to join faculty instructor.'}
                  </div>
                </div>
              </div>
              <a
                href={(lesson as any).meeting_url || data?.unit?.live_meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 800, padding: '0.65rem 1.4rem', borderRadius: '8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>🎥</span> Join Google Meet Live Class ↗
              </a>
            </div>
          )}

          {/* Universal Smart Video Player (With Auto-Resume & Auto-Completion) */}
          <YouTubeEmbed
            url={lesson.youtube_url}
            title={lesson.title}
            lessonId={lesson.id}
            studentId={profile?.id}
            onEnded={handleVideoComplete}
          />

          {/* Video Completion Floating Banner */}
          {videoCompletedToast && (
            <div
              style={{
                background: '#dcfce7',
                border: '2px solid #86efac',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(22, 101, 52, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🎉</span>
                <div>
                  <strong style={{ color: '#166534', fontSize: '0.95rem' }}>Video Lecture Finished!</strong>
                  <div style={{ color: '#15803d', fontSize: '0.8rem', marginTop: '2px' }}>
                    {quizzes && quizzes.length > 0
                      ? 'Great job watching! Complete the quick quiz below to test your understanding.'
                      : 'Module progress recorded! You can now proceed to the next module.'}
                  </div>
                </div>
              </div>
              {nextLesson && (
                <Button variant="primary" size="sm" onClick={() => navigate(`/student/lesson/${nextLesson.id}`)}>
                  Next Module: {nextLesson.title} →
                </Button>
              )}
            </div>
          )}

      {/* PDF & HTML Learning Resources */}
      {resources && resources.length > 0 && (
        <div className="lesson-resources">
          <div className="lesson-resources-title">📄 Lesson Attachments, Notes & Interactive HTML Labs</div>
          <div className="flex flex-col gap-3">
            {resources.map((res) => {
              const isHtml = res.file_name.endsWith('.html') || res.file_name.endsWith('.htm') || res.file_type === 'text/html'
              return (
                <div key={res.id} className="card p-3" style={{ border: '1px solid var(--color-border-light)' }}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 20 }}>{isHtml ? '🌐' : '📄'}</span>
                      <div>
                        <span className="font-bold text-sm">{res.file_name}</span>
                        <span className="text-xs text-muted block">
                          {isHtml ? 'Interactive Web HTML Lab / Material' : 'Document File'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isHtml && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => setActiveHtmlUrl(activeHtmlUrl === res.file_url ? null : res.file_url)}
                          >
                            {activeHtmlUrl === res.file_url ? 'Hide Preview 👁️' : 'Preview Interactive HTML 👁️'}
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => handleOpenHtmlInNewTab(res.file_url)}
                          >
                            Open in New Tab ↗
                          </button>
                        </>
                      )}

                      {!isHtml && (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => setActiveDocUrl(activeDocUrl === res.file_url ? null : res.file_url)}
                        >
                          {activeDocUrl === res.file_url ? 'Hide Document ✕' : 'Read Document Online 🔒'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Native HTML Render via srcDoc */}
                  {isHtml && activeHtmlUrl === res.file_url && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                      <HtmlViewer fileUrl={res.file_url} title={res.file_name} />
                    </div>
                  )}

                  {/* DRM Protected Document Viewer */}
                  {!isHtml && activeDocUrl === res.file_url && (
                    <div
                      className="mt-3 pt-3 drm-protected-viewport"
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ borderTop: '1px solid var(--color-border-light)', position: 'relative', overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: '0.45rem 0.85rem',
                          background: '#f8fafc',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          marginBottom: '0.6rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', color: '#1e3a8a', fontWeight: 700 }}>
                          🔒 Protected Reader: {res.file_name}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className={`btn btn-xs ${docEngine === 'cloud' ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ fontSize: '0.72rem', padding: '2px 8px', minHeight: 'auto' }}
                            onClick={() => setDocEngine('cloud')}
                          >
                            🌐 Cloud Reader
                          </button>
                          <button
                            type="button"
                            className={`btn btn-xs ${docEngine === 'direct' ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ fontSize: '0.72rem', padding: '2px 8px', minHeight: 'auto' }}
                            onClick={() => setDocEngine('direct')}
                          >
                            📄 Direct Stream
                          </button>
                        </div>
                      </div>
                      <iframe
                        src={
                          docEngine === 'cloud' && res.file_url?.startsWith('http')
                            ? `https://docs.google.com/viewer?url=${encodeURIComponent(res.file_url)}&embedded=true`
                            : res.file_url
                        }
                        title={res.file_name}
                        style={{
                          width: '100%',
                          height: 580,
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          background: '#ffffff',
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Lesson Quiz Widget */}
      {quizzes && quizzes.length > 0 ? (
        <QuizWidget
          quizzes={quizzes}
          onComplete={handleQuizComplete}
          alreadyPassed={hasPassed || isLessonAlreadyCompleted}
        />
      ) : (
        <div className="alert alert-info mt-6">
          ℹ️ No quiz for this lesson. You may proceed to the next module.
        </div>
      )}

      {/* Next Lesson Button */}
      {(hasPassed || isLessonAlreadyCompleted || !quizzes || quizzes.length === 0) && (
        <div className="mt-8 flex justify-end">
          {nextLesson ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/student/lesson/${nextLesson.id}`)}
            >
              Next Module: {nextLesson.title} →
            </Button>
          ) : (
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate(`/student/courses/${lesson.course_id}`)}
            >
              Finish & Return to Course Summary 🏆
            </Button>
          )}
        </div>
      )}
        </>
      )}
    </div>
  )
}
