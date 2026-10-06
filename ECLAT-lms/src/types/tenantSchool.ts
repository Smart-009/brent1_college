// ============================================================
// Éclat Institute — Multi-Tenant Partner School Type Definitions
// ============================================================

export type AcademicCalendarSystem = 'term' | 'semester' | 'trimester' | 'quarter'

export interface AcademicCalendarPeriod {
  id: string
  name: string // e.g. "Term 1 (Winter/Spring)", "Semester 1 (Fall)"
  code: string // e.g. "T1-2026", "SEM-1"
  start_date: string
  end_date: string
  status: 'Active' | 'Upcoming' | 'Past'
  exam_start_date?: string
  exam_end_date?: string
  fee_deadline?: string
}

export type SchoolCurriculumType =
  | 'General Academic & Multi-Disciplinary'
  | 'National / CBC Curriculum'
  | 'Vocational & TVET College'
  | 'STEM & Technology Institute'
  | 'Business & Professional Academy'
  | 'British Curriculum (CAIE & Edexcel)'
  | 'American Curriculum'
  | 'Custom International'

export interface PartnerSchoolTenant {
  id: string
  name: string // e.g. "Hillcrest British International College"
  slug: string // unique URL slug: "hillcrest" -> eclat.institute/s/hillcrest
  motto: string
  logo_url: string
  primary_color: string // hex code e.g. "#881337"
  accent_color: string  // hex code e.g. "#d4af37"
  academic_system: AcademicCalendarSystem // 'term' (Term 1,2,3) vs 'semester' (Semester 1,2)
  academic_calendar: AcademicCalendarPeriod[]
  active_period_name: string // e.g. "Term 1, 2026" or "Semester 2, 2025/2026"
  curriculum_type: SchoolCurriculumType | string
  country: string
  city: string
  address: string
  contact_email: string
  contact_phone: string
  website?: string
  principal_name: string
  principal_title: string // e.g. "Principal", "Head of School", "Dean", "Director"
  principal_email: string
  stats: {
    students: number
    teachers: number
    classes: number
    departments: number
  }
  features_enabled: {
    student_portal: boolean
    teacher_portal: boolean
    bursar_portal: boolean
    principal_portal: boolean
    online_admissions: boolean
    biometric_attendance: boolean
    report_cards: boolean
    e_library: boolean
  }
  created_at: string
  is_verified: boolean
}

export interface CreateTenantSchoolInput {
  name: string
  slug: string
  motto?: string
  logo_url?: string
  primary_color: string
  accent_color?: string
  academic_system: AcademicCalendarSystem
  curriculum_type: PartnerSchoolTenant['curriculum_type']
  country: string
  city: string
  address?: string
  contact_email: string
  contact_phone: string
  principal_name: string
  principal_title?: string
  principal_email?: string
}
