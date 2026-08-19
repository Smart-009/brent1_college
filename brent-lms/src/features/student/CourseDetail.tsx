import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useAccess } from '@/hooks/useAccess'
import { supabase } from '@/lib/supabase'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SubjectBadge } from '@/components/shared/SubjectBadge'
import { LessonRow } from '@/components/shared/LessonRow'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Course, Lesson, Enrollment } from '@/lib/database.types'

export function CourseDetail() {
  const { id: courseId } = useParams<{ id: string }>()
  const { profile } = useAuth()
  useAccess()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch course detail
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: async () => {
      if (!courseId) return null
      const { data, error } = await supabase
        .from('courses')
        .select('*, subject:subjects(*), teacher:profiles!teacher_id(full_name), class:classes(*)')
        .eq('id', courseId)
        .single()
      if (error) throw error
      return data as Course
    },
    enabled: !!courseId,
  })

  // Fetch lessons for course
  const { data: lessons, isLoading: loadingLessons } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => {
      if (!courseId) return []
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data as Lesson[]
    },
    enabled: !!courseId,
  })

  // Fetch enrollment status for current student
  const { data: enrollment, isLoading: loadingEnrollment } = useQuery({
    queryKey: ['student-course-enrollment', courseId, profile?.id],
    queryFn: async () => {
      if (!courseId || !profile?.id) return null
      const { data } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', profile.id)
        .maybeSingle()
      return data as Enrollment | null
    },
    enabled: !!courseId && !!profile?.id,
  })

  // Auto-enroll and navigate to lesson
  const handleLessonClick = async (lessonId: string) => {
    if (!profile?.id || !courseId) return

    if (!enrollment) {
      await supabase.from('enrollments').insert({
        student_id: profile.id,
        course_id: courseId,
        completed_lesson_ids: [],
      })
      queryClient.invalidateQueries({ queryKey: ['student-course-enrollment', courseId, profile.id] })
    }

    navigate(`/student/lesson/${lessonId}`)
  }

  // Manual Enroll Button
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!courseId || !profile?.id) return
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          student_id: profile.id,
          course_id: courseId,
          completed_lesson_ids: [],
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-course-enrollment', courseId, profile?.id] })
    },
  })

  if (loadingCourse || loadingLessons || loadingEnrollment) {
    return (
      <PageWrapper title="Course Details">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (!course) {
    return (
      <PageWrapper title="Course Not Found">
        <div className="alert alert-danger">
          Course standard record not found or unavailable.
        </div>
      </PageWrapper>
    )
  }

  const isEnrolled = !!enrollment
  const completedIds = enrollment?.completed_lesson_ids || []
  const totalLessons = lessons?.length || 0
  const progressPct = totalLessons > 0 ? Math.round((completedIds.length / totalLessons) * 100) : 0
  const isCourseComplete = !!enrollment?.completed_at

  return (
    <PageWrapper title={course.title}>
      {/* Back button */}
      <Link to="/student/courses" className="lesson-back-link">
        ← Back to All Courses
      </Link>

      {/* Course Header Banner */}
      <div className="card mb-6" style={{ borderLeft: `6px solid ${course.subject?.color_hex || 'var(--color-primary)'}` }}>
        <div className="card-body">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <SubjectBadge subject={course.subject} />
            {course.class?.name && (
              <span className="badge badge-secondary">Class: {course.class.name}</span>
            )}
          </div>

          <h1 className="course-card-title" style={{ fontSize: 'var(--text-3xl)' }}>
            {course.title}
          </h1>

          <p style={{ margin: 'var(--space-3) 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>
            {course.description || 'No detailed description provided.'}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted mb-4 flex-wrap">
            <span>👩‍🏫 Instructor: <strong>{course.teacher?.full_name || 'Brent Teacher'}</strong></span>
            <span>📖 {totalLessons} Modules</span>
          </div>

          {/* Enrollment or Progress */}
          {!isEnrolled ? (
            <div className="alert alert-info flex justify-between items-center flex-wrap gap-4 mt-4">
              <div>
                <strong>Ready to start learning?</strong> Click any lesson below or press Enroll Now to begin!
              </div>
              <Button
                variant="primary"
                loading={enrollMutation.isPending}
                onClick={() => enrollMutation.mutate()}
              >
                Enroll Now 🚀
              </Button>
            </div>
          ) : (
            <div style={{ marginTop: 'var(--space-4)' }}>
              {isCourseComplete && (
                <div className="alert alert-success mb-4">
                  <span className="alert-icon">🏆</span>
                  <div>
                    <strong>Course Completed!</strong> Congratulations, you have passed all module quizzes for this course!
                  </div>
                </div>
              )}

              <ProgressBar
                value={progressPct}
                label={`${completedIds.length} of ${totalLessons} lessons completed`}
                variant={isCourseComplete ? 'success' : 'primary'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Lessons List */}
      <div>
        <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
          📖 Course Modules & Video Lessons
        </h2>

        {lessons && lessons.length > 0 ? (
          <div>
            {lessons.map((lesson, idx) => {
              const isCompleted = completedIds.includes(lesson.id)
              // First lesson (idx === 0) is ALWAYS unlocked.
              // Subsequent lessons require previous lesson completed.
              const isLocked = idx > 0 && !completedIds.includes(lessons[idx - 1].id)

              return (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={idx}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  onClick={() => handleLessonClick(lesson.id)}
                />
              )
            })}
          </div>
        ) : (
          <div className="empty-state card">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No Lessons Uploaded Yet</div>
            <div className="empty-state-desc">
              The teacher is preparing video lessons for this course. Please check back soon!
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
