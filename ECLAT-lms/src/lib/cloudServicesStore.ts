import { supabase } from './supabase'

export interface CloudServicesConfig {
  showInPublicNavbar: boolean
  enablePublishCourse: boolean
  enableHireServices: boolean
  enableCareers: boolean
  enableDonations: boolean
  defaultTutorRevenueSplitPct: number
  defaultSchoolRevenueSplitPct: number
  publishCourseBadge: string
}

export interface TechServiceItem {
  id: string
  title: string
  category: string
  tagline: string
  badge: string
  iconKey: string
  color: string
  deliverables: string[]
  technologies: string[]
  bestFor: string
  timeline: string
  isActive?: boolean
}

export interface HireInquiryItem {
  id: string
  name: string
  company: string
  email: string
  phone: string
  serviceCategory: string
  budget: string
  timeline: string
  description: string
  submittedAt: string
  status: 'New Inquiry' | 'Quote Sent' | 'In Progress' | 'Completed' | 'Archived'
  adminNotes?: string
}

export interface JobPositionItem {
  id: string
  referenceCode: string
  title: string
  faculty: string
  department: string
  workType: '100% Remote / Online' | 'Flexible Schedule' | 'Part-Time or Full-Time'
  badge: string
  badgeColor: string
  iconKey: string
  summary: string
  responsibilities: string[]
  requirements: string[]
  compensation: string
  urgency: 'Immediate Intake' | 'Open Application' | 'Closed'
  isActive?: boolean
}

export interface CareerApplicationItem {
  id: string
  fullName: string
  email: string
  phone: string
  positionId: string
  positionTitle?: string
  country: string
  experienceYears: string
  highestQualification: string
  portfolioUrl: string
  teachingPhilosophy: string
  submittedAt: string
  status: 'Pending Review' | 'Shortlisted' | 'Interviewing' | 'Hired & Onboarded' | 'Declined'
}

export interface DonationLedgerItem {
  id?: string
  reference: string
  amount: number
  currency: 'USD' | 'KES'
  donorName: string
  donorEmail: string
  donorPhone: string
  track: string
  message: string
  timestamp: string
  allocatedStudentName?: string
  allocatedStudentAdmNo?: string
  status?: 'Verified' | 'Allocated to Student' | 'Pending'
}

export interface SponsorshipTierItem {
  amount: number
  label: string
  impact: string
}

export interface PublishedTutorCourseRecord {
  id: string
  providerType: 'individual_tutor' | 'partner_institution'
  tutorName: string
  institutionName?: string
  institutionLogo?: string
  institutionSignatory?: string
  deliveryMode: 'self_paced' | 'live_cohort'
  email: string
  phone: string
  courseTitle: string
  category: string
  courseDescription: string
  videoUrl: string
  suggestedPriceUsd: number
  payoutSplitPct: number
  payoutMethod: string
  payoutSchedule: string
  payoutDetails: string
  payoutCurrency: string
  submittedAt: string
  status: 'Approved & Live' | 'Pending Review' | 'Paused'
  downloadPath?: string
}

export interface PublisherPayoutRecord {
  id: string
  courseId?: string
  courseTitle?: string
  publisherName: string
  publisherEmail: string
  amount: number
  currency: string
  payoutMethod: string // M-Pesa, Bank Transfer, PayPal, Cash
  referenceCode: string
  disbursedAt: string
  disbursedBy: string
  notes?: string
  status: 'Completed' | 'Pending'
}

const DEFAULT_CONFIG: CloudServicesConfig = {
  showInPublicNavbar: false, // Managed inside Admin Portal by default
  enablePublishCourse: true,
  enableHireServices: true,
  enableCareers: true,
  enableDonations: true,
  defaultTutorRevenueSplitPct: 50,
  defaultSchoolRevenueSplitPct: 70,
  publishCourseBadge: '50% Share',
}

