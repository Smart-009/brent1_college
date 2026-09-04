// ============================================================
// Éclat Institute — Official Institutional Courses & Fee Registry
// Single authoritative source of truth across Landing, Catalog, 
// E-Reader, Fees Management, and SIMS Invoicing.
// ============================================================

export interface CourseProgram {
  id: string
  title: string
  shortTitle: string
  category: 'Tech & Programming' | 'Data Science & Research' | 'Computer & Digital Skills' | 'Business Tech & Accounting' | 'Languages & Communication' | 'Creative Arts & Design' | string
  tag: string
  tagColor: string
  duration: string
  durationWeeks: number
  schedule: string
  feeUsd: number
  feeKes: number
  feeDisplay: string
  originalFeeUsd: number
  discountBadge: string
  installmentText: string
  instructor: string
  departmentId: string
  departmentName: string
  careerOutcome: string
  skills: string[]
  icon: string
  bestseller?: boolean
  popular?: boolean
  rating: number
  ratingCount: number
  studentsEnrolled: number
  syllabus: {
    week: string
    topic: string
    practicalLab: string
  }[]
}

export const OFFICIAL_COURSES: CourseProgram[] = [
  // 1. Full-Stack Web Development
  {
    id: 'c-coding',
    title: 'Full-Stack Web Development & Modern JavaScript (React 19 & Node.js)',
    shortTitle: 'Full-Stack Web Dev (React 19)',
    category: 'Tech & Programming',
    tag: '💻 High-Salary Tech Career',
    tagColor: '#6366f1',
    duration: '12 Weeks (3 Months)',
    durationWeeks: 12,
    schedule: 'Live Online Evening Classes (7:30 PM - 9:30 PM EAT) / Self-Paced',
    feeUsd: 120,
    feeKes: 15500,
    feeDisplay: '$120 / KES 15,500',
    originalFeeUsd: 240,
    discountBadge: '50% OFF',
    installmentText: '2 installments of $60 (KES 7,750)',
    instructor: 'Eng. Alex Mwangi • Senior Software Architect',
    departmentId: 'dept-swe',
    departmentName: 'School of Software Engineering & Web Development',
    careerOutcome: 'Junior Full-Stack Developer • Frontend React Engineer • Cloud Tech Contractor',
    skills: ['React 19 & JavaScript ES6+', 'Node.js & Express APIs', 'PostgreSQL & Supabase Cloud', 'Tailwind CSS & Git GitHub', 'Full-Stack Portfolio Project'],
    icon: '💻',
    bestseller: true,
    popular: true,
    rating: 4.95,
    ratingCount: 1420,
    studentsEnrolled: 3850,
    syllabus: [
      { week: 'Week 1-3', topic: 'HTML5 Semantic Layouts, Modern Tailwind CSS & JavaScript ES6+', practicalLab: 'Live coding responsive web landing pages and portfolio projects.' },
      { week: 'Week 4-6', topic: 'React 19 State, Hooks, Component Architectures & APIs', practicalLab: 'Building dynamic interactive dashboards with real-time API integrations.' },
      { week: 'Week 7-9', topic: 'Node.js Backend, Express REST APIs & Authentication', practicalLab: 'Developing secure authentication systems and CRUD endpoints.' },
      { week: 'Week 10-12', topic: 'PostgreSQL Relational DBs & Cloud Server Deployment', practicalLab: 'Deploying full-stack production applications to Vercel and cloud containers.' },
    ],
  },

  // 2. Python Programming & Data Analytics
  {
    id: 'c-python',
    title: 'Python Programming, SQL & Data Analytics Masterclass',
    shortTitle: 'Python & Data Analytics',
    category: 'Data Science & Research',
    tag: '🐍 Data & AI Fundamentals',
    tagColor: '#0284c7',
    duration: '8 Weeks (2 Months)',
    durationWeeks: 8,
    schedule: 'Live Virtual Cohorts (Mon & Wed 8:00 PM EAT) / Saturday Intensive',
    feeUsd: 95,
    feeKes: 12500,
    feeDisplay: '$95 / KES 12,500',
    originalFeeUsd: 190,
    discountBadge: '50% OFF',
    installmentText: '2 installments of $48 (KES 6,250)',
    instructor: 'Dr. Brian Ochieng • Lead Data Scientist',
    departmentId: 'dept-data',
    departmentName: 'Department of Python Programming & Data Analytics',
    careerOutcome: 'Data Analyst • Business Intelligence Specialist • Junior Python Developer',
    skills: ['Python Syntax & OOP', 'Pandas & NumPy Data Wrangling', 'SQL Queries & Relational DBs', 'Matplotlib & Seaborn Visualizations', 'Power BI Dashboards'],
    icon: '🐍',
    bestseller: true,
    popular: true,
    rating: 4.88,
    ratingCount: 980,
    studentsEnrolled: 2420,
    syllabus: [
      { week: 'Week 1-2', topic: 'Python Programming Fundamentals & Data Structures', practicalLab: 'Writing Python scripts, automation loops, and algorithmic problem solving.' },
      { week: 'Week 3-4', topic: 'SQL Relational Queries & Database Aggregations', practicalLab: 'Querying complex multi-table datasets, filtering, and JOIN operations.' },
      { week: 'Week 5-6', topic: 'Data Wrangling & Statistical Analysis with Pandas', practicalLab: 'Cleaning messy real-world corporate data and handling missing metrics.' },
      { week: 'Week 7-8', topic: 'Interactive Visualizations & Business Intelligence', practicalLab: 'Publishing interactive analytics dashboards and executive reports.' },
    ],
  },

  // 3. Cybersecurity & Defensive Ops
  {
    id: 'c-cyber',
    title: 'Cybersecurity Fundamentals, Ethical Hacking & Defensive Ops',
    shortTitle: 'Cybersecurity & Ethical Hacking',
    category: 'Tech & Programming',
    tag: '🛡️ Security & Defense',
    tagColor: '#dc2626',
    duration: '6 Weeks',
    durationWeeks: 6,
    schedule: 'Live Virtual Weekend Masterclass (Sat & Sun 3:00 PM - 6:00 PM EAT)',
    feeUsd: 89,
    feeKes: 11500,
    feeDisplay: '$89 / KES 11,500',
    originalFeeUsd: 175,
    discountBadge: '49% OFF',
    installmentText: '2 installments of $45 (KES 5,750)',
    instructor: 'Mr. David Kiprono, CISSP • Cybersecurity Consultant',
    departmentId: 'dept-cyber',
    departmentName: 'Department of Cybersecurity & Network Defense',
    careerOutcome: 'Junior SOC Analyst • IT Security Auditor • Network Security Admin',
    skills: ['Network Security & OSI Model', 'Vulnerability Assessment & Wireshark', 'Ethical Hacking Fundamentals', 'Firewalls & Encryption Standards', 'Incident Response Audits'],
    icon: '🛡️',
    bestseller: false,
    popular: true,
    rating: 4.90,
    ratingCount: 640,
    studentsEnrolled: 1650,
    syllabus: [
      { week: 'Week 1-2', topic: 'Networking Protocols, TCP/IP, OSI & Firewall Architecture', practicalLab: 'Packet sniffing with Wireshark and analyzing network traffic security.' },
      { week: 'Week 3-4', topic: 'Common Cyber Attack Vectors, Malware & Social Engineering', practicalLab: 'Identifying phishing payloads, vulnerability scanning, and risk reports.' },
      { week: 'Week 5-6', topic: 'Defensive Hardening, Cryptography & Incident Response', practicalLab: 'Configuring secure server policies, SSL/TLS, and security audit checklists.' },
    ],
  },

  // 4. Data Analysis with SPSS, STATA & R Studio
  {
    id: 'c-spss-r',
    title: 'Data Analysis with SPSS, STATA & R Studio Masterclass',
    shortTitle: 'SPSS, STATA & R Studio',
    category: 'Data Science & Research',
    tag: '📊 Academic & M&E Research',
    tagColor: '#10b981',
    duration: '6 Weeks',
    durationWeeks: 6,
    schedule: 'Tue & Thu (7:00 PM - 9:00 PM EAT) Live Interactive Webinars',
    feeUsd: 85,
    feeKes: 11000,
    feeDisplay: '$85 / KES 11,000',
    originalFeeUsd: 170,
    discountBadge: '50% OFF',
    installmentText: '2 installments of $45 (KES 5,500)',
    instructor: 'Dr. Brian Ochieng • Quantitative Research Fellow',
    departmentId: 'dept-data',
    departmentName: 'Department of Python Programming & Data Analytics',
    careerOutcome: 'Monitoring & Evaluation (M&E) Specialist • Academic Researcher • Biostatistician',
    skills: ['SPSS Regression & Coding', 'STATA Econometric Panel Data', 'R Studio & ggplot2', 'Hypothesis Testing (ANOVA, Chi-Sq)', 'APA Table Formatting'],
    icon: '📊',
    bestseller: true,
    popular: true,
    rating: 4.85,
    ratingCount: 720,
    studentsEnrolled: 1890,
    syllabus: [
      { week: 'Week 1-2', topic: 'Descriptive Statistics & SPSS Survey Coding', practicalLab: 'Clean and code multi-indicator survey questionnaires.' },
      { week: 'Week 3-4', topic: 'Hypothesis Testing (ANOVA, Chi-Square, T-Tests)', practicalLab: 'Conduct cross-tabulation and factor analysis on demographics.' },
      { week: 'Week 5', topic: 'STATA Econometric & Panel Regression Modeling', practicalLab: 'Run fixed and random effects on economic metrics.' },
      { week: 'Week 6', topic: 'R Studio Data Visualization with ggplot2', practicalLab: 'Generate publication-ready APA thesis tables and charts.' },
    ],
  },

  // 5. Comprehensive Computer Packages & Digital Skills
  {
    id: 'c-comp',
    title: 'Comprehensive Computer Packages & Modern Digital Skills',
    shortTitle: 'Computer Packages & Digital Skills',
    category: 'Computer & Digital Skills',
    tag: '⚡ Foundational Tech Skills',
    tagColor: '#f59e0b',
    duration: '4-6 Weeks',
    durationWeeks: 4,
    schedule: 'Daily Cohorts (Mon-Fri 6:00 PM - 7:30 PM EAT) / Flexible Timing',
    feeUsd: 45,
    feeKes: 6000,
    feeDisplay: '$45 / KES 6,000',
    originalFeeUsd: 90,
    discountBadge: '50% OFF',
    installmentText: 'Single payment of $45 (KES 6,000)',
    instructor: 'Mr. James Mutua • Certified Microsoft Specialist',
    departmentId: 'dept-comp',
    departmentName: 'Department of Computer Applications & Digital Skills',
    careerOutcome: 'Executive Virtual Assistant • Data Entry Clerk • Office Administrative Secretary',
    skills: ['Microsoft Word & Docs Formatting', 'Advanced Excel Formulas & Charts', 'PowerPoint Slide Presentations', 'Google Workspace & Cloud Storage', 'Touch Typing & Email Etiquette'],
    icon: '🖥️',
    bestseller: true,
    popular: true,
    rating: 4.92,
    ratingCount: 1840,
    studentsEnrolled: 5120,
    syllabus: [
      { week: 'Week 1', topic: 'Computer Fundamentals, Operating Systems & Fast Typing', practicalLab: 'Mastering keyboard shortcuts, file hierarchies, and 45+ WPM typing.' },
      { week: 'Week 2', topic: 'Microsoft Word & Professional Document Typography', practicalLab: 'Formatting institutional executive memos, reports, and resumes.' },
      { week: 'Week 3', topic: 'Advanced Microsoft Excel (VLOOKUP, IF, Pivot Tables)', practicalLab: 'Building automated sales trackers, payroll sheets, and visual charts.' },
      { week: 'Week 4', topic: 'Google Workspace, Cloud Backups & Email Productivity', practicalLab: 'Managing corporate calendars, Google Sheets collaboration, and cloud drives.' },
    ],
  },

  // 6. Computerized Accounting (QuickBooks & International Tax)
  {
    id: 'c-accounting',
    title: 'Computerized Accounting (QuickBooks & International Tax / iTax)',
    shortTitle: 'Computerized Accounting (QuickBooks)',
    category: 'Business Tech & Accounting',
    tag: '📈 Finance & Bookkeeping',
    tagColor: '#059669',
    duration: '4 Weeks',
    durationWeeks: 4,
    schedule: 'Evening Classes (Tue, Thu & Sat 7:00 PM - 9:00 PM EAT)',
    feeUsd: 65,
    feeKes: 8500,
    feeDisplay: '$65 / KES 8,500',
    originalFeeUsd: 130,
    discountBadge: '50% OFF',
    installmentText: 'Single payment of $65 (KES 8,500)',
    instructor: 'Mrs. Grace Wanjiku, CPA-K • Financial Systems Director',
    departmentId: 'dept-biztech',
    departmentName: 'Department of Business Tech & Computerized Accounting',
    careerOutcome: 'Assistant Accountant • QuickBooks Bookkeeper • Tax Compliance Assistant',
    skills: ['QuickBooks Online & Desktop Setup', 'Chart of Accounts & Ledgers', 'Bank Reconciliations & Invoicing', 'VAT, PAYE & Corporate Tax Filing', 'Profit & Loss Financial Reporting'],
    icon: '📊',
    bestseller: false,
    popular: true,
    rating: 4.86,
    ratingCount: 430,
    studentsEnrolled: 1180,
    syllabus: [
      { week: 'Week 1', topic: 'Introduction to Digital Bookkeeping & Chart of Accounts', practicalLab: 'Setting up new corporate entities in QuickBooks Online.' },
      { week: 'Week 2', topic: 'Customer Invoicing, Accounts Receivable & Vendor Ledgers', practicalLab: 'Issuing invoices, processing credit notes, and recording payments.' },
      { week: 'Week 3', topic: 'Bank Reconciliations & Petty Cash Management', practicalLab: 'Reconciling live bank feeds and matching transactional entries.' },
      { week: 'Week 4', topic: 'Tax Compliance (VAT, PAYE) & Financial Statement Generation', practicalLab: 'Filing tax returns and generating Balance Sheet & P&L statements.' },
    ],
  },

  // 7. IELTS Academic & General Prep
  {
    id: 'c-ielts',
    title: 'IELTS Academic & General Exam Prep (Target Band 7.5 - 9.0)',
    shortTitle: 'IELTS Exam Prep (Band 7.5 - 9.0)',
    category: 'Languages & Communication',
    tag: '🌍 Global Study & Relocation',
    tagColor: '#7c3aed',
    duration: '4-6 Weeks',
    durationWeeks: 4,
    schedule: 'Live Evening Cohorts (Mon-Thu 8:00 PM - 9:30 PM EAT)',
    feeUsd: 85,
    feeKes: 11000,
    feeDisplay: '$85 / KES 11,000',
    originalFeeUsd: 170,
    discountBadge: '50% OFF',
    installmentText: '2 installments of $45 (KES 5,500)',
    instructor: 'Dr. Sarah Jenkins • British Council Certified IELTS Trainer',
    departmentId: 'dept-ielts',
    departmentName: 'Department of IELTS & International Test Prep',
    careerOutcome: 'UK/Canada/US University Admissions • Express Entry Work Permits • Global Nursing Licensure',
    skills: ['Listening Section Speed Strategy', 'Academic Reading Skimming & Scanning', 'Task 1 & Task 2 Essay Templates', 'Speaking Fluency & Accent Reduction', 'Full Mock Exam Simulation'],
    icon: '🌍',
    bestseller: true,
    popular: true,
    rating: 4.96,
    ratingCount: 1120,
    studentsEnrolled: 3100,
    syllabus: [
      { week: 'Week 1', topic: 'IELTS Exam Structure & Listening Section Mastery', practicalLab: 'Listening audio speed drills and error elimination tactics.' },
      { week: 'Week 2', topic: 'Academic & General Reading Tactics (Skimming & Scanning)', practicalLab: 'Solving True/False/Not Given and paragraph heading questions.' },
      { week: 'Week 3', topic: 'Writing Task 1 & Task 2 Structured Essay Blueprints', practicalLab: 'Live essay writing, vocabulary enhancement, and structural grading.' },
      { week: 'Week 4', topic: '1-on-1 Speaking Interviews & Full Computer-Delivered Mock', practicalLab: 'Real-time mock interview evaluation and comprehensive score feedback.' },
    ],
  },

  // 8. English Language Fluency & Corporate Speaking
  {
    id: 'c-english',
    title: 'English Language Fluency & Corporate Public Speaking',
    shortTitle: 'English Fluency & Speaking',
    category: 'Languages & Communication',
    tag: '🗣️ Confidence & Leadership',
    tagColor: '#0891b2',
    duration: '6-8 Weeks',
    durationWeeks: 6,
    schedule: 'Live Weekend & Evening Sessions (Tue & Fri 6:30 PM - 8:00 PM EAT)',
    feeUsd: 55,
    feeKes: 7000,
    feeDisplay: '$55 / KES 7,000',
    originalFeeUsd: 110,
    discountBadge: '50% OFF',
    installmentText: 'Single payment of $55 (KES 7,000)',
    instructor: 'Mme. Claire Dubois • Head of Modern Languages',
    departmentId: 'dept-lang',
    departmentName: 'Department of English & Modern Languages',
    careerOutcome: 'Corporate Spokesperson • Customer Relations Officer • International Presenter',
    skills: ['Accent Neutralization & Pronunciation', 'Business Vocabulary & Email Writing', 'Overcoming Stage Fright & Pauses', 'Impromptu Speech Construction', 'Executive Meeting Leadership'],
    icon: '🗣️',
    bestseller: false,
    popular: true,
    rating: 4.87,
    ratingCount: 540,
    studentsEnrolled: 1450,
    syllabus: [
      { week: 'Week 1-2', topic: 'Phonetics, Vowel Articulation & Neutral Pronunciation', practicalLab: 'Live audio recording critique and speech pitch exercises.' },
      { week: 'Week 3-4', topic: 'Professional Grammar, Vocabulary & Business Communication', practicalLab: 'Crafting persuasive corporate proposals and executive emails.' },
      { week: 'Week 5-6', topic: 'Public Speaking, Presentations & Debate Mastery', practicalLab: 'Delivering live 5-minute virtual TED-style talks with feedback.' },
    ],
  },

  // 9. Foreign Languages (Arabic, French & German)
  {
    id: 'c-foreign-lang',
    title: 'Foreign Languages Certification (Arabic, French & German)',
    shortTitle: 'Arabic, French & German',
    category: 'Languages & Communication',
    tag: '🌴 Multilingual Career',
    tagColor: '#d97706',
    duration: '8 Weeks',
    durationWeeks: 8,
    schedule: 'Live Virtual Cohorts (Mon, Wed & Sat 7:00 PM - 8:30 PM EAT)',
    feeUsd: 79,
    feeKes: 10000,
    feeDisplay: '$79 / KES 10,000',
    originalFeeUsd: 160,
    discountBadge: '50% OFF',
    installmentText: '2 installments of $40 (KES 5,000)',
    instructor: 'Mme. Claire Dubois & Faculty Linguists',
    departmentId: 'dept-lang',
    departmentName: 'Department of English & Modern Languages',
    careerOutcome: 'Diplomatic Aide • International Flight Attendant • Multilingual Customer Consultant',
    skills: ['A1-A2 Common European Framework (CEFR)', 'Everyday Conversational Dialogues', 'Grammar Conjugation & Sentence Form', 'Listening Comprehension', 'Cultural Context & Idioms'],
    icon: '🌴',
    bestseller: false,
    popular: true,
    rating: 4.89,
    ratingCount: 380,
    studentsEnrolled: 980,
    syllabus: [
      { week: 'Week 1-2', topic: 'Alphabet, Phonology, Greetings & Self Introductions', practicalLab: 'Interactive roleplay conversations and audio drills.' },
      { week: 'Week 3-4', topic: 'Essential Everyday Vocabulary (Numbers, Time, Shopping, Directions)', practicalLab: 'Simulating real-life conversational scenarios.' },
      { week: 'Week 5-6', topic: 'Present & Past Tense Verb Conjugation & Sentence Rules', practicalLab: 'Writing short letters and structured conversational dialogues.' },
      { week: 'Week 7-8', topic: 'A1 Certification Readiness & Fluent Speaking Assessment', practicalLab: 'Live 1-on-1 language fluency evaluation with instructor.' },
    ],
  },
]

