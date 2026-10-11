import type {
  PartnerSchoolTenant,
  CreateTenantSchoolInput,
  AcademicCalendarPeriod,
  TenantStaffMember,
  TenantStudentMember,
  TenantPayrollRecord,
  TenantGradeRecord,
  TenantLessonNote,
  TenantFeePayment,
  TenantTimetableEntry,
  TenantSessionUser,
} from '@/types/tenantSchool'

const STORAGE_KEY = 'eclat_partner_schools_tenants'
const STAFF_STORAGE_KEY = 'eclat_tenant_staff_members'
const STUDENTS_STORAGE_KEY = 'eclat_tenant_students'
const PAYROLL_STORAGE_KEY = 'eclat_tenant_payroll'
const GRADES_STORAGE_KEY = 'eclat_tenant_grades'
const NOTES_STORAGE_KEY = 'eclat_tenant_lesson_notes'
const PAYMENTS_STORAGE_KEY = 'eclat_tenant_fee_payments'
const TIMETABLE_STORAGE_KEY = 'eclat_tenant_timetables'
const SESSION_STORAGE_KEY_PREFIX = 'eclat_tenant_session_'

// Default Seed Partner Schools to provide immediate working demos
const INITIAL_PARTNER_SCHOOLS: PartnerSchoolTenant[] = [
  {
    id: 'sch_apex_tech',
    name: 'Apex Institute of Technology & Business',
    slug: 'apex-tech',
    motto: 'Practical Technology for Modern Enterprise',
    logo_url: '/logo.png?v=2',
    primary_color: '#047857', // Emerald Green
    accent_color: '#0284c7',  // Sky Blue
    academic_system: 'semester', // Semester-based: Semester 1, Semester 2
    academic_calendar: [
      {
        id: 'cal_apex_s1',
        name: 'Semester 1 (Fall Cohort)',
        code: 'SEM-1',
        start_date: '2025-09-15',
        end_date: '2026-01-23',
        status: 'Past',
        exam_start_date: '2026-01-12',
        exam_end_date: '2026-01-22',
        fee_deadline: '2025-10-01',
      },
      {
        id: 'cal_apex_s2',
        name: 'Semester 2 (Spring Cohort)',
        code: 'SEM-2',
        start_date: '2026-02-09',
        end_date: '2026-06-26',
        status: 'Active',
        exam_start_date: '2026-06-15',
        exam_end_date: '2026-06-25',
        fee_deadline: '2026-03-01',
      },
    ],
    active_period_name: 'Semester 2 (Spring 2026)',
    curriculum_type: 'Vocational & TVET College',
    country: 'Kenya',
    city: 'Westlands, Nairobi',
    address: 'Apex Innovation Hub, Chiromo Lane',
    contact_email: 'registry@apextech.ac.ke',
    contact_phone: '+254 712 345 678',
    website: 'https://apextech.ac.ke',
    principal_name: 'Eng. Sarah Mwangi, Ph.D',
    principal_title: 'Dean of Institute',
    principal_email: 'dean@apextech.ac.ke',
    stats: {
      students: 650,
      teachers: 28,
      classes: 14,
      departments: 5,
    },
    features_enabled: {
      student_portal: true,
      teacher_portal: true,
      bursar_portal: true,
      principal_portal: true,
      online_admissions: true,
      biometric_attendance: false,
      report_cards: true,
      e_library: true,
    },
    created_at: '2025-10-15T10:00:00Z',
    is_verified: true,
    subscription_tier: 'enterprise',
    subscription_monthly_rate: 99,
    subscription_billing_cycle: 'monthly',
  },
  {
    id: 'sch_st_jude',
    name: 'St. Jude Preparatory & High Academy',
    slug: 'st-jude',
    motto: 'Faith, Diligence and Integrity in Service',
    logo_url: '/logo.png?v=2',
    primary_color: '#1d4ed8', // Royal Blue
    accent_color: '#f59e0b',  // Warm Amber
    academic_system: 'term',  // Term-based
    academic_calendar: [
      {
        id: 'cal_sj_t1',
        name: 'Term 1 (Opening Term 2026)',
        code: 'TERM-1',
        start_date: '2026-01-06',
        end_date: '2026-04-10',
        status: 'Active',
        exam_start_date: '2026-03-30',
        exam_end_date: '2026-04-09',
        fee_deadline: '2026-01-25',
      },
      {
        id: 'cal_sj_t2',
        name: 'Term 2 (Mid-Year Term 2026)',
        code: 'TERM-2',
        start_date: '2026-05-04',
        end_date: '2026-08-07',
        status: 'Upcoming',
        exam_start_date: '2026-07-27',
        exam_end_date: '2026-08-06',
        fee_deadline: '2026-05-20',
      },
      {
        id: 'cal_sj_t3',
        name: 'Term 3 (National Exam Term 2026)',
        code: 'TERM-3',
        start_date: '2026-08-31',
        end_date: '2026-11-20',
        status: 'Upcoming',
        exam_start_date: '2026-11-09',
        exam_end_date: '2026-11-19',
        fee_deadline: '2026-09-15',
      },
    ],
    active_period_name: 'Term 1, 2026',
    curriculum_type: 'National / CBC Curriculum',
    country: 'Kenya',
    city: 'Nakuru Campus',
    address: 'St. Jude Hills, Milimani Road, Nakuru',
    contact_email: 'info@stjudeacademy.ac.ke',
    contact_phone: '+254 733 999 888',
    website: 'https://stjudeacademy.ac.ke',
    principal_name: 'Sr. Agnes Mutiso, M.Ed',
    principal_title: 'Principal',
    principal_email: 'principal@stjudeacademy.ac.ke',
    stats: {
      students: 520,
      teachers: 36,
      classes: 20,
      departments: 4,
    },
    features_enabled: {
      student_portal: true,
      teacher_portal: true,
      bursar_portal: true,
      principal_portal: true,
      online_admissions: true,
      biometric_attendance: true,
      report_cards: true,
      e_library: true,
    },
    created_at: '2025-11-01T09:00:00Z',
    is_verified: true,
    subscription_tier: 'growth',
    subscription_monthly_rate: 59,
    subscription_billing_cycle: 'monthly',
  },
  {
    id: 'sch_hillcrest',
    name: 'Hillcrest British International College',
    slug: 'hillcrest',
    motto: 'Semper Ad Excellentiam — Always Toward Excellence',
    logo_url: '/logo.png?v=2',
    primary_color: '#881337', // Burgundy
    accent_color: '#d4af37',  // Gold
    academic_system: 'term',  // Term-based: Term 1, Term 2, Term 3
    academic_calendar: [
      {
        id: 'cal_hc_t1',
        name: 'Term 1 (Michaelmas Term)',
        code: 'TERM-1',
        start_date: '2026-01-08',
        end_date: '2026-04-03',
        status: 'Active',
        exam_start_date: '2026-03-23',
        exam_end_date: '2026-04-02',
        fee_deadline: '2026-01-20',
      },
      {
        id: 'cal_hc_t2',
        name: 'Term 2 (Lent Term)',
        code: 'TERM-2',
        start_date: '2026-04-28',
        end_date: '2026-07-24',
        status: 'Upcoming',
        exam_start_date: '2026-07-13',
        exam_end_date: '2026-07-23',
        fee_deadline: '2026-05-10',
      },
      {
        id: 'cal_hc_t3',
        name: 'Term 3 (Trinity Term)',
        code: 'TERM-3',
        start_date: '2026-09-02',
        end_date: '2026-11-27',
        status: 'Upcoming',
        exam_start_date: '2026-11-16',
        exam_end_date: '2026-11-26',
        fee_deadline: '2026-09-15',
      },
    ],
    active_period_name: 'Term 1 (Michaelmas 2026)',
    curriculum_type: 'British Curriculum (CAIE & Edexcel)',
    country: 'United Kingdom / Kenya',
    city: 'Nairobi Campus & London Office',
    address: 'Hillcrest Crescent, Karen, Nairobi',
    contact_email: 'admissions@hillcrest.edu',
    contact_phone: '+44 20 7946 0912 / +254 722 000 111',
    website: 'https://hillcrest.edu',
    principal_name: 'Dr. Arthur Sterling, M.Ed (Oxon)',
    principal_title: 'Head of School',
    principal_email: 'principal@hillcrest.edu',
    stats: {
      students: 480,
      teachers: 34,
      classes: 18,
      departments: 6,
    },
    features_enabled: {
      student_portal: true,
      teacher_portal: true,
      bursar_portal: true,
      principal_portal: true,
      online_admissions: true,
      biometric_attendance: true,
      report_cards: true,
      e_library: true,
    },
    created_at: '2025-09-01T08:00:00Z',
    is_verified: true,
    subscription_tier: 'growth',
    subscription_monthly_rate: 59,
    subscription_billing_cycle: 'annually',
  },
]

