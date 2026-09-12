// ============================================================
// Centralized Institutional & Platform Configuration
// Single source of truth driven by environment variables
// ============================================================

export interface InstitutionConfig {
  name: string
  shortName: string
  tagline: string
  description: string
  websiteUrl: string
  portalUrl: string
  domain: string
  
  contact: {
    phone: string
    phoneRaw: string
    phoneFormatted: string
    whatsappNumber: string
    email: string
    admissionsEmail: string
  }

  bank: {
    name: string
    accountNumber: string
    paybillNumber: string
    accountName: string
    branch: string
  }

  pricing: {
    currencySymbol: string
    currencyCode: string
    defaultTuitionFee: number
  }

  auth: {
    adminDefaultPassword?: string
    internalEmailDomain: string
  }

  igcse: {
    centerNumber: string
    centerName: string
    accreditedBoards: string[]
    currentSeries: string
    qualificationsOffered: string[]
  }

  cambridge?: {
    boardName: string
    shortBoard: string
    centerNumber: string
    centerName: string
    currentSeries: string
    yearLevels: string[]
    qualificationsOffered: string[]
  }

  edexcel?: {
    boardName: string
    shortBoard: string
    centerNumber: string
    centerName: string
    currentSeries: string
    yearLevels: string[]
    qualificationsOffered: string[]
    gradingSystem: string
  }
}

export const INSTITUTION_CONFIG: InstitutionConfig = {
  name: (import.meta.env.VITE_INSTITUTION_NAME as string) || 'Éclat Institute',
  shortName: (import.meta.env.VITE_INSTITUTION_SHORT_NAME as string) || 'Éclat Institute',
  tagline: (import.meta.env.VITE_INSTITUTION_TAGLINE as string) || '100% Online Virtual Campus',
  description:
    (import.meta.env.VITE_INSTITUTION_DESC as string) ||
    'Certified 100% Online Virtual Campus for Technology, Software Engineering, Data Science, and Modern Languages.',
  websiteUrl: (import.meta.env.VITE_WEBSITE_URL as string) || 'https://eclat.institute',
  portalUrl: (import.meta.env.VITE_PORTAL_URL as string) || 'https://eclat.institute/login',
  domain: (import.meta.env.VITE_INSTITUTION_DOMAIN as string) || 'eclat.institute',

  contact: {
    phone: (import.meta.env.VITE_INSTITUTION_PHONE as string) || '+254 740 027 346',
    phoneRaw: (import.meta.env.VITE_INSTITUTION_PHONE_RAW as string) || '254740027346',
    phoneFormatted: (import.meta.env.VITE_INSTITUTION_PHONE as string) || '+254 740 027 346',
    whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER as string) || '254740027346',
    email: (import.meta.env.VITE_INSTITUTION_EMAIL as string) || 'info.eclatinstitute@gmail.com',
    admissionsEmail: (import.meta.env.VITE_ADMISSIONS_EMAIL as string) || 'info.eclatinstitute@gmail.com',
  },

  bank: {
    name: (import.meta.env.VITE_BANK_NAME as string) || 'KCB Bank',
    accountNumber: (import.meta.env.VITE_BANK_ACCOUNT as string) || '1344329268',
    paybillNumber: (import.meta.env.VITE_PAYBILL_NUMBER as string) || '522522',
    accountName: (import.meta.env.VITE_BANK_ACCOUNT_NAME as string) || 'Éclat Institute',
    branch: (import.meta.env.VITE_BANK_BRANCH as string) || 'Nairobi Central',
  },

  pricing: {
    currencySymbol: (import.meta.env.VITE_CURRENCY_SYMBOL as string) || '$',
    currencyCode: (import.meta.env.VITE_CURRENCY_CODE as string) || 'USD',
    defaultTuitionFee: Number(import.meta.env.VITE_DEFAULT_TUITION_FEE) || 60,
  },

  auth: {
    adminDefaultPassword: (import.meta.env.VITE_ADMIN_PASSWORD as string) || (import.meta.env.ADMIN_PASSWORD as string) || 'Eclat@2026#!',
    internalEmailDomain: (import.meta.env.VITE_INTERNAL_EMAIL_DOMAIN as string) || 'eclatinstitute.internal',
  },

  igcse: {
    centerNumber: (import.meta.env.VITE_IGCSE_CENTER_NUMBER as string) || 'KE042',
    centerName: 'Éclat Institute International Examination Centre',
    accreditedBoards: ['Cambridge Assessment International Education (CAIE)', 'Pearson Edexcel International'],
    currentSeries: 'May/June 2026 Examination Series',
    qualificationsOffered: [
      'Cambridge Lower Secondary (Checkpoint Years 7-9)',
      'Cambridge IGCSE (Years 10-11)',
      'Pearson Edexcel iLowerSecondary (Year 9)',
      'Pearson Edexcel International GCSE (9-1) (Years 10-11)',
      'Cambridge International AS & A-Levels (Years 12-13)',
      'Cambridge ICE (International Certificate of Education)',
    ],
  },

  cambridge: {
    boardName: 'Cambridge Assessment International Education (CAIE)',
    shortBoard: 'Cambridge CAIE',
    centerNumber: (import.meta.env.VITE_CAMBRIDGE_CENTER_NUMBER as string) || 'KE042',
    centerName: 'Éclat Institute Cambridge International Examination Centre (KE042)',
    currentSeries: 'May/June 2026 Examination Series',
    yearLevels: ['Year 9 (Foundation)', 'Year 10 (IGCSE Year 1)', 'Year 11 (Exam Series)'],
    qualificationsOffered: [
      'Cambridge Lower Secondary Checkpoint (Year 9)',
      'Cambridge IGCSE (Years 10-11)',
      'Cambridge ICE Group Award (Distinction / Merit / Pass)',
      'Cambridge International AS & A-Levels (Years 12-13)',
    ],
  },

  edexcel: {
    boardName: 'Pearson Edexcel International',
    shortBoard: 'Pearson Edexcel',
    centerNumber: (import.meta.env.VITE_EDEXCEL_CENTER_NUMBER as string) || 'EDX-98421',
    centerName: 'Éclat Institute Pearson Edexcel International Centre',
    currentSeries: 'May/June 2026 Examination Series',
    yearLevels: ['Year 9 (Foundation)', 'Year 10 (IGCSE Year 1)', 'Year 11 (Exam Series)'],
    qualificationsOffered: [
      'Pearson Edexcel iLowerSecondary (Year 9)',
      'Pearson Edexcel International GCSE (9-1) (Years 10-11)',
      'Pearson Edexcel International A-Levels (IAL)',
    ],
    gradingSystem: 'Linear Numerical 9-1 Scale',
  },
}

