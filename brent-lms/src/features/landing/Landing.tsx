import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { PWAInstallBanner } from '@/components/shared/PWAInstallBanner'
import { DesktopCommandPalette } from '@/components/shared/DesktopCommandPalette'
import { MobileAppBottomNav } from '@/components/layout/MobileAppBottomNav'
import { MobileLandingView } from './MobileLandingView'
import { supabase } from '@/lib/supabase'
import { schoolStore } from '@/lib/schoolData'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'
import type { Role } from '@/lib/database.types'

interface CourseItem {
  id: string
  title: string
  category: 'Tech & Programming' | 'Computer & Digital Skills' | 'Languages & Communication' | 'Business Tech & Accounting' | 'Executive Masterclass' | string
  tag: string
  tagColor: string
  duration: string
  schedule: string
  fee: string
  installment: string
  careerOutcome: string
  skills: string[]
  icon: string
  popular?: boolean
  syllabus?: { week: string; topic: string; practicalLab: string }[]
}

const DEFAULT_COURSES_DATA: CourseItem[] = [
  {
    id: 'c-coding',
    title: 'Full-Stack Web Development & Modern JavaScript (React 19 & Node.js)',
    category: 'Tech & Programming',
    tag: '💻 High-Salary Tech Career',
    tagColor: '#6366f1',
    duration: '12 Weeks (3 Months)',
    schedule: 'Live Online Evening Classes (7:30 PM - 9:30 PM) / Self-Paced',
    fee: '$120',
    installment: '2 installments of $60',
    careerOutcome: 'Junior Full-Stack Developer • Frontend Engineer • Remote Tech Contractor',
    skills: ['React 19 & JavaScript ES6+', 'Node.js & Express APIs', 'PostgreSQL & Database Queries', 'Git GitHub & Cloud Hosting', 'Full-Stack Portfolio Project'],
    icon: '💻',
    popular: true,
    syllabus: [
      { week: 'Week 1-3', topic: 'HTML5 Semantic Layouts, Modern Tailwind CSS & JavaScript ES6+', practicalLab: 'Live coding responsive web landing pages and portfolio projects.' },
      { week: 'Week 4-6', topic: 'React 19 State, Hooks, Component Architectures & APIs', practicalLab: 'Building dynamic interactive dashboards with real-time API integrations.' },
      { week: 'Week 7-9', topic: 'Node.js Backend, Express REST APIs & Authentication', practicalLab: 'Developing secure authentication systems and CRUD endpoints.' },
      { week: 'Week 10-12', topic: 'PostgreSQL Relational DBs & Cloud Server Deployment', practicalLab: 'Deploying full-stack production applications to Vercel and cloud containers.' },
    ],
  },
  {
    id: 'c-python',
    title: 'Python Programming, SQL & Data Analytics',
    category: 'Tech & Programming',
    tag: '📊 Data & AI Fundamentals',
    tagColor: '#0284c7',
    duration: '8 Weeks (2 Months)',
    schedule: 'Live Virtual Cohorts (Mon & Wed 8:00 PM) / Saturday Intensive',
    fee: '$95',
    installment: '2 installments of $48',
    careerOutcome: 'Data Analyst • Business Intelligence Associate • Junior Python Developer',
    skills: ['Python Syntax & OOP', 'Pandas & NumPy Data Cleaning', 'SQL Queries & Relational DBs', 'Matplotlib & Seaborn Charts', 'Power BI Dashboards'],
    icon: '📊',
    popular: true,
    syllabus: [
      { week: 'Week 1-2', topic: 'Python Programming Fundamentals & Data Structures', practicalLab: 'Writing Python scripts, automation loops, and algorithmic problem solving.' },
      { week: 'Week 3-4', topic: 'SQL Relational Queries & Database Aggregations', practicalLab: 'Querying complex multi-table datasets, filtering, and JOIN operations.' },
      { week: 'Week 5-6', topic: 'Data Wrangling & Statistical Analysis with Pandas', practicalLab: 'Cleaning messy real-world corporate data and handling missing metrics.' },
      { week: 'Week 7-8', topic: 'Interactive Visualizations & Business Intelligence', practicalLab: 'Publishing interactive analytics dashboards and executive reports.' },
    ],
  },
  {
    id: 'c-comp',
    title: 'Comprehensive Computer Packages & Modern Digital Literacy',
    category: 'Computer & Digital Skills',
    tag: '⚡ Essential Office Tech',
    tagColor: '#0f172a',
    duration: '4 Weeks (1 Month)',
    schedule: 'Live Virtual Morning (9:00 AM) / Evening (6:00 PM) / 24/7 LMS',
    fee: '$45',
    installment: '2 installments of $23',
    careerOutcome: 'Office Administrator • Executive Virtual Assistant • Data Entry Specialist',
    skills: ['Ms Word & Document Styling', 'Advanced Ms Excel & Formulas', 'PowerPoint Slide Decks', 'Google Workspace Collaboration', 'Canva Pro Graphics & Social Media'],
    icon: '⚡',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'Touch Typing & Advanced Ms Word Corporate Documentation', practicalLab: 'Formatting official business memos, contracts, and dynamic tables of contents.' },
      { week: 'Week 2', topic: 'Advanced Ms Excel Spreadsheets, VLOOKUP & Data Formulas', practicalLab: 'Automated payroll formulas, IF statements, budgeting sheets, and pivot charts.' },
      { week: 'Week 3', topic: 'PowerPoint Pitch Decks & Cloud Google Workspace', practicalLab: 'Creating high-impact executive slide decks and collaborative cloud workflows.' },
      { week: 'Week 4', topic: 'Canva Graphic Design, AI Productivity Tools & Cybersecurity', practicalLab: 'Designing social media flyers, resume branding, and digital safety practices.' },
    ],
  },
  {
    id: 'c-cyber',
    title: 'Cybersecurity Fundamentals & Ethical Defense',
    category: 'Tech & Programming',
    tag: '🛡️ Security & Defense',
    tagColor: '#dc2626',
    duration: '6 Weeks',
    schedule: 'Live Virtual Weekend Masterclass (Sat & Sun 3:00 PM - 6:00 PM)',
    fee: '$89',
    installment: '2 installments of $45',
    careerOutcome: 'Junior SOC Analyst • IT Security Specialist • System Administrator',
    skills: ['Network Security & Protocols', 'Vulnerability Assessment', 'Ethical Hacking Fundamentals', 'Password & Encryption Standards', 'Incident Response'],
    icon: '🛡️',
    popular: true,
    syllabus: [
      { week: 'Week 1-2', topic: 'Networking Protocols, TCP/IP, OSI & Firewall Architecture', practicalLab: 'Packet sniffing with Wireshark and analyzing network traffic security.' },
      { week: 'Week 3-4', topic: 'Common Cyber Attack Vectors, Malware & Social Engineering', practicalLab: 'Identifying phishing payloads, vulnerability scanning, and risk reports.' },
      { week: 'Week 5-6', topic: 'Defensive Hardening, Cryptography & Incident Response', practicalLab: 'Configuring secure server policies, SSL/TLS, and security audit checklists.' },
    ],
  },
  {
    id: 'c-acc',
    title: 'Computerized Accounting, QuickBooks & International Tax',
    category: 'Business Tech & Accounting',
    tag: '📈 High Corporate Demand',
    tagColor: '#b45309',
    duration: '4 Weeks (1 Month)',
    schedule: 'Live Virtual Evening (6:00 PM - 8:00 PM) / Weekend Batches',
    fee: '$65',
    installment: '2 installments of $33',
    careerOutcome: 'Accounts Assistant • Payroll Specialist • Tax Consultant & Bookkeeper',
    skills: ['QuickBooks Desktop & Online', 'International Tax Filing & VAT', 'Payroll & Benefits Deductions', 'Bank Reconciliation', 'Financial Statements & Balance Sheets'],
    icon: '📈',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'Company File Setup & Chart of Accounts in QuickBooks', practicalLab: 'Configuring fiscal years, opening balances, and vendor databases.' },
      { week: 'Week 2', topic: 'Invoicing, Accounts Receivable & Bill Payments', practicalLab: 'Recording sales receipts, customer credit memos, and supplier reconciliations.' },
      { week: 'Week 3', topic: 'Payroll Processing & Monthly Tax Filing', practicalLab: 'Computing salary deductions, benefit computations, and filing VAT returns.' },
      { week: 'Week 4', topic: 'Bank Reconciliation & Financial Statement Generation', practicalLab: 'Balancing monthly bank accounts and generating Profit & Loss balance sheets.' },
    ],
  },
  {
    id: 'c-uiux',
    title: 'UI/UX Product Design & Figma Masterclass',
    category: 'Computer & Digital Skills',
    tag: '🎨 Creative Tech',
    tagColor: '#8b5cf6',
    duration: '6 Weeks',
    schedule: 'Live Online Evening / Flexible Self-Paced Modules',
    fee: '$75',
    installment: '2 installments of $38',
    careerOutcome: 'UI/UX Designer • Product Designer • Freelance Figma Specialist',
    skills: ['User Research & Wireframing', 'Figma Components & Auto Layout', 'Interactive Clickable Prototypes', 'Design Systems & UI Kits', 'Developer Hand-off'],
    icon: '🎨',
    syllabus: [
      { week: 'Week 1-2', topic: 'UX Design Thinking, User Persona & Wireframing', practicalLab: 'Low-fidelity wireframing and user journey mapping for mobile apps.' },
      { week: 'Week 3-4', topic: 'Figma Mastery: Auto Layout, Components & Tokens', practicalLab: 'Building scalable UI component design systems and responsive web screens.' },
      { week: 'Week 5-6', topic: 'High-Fidelity Prototyping, Micro-interactions & Hand-off', practicalLab: 'Delivering interactive animated prototypes and developer design tokens.' },
    ],
  },
  {
    id: 'c-eng',
    title: 'English Language Mastery & Executive Corporate Communication',
    category: 'Languages & Communication',
    tag: '🗣️ Public Speaking & Fluency',
    tagColor: '#0284c7',
    duration: '6 to 8 Weeks',
    schedule: 'Live Virtual Evening (6:00 PM) / Morning Sessions (7:30 AM)',
    fee: '$55',
    installment: '2 installments of $28',
    careerOutcome: 'Corporate Communicator • Public Speaker • Executive Virtual Assistant',
    skills: ['Spoken English & Pronunciation', 'Business Email & Executive Memos', 'Public Speaking & Presentation', 'Grammar & Vocabulary Mastery', 'Boardroom Interview Confidence'],
    icon: '📢',
    popular: true,
    syllabus: [
      { week: 'Week 1-2', topic: 'Grammar Fundamentals & Phonetic Pronunciation', practicalLab: 'Live speaking video breakout rooms and articulation drills.' },
      { week: 'Week 3-4', topic: 'Spoken Fluency & Vocabulary Expansion', practicalLab: 'Interactive pair dialogues, impromptu speeches, and eliminating hesitation.' },
      { week: 'Week 5-6', topic: 'Business Writing & Corporate Email Etiquette', practicalLab: 'Drafting formal executive memos, corporate proposals, and reports.' },
      { week: 'Week 7-8', topic: 'Public Speaking, Presentations & Interview Skills', practicalLab: 'Live virtual presentations and executive interview simulations.' },
    ],
  },
  {
    id: 'c-ielts',
    title: 'IELTS Academic & General Training Exam Prep (Band 7.5 - 9.0)',
    category: 'Languages & Communication',
    tag: '🌍 Study Abroad & Global Visas',
    tagColor: '#2563eb',
    duration: '4 to 6 Weeks Intensive',
    schedule: 'Live Zoom Speaking Mock Tests & Writing Drills (Evening / Weekend)',
    fee: '$85',
    installment: '2 installments of $43',
    careerOutcome: 'Study Abroad (UK, Canada, USA, Europe) • Global Healthcare & Relocation Visas',
    skills: ['IELTS Speaking 1-on-1 Mocks', 'Listening Audio Comprehension Strategies', 'Academic Reading Speed Tactics', 'Task 1 & Task 2 Writing Masterclass', 'British Council Exam Rubric'],
    icon: '🎓',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'IELTS Speaking Section & Part 1-3 Fluency Mastery', practicalLab: '1-on-1 live mock interviews with certified feedback and scoring.' },
      { week: 'Week 2', topic: 'Listening Section & Audio Trap Strategies', practicalLab: 'Real-time Cambridge audio practice tests with multi-accent comprehension.' },
      { week: 'Week 3', topic: 'Academic & General Reading Speed Tactics', practicalLab: 'Skimming, scanning, True/False/Not Given drills, and paragraph matching.' },
      { week: 'Week 4-6', topic: 'Task 1 Graph Analysis & Task 2 Essay Masterclass', practicalLab: 'Individual essay corrections with British Council Band 8+ rubric.' },
    ],
  },
  {
    id: 'c-kisw',
    title: 'Spoken & Written Kiswahili Sanifu (Beginners & Expatriates)',
    category: 'Languages & Communication',
    tag: '🇰🇪 Conversational Swahili',
    tagColor: '#16a34a',
    duration: '4 to 6 Weeks',
    schedule: 'Live Interactive 1-on-1 & Small Group Video Sessions',
    fee: '$49',
    installment: '2 installments of $25',
    careerOutcome: 'NGO Field Officer • Expatriate Integration • East Africa Trade Liaison',
    skills: ['Everyday Mazungumzo & Greetings', 'Sarufi (Grammar & Noun Classes)', 'Market & Business Swahili', 'Reading & Written Composition', 'Cultural Communication & Etiquette'],
    icon: '🇰🇪',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'Salamu, Utambulisho & Noun Classes (Ngeli)', practicalLab: 'Live conversational drills and everyday interactive greetings.' },
      { week: 'Week 2', topic: 'Sarufi ya Kiswahili & Tense Conjugation', practicalLab: 'Past, present, future tenses, negation (kukanusha), and sentence building.' },
      { week: 'Week 3', topic: 'Biashara & Mazungumzo ya Masokoni', practicalLab: 'Real-life business scenarios, negotiation dialogues, and directions.' },
      { week: 'Week 4-6', topic: 'Insha, Hotuba & Formal Swahili Discourse', practicalLab: 'Formal speech delivery, translation exercises, and cultural etiquette.' },
    ],
  },
  {
    id: 'c-arabic',
    title: 'Arabic Language for Business & Middle East Careers',
    category: 'Languages & Communication',
    tag: '🌴 Gulf & International Career',
    tagColor: '#059669',
    duration: '8 Weeks (2 Months)',
    schedule: 'Live Evening (6:30 PM) / Weekend Virtual Cohorts',
    fee: '$75',
    installment: '2 installments of $38',
    careerOutcome: 'Bilingual Support Specialist • Middle East Corporate Liaison • Flight Attendant',
    skills: ['Arabic Script & Phonetics', 'Conversational Arabic for Everyday Life', 'Business & Commercial Vocabulary', 'Listening & Audio Comprehension', 'Gulf Cultural Etiquette'],
    icon: '🌴',
    popular: true,
    syllabus: [
      { week: 'Week 1-2', topic: 'Alphabet, Pronunciation & Basic Introductions', practicalLab: 'Writing Arabic script and practicing conversational greetings.' },
      { week: 'Week 3-4', topic: 'Everyday Dialogue, Numbers & Travel Vocabulary', practicalLab: 'Role-playing airport, hotel, and restaurant interactions in Arabic.' },
      { week: 'Week 5-6', topic: 'Grammar Foundations & Business Expressions', practicalLab: 'Forming compound sentences and corporate correspondence.' },
      { week: 'Week 7-8', topic: 'Listening Audio Comprehension & Speaking Exam', practicalLab: 'Live conversational assessment with native speakers.' },
    ],
  },
  {
    id: 'c-french',
    title: 'French Language Proficiency (DELF A1 - B2 Preparation)',
    category: 'Languages & Communication',
    tag: '🇫🇷 International Diploma',
    tagColor: '#3b82f6',
    duration: '8 Weeks (2 Months)',
    schedule: 'Live Online Video Masterclass (Tue & Thu 7:00 PM)',
    fee: '$79',
    installment: '2 installments of $40',
    careerOutcome: 'Embassy Assistant • International NGO Officer • Multilingual Customer Support',
    skills: ['French Phonetics & Accent', 'Grammar & Verb Conjugation', 'Conversational Fluency', 'Written Composition', 'DELF A1/A2 Exam Prep'],
    icon: '🇫🇷',
    syllabus: [
      { week: 'Week 1-2', topic: 'Les Salutations, Alphabet & Prononciation', practicalLab: 'Live pronunciation coaching and self-introduction dialogues.' },
      { week: 'Week 3-4', topic: 'Grammaire & Conjugaison des Verbes', practicalLab: 'Building past and present sentences in interactive breakout rooms.' },
      { week: 'Week 5-6', topic: 'Compréhension Orale & Expression Écrite', practicalLab: 'Listening to native audio clips and drafting French formal emails.' },
      { week: 'Week 7-8', topic: 'Préparation à l’Examen DELF & Simulation', practicalLab: 'Mock DELF listening, reading, and speaking tests.' },
    ],
  },
  {
    id: 'c-german',
    title: 'German Language for Work & Studies (Goethe A1/A2 Prep)',
    category: 'Languages & Communication',
    tag: '🇩🇪 German University & Work Pathway',
    tagColor: '#f59e0b',
    duration: '8 Weeks (2 Months)',
    schedule: 'Live Online Coaching & Grammar Workshops (Mon & Fri 7:00 PM)',
    fee: '$79',
    installment: '2 installments of $40',
    careerOutcome: 'German University Candidate • Healthcare & Nurse Relocation in Germany',
    skills: ['German Grammar & Cases (Akkusativ, Dativ)', 'Conversational Speaking Drills', 'Reading Comprehension', 'Goethe-Zertifikat Exam Tactics', 'Workplace Communication'],
    icon: '🇩🇪',
    syllabus: [
      { week: 'Week 1-2', topic: 'Aussprache, Begrüßungen & Grundwortschatz', practicalLab: 'German phonetics, numbers, and basic conversational sentences.' },
      { week: 'Week 3-4', topic: 'Deutsche Grammatik: Artikel & Fälle', practicalLab: 'Mastering der/die/das and sentence structure in live interactive sessions.' },
      { week: 'Week 5-6', topic: 'Hörverstehen & Leseverstehen im Alltag', practicalLab: 'Audio comprehension exercises and reading workplace memos.' },
      { week: 'Week 7-8', topic: 'Goethe-Zertifikat Prüfungsvorbereitung', practicalLab: 'Complete timed simulation of the Goethe A1/A2 examination.' },
    ],
  },
]