class TenantSchoolStore {
  private schools: PartnerSchoolTenant[] = []

  constructor() {
    this.loadSchools()
  }

  private loadSchools() {
    if (typeof window === 'undefined') {
      this.schools = [...INITIAL_PARTNER_SCHOOLS]
      return
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge any newly introduced demo schools if missing
          const existingSlugs = new Set(parsed.map((s: PartnerSchoolTenant) => s.slug.toLowerCase()))
          const merged = [...parsed]
          INITIAL_PARTNER_SCHOOLS.forEach((initSchool) => {
            if (!existingSlugs.has(initSchool.slug.toLowerCase())) {
              merged.push(initSchool)
            }
          })
          this.schools = merged
          return
        }
      }
    } catch {
      // Fallback
    }

    this.schools = [...INITIAL_PARTNER_SCHOOLS]
    this.saveSchools()
  }

  private saveSchools() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.schools))
      window.dispatchEvent(new CustomEvent('eclat-tenant-schools-updated', { detail: this.schools }))
    } catch {
      // ignore
    }
  }

  public getSchools(): PartnerSchoolTenant[] {
    return [...this.schools]
  }

  public getSchoolBySlug(slug: string): PartnerSchoolTenant | null {
    if (!slug) return null
    const cleanSlug = slug.trim().toLowerCase()
    return this.schools.find((s) => s.slug.toLowerCase() === cleanSlug) || null
  }

  public getSchoolById(id: string): PartnerSchoolTenant | null {
    return this.schools.find((s) => s.id === id) || null
  }

  public registerSchool(input: CreateTenantSchoolInput): PartnerSchoolTenant {
    // Sanitize and ensure unique slug
    let cleanSlug = input.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    if (!cleanSlug) {
      cleanSlug = input.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30)
    }

    // Check collision
    let finalSlug = cleanSlug
    let counter = 1
    while (this.schools.some((s) => s.slug.toLowerCase() === finalSlug.toLowerCase())) {
      finalSlug = `${cleanSlug}-${counter}`
      counter++
    }

    const currentYear = new Date().getFullYear()

    // Generate academic calendar periods based on choice
    const calendar: AcademicCalendarPeriod[] =
      input.academic_system === 'semester'
        ? [
            {
              id: `cal_${Date.now()}_sem1`,
              name: `Semester 1 (Fall Cohort ${currentYear})`,
              code: 'SEM-1',
              start_date: `${currentYear}-09-01`,
              end_date: `${currentYear + 1}-01-20`,
              status: 'Active',
              exam_start_date: `${currentYear + 1}-01-08`,
              exam_end_date: `${currentYear + 1}-01-18`,
              fee_deadline: `${currentYear}-09-20`,
            },
            {
              id: `cal_${Date.now()}_sem2`,
              name: `Semester 2 (Spring Cohort ${currentYear + 1})`,
              code: 'SEM-2',
              start_date: `${currentYear + 1}-02-05`,
              end_date: `${currentYear + 1}-06-25`,
              status: 'Upcoming',
              exam_start_date: `${currentYear + 1}-06-12`,
              exam_end_date: `${currentYear + 1}-06-22`,
              fee_deadline: `${currentYear + 1}-02-25`,
            },
          ]
        : [
            {
              id: `cal_${Date.now()}_term1`,
              name: `Term 1 (${currentYear})`,
              code: 'TERM-1',
              start_date: `${currentYear}-01-06`,
              end_date: `${currentYear}-04-03`,
              status: 'Active',
              exam_start_date: `${currentYear}-03-24`,
              exam_end_date: `${currentYear}-04-02`,
              fee_deadline: `${currentYear}-01-25`,
            },
            {
              id: `cal_${Date.now()}_term2`,
              name: `Term 2 (${currentYear})`,
              code: 'TERM-2',
              start_date: `${currentYear}-05-04`,
              end_date: `${currentYear}-08-07`,
              status: 'Upcoming',
              exam_start_date: `${currentYear}-07-28`,
              exam_end_date: `${currentYear}-08-06`,
              fee_deadline: `${currentYear}-05-20`,
            },
            {
              id: `cal_${Date.now()}_term3`,
              name: `Term 3 (${currentYear})`,
              code: 'TERM-3',
              start_date: `${currentYear}-08-31`,
              end_date: `${currentYear}-11-20`,
              status: 'Upcoming',
              exam_start_date: `${currentYear}-11-10`,
              exam_end_date: `${currentYear}-11-19`,
              fee_deadline: `${currentYear}-09-15`,
            },
          ]

    const activePeriodName =
      input.academic_system === 'semester'
        ? `Semester 1 (${currentYear})`
        : `Term 1 (${currentYear})`

    const newSchool: PartnerSchoolTenant = {
      id: `sch_${Date.now()}`,
      name: input.name.trim(),
      slug: finalSlug,
      motto: input.motto?.trim() || 'Knowledge, Discipline and Leadership',
      logo_url: input.logo_url?.trim() || '/logo.png?v=2',
      primary_color: input.primary_color || '#1e3a8a',
      accent_color: input.accent_color || '#d4af37',
      academic_system: input.academic_system,
      academic_calendar: calendar,
      active_period_name: activePeriodName,
      curriculum_type: input.curriculum_type,
      country: input.country.trim(),
      city: input.city.trim(),
      address: input.address?.trim() || `${input.city}, ${input.country}`,
      contact_email: input.contact_email.trim(),
      contact_phone: input.contact_phone.trim(),
      principal_name: input.principal_name.trim(),
      principal_title: input.principal_title?.trim() || 'Principal / Head of School',
      principal_email: input.principal_email?.trim() || input.contact_email.trim(),
      custom_domain: input.custom_domain?.trim() || undefined,
      subdomain: finalSlug,
      subscription_tier: input.subscription_tier || 'growth',
      subscription_monthly_rate: input.subscription_monthly_rate || (input.subscription_tier === 'starter' ? 29 : input.subscription_tier === 'enterprise' ? 99 : 59),
      subscription_billing_cycle: input.subscription_billing_cycle || 'monthly',
      stats: {
        students: 120,
        teachers: 12,
        classes: 6,
        departments: 3,
      },
      features_enabled: {
        student_portal: true,
        teacher_portal: true,
        bursar_portal: true,
        principal_portal: true,
        online_admissions: true,
        biometric_attendance: true,
        report_cards: true,
        e_library: true,
      },
      created_at: new Date().toISOString(),
      is_verified: true,
    }

    this.schools.unshift(newSchool)
    this.saveSchools()
    return newSchool
  }

  public updateSchoolCustomDomain(
    slug: string,
    customDomain: string
  ): PartnerSchoolTenant | null {
    return this.updateSchoolBranding(slug, {
      custom_domain: customDomain.trim() || undefined,
    })
  }

  public updateSchoolBranding(
    slug: string,
    updates: Partial<PartnerSchoolTenant>
  ): PartnerSchoolTenant | null {
    const school = this.getSchoolBySlug(slug)
    if (!school) return null

    const updated = { ...school, ...updates }
    this.schools = this.schools.map((s) => (s.id === school.id ? updated : s))
    this.saveSchools()
    return updated
  }

  public updateSchoolSubscription(
    slug: string,
    tier: 'starter' | 'growth' | 'enterprise',
    monthlyRate: number,
    billingCycle: 'monthly' | 'annually'
  ): PartnerSchoolTenant | null {
    return this.updateSchoolBranding(slug, {
      subscription_tier: tier,
      subscription_monthly_rate: monthlyRate,
      subscription_billing_cycle: billingCycle,
    })
  }

  // ============================================================
  // 1. STAFF MANAGEMENT & CREDENTIAL PROVISIONING
  // ============================================================
  private staff: TenantStaffMember[] = []

  private loadStaff() {
    if (typeof window === 'undefined') {
      this.staff = [...INITIAL_STAFF_MEMBERS]
      return
    }
    try {
      const stored = localStorage.getItem(STAFF_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.staff = parsed
          return
        }
      }
    } catch {
      // fallback
    }
    this.staff = [...INITIAL_STAFF_MEMBERS]
    this.saveStaff()
  }

  private saveStaff() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(this.staff))
    } catch {}
  }

  public getStaffBySchool(slug: string): TenantStaffMember[] {
    if (this.staff.length === 0) this.loadStaff()
    const clean = slug.toLowerCase()
    return this.staff.filter((s) => s.school_slug.toLowerCase() === clean)
  }

  public createStaffMember(
    input: Omit<TenantStaffMember, 'id' | 'joined_date' | 'net_salary' | 'status'>
  ): TenantStaffMember {
    if (this.staff.length === 0) this.loadStaff()
    const gross = (input.salary_base || 0) + (input.salary_housing || 0) + (input.salary_transport || 0)
    const deductions = (input.salary_tax || 0) + (input.salary_pension || 0)
    const net = Math.max(0, gross - deductions)

    const newStaff: TenantStaffMember = {
      ...input,
      id: `staff_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      net_salary: net,
      status: 'active',
      joined_date: new Date().toISOString().split('T')[0],
    }

    this.staff.unshift(newStaff)
    this.saveStaff()

    // Automatically add to active monthly payroll register
    if (this.payroll.length === 0) this.loadPayroll()
    const curMonth = 'October 2026'
    const newPayroll: TenantPayrollRecord = {
      id: `pr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      school_slug: newStaff.school_slug,
      month_period: curMonth,
      staff_id: newStaff.id,
      staff_name: newStaff.full_name,
      role: newStaff.role,
      department: newStaff.department,
      base_salary: input.salary_base || 3000,
      housing_allowance: input.salary_housing || 400,
      transport_allowance: input.salary_transport || 200,
      gross_salary: gross,
      tax_deduction: input.salary_tax || Math.round(gross * 0.18),
      pension_deduction: input.salary_pension || Math.round(gross * 0.06),
      net_salary: net,
      status: 'approved',
      payment_method: 'Bank Wire',
    }
    this.payroll.unshift(newPayroll)
    this.savePayroll()

    return newStaff
  }

  public deleteStaffMember(id: string): void {
    if (this.staff.length === 0) this.loadStaff()
    this.staff = this.staff.filter((s) => s.id !== id)
    this.saveStaff()
  }

  // ============================================================
  // 2. STUDENT ADMISSION & CREDENTIAL PROVISIONING
  // ============================================================
  private students: TenantStudentMember[] = []

  private loadStudents() {
    if (typeof window === 'undefined') {
      this.students = [...INITIAL_STUDENTS]
      return
    }
    try {
      const stored = localStorage.getItem(STUDENTS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.students = parsed
          return
        }
      }
    } catch {
      // fallback
    }
    this.students = [...INITIAL_STUDENTS]
    this.saveStudents()
  }

  private saveStudents() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(this.students))
    } catch {}
  }

  public getStudentsBySchool(slug: string): TenantStudentMember[] {
    if (this.students.length === 0) this.loadStudents()
    const clean = slug.toLowerCase()
    return this.students.filter((s) => s.school_slug.toLowerCase() === clean)
  }

  public admitStudent(
    input: Omit<TenantStudentMember, 'id' | 'admission_date' | 'fee_balance' | 'attendance_percent' | 'status'>
  ): TenantStudentMember {
    if (this.students.length === 0) this.loadStudents()
    const feeBalance = Math.max(0, (input.fee_total || 0) - (input.fee_paid || 0))

    const newStudent: TenantStudentMember = {
      ...input,
      id: `std_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fee_balance: feeBalance,
      attendance_percent: 100.0,
      status: 'active',
      admission_date: new Date().toISOString().split('T')[0],
    }

    this.students.unshift(newStudent)
    this.saveStudents()

    // Automatically record initial fee payment if any paid upon admission
    if (newStudent.fee_paid > 0) {
      this.recordFeePayment({
        school_slug: newStudent.school_slug,
        student_id: newStudent.id,
        student_name: newStudent.full_name,
        admission_number: newStudent.admission_number,
        amount: newStudent.fee_paid,
        period_name: 'Opening Term Registration & Tuition',
        payment_method: 'Bank Wire',
        recorded_by: 'Admissions Registrar',
      })
    }

    // Auto-seed default subjects in gradebook for new student so Report Card works immediately
    const defaultSubjects = [
      'Pure Mathematics (0580)',
      'First Language English (0500)',
      'Computer Science (0478)',
      'Physics (0625)',
      'Chemistry (0620)',
    ]
    defaultSubjects.forEach((subj) => {
      this.saveGradeRecord({
        school_slug: newStudent.school_slug,
        student_id: newStudent.id,
        student_name: newStudent.full_name,
        admission_number: newStudent.admission_number,
        class_name: newStudent.grade_class,
        subject_name: subj,
        period_code: 'TERM-1',
        cat1_score: 17,
        cat2_score: 18,
        exam_score: 52,
        remarks: 'Enrolled candidate; demonstrated high aptitude and steady academic diligence.',
        teacher_name: 'Subject Faculty Instructor',
      })
    })

    return newStudent
  }

  public updateStudent(id: string, updates: Partial<TenantStudentMember>): TenantStudentMember | null {
    if (this.students.length === 0) this.loadStudents()
    const student = this.students.find((s) => s.id === id)
    if (!student) return null

    const updated = { ...student, ...updates }
    if (typeof updates.fee_total === 'number' || typeof updates.fee_paid === 'number') {
      const total = typeof updates.fee_total === 'number' ? updates.fee_total : updated.fee_total
      const paid = typeof updates.fee_paid === 'number' ? updates.fee_paid : updated.fee_paid
      updated.fee_balance = Math.max(0, total - paid)
    }

    this.students = this.students.map((s) => (s.id === id ? updated : s))
    this.saveStudents()
    return updated
  }

  // ============================================================
  // 3. STAFF PAYROLL & COMPENSATION REGISTER
  // ============================================================
  private payroll: TenantPayrollRecord[] = []

  private loadPayroll() {
    if (typeof window === 'undefined') {
      this.payroll = [...INITIAL_PAYROLL_RECORDS]
      return
    }
    try {
      const stored = localStorage.getItem(PAYROLL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.payroll = parsed
          return
        }
      }
    } catch {
      // fallback
    }
    this.payroll = [...INITIAL_PAYROLL_RECORDS]
    this.savePayroll()
  }

  private savePayroll() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(this.payroll))
    } catch {}
  }

  public getPayrollBySchool(slug: string): TenantPayrollRecord[] {
    if (this.payroll.length === 0) this.loadPayroll()
    const clean = slug.toLowerCase()
    return this.payroll.filter((p) => p.school_slug.toLowerCase() === clean)
  }

  public generateMonthlyPayroll(slug: string, monthPeriod: string): TenantPayrollRecord[] {
    if (this.staff.length === 0) this.loadStaff()
    if (this.payroll.length === 0) this.loadPayroll()

    const schoolStaff = this.getStaffBySchool(slug)
    const existingForMonth = this.payroll.filter(
      (p) => p.school_slug.toLowerCase() === slug.toLowerCase() && p.month_period === monthPeriod
    )

    if (existingForMonth.length > 0) {
      return existingForMonth
    }

    const newRecords: TenantPayrollRecord[] = schoolStaff.map((st) => {
      const gross = st.salary_base + st.salary_housing + st.salary_transport
      return {
        id: `pr_${Date.now()}_${st.id}`,
        school_slug: slug,
        month_period: monthPeriod,
        staff_id: st.id,
        staff_name: st.full_name,
        role: st.title || st.role,
        department: st.department,
        base_salary: st.salary_base,
        housing_allowance: st.salary_housing,
        transport_allowance: st.salary_transport,
        gross_salary: gross,
        tax_deduction: st.salary_tax,
        pension_deduction: st.salary_pension,
        net_salary: st.net_salary,
        status: 'draft',
        payment_method: 'Bank Wire',
      }
    })

    this.payroll = [...newRecords, ...this.payroll]
    this.savePayroll()
    return newRecords
  }

  public approvePayrollBatch(slug: string, monthPeriod: string): void {
    if (this.payroll.length === 0) this.loadPayroll()
    this.payroll = this.payroll.map((p) => {
      if (p.school_slug.toLowerCase() === slug.toLowerCase() && p.month_period === monthPeriod) {
        return { ...p, status: 'approved' }
      }
      return p
    })
    this.savePayroll()
  }

  public disbursePayrollBatch(
    slug: string,
    monthPeriod: string,
    method: 'Bank Wire' | 'Mobile Money' | 'Cheque' = 'Bank Wire'
  ): void {
    if (this.payroll.length === 0) this.loadPayroll()
    const now = new Date().toISOString()
    this.payroll = this.payroll.map((p) => {
      if (p.school_slug.toLowerCase() === slug.toLowerCase() && p.month_period === monthPeriod) {
        return { ...p, status: 'disbursed', disbursed_at: now, payment_method: method }
      }
      return p
    })
    this.savePayroll()
  }

  // ============================================================
  // 4. CONTINUOUS ASSESSMENT GRADEBOOK & TRANSCRIPTS
  // ============================================================
  private grades: TenantGradeRecord[] = []

  private loadGrades() {
    if (typeof window === 'undefined') {
      this.grades = [...INITIAL_GRADES]
      return
    }
    try {
      const stored = localStorage.getItem(GRADES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.grades = parsed
          return
        }
      }
    } catch {
      // fallback
    }
    this.grades = [...INITIAL_GRADES]
    this.saveGrades()
  }

  private saveGrades() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(this.grades))
    } catch {}
  }

  public getGradesBySchool(slug: string): TenantGradeRecord[] {
    if (this.grades.length === 0) this.loadGrades()
    const clean = slug.toLowerCase()
    return this.grades.filter((g) => g.school_slug.toLowerCase() === clean)
  }

  public getGradesForStudent(slug: string, studentId: string): TenantGradeRecord[] {
    const schoolGrades = this.getGradesBySchool(slug)
    return schoolGrades.filter((g) => g.student_id === studentId)
  }

  public saveGradeRecord(
    input: Omit<TenantGradeRecord, 'id' | 'updated_at' | 'total_score' | 'grade'>
  ): TenantGradeRecord {
    if (this.grades.length === 0) this.loadGrades()
    const total = Math.min(100, Math.max(0, (input.cat1_score || 0) + (input.cat2_score || 0) + (input.exam_score || 0)))

    let gradeLetter = 'F'
    if (total >= 90) gradeLetter = 'A*'
    else if (total >= 80) gradeLetter = 'A'
    else if (total >= 70) gradeLetter = 'B'
    else if (total >= 60) gradeLetter = 'C'
    else if (total >= 50) gradeLetter = 'D'
    else if (total >= 40) gradeLetter = 'E'

    const existingIndex = this.grades.findIndex(
      (g) =>
        g.school_slug.toLowerCase() === input.school_slug.toLowerCase() &&
        g.student_id === input.student_id &&
        g.subject_name.toLowerCase() === input.subject_name.toLowerCase() &&
        g.period_code === input.period_code
    )

    const record: TenantGradeRecord = {
      ...input,
      id: existingIndex >= 0 ? this.grades[existingIndex].id : `grd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      total_score: total,
      grade: gradeLetter,
      updated_at: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      this.grades[existingIndex] = record
    } else {
      this.grades.unshift(record)
    }

    this.saveGrades()
    return record
  }

  // ============================================================
  // 5. LESSON STUDY NOTES & MATERIALS
  // ============================================================
  private lessonNotes: TenantLessonNote[] = []

  private loadLessonNotes() {
    if (typeof window === 'undefined') {
      this.lessonNotes = [...INITIAL_LESSON_NOTES]
      return
    }
    try {
      const stored = localStorage.getItem(NOTES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.lessonNotes = parsed
          return
        }
      }
    } catch {
      // fallback
    }
    this.lessonNotes = [...INITIAL_LESSON_NOTES]
    this.saveLessonNotes()
  }

  private saveLessonNotes() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(this.lessonNotes))
    } catch {}
  }

  public getLessonNotesBySchool(slug: string, className?: string): TenantLessonNote[] {
    if (this.lessonNotes.length === 0) this.loadLessonNotes()
    const clean = slug.toLowerCase()
    let filtered = this.lessonNotes.filter((n) => n.school_slug.toLowerCase() === clean)
    if (className) {
      filtered = filtered.filter((n) => n.class_name.toLowerCase() === className.toLowerCase())
    }
    return filtered
  }

  public createLessonNote(input: Omit<TenantLessonNote, 'id' | 'created_at'>): TenantLessonNote {
    if (this.lessonNotes.length === 0) this.loadLessonNotes()
    const newNote: TenantLessonNote = {
      ...input,
      id: `note_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    }
    this.lessonNotes.unshift(newNote)
    this.saveLessonNotes()
    return newNote
  }

  // ============================================================
  // 6. TUITION FEE INVOICES & VERIFIED RECEIPTING
  // ============================================================
  private payments: TenantFeePayment[] = []

  private loadPayments() {
    if (typeof window === 'undefined') {
      this.payments = [...INITIAL_PAYMENTS]
      return
    }
    try {
      const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.payments = parsed
          return
        }
      }
    } catch {
      // fallback
    }
    this.payments = [...INITIAL_PAYMENTS]
    this.savePayments()
  }

  private savePayments() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(this.payments))
    } catch {}
  }

  public getPaymentsBySchool(slug: string): TenantFeePayment[] {
    if (this.payments.length === 0) this.loadPayments()
    const clean = slug.toLowerCase()
    return this.payments.filter((p) => p.school_slug.toLowerCase() === clean)
  }

  public recordFeePayment(
    input: Omit<TenantFeePayment, 'id' | 'receipt_number' | 'date'>
  ): TenantFeePayment {
    if (this.payments.length === 0) this.loadPayments()
    const receiptNum = `RCP-${input.school_slug.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
    const newPayment: TenantFeePayment = {
      ...input,
      id: `pmt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      receipt_number: receiptNum,
      date: new Date().toISOString(),
    }

    this.payments.unshift(newPayment)
    this.savePayments()

    // Also update student fee_paid and fee_balance
    const student = this.students.find((s) => s.id === input.student_id)
    if (student) {
      const newPaid = student.fee_paid + input.amount
      this.updateStudent(student.id, { fee_paid: newPaid })
    }

    return newPayment
  }

  // ============================================================
  // 7. CLASS & FACULTY TIMETABLE SCHEDULE
  // ============================================================
  private timetables: TenantTimetableEntry[] = []

  private loadTimetables() {
    if (typeof window === 'undefined') {
      this.timetables = [...INITIAL_TIMETABLES]
      return
    }
    try {
      const stored = localStorage.getItem(TIMETABLE_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.timetables = parsed
          return
        }
      }
    } catch {}
    this.timetables = [...INITIAL_TIMETABLES]
    this.saveTimetables()
  }

  private saveTimetables() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(this.timetables))
    } catch {}
  }

  public getTimetableBySchool(slug: string, className?: string): TenantTimetableEntry[] {
    if (this.timetables.length === 0) this.loadTimetables()
    const clean = slug.toLowerCase()
    let list = this.timetables.filter((t) => t.school_slug.toLowerCase() === clean)
    if (className && className !== 'All') {
      list = list.filter((t) => t.class_name.toLowerCase() === className.toLowerCase())
    }
    if (list.length === 0) {
      list = this.generateDefaultTimetable(slug, className || 'General Cohort')
    }
    return list
  }

  private generateDefaultTimetable(slug: string, className: string): TenantTimetableEntry[] {
    const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ]
    const defaultPeriods = [
      { num: 1, start: '08:00', end: '08:50', sub: 'Mathematics & Logic', teacher: 'Lead Instructor', room: 'Lecture Hall 1' },
      { num: 2, start: '08:55', end: '09:45', sub: 'Language & Technical Writing', teacher: 'Department Faculty', room: 'Room 102' },
      { num: 3, start: '10:00', end: '10:50', sub: 'Applied Technology & Computing', teacher: 'Lab Director', room: 'Computer Lab' },
      { num: 4, start: '11:00', end: '11:50', sub: 'Core Sciences / Business Studies', teacher: 'Faculty Tutor', room: 'Room 201' },
      { num: 5, start: '12:00', end: '12:50', sub: 'Practical Workshop & Case Study', teacher: 'Senior Tutor', room: 'Seminar Room' },
      { num: 6, start: '14:00', end: '14:50', sub: 'Supervised Project & Research', teacher: 'Academic Mentor', room: 'Library / Lab' },
    ]
    const generated: TenantTimetableEntry[] = []
    days.forEach((day, dIdx) => {
      defaultPeriods.forEach((p) => {
        generated.push({
          id: `gen_tt_${slug}_${dIdx}_${p.num}`,
          school_slug: slug,
          class_name: className,
          day_of_week: day,
          period_number: p.num,
          start_time: p.start,
          end_time: p.end,
          subject_name: p.sub,
          teacher_name: p.teacher,
          room: p.room,
        })
      })
    })
    return generated
  }

  public addTimetableEntry(entry: Omit<TenantTimetableEntry, 'id'>): TenantTimetableEntry {
    if (this.timetables.length === 0) this.loadTimetables()
    const newEntry: TenantTimetableEntry = {
      ...entry,
      id: `tt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    }
    this.timetables.push(newEntry)
    this.saveTimetables()
    return newEntry
  }

  public deleteTimetableEntry(id: string): void {
    if (this.timetables.length === 0) this.loadTimetables()
    this.timetables = this.timetables.filter((t) => t.id !== id)
    this.saveTimetables()
  }

  // ============================================================
  // 8. ACTIVE TENANT USER SESSION MANAGEMENT
  // ============================================================
  public getActiveSession(slug: string): TenantSessionUser | null {
    if (typeof window === 'undefined') return null
    try {
      const key = `${SESSION_STORAGE_KEY_PREFIX}${slug.toLowerCase()}`
      const stored = sessionStorage.getItem(key) || localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {}
    return null
  }

  public setActiveSession(slug: string, session: TenantSessionUser | null): void {
    if (typeof window === 'undefined') return
    const key = `${SESSION_STORAGE_KEY_PREFIX}${slug.toLowerCase()}`
    try {
      if (session) {
        sessionStorage.setItem(key, JSON.stringify(session))
        localStorage.setItem(key, JSON.stringify(session))
      } else {
        sessionStorage.removeItem(key)
        localStorage.removeItem(key)
      }
      window.dispatchEvent(new CustomEvent('eclat-tenant-session-changed', { detail: { slug, session } }))
    } catch {}
  }
}


// ============================================================
// CLEAN BASELINE DATA STORE (ZERO SEEDED TEST DATA)
// ============================================================

const INITIAL_STAFF_MEMBERS: TenantStaffMember[] = []
const INITIAL_STUDENTS: TenantStudentMember[] = []
const INITIAL_PAYROLL_RECORDS: TenantPayrollRecord[] = []
const INITIAL_GRADES: TenantGradeRecord[] = []
const INITIAL_LESSON_NOTES: TenantLessonNote[] = []
const INITIAL_PAYMENTS: TenantFeePayment[] = []
const INITIAL_TIMETABLES: TenantTimetableEntry[] = []

export const tenantSchoolStore = new TenantSchoolStore()
