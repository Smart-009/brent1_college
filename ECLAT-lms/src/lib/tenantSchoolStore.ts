import type { PartnerSchoolTenant, CreateTenantSchoolInput, AcademicCalendarPeriod } from '@/types/tenantSchool'

const STORAGE_KEY = 'eclat_partner_schools_tenants'

// Default Seed Partner Schools to provide immediate working demos
const INITIAL_PARTNER_SCHOOLS: PartnerSchoolTenant[] = [
  {
    id: 'sch_apex_tech',
    name: 'Apex Institute of Technology & Business',
    slug: 'apex-tech',
    motto: 'Practical Technology for Modern Enterprise',
    logo_url: '/logo.png',
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
  },
  {
    id: 'sch_st_jude',
    name: 'St. Jude Preparatory & High Academy',
    slug: 'st-jude',
    motto: 'Faith, Diligence and Integrity in Service',
    logo_url: '/logo.png',
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
  },
  {
    id: 'sch_hillcrest',
    name: 'Hillcrest British International College',
    slug: 'hillcrest',
    motto: 'Semper Ad Excellentiam — Always Toward Excellence',
    logo_url: '/logo.png',
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
      logo_url: input.logo_url?.trim() || '/logo.png',
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
}

export const tenantSchoolStore = new TenantSchoolStore()
