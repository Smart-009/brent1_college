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
import { supabase } from './supabase'
import { INSTITUTION_CONFIG } from '@/config/institution'

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
    hod_email: `a.mwangi@${INSTITUTION_CONFIG.domain}`,
    programs: ['Full-Stack Web Development (React & Node.js)', 'JavaScript & Cloud Deployment Masterclass'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-data',
    name: 'Department of Python Programming & Data Analytics',
    code: 'DEPT-DATA',
    description: 'Python coding, SQL database analytics, Pandas data science, and business intelligence dashboards.',
    hod_name: 'Dr. Brian Ochieng',
    hod_email: `b.ochieng@${INSTITUTION_CONFIG.domain}`,
    programs: ['Python for Beginners & Data Analytics', 'SQL & Power BI Business Intelligence'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-comp',
    name: 'Department of Computer Applications & Digital Skills',
    code: 'DEPT-COMP',
    description: 'Essential computer packages, Ms Office 365, Google Workspace, speed typing, and digital workflows.',
    hod_name: 'Mr. James Mutua',
    hod_email: `j.mutua@${INSTITUTION_CONFIG.domain}`,
    programs: ['Comprehensive Computer Packages & Digital Skills', 'UI/UX Design & Canva Pro Graphics'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-cyber',
    name: 'Department of Cybersecurity & Network Defense',
    code: 'DEPT-CYBER',
    description: 'Cyber threat detection, ethical hacking fundamentals, network protocols, and security audits.',
    hod_name: 'Mr. David Kiprono',
    hod_email: `d.kiprono@${INSTITUTION_CONFIG.domain}`,
    programs: ['Cybersecurity Fundamentals & Threat Defense', 'Network Administration & Server Security'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-biztech',
    name: 'Department of Business Tech & Computerized Accounting',
    code: 'DEPT-BIZTECH',
    description: 'QuickBooks Online & Desktop, KRA iTax VAT & PAYE filing, digital bookkeeping, and payroll.',
    hod_name: 'Mrs. Grace Wanjiku',
    hod_email: `g.wanjiku@${INSTITUTION_CONFIG.domain}`,
    programs: ['Computerized Accounting (QuickBooks & iTax)', 'Corporate Financial Modeling'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-lang',
    name: 'Department of English & Modern Languages',
    code: 'DEPT-LANG',
    description: 'English fluency, public speaking, business communication, Arabic, French, and German online certification.',
    hod_name: 'Mme. Claire Dubois',
    hod_email: `c.dubois@${INSTITUTION_CONFIG.domain}`,
    programs: ['English Language Mastery & Corporate Speaking', 'Foreign Languages (Arabic, French, German)'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-ielts',
    name: 'Department of IELTS & International Test Prep',
    code: 'DEPT-IELTS',
    description: 'Targeted online IELTS Academic & General Training preparation targeting Band 7.5 - 9.0 scores.',
    hod_name: 'Prof. Eric Thorne',
    hod_email: `e.thorne@${INSTITUTION_CONFIG.domain}`,
    programs: ['IELTS Academic Intensive (Band 7.5+ Target)', 'IELTS General Training for Immigration'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'dept-kisw',
    name: 'Department of Kiswahili Sanifu & African Languages',
    code: 'DEPT-KISW',
    description: 'Online spoken and written Kiswahili for expatriates, tourists, beginners, and corporate professionals.',
    hod_name: 'Mwalimu Amina Yusuf',
    hod_email: `a.yusuf@${INSTITUTION_CONFIG.domain}`,
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
    code: 'GRD-101',
    title: 'Graphics Design & Animation',
    department: 'Department of Computer Applications & Digital Skills',
    program: 'Creative Design & Arts',
    course_duration: '3 Months (Certificate Course)',
    credit_hours: 40,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
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
        resources: [],
      },
      {
        id: 'mod-grd-2',
        module_number: 2,
        title: 'Module 2: Learning Canva Pro',
        hours: 15,
        topics: ['Canva Pro Features', 'Social Media Graphics', 'Brand Kits & Templates'],
        learning_outcomes: ['Design professional social media graphics and brand identities using Canva'],
        resources: [],
      },
      {
        id: 'mod-grd-3',
        module_number: 3,
        title: 'Module 3: Adobe Photoshop & Retouching',
        hours: 15,
        topics: ['Photoshop Tools', 'Layers & Masking', 'Photo Retouching & Compositing'],
        learning_outcomes: ['Master image editing, masking, and commercial visual production in Photoshop'],
        resources: [],
      },
    ],
    lessons: [
      {
        id: 'les-grd-1',
        title: 'Lesson 1: Introduction to Graphic Design & Tools Setup',
        video_url: 'https://www.youtube.com/watch?v=un50Bs4BvZ8',
        duration_minutes: 45,
        content: 'Welcome to Graphics Design & Animation! In this session we explore core design theory, setup software and begin hands-on practical design.',
        meeting_url: 'https://meet.google.com/new',
        resources: [],
      },
      {
        id: 'les-grd-2',
        title: 'Lesson 2: Mastering Canva Pro for Brand Kits',
        video_url: 'https://www.youtube.com/watch?v=un50Bs4BvZ8',
        duration_minutes: 60,
        content: 'Practical workflow for creating high-impact brand kits, flyers, posters, and social media carousels in Canva.',
        meeting_url: 'https://meet.google.com/new',
        resources: [],
      },
      {
        id: 'les-grd-3',
        title: 'Lesson 3: Adobe Photoshop Foundations & Layer Mastery',
        video_url: 'https://www.youtube.com/watch?v=un50Bs4BvZ8',
        duration_minutes: 60,
        content: 'Deep dive into Photoshop layers, selection tools, masking, color grading, and commercial asset exports.',
        meeting_url: 'https://meet.google.com/new',
        resources: [],
      },
    ],
  },
  {
    id: 'unit-swe1',
    code: 'SWE-101',
    title: 'Full-Stack Web Development & Modern JavaScript',
    department: 'School of Software Engineering & Web Development',
    program: 'Software Engineering Diploma',
    course_duration: '12 Weeks (3 Months)',
    credit_hours: 60,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: Master React, Node.js APIs, PostgreSQL database architecture, and cloud deployment.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Tue & Thu: 7:30 PM - 9:30 PM EAT',
    fee: 120,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-swe-1', module_number: 1, title: 'Module 1: HTML5, Modern CSS & Tailwind', hours: 20, topics: ['Semantic HTML', 'Flexbox & CSS Grid', 'Tailwind CSS'], learning_outcomes: ['Build pixel-perfect responsive web interfaces'], resources: [] },
      { id: 'mod-swe-2', module_number: 2, title: 'Module 2: JavaScript & React 19', hours: 20, topics: ['Modern ES6+', 'React Components', 'Hooks & State'], learning_outcomes: ['Develop dynamic single-page web applications in React'], resources: [] },
      { id: 'mod-swe-3', module_number: 3, title: 'Module 3: Node.js, Express & Database APIs', hours: 20, topics: ['REST APIs', 'PostgreSQL', 'Authentication & Deployment'], learning_outcomes: ['Deploy full-stack web applications with cloud databases'], resources: [] },
    ],
    lessons: [
      { id: 'les-swe-1', title: 'Lesson 1: Modern Web Architecture & Frontend Setup', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 60, content: 'Introduction to full-stack engineering, development tools setup, and modern JavaScript syntax.' },
      { id: 'les-swe-2', title: 'Lesson 2: React 19 State Management & Components', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 60, content: 'Building production-grade UI components with React hooks, props, and modern state architecture.' },
      { id: 'les-swe-3', title: 'Lesson 3: REST API Design & PostgreSQL Integration', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 60, content: 'Connecting frontend clients to PostgreSQL database backend APIs with JWT auth security.' },
    ],
  },
  {
    id: 'unit-data1',
    code: 'DATA-101',
    title: 'Python Programming, SQL & Data Analytics',
    department: 'Department of Python Programming & Data Analytics',
    program: 'Data Science & Analytics',
    course_duration: '8 Weeks (2 Months)',
    credit_hours: 45,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: Python data analysis, Pandas, SQL relational queries, and automated data visualization.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Mon & Wed: 8:00 PM - 9:30 PM EAT',
    fee: 95,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-data-1', module_number: 1, title: 'Module 1: Python Programming Core', hours: 15, topics: ['Data Types', 'Functions', 'OOP in Python'], learning_outcomes: ['Write clean, efficient Python scripts'], resources: [] },
      { id: 'mod-data-2', module_number: 2, title: 'Module 2: Pandas, NumPy & Data Wrangling', hours: 15, topics: ['DataFrames', 'Cleaning Datasets', 'Statistical Analysis'], learning_outcomes: ['Transform raw data into business intelligence insights'], resources: [] },
      { id: 'mod-data-3', module_number: 3, title: 'Module 3: SQL Databases & BI Dashboards', hours: 15, topics: ['Complex SQL Joins', 'Aggregations', 'Dashboard Reports'], learning_outcomes: ['Query enterprise databases and present executive charts'], resources: [] },
    ],
    lessons: [
      { id: 'les-data-1', title: 'Lesson 1: Python Fundamentals & Data Structures', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 60, content: 'Mastering Python syntax, variables, lists, dictionaries, and programmatic logic.' },
      { id: 'les-data-2', title: 'Lesson 2: Data Wrangling & Analysis with Pandas', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 60, content: 'Analyzing enterprise datasets using Python Pandas, filtering records, and extracting insights.' },
    ],
  },
  {
    id: 'unit-comp1',
    code: 'COMP-101',
    title: 'Comprehensive Computer Packages & Digital Literacy',
    department: 'Department of Computer Applications & Digital Skills',
    program: 'Vocational Digital Literacy',
    course_duration: '4 Weeks (1 Month)',
    credit_hours: 30,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: Ms Word, Excel Pro, PowerPoint presentations, Google Workspace, speed typing & Canva graphics.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Mon to Fri: 6:00 PM - 7:30 PM EAT',
    fee: 45,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-comp-1', module_number: 1, title: 'Module 1: Microsoft Office Pro', hours: 15, topics: ['MS Word', 'Excel Formulas', 'PowerPoint'], learning_outcomes: ['Produce corporate documents and financial spreadsheets'], resources: [] },
      { id: 'mod-comp-2', module_number: 2, title: 'Module 2: Cloud Workspace & Virtual Assistant Skills', hours: 15, topics: ['Google Drive', 'Email Etiquette', 'Speed Typing'], learning_outcomes: ['Operate as a productive virtual office assistant'], resources: [] },
    ],
    lessons: [
      { id: 'les-comp-1', title: 'Lesson 1: Professional Document Creation & Formatting in Word', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 45, content: 'Corporate document layout, tables, styles, and automated table of contents in Word.' },
      { id: 'les-comp-2', title: 'Lesson 2: Excel Functions, Formulas & Data Tables', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 50, content: 'Essential arithmetic functions, VLOOKUP, conditional formatting, and summary charts.' },
    ],
  },
  {
    id: 'unit-cyb1',
    code: 'CYB-101',
    title: 'Cybersecurity Fundamentals & Ethical Defense',
    department: 'Department of Cybersecurity & Network Defense',
    program: 'Cyber Defense Certificate',
    course_duration: '6 Weeks',
    credit_hours: 35,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: Threat detection, network security defense, password hashing, encryption & risk assessment.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Sat & Sun: 4:00 PM - 6:00 PM EAT',
    fee: 89,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-cyb-1', module_number: 1, title: 'Module 1: Network Protocols & Threat Modeling', hours: 15, topics: ['TCP/IP', 'Firewalls', 'Social Engineering'], learning_outcomes: ['Identify security vulnerabilities and defend systems'], resources: [] },
      { id: 'mod-cyb-2', module_number: 2, title: 'Module 2: Cryptography & Security Operations', hours: 20, topics: ['Hashing', 'SSL/TLS', 'SOC Incident Response'], learning_outcomes: ['Implement security protocols for organizational infrastructure'], resources: [] },
    ],
    lessons: [
      { id: 'les-cyb-1', title: 'Lesson 1: Network Security, Firewalls & Threat Analysis', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 55, content: 'Understanding attack vectors, packet inspection, and firewall defense strategies.' },
    ],
  },
  {
    id: 'unit-acc1',
    code: 'ACC-101',
    title: 'Computerized Accounting, QuickBooks & KRA iTax',
    department: 'Department of Business Tech & Computerized Accounting',
    program: 'Accounting & Finance',
    course_duration: '4 Weeks (1 Month)',
    credit_hours: 30,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: QuickBooks Pro, monthly KRA iTax filing (VAT, PAYE), payroll computations & financial balance sheets.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Mon, Wed & Fri: 6:00 PM - 7:30 PM EAT',
    fee: 65,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-acc-1', module_number: 1, title: 'Module 1: QuickBooks Setup & General Ledger', hours: 15, topics: ['Chart of Accounts', 'Customer Invoices', 'Vendor Bills'], learning_outcomes: ['Manage complete bookkeeping ledgers in QuickBooks'], resources: [] },
      { id: 'mod-acc-2', module_number: 2, title: 'Module 2: Payroll & KRA Tax Compliance', hours: 15, topics: ['PAYE Computation', 'VAT Returns', 'iTax Portal Filing'], learning_outcomes: ['Process payroll deductions and file statutory tax returns'], resources: [] },
    ],
    lessons: [
      { id: 'les-acc-1', title: 'Lesson 1: Setting up Chart of Accounts & Invoicing in QuickBooks', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 50, content: 'Step-by-step setup of commercial company files and customer transactions in QuickBooks.' },
    ],
  },
  {
    id: 'unit-eng1',
    code: 'ENG-101',
    title: 'English Language & IELTS Academic / General Prep',
    department: 'Department of English & Modern Languages',
    program: 'Languages & International Communication',
    course_duration: '8 Weeks (2 Months)',
    credit_hours: 40,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: Spoken English fluency, business correspondence, IELTS 7.5+ band strategies & exam preparation.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Tue, Thu & Sat: 7:00 PM - 8:30 PM EAT',
    fee: 75,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-eng-1', module_number: 1, title: 'Module 1: Spoken Fluency & Pronunciation', hours: 20, topics: ['Phonetics', 'Conversational English', 'Public Speaking'], learning_outcomes: ['Speak with confidence and clarity in international settings'], resources: [] },
      { id: 'mod-eng-2', module_number: 2, title: 'Module 2: IELTS Reading, Writing & Listening Band 7+', hours: 20, topics: ['Academic Essays', 'Listening Strategies', 'Mock Exams'], learning_outcomes: ['Score Band 7.5+ on IELTS Academic/General exams'], resources: [] },
    ],
    lessons: [
      { id: 'les-eng-1', title: 'Lesson 1: IELTS Speaking & Academic Writing Mastery', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 50, content: 'Key strategies to excel in IELTS Speaking Part 1-3 and Task 2 argumentative essays.' },
    ],
  },
  {
    id: 'unit-mkt1',
    code: 'MKT-101',
    title: 'Digital Marketing, Social Media & Content Creation',
    department: 'Department of Digital Marketing & Media',
    program: 'Digital Marketing Diploma',
    course_duration: '4 Weeks (1 Month)',
    credit_hours: 30,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: Meta Ads, TikTok & Instagram growth, SEO ranking, Google Ads, email funnels & influencer monetization.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Mon, Wed & Fri: 7:30 PM - 9:00 PM EAT',
    fee: 55,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-mkt-1', module_number: 1, title: 'Module 1: Meta Ads & TikTok Viral Growth', hours: 15, topics: ['Ad Targeting', 'Copywriting', 'Short-Form Video'], learning_outcomes: ['Run high-converting social media marketing campaigns'], resources: [] },
      { id: 'mod-mkt-2', module_number: 2, title: 'Module 2: SEO, Google Search Ads & Email Funnels', hours: 15, topics: ['Keyword Research', 'Google Ads', 'Email Automation'], learning_outcomes: ['Drive organic and paid client acquisition funnels'], resources: [] },
    ],
    lessons: [
      { id: 'les-mkt-1', title: 'Lesson 1: High-Converting Meta & TikTok Ad Campaigns', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 45, content: 'Configuring Meta Ads Manager, custom audience targeting, and copywriting.' },
    ],
  },
  {
    id: 'unit-frn1',
    code: 'FRN-101',
    title: 'French Language for Beginners & DELF Prep',
    department: 'Department of English & Modern Languages',
    program: 'Modern Languages',
    course_duration: '8 Weeks (2 Months)',
    credit_hours: 40,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: Spoken French, listening comprehension, grammar, and international DELF examination prep.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Mon, Wed & Fri: 6:00 PM - 7:30 PM EAT',
    fee: 79,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-frn-1', module_number: 1, title: 'Module 1: French Foundations A1', hours: 20, topics: ['Greetings', 'Numbers', 'Basic Conjugation'], learning_outcomes: ['Hold basic daily conversations in French'], resources: [] },
      { id: 'mod-frn-2', module_number: 2, title: 'Module 2: Professional French & DELF Prep', hours: 20, topics: ['Workplace French', 'DELF A1/A2 Practice'], learning_outcomes: ['Pass international DELF language assessments'], resources: [] },
    ],
    lessons: [
      { id: 'les-frn-1', title: 'Lesson 1: French Pronunciation & Daily Conversations', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 50, content: 'Mastering the French alphabet, pronunciation rules, and essential phrases.' },
    ],
  },
  {
    id: 'unit-ger1',
    code: 'GER-101',
    title: 'German Language for Work & Studies (Goethe Prep)',
    department: 'Department of English & Modern Languages',
    program: 'Modern Languages',
    course_duration: '8 Weeks (2 Months)',
    credit_hours: 40,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: German grammar, conversational fluency, Goethe-Zertifikat A1/A2 preparation for work & university.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Tue & Thu: 6:00 PM - 8:00 PM EAT',
    fee: 79,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-ger-1', module_number: 1, title: 'Module 1: German A1 Grammar & Vocabulary', hours: 20, topics: ['Articles', 'Cases', 'Sentence Structure'], learning_outcomes: ['Understand fundamental German grammar rules'], resources: [] },
      { id: 'mod-ger-2', module_number: 2, title: 'Module 2: Goethe A1 Exam Preparation', hours: 20, topics: ['Listening Tests', 'Speaking Simulation'], learning_outcomes: ['Prepare for Goethe-Zertifikat certification'], resources: [] },
    ],
    lessons: [
      { id: 'les-ger-1', title: 'Lesson 1: German Alphabet, Cases & Essential Verbs', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 50, content: 'Understanding German noun genders (der, die, das) and basic conversational sentences.' },
    ],
  },
  {
    id: 'unit-ara1',
    code: 'ARA-101',
    title: 'Arabic Language & Islamic Calligraphy Basics',
    department: 'Department of English & Modern Languages',
    program: 'Modern Languages',
    course_duration: '8 Weeks (2 Months)',
    credit_hours: 35,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: Modern Standard Arabic, conversational reading, vocabulary & Arabic calligraphy foundations.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Sat & Sun: 9:00 AM - 11:00 AM EAT',
    fee: 65,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-ara-1', module_number: 1, title: 'Module 1: Arabic Reading, Writing & Tajweed', hours: 15, topics: ['Alphabet', 'Vowel Marks', 'Sentence Construction'], learning_outcomes: ['Read and write fluent Arabic script'], resources: [] },
      { id: 'mod-ara-2', module_number: 2, title: 'Module 2: Conversational Gulf & Standard Arabic', hours: 20, topics: ['Daily Dialogue', 'Business Arabic'], learning_outcomes: ['Communicate effectively in Arabic speaking regions'], resources: [] },
    ],
    lessons: [
      { id: 'les-ara-1', title: 'Lesson 1: Arabic Alphabet, Pronunciation & Basic Dialogue', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 50, content: 'Mastering Arabic letters, joining letters, and essential greetings.' },
    ],
  },
  {
    id: 'unit-kis1',
    code: 'KIS-101',
    title: 'Kiswahili Sanifu & East African Business Fluency',
    department: 'Department of English & Modern Languages',
    program: 'Modern Languages',
    course_duration: '4 Weeks (1 Month)',
    credit_hours: 30,
    teacher_id: 'tch-faculty',
    teacher_name: 'Faculty Instructor',
    description: '100% Online: Spoken Swahili fluency, business negotiations, translation & East African trade communication.',
    live_meeting_url: 'https://meet.google.com/new',
    live_schedule_text: 'Mon, Wed & Fri: 5:00 PM - 6:30 PM EAT',
    fee: 40,
    is_published: true,
    created_at: new Date().toISOString(),
    syllabus_modules: [
      { id: 'mod-kis-1', module_number: 1, title: 'Module 1: Kiswahili Sanifu Sarufi & Mazungumzo', hours: 15, topics: ['Ngeli za Nomino', 'Msamiati wa Biashara'], learning_outcomes: ['Master grammatical structures and business vocabulary in Swahili'], resources: [] },
      { id: 'mod-kis-2', module_number: 2, title: 'Module 2: Ufasaha na Mawasiliano ya Kikazi', hours: 15, topics: ['Hotuba', 'Tafsiri'], learning_outcomes: ['Communicate professionally across East African markets'], resources: [] },
    ],
    lessons: [
      { id: 'les-kis-1', title: 'Lesson 1: Sarufi ya Kiswahili na Mazungumzo ya Kila Siku', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration_minutes: 45, content: 'Utangulizi wa sarufi ya Kiswahili sanifu, maamkizi, na ufasaha wa mazungumzo.' },
    ],
  },
]

