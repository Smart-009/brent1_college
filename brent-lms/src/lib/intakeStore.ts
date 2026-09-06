// ============================================================
// Éclat Institute — Intake Scheduler & Marketing Store
// Handles Database Persistence (Supabase) + Offline LocalStorage Cache
// ============================================================

import { supabase } from './supabase'
import { INSTITUTION_CONFIG } from '@/config/institution'
import type { IntakeSchedule } from '@/types/intake'

const INTAKE_STORAGE_KEY = 'eclat_intake_schedules_store'

export const INITIAL_INTAKE_SCHEDULES: IntakeSchedule[] = [
  {
    id: 'intake-2027-01',
    title: 'January 2027 Global Professional Intake',
    academic_year: '2027',
    term_session: 'Term 1 / First Quarter 2027',
    headline: 'Admissions Open — 100% Online Live Classes & Modular Certificate Programs',
    description:
      'Enroll in accredited career-ready programs across Full-Stack Web Engineering (React 19 & Node.js), Python Data Science, IELTS Band 8.5 Preparation, Cybersecurity SOC Operations, and Computerized Accounting. Evening and weekend cohorts available with live mentor code reviews.',
    poster_image_url:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    application_deadline: '2027-01-15',
    orientation_date: '2027-01-18',
    commencement_date: '2027-01-20',
    status: 'Open',
    target_courses: [
      'Full-Stack Web Development (React & Node.js)',
      'Python for Beginners & Data Analytics',
      'IELTS Academic / General Training Exam Prep',
      'Cybersecurity Fundamentals & Threat Defense',
      'Computerized Accounting (QuickBooks & iTax)',
    ],
    early_bird_discount: '⭐ 15% Early Registration Scholarship (First 30 Students)',
    installment_plan: 'Flexible 2 to 3 Monthly Installments ($ USD & KES Paybill)',
    study_modes: [
      '100% Online (Live & Recorded)',
      'Evening Classes (Live Interactive)',
      'Weekend Executive Cohort',
    ],
    contact_phone: INSTITUTION_CONFIG.contact.phone,
    contact_email: INSTITUTION_CONFIG.contact.admissionsEmail,
    registration_fee: 'Free ($0 USD Application Fee)',
    is_published: true,
    featured: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-04T12:00:00.000Z',
  },
  {
    id: 'intake-2026-09',
    title: 'September 2026 Fast-Track Short Course Cohort',
    academic_year: '2026',
    term_session: 'Term 3 / Autumn Cohort',
    headline: 'Accelerated 4-8 Week Career Certifications — Evening & Weekend Labs',
    description:
      'Designed for working professionals, university researchers, and international visa applicants. Hands-on training in RStudio biostatistics, SPSS survey econometric modeling, French & German language certifications, and Canva Pro digital graphics.',
    poster_image_url:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    application_deadline: '2026-09-10',
    orientation_date: '2026-09-12',
    commencement_date: '2026-09-14',
    status: 'Filling Fast',
    target_courses: [
      'R Programming & Biostatistical Analysis',
      'IBM SPSS Statistics & Econometric Survey Analysis',
      'World Languages & Corporate Fluency (French / German / Arabic)',
      'Graphic Design, Video Editing & Digital Media',
      'Comprehensive Computer Packages & Digital Skills',
    ],
    early_bird_discount: '🚀 Free Study Materials & E-Library Access Pack Included',
    installment_plan: 'Pay in 2 Easy Monthly Installments',
    study_modes: [
      '100% Online (Live & Recorded)',
      'Evening Classes (Live Interactive)',
      'Self-Paced Masterclass & 1-on-1 Labs',
    ],
    contact_phone: INSTITUTION_CONFIG.contact.phone,
    contact_email: INSTITUTION_CONFIG.contact.admissionsEmail,
    registration_fee: 'Free ($0 USD Application Fee)',
    is_published: true,
    featured: false,
    created_at: '2026-08-15T10:00:00.000Z',
    updated_at: '2026-09-04T12:00:00.000Z',
  },
  {
    id: 'intake-2026-05',
    title: 'May 2026 Mid-Year Intensive Intake',
    academic_year: '2026',
    term_session: 'Term 2 / Summer Intensive',
    headline: 'Mid-Year Career Advancement & Professional Upskilling Cohort',
    description:
      'Intensive hands-on practical syllabus in software engineering, statistical research, international languages, and financial accounting.',
    poster_image_url:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    application_deadline: '2026-05-15',
    commencement_date: '2026-05-20',
    status: 'Closed',
    target_courses: ['All Accredited Programs'],
    study_modes: ['100% Online (Live & Recorded)', 'Weekend Executive Cohort'],
    is_published: false,
    featured: false,
    created_at: '2026-04-10T09:00:00.000Z',
  },
]

