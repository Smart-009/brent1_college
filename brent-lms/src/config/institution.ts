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
    id: 'school-cambridge',
    code: 'SCH-CAIE',
    name: 'School of Cambridge International Curriculum (CAIE)',
    shortName: 'Cambridge International',
    category: 'Cambridge International (Years 9-11)',
    description: 'Accredited Cambridge Assessment International Education (Center KE042) offering Lower Secondary Year 9 Checkpoint and Upper Secondary Years 10-11 IGCSE preparation.',
    icon: '🏛️',
    color: '#0284c7',
    dean_name: 'Dr. Michael Davies, Ph.D. (Oxon)',
    dean_email: 'm.davies@eclat.institute',
    departments: [
      {
        id: 'dept-caie-math-cs',
        code: 'CAIE-MTHCS',
        name: 'Department of Cambridge Mathematical & Computational Sciences',
        description: 'Syllabi: Mathematics 0580 (Core & Extended), Additional Mathematics 0606, Computer Science 0478 across Years 9, 10, and 11.',
        hod_name: 'Dr. Michael Davies',
        programs: ['Cambridge Lower Secondary Math 0862 (Year 9)', 'Cambridge IGCSE Math 0580 (Years 10-11)', 'Cambridge IGCSE Computer Science 0478 (Years 10-11)'],
      },
      {
        id: 'dept-caie-sciences',
        code: 'CAIE-SCI',
        name: 'Department of Cambridge Natural & Experimental Sciences',
        description: 'Syllabi: Physics 0625, Chemistry 0620, Biology 0610 (Theory, Calculations & Alternative to Practical Paper 6) across Years 9, 10, and 11.',
        hod_name: 'Eng. Sarah Jenkins',
        programs: ['Cambridge Lower Secondary Science 0893 (Year 9)', 'Cambridge IGCSE Physics 0625 (Years 10-11)', 'Cambridge IGCSE Chemistry 0620 (Years 10-11)'],
      },
      {
        id: 'dept-caie-languages',
        code: 'CAIE-LANG',
        name: 'Department of Cambridge Languages & World Literature',
        description: 'Syllabi: First Language English 0500, English as a Second Language 0511, Literature in English 0475.',
        hod_name: 'Mrs. Victoria Sinclair',
        programs: ['Cambridge Lower Secondary English 0861 (Year 9)', 'Cambridge IGCSE First Language English 0500 (Years 10-11)'],
      },
      {
        id: 'dept-caie-business',
        code: 'CAIE-BIZ',
        name: 'Department of Cambridge Humanities, Business & Social Sciences',
        description: 'Syllabi: Business Studies 0450, Economics 0455, Accounting 0452, Global Perspectives 0457 for Cambridge ICE distinction.',
        hod_name: 'Mr. David Ombasa, MBA',
        programs: ['Cambridge IGCSE Business Studies 0450 (Years 10-11)', 'Cambridge IGCSE Economics 0455 (Years 10-11)'],
      },
    ],
  },
  {
    id: 'school-edexcel',
    code: 'SCH-EDX',
    name: 'School of Pearson Edexcel International Curriculum',
    shortName: 'Pearson Edexcel',
    category: 'Pearson Edexcel International (Years 9-11)',
    description: 'Accredited Pearson Edexcel International GCSE (9-1) curriculum delivering linear rigor, modular assessment labs, and past paper examination mastery.',
    icon: '🇬🇧',
    color: '#dc2626',
    dean_name: 'Prof. Alistair Sterling, Ed.D. (London)',
    dean_email: 'a.sterling@eclat.institute',
    departments: [
      {
        id: 'dept-edx-stem',
        code: 'EDX-STEM',
        name: 'Department of Edexcel STEM & Pure Sciences',
        description: 'Pearson Edexcel International GCSE (9-1) Mathematics A (4MA1 Higher Tier), Physics (4PH1), Chemistry (4CH1), and Biology (4BI1) across Years 9, 10, and 11.',
        hod_name: 'Prof. Alistair Sterling',
        programs: ['Edexcel iLowerSecondary Mathematics (Year 9)', 'Edexcel International GCSE Math 4MA1 (Years 10-11)', 'Edexcel International GCSE Physics 4PH1 (Years 10-11)', 'Edexcel International GCSE Chemistry 4CH1 (Years 10-11)'],
      },
      {
        id: 'dept-edx-digital',
        code: 'EDX-DIGITAL',
        name: 'Department of Edexcel Digital Technologies & Computer Science',
        description: 'Pearson Edexcel International GCSE (9-1) Computer Science (4CP0 Onscreen Python Programming & Algorithms) and ICT (4IT1).',
        hod_name: 'Eng. Marcus Thorne',
        programs: ['Edexcel International GCSE Computer Science 4CP0 (Years 10-11)', 'Edexcel Information & Communication Technology 4IT1'],
      },
      {
        id: 'dept-edx-commerce',
        code: 'EDX-COMM',
        name: 'Department of Edexcel Commerce, Finance & Global Economics',
        description: 'Pearson Edexcel International GCSE (9-1) Business (4BS1), Economics (4EC1), and Accounting (4AC1).',
        hod_name: 'Mrs. Fiona Campbell, M.Sc.',
        programs: ['Edexcel International GCSE Business 4BS1 (Years 10-11)', 'Edexcel International GCSE Economics 4EC1 (Years 10-11)'],
      },
      {
        id: 'dept-edx-humanities',
        code: 'EDX-HUM',
        name: 'Department of Edexcel English Language & Global Humanities',
        description: 'Pearson Edexcel International GCSE (9-1) English Language A (4EA1) and English Literature (4ET1).',
        hod_name: 'Dr. Julian Croft',
        programs: ['Edexcel iLowerSecondary English (Year 9)', 'Edexcel International GCSE English Language 4EA1 (Years 10-11)'],
      },
    ],
  },
  {
    id: 'school-software',
    code: 'SCH-SWE',
    name: 'School of Computing & Software Engineering',
    shortName: 'Software Engineering',
    category: 'Tech & Programming',
    description: '100% Online full-stack web engineering, React 19, TypeScript, Node.js APIs, cloud architectures, and production deployment.',
    icon: '💻',
    color: '#6366f1',
    dean_name: 'Eng. Alex Mwangi',
    dean_email: 'a.mwangi@eclat.institute',
    departments: [
      {
        id: 'dept-swe',
        code: 'DEPT-SWE',
        name: 'Department of Full-Stack Web Development & Cloud Systems',
        programs: ['Full-Stack Web Development (React 19 & Node.js)', 'JavaScript & Cloud Deployment Masterclass'],
      },
      {
        id: 'dept-cyber',
        code: 'DEPT-CYBER',
        name: 'Department of Cybersecurity & Network Defense',
        programs: ['Cybersecurity Fundamentals & Threat Defense', 'Network Administration & Server Security'],
      },
    ],
  },
  {
    id: 'school-data',
    code: 'SCH-DATA',
    name: 'School of Data Science, AI & Quantitative Research',
    shortName: 'Data Science & AI',
    category: 'Data Science & Research',
    description: 'Specialized statistical inference, econometric modeling, Python AI pipelines, R programming, SPSS, and Stata for corporate and academic research.',
    icon: '📊',
    color: '#0284c7',
    dean_name: 'Dr. Brian Ochieng, Ph.D.',
    dean_email: 'b.ochieng@eclat.institute',
    departments: [
      {
        id: 'dept-data',
        code: 'DEPT-DATA',
        name: 'Department of Python Programming, Machine Learning & AI',
        programs: ['Python for Beginners & Data Analytics', 'Predictive Machine Learning & Automated Pipelines'],
      },
      {
        id: 'dept-econometrics',
        code: 'DEPT-ECON',
        name: 'Department of Econometrics, R, SPSS & Quantitative Analysis',
        programs: ['Advanced Econometrics & Time-Series in R', 'SPSS & Stata Multilevel Research Modeling'],
      },
    ],
  },
  {
    id: 'school-design',
    code: 'SCH-DSG',
    name: 'School of Creative Arts & Digital Design',
    shortName: 'Creative Design',
    category: 'Creative Arts & Design',
    description: 'Industry-standard UI/UX design in Figma, design systems, human-computer interaction, motion animation, and Canva Pro digital branding.',
    icon: '🎨',
    color: '#ec4899',
    dean_name: 'Clara Dubois, M.A.',
    dean_email: 'c.dubois@eclat.institute',
    departments: [
      {
        id: 'dept-uiux',
        code: 'DEPT-UIUX',
        name: 'Department of UI/UX Design, Design Systems & Figma Pro',
        programs: ['Executive UI/UX Design & Design Systems in Figma', 'Human-Centered User Research & Usability Testing'],
      },
      {
        id: 'dept-comp',
        code: 'DEPT-COMP',
        name: 'Department of Computer Applications & Digital Graphic Skills',
        programs: ['Comprehensive Computer Packages & Digital Skills', 'Canva Pro Graphics & Social Media Design'],
      },
    ],
  },
  {
    id: 'school-business',
    code: 'SCH-BIZ',
    name: 'School of Executive Leadership & Business Administration',
    shortName: 'Business & Leadership',
    category: 'Business Tech & Accounting',
    description: 'Corporate accounting on QuickBooks, KRA iTax compliance, executive financial modeling, and CPD-accredited leadership diplomas.',
    icon: '🧾',
    color: '#f59e0b',
    dean_name: 'Mrs. Grace Wanjiku, CPA(K)',
    dean_email: 'g.wanjiku@eclat.institute',
    departments: [
      {
        id: 'dept-biztech',
        code: 'DEPT-BIZTECH',
        name: 'Department of Business Tech & Computerized Accounting',
        programs: ['Computerized Accounting (QuickBooks & iTax)', 'Corporate Financial Modeling & Budgeting'],
      },
    ],
  },
  {
    id: 'school-languages',
    code: 'SCH-LANG',
    name: 'School of Languages, Communication & Global Test Prep',
    shortName: 'Languages & Test Prep',
    category: 'Languages & Communication',
    description: 'IELTS Academic & General Training (Band 7.5-9.0), corporate English presentation mastery, Arabic, French, German, and Kiswahili Sanifu.',
    icon: '🗣️',
    color: '#10b981',
    dean_name: 'Prof. Eric Thorne',
    dean_email: 'e.thorne@eclat.institute',
    departments: [
      {
        id: 'dept-ielts',
        code: 'DEPT-IELTS',
        name: 'Department of IELTS & International Examination Prep',
        programs: ['IELTS Academic Intensive (Band 7.5+ Target)', 'IELTS General Training for Immigration'],
      },
      {
        id: 'dept-lang',
        code: 'DEPT-LANG',
        name: 'Department of Modern Foreign Languages (Arabic, French, German)',
        programs: ['English Language Fluency & Corporate Speaking', 'Foreign Languages (Arabic, French, German)'],
      },
      {
        id: 'dept-kisw',
        code: 'DEPT-KISW',
        name: 'Department of Kiswahili Sanifu & African Dialects',
        programs: ['Kiswahili Sanifu for Beginners & Expatriates', 'Advanced Swahili Translation & Discourse'],
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