export const INITIAL_INVOICES: FeeInvoice[] = []
export const INITIAL_RECEIPTS: FeePaymentReceipt[] = []
export const INITIAL_RESOURCES: AcademicResource[] = [
  {
    id: 'res-fullstack-guide',
    title: 'Full-Stack Web Development & Modern React 19 Mastery Handbook',
    category: 'Textbooks',
    subject: 'Tech & Programming',
    class_level: 'All Trainees / Diploma',
    file_url: 'https://drive.google.com/file/d/1vQ2Z8mH7x8Q4Y5B9A6C3D2E1F0G/preview',
    file_size: '4.8 MB',
    file_type: 'PDF',
    downloads_count: 142,
    year: 2026,
    uploaded_by: 'Éclat Institute Faculty',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-python-lab',
    title: 'Python Data Science, Automation & Machine Learning Practical Lab Manual',
    category: 'Lab Manuals',
    subject: 'Tech & Programming',
    class_level: 'Certificate / Diploma',
    file_url: 'https://drive.google.com/file/d/1vQ2Z8mH7x8Q4Y5B9A6C3D2E1F0G/preview',
    file_size: '3.6 MB',
    file_type: 'PDF',
    downloads_count: 98,
    year: 2026,
    uploaded_by: 'Department of Computing',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-ielts-prep',
    title: 'IELTS Academic & General 8.0 Band Comprehensive Preparation Guide & Past Papers',
    category: 'Past Papers',
    subject: 'Languages & Communication',
    class_level: 'International Candidates',
    file_url: 'https://drive.google.com/file/d/1vQ2Z8mH7x8Q4Y5B9A6C3D2E1F0G/preview',
    file_size: '5.2 MB',
    file_type: 'PDF',
    downloads_count: 215,
    year: 2026,
    uploaded_by: 'Department of Modern Languages',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-quickbooks-guide',
    title: 'Computerized Accounting, QuickBooks Pro & KRA iTax Filing Manual',
    category: 'Textbooks',
    subject: 'Business Tech & Accounting',
    class_level: 'Accounting Trainees',
    file_url: 'https://drive.google.com/file/d/1vQ2Z8mH7x8Q4Y5B9A6C3D2E1F0G/preview',
    file_size: '3.1 MB',
    file_type: 'PDF',
    downloads_count: 87,
    year: 2026,
    uploaded_by: 'Department of Business Tech',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-cybersecurity-handbook',
    title: 'Cybersecurity Fundamentals, Network Defense & Threat Modeling Handbook',
    category: 'Textbooks',
    subject: 'Tech & Programming',
    class_level: 'Diploma / Advanced',
    file_url: 'https://drive.google.com/file/d/1vQ2Z8mH7x8Q4Y5B9A6C3D2E1F0G/preview',
    file_size: '4.2 MB',
    file_type: 'PDF',
    downloads_count: 110,
    year: 2026,
    uploaded_by: 'Cyber Defense Faculty',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-computer-packages-notes',
    title: 'Comprehensive Computer Packages & Digital Workplace Office Mastery',
    category: 'Revision Notes',
    subject: 'Computer & Digital Skills',
    class_level: 'Foundational / Certificate',
    file_url: 'https://drive.google.com/file/d/1vQ2Z8mH7x8Q4Y5B9A6C3D2E1F0G/preview',
    file_size: '2.9 MB',
    file_type: 'PDF',
    downloads_count: 176,
    year: 2026,
    uploaded_by: 'Digital Skills Faculty',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-french-conversational',
    title: 'Modern Conversational French & DELF A1/A2 Examination Study Notes',
    category: 'Revision Notes',
    subject: 'Languages & Communication',
    class_level: 'All Language Students',
    file_url: 'https://drive.google.com/file/d/1vQ2Z8mH7x8Q4Y5B9A6C3D2E1F0G/preview',
    file_size: '2.4 MB',
    file_type: 'PDF',
    downloads_count: 64,
    year: 2026,
    uploaded_by: 'Department of Modern Languages',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-digital-marketing-strategy',
    title: 'Digital Marketing, Meta Ads & Social Media Monetization Strategy Framework',
    category: 'Lab Manuals',
    subject: 'Digital Marketing & Media',
    class_level: 'Professional Certificate',
    file_url: 'https://drive.google.com/file/d/1vQ2Z8mH7x8Q4Y5B9A6C3D2E1F0G/preview',
    file_size: '3.8 MB',
    file_type: 'PDF',
    downloads_count: 133,
    year: 2026,
    uploaded_by: 'Media & Marketing Faculty',
    created_at: new Date().toISOString(),
  },
]
export const INITIAL_DISCIPLINE: DisciplineRecord[] = []
export const INITIAL_NOTICES: SchoolNotice[] = []
export const INITIAL_REMINDERS: PaymentReminder[] = []
export const INITIAL_INQUIRIES: SecretaryInquiry[] = []