class IntakeStore {
  private intakes: IntakeSchedule[] = []
  private initialized = false

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(INTAKE_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.intakes = parsed.map((i: any) => ({
            ...i,
            promo_video_url: i.promo_video_url && i.promo_video_url.trim() !== '' ? i.promo_video_url : undefined,
          }))
          this.initialized = true
          return
        }
      }
    } catch {
      // ignore
    }
    this.intakes = [...INITIAL_INTAKE_SCHEDULES]
    this.saveToStorage()
    this.initialized = true
  }

  private saveToStorage() {
    try {
      localStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(this.intakes))
    } catch {
      // ignore
    }
  }

  public initRealtimeSync() {
    if (typeof window === 'undefined') return
    try {
      supabase
        .channel('intake_schedules_realtime_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'intake_schedules' },
          async () => {
            await this.fetchCloudIntakes()
            window.dispatchEvent(new CustomEvent('eclat-intakes-updated', { detail: this.intakes }))
            window.dispatchEvent(new CustomEvent('eclat-data-synced'))
          }
        )
        .subscribe()
    } catch (err) {
      console.warn('Realtime subscription notice:', err)
    }
  }

  public async fetchCloudIntakes(): Promise<IntakeSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('intake_schedules')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        const cloudList: IntakeSchedule[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          academic_year: d.academic_year || '2026',
          term_session: d.term_session || 'Term 1',
          headline: d.headline || '',
          description: d.description || '',
          poster_image_url: d.poster_image_url && d.poster_image_url.trim() !== '' ? d.poster_image_url : undefined,
          promo_video_url: d.promo_video_url && d.promo_video_url.trim() !== '' ? d.promo_video_url : undefined,
          application_deadline: d.application_deadline,
          orientation_date: d.orientation_date || undefined,
          commencement_date: d.commencement_date,
          status: d.status || 'Open',
          target_courses: Array.isArray(d.target_courses) ? d.target_courses : ['All Accredited Programs'],
          early_bird_discount: d.early_bird_discount || undefined,
          installment_plan: d.installment_plan || undefined,
          study_modes: Array.isArray(d.study_modes) ? d.study_modes : ['100% Online (Live & Recorded)'],
          contact_phone: d.contact_phone || undefined,
          contact_email: d.contact_email || undefined,
          registration_fee: d.registration_fee || 'Free ($0 USD)',
          is_published: d.is_published !== false,
          featured: Boolean(d.featured),
          created_at: d.created_at || new Date().toISOString(),
          updated_at: d.updated_at || undefined,
        }))

        // Cloud is authoritative for existing records
        const map = new Map<string, IntakeSchedule>()
        for (const item of this.intakes) map.set(item.id, item)
        for (const item of cloudList) map.set(item.id, item)
        this.intakes = Array.from(map.values())
        this.saveToStorage()
        window.dispatchEvent(new CustomEvent('eclat-intakes-updated', { detail: this.intakes }))
      }
    } catch {
      // Fallback to local
    }
    return this.getIntakes()
  }

  public getIntakes(): IntakeSchedule[] {
    if (!this.initialized) this.loadFromStorage()
    return [...this.intakes]
  }

  public getPublishedIntakes(): IntakeSchedule[] {
    return this.getIntakes().filter((i) => i.is_published)
  }

  public async addIntake(intake: IntakeSchedule): Promise<void> {
    const cleanedIntake: IntakeSchedule = {
      ...intake,
      promo_video_url: intake.promo_video_url?.trim() || undefined,
      poster_image_url: intake.poster_image_url?.trim() || undefined,
      updated_at: new Date().toISOString(),
    }
    this.intakes = [cleanedIntake, ...this.intakes.filter((i) => i.id !== intake.id)]
    this.saveToStorage()
    window.dispatchEvent(new CustomEvent('eclat-intakes-updated', { detail: this.intakes }))
    window.dispatchEvent(new CustomEvent('eclat-data-synced'))

    // Save to Supabase
    try {
      await supabase.from('intake_schedules').upsert({
        id: cleanedIntake.id,
        title: cleanedIntake.title,
        academic_year: cleanedIntake.academic_year,
        term_session: cleanedIntake.term_session,
        headline: cleanedIntake.headline,
        description: cleanedIntake.description,
        poster_image_url: cleanedIntake.poster_image_url || null,
        promo_video_url: cleanedIntake.promo_video_url || null,
        application_deadline: cleanedIntake.application_deadline,
        orientation_date: cleanedIntake.orientation_date || null,
        commencement_date: cleanedIntake.commencement_date,
        status: cleanedIntake.status,
        target_courses: cleanedIntake.target_courses,
        early_bird_discount: cleanedIntake.early_bird_discount || null,
        installment_plan: cleanedIntake.installment_plan || null,
        study_modes: cleanedIntake.study_modes,
        contact_phone: cleanedIntake.contact_phone || null,
        contact_email: cleanedIntake.contact_email || null,
        registration_fee: cleanedIntake.registration_fee || null,
        is_published: cleanedIntake.is_published,
        featured: cleanedIntake.featured || false,
        created_at: cleanedIntake.created_at,
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('Supabase intake schedule upsert notice:', err)
    }
  }

  public async updateIntake(id: string, updates: Partial<IntakeSchedule>): Promise<void> {
    const nowIso = new Date().toISOString()
    this.intakes = this.intakes.map((i) => {
      if (i.id !== id) return i
      const updatedItem = { ...i, ...updates, updated_at: nowIso }
      if ('promo_video_url' in updates) {
        updatedItem.promo_video_url = updates.promo_video_url?.trim() || undefined
      }
      if ('poster_image_url' in updates) {
        updatedItem.poster_image_url = updates.poster_image_url?.trim() || undefined
      }
      return updatedItem
    })
    this.saveToStorage()
    window.dispatchEvent(new CustomEvent('eclat-intakes-updated', { detail: this.intakes }))
    window.dispatchEvent(new CustomEvent('eclat-data-synced'))

    try {
      const dbPayload: any = {
        ...updates,
        updated_at: nowIso,
      }
      if ('promo_video_url' in updates) {
        dbPayload.promo_video_url = updates.promo_video_url?.trim() || null
      }
      if ('poster_image_url' in updates) {
        dbPayload.poster_image_url = updates.poster_image_url?.trim() || null
      }
      if ('early_bird_discount' in updates) {
        dbPayload.early_bird_discount = updates.early_bird_discount?.trim() || null
      }
      if ('installment_plan' in updates) {
        dbPayload.installment_plan = updates.installment_plan?.trim() || null
      }
      if ('contact_phone' in updates) {
        dbPayload.contact_phone = updates.contact_phone?.trim() || null
      }
      if ('contact_email' in updates) {
        dbPayload.contact_email = updates.contact_email?.trim() || null
      }
      if ('registration_fee' in updates) {
        dbPayload.registration_fee = updates.registration_fee?.trim() || null
      }

      await supabase
        .from('intake_schedules')
        .update(dbPayload)
        .eq('id', id)
    } catch (err) {
      console.warn('Supabase intake schedule update notice:', err)
    }
  }

  public async deleteIntake(id: string): Promise<void> {
    this.intakes = this.intakes.filter((i) => i.id !== id)
    this.saveToStorage()
    window.dispatchEvent(new CustomEvent('eclat-intakes-updated', { detail: this.intakes }))
    window.dispatchEvent(new CustomEvent('eclat-data-synced'))

    try {
      await supabase.from('intake_schedules').delete().eq('id', id)
    } catch (err) {
      console.warn('Supabase intake schedule delete notice:', err)
    }
  }

  public async togglePublishIntake(id: string): Promise<void> {
    const target = this.intakes.find((i) => i.id === id)
    if (!target) return
    const nextState = !target.is_published
    await this.updateIntake(id, { is_published: nextState })
  }
}

export const intakeStore = new IntakeStore()
intakeStore.initRealtimeSync()