export function calculateDynamicFeeFields(feeUsd: number, originalBaseUsd?: number) {
  const safeUsd = Math.max(1, Number(feeUsd) || 60)
  const feeKes = Math.round(safeUsd * 130)
  const feeDisplay = `$${safeUsd} / KES ${feeKes.toLocaleString()}`
  const originalFeeUsd = originalBaseUsd && originalBaseUsd > safeUsd ? originalBaseUsd : Math.round(safeUsd * 2)
  const discountBadge = '50% OFF'
  const installmentText = safeUsd <= 55
    ? `Single payment of $${safeUsd} (KES ${feeKes.toLocaleString()})`
    : `2 installments of $${Math.ceil(safeUsd / 2)} (KES ${Math.ceil(feeKes / 2).toLocaleString()})`
  return { feeUsd: safeUsd, feeKes, feeDisplay, originalFeeUsd, discountBadge, installmentText }
}

export function getDynamicCoursesList(
  storeSubjects: Array<{ id: string; code: string; name: string; fee?: number; duration?: string; description?: string; category?: string; icon?: string; badge?: string; careers?: string[]; color_hex?: string; department_id?: string; department_name?: string }> = [],
  storeUnits: Array<{ id: string; code: string; title: string; fee?: number; course_duration?: string; description?: string; department?: string; program?: string; teacher_name?: string; live_schedule_text?: string; syllabus_modules?: any[] }> = [],
  customFees?: Record<string, number>
): CourseProgram[] {
  const activeCustomFees = customFees || (typeof window !== 'undefined' ? (() => {
    try {
      const stored = localStorage.getItem('eclat_school_custom_course_fees')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })() : {})

  const programs: CourseProgram[] = []
  const usedSubjectIds = new Set<string>()
  const usedUnitIds = new Set<string>()

  for (const base of OFFICIAL_COURSES) {
    const matchedSub = storeSubjects.find((s) => {
      if (s.id === base.id || s.id === `sub-${base.id.replace(/^c-/, '')}`) return true
      if (s.code && (s.code.toLowerCase() === base.id.toLowerCase() || s.code.toLowerCase() === base.shortTitle.toLowerCase())) return true
      const baseClean = base.shortTitle.toLowerCase().replace(/[^a-z0-9]/g, '')
      const subClean = s.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      return baseClean.includes(subClean) || subClean.includes(baseClean)
    })
    if (matchedSub) usedSubjectIds.add(matchedSub.id)

    const matchedUnit = storeUnits.find((u) => {
      if (u.id === base.id) return true
      if (u.code && (u.code.toLowerCase() === base.id.toLowerCase() || u.code.toLowerCase() === base.shortTitle.toLowerCase())) return true
      const baseClean = base.shortTitle.toLowerCase().replace(/[^a-z0-9]/g, '')
      const unitClean = u.title.toLowerCase().replace(/[^a-z0-9]/g, '')
      return baseClean.includes(unitClean) || unitClean.includes(baseClean)
    })
    if (matchedUnit) usedUnitIds.add(matchedUnit.id)

    const customOverrideFee = activeCustomFees?.[base.id] ?? (matchedSub?.id ? activeCustomFees?.[matchedSub.id] : undefined) ?? (matchedUnit?.id ? activeCustomFees?.[matchedUnit.id] : undefined)

    const liveFeeUsd = (typeof customOverrideFee === 'number' && customOverrideFee >= 0)
      ? customOverrideFee
      : (typeof matchedSub?.fee === 'number' && matchedSub.fee > 0)
      ? matchedSub.fee
      : (typeof matchedUnit?.fee === 'number' && matchedUnit.fee > 0)
      ? matchedUnit.fee
      : base.feeUsd

    const feeCalculations = calculateDynamicFeeFields(liveFeeUsd, base.originalFeeUsd)

    programs.push({
      ...base,
      ...feeCalculations,
      title: matchedSub?.name || matchedUnit?.title || base.title,
      duration: matchedSub?.duration || matchedUnit?.course_duration || base.duration,
      careerOutcome: matchedSub?.description || base.careerOutcome,
      skills: matchedSub?.careers && matchedSub.careers.length > 0 ? matchedSub.careers : base.skills,
    })
  }

  // Also append custom subjects created by admin
  for (const sub of storeSubjects) {
    if (usedSubjectIds.has(sub.id)) continue
    const customOverrideFee = activeCustomFees?.[sub.id]
    const feeUsd = (typeof customOverrideFee === 'number' && customOverrideFee >= 0)
      ? customOverrideFee
      : typeof sub.fee === 'number' && sub.fee > 0 ? sub.fee : 60
    const feeCalculations = calculateDynamicFeeFields(feeUsd)
    programs.push({
      id: sub.id,
      title: sub.name,
      shortTitle: sub.name,
      category: (sub.category as any) || 'Tech & Programming',
      tag: `🏛️ ${sub.department_name || 'Academic Program'}`,
      tagColor: sub.color_hex || '#0f172a',
      duration: sub.duration || '3 Months Certificate',
      durationWeeks: 12,
      schedule: 'Live Online Evening Classes / Self-Paced',
      ...feeCalculations,
      instructor: 'Éclat Institute Certified Faculty',
      departmentId: sub.department_id || 'dept-general',
      departmentName: sub.department_name || 'Academic Faculty',
      careerOutcome: sub.description || `${sub.name} Certified Specialist`,
      skills: sub.careers || ['Live Virtual Classes', 'Verified E-Certificate'],
      icon: sub.icon || '💻',
      popular: true,
      rating: 4.9,
      ratingCount: 120,
      studentsEnrolled: 450,
      syllabus: [
        { week: 'Module 1-2', topic: 'Foundations & Interactive Practice', practicalLab: 'Live virtual classroom lab and tools setup.' },
        { week: 'Module 3-4', topic: 'Capstone Lab & Evaluation', practicalLab: 'Online evaluation and certification project.' },
      ],
    })
  }

  // Also append custom course units created by faculty
  for (const unit of storeUnits) {
    if (usedUnitIds.has(unit.id)) continue
    const customOverrideFee = activeCustomFees?.[unit.id]
    const feeUsd = (typeof customOverrideFee === 'number' && customOverrideFee >= 0)
      ? customOverrideFee
      : typeof unit.fee === 'number' && unit.fee > 0 ? unit.fee : 60
    const feeCalculations = calculateDynamicFeeFields(feeUsd)
    programs.push({
      id: unit.id,
      title: unit.title,
      shortTitle: unit.title,
      category: 'Tech & Programming',
      tag: `🏛️ ${unit.program || unit.department || 'Online Course'}`,
      tagColor: '#0f172a',
      duration: unit.course_duration || '3 Months Certificate',
      durationWeeks: 12,
      schedule: unit.live_schedule_text || 'Live Online Batches & 24/7 LMS',
      ...feeCalculations,
      instructor: unit.teacher_name || 'Éclat Faculty Specialist',
      departmentId: 'dept-curriculum',
      departmentName: unit.department || 'Department of Technology',
      careerOutcome: unit.description || 'Certified Online Graduate',
      skills: unit.syllabus_modules?.flatMap((m) => m.topics) || ['Live Interactive Virtual Classes', 'Verified E-Certificate'],
      icon: '🎨',
      popular: true,
      rating: 4.9,
      ratingCount: 85,
      studentsEnrolled: 320,
      syllabus: unit.syllabus_modules?.map((m, idx) => ({
        week: `Week ${idx + 1}`,
        topic: m.title,
        practicalLab: m.learning_outcomes?.[0] || 'Live online hands-on exercises and project labs.',
      })) || [],
    })
  }

  return programs
}

export function getOfficialCourseById(id: string, storeSubjects?: any[], storeUnits?: any[]): CourseProgram | undefined {
  const list = storeSubjects || storeUnits ? getDynamicCoursesList(storeSubjects, storeUnits) : OFFICIAL_COURSES
  return list.find((c) => c.id === id || c.shortTitle.toLowerCase().includes(id.toLowerCase()))
}

export function getOfficialCourseByTitle(title: string, storeSubjects?: any[], storeUnits?: any[]): CourseProgram | undefined {
  const list = storeSubjects || storeUnits ? getDynamicCoursesList(storeSubjects, storeUnits) : OFFICIAL_COURSES
  return list.find((c) => c.title.toLowerCase() === title.toLowerCase() || title.toLowerCase().includes(c.shortTitle.toLowerCase()))
}

