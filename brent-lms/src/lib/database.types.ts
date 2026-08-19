// ============================================================
// Brent College LMS — Database Types
// ============================================================

export type Role = 'admin' | 'teacher' | 'student' | 'parent' | 'bursar'
export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface Profile {
  id: string
  full_name: string
  admission_number: string
  role: Role
  first_login_at: string | null
  access_expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface Subject {
  id: string
  name: string
  color_hex: string
  created_at: string
}

export interface SchoolTerm {
  id: string
  name: string
  academic_year: string
  start_date: string
  end_date: string
  half_term_start: string | null
  half_term_end: string | null
  created_at: string
}

export interface Class {
  id: string
  name: string
  grade_level: string | null
  academic_year: string | null
  created_at: string
}

export interface ClassEnrollment {
  id: string
  student_id: string
  class_id: string
  enrolled_at: string
  class?: Class
  student?: Profile
}

export interface TeacherSubject {
  id: string
  teacher_id: string
  subject_id: string
  class_id: string | null
  created_at: string
  subject?: Subject
  class?: Class
}

export interface Course {
  id: string
  title: string
  description: string | null
  subject_id: string
  teacher_id: string
  class_id: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  subject?: Subject
  teacher?: Profile
  class?: Class
  lesson_count?: number
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  youtube_url: string
  order_index: number
  created_at: string
  edit_locked_at: string
  resources?: LessonResource[]
  quiz?: Quiz
}

export interface LessonResource {
  id: string
  lesson_id: string
  file_url: string
  file_name: string
  file_type: string
  uploaded_by: string
  created_at: string
  edit_locked_at: string
}

export interface Quiz {
  id: string
  lesson_id: string
  question: string
  options: string[]
  correct_option_index: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  student_id: string
  quiz_id: string
  selected_option: number
  is_correct: boolean
  attempted_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  completed_lesson_ids: string[]
  enrolled_at: string
  completed_at: string | null
  course?: Course
}

export interface ActivationCode {
  id: string
  code: string
  student_id: string
  duration_days: number
  created_by: string
  created_at: string
  used_at: string | null
  student?: Profile
}

export interface Attendance {
  id: string
  student_id: string
  class_id: string
  date: string
  status: AttendanceStatus
  marked_by: string
  created_at: string
  student?: Profile
}

export interface Announcement {
  id: string
  title: string
  body: string
  author_id: string
  target: string
  pinned: boolean
  created_at: string
  expires_at: string | null
  author?: Profile
}

export interface Notification {
  id: string
  user_id: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_emoji: string
  criteria_type: string
  criteria_value: number
  created_at: string
}

export interface StudentBadge {
  id: string
  student_id: string
  badge_id: string
  awarded_at: string
  badge?: Badge
}

export interface Streak {
  student_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
}

// ---- College & Tertiary Grading Helpers ----
export function getCollegeGrade(percentage: number): string {
  if (percentage >= 70) return 'A'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C'
  if (percentage >= 40) return 'D'
  return 'F'
}

export function getCollegeLabel(grade: string): string {
  const labels: Record<string, string> = {
    A: 'Distinction (70% - 100%)',
    B: 'Credit (60% - 69%)',
    C: 'Pass (50% - 59%)',
    D: 'Subsidiary Pass (40% - 49%)',
    F: 'Fail / Re-sit (0% - 39%)',
  }
  return labels[grade] ?? grade
}

export function getCollegeColor(grade: string): string {
  if (grade === 'A') return '#16a34a'
  if (grade === 'B') return '#2563eb'
  if (grade === 'C') return '#0891b2'
  if (grade === 'D') return '#d97706'
  return '#dc2626'
}

// Backwards compatibility aliases
export const getCBCGrade = getCollegeGrade
export const getCBCLabel = getCollegeLabel
export const getCBCColor = getCollegeColor