const TESTIMONIALS = [
  {
    name: 'Brian Kiprono',
    role: 'Remote Frontend Developer at FinTech Startup',
    course: 'Full-Stack Web Development',
    avatar: '💻',
    quote:
      'The 100% online React and Node.js course at Éclat Institute was phenomenal. The live evening coding labs and GitHub code reviews prepared me to build real-world apps. Within 1 month of finishing, I landed a remote developer role!',
    rating: 5,
  },
  {
    name: 'Faith Chebet',
    role: 'Achieved IELTS Band 8.5 (Nursing Relocation to the UK)',
    course: 'IELTS Academic Preparation',
    avatar: '🎓',
    quote:
      'The 1-on-1 live Zoom mock speaking sessions and detailed essay feedback transformed my confidence. I scored an overall Band 8.5 and my UK visa application was approved seamlessly. Best online program!',
    rating: 5,
  },
  {
    name: 'Abdi Mohammed',
    role: 'Bilingual Corporate Specialist in Dubai',
    course: 'Arabic for Business & Middle East Careers',
    avatar: '🌴',
    quote:
      'Taking the live online Arabic and Corporate Communication classes from home gave me the fluency required for international interviews. I am now working with an international airline in Dubai!',
    rating: 5,
  },
]

export function Landing() {
  const isMobile = useIsMobile(768)
  const { isInstalled, promptInstall } = usePWAInstall()
  const location = useLocation()
  const navigate = useNavigate()

  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<CourseItem | null>(null)
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [showPortalDesksModal, setShowPortalDesksModal] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Scroll to courses on #courses or /courses route
  useEffect(() => {
    if (location.pathname === '/courses' || location.hash === '#courses') {
      const timer = setTimeout(() => {
        const el = document.getElementById('courses')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [location.pathname, location.hash])

  // Live Intake Countdown Timer
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 4,
    hours: 18,
    minutes: 42,
    seconds: 15,
  })

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 350)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        return { days: 7, hours: 12, minutes: 0, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Dynamic courses synchronized with Admin Curriculum & Courses Store
  // Dynamic courses synchronized with Admin Curriculum & Courses Store
  const [coursesList, setCoursesList] = useState<CourseItem[]>(() => {
    const units = schoolStore.getCourseUnits()
    const storeSubjects = schoolStore.getSubjects()

    const customCourses: CourseItem[] = units.map((u) => {
      const matchedSub = storeSubjects.find(
        (s) => s.code.toLowerCase() === u.code.toLowerCase() || s.name.toLowerCase() === u.title.toLowerCase()
      )
      const feeVal = u.fee || matchedSub?.fee || 60
      const catVal = matchedSub?.category || (
        (u.department?.toLowerCase().includes('soft') || u.department?.toLowerCase().includes('python') || u.department?.toLowerCase().includes('cyber') || u.program?.toLowerCase().includes('code') || u.program?.toLowerCase().includes('web') || u.title?.toLowerCase().includes('react')) ? 'Tech & Programming'
        : (u.department?.toLowerCase().includes('lang') || u.department?.toLowerCase().includes('ielts') || u.department?.toLowerCase().includes('kisw') || u.program?.toLowerCase().includes('english') || u.program?.toLowerCase().includes('arabic') || u.program?.toLowerCase().includes('french')) ? 'Languages & Communication'
        : (u.department?.toLowerCase().includes('account') || u.department?.toLowerCase().includes('biz') || u.program?.toLowerCase().includes('tax') || u.program?.toLowerCase().includes('quickbooks')) ? 'Business Tech & Accounting'
        : 'Computer & Digital Skills'
      )

      return {
        id: u.id,
        title: u.title,
        category: catVal,
        tag: `🏛️ ${u.program || u.department || 'Online Course'}`,
        tagColor: '#0f172a',
        duration: u.course_duration || matchedSub?.duration || '3 Months Certificate',
        schedule: u.live_schedule_text || 'Live Online Batches & 24/7 LMS',
        fee: `$${feeVal}`,
        installment: `2 installments of $${Math.ceil(feeVal / 2)}`,
        careerOutcome: u.description || (matchedSub?.description || 'Certified Online Graduate'),
        skills: matchedSub?.careers || u.syllabus_modules?.flatMap((m) => m.topics) || ['Live Interactive Virtual Classes', 'Verified E-Certificate'],
        icon: matchedSub?.icon || '🎨',
        popular: true,
        syllabus: u.syllabus_modules?.map((m, idx) => ({
          week: `Week ${idx + 1}`,
          topic: m.title,
          practicalLab: m.learning_outcomes?.[0] || 'Live online hands-on exercises and project labs.',
        })),
      }
    })

    const subjectCourses: CourseItem[] = storeSubjects
      .filter((s) => !customCourses.some((c) => c.title.toLowerCase().trim() === s.name.toLowerCase().trim() || c.id === s.id))
      .map((s) => ({
        id: s.id,
        title: s.name,
        category: s.category || 'Tech & Programming',
        tag: `🏛️ ${s.department_name || 'Academic Course'}`,
        tagColor: '#0f172a',
        duration: s.duration || '3 Months Certificate',
        schedule: 'Live Online Batches & 24/7 LMS',
        fee: `$${s.fee || 60}`,
        installment: `2 installments of $${Math.ceil((s.fee || 60) / 2)}`,
        careerOutcome: s.description || `${s.name} Certified Specialist`,
        skills: s.careers || ['Live Virtual Classes', 'Verified E-Certificate'],
        icon: s.icon || '💻',
        popular: true,
        syllabus: [
          { week: 'Module 1-2', topic: 'Core Foundations & Interactive Practice', practicalLab: 'Live virtual classroom lab and tools setup.' },
          { week: 'Module 3-4', topic: 'Capstone Lab & Evaluation', practicalLab: 'Online evaluation and certification project.' },
        ],
      }))

    const combined = [...customCourses, ...subjectCourses]
    for (const def of DEFAULT_COURSES_DATA) {
      if (!combined.some((c) => c.title.toLowerCase() === def.title.toLowerCase())) {
        combined.push(def)
      }
    }
    return combined
  })

  // Synchronize immediately on store change, Supabase Cloud fetch, and Realtime event
  useEffect(() => {
    const syncAllSources = async () => {
      // 1. Local storage store units & subjects
      const units = schoolStore.getCourseUnits()
      const storeSubjects = schoolStore.getSubjects()

      const customCourses: CourseItem[] = units.map((u) => {
        const matchedSub = storeSubjects.find(
          (s) => s.code.toLowerCase() === u.code.toLowerCase() || s.name.toLowerCase() === u.title.toLowerCase()
        )
        const feeVal = u.fee || matchedSub?.fee || 60
        const catVal = matchedSub?.category || (
          (u.department?.toLowerCase().includes('soft') || u.department?.toLowerCase().includes('python') || u.department?.toLowerCase().includes('cyber') || u.program?.toLowerCase().includes('code') || u.program?.toLowerCase().includes('web') || u.title?.toLowerCase().includes('react')) ? 'Tech & Programming'
          : (u.department?.toLowerCase().includes('lang') || u.department?.toLowerCase().includes('ielts') || u.department?.toLowerCase().includes('kisw') || u.program?.toLowerCase().includes('english') || u.program?.toLowerCase().includes('arabic') || u.program?.toLowerCase().includes('french')) ? 'Languages & Communication'
          : (u.department?.toLowerCase().includes('account') || u.department?.toLowerCase().includes('biz') || u.program?.toLowerCase().includes('tax') || u.program?.toLowerCase().includes('quickbooks')) ? 'Business Tech & Accounting'
          : 'Computer & Digital Skills'
        )

        return {
          id: u.id,
          title: u.title,
          category: catVal,
          tag: `🏛️ ${u.program || u.department || 'Online Course'}`,
          tagColor: '#0f172a',
          duration: u.course_duration || matchedSub?.duration || '3 Months Certificate',
          schedule: u.live_schedule_text || 'Live Online Batches & 24/7 LMS',
          fee: `$${feeVal}`,
          installment: `2 installments of $${Math.ceil(feeVal / 2)}`,
          careerOutcome: u.description || (matchedSub?.description || 'Certified Online Graduate'),
          skills: matchedSub?.careers || u.syllabus_modules?.flatMap((m) => m.topics) || ['Live Interactive Virtual Classes', 'Verified E-Certificate'],
          icon: matchedSub?.icon || '💻',
          popular: true,
          syllabus: u.syllabus_modules?.map((m, idx) => ({
            week: `Week ${idx + 1}`,
            topic: m.title,
            practicalLab: m.learning_outcomes?.[0] || 'Live online hands-on exercises and project labs.',
          })),
        }
      })

      const subjectCourses: CourseItem[] = storeSubjects
        .filter((s) => !customCourses.some((c) => c.title.toLowerCase().trim() === s.name.toLowerCase().trim() || c.id === s.id))
        .map((s) => ({
          id: s.id,
          title: s.name,
          category: s.category || 'Tech & Programming',
          tag: `🏛️ ${s.department_name || 'Academic Course'}`,
          tagColor: '#0f172a',
          duration: s.duration || '3 Months Certificate',
          schedule: 'Live Online Batches & 24/7 LMS',
          fee: `$${s.fee || 75}`,
          installment: `2 installments of $${Math.ceil((s.fee || 75) / 2)}`,
          careerOutcome: s.description || `${s.name} Certified Specialist`,
          skills: s.careers || ['Live Virtual Classes', 'Verified E-Certificate'],
          icon: s.icon || '💻',
          popular: true,
          syllabus: [
            { week: 'Module 1-2', topic: 'Core Foundations & Interactive Practice', practicalLab: 'Live virtual classroom lab and tools setup.' },
            { week: 'Module 3-4', topic: 'Capstone Lab & Evaluation', practicalLab: 'Online evaluation and certification project.' },
          ],
        }))

      // 2. Supabase Cloud Database courses
      let cloudMapped: CourseItem[] = []
      try {
        const { data: cloudCourses } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
        if (cloudCourses && cloudCourses.length > 0) {
          cloudMapped = cloudCourses.map((c: any) => ({
            id: c.id,
            title: c.title,
            category: (c.title?.toLowerCase().includes('code') || c.title?.toLowerCase().includes('web') || c.title?.toLowerCase().includes('python') || c.title?.toLowerCase().includes('cyber') || c.title?.toLowerCase().includes('software')) ? 'Tech & Programming'
              : (c.title?.toLowerCase().includes('language') || c.title?.toLowerCase().includes('english') || c.title?.toLowerCase().includes('kiswahili') || c.title?.toLowerCase().includes('ielts') || c.title?.toLowerCase().includes('arabic') || c.title?.toLowerCase().includes('french') || c.title?.toLowerCase().includes('german')) ? 'Languages & Communication'
              : (c.title?.toLowerCase().includes('quickbooks') || c.title?.toLowerCase().includes('accounting') || c.title?.toLowerCase().includes('tax')) ? 'Business Tech & Accounting'
              : 'Computer & Digital Skills',
            tag: '🌟 Online Certified Course',
            tagColor: '#0f172a',
            duration: '4 to 8 Weeks',
            schedule: 'Live Online Batches',
            fee: '$75',
            installment: '2 installments of $38',
            careerOutcome: c.description || 'Certified Online Graduate',
            skills: ['Live Zoom Interactive Training', 'Verified E-Certificate'],
            icon: '💻',
            popular: true,
            syllabus: [
              { week: 'Week 1-2', topic: 'Live Interactive Masterclasses', practicalLab: 'Live coding and interactive language sessions.' },
              { week: 'Week 3-4', topic: 'Capstone Practical Project & Exam', practicalLab: 'Online project submission and certification assessment.' },
            ],
          }))
        }
      } catch (err) {
        console.error('Cloud courses load:', err)
      }

      // Merge: Cloud + Local Custom CourseUnits + Local Subjects + Default baseline
      const merged = [...cloudMapped, ...customCourses, ...subjectCourses]
      for (const def of DEFAULT_COURSES_DATA) {
        if (!merged.some((c) => c.title.toLowerCase().trim() === def.title.toLowerCase().trim())) {
          merged.push(def)
        }
      }
      setCoursesList(merged)
    }

    syncAllSources()

    window.addEventListener('storage', syncAllSources)
    window.addEventListener('focus', syncAllSources)
    window.addEventListener('eclat-courses-updated', syncAllSources)

    // Supabase Realtime channel subscription
    const channel = supabase
      .channel('realtime_public_courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        syncAllSources()
      })
      .subscribe()

    return () => {
      window.removeEventListener('storage', syncAllSources)
      window.removeEventListener('focus', syncAllSources)
      window.removeEventListener('eclat-courses-updated', syncAllSources)
      supabase.removeChannel(channel)
    }
  }, [])

  // Interactive Enhancements State
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null)
  const [calcCourseId, setCalcCourseId] = useState<string>('c-comp')
  const [calcPlan, setCalcPlan] = useState<'full' | 'installments'>('full')
  const [certQuery, setCertQuery] = useState<string>('')
  const [certResult, setCertResult] = useState<{
    found: boolean
    studentName?: string
    courseTitle?: string
    completionDate?: string
    certNumber?: string
    status?: string
  } | null>(null)

  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    course: 'Comprehensive Computer Packages & Digital Skills',
    preferredShift: 'Evening (5:30 PM - 7:30 PM)',
    notes: '',
  })

  // Multi-Step Interactive Checkout & Mode of Payment State
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'receipt'>('details')
  const [checkoutPaymentPlan, setCheckoutPaymentPlan] = useState<'full' | 'installment'>('full')
  const [checkoutPaymentMode, setCheckoutPaymentMode] = useState<'card' | 'paybill' | 'kcb_wire'>('card')
  const [cardForm, setCardForm] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvv: '789',
    cardHolder: '',
  })
  const [checkoutRefCode, setCheckoutRefCode] = useState('')
  const [generatedAdmission, setGeneratedAdmission] = useState<{
    studentName: string
    admissionNumber: string
    receiptNumber: string
    courseTitle: string
    amountPaid: number
    totalFee: number
    balanceRemaining: number
    paymentMode: string
    referenceCode: string
    date: string
  } | null>(null)

  const filteredCourses = useMemo(() => {
    let list = coursesList
    if (activeCategory !== 'All') {
      list = list.filter((c) => c.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.careerOutcome.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)) ||
          c.tag.toLowerCase().includes(q)
      )
    }
    return list
  }, [coursesList, activeCategory, searchQuery])

  const selectedCalcCourse = useMemo(() => {
    return coursesList.find((c) => c.id === calcCourseId) || coursesList[0] || DEFAULT_COURSES_DATA[0]
  }, [coursesList, calcCourseId])

  const handleOpenCourseApplication = (course: CourseItem) => {
    setSelectedCourseForModal(course)
    setInquiryForm((prev) => ({ ...prev, course: course.title }))
    setCheckoutStep('details')
    setInquiryModalOpen(true)
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inquiryForm.name.trim() || !inquiryForm.phone.trim()) {
      showToast('⚠️ Please provide your full name and phone number to proceed.')
      return
    }
    setCardForm((prev) => ({ ...prev, cardHolder: prev.cardHolder || inquiryForm.name }))
    setCheckoutStep('payment')
  }

  const handleCompleteEnrollmentAndPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    const selectedCourseObj = coursesList.find((c) => c.title === inquiryForm.course) || coursesList[0]
    const fullFeeNum = Number(selectedCourseObj?.fee?.replace(/[^0-9]/g, '')) || 75
    const installmentFeeNum = Math.round(fullFeeNum / 2)
    const amountToPay = checkoutPaymentPlan === 'full' ? fullFeeNum : installmentFeeNum
    const balanceRemaining = fullFeeNum - amountToPay

    const admNo = `EI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const recNo = `EI-REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const refCode =
      checkoutPaymentMode === 'card'
        ? `CARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        : checkoutRefCode.trim() ||
          (checkoutPaymentMode === 'paybill'
            ? `MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            : `KCB-DEP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)

    const modeLabel =
      checkoutPaymentMode === 'card'
        ? 'Debit / Credit Card (Visa / Mastercard)'
        : checkoutPaymentMode === 'paybill'
        ? `M-Pesa Paybill (${INSTITUTION_CONFIG.bank.paybillNumber} / ${INSTITUTION_CONFIG.bank.accountNumber})`
        : `${INSTITUTION_CONFIG.bank.name} Direct Wire (${INSTITUTION_CONFIG.bank.accountNumber})`

    const todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

    // 1. Record inquiry
    await schoolStore.addInquiry({
      id: `inq-${Date.now()}`,
      visitor_name: inquiryForm.name,
      phone: inquiryForm.phone,
      email: inquiryForm.email,
      purpose: 'New Admission Inquiry',
      program_of_interest: inquiryForm.course,
      notes: `Shift: ${inquiryForm.preferredShift}. Plan: ${checkoutPaymentPlan} ($${amountToPay}). Mode: ${modeLabel}. Ref: ${refCode}`,
      date: todayDate,
      recorded_by: 'Online Admissions & Payment Desk',
      created_at: new Date().toISOString(),
      status: 'Open',
    })

    // 2. Add enrolled student
    await schoolStore.addStudent({
      id: `std-${Date.now()}`,
      admission_number: admNo,
      full_name: inquiryForm.name,
      gender: 'Male',
      dob: '2000-01-01',
      class_id: selectedCourseObj.id,
      class_name: selectedCourseObj.title,
      grade_level: 'Professional Certificate',
      stream: '100% Online Cohort',
      enrollment_date: todayDate,
      admission_date: todayDate,
      status: 'Active',
      guardian: {
        name: inquiryForm.name,
        relationship: 'Guardian',
        phone: inquiryForm.phone,
        email: inquiryForm.email || `${inquiryForm.name.toLowerCase().replace(/\s+/g, '')}@student.${INSTITUTION_CONFIG.domain}`,
      },
      parent_phone: inquiryForm.phone,
      emergency_contact: inquiryForm.phone,
      fee_balance: balanceRemaining,
      term_fee_total: fullFeeNum,
      fee_cleared: balanceRemaining === 0,
      attendance_rate: 100,
      discipline_points: 100,
      merits_count: 0,
      demerits_count: 0,
    })

    // 3. Add receipt & credit account
    await schoolStore.recordPayment({
      id: `rcpt-${Date.now()}`,
      receipt_number: recNo,
      student_id: admNo,
      student_name: inquiryForm.name,
      admission_number: admNo,
      amount: amountToPay,
      amount_paid: amountToPay,
      payment_method: checkoutPaymentMode === 'card' ? 'Card' : checkoutPaymentMode === 'paybill' ? 'Paybill' : 'Bank Transfer',
      reference_code: refCode,
      payment_date: todayDate,
      paid_by: inquiryForm.name,
      recorded_by: 'Online Admissions & Payment Gateway',
      balance_after: balanceRemaining,
      balance_remaining: balanceRemaining,
    })

    // 4. Set generated admission pass
    setGeneratedAdmission({
      studentName: inquiryForm.name,
      admissionNumber: admNo,
      receiptNumber: recNo,
      courseTitle: selectedCourseObj.title,
      amountPaid: amountToPay,
      totalFee: fullFeeNum,
      balanceRemaining,
      paymentMode: modeLabel,
      referenceCode: refCode,
      date: todayDate,
    })

    setCheckoutStep('receipt')
    showToast(`🎉 Tuition verified! Welcome to Éclat Institute, ${inquiryForm.name}!`)
  }

  const handleVerifyCert = (e: React.FormEvent) => {
    e.preventDefault()
    if (!certQuery.trim()) return

    const q = certQuery.trim().toUpperCase()
    const allStudents = schoolStore.getStudents()
    const allUnitRegs = schoolStore.getUnitRegistrations()

    const matchStudent = allStudents.find(
      (s) =>
        s.admission_number.toUpperCase() === q ||
        s.admission_number.toUpperCase().includes(q) ||
        s.full_name.toUpperCase().includes(q) ||
        q.includes(s.admission_number.toUpperCase())
    )

    const matchUnitReg = allUnitRegs.find(
      (r) =>
        r.receipt_number.toUpperCase() === q ||
        r.receipt_number.toUpperCase().includes(q) ||
        r.admission_number.toUpperCase() === q ||
        r.student_name.toUpperCase().includes(q)
    )

    if (matchStudent || matchUnitReg) {
      const studentName = matchStudent?.full_name || matchUnitReg?.student_name || 'Verified Trainee'
      const courseTitle = matchStudent?.class_name || matchUnitReg?.program || 'Vocational Training Program'
      const completionDate = matchStudent?.enrollment_date || matchStudent?.admission_date || matchUnitReg?.registered_at || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      const isCleared = matchStudent ? matchStudent.fee_cleared : matchUnitReg?.fee_clearance_status === 'Cleared'

      setCertResult({
        found: true,
        studentName,
        courseTitle,
        completionDate,
        certNumber: q,
        status: isCleared ? 'Officially Verified & Accredited' : 'Verified (Academic Registry Clear)',
      })
      showToast(`✓ Credential record verified for ${studentName}!`)
    } else {
      setCertResult({
        found: false,
      })
      showToast(`⚠️ No student or certificate record matched "${q}".`)
    }
  }

  const handleLaunchRole = (role: Role) => {
    setShowPortalDesksModal(false)
    navigate(`/login?role=${role}`)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: isMobile ? '#090d16' : '#f8fafc', color: isMobile ? '#f8fafc' : '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <PWAInstallBanner />
      <DesktopCommandPalette />

      {isMobile ? (
        <MobileLandingView
          courses={coursesList}
          timeLeft={timeLeft}
          onOpenInquiry={(title) => {
            if (title) setInquiryForm((prev) => ({ ...prev, course: title }))
            setCheckoutStep('details')
            setInquiryModalOpen(true)
          }}
          onOpenPortals={() => setShowPortalDesksModal(true)}
          onSelectCourse={(c) => setSelectedCourseForModal(c)}
          showToast={showToast}
        />
      ) : (
        <>
          {/* Top Admissions & Quick Contacts Bar */}
          <div
            style={{
              background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '0.45rem 1rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
          <strong>Intake Ongoing:</strong> 15% Early Bird Voucher
        </span>
        <span className="hidden sm:inline" style={{ opacity: 0.8 }}>|</span>
        <span className="hidden sm:inline">
          📞 <strong>{INSTITUTION_CONFIG.contact.phone}</strong>
        </span>
        <span className="hidden md:inline" style={{ opacity: 0.8 }}>|</span>
        <span className="hidden md:inline">
          🏦 {INSTITUTION_CONFIG.bank.name}: <strong>{INSTITUTION_CONFIG.bank.accountNumber}</strong>
        </span>
      </div>

      {/* Main Header / Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.65rem 1rem',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '0.5rem' }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', minWidth: 0, flexShrink: 1 }}>
            <img
              src="/logo.png"
              alt="Éclat Institute Logo"
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4af37', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                ÉCLAT INSTITUTE
              </div>
              <div className="hidden sm:block" style={{ fontSize: '0.68rem', color: '#8c6e28', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                100% Online Live & Cloud LMS
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
            <nav className="desktop-nav-links" style={{ fontSize: '0.92rem', fontWeight: 600 }}>
              <a href="#courses" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>Courses</a>
              <Link to="/library" style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none', transition: 'color 0.2s' }}>📖 E-Library</Link>
              <a href="#why-eclat" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>Why Choose Us</a>
              <a href="#testimonials" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>Graduate Outcomes</a>
              <a href="#intakes" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>Intakes & Fees</a>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
              {/* Direct E-Library Access Button on Desktop Navbar */}
              <Link
                to="/library"
                className="btn btn-sm"
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  fontWeight: 800,
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Access Free Academic E-Library"
              >
                <span>📖</span>
                <span>E-Library</span>
              </Link>

              {!isInstalled && (
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(220, 163, 74, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={promptInstall}
                  title="Install Eclat Institute App on your Phone"
                >
                  <span>📲</span>
                  <span className="hidden xs:inline">App</span>
                </button>
              )}

              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  fontWeight: 700,
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setInquiryModalOpen(true)}
              >
                ⚡ Apply
              </button>

              <button
                type="button"
                className="btn btn-sm btn-primary"
                style={{
                  fontWeight: 700,
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(30, 58, 138, 0.25)',
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setShowPortalDesksModal(true)}
              >
                🔐 Portals
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(ellipse at top center, #1e3a8a 0%, #0f172a 75%, #020617 100%)',
          color: '#ffffff',
          padding: '4.5rem 1.5rem 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Trust Badges */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '999px',
              padding: '0.45rem 1.4rem',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#93c5fd',
              marginBottom: '1.75rem',
            }}
          >
            <span>⭐️⭐️⭐️⭐️⭐️</span> Rated 4.9/5 by 3,500+ Online Students Worldwide
          </div>

          {/* Main Hero Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              lineHeight: 1.15,
              margin: '0 auto 1.5rem',
              maxWidth: '960px',
              color: '#ffffff',
            }}
          >
            Master In-Demand Tech & Global Languages. <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #d4af37 0%, #f5df88 50%, #d4af37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              100% Online • Live Virtual Labs • Global Certification
            </span>
          </h1>

          <p
            style={{
              maxWidth: '820px',
              margin: '0 auto 2.5rem',
              fontSize: '1.2rem',
              color: '#e2e8f0',
              lineHeight: 1.65,
              fontWeight: 500,
            }}
          >
            Kenya & East Africa’s premier virtual institute. Master Software Engineering (React & Node), Python Data Analytics, Cybersecurity, Computer Packages, and World Languages (English, IELTS, Kiswahili, Arabic, French, German) with live interactive classes and 24/7 LMS access!
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <button
              type="button"
              className="btn btn-lg"
              style={{
                background: '#d4af37',
                color: '#0c0e12',
                fontWeight: 800,
                padding: '1rem 2.5rem',
                fontSize: '1.08rem',
                borderRadius: '12px',
                boxShadow: '0 10px 28px rgba(212, 175, 55, 0.4)',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setInquiryModalOpen(true)}
            >
              🚀 Enroll in 100% Online Intake →
            </button>

            <a
              href="#courses"
              className="btn btn-lg"
              style={{
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 800,
                padding: '1rem 2.25rem',
                fontSize: '1.08rem',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                border: 'none',
                textDecoration: 'none',
              }}
            >
              📚 Browse Online Programs
            </a>

            <Link
              to="/library"
              className="btn btn-lg"
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#93c5fd',
                fontWeight: 800,
                padding: '1rem 2.25rem',
                fontSize: '1.08rem',
                borderRadius: '12px',
                border: '1.5px solid rgba(59, 130, 246, 0.5)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📖</span>
              <span>Open Free E-Library</span>
            </Link>

            {!isInstalled && (
              <button
                type="button"
                className="btn btn-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontWeight: 700,
                  padding: '1rem 1.75rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                }}
                onClick={promptInstall}
              >
                📲 Install Web App
              </button>
            )}
          </div>

          {/* Live Intake Countdown Alert */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              maxWidth: '820px',
              margin: '0 auto 2.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', color: '#f5df88', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ 100% ONLINE INTAKE REGISTRATION OPEN
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                Live Virtual Cohorts — Evening & Weekend Interactive Batches
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                🌐 Study from anywhere in Kenya, Africa & Worldwide • 24/7 LMS Access
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ background: '#090d16', border: '1px solid #d4af37', padding: '0.4rem 0.65rem', borderRadius: '8px', textAlign: 'center', minWidth: '48px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#d4af37' }}>{String(timeLeft.days).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Days</div>
              </div>
              <span style={{ fontWeight: 900, color: '#d4af37' }}>:</span>
              <div style={{ background: '#090d16', border: '1px solid #d4af37', padding: '0.4rem 0.65rem', borderRadius: '8px', textAlign: 'center', minWidth: '48px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#d4af37' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Hours</div>
              </div>
              <span style={{ fontWeight: 900, color: '#d4af37' }}>:</span>
              <div style={{ background: '#090d16', border: '1px solid #d4af37', padding: '0.4rem 0.65rem', borderRadius: '8px', textAlign: 'center', minWidth: '48px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#d4af37' }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Mins</div>
              </div>
              <span style={{ fontWeight: 900, color: '#d4af37' }}>:</span>
              <div style={{ background: '#090d16', border: '1px solid #d4af37', padding: '0.4rem 0.65rem', borderRadius: '8px', textAlign: 'center', minWidth: '48px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#22c55e' }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Secs</div>
              </div>
            </div>
          </div>

          {/* Social Proof & Metrics Ribbon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              maxWidth: '1000px',
              margin: '0 auto',
            }}
          >
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#d4af37', lineHeight: 1 }}>100%</div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginTop: '0.35rem' }}>Virtual & Online</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Learn from anywhere, any device</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#34d399', lineHeight: 1 }}>Live</div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginTop: '0.35rem' }}>Interactive Coaching</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time code labs & speaking mocks</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>24/7</div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginTop: '0.35rem' }}>LMS Portal Access</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Class recordings, notes & quizzes</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f5df88', lineHeight: 1 }}>Verified</div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginTop: '0.35rem' }}>Global E-Certificates</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>QR verifiable & LinkedIn ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition / Why Choose Eclat Institute */}
      <section id="why-eclat" style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b45309' }}>
            THE ÉCLAT ONLINE ADVANTAGE
          </span>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.75rem', fontFamily: 'var(--font-heading)' }}>
            Tech & Language Mastery Built for Modern Learners
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#334155', maxWidth: '700px', margin: '0 auto', fontWeight: 500 }}>
            No traffic, no rigid classroom constraints. Master cutting-edge programming frameworks and international languages with live expert mentorship.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.25rem' }}>
              💻
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Live Virtual Coding & Language Labs
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Interactive live screen-sharing, breakout speaking rooms, live GitHub code reviews, and direct instructor feedback on your projects.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.25rem' }}>
              ⏰
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Flexible Evening & Weekend Batches
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Attend live online evening sessions (6:00 PM – 9:30 PM) or weekend masterclasses. Missed a class? Watch HD video replays anytime on the portal.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.25rem' }}>
              📜
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Verified Digital E-Certificates
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Receive cryptographically signed digital certificates with instant QR verification for LinkedIn, remote jobs, and international visa applications.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.25rem' }}>
              💳
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Global Flexible Installments ($ USD)
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Affordable international pricing in US Dollars. Pay tuition seamlessly via Visa, Mastercard, PayPal, Bank Wire, or Mobile Money with 2 to 3 flexible installments.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Short Courses Showcase */}
      <section id="courses" style={{ background: '#ffffff', padding: '5rem 1.5rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b45309' }}>
                ONLINE PROGRAMS DIRECTORY
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0', fontFamily: 'var(--font-heading)' }}>
                Tech & Language Online Programs
              </h2>
              <p style={{ fontSize: '1rem', color: '#64748b', margin: '0.35rem 0 0' }}>
                Select an online course to view live schedules, curriculum breakdown, and career pathways.
              </p>
            </div>

            {/* Live Search Input Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <input
                type="text"
                className="input"
                placeholder="🔍 Search course (e.g. Python, IELTS, React, Excel, Arabic)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.7rem 1rem 0.7rem 2.4rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.9rem',
                  width: '100%',
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills & Result Counter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['All', 'Tech & Programming', 'Creative Design & Arts', 'Languages & Communication', 'Computer & Digital Skills', 'Business Tech & Accounting'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  style={{
                    background: activeCategory === cat ? '#0f172a' : '#f1f5f9',
                    color: activeCategory === cat ? '#d4af37' : '#475569',
                    border: `1px solid ${activeCategory === cat ? '#d4af37' : '#cbd5e1'}`,
                    borderRadius: '999px',
                    padding: '0.5rem 1.15rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Showing <strong style={{ color: '#0f172a' }}>{filteredCourses.length}</strong> available course{filteredCourses.length === 1 ? '' : 's'}
            </div>
          </div>

          {filteredCourses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔎</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>No courses match your search "{searchQuery}"</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Try adjusting your search terms or browse all categories.</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('All')
                }}
              >
                Reset Search Filters
              </button>
            </div>
          )}

          {/* Courses Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: '#ffffff',
                  border: course.popular ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: course.popular ? '0 10px 25px -5px rgba(59, 130, 246, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(0, 0, 0, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = course.popular ? '0 10px 25px -5px rgba(59, 130, 246, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{course.icon}</span>
                    <span
                      style={{
                        background: `${course.tagColor}15`,
                        color: course.tagColor,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        border: `1px solid ${course.tagColor}30`,
                      }}
                    >
                      {course.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', lineHeight: 1.35 }}>
                    {course.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.84rem', color: '#334155', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <span>⏱️ <strong style={{ color: '#0f172a' }}>Duration:</strong> {course.duration}</span>
                    <span>•</span>
                    <span>📅 <strong style={{ color: '#0f172a' }}>Shifts:</strong> {course.schedule}</span>
                  </div>

                  {/* Career Outcome Card */}
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>Target Career Role:</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                      💼 {course.careerOutcome}
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Skills You'll Master:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {course.skills.map((s) => (
                        <span
                          key={s}
                          style={{
                            background: '#eff6ff',
                            color: '#1e40af',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                          }}
                        >
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Practical Syllabus Accordion Toggle */}
                  {course.syllabus && course.syllabus.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <button
                        type="button"
                        style={{
                          background: expandedSyllabusId === course.id ? '#eff6ff' : '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#1e3a8a',
                          cursor: 'pointer',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => setExpandedSyllabusId(expandedSyllabusId === course.id ? null : course.id)}
                      >
                        <span>📋 {expandedSyllabusId === course.id ? 'Hide Practical Modules' : 'View 4-Week Practical Modules'}</span>
                        <span>{expandedSyllabusId === course.id ? '▲' : '▼'}</span>
                      </button>

                      {expandedSyllabusId === course.id && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
                          {course.syllabus.map((mod, idx) => (
                            <div key={idx} style={{ borderBottom: idx !== course.syllabus!.length - 1 ? '1px solid #e2e8f0' : 'none', paddingBottom: '0.4rem' }}>
                              <div style={{ fontWeight: 800, color: '#1e3a8a' }}>{mod.week}: {mod.topic}</div>
                              <div style={{ color: '#475569', marginTop: '2px' }}>🔧 <em>Lab:</em> {mod.practicalLab}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 700 }}>Total Tuition:</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#16a34a' }}>{course.fee}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>{course.installment}</div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      fontWeight: 800,
                      borderRadius: '10px',
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.9rem',
                    }}
                    onClick={() => handleOpenCourseApplication(course)}
                  >
                    Apply Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive M-Pesa Fee Calculator & Admission Estimator */}
      <section style={{ background: '#f1f5f9', padding: '4.5rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
              TRANSPARENT TUITION CALCULATOR
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.5rem' }}>
              Instant M-Pesa Fee & Installment Estimator
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '600px', margin: '0 auto' }}>
              Choose your course and installment structure to view your exact Paybill breakdown before registration.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div>
                <label className="label">1. Select Short Course</label>
                <select
                  className="input"
                  value={calcCourseId}
                  onChange={(e) => setCalcCourseId(e.target.value)}
                  style={{ marginBottom: '1.25rem', fontWeight: 600 }}
                >
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.title} — ({c.fee})
                    </option>
                  ))}
                </select>

                <label className="label">2. Select Payment Schedule</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: calcPlan === 'full' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: calcPlan === 'full' ? '#eff6ff' : '#ffffff',
                      color: calcPlan === 'full' ? '#1e3a8a' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                    }}
                    onClick={() => setCalcPlan('full')}
                  >
                    ✓ 1 Full Payment
                    <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px' }}>Instant Clearance</div>
                  </button>

                  <button
                    type="button"
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: calcPlan === 'installments' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: calcPlan === 'installments' ? '#eff6ff' : '#ffffff',
                      color: calcPlan === 'installments' ? '#1e3a8a' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                    }}
                    onClick={() => setCalcPlan('installments')}
                  >
                    💳 2 Installments
                    <div style={{ fontSize: '0.72rem', color: '#2563eb', marginTop: '2px' }}>50% on Intake Day</div>
                  </button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', fontSize: '0.82rem', color: '#334155' }}>
                  <div>⏱️ <strong>Course Duration:</strong> {selectedCalcCourse.duration}</div>
                  <div>📅 <strong>Timetable Shifts:</strong> {selectedCalcCourse.schedule}</div>
                  <div>💼 <strong>Career Outcome:</strong> {selectedCalcCourse.careerOutcome}</div>
                </div>
              </div>

              {/* Live Fee Calculation Output Card */}
              <div style={{ background: '#0f172a', color: '#ffffff', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 800 }}>Payment Summary</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0 1rem' }}>
                    {selectedCalcCourse.title}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.85rem', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                      <span>Total Course Fee:</span>
                      <strong style={{ color: '#4ade80' }}>{selectedCalcCourse.fee}</strong>
                    </div>

                    {calcPlan === 'full' ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#cbd5e1' }}>
                        <span>Amount Due at Registration:</span>
                        <strong style={{ color: '#ffffff' }}>{selectedCalcCourse.fee}</strong>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                          <span>1st Installment (Admission):</span>
                          <strong style={{ color: '#ffffff' }}>{selectedCalcCourse.installment.split('of')[1] || selectedCalcCourse.installment}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#94a3b8' }}>
                          <span>2nd Installment (Mid-Course):</span>
                          <strong style={{ color: '#cbd5e1' }}>{selectedCalcCourse.installment.split('of')[1] || selectedCalcCourse.installment}</strong>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    <div>🏦 <strong>Bank:</strong> {INSTITUTION_CONFIG.bank.name} (Acc: <span style={{ color: '#67e8f9', fontWeight: 800 }}>{INSTITUTION_CONFIG.bank.accountNumber}</span>)</div>
                    <div>📱 <strong>Paybill:</strong> {INSTITUTION_CONFIG.bank.paybillNumber} (Account: {INSTITUTION_CONFIG.bank.accountNumber})</div>
                    <div>💳 <strong>Card:</strong> Visa / Mastercard Accepted</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-full mt-4"
                  style={{ fontWeight: 800, padding: '0.75rem', borderRadius: '10px' }}
                  onClick={() => handleOpenCourseApplication(selectedCalcCourse)}
                >
                  🚀 Apply for {selectedCalcCourse.title.split('&')[0]} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Graduate Success Stories & Reviews */}
      <section id="testimonials" style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
            PROVEN RESULTS
          </span>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.75rem' }}>
            Real Alumni. Real Career Transformations.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#1e293b', maxWidth: '650px', margin: '0 auto', fontWeight: 500 }}>
            See how our practical training model helped students land rewarding jobs and scale their professional careers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '18px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              }}
            >
              <div>
                <div style={{ color: '#f59e0b', fontSize: '1.1rem', marginBottom: '1rem' }}>
                  {'★'.repeat(t.rating)}
                </div>
                <p style={{ fontSize: '0.98rem', color: '#0f172a', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.5rem', fontWeight: 500 }}>
                  "{t.quote}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 700 }}>{t.role}</div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>Graduate • {t.course}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works: 3 Steps to Certification */}
      <section style={{ background: '#0f172a', color: '#ffffff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#60a5fa' }}>
            SIMPLE & TRANSPARENT PROCESS
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0 3rem' }}>
            Your 3-Step Journey to Professional Success
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase' }}>Step 1</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0 0.5rem', color: '#ffffff' }}>Apply Online in 60s</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                Choose your short course and timetable shift. Our Admissions Registrar will reach out to confirm your admission calling letter.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💻</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>Step 2</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0 0.5rem', color: '#ffffff' }}>Intensive Practical Training</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                Attend interactive live video sessions and global project breakout rooms. Build real-world portfolio projects under active industry mentorship.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>Step 3</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0 0.5rem', color: '#ffffff' }}>Certification & Job Search</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                Receive your accredited certificate, get your CV polished by our career team, and connect directly with hiring companies.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '3.5rem' }}>
            <button
              type="button"
              className="btn btn-lg"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
                border: 'none',
              }}
              onClick={() => setInquiryModalOpen(true)}
            >
              Start Your Application Today →
            </button>
          </div>
        </div>
      </section>

      {/* Intakes, Global Payment & Admissions Section */}
      <section id="intakes" style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Global Payment Card */}
          <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#ffffff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 25px rgba(5, 150, 105, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>💳</span>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>International Tuition Payment Guide</h3>
                <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>Instant automated digital invoices & receipts</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '1.25rem', marginTop: '1.5rem', lineHeight: 1.8 }}>
              <div>🌐 <strong>Currency:</strong> <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>USD ($)</span> (or local equivalent)</div>
              <div>💳 <strong>Card Payment:</strong> Debit / Credit Card (Visa & Mastercard)</div>
              <div>🏦 <strong>Bank Wire / Direct Deposit:</strong> {INSTITUTION_CONFIG.bank.name} • Acc: <span style={{ fontWeight: 900, color: '#fef08a' }}>{INSTITUTION_CONFIG.bank.accountNumber}</span></div>
              <div>📱 <strong>M-Pesa Paybill:</strong> Business No: <strong style={{ color: '#ffffff' }}>{INSTITUTION_CONFIG.bank.paybillNumber}</strong> • Account: <strong style={{ color: '#fef08a' }}>{INSTITUTION_CONFIG.bank.accountNumber}</strong></div>
              <div>📑 <strong>Reference:</strong> Student Full Name or Admission ID</div>
              <div>💰 <strong>Installment Plan:</strong> Available in 2 to 3 flexible parts</div>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#d1fae5', marginTop: '1.25rem', margin: '1.25rem 0 0' }}>
              * Official stamped digital receipts are issued instantly by the Bursar Desk upon payment confirmation.
            </p>
          </div>

          {/* Virtual Admissions & Support Desk Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>🌐</span>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Online Admissions & Virtual Support</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Live Zoom Classes • 24/7 Digital Learning Portal</div>
              </div>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, marginTop: '1.25rem' }}>
              <div>💻 <strong>Delivery Mode:</strong> 100% Online (Live Interactive Video + LMS Modules)</div>
              <div>🕒 <strong>Live Class Shifts:</strong> Morning (9:00 AM) | Evening (6:00 PM - 9:30 PM) | Weekends</div>
              <div>📞 <strong>Admissions Hotline:</strong> {INSTITUTION_CONFIG.contact.phone}</div>
              <div>✉️ <strong>Direct Inquiries:</strong> {INSTITUTION_CONFIG.contact.email}</div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-4"
              style={{ fontWeight: 700 }}
              onClick={() => alert(`Online Class Orientation: Call or WhatsApp ${INSTITUTION_CONFIG.contact.phone} to receive a guest Zoom link for a free live class demo!`)}
            >
              🎥 Request Free Live Class Demo
            </button>
          </div>
        </div>
      </section>

      {/* Online Certificate Verification Tool */}
      <section style={{ background: '#090d16', color: '#f8fafc', padding: '4.5rem 1.5rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
            OFFICIAL CREDENTIALS
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0 0.5rem' }}>
            Instant Graduate Certificate Verification
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Employers, embassies, and academic institutions in Kenya, the Middle East, and worldwide can instantly verify authentic Eclat Institute credentials.
          </p>

          <form onSubmit={handleVerifyCert} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <input
              type="text"
              className="input"
              style={{ maxWidth: '400px', background: '#0f172a', border: '1.5px solid #334155', color: '#ffffff', fontSize: '0.95rem' }}
              placeholder="Enter Certificate Serial (e.g. EI-2026-089)"
              value={certQuery}
              onChange={(e) => setCertQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontWeight: 800, padding: '0.75rem 1.5rem', borderRadius: '10px' }}
            >
              🔍 Verify Certificate
            </button>
          </form>

          {certResult && (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
              {certResult.found ? (
                <div style={{ background: '#0f291e', border: '1.5px solid #22c55e', borderRadius: '14px', padding: '1.5rem', color: '#f0fdf4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>🛡️</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 800 }}>Official Verification Confirmation</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>Authentic Eclat Institute Credential</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.75rem', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    <div>🎓 <strong>Graduate Name:</strong> {certResult.studentName}</div>
                    <div>📜 <strong>Awarded Qualification:</strong> {certResult.courseTitle}</div>
                    <div>🗓️ <strong>Completion Date:</strong> {certResult.completionDate}</div>
                    <div>🔢 <strong>Certificate Reference:</strong> <span style={{ color: '#fde047', fontWeight: 800 }}>{certResult.certNumber}</span></div>
                    <div>🌐 <strong>Delivery Format:</strong> 100% Online (Verified Digital Credential)</div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#450a0a', border: '1.5px solid #ef4444', borderRadius: '14px', padding: '1.25rem', color: '#fef2f2', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>⚠️</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>No Certificate Record Found</div>
                  <div style={{ fontSize: '0.84rem', color: '#fca5a5', marginTop: '0.25rem' }}>
                    Please check the certificate serial number or contact the Academic Registrar at <span style={{ color: '#ffffff' }}>{INSTITUTION_CONFIG.contact.admissionsEmail}</span>.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Desktop Footer */}
      <footer style={{ background: '#090d16', color: '#cbd5e1', padding: '4rem 1.5rem 2.5rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand & Overview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <img src="/logo.png" alt="Éclat Institute Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #d4af37' }} />
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>ÉCLAT INSTITUTE</span>
                <div style={{ fontSize: '0.75rem', color: '#d4af37', fontWeight: 700 }}>100% ONLINE TECH & LANGUAGES</div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#cbd5e1', marginBottom: '1.25rem' }}>
              Kenya & East Africa’s premier virtual institute. Live online interactive coaching in Full-Stack Software Engineering, Python Data Analytics, Cybersecurity, Computer Packages, IELTS Exam Prep, English Fluency, Arabic, French, and German.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#131b2e', border: '1px solid #2e3d61', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
              <span>🛡️ Verified Global Online Certifications</span>
            </div>
          </div>

          {/* Online Programs Directory */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '2px solid #d4af37', paddingBottom: '0.4rem', display: 'inline-block' }}>
              Online Tech & Language Programs
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>💻 Full-Stack Web Development (React 19 & Node.js)</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>📊 Python Programming & Data Analytics</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>⚡ Comprehensive Computer Packages & Digital Literacy</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>🛡️ Cybersecurity Fundamentals & Network Defense</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>📈 Computerized Accounting (QuickBooks & iTax)</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>🎓 IELTS Exam Preparation (Target Band 7.5 - 9.0)</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>🗣️ English Language Mastery & Public Speaking</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>🌴 Arabic, French & German Diplomas</a>
            </div>
          </div>

          {/* Tuition Payment Details */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '2px solid #16a34a', paddingBottom: '0.4rem', display: 'inline-block' }}>
              International Tuition & Payments
            </h4>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#cbd5e1' }}>
              <div style={{ background: '#0f291e', border: '1px solid #16a34a', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.9rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 700 }}>Global Multi-Currency Billing</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4ade80', letterSpacing: '0.03em', margin: '2px 0' }}>USD ($) Accepted</div>
                <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                  Cards, PayPal, Bank Wire & Mobile Money
                </div>
              </div>
              <div style={{ marginBottom: '0.35rem' }}>💳 <span style={{ color: '#94a3b8' }}>Cards:</span> <strong style={{ color: '#f8fafc' }}>Visa & Mastercard</strong></div>
              <div style={{ marginBottom: '0.35rem' }}>🌐 <span style={{ color: '#94a3b8' }}>Online:</span> <strong style={{ color: '#f8fafc' }}>PayPal, Stripe & Wire Transfer</strong></div>
              <div style={{ marginBottom: '0.35rem' }}>💰 <span style={{ color: '#94a3b8' }}>Installments:</span> <strong style={{ color: '#f8fafc' }}>2–3 flexible parts accepted</strong></div>
              <div>📜 <span style={{ color: '#94a3b8' }}>Receipts:</span> <strong style={{ color: '#f8fafc' }}>Official digital receipts with QR</strong></div>
            </div>
          </div>

          {/* Virtual Admissions & Support */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '2px solid #ea580c', paddingBottom: '0.4rem', display: 'inline-block' }}>
              Virtual Admissions & Support
            </h4>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#cbd5e1' }}>
              <div style={{ marginBottom: '0.35rem' }}>🌐 <span style={{ color: '#94a3b8' }}>Delivery:</span> <strong style={{ color: '#f8fafc' }}>{INSTITUTION_CONFIG.tagline} (Worldwide)</strong></div>
              <div style={{ marginBottom: '0.35rem' }}>📞 <span style={{ color: '#94a3b8' }}>Phone:</span> <strong style={{ color: '#f8fafc' }}>{INSTITUTION_CONFIG.contact.phone}</strong></div>
              <div style={{ marginBottom: '0.35rem' }}>💬 <span style={{ color: '#94a3b8' }}>WhatsApp:</span> <strong style={{ color: '#f8fafc' }}>{INSTITUTION_CONFIG.contact.phone}</strong></div>
              <div style={{ marginBottom: '0.5rem' }}>✉️ <span style={{ color: '#94a3b8' }}>Email:</span> <a href={`mailto:${INSTITUTION_CONFIG.contact.admissionsEmail}`} style={{ color: '#93c5fd', textDecoration: 'underline' }}>{INSTITUTION_CONFIG.contact.admissionsEmail}</a></div>
              
              <div style={{ marginTop: '0.75rem', padding: '0.7rem 0.9rem', background: '#131b2e', border: '1px solid #2e3d61', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ color: '#fcd34d', fontWeight: 700, marginBottom: '0.25rem' }}>🕒 Online Learning & Support:</div>
                <div style={{ color: '#e2e8f0' }}>• Cloud LMS Portal: <strong>24/7 Unlimited Access</strong></div>
                <div style={{ color: '#e2e8f0' }}>• Live Batches: <strong>Morning, Evening & Weekends</strong></div>
                <div style={{ color: '#86efac' }}>• Student Support: <strong>Daily Virtual Desk</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', maxWidth: '1280px', margin: '0 auto' }}>
          <div>
            © {new Date().getFullYear()} <strong style={{ color: '#e2e8f0' }}>Éclat Institute</strong>. All Rights Reserved. Shaping Minds, Inspiring Practical Success.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#93c5fd' }}>🌐 100% Online Global Academy</span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, fontSize: '0.82rem', padding: '0.4rem 1rem' }}
              onClick={() => setShowPortalDesksModal(true)}
            >
              🔐 Staff & Student Portals
            </button>
          </div>
        </div>
      </footer>
      </>
      )}

      {/* ============================================================
          GLOBAL RESPONSIVE MODALS (Mobile & Desktop)
          ============================================================ */}

      {/* 1. Interactive Course Admission & Payment Checkout Desk Modal */}
      {inquiryModalOpen && (
        <div className="modal-overlay" onClick={() => setInquiryModalOpen(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal Header & Step Indicator */}
            <div className="modal-header" style={{ padding: 0, paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🎓</span>
                  <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a', margin: 0 }}>
                    {checkoutStep === 'details' && 'Step 1: Student Admission Details'}
                    {checkoutStep === 'payment' && 'Step 2: Select Mode of Payment & Settle Tuition'}
                    {checkoutStep === 'receipt' && 'Step 3: Official Stamped Tuition Receipt & Clearance Pass'}
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  {checkoutStep === 'details' && 'Enter your details and select your preferred online live class schedule.'}
                  {checkoutStep === 'payment' && 'Choose your payment plan (Full or 50% Installment) and preferred payment mode.'}
                  {checkoutStep === 'receipt' && 'Your seat is confirmed and your official credential record has been created.'}
                </p>
              </div>
              <button type="button" className="modal-close" onClick={() => setInquiryModalOpen(false)}>✕</button>
            </div>

            {/* Step Progress Tracker */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: checkoutStep === 'details' ? 800 : 600, color: checkoutStep === 'details' ? '#2563eb' : '#64748b' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: checkoutStep === 'details' ? '#2563eb' : '#cbd5e1', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>1</span>
                <span>Trainee Details</span>
              </div>
              <div style={{ color: '#cbd5e1' }}>→</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: checkoutStep === 'payment' ? 800 : 600, color: checkoutStep === 'payment' ? '#2563eb' : '#64748b' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: checkoutStep === 'payment' ? '#2563eb' : checkoutStep === 'receipt' ? '#16a34a' : '#cbd5e1', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>2</span>
                <span>Mode of Payment</span>
              </div>
              <div style={{ color: '#cbd5e1' }}>→</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: checkoutStep === 'receipt' ? 800 : 600, color: checkoutStep === 'receipt' ? '#16a34a' : '#64748b' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: checkoutStep === 'receipt' ? '#16a34a' : '#cbd5e1', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>3</span>
                <span>Official Receipt</span>
              </div>
            </div>

            {/* STEP 1: STUDENT DETAILS */}
            {checkoutStep === 'details' && (
              <form onSubmit={handleProceedToPayment}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label className="label" style={{ fontSize: '0.82rem' }}>Your Full Name *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="e.g. John Doe / Fatuma Ali"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label className="label" style={{ fontSize: '0.82rem' }}>Phone / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        className="input"
                        placeholder="07XX XXX XXX / +1..."
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label" style={{ fontSize: '0.82rem' }}>Email Address (For Zoom Class Links)</label>
                      <input
                        type="email"
                        className="input"
                        placeholder="yourname@email.com"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label" style={{ fontSize: '0.82rem' }}>Selected Short Course *</label>
                    <select
                      className="input"
                      value={inquiryForm.course}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, course: e.target.value })}
                    >
                      {coursesList.map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title} ({c.duration} — {c.fee})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label" style={{ fontSize: '0.82rem' }}>Preferred Live Class Timetable Shift</label>
                    <select
                      className="input"
                      value={inquiryForm.preferredShift}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, preferredShift: e.target.value })}
                    >
                      <option value="Morning Batch (8:30 AM - 11:30 AM)">Morning Batch (8:30 AM - 11:30 AM)</option>
                      <option value="Afternoon Batch (2:00 PM - 5:00 PM)">Afternoon Batch (2:00 PM - 5:00 PM)</option>
                      <option value="Evening Executive Batch (5:30 PM - 7:30 PM)">Evening Executive Batch (5:30 PM - 7:30 PM)</option>
                      <option value="Saturday Intensive Masterclass (8:30 AM - 4:30 PM)">Saturday Intensive Masterclass (8:30 AM - 4:30 PM)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setInquiryModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
                    Continue to Mode of Payment →
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PAYMENT PLAN & MODE OF PAYMENT */}
            {checkoutStep === 'payment' && (
              <form onSubmit={handleCompleteEnrollmentAndPayment}>
                {/* Course Summary Box */}
                {(() => {
                  const courseObj = coursesList.find((c) => c.title === inquiryForm.course) || coursesList[0]
                  const fullAmount = Number(courseObj?.fee?.replace(/[^0-9]/g, '')) || 75
                  const instAmount = Math.round(fullAmount / 2)
                  const selectedAmount = checkoutPaymentPlan === 'full' ? fullAmount : instAmount
                  const remainingBal = fullAmount - selectedAmount

                  return (
                    <div>
                      {/* Plan Selection Cards */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label className="label" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>Select Tuition Payment Structure:</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div
                            onClick={() => setCheckoutPaymentPlan('full')}
                            style={{
                              border: `2px solid ${checkoutPaymentPlan === 'full' ? '#2563eb' : '#e2e8f0'}`,
                              background: checkoutPaymentPlan === 'full' ? '#eff6ff' : '#ffffff',
                              borderRadius: '10px',
                              padding: '0.85rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.88rem', color: '#1e3a8a' }}>Full Payment (100%)</strong>
                              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>Cleared ✓</span>
                            </div>
                            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>
                              ${fullAmount} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>USD</span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Immediate 100% course clearance</div>
                          </div>

                          <div
                            onClick={() => setCheckoutPaymentPlan('installment')}
                            style={{
                              border: `2px solid ${checkoutPaymentPlan === 'installment' ? '#2563eb' : '#e2e8f0'}`,
                              background: checkoutPaymentPlan === 'installment' ? '#eff6ff' : '#ffffff',
                              borderRadius: '10px',
                              padding: '0.85rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.88rem', color: '#1e3a8a' }}>2-Part Installment</strong>
                              <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>50% Deposit</span>
                            </div>
                            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>
                              ${instAmount} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>USD</span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Balance of ${remainingBal} due mid-course</div>
                          </div>
                        </div>
                      </div>

                      {/* Mode of Payment Selector */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label className="label" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>Choose Mode of Payment:</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setCheckoutPaymentMode('card')}
                            style={{
                              padding: '0.65rem 0.5rem',
                              border: `1.5px solid ${checkoutPaymentMode === 'card' ? '#2563eb' : '#cbd5e1'}`,
                              background: checkoutPaymentMode === 'card' ? '#1e3a8a' : '#ffffff',
                              color: checkoutPaymentMode === 'card' ? '#ffffff' : '#1e293b',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>💳</span>
                            <span>Credit / Debit Card</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCheckoutPaymentMode('paybill')}
                            style={{
                              padding: '0.65rem 0.5rem',
                              border: `1.5px solid ${checkoutPaymentMode === 'paybill' ? '#2563eb' : '#cbd5e1'}`,
                              background: checkoutPaymentMode === 'paybill' ? '#1e3a8a' : '#ffffff',
                              color: checkoutPaymentMode === 'paybill' ? '#ffffff' : '#1e293b',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>📱</span>
                            <span>M-Pesa Paybill</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCheckoutPaymentMode('kcb_wire')}
                            style={{
                              padding: '0.65rem 0.5rem',
                              border: `1.5px solid ${checkoutPaymentMode === 'kcb_wire' ? '#2563eb' : '#cbd5e1'}`,
                              background: checkoutPaymentMode === 'kcb_wire' ? '#1e3a8a' : '#ffffff',
                              color: checkoutPaymentMode === 'kcb_wire' ? '#ffffff' : '#1e293b',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>🏦</span>
                            <span>KCB Bank Wire</span>
                          </button>
                        </div>
                      </div>

                      {/* Payment Mode Specific Body */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                        {checkoutPaymentMode === 'card' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.85rem', color: '#1e3a8a' }}>💳 Visa / Mastercard Secure Checkout</strong>
                              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800 }}>🔒 256-Bit SSL Encrypted</span>
                            </div>
                            <div>
                              <label className="label" style={{ fontSize: '0.78rem' }}>Cardholder Name</label>
                              <input
                                type="text"
                                required
                                className="input"
                                placeholder="Name as printed on card"
                                value={cardForm.cardHolder || inquiryForm.name}
                                onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                              />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}>
                              <div>
                                <label className="label" style={{ fontSize: '0.78rem' }}>Card Number</label>
                                <input
                                  type="text"
                                  required
                                  className="input"
                                  placeholder="4000 1234 5678 9010"
                                  value={cardForm.cardNumber}
                                  onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="label" style={{ fontSize: '0.78rem' }}>Expiry</label>
                                <input
                                  type="text"
                                  required
                                  className="input"
                                  placeholder="MM/YY"
                                  value={cardForm.cardExpiry}
                                  onChange={(e) => setCardForm({ ...cardForm, cardExpiry: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="label" style={{ fontSize: '0.78rem' }}>CVC / CVV</label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  required
                                  className="input"
                                  placeholder="123"
                                  value={cardForm.cardCvv}
                                  onChange={(e) => setCardForm({ ...cardForm, cardCvv: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {checkoutPaymentMode === 'paybill' && (
                          <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                            <strong style={{ color: '#1e3a8a', fontSize: '0.88rem' }}>📱 M-Pesa Paybill Instructions:</strong>
                            <ol style={{ paddingLeft: '1.25rem', margin: '0.35rem 0 0.75rem', lineHeight: 1.6 }}>
                              <li>Open <strong>M-PESA → Lipa na M-PESA → Paybill</strong></li>
                              <li>Enter Business No: <strong style={{ color: '#2563eb' }}>{INSTITUTION_CONFIG.bank.paybillNumber}</strong> *({INSTITUTION_CONFIG.bank.name})*</li>
                              <li>Enter Account No: <strong style={{ color: '#2563eb' }}>{INSTITUTION_CONFIG.bank.accountNumber}</strong></li>
                              <li>Enter Amount: <strong>${selectedAmount} USD</strong> (or local KES equivalent)</li>
                            </ol>
                            <div>
                              <label className="label" style={{ fontSize: '0.78rem' }}>M-Pesa Transaction Reference Code</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g. SH78XQ29L"
                                value={checkoutRefCode}
                                onChange={(e) => setCheckoutRefCode(e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {checkoutPaymentMode === 'kcb_wire' && (
                          <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                            <strong style={{ color: '#1e3a8a', fontSize: '0.88rem' }}>🏦 Official {INSTITUTION_CONFIG.bank.name} Wire / Deposit Details:</strong>
                            <div style={{ margin: '0.35rem 0 0.75rem', lineHeight: 1.6, background: '#ffffff', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <div>• Bank: <strong>{INSTITUTION_CONFIG.bank.name}</strong></div>
                              <div>• Account No: <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>{INSTITUTION_CONFIG.bank.accountNumber}</strong></div>
                              <div>• Account Name: <strong>{INSTITUTION_CONFIG.bank.accountName}</strong></div>
                            </div>
                            <div>
                              <label className="label" style={{ fontSize: '0.78rem' }}>Bank Slip / Wire Reference Code</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g. KCB-TRANS-9812"
                                value={checkoutRefCode}
                                onChange={(e) => setCheckoutRefCode(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCheckoutStep('details')}>
                          ← Back to Details
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ fontWeight: 800, padding: '0.5rem 1.25rem' }}>
                          ✓ Authorize & Issue Admission Pass (${selectedAmount} USD) →
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </form>
            )}

            {/* STEP 3: OFFICIAL STAMPED DIGITAL RECEIPT */}
            {checkoutStep === 'receipt' && generatedAdmission && (
              <div>
                <div style={{ background: '#ffffff', border: '2px solid #d4af37', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
                  {/* Receipt Header */}
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <img src="/logo.png" alt={INSTITUTION_CONFIG.name} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #d4af37' }} />
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e3a8a', margin: '0.25rem 0 2px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{INSTITUTION_CONFIG.name}</h2>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>{INSTITUTION_CONFIG.tagline} • {INSTITUTION_CONFIG.domain}</div>
                    <div style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, marginTop: '4px' }}>
                      OFFICIAL TUITION PAYMENT RECEIPT & ADMISSION PASS (ORIGINAL)
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div><strong>Receipt #:</strong> <span style={{ color: '#1e3a8a', fontWeight: 800 }}>{generatedAdmission.receiptNumber}</span></div>
                      <div><strong>Student Name:</strong> {generatedAdmission.studentName}</div>
                      <div><strong>Admission ID:</strong> <span style={{ fontWeight: 800, color: '#2563eb' }}>{generatedAdmission.admissionNumber}</span></div>
                    </div>
                    <div>
                      <div><strong>Date:</strong> {generatedAdmission.date}</div>
                      <div><strong>Course:</strong> {generatedAdmission.courseTitle}</div>
                      <div><strong>Payment Mode:</strong> <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{generatedAdmission.paymentMode}</span></div>
                    </div>
                  </div>

                  {/* Amount Paid Box */}
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>TUITION AMOUNT PAID:</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a' }}>${generatedAdmission.amountPaid} USD</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#475569' }}>
                      <div>Balance Due: <strong>${generatedAdmission.balanceRemaining} USD</strong></div>
                      <div style={{ color: generatedAdmission.balanceRemaining === 0 ? '#16a34a' : '#ea580c', fontWeight: 800 }}>
                        {generatedAdmission.balanceRemaining === 0 ? 'STATUS: FULLY CLEARED ✓' : 'STATUS: 1ST INSTALLMENT CLEARED ✓'}
                      </div>
                    </div>
                  </div>

                  {/* Digital Stamp */}
                  <div style={{ border: '1px dashed #94a3b8', borderRadius: '6px', padding: '0.5rem', textAlign: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                    🛡️ Verified Transaction Ref: <code>{generatedAdmission.referenceCode}</code> • {INSTITUTION_CONFIG.name} Directorate of Finance
                  </div>
                </div>

                {/* Receipt Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                    🖨️ Print Stamped Receipt
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={getWhatsAppInquiryUrl(`Hello ${INSTITUTION_CONFIG.name}! My name is ${generatedAdmission.studentName} (Adm: ${generatedAdmission.admissionNumber}). I have completed my tuition payment of $${generatedAdmission.amountPaid} for ${generatedAdmission.courseTitle}. Please send my live class schedule.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{ background: '#22c55e', color: '#ffffff', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>💬</span> WhatsApp Admissions
                    </a>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleLaunchRole('student')}
                      style={{ fontWeight: 800 }}
                    >
                      🎓 Enter Student Portal →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. College Portals & Management Desks Modal */}
      {showPortalDesksModal && (
        <div className="modal-overlay" onClick={() => setShowPortalDesksModal(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <div className="modal-header" style={{ padding: 0, paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #cbd5e1' }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a' }}>
                  🔐 College Portals & Management Workstations
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '0.25rem 0 0', fontWeight: 500 }}>
                  Select your role to access your personalized workstation:
                </p>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowPortalDesksModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div
                onClick={() => handleLaunchRole('student')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1.6rem' }}>🎓</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.95rem' }}>Student & Trainee Portal</div>
                  <div style={{ fontSize: '0.78rem', color: '#334155' }}>Access registered units, video lessons & timetable</div>
                </div>
              </div>

              <div
                onClick={() => handleLaunchRole('teacher')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1.6rem' }}>👩‍🏫</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#d97706', fontSize: '0.95rem' }}>Faculty & HOD Portal</div>
                  <div style={{ fontSize: '0.78rem', color: '#334155' }}>Upload video tutorials, grade books & lab assignments</div>
                </div>
              </div>

              <div
                onClick={() => handleLaunchRole('parent')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1.6rem' }}>👨‍👩‍👧</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>Parent & Sponsor Portal</div>
                  <div style={{ fontSize: '0.78rem', color: '#334155' }}>Track student fee statements, attendance & academic reports</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
              <Link to="/login" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>
                Go to Standard Login →
              </Link>
              <Link to="/login?role=admin" style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'underline' }}>
                🔐 Staff Access
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Course Syllabus & Practical Lab Breakdown Modal */}
      {selectedCourseForModal && (
        <div className="modal-overlay" onClick={() => setSelectedCourseForModal(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem', borderRadius: '16px', maxHeight: '88vh' }}>
            <div className="modal-header" style={{ padding: 0, paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{selectedCourseForModal.icon}</span>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: selectedCourseForModal.tagColor, textTransform: 'uppercase' }}>
                    {selectedCourseForModal.tag}
                  </div>
                  <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a', margin: '2px 0 0' }}>
                    {selectedCourseForModal.title}
                  </h3>
                </div>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedCourseForModal(null)}>✕</button>
            </div>

            {/* Course Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Duration & Shift</div>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px', fontSize: '0.9rem' }}>⏱️ {selectedCourseForModal.duration}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>{selectedCourseForModal.schedule}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Tuition Fee</div>
                <div style={{ fontWeight: 900, color: '#16a34a', marginTop: '2px', fontSize: '1.15rem' }}>{selectedCourseForModal.fee}</div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>{selectedCourseForModal.installment}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Learning Format</div>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px', fontSize: '0.88rem' }}>🌐 100% Online</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>Live Zoom & 24/7 LMS</div>
              </div>
            </div>

            {/* Key Skills Covered */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem' }}>
                🎯 Core Practical Competencies & Tools Covered:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedCourseForModal.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Week by Week Syllabus */}
            {selectedCourseForModal.syllabus && selectedCourseForModal.syllabus.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.65rem' }}>
                  📚 Week-by-Week Practical Lab Breakdown:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {selectedCourseForModal.syllabus.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        borderLeft: '4px solid #2563eb',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ color: '#1e3a8a', fontSize: '0.85rem' }}>{s.week}: {s.topic}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                        🧪 <strong>Lab Practical:</strong> {s.practicalLab}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Outcomes */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#166534' }}>
              💼 <strong>Target Career Outcomes:</strong> {selectedCourseForModal.careerOutcome}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <a
                href={getWhatsAppInquiryUrl(`Hello ${INSTITUTION_CONFIG.name}! I want to inquire about enrolling in ${selectedCourseForModal.title} online.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '0.65rem 1.25rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                }}
              >
                <span>💬</span> WhatsApp Consultation
              </a>

              <button
                type="button"
                className="btn btn-primary"
                style={{ fontWeight: 800, fontSize: '0.85rem', padding: '0.65rem 1.5rem', borderRadius: '8px' }}
                onClick={() => {
                  setInquiryForm((prev) => ({ ...prev, course: selectedCourseForModal.title }))
                  setSelectedCourseForModal(null)
                  setCheckoutStep('details')
                  setInquiryModalOpen(true)
                }}
              >
                💳 Enroll & Pay Online →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#090d16',
            color: '#ffffff',
            border: '1px solid #2563eb',
            borderRadius: '12px',
            padding: '12px 24px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 900, marginLeft: '8px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile-Native Bottom App Bar */}
      <MobileAppBottomNav />
    </div>
  )
}
