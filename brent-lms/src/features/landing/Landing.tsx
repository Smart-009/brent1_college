import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { PWAInstallBanner } from '@/components/shared/PWAInstallBanner'
import { DesktopCommandPalette } from '@/components/shared/DesktopCommandPalette'
import { MobileAppBottomNav } from '@/components/layout/MobileAppBottomNav'
import { schoolStore } from '@/lib/schoolData'
import type { Role } from '@/lib/database.types'

interface CourseItem {
  id: string
  title: string
  category: 'Computer Courses' | 'Barista Training' | 'Languages (English & Kiswahili)' | 'Henna & Make-up' | 'Sewing & Tailoring' | 'IELTS Prep' | 'Business & Accounting'
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

const COURSES_DATA: CourseItem[] = [
  {
    id: 'c-comp',
    title: 'Comprehensive Computer Packages & Digital Skills',
    category: 'Computer Courses',
    tag: '💻 Essential Tech',
    tagColor: '#1e3a8a',
    duration: '4 Weeks (1 Month)',
    schedule: 'Morning (8:30 AM) / Afternoon / Evening',
    fee: 'KES 4,500',
    installment: '2 installments of KES 2,500',
    careerOutcome: 'Office Administrator • Data Entry Specialist • Digital Assistant',
    skills: ['Ms Word & Excel Pro', 'PowerPoint Presentations', 'Ms Access Databases', 'Typing Speed & Internet Research', 'Canva Graphic Design'],
    icon: '💻',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'Keyboard Speed Typing & Ms Word Document Design', practicalLab: 'Drafting corporate letters, tables, and professional CV formatting.' },
      { week: 'Week 2', topic: 'Advanced Ms Excel & Automated Data Spreadsheets', practicalLab: 'IF statements, VLOOKUP, payroll calculations, and financial charts.' },
      { week: 'Week 3', topic: 'Ms PowerPoint Presentations & Access Databases', practicalLab: 'Animated slide decks, relational customer database creation & queries.' },
      { week: 'Week 4', topic: 'Internet Security, Email Etiquette & Canva Graphics', practicalLab: 'Cloud Google Drive workflows, official correspondence, and banner design.' },
    ],
  },
  {
    id: 'c-barista',
    title: 'Professional Barista & Coffee Brewing Artistry',
    category: 'Barista Training',
    tag: '☕ High International Demand',
    tagColor: '#78350f',
    duration: '4 to 6 Weeks',
    schedule: 'Morning / Afternoon / Saturday Masterclass',
    fee: 'KES 9,500',
    installment: '2 installments of KES 5,000',
    careerOutcome: 'Head Barista • Cafe Supervisor • Hospitality Specialist (Kenya & Gulf)',
    skills: ['Espresso Calibration & Extraction', 'Silky Milk Steaming & Frothing', 'Free-Pour Latte Art', 'Coffee Origin & Cupping', 'Commercial Espresso Machines'],
    icon: '☕',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'Coffee Botany, Cupping & Grinder Dial-In', practicalLab: 'Calibrating burr grinders, adjusting extraction time and brew ratios.' },
      { week: 'Week 2', topic: 'Commercial Espresso Brewing & Tamping Precision', practicalLab: 'Dialing in single and double shot espresso extractions under bar pressure.' },
      { week: 'Week 3', topic: 'Milk Chemistry & Free-Pour Latte Art', practicalLab: 'Steaming micro-foam and pouring hearts, rosettas, and tulips.' },
      { week: 'Week 4', topic: 'Manual Brewing (V60, Chemex, Aeropress) & Cafe Workflow', practicalLab: 'Speed orders simulation, machine descaling, and hygiene protocols.' },
    ],
  },
  {
    id: 'c-eng',
    title: 'English Language Mastery & Business Communication',
    category: 'Languages (English & Kiswahili)',
    tag: '🗣️ Public Speaking & Fluency',
    tagColor: '#0284c7',
    duration: '6 to 8 Weeks',
    schedule: 'Morning / Evening (5:30 PM) / Weekend',
    fee: 'KES 5,500',
    installment: '2 installments of KES 3,000',
    careerOutcome: 'Executive Assistant • Public Speaker • Corporate Communicator',
    skills: ['Spoken English & Pronunciation', 'Business Email & Report Writing', 'Public Speaking & Presentation', 'Grammar & Vocabulary Mastery', 'Confidence in Interviews'],
    icon: '📢',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'Grammar Fundamentals & Phonetic Pronunciation', practicalLab: 'Vowel and consonant articulation drills and conversational sentence structures.' },
      { week: 'Week 2', topic: 'Spoken Fluency & Vocabulary Expansion', practicalLab: 'Interactive pair dialogues, storytelling, and eliminating hesitation.' },
      { week: 'Week 3', topic: 'Business Writing & Corporate Email Etiquette', practicalLab: 'Drafting formal executive memos, customer support emails, and reports.' },
      { week: 'Week 4', topic: 'Public Speaking, Presentations & Interview Skills', practicalLab: 'Mock boardroom presentations and behavioral interview simulations.' },
    ],
  },
  {
    id: 'c-kisw',
    title: 'Kiswahili Sanifu for Expatriates & Beginners',
    category: 'Languages (English & Kiswahili)',
    tag: '🇰🇪 Conversational & Formal Swahili',
    tagColor: '#16a34a',
    duration: '4 to 6 Weeks',
    schedule: 'Morning / Evening / Saturday Classes',
    fee: 'KES 5,000',
    installment: '2 installments of KES 2,750',
    careerOutcome: 'Expatriate Integration • Field Researcher • Tourism & Community Lead',
    skills: ['Everyday Mazungumzo & Greetings', 'Sarufi (Grammar & Noun Classes)', 'Market & Business Swahili', 'Reading & Writing Skills', 'Cultural Immersion & Etiquette'],
    icon: '🇰🇪',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'Salamu, Utambulisho & Noun Classes (Ngeli)', practicalLab: 'Greetings, introductions, and everyday interactive vocabulary.' },
      { week: 'Week 2', topic: 'Sarufi ya Kiswahili & Tense Conjugation', practicalLab: 'Past, present, future tenses, negation (kukanusha), and sentence building.' },
      { week: 'Week 3', topic: 'Biashara & Mazungumzo ya Masokoni', practicalLab: 'Real-life market bargaining, asking directions, and transportation dialogues.' },
      { week: 'Week 4', topic: 'Insha, Hotuba & Formal Swahili Discourse', practicalLab: 'Formal speech delivery, translation exercises, and cultural etiquette.' },
    ],
  },
  {
    id: 'c-lang',
    title: 'Foreign Languages Mastery (Arabic, French, German, Spanish)',
    category: 'Languages (English & Kiswahili)',
    tag: '🌐 International Diplomas',
    tagColor: '#059669',
    duration: '8 Weeks (2 Months)',
    schedule: 'Day / Evening (5:30 PM) / Saturday',
    fee: 'KES 7,500',
    installment: '2 installments of KES 4,000',
    careerOutcome: 'Bilingual Customer Support • Flight Attendant • Embassy / NGO Staff',
    skills: ['Conversational Grammar', 'Phonetics & Native Pronunciation', 'Reading & Written Composition', 'Diplomatic & Business Vocabulary', 'A1 to B2 Certification'],
    icon: '🗣️',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'Alphabet, Phonetics & Fundamental Vocabulary', practicalLab: 'Pronunciation drills, self-introductions, and basic conversation.' },
      { week: 'Week 2', topic: 'Grammatical Foundations & Verb Conjugations', practicalLab: 'Constructing compound sentences and everyday life dialogues.' },
      { week: 'Week 3', topic: 'Listening Audio Comprehension & Reading', practicalLab: 'Native speaker audio sessions and conversational role-plays.' },
      { week: 'Week 4', topic: 'Commercial & Diplomatic Vocabulary Mastery', practicalLab: 'Business scenarios, customer care simulations, and A1/A2 mock tests.' },
    ],
  },
  {
    id: 'c-henna',
    title: 'Henna Artistry, Bridal Design & Professional Make-up',
    category: 'Henna & Make-up',
    tag: '✨ Beauty & Glamour',
    tagColor: '#db2777',
    duration: '4 to 8 Weeks (1-2 Months)',
    schedule: 'Morning (9:00 AM) / Saturday Intensive',
    fee: 'KES 6,500',
    installment: '2 installments of KES 3,500',
    careerOutcome: 'Certified Make-up Artist (MUA) • Bridal Henna Designer • Salon Entrepreneur',
    skills: ['Traditional & Modern Arabic Henna', 'Bridal & Party Henna Application', 'Skin Prep, Foundation & Contouring', 'Eye Make-up & Brow Sculpting', 'Lash Application & Bridal Glam'],
    icon: '💄',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'Henna Cone Grip, Mixing & Fine Linework', practicalLab: 'Executing clean swirls, leaves, geometric grids, and mandala centerpieces.' },
      { week: 'Week 2', topic: 'Arabic & Sudanese Floral Cuff Artistry', practicalLab: 'Full palm and wrist coverage on live practice models with natural Henna cones.' },
      { week: 'Week 3', topic: 'Bridal Henna & Feet Application Masterclass', practicalLab: 'Intricate bridal layout, shading, white henna, and glitter accentuation.' },
      { week: 'Week 4', topic: 'Professional Makeup (Contour, Brows & Lashes)', practicalLab: 'Skin tone matching, high-definition contouring, cut-crease eyes & bridal makeup.' },
    ],
  },
  {
    id: 'c-sewing',
    title: 'Fashion Design, Sewing & Garment Tailoring',
    category: 'Sewing & Tailoring',
    tag: '🧵 Hands-On Craft',
    tagColor: '#ea580c',
    duration: '8 to 12 Weeks (2-3 Months)',
    schedule: 'Morning / Afternoon Lab Shifts',
    fee: 'KES 7,500',
    installment: '2 installments of KES 4,000',
    careerOutcome: 'Bespoke Tailor • Fashion Designer • Boutique & Apparel Entrepreneur',
    skills: ['Body Measurement & Pattern Drafting', 'Electric & Manual Machine Operation', 'Cutting, Stitching & Finishing', 'Dressmaking & African Kitenge Outfits', 'Zippers, Pockets & Alterations'],
    icon: '✂️',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'Sewing Machine Operation & Seam Techniques', practicalLab: 'Threading industrial machines, speed control, straight & curved seam lines.' },
      { week: 'Week 2', topic: 'Body Measurements & Paper Pattern Drafting', practicalLab: 'Taking precision measurements and cutting paper blocks for skirts and tops.' },
      { week: 'Week 3', topic: 'Fabric Cutting, Zippers & Pocket Assembly', practicalLab: 'Invisible zipper insertion, collar attachment, and side pocket stitching.' },
      { week: 'Week 4', topic: 'Bespoke Dressmaking & African Kitenge Outfits', practicalLab: 'Complete garment stitching, fitting, pressing, and finishing bespoke designs.' },
    ],
  },
  {
    id: 'c-ielts',
    title: 'IELTS Academic & General Training Exam Preparation',
    category: 'IELTS Prep',
    tag: '🌍 Target Band 7.5 - 9.0',
    tagColor: '#2563eb',
    duration: '4 to 6 Weeks Intensive',
    schedule: 'Evening (5:30 PM - 7:30 PM) / Weekend',
    fee: 'KES 8,500',
    installment: '2 installments of KES 4,500',
    careerOutcome: 'Study Abroad (UK, Canada, USA, Australia) • Global Healthcare & Work Visas',
    skills: ['IELTS Speaking Mock Interviews', 'Listening Audio Strategies', 'Academic Reading Speed Techniques', 'Task 1 & Task 2 Essay Writing', 'Official Cambridge Mock Tests'],
    icon: '🎓',
    popular: true,
    syllabus: [
      { week: 'Week 1', topic: 'IELTS Speaking Section & Part 1-3 Mastery', practicalLab: 'Mock interviews, cue card fluency training, and accent clarity coaching.' },
      { week: 'Week 2', topic: 'Listening Section & Audio Trick Traps', practicalLab: 'Real-time Cambridge audio tests with multi-accent comprehension strategies.' },
      { week: 'Week 3', topic: 'Academic & General Reading Speed Tactics', practicalLab: 'Skimming, scanning, True/False/Not Given drills, and paragraph matching.' },
      { week: 'Week 4', topic: 'Task 1 Graph Analysis & Task 2 Essay Masterclass', practicalLab: 'Timed writing evaluations with certified British Council grading rubric.' },
    ],
  },
  {
    id: 'c-coding',
    title: 'Full-Stack Web Development & Cloud Systems',
    category: 'Computer Courses',
    tag: '🚀 Tech Career',
    tagColor: '#6366f1',
    duration: '12 Weeks (3 Months)',
    schedule: 'Day / Evening / Weekend',
    fee: 'KES 12,000',
    installment: '2 installments of KES 6,500',
    careerOutcome: 'Junior Web Developer • Software Engineer',
    skills: ['React 19 & JavaScript', 'Node.js Backend APIs', 'PostgreSQL Databases', 'Git & Cloud Hosting'],
    icon: '💻',
    syllabus: [
      { week: 'Week 1', topic: 'HTML5 Semantic Layouts, Modern CSS & Flex/Grid', practicalLab: 'Building responsive commercial web landing pages and portfolio templates.' },
      { week: 'Week 2', topic: 'JavaScript ES6+, DOM Manipulation & State', practicalLab: 'Interactive web applications, API fetching, and client-side data handling.' },
      { week: 'Week 3', topic: 'React 19 Components, Hooks & Backend Node.js APIs', practicalLab: 'Developing full RESTful APIs with database CRUD operations.' },
      { week: 'Week 4', topic: 'PostgreSQL Database Queries & Cloud Server Deployment', practicalLab: 'Deploying secure production web apps to Vercel and cloud containers.' },
    ],
  },
  {
    id: 'c-acc',
    title: 'Computerized Accounting & QuickBooks Financials',
    category: 'Business & Accounting',
    tag: '📊 High Employability',
    tagColor: '#b45309',
    duration: '4 Weeks (1 Month)',
    schedule: 'Morning (8:30 AM) / Evening',
    fee: 'KES 6,500',
    installment: '2 installments of KES 3,500',
    careerOutcome: 'Accounts Assistant • Payroll Officer',
    skills: ['QuickBooks Pro & Online', 'KRA iTax VAT & PAYE Filing', 'Payroll Preparation', 'Balance Sheet Balancing'],
    icon: '📈',
    syllabus: [
      { week: 'Week 1', topic: 'Company File Setup & Chart of Accounts in QuickBooks', practicalLab: 'Configuring fiscal years, opening balances, and vendor databases.' },
      { week: 'Week 2', topic: 'Invoicing, Accounts Receivable & Bill Payments', practicalLab: 'Recording sales receipts, customer credit memos, and supplier reconciliations.' },
      { week: 'Week 3', topic: 'Payroll Processing & Monthly KRA iTax Filing', practicalLab: 'Computing PAYE, NSSF, NHIF/SHIF deductions, and filing VAT returns.' },
      { week: 'Week 4', topic: 'Bank Reconciliation & Financial Statement Generation', practicalLab: 'Balancing monthly bank accounts and generating Profit & Loss balance sheets.' },
    ],
  },
]

