import { schoolStore } from './schoolData'
import { cloudServicesStore, PublishedTutorCourseRecord, PublisherPayoutRecord } from './cloudServicesStore'

export interface EnrolledLearnerRecord {
  id: string
  name: string
  admissionNumber: string
  email: string
  phone: string
  enrolledCourseId: string
  enrolledCourseTitle: string
  amountPaidUsd: number
  pendingBalanceUsd: number
  totalFeeUsd: number
  isCleared: boolean
  enrolledAt: string
}

export interface PublisherCourseAnalytics {
  courseId: string
  courseTitle: string
  category: string
  deliveryMode: 'self_paced' | 'live_cohort'
  providerType: 'individual_tutor' | 'partner_institution'
  tutorName: string
  institutionName?: string
  email: string
  phone: string
  suggestedPriceUsd: number
  payoutSplitPct: number
  status: 'Approved & Live' | 'Pending Review' | 'Paused' | string
  enrolledStudentsCount: number
  revenueGeneratedUsd: number
  pendingBalanceUsd: number
  publisherEarningsUsd: number
  platformShareUsd: number
  learners: EnrolledLearnerRecord[]
}

export interface PublisherSummaryReport {
  publisherKey: string // normalized email or name
  displayName: string
  email: string
  phone: string
  providerType: 'individual_tutor' | 'partner_institution'
  institutionName?: string
  totalCoursesCount: number
  totalStudentsEnrolled: number
  totalRevenueGeneratedUsd: number
  totalPendingBalanceUsd: number
  totalPublisherEarningsUsd: number
  totalPlatformShareUsd: number
  totalDisbursedUsd: number
  availableBalanceUsd: number
  courses: PublisherCourseAnalytics[]
  payouts: PublisherPayoutRecord[]
}

/**
 * Normalizes text for loose matching
 */