// ============================================================
// High-Performance Data Access & Transaction Store
// ============================================================
class SchoolDataStore {
  private memCache = new Map<string, any>()
  private syncChannel: any = null
  private isSyncing = false

  constructor() {
    this.cleanLegacyMockData()
    this.setupRealtimeSync()
    this.syncWithCloud().catch(() => {})
  }

  private setupRealtimeSync() {
    try {
      this.syncChannel = supabase.channel('eclat-cloud-sync')
        .on('broadcast', { event: 'store_data_sync' }, () => {
          this.syncWithCloud(true).catch(() => {})
        })
        .subscribe()
    } catch {}
  }

  broadcastChange(type: string, data?: any) {
    try {
      if (this.syncChannel) {
        this.syncChannel.send({
          type: 'broadcast',
          event: 'store_data_sync',
          payload: { type, data, timestamp: Date.now() },
        })
      }
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('eclat-courses-updated'))
    } catch {}
  }

  async syncWithCloud(force: boolean = false): Promise<void> {
    if (this.isSyncing && !force) return
    this.isSyncing = true

    try {
      // 1. Sync Courses & Lessons from Supabase
      const { data: cloudCourses } = await supabase
        .from('courses')
        .select('*, lessons(*)')
        .order('created_at', { ascending: false })

      if (cloudCourses && cloudCourses.length > 0) {
        const localUnits = this.getCourseUnits()
        let unitsUpdated = false

        for (const cc of cloudCourses) {
          let parsedDesc: any = {}
          try {
            if (cc.description && cc.description.startsWith('{')) {
              parsedDesc = JSON.parse(cc.description)
            }
          } catch {}

          const unitLessons = (cc.lessons || []).map((l: any) => ({
            id: l.id,
            title: l.title,
            video_url: l.youtube_url || '',
            duration_minutes: 45,
            content: l.description || '',
            resources: [],
          }))

          const existingIdx = localUnits.findIndex(
            (u) => u.id === cc.id || u.title.toLowerCase() === cc.title.toLowerCase() || (parsedDesc.unit_id && u.id === parsedDesc.unit_id)
          )

          const mappedUnit: CourseUnit = {
            id: parsedDesc.unit_id || cc.id,
            code: parsedDesc.code || `CRS-${cc.id.substring(0, 4).toUpperCase()}`,
            title: cc.title,
            department: parsedDesc.department || 'School of Computing & Tech',
            program: parsedDesc.program || `${cc.title} Diploma`,
            course_duration: parsedDesc.course_duration || '3 Months Certificate',
            credit_hours: parsedDesc.credit_hours || 40,
            teacher_id: cc.teacher_id || 'tch-faculty',
            teacher_name: parsedDesc.teacher_name || 'Faculty Lecturer',
            description: parsedDesc.description || (cc.description && !cc.description.startsWith('{') ? cc.description : `Comprehensive online training in ${cc.title}.`),
            live_meeting_url: parsedDesc.live_meeting_url || '',
            live_schedule_text: parsedDesc.live_schedule_text || '',
            fee: parsedDesc.fee || 60,
            syllabus_modules: parsedDesc.syllabus_modules || [],
            lessons: unitLessons.length > 0 ? unitLessons : (parsedDesc.lessons || []),
            is_published: cc.is_published ?? true,
            created_at: cc.created_at,
          }

          if (existingIdx !== -1) {
            localUnits[existingIdx] = {
              ...mappedUnit,
              ...localUnits[existingIdx],
              lessons: unitLessons.length > 0 ? unitLessons : (localUnits[existingIdx].lessons || mappedUnit.lessons),
            }
          } else {
            localUnits.push(mappedUnit)
            unitsUpdated = true
          }
        }

        if (unitsUpdated) {
          this.set('course_units', localUnits)
          schoolEventBus.publish('COURSE_UNIT_CREATED' as any)
        }
      }

      // 2. Sync Profiles from Supabase to Students
      const { data: profiles } = await supabase.from('profiles').select('*')
      if (profiles && profiles.length > 0) {
        const studentProfiles = profiles.filter((p) => p.role === 'student')
        if (studentProfiles.length > 0) {
          const localStudents = this.getStudents()
          let stdUpdated = false

          for (const sp of studentProfiles) {
            const exists = localStudents.find(
              (s) => s.admission_number.toLowerCase() === sp.admission_number.toLowerCase() || s.id === sp.id
            )
            if (!exists) {
              localStudents.push({
                id: sp.id,
                admission_number: sp.admission_number,
                full_name: sp.full_name,
                gender: 'Male',
                dob: '2004-01-01',
                class_id: 'class-main',
                class_name: 'Online Vocational Program',
                grade_level: '2026 Virtual Intake',
                stream: '100% Online Cohort',
                enrollment_date: sp.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                admission_date: sp.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                status: sp.is_active ? 'Active' : 'Suspended',
                guardian: { name: 'Self-Sponsored', relationship: 'Self', phone: '', email: '' },
                emergency_contact: '',
                fee_balance: 0,
                term_fee_total: 60,
                fee_cleared: true,
                attendance_rate: 100,
                discipline_points: 100,
                merits_count: 0,
                demerits_count: 0,
                biometric_enrolled: false,
              })
              stdUpdated = true
            }
          }

          if (stdUpdated) {
            this.set('students', localStudents)
            schoolEventBus.publish('STUDENT_UPDATED')
          }
        }
      }
    } catch (err) {
      console.warn('Cloud store sync notice:', err)
    } finally {
      this.isSyncing = false
    }
  }

  private cleanLegacyMockData() {
    try {
      const isCleaned = localStorage.getItem('eclat_launch_pure_v9')
      if (!isCleaned) {
        const activeProfileRaw = localStorage.getItem('eclat_active_profile') || sessionStorage.getItem('eclat_active_profile')
        if (activeProfileRaw) {
          try {
            const parsed = JSON.parse(activeProfileRaw)
            if (parsed.role === 'student' && (parsed.admission_number?.includes('001') || parsed.full_name?.toLowerCase().includes('trainee'))) {
              localStorage.removeItem('eclat_active_profile')
              sessionStorage.removeItem('eclat_active_profile')
            }
          } catch {}
        }
        localStorage.removeItem('eclat_demo_role')
        localStorage.removeItem('eclat_school_students')
        localStorage.removeItem('eclat_school_students')
        localStorage.removeItem('eclat_school_course_units')
        localStorage.removeItem('eclat_school_course_units')
        localStorage.removeItem('eclat_school_unit_registrations')
        localStorage.removeItem('eclat_school_unit_registrations')
        localStorage.removeItem('eclat_school_invoices')
        localStorage.removeItem('eclat_school_invoices')
        localStorage.removeItem('eclat_school_receipts')
        localStorage.removeItem('eclat_school_receipts')
        localStorage.removeItem('eclat_school_timetable')
        localStorage.removeItem('eclat_school_exams')
        localStorage.removeItem('eclat_school_report_cards')
        localStorage.removeItem('eclat_school_resources')
        localStorage.removeItem('eclat_school_discipline')
        localStorage.removeItem('eclat_school_notices')
        localStorage.removeItem('eclat_school_reminders')
        localStorage.removeItem('eclat_school_inquiries')
        localStorage.setItem('eclat_launch_pure_v9', 'true')
      }
    } catch {}
  }

  purgeAllDataForLaunch(): void {
    this.memCache.clear()
    localStorage.removeItem('eclat_school_students')
    localStorage.removeItem('eclat_school_timetable')
    localStorage.removeItem('eclat_school_exams')
    localStorage.removeItem('eclat_school_report_cards')
    localStorage.removeItem('eclat_school_invoices')
    localStorage.removeItem('eclat_school_receipts')
    localStorage.removeItem('eclat_school_resources')
    localStorage.removeItem('eclat_school_discipline')
    localStorage.removeItem('eclat_school_notices')
    localStorage.removeItem('eclat_school_reminders')
    localStorage.removeItem('eclat_school_inquiries')
    localStorage.removeItem('eclat_school_course_units')
    localStorage.removeItem('eclat_school_unit_registrations')
    schoolEventBus.publish('STUDENT_UPDATED')
    schoolEventBus.publish('PAYMENT_RECORDED')
  }

  private get<T>(key: string, fallback: T): T {
    if (this.memCache.has(key)) {
      return this.memCache.get(key)
    }
    try {
      const stored = localStorage.getItem(`eclat_school_${key}`) || localStorage.getItem(`eclat_school_${key}`)
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
      const billed = Number(s.term_fee_total) || 60
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
      ['eclat_school_students', 'eclat_school_invoices'],
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
    this.broadcastChange('STUDENT_ADDED', student)

    try {
      supabase.from('profiles').upsert({
        id: student.id,
        full_name: student.full_name,
        admission_number: student.admission_number,
        role: 'student',
        is_active: student.status === 'Active',
      }).then(() => {})
    } catch {}
  }

  async updateStudent(id: string, updated: Partial<StudentRecord>): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_STUDENT_${id}`,
      ['eclat_school_students'],
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
    this.broadcastChange('STUDENT_UPDATED', updated)
  }

  async deleteStudent(id: string): Promise<void> {
    const students = this.getStudents()
    const student = students.find((s) => s.id === id || s.admission_number.toLowerCase() === id.toLowerCase())
    const targetId = student?.id || id
    const targetAdm = student?.admission_number || ''
    const cleanAdm = targetAdm.toLowerCase().replace(/[^a-z0-9]/g, '')

    await txEngine.executeAtomic(
      `CASCADE_DELETE_STUDENT_${targetId}`,
      [
        'eclat_school_students',
        'eclat_school_invoices',
        'eclat_school_receipts',
        'eclat_school_unit_registrations',
        'eclat_school_report_cards',
        'eclat_school_exams',
        'eclat_school_reminders',
        'eclat_school_discipline',
      ],
      () => {
        const matchesStudent = (rec: { student_id?: string; admission_number?: string }) => {
          if (!rec) return false
          if (rec.student_id && (rec.student_id === targetId || rec.student_id === id)) return true
          if (targetAdm && rec.admission_number && rec.admission_number.toLowerCase() === targetAdm.toLowerCase()) return true
          return false
        }

        // 1. Purge Student Record
        const filteredStudents = this.getStudents().filter(
          (s) => s.id !== targetId && s.id !== id && (!targetAdm || s.admission_number.toLowerCase() !== targetAdm.toLowerCase())
        )
        this.set('students', filteredStudents)

        // 2. Cascade Purge Invoices
        const filteredInvoices = this.getInvoices().filter((inv) => !matchesStudent(inv))
        this.set('invoices', filteredInvoices)

        // 3. Cascade Purge Receipts
        const filteredReceipts = this.getReceipts().filter((r) => !matchesStudent(r))
        this.set('receipts', filteredReceipts)

        // 4. Cascade Purge Unit Registrations
        const filteredRegistrations = this.getUnitRegistrations().filter((reg) => !matchesStudent(reg))
        this.set('unit_registrations', filteredRegistrations)

        // 5. Cascade Purge Report Cards / Transcripts
        const filteredReports = this.getReportCards().filter((rc) => !matchesStudent(rc))
        this.set('report_cards', filteredReports)

        // 6. Cascade Purge Payment Reminders
        const filteredReminders = this.getReminders().filter((rem) => !matchesStudent(rem))
        this.set('reminders', filteredReminders)

        // 7. Cascade Purge Discipline Records
        const filteredDiscipline = this.getDiscipline().filter((d) => !matchesStudent(d))
        this.set('discipline', filteredDiscipline)

        // 8. Cascade Purge Biometric Clearance Logs
        const filteredLogs = this.getBiometricClearanceLogs().filter((log) => !matchesStudent(log))
        this.set('biometric_clearance_logs', filteredLogs)

        // 10. Clean Local Credentials Store
        try {
          const rawCreds = localStorage.getItem('eclat_local_credentials') || localStorage.getItem('eclat_local_credentials')
          if (rawCreds) {
            const creds = JSON.parse(rawCreds)
            if (targetAdm && creds[targetAdm.toLowerCase()]) delete creds[targetAdm.toLowerCase()]
            if (cleanAdm && creds[cleanAdm]) delete creds[cleanAdm]
            if (creds[targetId]) delete creds[targetId]
            localStorage.setItem('eclat_local_credentials', JSON.stringify(creds))
            localStorage.setItem('eclat_local_credentials', JSON.stringify(creds))
          }
        } catch {}
      }
    )

    // 11. Cloud Cascade Deletion via Supabase
    try {
      if (targetId) {
        supabase.from('profiles').delete().eq('id', targetId).then(() => {})
      }
      if (targetAdm) {
        supabase.from('profiles').delete().eq('admission_number', targetAdm).then(() => {})
      }
    } catch {}

    schoolEventBus.publish('STUDENT_DELETED', targetId)
    schoolEventBus.publish('STUDENT_UPDATED')
    schoolEventBus.publish('INVOICE_CREATED')
    schoolEventBus.publish('PAYMENT_RECORDED')
    this.broadcastChange('STUDENT_DELETED', { id: targetId, admission_number: targetAdm })
  }

  async clearAllStudents(): Promise<void> {
    await txEngine.executeAtomic(
      'CLEAR_ALL_STUDENTS_CASCADE',
      [
        'eclat_school_students',
        'eclat_school_invoices',
        'eclat_school_receipts',
        'eclat_school_unit_registrations',
        'eclat_school_report_cards',
        'eclat_school_reminders',
        'eclat_school_discipline',
      ],
      () => {
        this.set('students', [])
        this.set('invoices', [])
        this.set('receipts', [])
        this.set('unit_registrations', [])
        this.set('report_cards', [])
        this.set('reminders', [])
        this.set('discipline', [])
        this.set('biometric_clearance_logs', [])

        localStorage.removeItem('eclat_local_credentials')
        localStorage.removeItem('eclat_local_credentials')
      }
    )

    try {
      supabase.from('profiles').delete().eq('role', 'student').then(() => {})
    } catch {}

    schoolEventBus.publish('STUDENT_UPDATED')
    schoolEventBus.publish('INVOICE_CREATED')
    schoolEventBus.publish('PAYMENT_RECORDED')
    this.broadcastChange('STUDENTS_CLEARED')
  }

  async grantCertificate(id: string, granted: boolean = true, grade: string = 'Distinction (A)'): Promise<void> {
    await txEngine.executeAtomic(
      `GRANT_CERTIFICATE_${id}`,
      ['eclat_school_students'],
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
      ['eclat_school_timetable'],
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
      ['eclat_school_timetable'],
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
      ['eclat_school_timetable'],
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
        const billed = Number(std.term_fee_total) || 60
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
      const total = Number(inv.total_amount) || 60
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
      ['eclat_school_invoices'],
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

  async updateInvoice(invoiceId: string, updated: Partial<FeeInvoice>, adminName?: string): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_INVOICE_${invoiceId}`,
      ['eclat_school_invoices', 'eclat_school_students'],
      () => {
        const list = this.getInvoices()
        const idx = list.findIndex((inv) => inv.id === invoiceId || inv.invoice_number === invoiceId)
        if (idx === -1) throw new IntegrityError(`Invoice "${invoiceId}" not found.`)

        const oldInv = list[idx]
        const items = updated.items || oldInv.items
        const totalAmount = updated.total_amount ?? items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
        const paidAmount = updated.paid_amount ?? oldInv.paid_amount
        const balance = Math.max(0, totalAmount - paidAmount)
        const status: 'Paid' | 'Partial' | 'Overdue' | 'Pending' =
          balance === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending'

        const merged: FeeInvoice = {
          ...oldInv,
          ...updated,
          items,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          balance,
          status,
          is_updated: true,
          updated_at: new Date().toISOString(),
          updated_by: adminName || 'Principal / Administrator',
        }

        list[idx] = merged
        this.set('invoices', list)

        // Update student fee total and balance
        const students = this.getStudents()
        const stdIdx = students.findIndex((s) => s.id === merged.student_id || s.admission_number.toLowerCase() === merged.admission_number.toLowerCase())
        if (stdIdx !== -1) {
          students[stdIdx].term_fee_total = totalAmount
          students[stdIdx].fee_balance = balance
          students[stdIdx].fee_cleared = balance === 0
          this.set('students', students)
        }
      }
    )
    schoolEventBus.publish('INVOICE_CREATED', updated)
    schoolEventBus.publish('STUDENT_UPDATED')
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_INVOICE_${invoiceId}`,
      ['eclat_school_invoices'],
      () => {
        const list = this.getInvoices().filter((inv) => inv.id !== invoiceId && inv.invoice_number !== invoiceId)
        this.set('invoices', list)
      }
    )
    schoolEventBus.publish('INVOICE_CREATED', invoiceId)
  }

  async clearAllInvoices(): Promise<void> {
    await txEngine.executeAtomic(
      'CLEAR_ALL_INVOICES',
      ['eclat_school_invoices'],
      () => {
        this.set('invoices', [])
      }
    )
    schoolEventBus.publish('INVOICE_CREATED')
  }

  getReceipts(): FeePaymentReceipt[] {
    return this.get<FeePaymentReceipt[]>('receipts', INITIAL_RECEIPTS)
  }

  async recordPayment(receipt: FeePaymentReceipt): Promise<void> {
    await txEngine.executeAtomic(
      `ATOMIC_RECORD_PAYMENT_${receipt.receipt_number}`,
      ['eclat_school_receipts', 'eclat_school_invoices', 'eclat_school_students'],
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
      ['eclat_school_receipts', 'eclat_school_invoices', 'eclat_school_students'],
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
      ['eclat_school_receipts', 'eclat_school_invoices', 'eclat_school_students'],
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
      ['eclat_school_receipts'],
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
      ['eclat_school_reminders'],
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
      ['eclat_school_inquiries'],
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
      ['eclat_school_notices'],
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
      ['eclat_school_notices'],
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
      ['eclat_school_notices'],
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
      ['eclat_school_exams'],
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
      ['eclat_school_report_cards'],
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
      ['eclat_school_resources'],
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
      ['eclat_school_resources'],
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
      ['eclat_school_resources'],
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
      ['eclat_school_discipline'],
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
      ['eclat_school_course_units'],
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
    this.broadcastChange('COURSE_UNIT_CREATED', unit)

    // Asynchronously push to Supabase courses & lessons
    try {
      const { data: courseRow } = await supabase.from('courses').upsert({
        title: unit.title,
        description: JSON.stringify({
          unit_id: unit.id,
          code: unit.code,
          department: unit.department,
          program: unit.program,
          course_duration: unit.course_duration,
          credit_hours: unit.credit_hours,
          fee: unit.fee,
          teacher_name: unit.teacher_name,
          syllabus_modules: unit.syllabus_modules,
          lessons: unit.lessons,
          description: unit.description,
          live_meeting_url: unit.live_meeting_url,
          live_schedule_text: unit.live_schedule_text,
        }),
        is_published: unit.is_published ?? true,
      }).select().single()

      if (courseRow && unit.lessons?.length) {
        const lessonRows = unit.lessons.map((les, idx) => ({
          course_id: courseRow.id,
          title: les.title,
          description: les.content || '',
          youtube_url: les.video_url || '',
          order_index: idx,
        }))
        await supabase.from('lessons').insert(lessonRows)
      }
    } catch {}
  }

  async updateCourseUnit(id: string, updated: Partial<CourseUnit>): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_COURSE_UNIT_${id}`,
      ['eclat_school_course_units'],
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
    this.broadcastChange('COURSE_UNIT_UPDATED', updated)
  }

  async updateLesson(courseId: string, lessonId: string, updatedLesson: { title?: string; video_url?: string; content?: string; duration_minutes?: number; meeting_url?: string }): Promise<void> {
    await txEngine.executeAtomic(
      `UPDATE_LESSON_${lessonId}`,
      ['eclat_school_course_units'],
      () => {
        const list = this.getCourseUnits()
        let found = false
        for (const unit of list) {
          if (unit.id === courseId || !courseId || unit.lessons?.some((l) => l.id === lessonId)) {
            if (unit.lessons) {
              const lesIdx = unit.lessons.findIndex((l) => l.id === lessonId)
              if (lesIdx !== -1) {
                unit.lessons[lesIdx] = { ...unit.lessons[lesIdx], ...updatedLesson }
                found = true
                break
              }
            }
          }
        }
        if (found) {
          this.set('course_units', list)
        }
      }
    )
    schoolEventBus.publish('COURSE_UNIT_UPDATED' as any, { courseId, lessonId })
    this.broadcastChange('COURSE_UNIT_UPDATED', { courseId, lessonId })
  }

  async deleteCourseUnit(id: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_COURSE_UNIT_${id}`,
      ['eclat_school_course_units'],
      () => {
        const list = this.getCourseUnits().filter((u) => u.id !== id)
        this.set('course_units', list)
      }
    )
    this.broadcastChange('COURSE_UNIT_DELETED', { id })
  }

  // --- Formal Unit Registration by Management (With Official Receipts) ---
  getUnitRegistrations(): UnitRegistrationReceipt[] {
    const raw = this.get<UnitRegistrationReceipt[]>('unit_registrations', [])
    const students = this.getStudents()
    if (students.length === 0) return []
    const studentAdms = new Set(students.map((s) => s.admission_number.toLowerCase()))
    const studentIds = new Set(students.map((s) => s.id.toLowerCase()))

    return raw.filter(
      (r) =>
        (r.student_id && studentIds.has(r.student_id.toLowerCase())) ||
        (r.admission_number && studentAdms.has(r.admission_number.toLowerCase()))
    )
  }

  async deleteUnitRegistration(identifier: string): Promise<void> {
    await txEngine.executeAtomic(
      `DELETE_UNIT_REGISTRATION_${identifier}`,
      ['eclat_school_unit_registrations'],
      () => {
        const clean = identifier.toLowerCase()
        const raw = this.get<UnitRegistrationReceipt[]>('unit_registrations', [])
        const list = raw.filter(
          (r) => r.id.toLowerCase() !== clean && r.receipt_number.toLowerCase() !== clean
        )
        this.set('unit_registrations', list)
      }
    )
    schoolEventBus.publish('UNIT_REGISTRATION_COMPLETED' as any)
    this.broadcastChange('UNIT_REGISTRATION_DELETED', { identifier })
  }

  async clearAllUnitRegistrations(): Promise<void> {
    await txEngine.executeAtomic(
      'CLEAR_ALL_UNIT_REGISTRATIONS',
      ['eclat_school_unit_registrations'],
      () => {
        this.set('unit_registrations', [])
      }
    )
    schoolEventBus.publish('UNIT_REGISTRATION_COMPLETED' as any)
    this.broadcastChange('UNIT_REGISTRATIONS_CLEARED')
  }

  async registerStudentUnits(receipt: UnitRegistrationReceipt): Promise<void> {
    await txEngine.executeAtomic(
      `REGISTER_UNITS_${receipt.receipt_number}`,
      ['eclat_school_unit_registrations'],
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
    this.broadcastChange('UNIT_REGISTRATION_CREATED', receipt)
  }

  getRegistrationForStudent(identifier: string): UnitRegistrationReceipt | null {
    if (!identifier) return null
    const list = this.getUnitRegistrations()
    const clean = identifier.trim().toLowerCase()
    return list.find((r) => r.student_id.toLowerCase() === clean || r.admission_number.toLowerCase() === clean) || null
  }

  getRegisteredUnitsForStudent(identifier: string): CourseUnit[] {
    if (!identifier) return []
    const clean = identifier.trim().toLowerCase()
    const allUnits = this.getCourseUnits()

    // 1. Check formal unit registration slip
    const reg = this.getRegistrationForStudent(identifier)
    if (reg && reg.registered_unit_ids && reg.registered_unit_ids.length > 0) {
      return allUnits.filter(
        (u) =>
          reg.registered_unit_ids.includes(u.id) ||
          reg.registered_units?.some((ru) => ru.code?.toLowerCase() === u.code?.toLowerCase())
      )
    }

    // 2. Check student record enrolled_courses & class_name
    const students = this.getStudents()
    const student = students.find(
      (s) => s.id.toLowerCase() === clean || s.admission_number.toLowerCase() === clean
    )

    if (student) {
      if (student.enrolled_courses && student.enrolled_courses.length > 0) {
        const enrolledSet = new Set(student.enrolled_courses.map((c) => c.toLowerCase().trim()))
        const matched = allUnits.filter(
          (u) =>
            enrolledSet.has(u.id.toLowerCase()) ||
            enrolledSet.has(u.code.toLowerCase()) ||
            enrolledSet.has(u.title.toLowerCase())
        )
        if (matched.length > 0) return matched
      }

      if (student.class_name) {
        const classNameLower = student.class_name.toLowerCase().trim()
        const matched = allUnits.filter(
          (u) =>
            u.title.toLowerCase().includes(classNameLower) ||
            classNameLower.includes(u.title.toLowerCase()) ||
            (u.program && classNameLower.includes(u.program.toLowerCase()))
        )
        if (matched.length > 0) return matched
      }
    }

    return []
  }

  // --- Faculty Teachers & Course Assignments (ACID Protected) ---
  getTeachers(): FacultyTeacher[] {
    return this.get<FacultyTeacher[]>('faculty_teachers', INITIAL_FACULTY_TEACHERS)
  }

  async addTeacher(teacher: FacultyTeacher): Promise<void> {
    await txEngine.executeAtomic(
      `ADD_TEACHER_${teacher.id}`,
      ['eclat_school_faculty_teachers'],
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
      ['eclat_school_faculty_teachers'],
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
      ['eclat_school_faculty_teachers'],
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
      ['eclat_school_departments'],
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
      ['eclat_school_departments'],
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
      ['eclat_school_departments'],
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
      ['eclat_school_subjects'],
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
      ['eclat_school_subjects'],
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
      ['eclat_school_subjects'],
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
      ['eclat_school_students'],
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
      ['eclat_school_students'],
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
      ['eclat_school_biometric_passes'],
      () => {
        const list = this.getBiometricClearanceLogs()
        list.unshift(pass)
        this.set('biometric_passes', list)
      }
    )
  }

  // --- Complete Factory Reset ---
  resetToCleanSlate() {
    localStorage.removeItem('eclat_school_students')
    localStorage.removeItem('eclat_school_timetable')
    localStorage.removeItem('eclat_school_exams')
    localStorage.removeItem('eclat_school_report_cards')
    localStorage.removeItem('eclat_school_invoices')
    localStorage.removeItem('eclat_school_receipts')
    localStorage.removeItem('eclat_school_resources')
    localStorage.removeItem('eclat_school_discipline')
    localStorage.removeItem('eclat_school_notices')
    localStorage.removeItem('eclat_school_reminders')
    localStorage.removeItem('eclat_school_inquiries')
    localStorage.removeItem('eclat_school_course_units')
    localStorage.removeItem('eclat_school_unit_registrations')
    localStorage.removeItem('eclat_school_departments')
    localStorage.removeItem('eclat_school_subjects')
    localStorage.removeItem('eclat_school_biometric_passes')
  }
}

export const schoolStore = new SchoolDataStore()

