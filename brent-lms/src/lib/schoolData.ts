// ============================================================
// Brent College — Enterprise SIMS Clean Data Store (Zero Test Data)
// ============================================================

import type {
  StudentRecord,
  TimetablePeriod,
  ExamSession,
  ReportCard,
  FeeInvoice,
  FeePaymentReceipt,
  AcademicResource,
  DisciplineRecord,
  SchoolNotice,
  PaymentReminder,
  SecretaryInquiry,
  CourseUnit,
  UnitRegistrationReceipt,
  CollegeDepartment,
  CollegeSubject,
  BiometricFeeClearancePass,
} from '@/types/school'
import { txEngine, IntegrityError } from './transactionManager'
import { schoolEventBus } from './eventBus'
import { generateBiometricTemplate } from './biometricEngine'

// Clean initial state (Zero seeded mock records)
export const INITIAL_STUDENTS: StudentRecord[] = []
export const INITIAL_TIMETABLE: TimetablePeriod[] = []
export const INITIAL_EXAMS: ExamSession[] = []
export const INITIAL_REPORT_CARDS: ReportCard[] = []
export const INITIAL_DEPARTMENTS: CollegeDepartment[] = [
  {
    id: 'dept-comp',
    name: 'Department of Computer Studies & ICT Packages',
    code: 'DEPT-COMP',
    description: 'Comprehensive computer packages, digital literacy, typing speed, and office automation.',
    hod_name: 'Mr. James Mwangi',
    hod_email: 'j.mwangi@brentcollege.ac.ke',
    programs: ['Computer Packages (Ms Office & Internet)', 'Full-Stack Software Engineering', 'Python & Data Analytics'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-bar',
    name: 'Department of Hospitality & Barista Training',
    code: 'DEPT-BAR',
    description: 'Professional espresso extraction, milk frothing, latte art, coffee tasting and cafe operations.',
    hod_name: 'Chef Anthony Kilonzo',
    hod_email: 'a.kilonzo@brentcollege.ac.ke',
    programs: ['Professional Barista Masterclass', 'Latte Art & Coffee Brewing Certification'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-lang',
    name: 'Department of Languages & Communication (English & Kiswahili)',
    code: 'DEPT-LANG',
    description: 'Spoken and written English, Kiswahili Sanifu, and international foreign languages (Arabic, French, German, Spanish).',
    hod_name: 'Mme. Claire Dubois',
    hod_email: 'c.dubois@brentcollege.ac.ke',
    programs: ['English Language Mastery & Business Fluency', 'Kiswahili Sanifu for Expatriates & Beginners', 'Arabic, French & German Diplomas'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-ielts',
    name: 'Department of IELTS & International Exam Preparation',
    code: 'DEPT-IELTS',
    description: 'Targeted IELTS Academic and General Training preparation targeting Band 7.0 - 9.0 scores.',
    hod_name: 'Dr. Robert Ochieng',
    hod_email: 'r.ochieng@brentcollege.ac.ke',
    programs: ['IELTS Academic Intensive (Target Band 7.5+)', 'IELTS General Training for Immigration'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-beauty',
    name: 'Department of Beauty, Henna & Cosmetology',
    code: 'DEPT-BEAUTY',
    description: 'Bridal and traditional henna art, everyday & glam make-up artistry, skin prep, and beauty aesthetics.',
    hod_name: 'Ms. Amina Yusuf',
    hod_email: 'a.yusuf@brentcollege.ac.ke',
    programs: ['Bridal Henna Designing Masterclass', 'Professional Make-up Artistry & Aesthetics'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-sew',
    name: 'Department of Fashion, Sewing & Tailoring',
    code: 'DEPT-SEW',
    description: 'Hands-on pattern drafting, electric sewing machine operation, dressmaking, and African garment tailoring.',
    hod_name: 'Mrs. Grace Wanjiku',
    hod_email: 'g.wanjiku@brentcollege.ac.ke',
    programs: ['Garment Construction & Tailoring', 'Pattern Drafting & Dressmaking Certificate'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-biz',
    name: 'Department of Business, Accounting & Security',
    code: 'DEPT-BIZ',
    description: 'Computerized accounting, QuickBooks, KRA tax returns, and cybersecurity network defense.',
    hod_name: 'Mr. David Mutua',
    hod_email: 'd.mutua@brentcollege.ac.ke',
    programs: ['Computerized Accounting (QuickBooks & iTax)', 'Cybersecurity & Ethical Defense'],
    created_at: new Date().toISOString(),
  },
]

export const INITIAL_SUBJECTS: CollegeSubject[] = [
  {
    id: 'sub-comp',
    name: 'Computer Packages & Digital Literacy',
    code: 'COMP-101',
    department_id: 'dept-comp',
    department_name: 'Department of Computer Studies & ICT Packages',
    description: 'Master Ms Word, Excel, PowerPoint, Access, Internet Research, Typing Speed, and Basic Graphic Design.',
    fee: 4500,
    duration: '4 Weeks (1 Month)',
    icon: '💻',
    badge: 'Most Popular',
    category: 'Computer Studies',
    careers: ['Office Administrator', 'Data Entry Clerk', 'Front Desk Assistant'],
    color_hex: '#1e3a8a',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-bar',
    name: 'Professional Barista & Coffee Brewing Artistry',
    code: 'BAR-101',
    department_id: 'dept-bar',
    department_name: 'Department of Hospitality & Barista Training',
    description: 'Espresso extraction, grinder calibration, milk steaming, free-pour latte art, and commercial coffee equipment.',
    fee: 9500,
    duration: '4 to 6 Weeks',
    icon: '☕',
    badge: 'High Employment Demand',
    category: 'Hospitality',
    careers: ['Professional Barista', 'Cafe Supervisor', 'Coffee Roaster & Mixologist'],
    color_hex: '#78350f',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-eng',
    name: 'English Language Mastery & Business Communication',
    code: 'ENG-101',
    department_id: 'dept-lang',
    department_name: 'Department of Languages & Communication (English & Kiswahili)',
    description: 'Public speaking, professional email composition, grammar mastery, pronunciation, and corporate presentation skills.',
    fee: 5500,
    duration: '6 to 8 Weeks',
    icon: '🗣️',
    badge: 'Fluency Certificate',
    category: 'Languages',
    careers: ['Customer Care Officer', 'Corporate Executive', 'Front Office Ambassador'],
    color_hex: '#0284c7',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-kisw',
    name: 'Kiswahili Sanifu & Conversational Swahili',
    code: 'KISW-101',
    department_id: 'dept-lang',
    department_name: 'Department of Languages & Communication (English & Kiswahili)',
    description: 'Kiswahili for expatriates, tourists, beginners and business professionals. Sarufi, msamiati, na mazungumzo.',
    fee: 5000,
    duration: '4 to 6 Weeks',
    icon: '🇰🇪',
    badge: 'Beginner to Advanced',
    category: 'Languages',
    careers: ['Translator', 'Field Officer', 'Community Liaison Officer'],
    color_hex: '#16a34a',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-lang',
    name: 'Foreign Languages (Arabic, French, German, Spanish)',
    code: 'LANG-101',
    department_id: 'dept-lang',
    department_name: 'Department of Languages & Communication (English & Kiswahili)',
    description: 'Conversational grammar, phonetics, professional vocabulary, listening comprehension, and speaking fluency.',
    fee: 7500,
    duration: '8 Weeks (2 Months)',
    icon: '🌐',
    badge: 'Diplomatic & Business',
    category: 'Languages',
    careers: ['Embassy Assistant', 'International Tourism Guide', 'Flight Attendant'],
    color_hex: '#059669',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-ielts',
    name: 'IELTS Preparation (Academic & General)',
    code: 'IELTS-101',
    department_id: 'dept-ielts',
    department_name: 'Department of IELTS & International Exam Preparation',
    description: 'Speaking mock tests, listening strategies, academic reading techniques, and Task 1 & Task 2 writing masterclasses.',
    fee: 8500,
    duration: '4 to 6 Weeks',
    icon: '🎓',
    badge: 'Target Band 7.5 - 9.0',
    category: 'Exam Prep',
    careers: ['Study Abroad Candidate', 'UK/Canada/US Healthcare Immigrant'],
    color_hex: '#2563eb',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-beauty',
    name: 'Henna Artistry & Professional Make-up',
    code: 'HNA-101',
    department_id: 'dept-beauty',
    department_name: 'Department of Beauty, Henna & Cosmetology',
    description: 'Intricate Indian/Sudanese/Arabic Henna patterns, bridal make-up, brow sculpting, contouring, and cosmetics.',
    fee: 6500,
    duration: '4 to 8 Weeks',
    icon: '💄',
    badge: 'Practical Studio Training',
    category: 'Beauty',
    careers: ['Bridal Henna Artist', 'Beauty Salon Owner', 'Celebrity Make-up Artist'],
    color_hex: '#db2777',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-sew',
    name: 'Sewing, Pattern Drafting & Garment Tailoring',
    code: 'SEW-101',
    department_id: 'dept-sew',
    department_name: 'Department of Fashion, Sewing & Tailoring',
    description: 'Body measurement, paper pattern cutting, sewing machine stitching, zipper insertion, and bespoke tailoring.',
    fee: 7500,
    duration: '8 to 12 Weeks',
    icon: '✂️',
    badge: 'Hands-on Machines',
    category: 'Fashion',
    careers: ['Fashion Designer', 'Boutique Owner', 'Apparel Tailor & Pattern Drafter'],
    color_hex: '#ea580c',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-coding',
    name: 'Full-Stack Web Development & Cloud Systems',
    code: 'CS-101',
    department_id: 'dept-comp',
    department_name: 'Department of Computer Studies & ICT Packages',
    description: 'Frontend React, backend Node.js APIs, PostgreSQL database transactions, and cloud server deployment.',
    fee: 12000,
    duration: '12 Weeks (3 Months)',
    icon: '🚀',
    badge: 'Portfolio Ready',
    category: 'Software Engineering',
    careers: ['Full-Stack Developer', 'Frontend Engineer', 'Tech Freelancer'],
    color_hex: '#6366f1',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-acc',
    name: 'Computerized Accounting & QuickBooks Financials',
    code: 'ACC-101',
    department_id: 'dept-biz',
    department_name: 'Department of Business, Accounting & Security',
    description: 'QuickBooks Desktop & Online, payroll tax calculations, KRA iTax returns, and financial balance sheets.',
    fee: 6500,
    duration: '4 to 6 Weeks',
    icon: '📊',
    badge: 'Corporate Finance',
    category: 'Business & Finance',
    careers: ['Accounts Assistant', 'Payroll Officer', 'Bookkeeper'],
    color_hex: '#b45309',
    created_at: new Date().toISOString(),
  },
]

export const INITIAL_INVOICES: FeeInvoice[] = []
export const INITIAL_RECEIPTS: FeePaymentReceipt[] = []
export const INITIAL_RESOURCES: AcademicResource[] = []
export const INITIAL_DISCIPLINE: DisciplineRecord[] = []
export const INITIAL_NOTICES: SchoolNotice[] = []
export const INITIAL_REMINDERS: PaymentReminder[] = []
export const INITIAL_INQUIRIES: SecretaryInquiry[] = []

// ============================================================
// High-Performance Data Access & Transaction Store
// ============================================================
class SchoolDataStore {
  private memCache = new Map<string, any>()

  constructor() {
    this.cleanLegacyMockData()
  }

  private cleanLegacyMockData() {
    try {
      const isCleaned = localStorage.getItem('brent_launch_clean_slate_v6_pure')
      if (!isCleaned) {
        const storedRole = localStorage.getItem('brent_demo_role')
        if (storedRole && storedRole !== 'admin') {
          localStorage.removeItem('brent_demo_role')
        }
        localStorage.removeItem('brent_school_students')
        localStorage.removeItem('brent_school_timetable')
        localStorage.removeItem('brent_school_exams')
        localStorage.removeItem('brent_school_report_cards')
        localStorage.removeItem('brent_school_invoices')
        localStorage.removeItem('brent_school_receipts')
        localStorage.removeItem('brent_school_resources')
        localStorage.removeItem('brent_school_discipline')
        localStorage.removeItem('brent_school_notices')
        localStorage.removeItem('brent_school_reminders')
        localStorage.removeItem('brent_school_inquiries')
        localStorage.removeItem('brent_school_course_units')
        localStorage.removeItem('brent_school_unit_registrations')
        localStorage.setItem('brent_launch_clean_slate_v6_pure', 'true')
      }
    } catch {}
  }

  purgeAllDataForLaunch(): void {
    this.memCache.clear()
    localStorage.removeItem('brent_school_students')
    localStorage.removeItem('brent_school_timetable')
    localStorage.removeItem('brent_school_exams')
    localStorage.removeItem('brent_school_report_cards')
    localStorage.removeItem('brent_school_invoices')
    localStorage.removeItem('brent_school_receipts')
    localStorage.removeItem('brent_school_resources')
    localStorage.removeItem('brent_school_discipline')
    localStorage.removeItem('brent_school_notices')
    localStorage.removeItem('brent_school_reminders')
    localStorage.removeItem('brent_school_inquiries')
    localStorage.removeItem('brent_school_course_units')
    localStorage.removeItem('brent_school_unit_registrations')
    schoolEventBus.publish('STUDENT_UPDATED')
    schoolEventBus.publish('PAYMENT_RECORDED')
  }

  private get<T>(key: string, fallback: T): T {
    if (this.memCache.has(key)) {
      return this.memCache.get(key)
    }
    try {
      const stored = localStorage.getItem(`brent_school_${key}`)
      const val = stored ? JSON.parse(stored) : fallback
      this.memCache.set(key, val)
      return val
    } catch {
      this.memCache.set(key, fallback)
      return fallback
    }
  }

  private set<T>(key: string, value: T): void {
    this.memCache.set(key, value)
    try {
      localStorage.setItem(`brent_school_${key}`, JSON.stringify(value))
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }

  // --- Students CRUD (ACID Protected) ---
  getStudents(): StudentRecord[] {
    return this.get<StudentRecord[]>('students', INITIAL_STUDENTS)
  }

  saveStudents(students: StudentRecord[]) {
    this.set('students', students)
    schoolEventBus.publish('STUDENT_UPDATED')
  }

  async addStudent(student: StudentRecord): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_STUDENT_${student.admission_number}`,
      ['brent_school_students'],
      () => {
        const list = this.getStudents()
        if (list.some((s) => s.admission_number.toLowerCase() === student.admission_number.toLowerCase())) {
          throw new IntegrityError(`Admission Number "${student.admission_number}" is already registered in the system.`)
        }
        list.unshift(student)
        this.set('students', list)
      }
    )
    schoolEventBus.publish('STUDENT_ADDED', student)
  }

  async updateStudent(id: string, updated: Partial<StudentRecord>): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_STUDENT_${id}`,
      ['brent_school_students'],
      () => {
        const list = this.getStudents()
        const idx = list.findIndex((s) => s.id === id)
        if (idx === -1) throw new IntegrityError(`Student ID "${id}" not found.`)

        if (updated.admission_number) {
          const conflict = list.find((s) => s.id !== id && s.admission_number.toLowerCase() === updated.admission_number!.toLowerCase())
          if (conflict) {
            throw new IntegrityError(`Admission Number "${updated.admission_number}" is already taken by another student.`)
          }
        }

        list[idx] = { ...list[idx], ...updated }
        this.set('students', list)
      }
    )
    schoolEventBus.publish('STUDENT_UPDATED', updated)
  }

  async deleteStudent(id: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_STUDENT_${id}`,
      ['brent_school_students'],
      () => {
        const list = this.getStudents().filter((s) => s.id !== id)
        this.set('students', list)
      }
    )
    schoolEventBus.publish('STUDENT_DELETED', id)
  }

  // --- Timetable CRUD (ACID Protected) ---
  getTimetable(classFilter?: string, dayFilter?: string): TimetablePeriod[] {
    let list = this.get<TimetablePeriod[]>('timetable', INITIAL_TIMETABLE)
    if (classFilter && classFilter !== 'All') {
      list = list.filter((p) => p.class_name.toLowerCase().includes(classFilter.toLowerCase()) || p.class_id === classFilter)
    }
    if (dayFilter && dayFilter !== 'All') {
      list = list.filter((p) => p.day_of_week.toLowerCase() === dayFilter.toLowerCase())
    }
    return list
  }

  saveTimetable(periods: TimetablePeriod[]) {
    this.set('timetable', periods)
    schoolEventBus.publish('TIMETABLE_UPDATED')
  }

  async addPeriod(period: TimetablePeriod): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_PERIOD_${period.id}`,
      ['brent_school_timetable'],
      () => {
        const list = this.get<TimetablePeriod[]>('timetable', INITIAL_TIMETABLE)
        list.push(period)
        this.set('timetable', list)
      }
    )
    schoolEventBus.publish('TIMETABLE_UPDATED')
  }

  async updatePeriod(id: string, updated: Partial<TimetablePeriod>): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_PERIOD_${id}`,
      ['brent_school_timetable'],
      () => {
        const list = this.get<TimetablePeriod[]>('timetable', INITIAL_TIMETABLE)
        const idx = list.findIndex((p) => p.id === id)
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updated }
          this.set('timetable', list)
        }
      }
    )
    schoolEventBus.publish('TIMETABLE_UPDATED')
  }

  async deletePeriod(id: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_PERIOD_${id}`,
      ['brent_school_timetable'],
      () => {
        const list = this.get<TimetablePeriod[]>('timetable', INITIAL_TIMETABLE).filter((p) => p.id !== id)
        this.set('timetable', list)
      }
    )
    schoolEventBus.publish('TIMETABLE_UPDATED')
  }

  // --- Invoices & Fees (ACID Protected) ---
  getInvoices(): FeeInvoice[] {
    return this.get<FeeInvoice[]>('invoices', INITIAL_INVOICES)
  }

  saveInvoices(invoices: FeeInvoice[]) {
    this.set('invoices', invoices)
  }

  async addInvoice(invoice: FeeInvoice): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_INVOICE_${invoice.id}`,
      ['brent_school_invoices'],
      () => {
        const list = this.getInvoices()
        list.unshift(invoice)
        this.set('invoices', list)
      }
    )
    schoolEventBus.publish('INVOICE_CREATED', invoice)
  }

  async createInvoice(invoice: FeeInvoice): Promise<void> {
    return this.addInvoice(invoice)
  }

  getReceipts(): FeePaymentReceipt[] {
    return this.get<FeePaymentReceipt[]>('receipts', INITIAL_RECEIPTS)
  }

  async recordPayment(receipt: FeePaymentReceipt): Promise<void> {
    await txEngine.executeAtomic(
      `ATOMIC_RECORD_PAYMENT_${receipt.receipt_number}`,
      ['brent_school_receipts', 'brent_school_invoices', 'brent_school_students'],
      () => {
        if (receipt.amount <= 0) {
          throw new IntegrityError('Payment amount must be greater than zero.')
        }

        const receipts = this.getReceipts()
        receipts.unshift(receipt)
        this.set('receipts', receipts)

        const invoices = this.getInvoices()
        const invIndex = invoices.findIndex((inv) => inv.student_id === receipt.student_id || inv.admission_number === receipt.admission_number)
        if (invIndex !== -1) {
          invoices[invIndex].paid_amount += receipt.amount
          invoices[invIndex].balance = Math.max(0, invoices[invIndex].total_amount - invoices[invIndex].paid_amount)
          invoices[invIndex].status = invoices[invIndex].balance === 0 ? 'Paid' : 'Partial'
          this.set('invoices', invoices)
        }

        const students = this.getStudents()
        const stdIndex = students.findIndex((s) => s.id === receipt.student_id || s.admission_number === receipt.admission_number)
        if (stdIndex !== -1) {
          students[stdIndex].fee_balance = Math.max(0, students[stdIndex].fee_balance - receipt.amount)
          students[stdIndex].fee_cleared = students[stdIndex].fee_balance === 0
          this.set('students', students)
        }
      }
    )

    schoolEventBus.publish('PAYMENT_RECORDED', receipt)
    schoolEventBus.publish('STUDENT_UPDATED')
  }

  // --- Payment Reminders ---
  getReminders(): PaymentReminder[] {
    return this.get<PaymentReminder[]>('reminders', INITIAL_REMINDERS)
  }

  async sendReminder(reminder: PaymentReminder): Promise<void> {
    await txEngine.executeAtomic(
      `SEND_REMINDER_${reminder.id}`,
      ['brent_school_reminders'],
      () => {
        const list = this.getReminders()
        list.unshift(reminder)
        this.set('reminders', list)
      }
    )
    schoolEventBus.publish('REMINDER_SENT', reminder)
  }

  async addPaymentReminder(reminder: PaymentReminder): Promise<void> {
    return this.sendReminder(reminder)
  }

  // --- Secretary Inquiries ---
  getInquiries(): SecretaryInquiry[] {
    return this.get<SecretaryInquiry[]>('inquiries', INITIAL_INQUIRIES)
  }

  async addInquiry(inquiry: SecretaryInquiry): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_INQUIRY_${inquiry.id}`,
      ['brent_school_inquiries'],
      () => {
        const list = this.getInquiries()
        list.unshift(inquiry)
        this.set('inquiries', list)
      }
    )
    schoolEventBus.publish('INQUIRY_LOGGED', inquiry)
  }

  // --- Notices CRUD ---
  getNotices(): SchoolNotice[] {
    return this.get<SchoolNotice[]>('notices', INITIAL_NOTICES)
  }

  async addNotice(notice: SchoolNotice): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_NOTICE_${notice.id}`,
      ['brent_school_notices'],
      () => {
        const list = this.getNotices()
        list.unshift(notice)
        this.set('notices', list)
      }
    )
    schoolEventBus.publish('NOTICE_POSTED', notice)
  }

  async updateNotice(id: string, updated: Partial<SchoolNotice>): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_NOTICE_${id}`,
      ['brent_school_notices'],
      () => {
        const list = this.getNotices()
        const idx = list.findIndex((n) => n.id === id)
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updated }
          this.set('notices', list)
        }
      }
    )
    schoolEventBus.publish('NOTICE_POSTED', updated)
  }

  async deleteNotice(id: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_NOTICE_${id}`,
      ['brent_school_notices'],
      () => {
        const list = this.getNotices().filter((n) => n.id !== id)
        this.set('notices', list)
      }
    )
    schoolEventBus.publish('NOTICE_POSTED')
  }

  // --- Exams & Reports ---
  getExams(): ExamSession[] {
    return this.get<ExamSession[]>('exams', INITIAL_EXAMS)
  }

  async addExam(exam: ExamSession): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_EXAM_${exam.id}`,
      ['brent_school_exams'],
      () => {
        const list = this.getExams()
        list.unshift(exam)
        this.set('exams', list)
      }
    )
  }

  getReportCards(): ReportCard[] {
    return this.get<ReportCard[]>('report_cards', INITIAL_REPORT_CARDS)
  }

  async addReportCard(card: ReportCard): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_REPORT_CARD_${card.id}`,
      ['brent_school_report_cards'],
      () => {
        const list = this.getReportCards()
        list.unshift(card)
        this.set('report_cards', list)
      }
    )
  }

  getResources(): AcademicResource[] {
    return this.get<AcademicResource[]>('resources', INITIAL_RESOURCES)
  }

  async addResource(resource: AcademicResource): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_RESOURCE_${resource.id}`,
      ['brent_school_resources'],
      () => {
        const list = this.getResources()
        list.unshift(resource)
        this.set('resources', list)
      }
    )
  }

  async updateResource(id: string, updated: Partial<AcademicResource>): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_RESOURCE_${id}`,
      ['brent_school_resources'],
      () => {
        const list = this.getResources()
        const idx = list.findIndex((r) => r.id === id)
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updated }
          this.set('resources', list)
        }
      }
    )
  }

  async deleteResource(id: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_RESOURCE_${id}`,
      ['brent_school_resources'],
      () => {
        const list = this.getResources().filter((r) => r.id !== id)
        this.set('resources', list)
      }
    )
  }

  getDiscipline(): DisciplineRecord[] {
    return this.get<DisciplineRecord[]>('discipline', INITIAL_DISCIPLINE)
  }

  async addDiscipline(record: DisciplineRecord): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_DISCIPLINE_${record.id}`,
      ['brent_school_discipline'],
      () => {
        const list = this.getDiscipline()
        list.unshift(record)
        this.set('discipline', list)
      }
    )
  }

  // --- Course Units & Curriculum Builder (ACID Protected) ---
  getCourseUnits(): CourseUnit[] {
    return this.get<CourseUnit[]>('course_units', [])
  }

  async addCourseUnit(unit: CourseUnit): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_COURSE_UNIT_${unit.code}`,
      ['brent_school_course_units'],
      () => {
        const list = this.getCourseUnits()
        if (list.some((u) => u.code.toLowerCase() === unit.code.toLowerCase())) {
          throw new IntegrityError(`Unit Code "${unit.code}" is already registered.`)
        }
        list.unshift(unit)
        this.set('course_units', list)
      }
    )
    schoolEventBus.publish('COURSE_UNIT_CREATED' as any, unit)
  }

  async updateCourseUnit(id: string, updated: Partial<CourseUnit>): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_COURSE_UNIT_${id}`,
      ['brent_school_course_units'],
      () => {
        const list = this.getCourseUnits()
        const idx = list.findIndex((u) => u.id === id)
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updated }
          this.set('course_units', list)
        }
      }
    )
    schoolEventBus.publish('COURSE_UNIT_UPDATED' as any, updated)
  }

  async deleteCourseUnit(id: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_COURSE_UNIT_${id}`,
      ['brent_school_course_units'],
      () => {
        const list = this.getCourseUnits().filter((u) => u.id !== id)
        this.set('course_units', list)
      }
    )
  }

  // --- Formal Unit Registration by Management (With Official Receipts) ---
  getUnitRegistrations(): UnitRegistrationReceipt[] {
    return this.get<UnitRegistrationReceipt[]>('unit_registrations', [])
  }

  async registerStudentUnits(receipt: UnitRegistrationReceipt): Promise<void> {
    await txEngine.executeAtomic(
      `REGISTER_UNITS_${receipt.receipt_number}`,
      ['brent_school_unit_registrations'],
      () => {
        const list = this.getUnitRegistrations()
        // Replace existing registration or add new
        const existingIdx = list.findIndex((r) => r.student_id === receipt.student_id || r.admission_number.toLowerCase() === receipt.admission_number.toLowerCase())
        if (existingIdx !== -1) {
          list[existingIdx] = receipt
        } else {
          list.unshift(receipt)
        }
        this.set('unit_registrations', list)
      }
    )
    schoolEventBus.publish('UNIT_REGISTRATION_COMPLETED' as any, receipt)
  }

  getRegistrationForStudent(identifier: string): UnitRegistrationReceipt | null {
    if (!identifier) return null
    const list = this.getUnitRegistrations()
    const clean = identifier.trim().toLowerCase()
    return list.find((r) => r.student_id.toLowerCase() === clean || r.admission_number.toLowerCase() === clean) || null
  }

  getRegisteredUnitsForStudent(identifier: string): CourseUnit[] {
    const reg = this.getRegistrationForStudent(identifier)
    if (!reg || !reg.registered_unit_ids || reg.registered_unit_ids.length === 0) {
      return []
    }
    const allUnits = this.getCourseUnits()
    return allUnits.filter((u) => reg.registered_unit_ids.includes(u.id) || reg.registered_units.some((ru) => ru.code === u.code))
  }

  // --- Admin Departments Management (ACID Protected) ---
  getDepartments(): CollegeDepartment[] {
    return this.get<CollegeDepartment[]>('departments', INITIAL_DEPARTMENTS)
  }

  async addDepartment(dept: CollegeDepartment): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_DEPARTMENT_${dept.code}`,
      ['brent_school_departments'],
      () => {
        const list = this.getDepartments()
        if (list.some((d) => d.code.toLowerCase() === dept.code.toLowerCase() || d.name.toLowerCase() === dept.name.toLowerCase())) {
          throw new IntegrityError(`Department "${dept.name}" (${dept.code}) already exists.`)
        }
        list.push(dept)
        this.set('departments', list)
      }
    )
    schoolEventBus.publish('DEPARTMENT_CREATED' as any, dept)
  }

  async updateDepartment(id: string, updated: Partial<CollegeDepartment>): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_DEPARTMENT_${id}`,
      ['brent_school_departments'],
      () => {
        const list = this.getDepartments()
        const idx = list.findIndex((d) => d.id === id)
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updated }
          this.set('departments', list)
        }
      }
    )
  }

  async deleteDepartment(id: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_DEPARTMENT_${id}`,
      ['brent_school_departments'],
      () => {
        const list = this.getDepartments().filter((d) => d.id !== id)
        this.set('departments', list)
      }
    )
  }

  // --- Admin Subjects / Disciplines Management (ACID Protected) ---
  getSubjects(): CollegeSubject[] {
    return this.get<CollegeSubject[]>('subjects', INITIAL_SUBJECTS)
  }

  async addSubject(sub: CollegeSubject): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_SUBJECT_${sub.code}`,
      ['brent_school_subjects'],
      () => {
        const list = this.getSubjects()
        if (list.some((s) => s.code.toLowerCase() === sub.code.toLowerCase())) {
          throw new IntegrityError(`Subject Code "${sub.code}" already exists.`)
        }
        list.push(sub)
        this.set('subjects', list)
      }
    )
    schoolEventBus.publish('SUBJECT_CREATED' as any, sub)
  }

  async updateSubject(id: string, updated: Partial<CollegeSubject>): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_SUBJECT_${id}`,
      ['brent_school_subjects'],
      () => {
        const list = this.getSubjects()
        const idx = list.findIndex((s) => s.id === id)
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updated }
          this.set('subjects', list)
        }
      }
    )
  }

  async deleteSubject(id: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_SUBJECT_${id}`,
      ['brent_school_subjects'],
      () => {
        const list = this.getSubjects().filter((s) => s.id !== id)
        this.set('subjects', list)
      }
    )
  }

  // --- Biometric Security & Fingerprint Verification (ACID Protected) ---
  async enrollStudentBiometric(
    studentId: string,
    fingerName: 'Right Index' | 'Right Thumb' | 'Left Index' | 'Left Thumb' | 'Right Middle' | 'Left Middle',
    enrolledBy = 'Admissions / Bursar Officer',
    credentialId?: string,
    deviceType?: string,
    publicKey?: string,
    customTemplateHash?: string
  ): Promise<StudentRecord> {
    let updatedStudent: StudentRecord | null = null
    await txEngine.executeAtomic(
      `ENROLL_BIOMETRIC_${studentId}`,
      ['brent_school_students'],
      () => {
        const list = this.getStudents()
        const idx = list.findIndex((s) => s.id === studentId)
        if (idx === -1) throw new IntegrityError(`Student ID "${studentId}" not found for biometric enrollment.`)

        const student = list[idx]
        const templateHash = customTemplateHash || generateBiometricTemplate(student.admission_number, fingerName)
        const now = new Date().toISOString()

        list[idx] = {
          ...student,
          biometric_enrolled: true,
          biometric_finger_name: fingerName,
          biometric_template_hash: templateHash,
          biometric_credential_id: credentialId,
          biometric_device_type: deviceType || 'WebAuthn / Optical Sensor',
          biometric_public_key: publicKey,
          biometric_enrolled_at: now,
          biometric_enrolled_by: enrolledBy,
        }
        updatedStudent = list[idx]
        this.set('students', list)
      }
    )

    schoolEventBus.publish('STUDENT_UPDATED', updatedStudent)
    return updatedStudent!
  }

  async removeStudentBiometric(studentId: string): Promise<void> {
    await txEngine.executeAtomic(
      `REMOVE_BIOMETRIC_${studentId}`,
      ['brent_school_students'],
      () => {
        const list = this.getStudents()
        const idx = list.findIndex((s) => s.id === studentId)
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            biometric_enrolled: false,
            biometric_finger_name: undefined,
            biometric_template_hash: undefined,
            biometric_credential_id: undefined,
            biometric_device_type: undefined,
            biometric_public_key: undefined,
            biometric_enrolled_at: undefined,
            biometric_enrolled_by: undefined,
          }
          this.set('students', list)
        }
      }
    )
  }

  getBiometricClearanceLogs(): BiometricFeeClearancePass[] {
    return this.get<BiometricFeeClearancePass[]>('biometric_passes', [])
  }

  async saveBiometricClearanceLog(pass: BiometricFeeClearancePass): Promise<void> {
    await txEngine.executeAtomic(
      `SAVE_CLEARANCE_PASS_${pass.clearance_code}`,
      ['brent_school_biometric_passes'],
      () => {
        const list = this.getBiometricClearanceLogs()
        list.unshift(pass)
        this.set('biometric_passes', list)
      }
    )
  }

  // --- Complete Factory Reset ---
  resetToCleanSlate() {
    localStorage.removeItem('brent_school_students')
    localStorage.removeItem('brent_school_timetable')
    localStorage.removeItem('brent_school_exams')
    localStorage.removeItem('brent_school_report_cards')
    localStorage.removeItem('brent_school_invoices')
    localStorage.removeItem('brent_school_receipts')
    localStorage.removeItem('brent_school_resources')
    localStorage.removeItem('brent_school_discipline')
    localStorage.removeItem('brent_school_notices')
    localStorage.removeItem('brent_school_reminders')
    localStorage.removeItem('brent_school_inquiries')
    localStorage.removeItem('brent_school_course_units')
    localStorage.removeItem('brent_school_unit_registrations')
    localStorage.removeItem('brent_school_departments')
    localStorage.removeItem('brent_school_subjects')
    localStorage.removeItem('brent_school_biometric_passes')
  }
}

export const schoolStore = new SchoolDataStore()