function normalizeStr(val?: string | null): string {
  return (val || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Computes publisher analytics across published tutor courses and live students in schoolStore.
 * @param filterPublisher - optional tutor name, institution name, or email to filter a specific publisher
 */
export function getPublisherAnalytics(filterPublisher?: string): {
  publishers: PublisherSummaryReport[]
  instituteTotals: {
    totalCourses: number
    totalStudents: number
    totalRevenueUsd: number
    totalPendingBalanceUsd: number
    totalPublisherRoyaltiesUsd: number
    totalPlatformRetainedUsd: number
    totalDisbursedUsd: number
  }
} {
  const publishedCourses = cloudServicesStore.getPublishedTutorCourses()
  const storeUnits = schoolStore.getCourseUnits()
  const allStudents = schoolStore.getStudents()
  const allReceipts = schoolStore.getReceipts()
  const allPayouts = cloudServicesStore.getPayoutRecords()

  // Build unified courses map (from cloud services store + school store units)
  const unifiedCoursesMap = new Map<string, PublishedTutorCourseRecord>()

  publishedCourses.forEach((c) => {
    unifiedCoursesMap.set(c.id, c)
  })

  // Also include any course units in schoolStore that have provider_type or custom teacher
  storeUnits.forEach((u) => {
    if (u.provider_type || u.teacher_name) {
      if (!unifiedCoursesMap.has(u.id)) {
        unifiedCoursesMap.set(u.id, {
          id: u.id,
          providerType: u.provider_type || 'individual_tutor',
          tutorName: u.teacher_name || 'Faculty Lecturer',
          institutionName: u.institution_name,
          deliveryMode: u.delivery_mode || 'self_paced',
          email: u.teacher_id ? `${u.teacher_id}@eclat.institute` : 'tutor@eclat.institute',
          phone: '',
          courseTitle: u.title,
          category: u.department || 'Vocational',
          courseDescription: u.description || '',
          videoUrl: u.lessons?.[0]?.video_url || '',
          suggestedPriceUsd: u.fee || Math.round((u.course_fee || 6500) / 130),
          payoutSplitPct: u.revenue_split_pct || (u.provider_type === 'partner_institution' ? 70 : 50),
          payoutMethod: 'mpesa',
          payoutSchedule: 'monthly',
          payoutDetails: '',
          payoutCurrency: 'USD',
          submittedAt: u.created_at || new Date().toISOString(),
          status: u.is_published ? 'Approved & Live' : 'Paused',
        })
      }
    }
  })

  const courseList = Array.from(unifiedCoursesMap.values())

  // Group by publisher
  const publisherGroups = new Map<string, PublishedTutorCourseRecord[]>()

  courseList.forEach((c) => {
    const pubKey = (c.email || c.institutionName || c.tutorName).trim().toLowerCase()
    if (!publisherGroups.has(pubKey)) {
      publisherGroups.set(pubKey, [])
    }
    publisherGroups.get(pubKey)!.push(c)
  })

  const publishersReports: PublisherSummaryReport[] = []

  publisherGroups.forEach((courses, pubKey) => {
    const first = courses[0]
    const publisherName = first.institutionName || first.tutorName
    const publisherEmail = first.email
    const publisherPhone = first.phone
    const providerType = first.providerType

    let totalStudents = 0
    let totalRevenue = 0
    let totalPending = 0
    let totalEarnings = 0
    let totalPlatform = 0

    const coursesAnalytics: PublisherCourseAnalytics[] = []

    courses.forEach((c) => {
      const cleanCourseTitle = normalizeStr(c.courseTitle)
      const cleanCourseId = normalizeStr(c.id)

      // Find students matching this course
      const enrolledStudents = allStudents.filter((s) => {
        const inEnrolledArray = (s.enrolled_courses || []).some(
          (cid) => normalizeStr(cid) === cleanCourseId || normalizeStr(cid) === cleanCourseTitle
        )
        const progStr = (s as any).program || s.class_name || ''
        const inProgramName = normalizeStr(progStr).includes(cleanCourseTitle) || (cleanCourseTitle.length > 3 && cleanCourseTitle.includes(normalizeStr(progStr)))
        return inEnrolledArray || (Boolean(progStr) && inProgramName)
      })

      // Calculate revenue and pending balances for this course
      let courseRevenue = 0
      let coursePending = 0
      const learners: EnrolledLearnerRecord[] = []

      enrolledStudents.forEach((std) => {
        // Find receipts for this student
        const studentReceipts = allReceipts.filter(
          (r) =>
            normalizeStr(r.student_id) === normalizeStr(std.id) ||
            normalizeStr(r.admission_number) === normalizeStr(std.admission_number) ||
            normalizeStr(r.student_name) === normalizeStr(std.full_name)
        )

        let paidAmount = 0
        if (studentReceipts.length > 0) {
          paidAmount = studentReceipts.reduce((sum, r) => sum + (Number(r.amount_paid) || Number(r.amount) || 0), 0)
        } else {
          // If direct enrollment without receipt row
          const totalFee = Number(std.term_fee_total) || c.suggestedPriceUsd
          const bal = Number(std.fee_balance) || 0
          paidAmount = Math.max(0, totalFee - bal)
        }

        const balAmount = Number(std.fee_balance) || 0

        courseRevenue += paidAmount
        coursePending += balAmount

        learners.push({
          id: std.id,
          name: std.full_name,
          admissionNumber: std.admission_number,
          email: std.guardian?.email || `${normalizeStr(std.full_name)}@student.eclat.institute`,
          phone: std.guardian?.phone || std.parent_phone || '',
          enrolledCourseId: c.id,
          enrolledCourseTitle: c.courseTitle,
          amountPaidUsd: paidAmount,
          pendingBalanceUsd: balAmount,
          totalFeeUsd: paidAmount + balAmount || c.suggestedPriceUsd,
          isCleared: balAmount === 0 || std.fee_cleared === true,
          enrolledAt: std.enrollment_date || std.admission_date || (std as any).created_at || new Date().toISOString(),
        })
      })

      const splitPct = Number(c.payoutSplitPct) || (c.providerType === 'partner_institution' ? 70 : 50)
      const publisherCut = Math.round((courseRevenue * splitPct) / 100)
      const platformCut = courseRevenue - publisherCut

      totalStudents += enrolledStudents.length
      totalRevenue += courseRevenue
      totalPending += coursePending
      totalEarnings += publisherCut
      totalPlatform += platformCut

      coursesAnalytics.push({
        courseId: c.id,
        courseTitle: c.courseTitle,
        category: c.category,
        deliveryMode: c.deliveryMode,
        providerType: c.providerType,
        tutorName: c.tutorName,
        institutionName: c.institutionName,
        email: c.email,
        phone: c.phone,
        suggestedPriceUsd: c.suggestedPriceUsd,
        payoutSplitPct: splitPct,
        status: c.status,
        enrolledStudentsCount: enrolledStudents.length,
        revenueGeneratedUsd: courseRevenue,
        pendingBalanceUsd: coursePending,
        publisherEarningsUsd: publisherCut,
        platformShareUsd: platformCut,
        learners,
      })
    })

    // Filter payouts for this publisher
    const publisherPayouts = allPayouts.filter((p) => {
      const matchName = normalizeStr(p.publisherName) === normalizeStr(publisherName)
      const matchEmail = normalizeStr(p.publisherEmail) === normalizeStr(publisherEmail)
      return matchName || matchEmail
    })

    const totalDisbursed = publisherPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const availableBalance = Math.max(0, totalEarnings - totalDisbursed)

    publishersReports.push({
      publisherKey: pubKey,
      displayName: publisherName,
      email: publisherEmail,
      phone: publisherPhone,
      providerType,
      institutionName: first.institutionName,
      totalCoursesCount: courses.length,
      totalStudentsEnrolled: totalStudents,
      totalRevenueGeneratedUsd: totalRevenue,
      totalPendingBalanceUsd: totalPending,
      totalPublisherEarningsUsd: totalEarnings,
      totalPlatformShareUsd: totalPlatform,
      totalDisbursedUsd: totalDisbursed,
      availableBalanceUsd: availableBalance,
      courses: coursesAnalytics,
      payouts: publisherPayouts,
    })
  })

  // Global aggregate stats
  const instituteTotals = {
    totalCourses: courseList.length,
    totalStudents: publishersReports.reduce((s, p) => s + p.totalStudentsEnrolled, 0),
    totalRevenueUsd: publishersReports.reduce((s, p) => s + p.totalRevenueGeneratedUsd, 0),
    totalPendingBalanceUsd: publishersReports.reduce((s, p) => s + p.totalPendingBalanceUsd, 0),
    totalPublisherRoyaltiesUsd: publishersReports.reduce((s, p) => s + p.totalPublisherEarningsUsd, 0),
    totalPlatformRetainedUsd: publishersReports.reduce((s, p) => s + p.totalPlatformShareUsd, 0),
    totalDisbursedUsd: allPayouts.reduce((s, p) => s + (Number(p.amount) || 0), 0),
  }

  // Filter if requested
  if (filterPublisher) {
    const cleanFilter = normalizeStr(filterPublisher)
    const filteredReports = publishersReports.filter(
      (p) =>
        normalizeStr(p.displayName).includes(cleanFilter) ||
        normalizeStr(p.email).includes(cleanFilter) ||
        (p.institutionName && normalizeStr(p.institutionName).includes(cleanFilter))
    )
    return { publishers: filteredReports, instituteTotals }
  }

  return { publishers: publishersReports, instituteTotals }
}
