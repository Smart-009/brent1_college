// ============================================================
// Éclat Institute — Intake Scheduler & Marketing Adverts Types
// ============================================================

export type IntakeStatus = 'Open' | 'Filling Fast' | 'Upcoming' | 'Closed' | 'Archived'

export type StudyMode =
  | '100% Online (Live & Recorded)'
  | 'Evening Classes (Live Interactive)'
  | 'Weekend Executive Cohort'
  | 'Self-Paced Masterclass & 1-on-1 Labs'

export interface IntakeSchedule {
  id: string
  title: string
  academic_year: string
  term_session: string
  headline: string
  description: string
  poster_image_url?: string
  promo_video_url?: string
  application_deadline: string
  orientation_date?: string
  commencement_date: string
  status: IntakeStatus
  target_courses: string[]
  early_bird_discount?: string
  installment_plan?: string
  study_modes: StudyMode[]
  contact_phone?: string
  contact_email?: string
  registration_fee?: string
  is_published: boolean
  featured?: boolean
  created_at: string
  updated_at?: string
}