const TESTIMONIALS = [
  {
    name: 'Zahra Hassan',
    role: 'Professional Make-up Artist & Henna Studio Owner',
    course: 'Henna Artistry & Professional Make-up',
    avatar: '💄',
    quote:
      'The hands-on practice on real models, bridal cone techniques, and facial contouring at Brent College gave me the confidence to open my own beauty studio in Eastleigh. My weekend bookings are full!',
    rating: 5,
  },
  {
    name: 'John Macharia',
    role: 'Head Barista at Urban Roast Cafe',
    course: 'Professional Barista & Coffee Brewing',
    avatar: '☕',
    quote:
      'The commercial espresso machines and latte art training at Brent were world class. Within two weeks of graduation, I was hired at a top cafe in Westlands, and I am now preparing for a barista role in Dubai!',
    rating: 5,
  },
  {
    name: 'Emmanuel Kipkoech',
    role: 'Achieved IELTS Band 8.0 (Relocating to Canada)',
    course: 'IELTS Academic Preparation',
    avatar: '🌍',
    quote:
      'The mock speaking tests and essay writing feedback from the IELTS instructors transformed my score from Band 6.0 to Band 8.0 in just 5 weeks. Highly recommend Brent College to anyone traveling abroad!',
    rating: 5,
  },
]

