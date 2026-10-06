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
  custom_domain?: string // e.g. "portal.hillcrest.edu" or "lms.apextech.ac.ke"
  subdomain?: string     // e.g. "hillcrest" -> "hillcrest.eclat.institute"
  principal_name: string
  principal_title: string // e.g. "Principal", "Head of School", "Dean", "Director"
  principal_email: string
  subscription_tier?: 'starter' | 'growth' | 'enterprise'
  subscription_monthly_rate?: number // e.g. 29, 59, 99
  subscription_billing_cycle?: 'monthly' | 'annually'
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

export type TenantRole = 'admin' | 'principal' | 'teacher' | 'bursar' | 'student' | 'public'

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
  custom_domain?: string
  subscription_tier?: 'starter' | 'growth' | 'enterprise'
  subscription_monthly_rate?: number
  subscription_billing_cycle?: 'monthly' | 'annually'
}

// ============================================================
// Real School Management (SIS / LMS) Domain Models
// ============================================================

export interface TenantStaffMember {
  id: string
  school_slug: string
  full_name: string
  role: 'teacher' | 'bursar' | 'admin' | 'principal'
  email: string
  username: string
  temp_password?: string
  phone: string
  department: string
  title: string
  assigned_classes: string[]
  assigned_subjects: string[]
  salary_base: number
  salary_housing: number
  salary_transport: number
  salary_tax: number
  salary_pension: number
  net_salary: number
  status: 'active' | 'suspended'
  joined_date: string
}

export interface TenantStudentMember {
  id: string
  school_slug: string
  admission_number: string // e.g. "HC-2026-0042"
  full_name: string
  grade_class: string     // e.g. "Grade 10 Cambridge", "Form 3 Alpha"
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  username: string
  temp_password?: string
  fee_total: number
  fee_paid: number
  fee_balance: number
  attendance_percent: number
  status: 'active' | 'graduated' | 'suspended'
  admission_date: string
}

export interface TenantPayrollRecord {
  id: string
  school_slug: string
  month_period: string // e.g. "October 2026"
  staff_id: string
  staff_name: string
  role: string
  department: string
  base_salary: number
  housing_allowance: number
  transport_allowance: number
  gross_salary: number
  tax_deduction: number
  pension_deduction: number
  net_salary: number
  status: 'draft' | 'approved' | 'disbursed'
  disbursed_at?: string
  payment_method: 'Bank Wire' | 'Mobile Money' | 'Cheque'
}

export interface TenantGradeRecord {
  id: string
  school_slug: string
  student_id: string
  student_name: string
  admission_number: string
  class_name: string
  subject_name: string
  period_code: string // e.g. "TERM-1" or "SEM-1"
  cat1_score: number  // out of 20
  cat2_score: number  // out of 20
  exam_score: number  // out of 60
  total_score: number // out of 100
  grade: string       // 'A*', 'A', 'B', 'C', 'D', 'E'
  remarks: string
  teacher_name: string
  updated_at: string
}

export interface TenantLessonNote {
  id: string
  school_slug: string
  class_name: string
  subject_name: string
  title: string
  summary: string
  file_url?: string
  teacher_name: string
  created_at: string
}

export interface TenantFeePayment {
  id: string
  school_slug: string
  receipt_number: string
  student_id: string
  student_name: string
  admission_number: string
  amount: number
  period_name: string
  payment_method: 'Bank Wire' | 'Mobile Money (M-Pesa)' | 'Credit Card' | 'Cash'
  date: string
  recorded_by: string
}

export interface TenantTimetableEntry {
  id: string
  school_slug: string
  class_name: string
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  period_number: number
  start_time: string
  end_time: string
  subject_name: string
  teacher_name: string
  room: string
}

export interface TenantSessionUser {
  id: string
  school_slug: string
  name: string
  role: 'admin' | 'principal' | 'teacher' | 'bursar' | 'student' | 'public'
  username: string
  title?: string
  department?: string
  grade_class?: string
  admission_number?: string
  student_id?: string
  staff_id?: string
}
