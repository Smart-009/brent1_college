import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { NativeAppHome } from './NativeAppHome'
import { DesktopAppHome } from './DesktopAppHome'
import { isElectronApp, isCapacitorApp } from '@/utils/platform'
import { DesktopCommandPalette } from '@/components/shared/DesktopCommandPalette'
import { supabase } from '@/lib/supabase'
import { schoolStore } from '@/lib/schoolData'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'
import { OFFICIAL_COURSES, getDynamicCoursesList } from '@/config/officialCourses'
import { IntakeAdvertsSection } from './IntakeAdvertsSection'
import type { Role } from '@/lib/database.types'

interface CourseItem {
  id: string
  title: string
  category: 'Data Science & Research' | 'Tech & Programming' | 'Creative Arts & Design' | 'Languages & Communication' | 'Computer & Digital Skills' | 'Business Tech & Accounting' | 'Executive Masterclass' | string
  tag: string
  tagColor: string
  duration: string
  schedule: string
  fee: string
  feeUsd?: number
  feeKes?: number
  feeDisplay?: string
  originalFee?: string
  discountBadge?: string
  rating?: number
  ratingCount?: number
  studentsEnrolled?: number
  instructor?: string
  installment: string
  careerOutcome: string
  skills: string[]
  icon: string
  popular?: boolean
  bestseller?: boolean
  syllabus?: { week: string; topic: string; practicalLab: string }[]
}

const mapProgramToCourseItem = (c: any): CourseItem => ({
  id: c.id,
  title: c.title,
  category: c.category,
  tag: c.tag,
  tagColor: c.tagColor,
  duration: c.duration,
  schedule: c.schedule,
  fee: `$${c.feeUsd}`,
  feeUsd: c.feeUsd,
  feeKes: c.feeKes,
  feeDisplay: c.feeDisplay,
  originalFee: `$${c.originalFeeUsd}`,
  discountBadge: c.discountBadge,
  rating: c.rating,
  ratingCount: c.ratingCount,
  studentsEnrolled: c.studentsEnrolled,
  instructor: c.instructor,
  installment: c.installmentText,
  careerOutcome: c.careerOutcome,
  skills: c.skills,
  icon: c.icon,
  popular: c.popular,
  bestseller: c.bestseller,
  syllabus: c.syllabus,
})

const DEFAULT_COURSES_DATA: CourseItem[] = OFFICIAL_COURSES.map(mapProgramToCourseItem)

const TESTIMONIALS = [
  {
    name: 'Dr. Marcus Vance',
    role: 'Lead Health Data Scientist at NHS Trust',
    location: 'London, United Kingdom',
    countryCode: '🇬🇧 United Kingdom',
    course: 'R Programming & Biostatistics',
    avatar: '📊',
    quote:
      'The hands-on training in RStudio, tidyverse data pipelines, and biostatistical regression models at Éclat was world-class. I was able to automate our NHS hospital trust epidemiological reporting with total precision!',
    rating: 5,
  },
  {
    name: 'Clara Schneider',
    role: 'Frontend Software Engineer at SaaS Enterprise',
    location: 'Frankfurt, Germany',
    countryCode: '🇩🇪 Germany',
    course: 'Full-Stack Web Dev (React 19 & Node.js)',
    avatar: '💻',
    quote:
      'Enrolling in Éclat’s React 19 and Node.js course from Germany was the best career decision I made. The live evening coding labs, GitHub pull request reviews, and API deployments prepared me to land my software developer role.',
    rating: 5,
  },
  {
    name: 'Tariq Al-Hashimi',
    role: 'Regional Operations Director at Logistics Group',
    location: 'Dubai, United Arab Emirates',
    countryCode: '🇦🇪 UAE',
    course: 'Arabic for Business & Corporate Careers',
    avatar: '🇸🇦',
    quote:
      'Taking the live online Arabic and Corporate Communication classes gave me the exact executive fluency required for regional boardroom negotiations and business expansion across the Gulf Cooperation Council (GCC).',
    rating: 5,
  },
  {
    name: 'Ethan Miller',
    role: 'Senior Quantitative Research Lead',
    location: 'Toronto, Canada',
    countryCode: '🇨🇦 Canada',
    course: 'IBM SPSS & Stata Econometric Modeling',
    avatar: '📈',
    quote:
      'The survey coding in SPSS and multi-level panel regressions in Stata were broken down into practical steps by Éclat’s research methodologists. We used these exact techniques to publish our international health economics study.',
    rating: 5,
  },
  {
    name: 'Alexander Hayes',
    role: 'Remote Software Engineer at HealthTech',
    location: 'Austin, Texas, USA',
    countryCode: '🇺🇸 United States',
    course: 'Full-Stack JavaScript & React 19',
    avatar: '💻',
    quote:
      'The 100% online React 19 and Node.js course at Éclat was phenomenal. The live coding labs and mentor code reviews prepared me to build scalable full-stack applications. Within 1 month, I landed a remote developer role!',
    rating: 5,
  },
  {
    name: 'Sophie Dubois',
    role: 'Postgraduate Scholar (IELTS Band 8.5 Achieved)',
    location: 'Lyon, France / Montreal, Canada',
    countryCode: '🇫🇷 France',
    course: 'IELTS Academic Preparation',
    avatar: '🇬🇧',
    quote:
      'The 1-on-1 live Zoom mock speaking sessions and Cambridge essay evaluations transformed my performance. I achieved an overall Band 8.5 on my first attempt and secured my Canadian academic visa effortlessly!',
    rating: 5,
  },
  {
    name: 'Liam O’Connor',
    role: 'Cyber Threat Intelligence & SOC Analyst',
    location: 'Dublin, Ireland',
    countryCode: '🇮🇪 Ireland',
    course: 'Cybersecurity & Ethical Hacking',
    avatar: '🛡️',
    quote:
      'The practical network security labs using Wireshark, vulnerability scanning, and incident response simulations gave me the technical edge to pass my global security exams and secure a senior SOC analyst position.',
    rating: 5,
  },
  {
    name: 'Elena Rostova',
    role: 'Financial Controller & QuickBooks Specialist',
    location: 'Berlin, Germany',
    countryCode: '🇩🇪 Germany',
    course: 'Computerized Accounting & QuickBooks',
    avatar: '🧾',
    quote:
      'The practical QuickBooks multi-currency setup, international VAT filing, and automated payroll reconciliation training directly helped our international consultancy automate bookkeeping for European remote clients.',
    rating: 5,
  },
]

interface PromoSlide {
  id: string
  badge: string
  badgeBg: string
  badgeColor: string
  headline: string
  highlight: string
  description: string
  gradient: string
  accentColor: string
  icon: string
  metricNumber: string
  metricLabel: string
  category: string
  primaryCtaText: string
  features: string[]
}

