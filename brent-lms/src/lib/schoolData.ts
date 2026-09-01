// ============================================================
// Eclat Institute — Enterprise SIMS Clean Data Store (Zero Test Data)
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
  FacultyTeacher,
} from '@/types/school'
import { txEngine, IntegrityError } from './transactionManager'
import { schoolEventBus } from './eventBus'
import { generateBiometricTemplate } from './biometricEngine'

// Official Enrolled Students
export const INITIAL_STUDENTS: StudentRecord[] = []
export const INITIAL_TIMETABLE: TimetablePeriod[] = []
export const INITIAL_EXAMS: ExamSession[] = []
export const INITIAL_REPORT_CARDS: ReportCard[] = []

export const INITIAL_FACULTY_TEACHERS: FacultyTeacher[] = []
export const INITIAL_DEPARTMENTS: CollegeDepartment[] = [
  {
    id: 'dept-swe',
    name: 'School of Software Engineering & Web Development',
    code: 'DEPT-SWE',
    description: '100% Online full-stack web engineering, React 19, Node.js, JavaScript, and cloud systems.',
    hod_name: 'Eng. Alex Mwangi',
    hod_email: 'a.mwangi@eclatinstitute.ac.ke',
    programs: ['Full-Stack Web Development (React & Node.js)', 'JavaScript & Cloud Deployment Masterclass'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-data',
    name: 'Department of Python Programming & Data Analytics',
    code: 'DEPT-DATA',
    description: 'Python coding, SQL database analytics, Pandas data science, and business intelligence dashboards.',
    hod_name: 'Dr. Brian Ochieng',
    hod_email: 'b.ochieng@eclatinstitute.ac.ke',
    programs: ['Python for Beginners & Data Analytics', 'SQL & Power BI Business Intelligence'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-comp',
    name: 'Department of Computer Applications & Digital Skills',
    code: 'DEPT-COMP',
    description: 'Essential computer packages, Ms Office 365, Google Workspace, speed typing, and digital workflows.',
    hod_name: 'Mr. James Mutua',
    hod_email: 'j.mutua@eclatinstitute.ac.ke',
    programs: ['Comprehensive Computer Packages & Digital Skills', 'UI/UX Design & Canva Pro Graphics'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-cyber',
    name: 'Department of Cybersecurity & Network Defense',
    code: 'DEPT-CYBER',
    description: 'Cyber threat detection, ethical hacking fundamentals, network protocols, and security audits.',
    hod_name: 'Mr. David Kiprono',
    hod_email: 'd.kiprono@eclatinstitute.ac.ke',
    programs: ['Cybersecurity Fundamentals & Threat Defense', 'Network Administration & Server Security'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-biztech',
    name: 'Department of Business Tech & Computerized Accounting',
    code: 'DEPT-BIZTECH',
    description: 'QuickBooks Online & Desktop, KRA iTax VAT & PAYE filing, digital bookkeeping, and payroll.',
    hod_name: 'Mrs. Grace Wanjiku',
    hod_email: 'g.wanjiku@eclatinstitute.ac.ke',
    programs: ['Computerized Accounting (QuickBooks & iTax)', 'Corporate Financial Modeling'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-lang',
    name: 'Department of English & Modern Languages',
    code: 'DEPT-LANG',
    description: 'English fluency, public speaking, business communication, Arabic, French, and German online certification.',
    hod_name: 'Mme. Claire Dubois',
    hod_email: 'c.dubois@eclatinstitute.ac.ke',
    programs: ['English Language Mastery & Corporate Speaking', 'Foreign Languages (Arabic, French, German)'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-ielts',
    name: 'Department of IELTS & International Test Prep',
    code: 'DEPT-IELTS',
    description: 'Targeted online IELTS Academic & General Training preparation targeting Band 7.5 - 9.0 scores.',
    hod_name: 'Prof. Eric Thorne',
    hod_email: 'e.thorne@eclatinstitute.ac.ke',
    programs: ['IELTS Academic Intensive (Band 7.5+ Target)', 'IELTS General Training for Immigration'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-kisw',
    name: 'Department of Kiswahili Sanifu & African Languages',
    code: 'DEPT-KISW',
    description: 'Online spoken and written Kiswahili for expatriates, tourists, beginners, and corporate professionals.',
    hod_name: 'Mwalimu Amina Yusuf',
    hod_email: 'a.yusuf@eclatinstitute.ac.ke',
    programs: ['Kiswahili Sanifu for Beginners & Expatriates', 'Advanced Swahili Translation & Discourse'],
    created_at: new Date().toISOString(),
  },
]

export const INITIAL_SUBJECTS: CollegeSubject[] = [
  {
    id: 'sub-coding',
    name: 'Full-Stack Web Development & Modern JavaScript',
    code: 'SWE-101',
    department_id: 'dept-swe',
    department_name: 'School of Software Engineering & Web Development',
    description: '100% Online: Master React 19, Node.js APIs, PostgreSQL database architecture, and cloud deployment.',
    fee: 120,
    duration: '12 Weeks (3 Months)',
    icon: '💻',
    badge: 'High Salary Career',
    category: 'Tech & Programming',
    careers: ['Full-Stack Web Developer', 'Frontend Engineer', 'Remote Software Contractor'],
    color_hex: '#6366f1',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-python',
    name: 'Python Programming, SQL & Data Analytics',
    code: 'DATA-101',
    department_id: 'dept-data',
    department_name: 'Department of Python Programming & Data Analytics',
    description: '100% Online: Python data analysis, Pandas, SQL relational queries, and automated data visualization.',
    fee: 95,
    duration: '8 Weeks (2 Months)',
    icon: '📊',
    badge: 'Data & AI In Demand',
    category: 'Tech & Programming',
    careers: ['Data Analyst', 'Business Intelligence Associate', 'Python Developer'],
    color_hex: '#0284c7',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-comp',
    name: 'Comprehensive Computer Packages & Digital Literacy',
    code: 'COMP-101',
    department_id: 'dept-comp',
    department_name: 'Department of Computer Applications & Digital Skills',
    description: '100% Online: Ms Word, Excel Pro, PowerPoint presentations, Google Workspace, speed typing & Canva graphics.',
    fee: 45,
    duration: '4 Weeks (1 Month)',
    icon: '⚡',
    badge: 'Essential Digital Skills',
    category: 'Computer & Digital Skills',
    careers: ['Office Administrator', 'Executive Virtual Assistant', 'Data Entry Specialist'],
    color_hex: '#0f172a',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-cyber',
    name: 'Cybersecurity Fundamentals & Ethical Defense',
    code: 'CYB-101',
    department_id: 'dept-cyber',
    department_name: 'Department of Cybersecurity & Network Defense',
    description: '100% Online: Threat detection, network security defense, password hashing, encryption & risk assessment.',
    fee: 89,
    duration: '6 Weeks',
    icon: '🛡️',
    badge: 'Security Certification',
    category: 'Tech & Programming',
    careers: ['Junior SOC Analyst', 'IT Security Specialist', 'Network Administrator'],
    color_hex: '#dc2626',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-acc',
    name: 'Computerized Accounting, QuickBooks & KRA iTax',
    code: 'ACC-101',
    department_id: 'dept-biztech',
    department_name: 'Department of Business Tech & Computerized Accounting',
    description: '100% Online: QuickBooks Pro, monthly KRA iTax filing (VAT, PAYE), payroll computations & financial balance sheets.',
    fee: 65,
    duration: '4 Weeks (1 Month)',
    icon: '📈',
    badge: 'Corporate Finance',
    category: 'Business Tech & Accounting',
    careers: ['Accounts Assistant', 'Payroll Officer', 'Bookkeeper & Tax Consultant'],
    color_hex: '#b45309',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-uiux',
    name: 'UI/UX Product Design & Figma Prototyping',
    code: 'DSN-101',
    department_id: 'dept-comp',
    department_name: 'Department of Computer Applications & Digital Skills',
    description: '100% Online: Wireframing, Figma design systems, interactive web/mobile prototypes, and usability testing.',
    fee: 75,
    duration: '6 Weeks',
    icon: '🎨',
    badge: 'Creative Tech',
    category: 'Computer & Digital Skills',
    careers: ['UI/UX Designer', 'Product Designer', 'Freelance Figma Designer'],
    color_hex: '#8b5cf6',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-graphics',
    name: 'Graphics Design & Animation',
    code: 'GRF-101',
    department_id: 'dept-comp',
    department_name: 'Department of Computer Applications & Digital Skills',
    description: '100% Online: Adobe Photoshop, Illustrator, Premiere Pro, motion graphics, 2D animation, branding, and visual identity.',
    fee: 60,
    duration: '8 Weeks (2 Months)',
    icon: '🖌️',
    badge: 'High Demand Creative',
    category: 'Computer & Digital Skills',
    careers: ['Graphic Designer', 'Motion Animator', 'Brand Identity Specialist', 'Freelance Creative Director'],
    color_hex: '#ec4899',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-eng',
    name: 'English Language Mastery & Executive Communication',
    code: 'ENG-101',
    department_id: 'dept-lang',
    department_name: 'Department of English & Modern Languages',
    description: '100% Online: Live interactive speaking sessions, corporate business emails, grammar mastery, and presentations.',
    fee: 55,
    duration: '6 to 8 Weeks',
    icon: '🗣️',
    badge: 'Live Interactive Coaching',
    category: 'Languages & Communication',
    careers: ['Corporate Communicator', 'Public Speaker', 'Customer Care Executive'],
    color_hex: '#0284c7',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-ielts',
    name: 'IELTS Preparation (Academic & General Training)',
    code: 'IELTS-101',
    department_id: 'dept-ielts',
    department_name: 'Department of IELTS & International Test Prep',
    description: '100% Online: Live speaking mock tests, listening tricks, academic reading speed tactics, and writing evaluations.',
    fee: 85,
    duration: '4 to 6 Weeks',
    icon: '🌍',
    badge: 'Target Band 7.5 - 9.0',
    category: 'Languages & Communication',
    careers: ['Study Abroad Candidate (UK/US/Canada)', 'Global Healthcare Immigrant'],
    color_hex: '#2563eb',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-kisw',
    name: 'Kiswahili Sanifu for Expatriates & Beginners',
    code: 'KISW-101',
    department_id: 'dept-kisw',
    department_name: 'Department of Kiswahili Sanifu & African Languages',
    description: '100% Online: Spoken and written Kiswahili. Mazungumzo, sarufi, market conversation, and cultural communication.',
    fee: 49,
    duration: '4 to 6 Weeks',
    icon: '🇰🇪',
    badge: 'Beginner to Advanced',
    category: 'Languages & Communication',
    careers: ['NGO Field Officer', 'Expatriate Specialist', 'Community Coordinator'],
    color_hex: '#16a34a',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-arabic',
    name: 'Arabic Language for Business & Middle East Careers',
    code: 'ARB-101',
    department_id: 'dept-lang',
    department_name: 'Department of English & Modern Languages',
    description: '100% Online: Conversational Arabic, phonetics, business vocabulary, reading, and Gulf region cultural fluency.',
    fee: 75,
    duration: '8 Weeks (2 Months)',
    icon: '🌴',
    badge: 'Gulf & Middle East Demand',
    category: 'Languages & Communication',
    careers: ['Bilingual Support Specialist', 'Middle East Corporate Liaison', 'Flight Attendant'],
    color_hex: '#059669',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-french',
    name: 'French Language Proficiency (DELF A1 - B2)',
    code: 'FRN-101',
    department_id: 'dept-lang',
    department_name: 'Department of English & Modern Languages',
    description: '100% Online: Spoken French, listening comprehension, grammar, and international DELF examination prep.',
    fee: 79,
    duration: '8 Weeks (2 Months)',
    icon: '🇫🇷',
    badge: 'International Diploma',
    category: 'Languages & Communication',
    careers: ['Embassy Assistant', 'International NGO Officer', 'Multilingual Translator'],
    color_hex: '#3b82f6',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-german',
    name: 'German Language for Work & Studies (Goethe Prep)',
    code: 'GER-101',
    department_id: 'dept-lang',
    department_name: 'Department of English & Modern Languages',
    description: '100% Online: German grammar, conversational fluency, Goethe-Zertifikat A1/A2 preparation for work & university.',
    fee: 79,
    duration: '8 Weeks (2 Months)',
    icon: '🇩🇪',
    badge: 'European Visa Pathway',
    category: 'Languages & Communication',
    careers: ['German University Candidate', 'Healthcare & Nurse Relocation in Germany'],
    color_hex: '#f59e0b',
    created_at: new Date().toISOString(),
  },
]

export const INITIAL_COURSE_UNITS: CourseUnit[] = [
  {
    id: 'unit-grd1',
    code: 'GRD1',
    title: 'Graphics Design & Animation',
    department: 'Department of Computer Applications & Digital Skills',
    program: 'Creative Design & Arts',
    course_duration: '3 Months (Certificate Course)',
    credit_hours: 40,
    teacher_id: 'tch-kimani',
    teacher_name: 'Alex Kimani',
    description: 'Comprehensive online course in Graphics Design & Animation covering Canva, Adobe Photoshop, Illustrator, and motion graphics.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Mon, Wed & Fri: 7:30 PM - 9:30 PM EAT',
    fee: 60,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      {
        id: 'mod-grd-1',
        module_number: 1,
        title: 'Module 1: Foundations & Core Concepts',
        hours: 10,
        topics: ['Design Theory', 'Color Psychology', 'Typography & Visual Hierarchy'],
        learning_outcomes: ['Understand fundamental design principles and workspace setup'],
        resources: [
          {
            id: 'res-grd-1',
            file_name: 'Module 1 - Visual Design Foundations (PDF)',
            file_url: 'https://eclat.institute/docs/syllabus.pdf',
            file_type: 'PDF',
          },
        ],
      },
      {
        id: 'mod-grd-2',
        module_number: 2,
        title: 'Module 2: Learning Canva',
        hours: 10,
        topics: ['Canva Pro Features', 'Social Media Graphics', 'Brand Kits & Templates'],
        learning_outcomes: ['Design professional social media graphics and brand identities using Canva'],
        resources: [],
      },
      {
        id: 'mod-grd-3',
        module_number: 3,
        title: 'Module 3: Adobe Photoshop',
        hours: 10,
        topics: ['Photoshop Tools', 'Layers & Masking', 'Photo Retouching & Compositing'],
        learning_outcomes: ['Master image editing, masking, and commercial visual production in Photoshop'],
        resources: [],
      },
    ],
    lessons: [
      {
        id: 'les-grd-1',
        title: 'Lesson 1: Introduction to Graphic Design & Tools Setup',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration_minutes: 45,
        content: 'Welcome to Graphics Design & Animation! In this session we explore core design theory, setup software and begin hands-on practical design.',
        meeting_url: 'https://meet.google.com/new',
        resources: [],
      },
      {
        id: 'les-grd-2',
        title: 'Lesson 2: Mastering Canva Pro for Brand Kits',
        video_url: '',
        duration_minutes: 60,
        content: 'Practical workflow for creating high-impact brand kits, flyers, posters, and social media carousels in Canva.',
        meeting_url: 'https://meet.google.com/new',
        resources: [],
      },
      {
        id: 'les-grd-3',
        title: 'Lesson 3: Adobe Photoshop Foundations & Layer Mastery',
        video_url: '',
        duration_minutes: 60,
        content: 'Deep dive into Photoshop layers, selection tools, masking, color grading, and commercial asset exports.',
        meeting_url: 'https://meet.google.com/new',
        resources: [],
      },
    ],
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
      const stored = localStorage.getItem(`eclat_school_${key}`) || localStorage.getItem(`brent_school_${key}`)
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
      localStorage.setItem(`eclat_school_${key}`, JSON.stringify(value))
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }

  // --- Students CRUD (ACID Protected) ---
  getStudents(): StudentRecord[] {
    const rawList = this.get<StudentRecord[]>('students', INITIAL_STUDENTS)
    const receipts = this.getReceipts()
    return rawList.map((s) => {
      const studentReceipts = receipts.filter(
        (r) => (r.student_id && r.student_id === s.id) || (r.admission_number && r.admission_number.toLowerCase() === s.admission_number.toLowerCase())
      )
      const totalPaid = studentReceipts.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
      const billed = Number(s.term_fee_total) || 4500
      const liveBalance = Math.max(0, billed - totalPaid)
      const isCleared = liveBalance === 0 && totalPaid >= billed && billed > 0
      return {
        ...s,
        term_fee_total: billed,
        fee_balance: liveBalance,
        fee_cleared: isCleared,
      }
    })
  }

  saveStudents(students: StudentRecord[]) {
    this.set('students', students)
    schoolEventBus.publish('STUDENT_UPDATED')
  }

  async addStudent(student: StudentRecord): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_STUDENT_${student.admission_number}`,
      ['brent_school_students', 'brent_school_invoices'],
      () => {
        const list = this.get<StudentRecord[]>('students', INITIAL_STUDENTS)
        const existingIdx = list.findIndex(
          (s) => s.id === student.id || s.admission_number.toLowerCase() === student.admission_number.toLowerCase()
        )

        const billed = Number(student.term_fee_total) || 75
        const newRecord: StudentRecord = {
          ...student,
          term_fee_total: billed,
          fee_balance: student.fee_balance !== undefined ? Number(student.fee_balance) : billed,
          fee_cleared: student.fee_balance === 0,
          attendance_rate: Number(student.attendance_rate) || 0,
          discipline_points: Number(student.discipline_points) || 0,
          merits_count: student.merits_count || 0,
          demerits_count: student.demerits_count || 0,
        }

        if (existingIdx !== -1) {
          list[existingIdx] = { ...list[existingIdx], ...newRecord }
        } else {
          list.unshift(newRecord)
        }
        this.set('students', list)

        // Automatically create unpaid/pending invoice for the new student
        const invoices = this.get<FeeInvoice[]>('invoices', INITIAL_INVOICES)
        if (!invoices.some((inv) => inv.admission_number.toLowerCase() === student.admission_number.toLowerCase())) {
          invoices.unshift({
            id: `inv-${Date.now()}-${student.admission_number.replace(/[^a-zA-Z0-9]/g, '')}`,
            invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            student_id: student.id,
            student_name: student.full_name,
            admission_number: student.admission_number,
            class_name: student.class_name || 'Short Course Cohort',
            term: 'Term 1',
            academic_year: `${new Date().getFullYear()}`,
            issue_date: student.enrollment_date || new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total_amount: billed,
            paid_amount: 0,
            balance: billed,
            status: 'Pending',
            items: [
              {
                id: `item-${Date.now()}-1`,
                description: `Tuition & Lab Training Fee (${student.class_name})`,
                amount: billed,
              },
            ],
          })
          this.set('invoices', invoices)
        }
      }
    )
    schoolEventBus.publish('STUDENT_ADDED', student)
    schoolEventBus.publish('INVOICE_CREATED')
    schoolEventBus.publish('STUDENT_UPDATED')
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

  async clearAllStudents(): Promise<void> {
    await txEngine.executeAtomic(
      'CLEAR_ALL_STUDENTS',
      ['brent_school_students'],
      () => {
        this.set('students', [])
      }
    )
    schoolEventBus.publish('STUDENT_UPDATED')
  }

  async grantCertificate(id: string, granted: boolean = true, grade: string = 'Distinction (A)'): Promise<void> {
    await txEngine.executeAtomic(
      `GRANT_CERTIFICATE_${id}`,
      ['brent_school_students'],
      () => {
        const list = this.get<StudentRecord[]>('students', INITIAL_STUDENTS)
        const idx = list.findIndex((s) => s.id === id || s.admission_number.toLowerCase() === id.toLowerCase())
        if (idx === -1) throw new IntegrityError(`Student ID "${id}" not found.`)

        const student = list[idx]
        const certNo = student.certificate_number || `EI-CERT-${student.admission_number.replace(/[^a-zA-Z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`

        list[idx] = {
          ...student,
          certificate_granted: granted,
          certificate_granted_at: granted ? new Date().toISOString() : undefined,
          certificate_number: granted ? certNo : undefined,
          certificate_grade: granted ? (grade || 'Distinction (A)') : undefined,
        }
        this.set('students', list)
      }
    )
    schoolEventBus.publish('STUDENT_UPDATED')
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
    const rawInvoices = this.get<FeeInvoice[]>('invoices', INITIAL_INVOICES)
    const rawStudents = this.get<StudentRecord[]>('students', INITIAL_STUDENTS)
    const receipts = this.getReceipts()

    const invoiceList = [...rawInvoices]
    for (const std of rawStudents) {
      const hasInv = invoiceList.some(
        (inv) =>
          (inv.student_id && inv.student_id === std.id) ||
          (inv.admission_number && inv.admission_number.toLowerCase() === std.admission_number.toLowerCase())
      )
      if (!hasInv) {
        const billed = Number(std.term_fee_total) || 4500
        invoiceList.push({
          id: `inv-${std.id}`,
          invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          student_id: std.id,
          student_name: std.full_name,
          admission_number: std.admission_number,
          class_name: std.class_name || 'Short Course Cohort',
          term: 'Term 1',
          academic_year: `${new Date().getFullYear()}`,
          issue_date: std.enrollment_date || new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_amount: billed,
          paid_amount: 0,
          balance: billed,
          status: 'Pending',
          items: [
            {
              id: `item-${std.id}-1`,
              description: `Tuition & Training Fee (${std.class_name})`,
              amount: billed,
            },
          ],
        })
      }
    }

    return invoiceList.map((inv) => {
      const matchingReceipts = receipts.filter(
        (r) =>
          (r.invoice_id && r.invoice_id === inv.id) ||
          (r.student_id && r.student_id === inv.student_id) ||
          (r.admission_number && r.admission_number.toLowerCase() === inv.admission_number.toLowerCase())
      )
      const paid = matchingReceipts.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
      const total = Number(inv.total_amount) || 4500
      const balance = Math.max(0, total - paid)
      const status: 'Paid' | 'Partial' | 'Overdue' | 'Pending' =
        balance === 0 && paid > 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending'
      return {
        ...inv,
        total_amount: total,
        paid_amount: paid,
        balance,
        status,
      }
    })
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

  async updateReceipt(receiptId: string, updated: Partial<FeePaymentReceipt>, adminName?: string): Promise<void> {
    await txEngine.executeAtomic(
      `ATOMIC_UPDATE_PAYMENT_${receiptId}`,
      ['brent_school_receipts', 'brent_school_invoices', 'brent_school_students'],
      () => {
        const receipts = this.getReceipts()
        const idx = receipts.findIndex((r) => r.id === receiptId || r.receipt_number === receiptId)
        if (idx === -1) throw new IntegrityError(`Receipt "${receiptId}" not found.`)

        const oldReceipt = receipts[idx]
        const merged: FeePaymentReceipt = {
          ...oldReceipt,
          ...updated,
          is_updated: true,
          updated_at: new Date().toISOString(),
          updated_by: adminName || 'Principal / Administrator',
        }
        receipts[idx] = merged
        this.set('receipts', receipts)

        // Recalculate invoice and student balance
        const allStudentReceipts = receipts.filter(
          (r) => r.student_id === merged.student_id || r.admission_number.toLowerCase() === merged.admission_number.toLowerCase()
        )
        const totalPaid = allStudentReceipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

        const invoices = this.getInvoices()
        const invIndex = invoices.findIndex((inv) => inv.student_id === merged.student_id || inv.admission_number.toLowerCase() === merged.admission_number.toLowerCase())
        if (invIndex !== -1) {
          invoices[invIndex].paid_amount = totalPaid
          invoices[invIndex].balance = Math.max(0, invoices[invIndex].total_amount - totalPaid)
          invoices[invIndex].status = invoices[invIndex].balance === 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Pending'
          this.set('invoices', invoices)
        }

        const students = this.getStudents()
        const stdIndex = students.findIndex((s) => s.id === merged.student_id || s.admission_number.toLowerCase() === merged.admission_number.toLowerCase())
        if (stdIndex !== -1) {
          const billed = Number(students[stdIndex].term_fee_total) || 60
          students[stdIndex].fee_balance = Math.max(0, billed - totalPaid)
          students[stdIndex].fee_cleared = students[stdIndex].fee_balance === 0
          this.set('students', students)
        }
      }
    )
    schoolEventBus.publish('PAYMENT_RECORDED', updated)
    schoolEventBus.publish('STUDENT_UPDATED')
  }

  async deleteReceipt(receiptId: string): Promise<void> {
    await txEngine.executeAtomic(
      `ATOMIC_DELETE_RECEIPT_${receiptId}`,
      ['brent_school_receipts', 'brent_school_invoices', 'brent_school_students'],
      () => {
        const receipts = this.getReceipts()
        const target = receipts.find((r) => r.id === receiptId || r.receipt_number === receiptId)
        if (!target) return

        const remaining = receipts.filter((r) => r.id !== receiptId && r.receipt_number !== receiptId)
        this.set('receipts', remaining)

        // Recalculate balance
        const allStudentReceipts = remaining.filter(
          (r) => r.student_id === target.student_id || r.admission_number.toLowerCase() === target.admission_number.toLowerCase()
        )
        const totalPaid = allStudentReceipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

        const students = this.getStudents()
        const stdIndex = students.findIndex((s) => s.id === target.student_id || s.admission_number.toLowerCase() === target.admission_number.toLowerCase())
        if (stdIndex !== -1) {
          const billed = Number(students[stdIndex].term_fee_total) || 60
          students[stdIndex].fee_balance = Math.max(0, billed - totalPaid)
          students[stdIndex].fee_cleared = students[stdIndex].fee_balance === 0
          this.set('students', students)
        }
      }
    )
    schoolEventBus.publish('PAYMENT_RECORDED', receiptId)
    schoolEventBus.publish('STUDENT_UPDATED')
  }

  async clearAllReceipts(): Promise<void> {
    await txEngine.executeAtomic(
      'CLEAR_ALL_RECEIPTS',
      ['brent_school_receipts'],
      () => {
        this.set('receipts', [])
      }
    )
    schoolEventBus.publish('PAYMENT_RECORDED')
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
    return this.get<CourseUnit[]>('course_units', INITIAL_COURSE_UNITS)
  }

  async addCourseUnit(unit: CourseUnit): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_COURSE_UNIT_${unit.code}`,
      ['brent_school_course_units'],
      () => {
        const list = this.getCourseUnits()
        const existingIdx = list.findIndex(
          (u) => u.id === unit.id || u.code.toLowerCase() === unit.code.toLowerCase()
        )
        if (existingIdx !== -1) {
          list[existingIdx] = unit
        } else {
          list.unshift(unit)
        }
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

  // --- Faculty Teachers & Course Assignments (ACID Protected) ---
  getTeachers(): FacultyTeacher[] {
    return this.get<FacultyTeacher[]>('faculty_teachers', INITIAL_FACULTY_TEACHERS)
  }

  async addTeacher(teacher: FacultyTeacher): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_TEACHER_${teacher.id}`,
      ['brent_school_faculty_teachers'],
      () => {
        const list = this.getTeachers()
        if (!list.some((t) => t.id === teacher.id || t.name.toLowerCase() === teacher.name.toLowerCase())) {
          list.push(teacher)
          this.set('faculty_teachers', list)
        }
      }
    )
    schoolEventBus.publish('TEACHER_ADDED' as any, teacher)
  }

  async deleteTeacher(id: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_TEACHER_${id}`,
      ['brent_school_faculty_teachers'],
      () => {
        const list = this.getTeachers().filter((t) => t.id !== id)
        this.set('faculty_teachers', list)
      }
    )
    schoolEventBus.publish('TEACHER_UPDATED' as any)
  }

  async clearAllTeachers(): Promise<void> {
    await txEngine.executeAtomic(
      'CLEAR_ALL_TEACHERS',
      ['brent_school_faculty_teachers'],
      () => {
        this.set('faculty_teachers', [])
      }
    )
    schoolEventBus.publish('TEACHER_UPDATED' as any)
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
        const existingIdx = list.findIndex(
          (d) => d.id === dept.id || d.code.toLowerCase() === dept.code.toLowerCase() || d.name.toLowerCase() === dept.name.toLowerCase()
        )
        if (existingIdx !== -1) {
          list[existingIdx] = { ...list[existingIdx], ...dept }
        } else {
          list.unshift(dept)
        }
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
        const existingIdx = list.findIndex(
          (s) => s.id === sub.id || s.code.toLowerCase() === sub.code.toLowerCase() || s.name.toLowerCase() === sub.name.toLowerCase()
        )
        if (existingIdx !== -1) {
          list[existingIdx] = sub
        } else {
          list.unshift(sub)
        }
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