export const DEFAULT_TECH_SERVICES: TechServiceItem[] = [
  {
    id: 'fullstack-web',
    title: 'Custom Web & Enterprise Full-Stack Engineering',
    category: 'Software Engineering',
    tagline: 'High-performance, scalable web portals, SaaS platforms, and enterprise dashboards built with modern frameworks.',
    badge: 'Flagship Service',
    iconKey: 'code',
    color: '#2563eb',
    deliverables: [
      'Responsive React 19 / Next.js single-page applications & PWAs',
      'High-throughput RESTful & GraphQL backend APIs with Node.js & Python',
      'Relational PostgreSQL / Supabase architecture with Row Level Security',
      'Automated CI/CD pipelines, Docker containerization & zero-downtime deployment',
      'End-to-end unit, integration, and security test coverage',
    ],
    technologies: ['React 19', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Docker'],
    bestFor: 'Startups, SMEs, and corporate enterprises needing robust digital products.',
    timeline: '2 – 8 Weeks depending on scope',
    isActive: true,
  },
  {
    id: 'mobile-apps',
    title: 'Cross-Platform Mobile Application Development',
    category: 'Mobile Engineering',
    tagline: 'Native-feel iOS and Android mobile apps published to Google Play Store and Apple App Store.',
    badge: 'iOS & Android',
    iconKey: 'laptop',
    color: '#0891b2',
    deliverables: [
      'Capacitor & React Native mobile architectures with offline synchronization',
      'Push notifications, background jobs, and hardware biometric authentication',
      'Seamless in-app payments (M-Pesa Daraja, Stripe, PayPal, Visa/Mastercard)',
      'Store compliance, signing keys (.jks), and automated store releases',
      'Fluid 60fps animations and thumb-friendly touch interactions',
    ],
    technologies: ['Capacitor', 'Android SDK', 'iOS Swift / Xcode', 'React Native', 'SQLite', 'Firebase Cloud Messaging'],
    bestFor: 'Businesses launching customer-facing apps, booking tools, or fintech portals.',
    timeline: '3 – 6 Weeks',
    isActive: true,
  },
  {
    id: 'data-analytics',
    title: 'Data Science, Econometrics & BI Dashboards',
    category: 'Data & Analytics',
    tagline: 'Turn raw datasets into strategic growth intelligence with advanced statistical modeling and interactive dashboards.',
    badge: 'Research Grade',
    iconKey: 'database',
    color: '#059669',
    deliverables: [
      'Automated ETL data ingestion pipelines and database cleansing',
      'Predictive analytics, forecasting, and classification machine learning models',
      'Interactive business intelligence dashboards (Power BI, Metabase, Streamlit)',
      'Academic & clinical research biostatistics (SPSS, R, Stata econometric regressions)',
      'Executive KPI reporting with automated scheduled PDF digests',
    ],
    technologies: ['Python', 'Pandas & NumPy', 'R & RStudio', 'IBM SPSS', 'Stata', 'Power BI', 'Scikit-Learn', 'PostgreSQL'],
    bestFor: 'Research firms, healthcare organizations, financial analysts, and corporate leadership.',
    timeline: '1 – 4 Weeks',
    isActive: true,
  },
  {
    id: 'cloud-devops',
    title: 'Cloud Infrastructure, DevOps & Database Engineering',
    category: 'Infrastructure',
    tagline: 'Resilient cloud infrastructure with military-grade redundancy, auto-scaling, and proactive server monitoring.',
    badge: 'High Reliability',
    iconKey: 'server',
    color: '#7c3aed',
    deliverables: [
      'Cloud setup on AWS, DigitalOcean, Google Cloud & Vercel Enterprise',
      'PostgreSQL database optimization, query index tuning & replication',
      'Infrastructure as Code (IaC), GitOps workflows & GitHub Actions CI/CD',
      'Disaster recovery, automated daily encrypted backups & health monitors',
      'Domain DNS routing, SSL certificates, Cloudflare CDN & DDoS shields',
    ],
    technologies: ['AWS', 'Supabase Cloud', 'Docker', 'Linux / Ubuntu', 'Nginx', 'GitHub Actions', 'Cloudflare', 'PostgreSQL'],
    bestFor: 'Growing platforms experiencing traffic spikes or requiring enterprise uptime SLAs.',
    timeline: '1 – 3 Weeks',
    isActive: true,
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Audits & Vulnerability Assessments',
    category: 'Cyber Defense',
    tagline: 'Identify and patch security holes before malicious actors exploit them. Comprehensive defensive auditing.',
    badge: 'Security Certified',
    iconKey: 'shield',
    color: '#dc2626',
    deliverables: [
      'Web application penetration testing (OWASP Top 10 vulnerabilities)',
      'API authentication auditing, rate limiting & token leak prevention',
      'Database access control, Row Level Security (RLS) enforcement & encryption',
      'Infrastructure vulnerability scan with actionable executive remediation report',
      'Employee cybersecurity hygiene training & phishing simulation',
    ],
    technologies: ['OWASP ZAP', 'Burp Suite', 'Nmap', 'SSL/TLS Cipher Audit', 'JWT & OAuth2', 'Bcrypt / Argon2'],
    bestFor: 'Fintechs, education institutes, legal practices, and eCommerce portals.',
    timeline: '1 – 2 Weeks',
    isActive: true,
  },
  {
    id: 'uiux-design',
    title: 'UI/UX Product Design & Design Systems',
    category: 'Product Design',
    tagline: 'World-class user interfaces designed to maximize conversion rates, user retention, and accessibility.',
    badge: 'Figma Mastery',
    iconKey: 'palette',
    color: '#ea580c',
    deliverables: [
      'End-to-end user research, persona creation & customer journey maps',
      'High-fidelity interactive prototypes in Figma with component tokens',
      'Design systems with reusable components, color styles, and micro-interactions',
      'Full mobile & desktop responsive layout specifications',
      'Developer handoff with design tokens, CSS variables, and asset bundles',
    ],
    technologies: ['Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Wireframing', 'WCAG Accessibility Standards'],
    bestFor: 'New product launches, app redesigns, and high-converting marketing funnels.',
    timeline: '2 – 4 Weeks',
    isActive: true,
  },
  {
    id: 'lms-edtech',
    title: 'Custom LMS, School Portals & EdTech Systems',
    category: 'EdTech Solutions',
    tagline: 'Turnkey online learning environments with secure DRM video players, student gradebooks, and automated fee processing.',
    badge: 'EdTech Specialization',
    iconKey: 'graduation',
    color: '#4f46e5',
    deliverables: [
      'Complete Virtual Campus with student, teacher, parent, and admin portals',
      'Hardware-level video DRM, Google Drive preview embeds & screen protection',
      'Automatic fee invoice generation, receipt printing & exam clearance passes',
      'Cambridge IGCSE & national curriculum broadsheets and report card engines',
      'Live Google Meet / Zoom class integration with interactive timetable alerts',
    ],
    technologies: ['React 19', 'Electron Desktop', 'Capacitor Mobile', 'Supabase RLS', 'M-Pesa Daraja', 'PDF Generation'],
    bestFor: 'Colleges, private schools, academies, corporate training departments, and tutors.',
    timeline: '3 – 8 Weeks',
    isActive: true,
  },
  {
    id: 'corporate-training',
    title: 'Corporate Tech Upskilling & Executive Masterclasses',
    category: 'Corporate Training',
    tagline: 'Transform your organization’s workforce into digital powerhouses with customized instructor-led training.',
    badge: 'Enterprise Workforce',
    iconKey: 'rocket',
    color: '#0d9488',
    deliverables: [
      'Tailored corporate syllabi crafted to match your company’s internal toolchain',
      'Live interactive hands-on labs with real company case studies',
      'Executive training in Advanced Excel VBA, Python Automation, AI Tools & Cyber',
      'Post-training skill assessments, certification exams, and progress analytics',
      'Continuous 60-day post-training instructor mentoring and Q&A desk',
    ],
    technologies: ['Advanced Excel & Power Query', 'Python Automation', 'Power BI', 'QuickBooks Online', 'AI Prompt Engineering'],
    bestFor: 'Corporate teams, banks, NGOs, government departments, and consulting firms.',
    timeline: 'Flexible 1-week bootcamps to 3-month corporate programs',
    isActive: true,
  },
  {
    id: 'pos-accounting',
    title: 'Business Automation, POS & Full Accounting Systems',
    category: 'Enterprise Automation',
    tagline: 'End-to-end retail & wholesale Point-of-Sale (POS), automated inventory tracking, and full GAAP/IFRS accounting management systems.',
    badge: 'Enterprise Commerce',
    iconKey: 'calculator',
    color: '#059669',
    deliverables: [
      'Multi-branch cloud & offline POS cashier terminals with receipt printing & barcode scanning',
      'Automated real-time inventory management with low-stock alerts, purchase orders & supplier tracking',
      'Full accounting engine: General Ledger, Chart of Accounts, Accounts Payable & Receivable (AP/AR)',
      'Automated financial statement generation: Balance Sheet, Income Statement (P&L), and Cash Flow',
      'Automated M-Pesa Daraja, bank reconciliation, KRA eTIMS / tax compliance integration',
      'Automated recurring customer invoicing, statement dispatch & WhatsApp payment reminders',
    ],
    technologies: ['React 19', 'Electron POS', 'SQLite / PostgreSQL', 'M-Pesa Daraja API', 'eTIMS VSCU Integration', 'Thermal Printing SDK'],
    bestFor: 'Retail supermarkets, pharmacies, hardware stores, distributors, restaurants, and service enterprises.',
    timeline: '2 – 6 Weeks',
    isActive: true,
  },
  {
    id: 'data-research-analytics',
    title: 'Advanced Data Analysis, Statistical Modeling & Market Research',
    category: 'Data & Analytics',
    tagline: 'Comprehensive statistical analysis, survey research pipelines, regression modeling, and executive business intelligence.',
    badge: 'Decision Science',
    iconKey: 'database',
    color: '#2563eb',
    deliverables: [
      'Survey design, data collection workflows, and automated survey cleaning pipelines',
      'Econometric regressions, ANOVA, hypothesis testing, factor analysis & structural equation modeling (SEM)',
      'Academic, medical, and clinical biostatistics with publication-grade APA/IEEE report formatting',
      'Customer churn modeling, cohort retention analysis, and revenue predictive forecasting',
      'Custom real-time executive analytics dashboards with automated PDF digests',
    ],
    technologies: ['Python & Pandas', 'IBM SPSS Statistics', 'Stata', 'RStudio & Tidyverse', 'Power BI', 'Tableau', 'Metabase'],
    bestFor: 'Academic researchers, graduate scholars, consulting firms, market research agencies, and executive teams.',
    timeline: '1 – 3 Weeks',
    isActive: true,
  },
]

export const DEFAULT_JOB_POSITIONS: JobPositionItem[] = [
  {
    id: 'pos-igcse-stem',
    referenceCode: 'ECLAT-FAC-2026-01',
    title: 'Cambridge CAIE & Pearson Edexcel IGCSE STEM Teachers',
    faculty: 'School of British International Curriculum (IGCSE)',
    department: 'Cambridge Mathematics, Physics & Computer Science',
    workType: '100% Remote / Online',
    badge: 'Urgent Priority',
    badgeColor: '#dc2626',
    iconKey: 'british',
    summary:
      'Lead live online interactive coaching for Year 9, 10, and 11 students preparing for Cambridge CAIE (0580/0625/0478) and Pearson Edexcel (4MA1/4PH1/4CP0) examinations.',
    responsibilities: [
      'Conduct scheduled live online lectures and interactive problem-solving tutorial sessions',
      'Analyze student past-paper mock performances and generate diagnostic feedback reports',
      'Prepare students for May/June and Oct/Nov international examination series',
      'Maintain continuous communication with academic coordinators and parents via our digital portal',
    ],
    requirements: [
      'Bachelor’s or Master’s degree in Mathematics, Physics, Computer Science, or Education',
      'Minimum 2+ years verified experience teaching Cambridge CAIE or Pearson Edexcel IGCSE syllabi',
      'Reliable high-speed broadband connection and dedicated quiet teaching environment',
      'Passion for engaging online student pedagogy and patience with diverse learners',
    ],
    compensation: 'Competitive hourly & monthly faculty stipend (USD / KES) + series pass bonuses',
    urgency: 'Immediate Intake',
    isActive: true,
  },
  {
    id: 'pos-fullstack-dev',
    referenceCode: 'ECLAT-FAC-2026-02',
    title: 'Senior Full-Stack Software Engineering Instructor',
    faculty: 'School of IT and Data Science',
    department: 'Web Engineering & Cloud Architecture',
    workType: '100% Remote / Online',
    badge: 'High Demand',
    badgeColor: '#2563eb',
    iconKey: 'code',
    summary:
      'Train upcoming software engineers through hands-on code reviews, architecture walkthroughs, and practical labs in modern React 19, TypeScript, Node.js, and Supabase.',
    responsibilities: [
      'Deliver hands-on live coding sessions covering frontend, backend APIs, and cloud databases',
      'Review student GitHub pull requests and enforce industry-grade clean code best practices',
      'Guide students through capstone portfolio projects ready for tech job recruitment',
      'Host weekend technical AMA sessions and mock technical interviews',
    ],
    requirements: [
      '3+ years commercial software engineering experience with React, Node.js, and TypeScript',
      'Prior tutoring, bootcamp mentoring, or technical blogging experience is a strong plus',
      'Demonstrated empathy and ability to explain complex abstractions to beginning coders',
      'Active GitHub portfolio or commercial software deployed to production',
    ],
    compensation: 'High hourly teaching stipend + per-cohort completion bonuses',
    urgency: 'Immediate Intake',
    isActive: true,
  },
  {
    id: 'pos-data-science',
    referenceCode: 'ECLAT-FAC-2026-03',
    title: 'Data Science, Biostatistics & Econometrics Lecturer',
    faculty: 'School of IT and Data Science',
    department: 'Faculty of Data Science & Quantitative Methods',
    workType: '100% Remote / Online',
    badge: 'Academic & Research',
    badgeColor: '#059669',
    iconKey: 'database',
    summary:
      'Instruct professionals and graduate scholars in quantitative research methods, Python data analytics (Pandas), R Biostatistics, IBM SPSS survey analysis, and Stata econometric modeling.',
    responsibilities: [
      'Facilitate live statistical modeling labs with real-world survey and clinical datasets',
      'Guide thesis researchers through ANOVA, multivariate regressions, and panel data diagnostics',
      'Teach data visualization best practices with Power BI, Seaborn, and ggplot2',
      'Author practical exercise notebooks and statistical interpretation cheat sheets',
    ],
    requirements: [
      'Master’s degree or PhD in Statistics, Biostatistics, Economics, Data Science, or related quantitative field',
      'Proficiency in at least two of: Python (Pandas/Scikit-learn), R, IBM SPSS, or Stata',
      'Experience authoring or supervising academic research papers or econometric studies',
      'Excellent verbal clarity in international English for virtual multi-country classes',
    ],
    compensation: 'Premium per-session honorarium + specialized research coaching rates',
    urgency: 'Open Application',
    isActive: true,
  },
  {
    id: 'pos-languages',
    referenceCode: 'ECLAT-FAC-2026-04',
    title: 'World Languages & IELTS Examination Master Coach',
    faculty: 'School of Language',
    department: 'Department of International Linguistics',
    workType: '100% Remote / Online',
    badge: 'Global Mobility',
    badgeColor: '#f59e0b',
    iconKey: 'globe',
    summary:
      'Teach interactive communicative language classes in German (Goethe A1-B2), French (DELF), Conversational Arabic, or intensive IELTS Academic coaching targeting Band 7.5+.',
    responsibilities: [
      'Conduct immersive spoken conversation breakout rooms and phonetic accent coaching',
      'Execute IELTS mock speaking simulations and provide detailed score-band breakdowns',
      'Grade writing essays against official CEFR / IELTS marking rubric criteria',
      'Foster an inclusive, engaging virtual environment where adult learners gain spoken confidence',
    ],
    requirements: [
      'Certified CEFR language teacher (Goethe Institut, Alliance Française, British Council/IDP) or native speaker with accredited teaching credential',
      'Minimum 2+ years coaching students who passed international language examinations',
      'Warm, encouraging instructional style with creative multimedia tools',
      'Fluency in English for bilingual grammatical explanations',
    ],
    compensation: 'Competitive hourly class pay + exam milestone bonus payments',
    urgency: 'Immediate Intake',
    isActive: true,
  },
  {
    id: 'pos-design',
    referenceCode: 'ECLAT-FAC-2026-05',
    title: 'UI/UX Design & Creative Digital Media Instructor',
    faculty: 'School of IT and Data Science',
    department: 'Digital Design & Interface Systems',
    workType: '100% Remote / Online',
    badge: 'Creative Portfolio',
    badgeColor: '#8b5cf6',
    iconKey: 'palette',
    summary:
      'Mentor creative students in UI/UX architecture in Figma, brand design with Adobe Illustrator, and photo manipulation with Adobe Photoshop.',
    responsibilities: [
      'Teach live visual design workflows from wireframes to interactive Figma prototypes',
      'Lead design critique sessions where students receive structured feedback on UX projects',
      'Curate portfolio templates for students seeking freelance and full-time design roles',
    ],
    requirements: [
      'Strong portfolio showcasing UI/UX design systems and digital branding',
      'Proficiency with Figma (auto-layout, components, variables) and Adobe Creative Cloud',
      'Ability to articulate design reasoning and user experience empathy',
    ],
    compensation: 'Attractive cohort-based compensation + portfolio mentor retainers',
    urgency: 'Open Application',
    isActive: true,
  },
  {
    id: 'pos-accounting',
    referenceCode: 'ECLAT-FAC-2026-06',
    title: 'Computerized Accounting & Financial Modeling Coach',
    faculty: 'School of Business',
    department: 'Corporate Finance & Management Accounting',
    workType: '100% Remote / Online',
    badge: 'Corporate Finance',
    badgeColor: '#ec4899',
    iconKey: 'calculator',
    summary:
      'Lead practical masterclasses in QuickBooks Online, computerized bookkeeping, VAT/tax filing compliance, and Financial Modeling (FMVA® & CMA® track).',
    responsibilities: [
      'Lead hands-on software labs using QuickBooks Online and Advanced Excel FP&A',
      'Demonstrate practical bookkeeping, bank reconciliations, and payroll processing',
      'Coach professionals preparing for accounting certifications and financial analysis roles',
    ],
    requirements: [
      'CPA, ACCA, CMA, FMVA or relevant degree in Finance/Accounting',
      'Practical working experience managing corporate books and tax returns',
      'Clear, practical pedagogical method tailored for working adults and entrepreneurs',
    ],
    compensation: 'Competitive session honorarium with flexible evening and weekend batches',
    urgency: 'Open Application',
    isActive: true,
  },
]

export const DEFAULT_TIERS_USD: SponsorshipTierItem[] = [
  { amount: 25, label: '$25 USD', impact: 'Provides essential textbooks, exam revision sets, and e-learning data bundles' },
  { amount: 50, label: '$50 USD', impact: 'Funds 1 full month of immersive vocational tuition & practical software lab training' },
  { amount: 150, label: '$150 USD', impact: 'Covers complete accredited certification fee + live cohort mentorship for 1 underprivileged student' },
  { amount: 350, label: '$350 USD', impact: 'Full Term Institutional Placement: Directly sponsors 1 student into a verified physical partner college or academy' },
  { amount: 800, label: '$800 USD', impact: 'Full Year Physical Education Sponsorship: Covers boarding/tuition fees for a student at an accredited physical institution' },
]

export const DEFAULT_TIERS_KES: SponsorshipTierItem[] = [
  { amount: 3000, label: 'KES 3,000', impact: 'Provides revision packs, exam fees, and online learning connectivity' },
  { amount: 6500, label: 'KES 6,500', impact: 'Sponsors 1 full month of intensive vocational skill acquisition & digital training' },
  { amount: 18000, label: 'KES 18,000', impact: 'Full credential course sponsorship with verified certificate & project lab' },
  { amount: 45000, label: 'KES 45,000', impact: 'Direct term enrollment into a brick-and-mortar partner high school or technical college' },
  { amount: 100000, label: 'KES 100,000', impact: 'Comprehensive full-year institutional scholarship for high-potential needy youth' },
]

const CLOUD_SYNC_ROW_ID = 'aaaaaaaa-0000-4000-8000-000000000099'
const CLOUD_SYNC_TITLE = '__ECLAT_SYNC_CLOUD_SERVICES__'

class CloudServicesStore {
  private listeners = new Set<() => void>()

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn())
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('eclat-cloud-services-updated'))
    }
  }

  private readStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  private writeStorage<T>(key: string, value: T) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
    this.notify()
    this.pushToCloud().catch(() => {})
  }

  // 1. Config & Navbar Visibility
  getConfig(): CloudServicesConfig {
    const saved = this.readStorage<Partial<CloudServicesConfig>>('eclat_cloud_services_config', {})
    return { ...DEFAULT_CONFIG, ...saved }
  }

  updateConfig(patch: Partial<CloudServicesConfig>) {
    const next = { ...this.getConfig(), ...patch }
    this.writeStorage('eclat_cloud_services_config', next)
    return next
  }

  // 2. Tech Services & Client Quote Inquiries
  getTechServices(): TechServiceItem[] {
    return this.readStorage<TechServiceItem[]>('eclat_tech_services', DEFAULT_TECH_SERVICES)
  }

  saveTechService(service: TechServiceItem) {
    const list = this.getTechServices()
    const idx = list.findIndex((s) => s.id === service.id)
    const next = idx >= 0 ? list.map((s, i) => (i === idx ? service : s)) : [service, ...list]
    this.writeStorage('eclat_tech_services', next)
  }

  deleteTechService(id: string) {
    const next = this.getTechServices().filter((s) => s.id !== id)
    this.writeStorage('eclat_tech_services', next)
  }

  getHireInquiries(): HireInquiryItem[] {
    const list = this.readStorage<HireInquiryItem[]>('eclat_hire_inquiries', [])
    return list.map((item, idx) => ({
      ...item,
      id: item.id || `inq-${idx}-${item.submittedAt || Date.now()}`,
      status: item.status || 'New Inquiry',
    }))
  }

  addHireInquiry(inquiry: Omit<HireInquiryItem, 'id' | 'submittedAt' | 'status'>) {
    const list = this.getHireInquiries()
    const newItem: HireInquiryItem = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New Inquiry',
    }
    this.writeStorage('eclat_hire_inquiries', [newItem, ...list])
    return newItem
  }

  updateHireInquiryStatus(id: string, status: HireInquiryItem['status'], adminNotes?: string) {
    const next = this.getHireInquiries().map((item) =>
      item.id === id ? { ...item, status, ...(adminNotes !== undefined ? { adminNotes } : {}) } : item
    )
    this.writeStorage('eclat_hire_inquiries', next)
  }

  deleteHireInquiry(id: string) {
    const next = this.getHireInquiries().filter((item) => item.id !== id)
    this.writeStorage('eclat_hire_inquiries', next)
  }

  // 3. Careers & Faculty Recruitment
  getJobPositions(): JobPositionItem[] {
    return this.readStorage<JobPositionItem[]>('eclat_job_positions', DEFAULT_JOB_POSITIONS)
  }

  saveJobPosition(position: JobPositionItem) {
    const list = this.getJobPositions()
    const idx = list.findIndex((p) => p.id === position.id)
    const next = idx >= 0 ? list.map((p, i) => (i === idx ? position : p)) : [position, ...list]
    this.writeStorage('eclat_job_positions', next)
  }

  deleteJobPosition(id: string) {
    const next = this.getJobPositions().filter((p) => p.id !== id)
    this.writeStorage('eclat_job_positions', next)
  }

  getCareerApplications(): CareerApplicationItem[] {
    return this.readStorage<CareerApplicationItem[]>('eclat_career_applications', [])
  }

  addCareerApplication(app: Omit<CareerApplicationItem, 'id' | 'submittedAt' | 'status'>) {
    const list = this.getCareerApplications()
    const newItem: CareerApplicationItem = {
      ...app,
      id: `app-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'Pending Review',
    }
    this.writeStorage('eclat_career_applications', [newItem, ...list])
    return newItem
  }

  updateCareerApplicationStatus(id: string, status: CareerApplicationItem['status']) {
    const next = this.getCareerApplications().map((a) => (a.id === id ? { ...a, status } : a))
    this.writeStorage('eclat_career_applications', next)
  }

  deleteCareerApplication(id: string) {
    const next = this.getCareerApplications().filter((a) => a.id !== id)
    this.writeStorage('eclat_career_applications', next)
  }

  // 4. Tutor & Partner School Published Courses
  getPublishedTutorCourses(): PublishedTutorCourseRecord[] {
    return this.readStorage<PublishedTutorCourseRecord[]>('eclat_published_tutor_courses', [])
  }

  savePublishedTutorCourse(course: PublishedTutorCourseRecord) {
    const list = this.getPublishedTutorCourses()
    const idx = list.findIndex((c) => c.id === course.id)
    const next = idx >= 0 ? list.map((c, i) => (i === idx ? course : c)) : [course, ...list]
    this.writeStorage('eclat_published_tutor_courses', next)
  }

  deletePublishedTutorCourse(id: string) {
    const next = this.getPublishedTutorCourses().filter((c) => c.id !== id)
    this.writeStorage('eclat_published_tutor_courses', next)
  }

  updatePublishedTutorCourseRevenueSplit(id: string, splitPct: number) {
    const list = this.getPublishedTutorCourses()
    const next = list.map((c) => (c.id === id ? { ...c, payoutSplitPct: Math.max(1, Math.min(100, splitPct)) } : c))
    this.writeStorage('eclat_published_tutor_courses', next)
  }

  updatePublishedTutorCourseStatus(id: string, status: 'Approved & Live' | 'Pending Review' | 'Paused') {
    const list = this.getPublishedTutorCourses()
    const next = list.map((c) => (c.id === id ? { ...c, status } : c))
    this.writeStorage('eclat_published_tutor_courses', next)
  }

  updatePublishedTutorCoursePrice(idOrQuery: string, priceUsd: number) {
    const list = this.getPublishedTutorCourses()
    const safePrice = Math.max(0, Math.round(priceUsd))
    const q = (idOrQuery || '').toLowerCase().trim()
    if (!q) return
    let updated = false
    const next = list.map((c) => {
      const titleLower = (c.courseTitle || '').toLowerCase()
      const match =
        c.id.toLowerCase() === q ||
        titleLower === q ||
        (q.length >= 4 && titleLower.includes(q)) ||
        (titleLower.length >= 4 && q.includes(titleLower))
      if (match) {
        updated = true
        return { ...c, suggestedPriceUsd: safePrice }
      }
      return c
    })
    if (updated) {
      this.writeStorage('eclat_published_tutor_courses', next)
    }
  }

  // Publisher Payout Disbursements
  getPayoutRecords(): PublisherPayoutRecord[] {
    return this.readStorage<PublisherPayoutRecord[]>('eclat_publisher_payouts_ledger', [])
  }

  recordPublisherPayout(payout: PublisherPayoutRecord) {
    const list = this.getPayoutRecords()
    const record: PublisherPayoutRecord = {
      ...payout,
      id: payout.id || `pout-${Date.now()}`,
      disbursedAt: payout.disbursedAt || new Date().toISOString(),
      status: payout.status || 'Completed',
    }
    const next = [record, ...list]
    this.writeStorage('eclat_publisher_payouts_ledger', next)
  }

  deletePublisherPayout(id: string) {
    const next = this.getPayoutRecords().filter((p) => p.id !== id)
    this.writeStorage('eclat_publisher_payouts_ledger', next)
  }

  // 5. Donations & Student Sponsorship Ledger
  getDonationsLedger(): DonationLedgerItem[] {
    const list = this.readStorage<DonationLedgerItem[]>('eclat_donations_ledger', [])
    return list.map((d, idx) => ({
      ...d,
      id: d.id || d.reference || `don-${idx}`,
      status: d.status || (d.allocatedStudentName ? 'Allocated to Student' : 'Verified'),
    }))
  }

  addDonationRecord(record: DonationLedgerItem) {
    const list = this.getDonationsLedger()
    const next = [{ ...record, id: record.id || record.reference || `don-${Date.now()}` }, ...list]
    this.writeStorage('eclat_donations_ledger', next)
  }

  allocateDonationToStudent(referenceOrId: string, studentName: string, studentAdmNo: string) {
    const next = this.getDonationsLedger().map((d) =>
      d.id === referenceOrId || d.reference === referenceOrId
        ? {
            ...d,
            allocatedStudentName: studentName,
            allocatedStudentAdmNo: studentAdmNo,
            status: 'Allocated to Student' as const,
          }
        : d
    )
    this.writeStorage('eclat_donations_ledger', next)
  }

  deleteDonationRecord(referenceOrId: string) {
    const next = this.getDonationsLedger().filter(
      (d) => d.id !== referenceOrId && d.reference !== referenceOrId
    )
    this.writeStorage('eclat_donations_ledger', next)
  }

  getSponsorshipTiers(currency: 'USD' | 'KES'): SponsorshipTierItem[] {
    const key = currency === 'USD' ? 'eclat_sponsorship_tiers_usd' : 'eclat_sponsorship_tiers_kes'
    const fallback = currency === 'USD' ? DEFAULT_TIERS_USD : DEFAULT_TIERS_KES
    return this.readStorage<SponsorshipTierItem[]>(key, fallback)
  }

  saveSponsorshipTiers(currency: 'USD' | 'KES', tiers: SponsorshipTierItem[]) {
    const key = currency === 'USD' ? 'eclat_sponsorship_tiers_usd' : 'eclat_sponsorship_tiers_kes'
    this.writeStorage(key, tiers)
  }

  // Cloud Sync
  async syncFromCloud() {
    try {
      const { data } = await supabase
        .from('courses')
        .select('description')
        .eq('title', CLOUD_SYNC_TITLE)
        .maybeSingle()

      if (data?.description) {
        const parsed = JSON.parse(data.description)
        if (typeof window !== 'undefined') {
          if (parsed.config) localStorage.setItem('eclat_cloud_services_config', JSON.stringify(parsed.config))
          if (parsed.techServices) localStorage.setItem('eclat_tech_services', JSON.stringify(parsed.techServices))
          if (parsed.hireInquiries) localStorage.setItem('eclat_hire_inquiries', JSON.stringify(parsed.hireInquiries))
          if (parsed.jobPositions) localStorage.setItem('eclat_job_positions', JSON.stringify(parsed.jobPositions))
          if (parsed.careerApplications) localStorage.setItem('eclat_career_applications', JSON.stringify(parsed.careerApplications))
          if (parsed.tutorCourses) localStorage.setItem('eclat_published_tutor_courses', JSON.stringify(parsed.tutorCourses))
          if (parsed.donationsLedger) localStorage.setItem('eclat_donations_ledger', JSON.stringify(parsed.donationsLedger))
          if (parsed.tiersUsd) localStorage.setItem('eclat_sponsorship_tiers_usd', JSON.stringify(parsed.tiersUsd))
          if (parsed.tiersKes) localStorage.setItem('eclat_sponsorship_tiers_kes', JSON.stringify(parsed.tiersKes))
          if (parsed.payouts) localStorage.setItem('eclat_publisher_payouts_ledger', JSON.stringify(parsed.payouts))
        }
        this.notify()
      }
    } catch {}
  }

  async pushToCloud() {
    try {
      const payload = {
        config: this.getConfig(),
        techServices: this.getTechServices(),
        hireInquiries: this.getHireInquiries(),
        jobPositions: this.getJobPositions(),
        careerApplications: this.getCareerApplications(),
        tutorCourses: this.getPublishedTutorCourses(),
        payouts: this.getPayoutRecords(),
        donationsLedger: this.getDonationsLedger(),
        tiersUsd: this.getSponsorshipTiers('USD'),
        tiersKes: this.getSponsorshipTiers('KES'),
        updatedAt: new Date().toISOString(),
      }
      await supabase.from('courses').upsert({
        id: CLOUD_SYNC_ROW_ID,
        title: CLOUD_SYNC_TITLE,
        description: JSON.stringify(payload),
        is_published: false,
      })
    } catch {}
  }
}

export const cloudServicesStore = new CloudServicesStore()