const HERO_PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'data-research',
    badge: '📊 DATA SCIENCE & STATISTICAL RESEARCH',
    badgeBg: 'rgba(2, 132, 199, 0.2)',
    badgeColor: '#38bdf8',
    headline: 'Master Python, R, SPSS & Stata',
    highlight: 'Statistical Computing, Econometrics & Biostatistics',
    description: 'From survey data cleaning & thesis statistical analysis to multivariate regression modeling, RStudio tidyverse pipelines, and Stata do-files. Taught by senior research methodologists.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(2, 132, 199, 0.28) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #030712 0%, #082f49 50%, #030712 100%)',
    accentColor: '#38bdf8',
    icon: '📊',
    metricNumber: '4,200+',
    metricLabel: 'Researchers & Analysts Certified',
    category: 'Data Science & Research',
    primaryCtaText: 'Explore Data & Stats Programs',
    features: ['RStudio & Biostatistics', 'IBM SPSS Survey Stats', 'Stata Econometrics', 'Python & SQL Analytics'],
  },
  {
    id: 'tech-software',
    badge: '💻 TECH & SOFTWARE ENGINEERING',
    badgeBg: 'rgba(99, 102, 241, 0.2)',
    badgeColor: '#a5b4fc',
    headline: 'Build Scalable Web Applications &',
    highlight: 'Defend Enterprise Cyber Infrastructure',
    description: 'Master React 19, Node.js REST APIs, PostgreSQL databases, and Ethical Hacking with live interactive coding rooms, GitHub code reviews, and cloud container deployments.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.28) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #030712 0%, #1e1b4b 50%, #030712 100%)',
    accentColor: '#818cf8',
    icon: '💻',
    metricNumber: '3,850+',
    metricLabel: 'Developers & SOC Analysts Trained',
    category: 'Tech & Programming',
    primaryCtaText: 'Explore Software & Tech Cohorts',
    features: ['React 19 & Full-Stack', 'Node.js Express APIs', 'Cybersecurity Ops', 'Cloud & Git Portfolios'],
  },
  {
    id: 'creative-design',
    badge: '🎨 CREATIVE ARTS & DIGITAL DESIGN',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
    badgeColor: '#c084fc',
    headline: 'Master UI/UX Product Design &',
    highlight: 'Motion Graphics, Figma & Visual Arts',
    description: 'From wireframing and design systems in Figma to motion animation, branding in Adobe Illustrator/Photoshop, 3D modeling, and video editing. Taught by senior creative directors.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.25) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #030712 0%, #3b0764 50%, #030712 100%)',
    accentColor: '#c084fc',
    icon: '🎨',
    metricNumber: '2,900+',
    metricLabel: 'Designers & Creatives Certified',
    category: 'Creative Arts & Design',
    primaryCtaText: 'Explore Creative Arts & Design',
    features: ['Figma UI/UX Design Systems', 'Graphic Design & Branding', '3D Blender Animation', 'Motion Graphics & Video'],
  },
  {
    id: 'world-languages',
    badge: '🗣️ WORLD LANGUAGES & RELOCATION',
    badgeBg: 'rgba(34, 197, 94, 0.2)',
    badgeColor: '#4ade80',
    headline: 'Score IELTS Band 8.5+ & Master',
    highlight: 'Arabic, German, French & English',
    description: 'Targeting UK, Canada, USA, Europe, or Gulf careers? Master Spoken English, Arabic for Middle East jobs, Goethe-Zertifikat German, and French DELF with live certified examiners.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(34, 197, 94, 0.25) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #030712 0%, #064e3b 50%, #030712 100%)',
    accentColor: '#4ade80',
    icon: '🌍',
    metricNumber: '5,600+',
    metricLabel: 'Successful Global Visa Students',
    category: 'Languages & Communication',
    primaryCtaText: 'Explore World Languages & IELTS',
    features: ['1-on-1 IELTS Speaking Mocks', 'German Goethe Prep', 'Arabic for Gulf Careers', 'French DELF A1-B2'],
  },
  {
    id: 'accounting-finance',
    badge: '🧾 ACCOUNTING, QUICKBOOKS & OFFICE TECH',
    badgeBg: 'rgba(217, 119, 6, 0.2)',
    badgeColor: '#fbbf24',
    headline: 'Lead Corporate Finance, Tax Filing &',
    highlight: 'Advanced Digital Office Operations',
    description: 'Master QuickBooks multi-currency company files, monthly VAT tax returns, payroll deductions, and executive Ms Excel spreadsheets for business leadership.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(217, 119, 6, 0.25) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #030712 0%, #451a03 50%, #030712 100%)',
    accentColor: '#f59e0b',
    icon: '🧾',
    metricNumber: '5,300+',
    metricLabel: 'Accounting & Office Specialists',
    category: 'Business Tech & Accounting',
    primaryCtaText: 'Explore Accounting & Office Tools',
    features: ['QuickBooks Multi-Currency', 'VAT & Payroll Filing', 'Advanced Ms Excel', 'Figma UI/UX & Canva'],
  },
]