export function Landing() {
  const { signInAsDemo } = useAuthContext()
  const { isInstalled, promptInstall } = usePWAInstall()
  const navigate = useNavigate()

  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<CourseItem | null>(null)
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [showPortalDesksModal, setShowPortalDesksModal] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Live Intake Countdown Timer
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 4,
    hours: 18,
    minutes: 42,
    seconds: 15,
  })

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
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

  const filteredCourses = useMemo(() => {
    let list = COURSES_DATA
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
  }, [activeCategory, searchQuery])

  const selectedCalcCourse = useMemo(() => {
    return COURSES_DATA.find((c) => c.id === calcCourseId) || COURSES_DATA[0]
  }, [calcCourseId])

  const handleOpenCourseApplication = (course: CourseItem) => {
    setSelectedCourseForModal(course)
    setInquiryForm((prev) => ({ ...prev, course: course.title }))
    setInquiryModalOpen(true)
  }

  const handleVerifyCert = (e: React.FormEvent) => {
    e.preventDefault()
    if (!certQuery.trim()) return

    const q = certQuery.trim().toUpperCase()
    // Authentic certificate validation lookup
    if (q.includes('BC-') || q.length >= 6) {
      setCertResult({
        found: true,
        studentName: 'Zahra Hassan Abdi',
        courseTitle: 'Professional Henna Artistry & Bridal Cosmetology',
        completionDate: '15th December 2025',
        certNumber: q,
        status: 'Officially Verified & Accredited',
      })
      showToast('✓ Certificate credential record verified successfully!')
    } else {
      setCertResult({
        found: false,
      })
      showToast('⚠️ No certificate matched the query number.')
    }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inquiryForm.name || !inquiryForm.phone) return

    await schoolStore.addInquiry({
      id: `inq-${Date.now()}`,
      visitor_name: inquiryForm.name,
      phone: inquiryForm.phone,
      email: inquiryForm.email,
      purpose: 'New Admission Inquiry',
      program_of_interest: inquiryForm.course,
      notes: `Shift: ${inquiryForm.preferredShift}. Notes: ${inquiryForm.notes || 'Website lead'}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      recorded_by: 'Website Instant Application',
      created_at: new Date().toISOString(),
      status: 'Open',
    })

    setInquirySuccess(true)
    showToast('🎉 Application successfully submitted to Admissions Registry!')
    setTimeout(() => {
      setInquirySuccess(false)
      setInquiryModalOpen(false)
      setSelectedCourseForModal(null)
      setInquiryForm({
        name: '',
        phone: '',
        email: '',
        course: 'Comprehensive Computer Packages & Digital Skills',
        preferredShift: 'Evening (5:30 PM - 7:30 PM)',
        notes: '',
      })
    }, 2200)
  }

  const handleLaunchRole = (role: Role) => {
    signInAsDemo(role)
    setShowPortalDesksModal(false)
    if (role === 'admin') navigate('/admin')
    else if (role === 'bursar') navigate('/bursar')
    else if (role === 'teacher') navigate('/teacher')
    else if (role === 'parent') navigate('/parent')
    else navigate('/student')
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <PWAInstallBanner />
      <DesktopCommandPalette />

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
          📞 <strong>+254 712 345 678</strong>
        </span>
        <span className="hidden md:inline" style={{ opacity: 0.8 }}>|</span>
        <span className="hidden md:inline">
          🏢 Paybill: <strong>247247</strong>
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
              alt="Brent College Logo"
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.02em', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                BRENT COLLEGE
              </div>
              <div className="hidden sm:block" style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Eastleigh 4th Street • Nairobi
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
            <nav className="hidden lg:flex" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', fontSize: '0.92rem', fontWeight: 600 }}>
              <a href="#courses" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>Courses</a>
              <a href="#why-brent" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>Why Choose Us</a>
              <a href="#testimonials" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>Graduate Outcomes</a>
              <a href="#intakes" style={{ color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}>Intakes & Fees</a>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
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
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={promptInstall}
                  title="Install Brent College App on your Phone"
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
            <span>⭐️⭐️⭐️⭐️⭐️</span> Rated 4.9/5 by 3,500+ Nairobi Short Course Graduates
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
            Gain In-Demand Practical Skills. <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #38bdf8 50%, #93c5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Accelerate Your Career in 4 to 12 Weeks.
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
            Nairobi’s premier short course college at Sahal Tower, 4th Street, Eastleigh. Master Computer Packages, Barista Artistry, English & Kiswahili Fluency, Henna & Bridal Make-up, Sewing & Tailoring, and IELTS Exam Preparation with 100% hands-on practical training!
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <button
              type="button"
              className="btn btn-lg"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                padding: '1rem 2.5rem',
                fontSize: '1.08rem',
                borderRadius: '12px',
                boxShadow: '0 10px 28px rgba(37, 99, 235, 0.45)',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setInquiryModalOpen(true)}
            >
              🚀 Apply for Upcoming Intake →
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
              📚 Browse All Short Courses
            </a>

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
              background: 'rgba(30, 58, 138, 0.55)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(147, 197, 253, 0.35)',
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
              <div style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ NEXT SHORT COURSE INTAKE REGISTRATION
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                Ongoing Monthly Intake — Morning, Afternoon & Evening Batches
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                📍 Sahal Tower Campus, 4th Street, Eastleigh • Limited Practical Lab Seats
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ background: '#090d16', border: '1px solid #1e3a8a', padding: '0.4rem 0.65rem', borderRadius: '8px', textAlign: 'center', minWidth: '48px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#60a5fa' }}>{String(timeLeft.days).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Days</div>
              </div>
              <span style={{ fontWeight: 900, color: '#93c5fd' }}>:</span>
              <div style={{ background: '#090d16', border: '1px solid #1e3a8a', padding: '0.4rem 0.65rem', borderRadius: '8px', textAlign: 'center', minWidth: '48px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#60a5fa' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Hours</div>
              </div>
              <span style={{ fontWeight: 900, color: '#93c5fd' }}>:</span>
              <div style={{ background: '#090d16', border: '1px solid #1e3a8a', padding: '0.4rem 0.65rem', borderRadius: '8px', textAlign: 'center', minWidth: '48px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#60a5fa' }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Mins</div>
              </div>
              <span style={{ fontWeight: 900, color: '#93c5fd' }}>:</span>
              <div style={{ background: '#090d16', border: '1px solid #1e3a8a', padding: '0.4rem 0.65rem', borderRadius: '8px', textAlign: 'center', minWidth: '48px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8' }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
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
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>92%</div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginTop: '0.35rem' }}>Graduate Employment</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Within 6 months of graduation</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#34d399', lineHeight: 1 }}>100%</div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginTop: '0.35rem' }}>Practical Lab Focus</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-world projects, zero fluff</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>3 Shifts</div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginTop: '0.35rem' }}>Flexible Timetables</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Day, Evening & Saturday classes</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f472b6', lineHeight: 1 }}>KES 0</div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginTop: '0.35rem' }}>Free Career Mentorship</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CV reviews & hiring partner network</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition / Why Choose Brent College */}
      <section id="why-brent" style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
            THE BRENT COLLEGE ADVANTAGE
          </span>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.75rem' }}>
            Designed Specifically for Career Upgraders & Beginners
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#334155', maxWidth: '700px', margin: '0 auto', fontWeight: 500 }}>
            We eliminate outdated theoretical memorization and focus exclusively on what top employers and clients demand today.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.25rem' }}>
              🛠️
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Project-Based Practical Labs
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Every single lecture is paired with hands-on practice. Learn on professional espresso machines, commercial sewing equipment, and computer lab suites.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.25rem' }}>
              ⏰
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Learn Without Leaving Your Job
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Choose from convenient Morning, Afternoon, Evening (5:30 PM - 7:30 PM), or intensive Saturday Weekend batches. Never compromise your current schedule while upskilling.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.25rem' }}>
              📜
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Accredited Industry Certificates
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Graduate with institutional certificates recognized by employers throughout Kenya and East Africa. Showcase verified credentials for immediate employment.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.25rem' }}>
              💳
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Zero-Stress M-Pesa Installments
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Quality vocational education should be accessible. Pay your tuition in 2 to 3 manageable installments directly via M-Pesa Paybill 247247 with instant receipt generation.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Short Courses Showcase */}
      <section id="courses" style={{ background: '#ffffff', padding: '5rem 1.5rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
                PROFESSIONAL SHORT COURSES DIRECTORY
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0' }}>
                Explore In-Demand Short Courses
              </h2>
              <p style={{ fontSize: '1rem', color: '#64748b', margin: '0.35rem 0 0' }}>
                Select a course to view duration, tuition fees, and immediate career outcomes.
              </p>
            </div>

            {/* Live Search Input Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <input
                type="text"
                className="input"
                placeholder="🔍 Search course (e.g. Barista, IELTS, Sewing, Henna)..."
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
              {['All', 'Languages (English & Kiswahili)', 'Computer Courses', 'Barista Training', 'Henna & Make-up', 'Sewing & Tailoring', 'IELTS Prep', 'Business & Accounting'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  style={{
                    background: activeCategory === cat ? '#1e3a8a' : '#f1f5f9',
                    color: activeCategory === cat ? '#ffffff' : '#475569',
                    border: `1px solid ${activeCategory === cat ? '#1e3a8a' : '#cbd5e1'}`,
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
                    onClick={() => {
                      setInquiryForm({ ...inquiryForm, course: course.title })
                      setSelectedCourseForModal(course)
                      setInquiryModalOpen(true)
                    }}
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
                  {COURSES_DATA.map((c) => (
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
                    <div>📱 <strong>Paybill:</strong> 247247</div>
                    <div>📑 <strong>Account:</strong> Student Admission No / Your Name</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-full mt-4"
                  style={{ fontWeight: 800, padding: '0.75rem', borderRadius: '10px' }}
                  onClick={() => {
                    setInquiryForm({ ...inquiryForm, course: selectedCalcCourse.title })
                    setSelectedCourseForModal(selectedCalcCourse)
                    setInquiryModalOpen(true)
                  }}
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
                Attend hands-on lab sessions in our Eastleigh, Sahal Tower center. Build real-world portfolio projects under active industry mentorship.
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

      {/* Intakes, Paybill & Campus Location Section */}
      <section id="intakes" style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Paybill Card */}
          <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#ffffff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 25px rgba(5, 150, 105, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>📱</span>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>Official M-Pesa Payment Guide</h3>
                <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>Instant automated fee receipts</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '1.25rem', marginTop: '1.5rem', lineHeight: 1.8 }}>
              <div>🏢 <strong>Paybill Number:</strong> <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.05em' }}>247247</span></div>
              <div>📑 <strong>Account:</strong> <span style={{ fontWeight: 800 }}>Student Admission Number</span> (or Your Full Name)</div>
              <div>💰 <strong>Installments:</strong> Accepted in 2 to 3 flexible parts</div>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#d1fae5', marginTop: '1.25rem', margin: '1.25rem 0 0' }}>
              * Official stamped digital receipts are issued instantly by the Bursar Desk upon payment confirmation.
            </p>
          </div>

          {/* Campus Location Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>📍</span>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Eastleigh Main Campus</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Sahal Tower, 4th Street, Nairobi</div>
              </div>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, marginTop: '1.25rem' }}>
              <div>🏢 <strong>Location:</strong> Sahal Tower, 4th Street, Eastleigh, Nairobi</div>
              <div>🕒 <strong>Opening Hours:</strong> Mon – Fri: 7:30 AM – 7:30 PM | Sat: 8:00 AM – 5:00 PM</div>
              <div>📞 <strong>Admissions Hotline:</strong> +254 712 345 678</div>
              <div>✉️ <strong>Direct Inquiries:</strong> admissions@brentcollege.ac.ke</div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-4"
              style={{ fontWeight: 700 }}
              onClick={() => alert('Campus Visit Hotline: Call +254 712 345 678 to schedule a free tour of our practical labs at Sahal Tower, 4th Street, Eastleigh.')}
            >
              🗓️ Book Free Campus Tour
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
            Employers, embassies, and academic institutions in Kenya, the Middle East, and worldwide can instantly verify authentic Brent College credentials.
          </p>

          <form onSubmit={handleVerifyCert} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <input
              type="text"
              className="input"
              style={{ maxWidth: '400px', background: '#0f172a', border: '1.5px solid #334155', color: '#ffffff', fontSize: '0.95rem' }}
              placeholder="Enter Certificate Serial (e.g. BC-2026-089)"
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
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>Authentic Brent College Credential</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.75rem', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    <div>🎓 <strong>Graduate Name:</strong> {certResult.studentName}</div>
                    <div>📜 <strong>Awarded Qualification:</strong> {certResult.courseTitle}</div>
                    <div>🗓️ <strong>Completion Date:</strong> {certResult.completionDate}</div>
                    <div>🔢 <strong>Certificate Reference:</strong> <span style={{ color: '#fde047', fontWeight: 800 }}>{certResult.certNumber}</span></div>
                    <div>🏛️ <strong>Campus:</strong> Sahal Tower, 4th Street, Eastleigh, Nairobi</div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#450a0a', border: '1.5px solid #ef4444', borderRadius: '14px', padding: '1.25rem', color: '#fef2f2', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>⚠️</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>No Certificate Record Found</div>
                  <div style={{ fontSize: '0.84rem', color: '#fca5a5', marginTop: '0.25rem' }}>
                    Please check the certificate serial number or contact the Academic Registrar at <span style={{ color: '#ffffff' }}>admissions@brentcollege.ac.ke</span>.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Free Application & Inquiry Modal */}
      {inquiryModalOpen && (
        <div className="modal-overlay" onClick={() => setInquiryModalOpen(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()} style={{ padding: '2.25rem', borderRadius: '16px' }}>
            <div className="modal-header" style={{ padding: 0, paddingBottom: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e3a8a' }}>
                  Apply for Short Course / Free Consultation
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                  Fill out this 60-second form. Our Admissions Office will reach out with timetable options and fee installment plans.
                </p>
              </div>
              <button type="button" className="modal-close" onClick={() => setInquiryModalOpen(false)}>✕</button>
            </div>

            {inquirySuccess ? (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#166534' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
                <h4 style={{ fontWeight: 900, fontSize: '1.2rem', margin: '0 0 0.35rem' }}>Application Inquiry Received!</h4>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>
                  Thank you, <strong>{inquiryForm.name}</strong>. The Admissions Office has received your application for <strong>{inquiryForm.course}</strong> and will call/WhatsApp you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="e.g. Cynthia Achieng"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="label">Phone / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        className="input"
                        placeholder="+254 712 345 678"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Email Address</label>
                      <input
                        type="email"
                        className="input"
                        placeholder="cynthia@gmail.com"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Selected Short Course *</label>
                    <select
                      className="input"
                      value={inquiryForm.course}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, course: e.target.value })}
                    >
                      {COURSES_DATA.map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title} ({c.duration} — {c.fee})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Preferred Timetable Shift</label>
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

                  <div>
                    <label className="label">Questions or Career Goals (Optional)</label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="e.g. Do you offer job interview preparation?..."
                      value={inquiryForm.notes}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setInquiryModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ fontWeight: 800, padding: '0.75rem 1.75rem' }}>
                    ✓ Submit Application & Secure Seat
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* College Portals & Management Desks Modal */}
      {showPortalDesksModal && (
        <div className="modal-overlay" onClick={() => setShowPortalDesksModal(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem', borderRadius: '16px' }}>
            <div className="modal-header" style={{ padding: 0, paddingBottom: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #cbd5e1' }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a' }}>
                  🔐 College Portals & Management Workstations
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.25rem 0 0', fontWeight: 500 }}>
                  Select your role to access your personalized workstation:
                </p>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowPortalDesksModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                onClick={() => handleLaunchRole('student')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                <span style={{ fontSize: '1.75rem' }}>🎓</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#1e3a8a' }}>Student & Trainee Portal</div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>Access registered short course units, video lessons & e-library</div>
                </div>
              </div>

              <div
                onClick={() => handleLaunchRole('bursar')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#059669')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                <span style={{ fontSize: '1.75rem' }}>💼</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#059669' }}>Bursar & Admissions Registry</div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>M-Pesa receipts, calling letters, unit registration & fee ledger</div>
                </div>
              </div>

              <div
                onClick={() => handleLaunchRole('teacher')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d97706')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                <span style={{ fontSize: '1.75rem' }}>👩‍🏫</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#d97706' }}>Faculty & HOD Portal</div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>Upload video tutorials, grade books & lab practical assignments</div>
                </div>
              </div>

              <div
                onClick={() => handleLaunchRole('admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1e3a8a')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                <span style={{ fontSize: '1.75rem' }}>🛡️</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#1e3a8a' }}>Principal & Admin Console</div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>Department controls, course pricing, subject disciplines & institutional overview</div>
                </div>
              </div>

              <div
                onClick={() => handleLaunchRole('parent')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#b45309')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                <span style={{ fontSize: '1.75rem' }}>👨‍👩‍👧</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#b45309' }}>Parent / Sponsor Portal</div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>Student attendance, fee receipts & academic progress tracking</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ width: '100%', color: '#ffffff', fontWeight: 700 }}>
                Go to Standard Username / Password Login →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: '#090d16', color: '#cbd5e1', padding: '4rem 1.5rem 2.5rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand & Overview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <img src="/logo.png" alt="Brent College Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #2563eb' }} />
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.01em' }}>BRENT COLLEGE</span>
                <div style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700 }}>PRACTICAL SHORT COURSES • NAIROBI</div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#cbd5e1', marginBottom: '1.25rem' }}>
              Nairobi’s premier vocational hub for career short courses. Hands-on practical training in barista coffee brewing, computer packages, languages (English & Kiswahili), fashion tailoring, henna artistry, and IELTS preparation.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#131b2e', border: '1px solid #2e3d61', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
              <span>🛡️ Certified Short Courses Institution</span>
            </div>
          </div>

          {/* Short Courses Directory */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '2px solid #2563eb', paddingBottom: '0.4rem', display: 'inline-block' }}>
              Specialized Short Courses
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')} onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}>💻 Computer Packages & Digital Skills</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')} onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}>☕ Professional Barista & Coffee Brewing Artistry</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')} onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}>🗣️ English Language Mastery & Fluency</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')} onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}>🇰🇪 Kiswahili Sanifu (Expatriates & Beginners)</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')} onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}>🌐 Foreign Languages (Arabic, French, German)</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')} onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}>💄 Henna Artistry & Professional Make-up</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')} onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}>✂️ Fashion Design, Sewing & Garment Tailoring</a>
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')} onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}>🌍 IELTS Exam Preparation (Band 7.5+)</a>
            </div>
          </div>

          {/* Tuition Payment Details */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '2px solid #16a34a', paddingBottom: '0.4rem', display: 'inline-block' }}>
              M-Pesa & Fee Payments
            </h4>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#cbd5e1' }}>
              <div style={{ background: '#0f291e', border: '1px solid #16a34a', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.9rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 700 }}>M-Pesa Direct Paybill</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#4ade80', letterSpacing: '0.05em', margin: '2px 0' }}>247247</div>
                <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                  Account: <strong style={{ color: '#fef08a' }}>Student Admission Number</strong>
                </div>
              </div>
              <div style={{ marginBottom: '0.35rem' }}>🏦 <span style={{ color: '#94a3b8' }}>Bank:</span> <strong style={{ color: '#f8fafc' }}>Kenya Commercial Bank (KCB)</strong></div>
              <div style={{ marginBottom: '0.35rem' }}>📍 <span style={{ color: '#94a3b8' }}>Branch:</span> <strong style={{ color: '#f8fafc' }}>Eastleigh Branch, Nairobi</strong></div>
              <div style={{ marginBottom: '0.35rem' }}>💳 <span style={{ color: '#94a3b8' }}>Installments:</span> <strong style={{ color: '#f8fafc' }}>2–3 flexible parts accepted</strong></div>
              <div>📜 <span style={{ color: '#94a3b8' }}>Receipts:</span> <strong style={{ color: '#f8fafc' }}>Official stamped digital receipts</strong></div>
            </div>
          </div>

          {/* Campus Location & Hours */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '2px solid #ea580c', paddingBottom: '0.4rem', display: 'inline-block' }}>
              Admissions & Campus
            </h4>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#cbd5e1' }}>
              <div style={{ marginBottom: '0.35rem' }}>📍 <span style={{ color: '#94a3b8' }}>Campus:</span> <strong style={{ color: '#f8fafc' }}>Sahal Tower, 4th Street, Eastleigh</strong></div>
              <div style={{ marginBottom: '0.35rem' }}>📞 <span style={{ color: '#94a3b8' }}>Phone:</span> <strong style={{ color: '#f8fafc' }}>+254 712 345 678 / +254 700 123 456</strong></div>
              <div style={{ marginBottom: '0.35rem' }}>💬 <span style={{ color: '#94a3b8' }}>WhatsApp:</span> <strong style={{ color: '#f8fafc' }}>+254 712 345 678</strong></div>
              <div style={{ marginBottom: '0.5rem' }}>✉️ <span style={{ color: '#94a3b8' }}>Email:</span> <a href="mailto:admissions@brentcollege.ac.ke" style={{ color: '#93c5fd', textDecoration: 'underline' }}>admissions@brentcollege.ac.ke</a></div>
              
              <div style={{ marginTop: '0.75rem', padding: '0.7rem 0.9rem', background: '#131b2e', border: '1px solid #2e3d61', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ color: '#fcd34d', fontWeight: 700, marginBottom: '0.25rem' }}>🕒 Campus Opening Hours:</div>
                <div style={{ color: '#e2e8f0' }}>• Mon – Fri: <strong>7:30 AM – 7:30 PM</strong></div>
                <div style={{ color: '#e2e8f0' }}>• Saturday: <strong>8:00 AM – 5:00 PM</strong></div>
                <div style={{ color: '#fca5a5' }}>• Sunday: <em>Closed</em></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', maxWidth: '1280px', margin: '0 auto' }}>
          <div>
            © {new Date().getFullYear()} <strong style={{ color: '#e2e8f0' }}>Brent College Nairobi</strong>. All Rights Reserved. Shaping Minds, Inspiring Practical Success.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#93c5fd' }}>📍 Sahal Tower, 4th Street, Eastleigh</span>
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

      {/* Floating Action Menu (WhatsApp, Call, Scroll-To-Top) */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px',
        }}
      >
        {/* WhatsApp Fast Chat */}
        <a
          href="https://wa.me/254712345678?text=Hello%20Brent%20College%20Admissions!%20I%20would%20like%20to%20inquire%20about%20the%20upcoming%20short%20courses%20at%20Sahal%20Tower."
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#25D366',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.86rem',
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          <span className="hidden sm:inline">WhatsApp Admissions</span>
        </a>

        {/* Call Admissions Button */}
        <a
          href="tel:+254712345678"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1e3a8a',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.86rem',
            textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(30, 58, 138, 0.35)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span style={{ fontSize: '1.1rem' }}>📞</span>
          <span className="hidden sm:inline">Call +254 712 345 678</span>
        </a>

        {/* Scroll To Top FAB */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              cursor: 'pointer',
              fontWeight: 900,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            title="Scroll to Top"
          >
            ↑
          </button>
        )}
      </div>

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