/**
 * Institutional Schools & Specialized Academic Departments Registry
 */
export const INSTITUTIONAL_SCHOOLS = [
  {
    id: 'school-business',
    code: 'SCH-BIZ',
    name: 'School of Business',
    shortName: 'Business',
    category: 'School of Business',
    description: 'Executive leadership, corporate computerized accounting on QuickBooks, KRA iTax statutory compliance, corporate financial modeling, commerce, economics, and business administration.',
    icon: '💼',
    color: '#f59e0b',
    dean_name: 'Mrs. Grace Wanjiku, CPA(K)',
    dean_email: 'g.wanjiku@eclat.institute',
    departments: [
      {
        id: 'dept-biztech',
        code: 'DEPT-BIZTECH',
        name: 'Department of Business Tech & Computerized Accounting',
        description: 'Computerized accounting, QuickBooks Online & Desktop, KRA iTax VAT & PAYE statutory filing, digital bookkeeping, and payroll management.',
        hod_name: 'Mrs. Grace Wanjiku, CPA(K)',
        programs: ['Computerized Accounting (QuickBooks & iTax)', 'Corporate Financial Modeling & Budgeting', 'Digital Bookkeeping & Payroll Management'],
      },
      {
        id: 'dept-commerce-mgmt',
        code: 'DEPT-COMM',
        name: 'Department of Commerce, Economics & Enterprise Management',
        description: 'Corporate business management, managerial economics, international commerce, and executive leadership.',
        hod_name: 'Mrs. Fiona Campbell, M.Sc.',
        programs: ['Executive Leadership & Business Administration', 'Global Commerce & Applied Economics', 'Strategic Entrepreneurship & New Ventures'],
      },
    ],
  },
  {
    id: 'school-it-data',
    code: 'SCH-ITDS',
    name: 'School of IT and Data Science',
    shortName: 'IT & Data Science',
    category: 'School of IT and Data Science',
    description: 'Premier computing faculty combining Full-Stack Web & Software Engineering (React 19 & Node.js), Python AI & Machine Learning, Big Data Analytics, Econometrics (R, SPSS, Stata), Cybersecurity, and Creative UI/UX Design.',
    icon: '💻',
    color: '#6366f1',
    dean_name: 'Eng. Alex Mwangi & Dr. Brian Ochieng, Ph.D.',
    dean_email: 'tech.faculty@eclat.institute',
    departments: [
      {
        id: 'dept-swe',
        code: 'DEPT-SWE',
        name: 'Department of Full-Stack Software Engineering & Cloud Technologies',
        description: '100% Online full-stack engineering, React 19, TypeScript, Node.js REST APIs, and cloud deployment.',
        hod_name: 'Eng. Alex Mwangi',
        programs: ['Full-Stack Web Development (React 19 & Node.js)', 'JavaScript & Cloud Deployment Masterclass', 'Mobile Application Development with Capacitor'],
      },
      {
        id: 'dept-data',
        code: 'DEPT-DATA',
        name: 'Department of Python Programming, Machine Learning & AI',
        description: 'Python programming, predictive machine learning models, neural networks, and automated data pipelines.',
        hod_name: 'Dr. Brian Ochieng, Ph.D.',
        programs: ['Python for Data Science & Analytics', 'Predictive Machine Learning & AI Pipelines', 'SQL Database Engineering & Power BI'],
      },
      {
        id: 'dept-cyber',
        code: 'DEPT-CYBER',
        name: 'Department of Cybersecurity, Networking & Server Security',
        description: 'Network defense, server administration, penetration testing principles, and cloud architecture defense.',
        hod_name: 'Mr. David Kiprono',
        programs: ['Cybersecurity Fundamentals & Threat Defense', 'Network Administration & Server Security', 'Cloud Security & DevOps Infrastructure'],
      },
      {
        id: 'dept-econometrics',
        code: 'DEPT-ECON',
        name: 'Department of Econometrics, Statistics & Research Analytics',
        description: 'Advanced statistical inference, econometric time-series modeling in R, SPSS, Stata, and dissertation research.',
        hod_name: 'Dr. Brian Ochieng',
        programs: ['Advanced Econometrics & Time-Series in R', 'SPSS & Stata Multilevel Research Modeling', 'Quantitative Data Analysis for Academia & Industry'],
      },
      {
        id: 'dept-uiux',
        code: 'DEPT-UIUX',
        name: 'Department of UI/UX Design, Creative Media & Digital Skills',
        description: 'Figma UI/UX design systems, user research, Canva Pro visual branding, and essential computer packages.',
        hod_name: 'Clara Dubois, M.A.',
        programs: ['Executive UI/UX Design & Design Systems in Figma', 'Canva Pro Graphics & Social Media Animation', 'Comprehensive Computer Packages & Digital Office Skills'],
      },
    ],
  },
  {
    id: 'school-languages',
    code: 'SCH-LANG',
    name: 'School of Language',
    shortName: 'Language',
    category: 'School of Language',
    description: 'International language mastery: IELTS Academic & General Training (Band 7.5-9.0), corporate English communication, modern foreign languages (Arabic, French, German), and Kiswahili Sanifu discourse.',
    icon: '🗣️',
    color: '#10b981',
    dean_name: 'Prof. Eric Thorne',
    dean_email: 'e.thorne@eclat.institute',
    departments: [
      {
        id: 'dept-ielts',
        code: 'DEPT-IELTS',
        name: 'Department of IELTS & International Examination Prep',
        description: 'High-yield IELTS Academic and General Training preparation for global migration and university admissions.',
        hod_name: 'Prof. Eric Thorne',
        programs: ['IELTS Academic Intensive (Band 7.5+ Target)', 'IELTS General Training for Global Migration', 'OET & Professional Language Certifications'],
      },
      {
        id: 'dept-foreign-lang',
        code: 'DEPT-LANG',
        name: 'Department of Modern Foreign Languages (Arabic, French, German)',
        description: 'CEFR-accredited foreign language instruction for diplomacy, multinational careers, and international commerce.',
        hod_name: 'Dr. Julian Croft',
        programs: ['French Language Certificate (A1-C1 DELF)', 'German Language Proficiency (Goethe-Zertifikat)', 'Modern Standard Arabic for Professionals'],
      },
      {
        id: 'dept-english-fluency',
        code: 'DEPT-ENG',
        name: 'Department of English Fluency & Executive Public Speaking',
        description: 'Executive speaking, pitch deck presentations, speech crafting, and professional business correspondence.',
        hod_name: 'Mrs. Victoria Sinclair',
        programs: ['English Language Fluency & Public Speaking', 'Corporate Business Writing & Rhetoric', 'Pronunciation & Cross-Cultural Discourse'],
      },
      {
        id: 'dept-kisw',
        code: 'DEPT-KISW',
        name: 'Department of Kiswahili Sanifu & African Dialects',
        description: 'Structured Swahili immersion for beginners, diaspora learners, researchers, and professional translators.',
        hod_name: 'Mwl. Omondi Juma',
        programs: ['Kiswahili Sanifu for Beginners & Expatriates', 'Advanced Swahili Translation & Cultural Studies'],
      },
    ],
  },
  {
    id: 'school-igcse',
    code: 'SCH-IGCSE',
    name: 'IGCSE',
    shortName: 'IGCSE',
    category: 'IGCSE',
    description: 'Accredited international British curriculum delivering Cambridge Assessment International Education (CAIE Center KE042) and Pearson Edexcel International (Center EDX-98421) across Year 9 Checkpoint, Year 10 IGCSE, and Year 11 Exam Series.',
    icon: '🇬🇧',
    color: '#0284c7',
    dean_name: 'Dr. Michael Davies & Prof. Alistair Sterling',
    dean_email: 'igcse.faculty@eclat.institute',
    departments: [
      {
        id: 'dept-igcse-sciences',
        code: 'IGCSE-SCI',
        name: 'Department of IGCSE Natural & Pure Sciences (Triple Science)',
        description: 'Cambridge & Edexcel Physics (0625/4PH1), Chemistry (0620/4CH1), Biology (0610/4BI1), and Lower Secondary Year 9 Checkpoint Science.',
        hod_name: 'Eng. Sarah Jenkins & Dr. Evelyn Dubois',
        programs: ['Cambridge IGCSE Triple Sciences (0625/0620/0610)', 'Pearson Edexcel IGCSE Triple Sciences (4PH1/4CH1/4BI1)', 'Year 9 Lower Secondary Checkpoint Science'],
      },
      {
        id: 'dept-igcse-math-cs',
        code: 'IGCSE-MTHCS',
        name: 'Department of IGCSE Mathematics & Computational Sciences',
        description: 'Cambridge & Edexcel Mathematics (0580/4MA1), Additional Mathematics (0606), Computer Science & Python (0478/4CP0), and Year 9 Math.',
        hod_name: 'Dr. Michael Davies & Eng. Marcus Thorne',
        programs: ['Cambridge IGCSE Math 0580 & Additional Math 0606', 'Pearson Edexcel Math A 4MA1 Higher Tier', 'Cambridge & Edexcel Computer Science (0478 & 4CP0)'],
      },
      {
        id: 'dept-igcse-humanities',
        code: 'IGCSE-HUM',
        name: 'Department of IGCSE English Language & Global Humanities',
        description: 'Cambridge First Language English (0500), Literature (0475), Pearson Edexcel English Language A (4EA1), and Year 9 English.',
        hod_name: 'Mrs. Victoria Sinclair & Dr. Julian Croft',
        programs: ['Cambridge IGCSE English 0500 (Papers 1 & 2)', 'Pearson Edexcel English Language A 4EA1', 'Year 9 Lower Secondary Checkpoint English'],
      },
      {
        id: 'dept-igcse-commerce',
        code: 'IGCSE-COMM',
        name: 'Department of IGCSE Commerce, Business & Economics',
        description: 'Cambridge Business Studies (0450) & Economics (0455), Pearson Edexcel Business (4BS1) & Economics (4EC1) for Cambridge ICE Distinction.',
        hod_name: 'Mr. David Ombasa, MBA & Mrs. Fiona Campbell',
        programs: ['Cambridge IGCSE Business Studies 0450 & Economics 0455', 'Pearson Edexcel Business 4BS1 & Economics 4EC1', 'Cambridge ICE Group Award Distinction Track'],
      },
    ],
  },
]

/**
 * Helper to construct WhatsApp inquiry link
 */
export function getWhatsAppInquiryUrl(message?: string): string {
  const defaultMsg = `Hello ${INSTITUTION_CONFIG.name} Admissions! I would like to inquire about online courses and upcoming intakes.`
  const text = encodeURIComponent(message || defaultMsg)
  return `https://wa.me/${INSTITUTION_CONFIG.contact.whatsappNumber}?text=${text}`
}

/**
 * Helper to format Paybill text
 */
export function getPaybillSummary(): string {
  return `Paybill: ${INSTITUTION_CONFIG.bank.paybillNumber} • Acc: ${INSTITUTION_CONFIG.bank.accountNumber}`
}
