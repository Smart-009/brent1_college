// ============================================================
// Éclat Institute — Cloud Database Seeder & Sync Utility
// ============================================================

import { supabase } from './supabase'
import { INITIAL_DEPARTMENTS, schoolStore } from './schoolData'
import { ACADEMIC_HANDBOOKS } from '@/features/library/academicHandbookData'

export interface SeedResult {
  success: boolean
  departmentsCount: number
  handbooksCount: number
  courseUnitsCount: number
  classesCount: number
  message: string
}

export async function seedCloudDatabase(): Promise<SeedResult> {
  let departmentsCount = 0
  let handbooksCount = 0
  let courseUnitsCount = 0
  let classesCount = 0

  try {
    // 1. Seed Departments
    if (INITIAL_DEPARTMENTS && INITIAL_DEPARTMENTS.length > 0) {
      const deptPayload = INITIAL_DEPARTMENTS.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description,
        hod_name: d.hod_name,
        hod_email: d.hod_email,
        programs: d.programs || [],
        created_at: d.created_at || new Date().toISOString(),
      }))

      const { error: deptErr } = await supabase
        .from('departments')
        .upsert(deptPayload, { onConflict: 'id' })

      if (!deptErr) departmentsCount = deptPayload.length
    }

    // 2. Seed Academic Handbooks
    const handbookEntries = Object.values(ACADEMIC_HANDBOOKS)
    if (handbookEntries.length > 0) {
      const handbookPayload = handbookEntries.map((h) => ({
        id: h.id,
        title: h.title,
        discipline: h.faculty || 'Computing & Technology',
        level: 'All Trainees / Diploma',
        author: 'Éclat Institute Academic Board',
        year: h.year || 2026,
        readings_count: 142,
        chapters: h.chapters || [],
        takeaways: [
          'Master practical real-world industry implementations.',
          'Adhere to high-standard software architecture and clean code principles.',
          'Complete all chapter review exercises before proceeding.',
        ],
        is_drm_protected: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: hbErr } = await supabase
        .from('academic_handbooks')
        .upsert(handbookPayload, { onConflict: 'id' })

      if (!hbErr) handbooksCount = handbookPayload.length
    }

    // 3. Seed Course Units & Courses
    const units = schoolStore.getCourseUnits()
    if (units.length > 0) {
      const unitPayload = units.map((u) => ({
        id: u.id,
        unit_code: u.code,
        title: u.title,
        department_id: u.department ? 'dept-swe' : null,
        level: u.course_duration || '3 Months Certificate',
        credit_hours: u.credit_hours || 40,
        instructor_name: u.teacher_name || 'Faculty Instructor',
        is_core: true,
        description: u.description || '',
        created_at: u.created_at || new Date().toISOString(),
      }))

      const { error: uErr } = await supabase
        .from('course_units')
        .upsert(unitPayload, { onConflict: 'id' })

      if (!uErr) courseUnitsCount = unitPayload.length

      // Also ensure courses table has corresponding rows
      const coursePayload = units.map((u) => ({
        id: u.id,
        title: u.title,
        description: JSON.stringify({
          unit_id: u.id,
          code: u.code,
          department: u.department,
          program: u.program,
          course_duration: u.course_duration,
          credit_hours: u.credit_hours,
          teacher_name: u.teacher_name,
          fee: u.fee,
          live_meeting_url: u.live_meeting_url,
          live_schedule_text: u.live_schedule_text,
          syllabus_modules: u.syllabus_modules,
        }),
        is_published: u.is_published ?? true,
        created_at: u.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      await supabase.from('courses').upsert(coursePayload, { onConflict: 'id' })
    }

    // 4. Seed Standard Class Cohorts
    const classesPayload = [
      {
        id: 'class-swe-2026',
        name: 'Full-Stack Web Development (React & Node.js)',
        grade_level: 'Diploma Cohort 2026',
        academic_year: '2026',
        hod_name: 'Eng. Alex Mwangi',
        fee_amount: 75,
        duration: '3 Months (Certificate)',
        shifts: 'Mon, Wed & Fri: 7:30 PM - 9:30 PM EAT',
        icon: '💻',
      },
      {
        id: 'class-python-2026',
        name: 'Python for Beginners & Data Analytics',
        grade_level: 'Diploma Cohort 2026',
        academic_year: '2026',
        hod_name: 'Dr. Brian Ochieng',
        fee_amount: 75,
        duration: '3 Months (Certificate)',
        shifts: 'Tue & Thu: 7:30 PM - 9:30 PM EAT',
        icon: '🐍',
      },
      {
        id: 'class-cyber-2026',
        name: 'Cybersecurity Fundamentals & Network Defense',
        grade_level: 'Diploma Cohort 2026',
        academic_year: '2026',
        hod_name: 'Mr. David Kiprono',
        fee_amount: 80,
        duration: '3 Months (Certificate)',
        shifts: 'Sat & Sun: 10:00 AM - 1:00 PM EAT',
        icon: '🛡️',
      },
      {
        id: 'class-comp-2026',
        name: 'Comprehensive Computer Packages & Digital Skills',
        grade_level: 'Certificate Cohort 2026',
        academic_year: '2026',
        hod_name: 'Mr. James Mutua',
        fee_amount: 50,
        duration: '2 Months (Certificate)',
        shifts: 'Daily Mon-Fri: 6:00 PM - 7:30 PM EAT',
        icon: '🖥️',
      },
    ]

    const { error: clErr } = await supabase
      .from('classes')
      .upsert(classesPayload, { onConflict: 'id' })

    if (!clErr) classesCount = classesPayload.length

    return {
      success: true,
      departmentsCount,
      handbooksCount,
      courseUnitsCount,
      classesCount,
      message: `Successfully seeded ${departmentsCount} departments, ${handbooksCount} academic handbooks, ${courseUnitsCount} course units, and ${classesCount} classes directly into Supabase!`,
    }
  } catch (error: any) {
    return {
      success: false,
      departmentsCount,
      handbooksCount,
      courseUnitsCount,
      classesCount,
      message: error?.message || 'Failed to seed cloud database.',
    }
  }
}