export function Landing() {
  const isMobile = useIsMobile(768)
  const location = useLocation()
  const navigate = useNavigate()

  const [appModalOpen, setAppModalOpen] = useState(false)
  const [appModalTab, setAppModalTab] = useState<'android' | 'windows'>('android')

  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<CourseItem | null>(null)
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [showPortalDesksModal, setShowPortalDesksModal] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Hero Animated Promotional Carousel State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0)
  const [heroSliderPaused, setHeroSliderPaused] = useState(false)

  // Auto-advance promotional hero slides every 6 seconds
  useEffect(() => {
    if (heroSliderPaused) return
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_PROMO_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [heroSliderPaused])

  // Track window scroll position for floating scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 450)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
  const buildCourseItems = (): CourseItem[] => {
    const storeSubjects = schoolStore.getSubjects()
    const storeUnits = schoolStore.getCourseUnits()
    const dynamicList = getDynamicCoursesList(storeSubjects, storeUnits)
    return dynamicList
      .filter(
        (c) =>
          c &&
          !c.id?.startsWith('aaaaaaaa-') &&
          !c.id?.startsWith('__ECLAT_') &&
          !c.title?.startsWith('__ECLAT_') &&
          !c.careerOutcome?.startsWith('{') &&
          !c.careerOutcome?.includes('{"key"')
      )
      .map(mapProgramToCourseItem)
  }

  const [coursesList, setCoursesList] = useState<CourseItem[]>(() => buildCourseItems())

  // Synchronize immediately on store change, Supabase Cloud fetch, and Realtime events
  useEffect(() => {
    const syncAllSources = async () => {
      const freshCourses = buildCourseItems()
      setCoursesList(freshCourses)
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_cloud_sync' }, () => {
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

  const isDesktopApp = isElectronApp()
  const isNativeMobileApp = isCapacitorApp()

  if (isDesktopApp) {
    return <DesktopAppHome courses={coursesList} onSelectCourse={(c) => setSelectedCourseForModal(c as any)} />
  }

  if (isNativeMobileApp) {
    return <NativeAppHome courses={coursesList} onSelectCourse={(c) => setSelectedCourseForModal(c as any)} />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
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
            <strong>Intake Ongoing:</strong> 15% Early Bird Tuition Voucher
          </span>
          <span className="hidden sm:inline" style={{ opacity: 0.8 }}>|</span>
          <span className="hidden sm:inline">
            📞 Admissions: <strong>{INSTITUTION_CONFIG.contact.phone}</strong>
          </span>
          <span className="hidden md:inline" style={{ opacity: 0.8 }}>|</span>
          <span className="hidden md:inline">
            🎓 100% Online Live Classes & 24/7 Digital LMS
          </span>
        </div>

      {/* Main Header / Navigation (Udemy-Style Marketplace Header) */}
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
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '0.75rem' }}>
          {/* Left Side: Brand Logo & Explore Categories */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
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
                  100% Online Global Academy
                </div>
              </div>
            </Link>

            {/* Udemy-Style "Explore Categories" Dropdown (Desktop) */}
            <div style={{ position: 'relative' }} className="hidden lg:block">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                style={{
                  background: categoryDropdownOpen ? '#eff6ff' : 'transparent',
                  color: '#1e3a8a',
                  border: '1px solid #bfdbfe',
                  borderRadius: '999px',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <span>🗂️</span>
                <span>Explore Categories</span>
                <span style={{ fontSize: '0.75rem', transform: categoryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
              </button>

              {categoryDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: '260px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    padding: '0.5rem',
                    zIndex: 200,
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  {[
                    { id: 'All', icon: '🔥', label: 'All Online Programs' },
                    { id: 'Data Science & Research', icon: '📊', label: 'Data Science, R, SPSS & Stata' },
                    { id: 'Tech & Programming', icon: '💻', label: 'Tech & Software Engineering' },
                    { id: 'Creative Arts & Design', icon: '🎨', label: 'Creative Arts & UI/UX Design' },
                    { id: 'Languages & Communication', icon: '🗣️', label: 'World Languages & IELTS' },
                    { id: 'Computer & Digital Skills', icon: '🖥️', label: 'Digital Literacy & Office Skills' },
                    { id: 'Business Tech & Accounting', icon: '🧾', label: 'QuickBooks & Tax Accounting' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id)
                        setCategoryDropdownOpen(false)
                        const el = document.getElementById('courses')
                        if (el) el.scrollIntoView({ behavior: 'smooth' })
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: activeCategory === cat.id ? '#eff6ff' : 'transparent',
                        color: activeCategory === cat.id ? '#1e3a8a' : '#334155',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.84rem',
                        fontWeight: activeCategory === cat.id ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Global Search Bar (Udemy-Style) */}
          <div style={{ flex: 1, maxWidth: '420px', margin: '0 0.5rem' }} className="hidden md:block">
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="🔍 Search for courses, skills (e.g. Python, IELTS, React, Excel)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value && location.hash !== '#courses') {
                    const el = document.getElementById('courses')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem 0.55rem 2.2rem',
                  borderRadius: '999px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.86rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.85rem' }}>🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 800 }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Quick Action Links & Portals */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Desktop-Only Navigation & Actions */}
            {!isMobile && (
              <>
                <nav className="desktop-nav-links" style={{ fontSize: '0.88rem', fontWeight: 600, marginRight: '0.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <a href="#intakes-section" style={{ color: '#d97706', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🗓️</span>
                    <span>Intakes</span>
                  </a>
                  <Link to="/library" style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📖</span>
                    <span>E-Library</span>
                  </Link>
                  <a href="#calculator" style={{ color: '#334155', textDecoration: 'none' }}>Tuition Plans</a>
                  <a href="#about" style={{ color: '#334155', textDecoration: 'none' }}>About Us</a>
                </nav>

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
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'inline-flex',
                  }}
                  onClick={() => {
                    setAppModalTab('windows')
                    setAppModalOpen(true)
                  }}
                  title="Install & Download Official Native Apps"
                >
                  <span>📲</span>
                  <span>Get Apps</span>
                </button>

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
              </>
            )}

            {/* Mobile-Only Hamburger Toggle Button - ALWAYS rendered on mobile */}
            {isMobile && (
              <button
                type="button"
                className="btn btn-sm landing-mobile-menu-toggle"
                style={{
                  background: mobileNavOpen ? '#0f172a' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  padding: '0.5rem 0.95rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)',
                  flexShrink: 0,
                }}
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-label="Toggle Navigation Menu"
              >
                <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{mobileNavOpen ? '✕' : '☰'}</span>
                <span>{mobileNavOpen ? 'Close' : 'Menu'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Slide-Down Navigation Menu */}
        {mobileNavOpen && (
          <div
            style={{
              background: '#ffffff',
              borderTop: '2px solid #3b82f6',
              padding: '1.25rem 1rem',
              boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
              animation: 'fadeIn 0.2s ease',
              maxHeight: '82vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.94rem', fontWeight: 600 }}>
              <a
                href="#intakes-section"
                onClick={() => setMobileNavOpen(false)}
                style={{ color: '#d97706', fontWeight: 850, textDecoration: 'none', padding: '0.65rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a' }}
              >
                <span style={{ fontSize: '1.1rem' }}>🗓️</span>
                <span>Upcoming Intakes & Admissions</span>
              </a>

              <a
                href="#about"
                onClick={() => setMobileNavOpen(false)}
                style={{ color: '#0f172a', textDecoration: 'none', padding: '0.6rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc' }}
              >
                <span style={{ fontSize: '1.1rem' }}>🏛️</span>
                <span>About Éclat Institute</span>
              </a>

              <a
                href="#courses"
                onClick={() => setMobileNavOpen(false)}
                style={{ color: '#0f172a', textDecoration: 'none', padding: '0.6rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span style={{ fontSize: '1.1rem' }}>📚</span>
                <span>Courses & Academic Programs</span>
              </a>

              {/* Category Quick Jumps */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', margin: '0.2rem 0 0.5rem', padding: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('Data Science & Research')
                    setMobileNavOpen(false)
                    const el = document.getElementById('courses')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  style={{ textAlign: 'left', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '6px', padding: '6px 8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  📊 Data Science & R
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('Tech & Programming')
                    setMobileNavOpen(false)
                    const el = document.getElementById('courses')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  style={{ textAlign: 'left', background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '6px 8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  💻 Tech & Coding
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('Creative Arts & Design')
                    setMobileNavOpen(false)
                    const el = document.getElementById('courses')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  style={{ textAlign: 'left', background: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff', borderRadius: '6px', padding: '6px 8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🎨 UI/UX & Design
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('Languages & Communication')
                    setMobileNavOpen(false)
                    const el = document.getElementById('courses')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  style={{ textAlign: 'left', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px 8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🗣️ Languages & IELTS
                </button>
              </div>

              <a
                href="#calculator"
                onClick={() => setMobileNavOpen(false)}
                style={{ color: '#0f172a', textDecoration: 'none', padding: '0.6rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span style={{ fontSize: '1.1rem' }}>💳</span>
                <span>Tuition & Installment Calculator</span>
              </a>

              <Link
                to="/library"
                onClick={() => setMobileNavOpen(false)}
                style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none', padding: '0.6rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff' }}
              >
                <span style={{ fontSize: '1.1rem' }}>📖</span>
                <span>Free E-Library & Past Papers</span>
              </Link>

              <Link
                to="/timetable"
                onClick={() => setMobileNavOpen(false)}
                style={{ color: '#0f172a', textDecoration: 'none', padding: '0.6rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span style={{ fontSize: '1.1rem' }}>📅</span>
                <span>Virtual Class Timetable</span>
              </Link>

              <a
                href="#testimonials"
                onClick={() => setMobileNavOpen(false)}
                style={{ color: '#0f172a', textDecoration: 'none', padding: '0.6rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span style={{ fontSize: '1.1rem' }}>⭐</span>
                <span>Student Reviews & Outcomes</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setAppModalTab('android')
                  setAppModalOpen(true)
                  setMobileNavOpen(false)
                }}
                style={{ width: '100%', textAlign: 'left', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.65rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.92rem' }}
              >
                <span style={{ fontSize: '1.1rem' }}>📲</span>
                <span>Install & Download Native Apps</span>
              </button>

              <div style={{ paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <a
                  href={getWhatsAppInquiryUrl('Hello Eclat Admissions! I need assistance with course enrollment.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{ background: '#22c55e', color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.75rem', borderRadius: '10px', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <span>💬</span>
                  <span>WhatsApp Admissions Desk</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false)
                    setInquiryModalOpen(true)
                  }}
                  className="btn btn-sm"
                  style={{ background: '#d4af37', color: '#0c0e12', fontWeight: 900, textAlign: 'center', padding: '0.75rem', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                >
                  🚀 Apply & Enroll in Intake
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false)
                    setShowPortalDesksModal(true)
                  }}
                  className="btn btn-sm btn-primary"
                  style={{ fontWeight: 800, textAlign: 'center', padding: '0.75rem', borderRadius: '10px' }}
                >
                  🔐 Student & Staff Portals
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section: 100% Online Global Academy Billboard */}
      <section
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%)',
          color: '#ffffff',
          padding: isMobile ? '3.5rem 1.25rem 3rem' : '5rem 2rem 4rem',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #1e293b',
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-25%',
            right: '-10%',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            background: '#2563eb',
            opacity: 0.12,
            filter: 'blur(130px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Academy Global Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '999px',
              padding: '0.45rem 1.35rem',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#d4af37',
              letterSpacing: '0.04em',
              marginBottom: '1.75rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <span>🌐</span>
            <span>ÉCLAT INSTITUTE • 100% ONLINE GLOBAL ACADEMY</span>
          </div>

          {/* Master Academy Headline */}
          <h1
            style={{
              fontSize: isMobile ? 'clamp(1.4rem, 6vw, 1.85rem)' : 'clamp(2.5rem, 4.8vw, 3.8rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: isMobile ? 1.25 : 1.15,
              margin: '0 auto 1.25rem',
              maxWidth: '960px',
              color: '#ffffff',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Skills that drive your career forward. <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #d4af37 0%, #fef08a 50%, #d4af37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              100% Online Live Classes & Industry Mentorship
            </span>
          </h1>

          {/* Subtitle establishing all 5 faculties */}
          <p
            style={{
              maxWidth: '820px',
              margin: '0 auto 2.25rem',
              fontSize: isMobile ? '1.02rem' : '1.18rem',
              color: '#e2e8f0',
              lineHeight: 1.65,
              fontWeight: 400,
            }}
          >
            Master in-demand <strong style={{ color: '#ffffff', fontWeight: 800 }}>Tech & Software</strong> (React, Node, Python, Cyber), <strong style={{ color: '#ffffff', fontWeight: 800 }}>Data Science & Research</strong> (R, SPSS, Stata), <strong style={{ color: '#ffffff', fontWeight: 800 }}>Creative Arts & Design</strong> (UI/UX, Figma, Graphics), <strong style={{ color: '#ffffff', fontWeight: 800 }}>World Languages</strong> (IELTS, German, Arabic, French), and <strong style={{ color: '#ffffff', fontWeight: 800 }}>Accounting</strong> with live interactive evening classes, expert mentorship, and flexible installment plans.
          </p>

          {/* Primary Academy CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <a
              href="#courses"
              className="btn btn-lg"
              style={{
                background: '#d4af37',
                color: '#0c0e12',
                fontWeight: 900,
                padding: '0.9rem 2.25rem',
                fontSize: '1.02rem',
                borderRadius: '10px',
                boxShadow: '0 10px 24px rgba(212, 175, 55, 0.35)',
                border: 'none',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🚀 Explore All Programs</span>
              <span>↓</span>
            </a>

            <button
              type="button"
              className="btn btn-lg"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                padding: '0.9rem 2rem',
                fontSize: '1.02rem',
                borderRadius: '10px',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setInquiryModalOpen(true)}
            >
              ⚡ Enroll in Intake
            </button>

            <a
              href={getWhatsAppInquiryUrl('Hello Eclat Admissions! I would like details about your 100% online programs.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                fontWeight: 700,
                padding: '0.9rem 1.5rem',
                fontSize: '1rem',
                borderRadius: '10px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>💬</span>
              <span>WhatsApp Counselor</span>
            </a>
          </div>

          {/* Academy Value Props Trust Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1.75rem',
              flexWrap: 'wrap',
              fontSize: '0.88rem',
              color: '#cbd5e1',
              fontWeight: 600,
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#22c55e' }}>✓</span> ⭐️ 4.9/5 Student Satisfaction
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#22c55e' }}>✓</span> 100% Virtual Evening & Weekend Cohorts
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#22c55e' }}>✓</span> Verified Digital Certificates
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#22c55e' }}>✓</span> 50% Flexible Monthly Installments
            </span>
          </div>
        </div>
      </section>

      {/* Featured Scheduled Academic Intakes & Enrollments */}
      <IntakeAdvertsSection />

      {/* Featured Courses Spotlight: Interactive Animated Promotional Carousel Banner */}
      <section
        onMouseEnter={() => setHeroSliderPaused(true)}
        onMouseLeave={() => setHeroSliderPaused(false)}
        style={{
          background: HERO_PROMO_SLIDES[currentHeroSlide].gradient,
          color: '#ffffff',
          padding: isMobile ? '1.5rem 0.85rem' : '2.75rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #1e293b',
          transition: 'background 0.7s ease',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 2, boxSizing: 'border-box', width: '100%' }}>
          {/* Spotlight Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.15rem' }}>✨</span>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  FEATURED ONLINE PROGRAM SPOTLIGHT
                </div>
                <div style={{ fontSize: isMobile ? '0.98rem' : '1.1rem', fontWeight: 900, color: '#ffffff' }}>
                  {HERO_PROMO_SLIDES[currentHeroSlide].category}
                </div>
              </div>
            </div>

            {/* Prev / Next & Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setCurrentHeroSlide((prev) => (prev === 0 ? HERO_PROMO_SLIDES.length - 1 : prev - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Previous Slide"
              >
                ❮
              </button>

              <div style={{ display: 'flex', gap: '4px', padding: '0 4px' }}>
                {HERO_PROMO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentHeroSlide(idx)}
                    style={{
                      width: currentHeroSlide === idx ? '20px' : '7px',
                      height: '7px',
                      borderRadius: '999px',
                      background: currentHeroSlide === idx ? '#d4af37' : 'rgba(255, 255, 255, 0.25)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: 0,
                    }}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % HERO_PROMO_SLIDES.length)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Next Slide"
              >
                ❯
              </button>
            </div>
          </div>

          {/* Slide Card Content */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(16px)',
              border: `1.5px solid ${HERO_PROMO_SLIDES[currentHeroSlide].accentColor}40`,
              borderRadius: isMobile ? '14px' : '20px',
              padding: isMobile ? '1.25rem 1rem' : '2rem 2.5rem',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1.4fr 0.6fr',
              gap: isMobile ? '1.25rem' : '2rem',
              alignItems: 'center',
              boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
              boxSizing: 'border-box',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: HERO_PROMO_SLIDES[currentHeroSlide].badgeBg,
                    color: HERO_PROMO_SLIDES[currentHeroSlide].badgeColor,
                    border: `1px solid ${HERO_PROMO_SLIDES[currentHeroSlide].badgeColor}50`,
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: isMobile ? '0.72rem' : '0.78rem',
                    fontWeight: 800,
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                  }}
                >
                  {HERO_PROMO_SLIDES[currentHeroSlide].badge}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                  🟢 Live Cohort Enrolling
                </span>
              </div>

              <h2
                style={{
                  fontSize: isMobile ? 'clamp(1.1rem, 4.8vw, 1.35rem)' : '1.85rem',
                  fontWeight: 900,
                  margin: '0 0 0.65rem',
                  color: '#ffffff',
                  lineHeight: 1.25,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                }}
              >
                {HERO_PROMO_SLIDES[currentHeroSlide].headline}: <br />
                <span style={{ color: HERO_PROMO_SLIDES[currentHeroSlide].accentColor, wordBreak: 'break-word' }}>
                  {HERO_PROMO_SLIDES[currentHeroSlide].highlight}
                </span>
              </h2>

              <p style={{ fontSize: isMobile ? '0.86rem' : '0.94rem', color: '#cbd5e1', lineHeight: 1.55, margin: '0 0 1.1rem', maxWidth: '680px', wordBreak: 'break-word' }}>
                {HERO_PROMO_SLIDES[currentHeroSlide].description}
              </p>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', maxWidth: '100%' }}>
                {HERO_PROMO_SLIDES[currentHeroSlide].features.map((feat, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#f8fafc',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                    }}
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Quick Jump & Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', minWidth: 0 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: isMobile ? '0.75rem' : '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Academic Department</div>
                <div style={{ fontSize: isMobile ? '0.92rem' : '1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                  {HERO_PROMO_SLIDES[currentHeroSlide].category}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#d4af37', fontWeight: 700, marginTop: '3px' }}>
                  ⭐ {HERO_PROMO_SLIDES[currentHeroSlide].metricNumber} {HERO_PROMO_SLIDES[currentHeroSlide].metricLabel}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory(HERO_PROMO_SLIDES[currentHeroSlide].category)
                  const el = document.getElementById('courses')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="btn"
                style={{
                  background: '#d4af37',
                  color: '#0c0e12',
                  fontWeight: 900,
                  fontSize: isMobile ? '0.86rem' : '0.92rem',
                  padding: isMobile ? '0.75rem 1rem' : '0.8rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(212, 175, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  textAlign: 'center',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                <span>🚀 {HERO_PROMO_SLIDES[currentHeroSlide].primaryCtaText}</span>
                <span>↓</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights & Value Metrics Section */}
      <section style={{ background: '#090d16', padding: '2.5rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

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

      {/* About Us & Institutional Advantage */}
      <section id="about" style={{ padding: isMobile ? '3.5rem 1rem' : '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div id="why-eclat" style={{ textAlign: 'center', marginBottom: isMobile ? '2.25rem' : '3.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b45309' }}>
            🏛️ ABOUT ÉCLAT INSTITUTE
          </span>
          <h2 style={{ fontSize: isMobile ? '1.75rem' : '2.3rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.75rem', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
            Empowering Modern Learners Worldwide
          </h2>
          <p style={{ fontSize: isMobile ? '0.94rem' : '1.05rem', color: '#334155', maxWidth: '740px', margin: '0 auto', fontWeight: 500, lineHeight: 1.65 }}>
            Éclat Institute is an accredited 100% Online Global Academy. We deliver live virtual lectures, hands-on project labs, and direct mentor code reviews to help students and working professionals excel across 5 key disciplines.
          </p>
        </div>

        {/* 5 Specialized Academic Faculties Grid */}
        <div style={{ marginBottom: isMobile ? '2rem' : '3rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'center', marginBottom: '1.25rem' }}>
            Our 5 Academic Departments
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '💻', name: 'Tech & Software', desc: 'React 19, Node.js REST APIs, PostgreSQL & Ethical Hacking' },
              { icon: '📊', name: 'Data Science & Research', desc: 'Python, RStudio Biostats, SPSS Surveys & Stata Econometrics' },
              { icon: '🎨', name: 'Creative Arts & Design', desc: 'Figma UI/UX Design Systems, Adobe Suite & 3D Animation' },
              { icon: '🗣️', name: 'World Languages & IELTS', desc: 'IELTS Band 8.5+, German Goethe, Arabic & French' },
              { icon: '🧾', name: 'Business Tech & Accounting', desc: 'QuickBooks Pro, VAT Tax Compliance & Payroll' },
            ].map((dept, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem 1rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{dept.icon}</span>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{dept.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px', lineHeight: 1.45 }}>{dept.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Core Institutional Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: isMobile ? '1rem' : '1.75rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
              💻
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Live Virtual Coding & Language Labs
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Interactive live screen-sharing, breakout speaking rooms, live GitHub code reviews, and direct instructor feedback on your projects.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
              ⏰
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Flexible Evening & Weekend Batches
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Attend live online evening sessions (6:00 PM – 9:30 PM) or weekend masterclasses. Missed a class? Watch HD video replays anytime on the portal.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
              📜
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Verified Digital E-Certificates
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Receive cryptographically signed digital certificates with instant QR verification for LinkedIn, remote jobs, and international applications.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
              💳
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Global Flexible Installments ($ USD)
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Affordable international pricing in US Dollars. Pay tuition seamlessly via Visa, Mastercard, PayPal, Bank Wire, or Mobile Money with 2 flexible installments.
            </p>
          </div>
        </div>

        {/* Read Full Institutional Profile & Accreditation Banner */}
        <div
          style={{
            marginTop: '2.5rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            borderRadius: '16px',
            padding: isMobile ? '1.5rem 1.25rem' : '2rem 2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🌟 Deep-Dive Institutional Profile
            </div>
            <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0 0.35rem' }}>
              Discover Our Mission, Global Faculty & Accreditation
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, maxWidth: '650px' }}>
              Explore our hybrid-live pedagogy, academic leadership profiles, cryptographic certificate security, and 5 specialized academic departments.
            </p>
          </div>

          <Link
            to="/about"
            className="btn btn-primary"
            style={{
              padding: '0.75rem 1.5rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              borderRadius: '10px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            }}
          >
            🏛️ Read Full About Page →
          </Link>
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
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {[
                { id: 'All', label: '🔥 All Programs', count: coursesList.length },
                { id: 'Data Science & Research', label: '📊 Data, R & SPSS', count: coursesList.filter((c) => c.category === 'Data Science & Research').length },
                { id: 'Tech & Programming', label: '💻 Tech & Software', count: coursesList.filter((c) => c.category === 'Tech & Programming').length },
                { id: 'Creative Arts & Design', label: '🎨 Creative Arts & Design', count: coursesList.filter((c) => c.category === 'Creative Arts & Design').length },
                { id: 'Languages & Communication', label: '🗣️ Languages & IELTS', count: coursesList.filter((c) => c.category === 'Languages & Communication').length },
                { id: 'Computer & Digital Skills', label: '🖥️ Digital Literacy', count: coursesList.filter((c) => c.category === 'Computer & Digital Skills').length },
                { id: 'Business Tech & Accounting', label: '🧾 Accounting & Tax', count: coursesList.filter((c) => c.category === 'Business Tech & Accounting').length },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  style={{
                    background: activeCategory === cat.id ? '#0f172a' : '#ffffff',
                    color: activeCategory === cat.id ? '#ffffff' : '#334155',
                    border: `1.5px solid ${activeCategory === cat.id ? '#0f172a' : '#cbd5e1'}`,
                    borderRadius: '999px',
                    padding: '0.55rem 1.15rem',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(15, 23, 42, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span>{cat.label}</span>
                  <span
                    style={{
                      background: activeCategory === cat.id ? '#d4af37' : '#e2e8f0',
                      color: activeCategory === cat.id ? '#0c0e12' : '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      padding: '2px 7px',
                      borderRadius: '999px',
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
              Showing <strong style={{ color: '#0f172a' }}>{filteredCourses.length}</strong> program{filteredCourses.length === 1 ? '' : 's'}
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
                  border: course.bestseller ? '2px solid #d4af37' : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: course.bestseller ? '0 8px 24px -4px rgba(212, 175, 55, 0.25)' : '0 4px 12px -2px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 16px 32px -4px rgba(0, 0, 0, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = course.bestseller ? '0 8px 24px -4px rgba(212, 175, 55, 0.25)' : '0 4px 12px -2px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Udemy-Style Card Visual Banner / Thumbnail Header */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${(course.tagColor || '#2563eb')}15 0%, #ffffff 100%)`,
                    borderBottom: '1px solid #f1f5f9',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}
                    >
                      {course.icon || '🎓'}
                    </div>
                    <div>
                      <span
                        style={{
                          background: `${(course.tagColor || '#2563eb')}20`,
                          color: course.tagColor || '#2563eb',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {course.category ? course.category.split('&')[0] : 'Online Course'}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        🌐 100% Online Cohort
                      </div>
                    </div>
                  </div>

                  {course.bestseller ? (
                    <span
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fcd34d',
                        fontWeight: 900,
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      ★ Bestseller
                    </span>
                  ) : (
                    <span
                      style={{
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {course.discountBadge || '50% OFF'}
                    </span>
                  )}
                </div>

                {/* Main Card Body */}
                <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Course Title */}
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        color: '#0f172a',
                        margin: '0 0 0.35rem',
                        lineHeight: 1.35,
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {course.title}
                    </h3>

                    {/* Instructor Line */}
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.65rem' }}>
                      👨‍🏫 {course.instructor || 'Éclat Senior Faculty & Industry Expert'}
                    </div>

                    {/* Udemy-Style Rating & Student Count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#b45309', fontSize: '0.92rem', fontWeight: 900 }}>{(course.rating || 4.9).toFixed(1)}</strong>
                      <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★★★★★</span>
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>({(course.ratingCount || 1240).toLocaleString()})</span>
                      <span style={{ color: '#94a3b8' }}>•</span>
                      <span style={{ color: '#0369a1', fontSize: '0.78rem', fontWeight: 700 }}>{(course.studentsEnrolled || 2800).toLocaleString()} students</span>
                    </div>

                    {/* Schedule & Duration Meta */}
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: '#334155', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
                        ⏱️ {course.duration || '8 Weeks'}
                      </span>
                      <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
                        📅 {course.schedule ? course.schedule.split('/')[0] : 'Flexible Online Schedule'}
                      </span>
                    </div>

                    {/* Career Outcome */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Target Career Role:</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                        💼 {course.careerOutcome || 'Career Certification Track'}
                      </div>
                    </div>

                    {/* Key Skills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                      {(course.skills || []).slice(0, 3).map((s) => (
                        <span
                          key={s}
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            borderRadius: '4px',
                            padding: '2px 7px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                          }}
                        >
                          ✓ {s}
                        </span>
                      ))}
                      {(course.skills || []).length > 3 && (
                        <span style={{ color: '#64748b', fontSize: '0.72rem', padding: '2px 4px' }}>
                          +{(course.skills || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Practical Syllabus Button */}
                  {course.syllabus && course.syllabus.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <button
                        type="button"
                        style={{
                          background: '#f8fafc',
                          border: '1px dashed #94a3b8',
                          borderRadius: '8px',
                          padding: '0.45rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#2563eb',
                          cursor: 'pointer',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        onClick={() => setSelectedCourseForModal(course)}
                      >
                        <span>📖 View Full Syllabus & Labs</span>
                        <span>→</span>
                      </button>
                    </div>
                  )}

                  {/* Udemy-Style Pricing & Direct Enrollment CTA */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{course.fee}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>/ KES {((course.feeUsd || Number(course.fee?.replace(/[^0-9]/g, '')) || 60) * 130).toLocaleString()}</span>
                        <span style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }}>{course.originalFee || `$${(course.feeUsd || 60) * 2}`}</span>
                        <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 800 }}>{course.discountBadge || '50% OFF'}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        {course.installment}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          fontWeight: 800,
                          borderRadius: '8px',
                          padding: '0.6rem 1.15rem',
                          fontSize: '0.85rem',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        }}
                        onClick={() => handleOpenCourseApplication(course)}
                      >
                        ⚡ Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive M-Pesa Fee Calculator & Admission Estimator */}
      <section id="calculator" style={{ background: '#f1f5f9', padding: '4.5rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
              TRANSPARENT TUITION CALCULATOR
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.5rem' }}>
              Instant Tuition & Installment Estimator
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '600px', margin: '0 auto' }}>
              Choose your course and installment structure to view your exact payment breakdown before registration.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div>
                <label className="label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>1. Select Program or Course</span>
                  <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #bfdbfe' }}>▼ Click to change</span>
                </label>
                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                  <select
                    className="input"
                    value={calcCourseId}
                    onChange={(e) => setCalcCourseId(e.target.value)}
                    style={{
                      fontWeight: 700,
                      fontSize: '0.94rem',
                      color: '#0f172a',
                      background: '#ffffff',
                      border: '2px solid #94a3b8',
                      borderRadius: '12px',
                      padding: '0.85rem 2.75rem 0.85rem 1rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      width: '100%',
                    }}
                  >
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id} style={{ color: '#0f172a', background: '#ffffff', padding: '8px' }}>
                        {c.icon} {c.title} — ({c.fee})
                      </option>
                    ))}
                  </select>
                </div>

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
                    <div>🔒 <strong>Flexible Payment:</strong> Visa, Mastercard, Bank Wire, Mobile Money</div>
                    <div style={{ color: '#93c5fd', marginTop: '3px' }}>⚡ Official invoice & payment details are presented at checkout when enrolling.</div>
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

      {/* Official Multi-Platform Learning Apps Showcase Section */}
      <section id="app-download" style={{ background: '#0a0f1d', color: '#ffffff', padding: '5rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
              OFFICIAL LEARNING APPLICATIONS
            </span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0 0.75rem', fontFamily: 'var(--font-heading)' }}>
              Study Anywhere on Dedicated Desktop & Mobile Apps
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', maxWidth: '750px', margin: '0 auto', fontWeight: 500 }}>
              Download our dedicated mobile and desktop applications to study offline, attend live lectures, and track your coursework anywhere.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Android Mobile App Card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '20px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
                  🤖
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem' }}>
                  Android Mobile App (.APK)
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Take your entire college in your pocket. Live video classes, swipe-to-refresh cloud sync, and instant timetable push alerts.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>✓ Offline E-Library & Study Materials</li>
                  <li>✓ Swipe Down Pull-to-Refresh Gesture</li>
                  <li>✓ Pinch-to-Zoom Textbook Reader</li>
                  <li>✓ Instant Cloud Attendance & Grades</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAppModalTab('android')
                  setAppModalOpen(true)
                }}
                className="btn"
                style={{ background: '#16a34a', color: '#ffffff', fontWeight: 800, padding: '0.85rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)' }}
              >
                <span>🤖</span>
                <span>Download Android App (.APK)</span>
              </button>
            </div>

            {/* Windows Desktop App Card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '20px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
                  💻
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem' }}>
                  Windows Desktop App (.EXE)
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Built for focused learning on PC. Full-screen lecture viewer, offline digital library, and fast note-taking.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>✓ Distraction-Free Full Screen Study</li>
                  <li>✓ Zoom Controls & Dynamic Text Resizing</li>
                  <li>✓ 1-Click Registration Slip & Fee Printing</li>
                  <li>✓ Windows 10 & 11 64-bit Compatible</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAppModalTab('windows')
                  setAppModalOpen(true)
                }}
                className="btn btn-primary"
                style={{ fontWeight: 800, padding: '0.85rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}
              >
                <span>💻</span>
                <span>Download Windows App (.EXE)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Graduate Success Stories & Reviews */}
      <section id="testimonials" style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
            STUDENT REVIEWS
          </span>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.75rem' }}>
            Real Alumni. Real Career Transformations.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#334155', maxWidth: '650px', margin: '0 auto', fontWeight: 500 }}>
            Hear how our practical live online classes and mentor reviews helped students land rewarding jobs and scale their skills.
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
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ color: '#f59e0b', fontSize: '1.1rem' }}>
                    {'★'.repeat(t.rating)}
                  </div>
                  {t.location && (
                    <span
                      style={{
                        background: '#f8fafc',
                        color: '#475569',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {t.location}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.98rem', color: '#0f172a', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.5rem', fontWeight: 500 }}>
                  "{t.quote}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', border: '1px solid #bfdbfe' }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 700 }}>{t.role}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Alumni • {t.course}</div>
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
              <div>💳 <strong>Card Payment:</strong> Debit / Credit Card (Visa, Mastercard & Prepaid)</div>
              <div>🏦 <strong>Bank Wire & Mobile Money:</strong> Instant automated invoices generated upon registration</div>
              <div>💰 <strong>Installment Plan:</strong> 2 flexible parts accepted (50% on admission)</div>
              <div>📑 <strong>Receipts:</strong> Official stamped digital receipts with instant QR verification</div>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ffffff', color: '#065f46', fontWeight: 800, padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                onClick={() => setInquiryModalOpen(true)}
              >
                💳 Enroll & Proceed to Payment Desk →
              </button>
            </div>
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
              <a href="#courses" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>🗣️ Arabic, French & German Languages</a>
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
            © {new Date().getFullYear()} <strong style={{ color: '#e2e8f0' }}>Éclat Institute</strong>. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/about" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700 }}>🏛️ About Us</Link>
            <Link to="/courses" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Courses</Link>
            <Link to="/library" style={{ color: '#cbd5e1', textDecoration: 'none' }}>E-Library</Link>
            <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
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

      {/* 2. Official Multi-Platform App Download & Installation Center Modal */}
      {appModalOpen && (
        <div className="modal-overlay" onClick={() => setAppModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: isMobile ? '1.5rem 1.25rem' : '1.85rem 1.75rem',
              borderRadius: '24px',
              maxWidth: '540px',
              width: '92vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)', flexShrink: 0 }}>
                  <img src="/logo.png" alt="Éclat Emblem" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '1.15rem' : '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                    Install Éclat Apps
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
                    Study on your phone, tablet, or PC with video lessons & library
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAppModalOpen(false)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                ✕
              </button>
            </div>

            {/* Platform Segmented Switcher (Native Platforms) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '1.25rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '14px' }}>
              <button
                type="button"
                onClick={() => setAppModalTab('android')}
                style={{
                  padding: '0.7rem 0.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: appModalTab === 'android' ? 800 : 600,
                  fontSize: '0.88rem',
                  background: appModalTab === 'android' ? '#ffffff' : 'transparent',
                  color: appModalTab === 'android' ? '#166534' : '#64748b',
                  boxShadow: appModalTab === 'android' ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>🤖</span>
                <span>Android (.APK)</span>
              </button>

              <button
                type="button"
                onClick={() => setAppModalTab('windows')}
                style={{
                  padding: '0.7rem 0.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: appModalTab === 'windows' ? 800 : 600,
                  fontSize: '0.88rem',
                  background: appModalTab === 'windows' ? '#ffffff' : 'transparent',
                  color: appModalTab === 'windows' ? '#1e40af' : '#64748b',
                  boxShadow: appModalTab === 'windows' ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>💻</span>
                <span>Windows PC (.EXE)</span>
              </button>
            </div>

            {/* TAB CONTENT: ANDROID */}
            {appModalTab === 'android' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '18px', padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>🤖</span>
                      <strong style={{ fontSize: '1.05rem', color: '#166534' }}>Official Android Learning App</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '0.2rem 0.55rem', borderRadius: '20px', border: '1px solid #86efac' }}>
                      v1.0.0 • 31 MB
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#15803d', lineHeight: 1.55, margin: '0 0 1rem', fontWeight: 500 }}>
                    Access your enrolled courses, watch interactive video lectures, download lecture notes, and take exams directly on your phone.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.15rem' }}>
                    <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #dcfce7', fontSize: '0.78rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <span>📚</span>
                      <span>Offline Study & Notes</span>
                    </div>
                    <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #dcfce7', fontSize: '0.78rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <span>⚡</span>
                      <span>Fast Cloud Auto-Sync</span>
                    </div>
                  </div>

                  <a
                    href="https://github.com/Smart-009/brent1_college/releases/latest/download/eclat-institute.apk"
                    download="eclat-institute.apk"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.85rem',
                      borderRadius: '12px',
                      fontSize: '0.94rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>📥</span>
                    <span>Download Android App (.APK)</span>
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>🛡️</span>
                  <span>100% Virus-Free & Verified Official Package</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: WINDOWS PC */}
            {appModalTab === 'windows' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '18px', padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>💻</span>
                      <strong style={{ fontSize: '1.05rem', color: '#1e40af' }}>Windows Desktop Learning App</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', background: '#dbeafe', padding: '0.2rem 0.55rem', borderRadius: '20px', border: '1px solid #93c5fd' }}>
                      64-bit • Windows 10/11
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#1d4ed8', lineHeight: 1.55, margin: '0 0 1rem', fontWeight: 500 }}>
                    Dedicated learning workstation for Windows with full-screen lecture viewing, fast note-taking, and digital library reader.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.15rem' }}>
                    <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #dbeafe', fontSize: '0.78rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <span>💻</span>
                      <span>Desktop Study Hub</span>
                    </div>
                    <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #dbeafe', fontSize: '0.78rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <span>🖨️</span>
                      <span>Direct Slips & Prints</span>
                    </div>
                  </div>

                  <a
                    href="/downloads/eclat-institute-setup.exe"
                    download="eclat-institute-setup.exe"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.85rem',
                      borderRadius: '12px',
                      fontSize: '0.94rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>📥</span>
                    <span>Download Windows Installer (.EXE)</span>
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>🛡️</span>
                  <span>100% Virus-Free & Verified Official Package</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. College Portals & Management Desks Modal */}
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
          <div
            className="modal-content modal-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '1.75rem',
              borderRadius: '18px',
              maxHeight: '90vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: 0, paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                  }}
                >
                  {selectedCourseForModal.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: selectedCourseForModal.tagColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {selectedCourseForModal.tag}
                  </div>
                  <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a', margin: '2px 0 0', lineHeight: 1.25 }}>
                    {selectedCourseForModal.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedCourseForModal(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: '#475569',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Course Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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

            {/* Modal Actions (Sticky at bottom) */}
            <div style={{ position: 'sticky', bottom: '-1.75rem', background: '#ffffff', padding: '1rem 0 0', marginTop: 'auto', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap', zIndex: 10 }}>
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

      {/* Sleek Modern Floating Support Desk (WhatsApp / Admissions Live Desk) */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9990, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {supportModalOpen && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.4rem',
              boxShadow: '0 20px 48px rgba(15, 23, 42, 0.25)',
              border: '1px solid #e2e8f0',
              width: '320px',
              animation: 'fadeIn 0.2s ease',
              marginBottom: '12px',
              textAlign: 'left',
            }}
          >
            {/* Counselor Avatar & Online Status Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src="/logo.png"
                    alt="Éclat Admissions Desk"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      right: '0px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      border: '2px solid #ffffff',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>Éclat Admissions Desk</div>
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>● Online • Ready to Assist</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close Support Desk"
              >
                ✕
              </button>
            </div>

            {/* Friendly Greeting Message */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 0.85rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem' }}>
              👋 <strong>Hi there!</strong> Have questions about our 100% online programs, tuition installment plans, or live class schedules? Connect with our virtual admissions team:
            </div>

            {/* Support Action Triggers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <a
                href={getWhatsAppInquiryUrl('Hello Eclat Admissions! I need assistance with course enrollment & tuition.')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  padding: '0.7rem 1rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>💬</span>
                <span>WhatsApp ({INSTITUTION_CONFIG.contact.phone})</span>
              </a>

              <a
                href={`tel:${INSTITUTION_CONFIG.contact.phoneRaw}`}
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1.5px solid #bfdbfe',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>📞</span>
                <span>Call Hotline: {INSTITUTION_CONFIG.contact.phone}</span>
              </a>

              <a
                href={`mailto:${INSTITUTION_CONFIG.contact.admissionsEmail}`}
                style={{
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>✉️</span>
                <span>Email Admissions Registry</span>
              </a>
            </div>
          </div>
        )}

        {/* Circular Floating Messenger Bubble */}
        <button
          type="button"
          onClick={() => setSupportModalOpen(!supportModalOpen)}
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            color: '#ffffff',
            border: '3px solid #ffffff',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            position: 'relative',
            transition: 'transform 0.2s',
          }}
          title={`Live Admissions & WhatsApp Support (${INSTITUTION_CONFIG.contact.phone})`}
        >
          {supportModalOpen ? (
            <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>✕</span>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          )}
          {!supportModalOpen && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 900,
              }}
            >
              1
            </span>
          )}
        </button>
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          style={{
            position: 'fixed',
            bottom: isMobile ? '86px' : '96px',
            right: '24px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            border: '2px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 900,
            zIndex: 90,
            transition: 'all 0.2s ease',
          }}
        >
          ↑
        </button>
      )}
    </div>
  )
}
