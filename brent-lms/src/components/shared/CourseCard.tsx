import type { Course, Enrollment } from '@/lib/database.types'
import { SubjectBadge } from './SubjectBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface CourseCardProps {
  course: Course
  enrollment?: Enrollment | null
  showProgress?: boolean
  onClick?: () => void
}

export function CourseCard({ course, enrollment, showProgress = true, onClick }: CourseCardProps) {
  const lessonCount = course.lesson_count ?? 0
  const completedCount = enrollment?.completed_lesson_ids?.length ?? 0
  const progressPct = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0
  const isCompleted = !!enrollment?.completed_at

  return (
    <div className="course-card" onClick={onClick} role="button" tabIndex={0}>
      <div
        className="course-card-strip"
        style={{ backgroundColor: course.subject?.color_hex || 'var(--color-primary)' }}
      />
      <div className="course-card-pin" />
      <div className="course-card-body">
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <SubjectBadge subject={course.subject} />
        </div>
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-desc">{course.description || 'No description available.'}</p>
        <div className="course-card-meta">
          <span>👩‍🏫 {course.teacher?.full_name || 'Brent Teacher'}</span>
          <span>•</span>
          <span>📖 {lessonCount} lessons</span>
        </div>

        {showProgress && enrollment && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <ProgressBar
              value={progressPct}
              label={isCompleted ? 'Completed ✅' : 'Progress'}
              variant={isCompleted ? 'success' : 'primary'}
            />
          </div>
        )}
      </div>
      <div className="course-card-footer">
        <span className="text-xs text-muted">
          {course.class?.name ? `Class: ${course.class.name}` : 'All Grades'}
        </span>
        <span className="btn btn-sm btn-ghost" style={{ padding: 0, height: 'auto', minHeight: 0 }}>
          View Course →
        </span>
      </div>
    </div>
  )
}
