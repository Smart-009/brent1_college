import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { NativeAppHome } from './NativeAppHome'
import { DesktopAppHome } from './DesktopAppHome'
import { isElectronApp, isCapacitorApp, OFFICIAL_APKPURE_URL, OFFICIAL_APK_URL } from '@/utils/platform'
import { DesktopCommandPalette } from '@/components/shared/DesktopCommandPalette'
import { supabase } from '@/lib/supabase'
import { schoolStore } from '@/lib/schoolData'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'
import { OFFICIAL_COURSES, getDynamicCoursesList } from '@/config/officialCourses'
import { getCoursePhoto } from '@/config/courseImages'
import { IntakeAdvertsSection } from './IntakeAdvertsSection'
import { CertificateGenerator, CertificateData, SAMPLE_CERTIFICATES } from '@/components/shared/CertificateGenerator'
import { initializePaystackCheckout } from '@/lib/paystack'
import type { Role, Profile } from '@/lib/database.types'
import {
  HomeIcon,
  BookOpenIcon,
  LibraryIcon,
  BuildingIcon,
  BriefcaseIcon,
  LaptopIcon,
  CodeIcon,
  DatabaseIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  GlobeIcon,
  GraduationCapIcon,
  SearchIcon,
  ClockIcon,
  CalendarIcon,
  SparklesIcon,
  CheckIcon,
  MessageCircleIcon,
  LockIcon,
  RefreshCwIcon,
  UserIcon,
  UsersIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MenuIcon,
  FlaskIcon,
  RocketIcon,
  AwardIcon,
  CalculatorIcon,
  PaletteIcon,
  BoxIcon,
  BritishShieldIcon,
  PhoneIcon,
  MailIcon,
  CreditCardIcon,
  PrinterIcon,
  SmartphoneIcon,
  FileTextIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  StarIcon,
  VideoIcon,
  CourseIcon,
  ArrowRightIcon,
  HeartHandshakeIcon,
  LayoutGridIcon,
  LayoutListIcon,
} from '@/components/icons/AppIcons'

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
  imageUrl?: string
  delivery_mode?: 'live_cohort' | 'self_paced'
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
  fee: c.feeDisplay || (c.feeUsd ? `$${c.feeUsd}` : 'Available upon request'),
  feeUsd: c.feeUsd,
  feeKes: c.feeKes,
  feeDisplay: c.feeDisplay,
  originalFee: c.originalFeeUsd ? `$${c.originalFeeUsd}` : 'Available upon request',
  discountBadge: c.discountBadge,
  rating: c.rating,
  ratingCount: c.ratingCount,
  studentsEnrolled: c.studentsEnrolled,
  instructor: c.instructor,
  installment: c.installmentText || 'Flexible payments available via Paystack',
  delivery_mode: c.delivery_mode,
  careerOutcome: c.careerOutcome,
  skills: c.skills,
  icon: c.icon,
  imageUrl: getCoursePhoto(c.id, c.category, c.title),
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
    countryCode: 'United Kingdom',
    course: 'R Programming & Biostatistics',
    avatar: 'MV',
    quote:
      'The hands-on training in RStudio, tidyverse data pipelines, and biostatistical regression models at Éclat was world-class. I was able to automate our NHS hospital trust epidemiological reporting with total precision!',
    rating: 5,
  },
  {
    name: 'Clara Schneider',
    role: 'Frontend Software Engineer at SaaS Enterprise',
    location: 'Frankfurt, Germany',
    countryCode: 'Germany',
    course: 'Full-Stack Web Dev (React 19 & Node.js)',
    avatar: 'CS',
    quote:
      'Enrolling in Éclat’s React 19 and Node.js course from Germany was the best career decision I made. The live interactive coding labs, GitHub pull request reviews, and API deployments prepared me to land my software developer role.',
    rating: 5,
  },
  {
    name: 'Tariq Al-Hashimi',
    role: 'Regional Operations Director at Logistics Group',
    location: 'Dubai, United Arab Emirates',
    countryCode: 'UAE',
    course: 'Arabic for Business & Corporate Careers',
    avatar: 'TA',
    quote:
      'Taking the live online Arabic and Corporate Communication classes gave me the exact executive fluency required for regional boardroom negotiations and business expansion across the Gulf Cooperation Council (GCC).',
    rating: 5,
  },
  {
    name: 'Ethan Miller',
    role: 'Senior Quantitative Research Lead',
    location: 'Toronto, Canada',
    countryCode: 'Canada',
    course: 'IBM SPSS & Stata Econometric Modeling',
    avatar: 'EM',
    quote:
      'The survey coding in SPSS and multi-level panel regressions in Stata were broken down into practical steps by Éclat’s research methodologists. We used these exact techniques to publish our international health economics study.',
    rating: 5,
  },
  {
    name: 'Alexander Hayes',
    role: 'Remote Software Engineer at HealthTech',
    location: 'Austin, Texas, USA',
    countryCode: 'United States',
    course: 'Full-Stack JavaScript & React 19',
    avatar: 'AH',
    quote:
      'The 100% online React 19 and Node.js course at Éclat was phenomenal. The live coding labs and mentor code reviews prepared me to build scalable full-stack applications. Right after graduating, I landed a remote developer role!',
    rating: 5,
  },
  {
    name: 'Sophie Dubois',
    role: 'Postgraduate Scholar (IELTS Band 8.5 Achieved)',
    location: 'Lyon, France / Montreal, Canada',
    countryCode: 'France',
    course: 'IELTS Academic Preparation',
    avatar: 'SD',
    quote:
      'The 1-on-1 live Zoom mock speaking sessions and Cambridge essay evaluations transformed my performance. I achieved an overall Band 8.5 on my first attempt and secured my Canadian academic visa effortlessly!',
    rating: 5,
  },
  {
    name: 'Liam O’Connor',
    role: 'Cyber Threat Intelligence & SOC Analyst',
    location: 'Dublin, Ireland',
    countryCode: 'Ireland',
    course: 'Cybersecurity & Ethical Hacking',
    avatar: 'LO',
    quote:
      'The practical network security labs using Wireshark, vulnerability scanning, and incident response simulations gave me the technical edge to pass my global security exams and secure a senior SOC analyst position.',
    rating: 5,
  },
  {
    name: 'Elena Rostova',
    role: 'Financial Controller & QuickBooks Specialist',
    location: 'Berlin, Germany',
    countryCode: 'Germany',
    course: 'Computerized Accounting & QuickBooks',
    avatar: 'ER',
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
    id: 'home-schooling',
    badge: 'FULL-TIME BRITISH CURRICULUM ONLINE SCHOOL',
    badgeBg: 'rgba(34, 197, 94, 0.25)',
    badgeColor: '#4ade80',
    headline: 'Online Home Schooling (Years 7-11)',
    highlight: 'Integrated Cohorts • Cambridge & Edexcel Dual Track',
    description: 'Full-time British Curriculum schooling from home. Live interactive classes covering all core subjects together (Maths, Sciences, English, Humanities, Computer Science), weekly assessments, termly report cards, and physical exam center placement (KE042 / EDX-98421).',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(34, 197, 94, 0.35) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #052e16 0%, #166534 50%, #0f172a 100%)',
    accentColor: '#4ade80',
    icon: 'homeschooling',
    metricNumber: 'Years 7-11',
    metricLabel: 'Full-Time Structured Timetable',
    category: 'Home Schooling',
    primaryCtaText: 'Explore Home Schooling Programs',
    features: ['Cohesive Cohorts (All Subjects)', 'Cambridge & Edexcel Dual Track', 'Termly Progress & Report Cards', 'Physical Exam Center Placement'],
  },
  {
    id: 'private-tuition',
    badge: 'PRIVATE 1-ON-1 & EVENING TUITION CLINICS',
    badgeBg: 'rgba(245, 158, 11, 0.25)',
    badgeColor: '#fbbf24',
    headline: 'IGCSE & Checkpoint Private Tuition Masterclasses',
    highlight: '1-on-1 Personalized Mentorship & Evening Boosters',
    description: 'Targeted exam performance clinics for Cambridge (0580, 0625, 0620, 0478, 0500) and Edexcel (4MA1, 4PH1, 4CH1, 4CP0). 1-on-1 private tutoring, after-school booster groups, mark scheme mastery, and examiner-led past paper clinics.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(245, 158, 11, 0.35) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #451a03 0%, #b45309 50%, #0f172a 100%)',
    accentColor: '#fbbf24',
    icon: 'tuition',
    metricNumber: '100%',
    metricLabel: 'Personalized 1-on-1 Attention',
    category: 'Tuition & Boosters',
    primaryCtaText: 'Book Tuition & Booster Sessions',
    features: ['1-on-1 Dedicated Tutor Option', 'Past Paper & Mark Scheme Clinics', 'Evening & Weekend Slots', 'Guaranteed Grade Improvement'],
  },
  {
    id: 'cambridge-igcse',
    badge: 'CAMBRIDGE ASSESSMENT INTERNATIONAL (CENTER KE042)',
    badgeBg: 'rgba(2, 132, 199, 0.25)',
    badgeColor: '#38bdf8',
    headline: 'Cambridge IGCSE & Lower Secondary (Years 9-11)',
    highlight: 'Registered Exam Venue (KE042) • Dual 9-1 & A*-G',
    description: 'Master Cambridge IGCSE Mathematics (0580), Physics (0625), Chemistry (0620), Computer Science (0478), English (0500), and Business Studies (0450). Live international exam prep and Cambridge ICE Diploma.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(2, 132, 199, 0.35) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #022c22 0%, #0369a1 50%, #0f172a 100%)',
    accentColor: '#38bdf8',
    icon: 'cambridge-igcse',
    metricNumber: 'KE042',
    metricLabel: 'Cambridge Registered Centre',
    category: 'Cambridge International (Years 9-11)',
    primaryCtaText: 'Explore Cambridge IGCSE Courses',
    features: ['Dual 9-1 & A*-G Scale', 'Cambridge ICE Group Diploma', 'Weekly Past Paper Labs', 'Center KE042 Statements'],
  },
  {
    id: 'edexcel-igcse',
    badge: 'PEARSON EDEXCEL INTERNATIONAL (CENTER EDX-98421)',
    badgeBg: 'rgba(239, 68, 68, 0.25)',
    badgeColor: '#f87171',
    headline: 'Pearson Edexcel International GCSE (Years 9-11)',
    highlight: 'Linear 9-1 Rigor • Mathematics A 4MA1 & Physics 4PH1',
    description: 'Specialized Pearson Edexcel International GCSE (9-1) curriculum: Mathematics A (4MA1 Higher Tier), Physics (4PH1), Computer Science (4CP0), Business (4BS1), and iLowerSecondary Year 9 foundation.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(239, 68, 68, 0.35) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #450a0a 0%, #991b1b 50%, #0f172a 100%)',
    accentColor: '#f87171',
    icon: 'edexcel-igcse',
    metricNumber: 'EDX-98421',
    metricLabel: 'Pearson Edexcel Centre',
    category: 'Pearson Edexcel International (Years 9-11)',
    primaryCtaText: 'Explore Pearson Edexcel Courses',
    features: ['Linear Numerical 9-1 Scale', '4MA1 Higher Tier Papers 1H & 2H', 'Onscreen Python Coding (4CP0)', 'Edexcel High Achiever Award'],
  },
  {
    id: 'data-research',
    badge: 'DATA SCIENCE & STATISTICAL RESEARCH',
    badgeBg: 'rgba(2, 132, 199, 0.2)',
    badgeColor: '#38bdf8',
    headline: 'Master Python, R, SPSS & Stata',
    highlight: 'Statistical Computing, Econometrics & Biostatistics',
    description: 'From survey data cleaning & thesis statistical analysis to multivariate regression modeling, RStudio tidyverse pipelines, and Stata do-files. Taught by senior research methodologists.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(2, 132, 199, 0.28) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #030712 0%, #082f49 50%, #030712 100%)',
    accentColor: '#38bdf8',
    icon: 'data-research',
    metricNumber: '4,200+',
    metricLabel: 'Researchers & Analysts Certified',
    category: 'Data Science & Research',
    primaryCtaText: 'Explore Data & Stats Programs',
    features: ['RStudio & Biostatistics', 'IBM SPSS Survey Stats', 'Stata Econometrics', 'Python & SQL Analytics'],
  },
  {
    id: 'tech-software',
    badge: 'TECH & SOFTWARE ENGINEERING',
    badgeBg: 'rgba(99, 102, 241, 0.2)',
    badgeColor: '#a5b4fc',
    headline: 'Build Scalable Web Applications &',
    highlight: 'Defend Enterprise Cyber Infrastructure',
    description: 'Master React 19, Node.js REST APIs, PostgreSQL databases, and Ethical Hacking with live interactive coding rooms, GitHub code reviews, and cloud container deployments.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.28) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #030712 0%, #1e1b4b 50%, #030712 100%)',
    accentColor: '#818cf8',
    icon: 'tech-software',
    metricNumber: '3,850+',
    metricLabel: 'Developers & SOC Analysts Trained',
    category: 'Tech & Programming',
    primaryCtaText: 'Explore Software & Tech Cohorts',
    features: ['React 19 & Full-Stack', 'Node.js Express APIs', 'Cybersecurity Ops', 'Cloud & Git Portfolios'],
  },
  {
    id: 'creative-design',
    badge: 'CREATIVE ARTS & DIGITAL DESIGN',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
    badgeColor: '#c084fc',
    headline: 'Master UI/UX Product Design &',
    highlight: 'Motion Graphics, Figma & Visual Arts',
    description: 'From wireframing and design systems in Figma to motion animation, branding in Adobe Illustrator/Photoshop, 3D modeling, and video editing. Taught by senior creative directors.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.25) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #030712 0%, #3b0764 50%, #030712 100%)',
    accentColor: '#c084fc',
    icon: 'creative-design',
    metricNumber: '2,900+',
    metricLabel: 'Designers & Creatives Certified',
    category: 'Creative Arts & Design',
    primaryCtaText: 'Explore Creative Arts & Design',
    features: ['Figma UI/UX Design Systems', 'Graphic Design & Branding', '3D Blender Animation', 'Motion Graphics & Video'],
  },
  {
    id: 'world-languages',
    badge: 'WORLD LANGUAGES & RELOCATION',
    badgeBg: 'rgba(34, 197, 94, 0.2)',
    badgeColor: '#4ade80',
    headline: 'Score IELTS Band 8.5+ & Master',
    highlight: 'Arabic, German, French & English',
    description: 'Targeting UK, Canada, USA, Europe, or Gulf careers? Master Spoken English, Arabic for Middle East jobs, Goethe-Zertifikat German, and French DELF with live certified examiners.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(34, 197, 94, 0.25) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #030712 0%, #064e3b 50%, #030712 100%)',
    accentColor: '#4ade80',
    icon: 'world-languages',
    metricNumber: '5,600+',
    metricLabel: 'Successful Global Visa Students',
    category: 'Languages & Communication',
    primaryCtaText: 'Explore World Languages & IELTS',
    features: ['1-on-1 IELTS Speaking Mocks', 'German Goethe Prep', 'Arabic for Gulf Careers', 'French DELF A1-B2'],
  },
  {
    id: 'accounting-finance',
    badge: 'ACCOUNTING, QUICKBOOKS & OFFICE TECH',
    badgeBg: 'rgba(217, 119, 6, 0.2)',
    badgeColor: '#fbbf24',
    headline: 'Lead Corporate Finance, Tax Filing &',
    highlight: 'Advanced Digital Office Operations',
    description: 'Master QuickBooks multi-currency company files, monthly VAT tax returns, payroll deductions, and executive Ms Excel spreadsheets for business leadership.',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(217, 119, 6, 0.25) 0%, rgba(15, 23, 42, 0.95) 70%), linear-gradient(135deg, #030712 0%, #451a03 50%, #030712 100%)',
    accentColor: '#f59e0b',
    icon: 'accounting-finance',
    metricNumber: '5,300+',
    metricLabel: 'Accounting & Office Specialists',
    category: 'Business Tech & Accounting',
    primaryCtaText: 'Explore Accounting & Office Tools',
    features: ['QuickBooks Multi-Currency', 'VAT & Payroll Filing', 'Advanced Ms Excel', 'Figma UI/UX & Canva'],
  },
]

export function Landing() {
  const isMobile = useIsMobile(1024)
  const location = useLocation()
  const navigate = useNavigate()

  const [appModalOpen, setAppModalOpen] = useState(false)
  const [appModalTab, setAppModalTab] = useState<'android' | 'windows'>('android')

  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<CourseItem | null>(null)
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false)
  const [showPortalDesksModal, setShowPortalDesksModal] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [academicsDropdownOpen, setAcademicsDropdownOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)
  const academicsDropdownRef = useRef<HTMLDivElement | null>(null)
  const servicesDropdownRef = useRef<HTMLDivElement | null>(null)
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (academicsDropdownRef.current && !academicsDropdownRef.current.contains(target)) {
        setAcademicsDropdownOpen(false)
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(target)) {
        setServicesDropdownOpen(false)
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setCategoryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [tutorModalOpen, setTutorModalOpen] = useState(false)
  const [tutorSubmitting, setTutorSubmitting] = useState(false)
  const [tutorSuccess, setTutorSuccess] = useState(false)
  const [tutorForm, setTutorForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: 'Tech & Programming (Full-Stack, React, Python)',
    experienceYears: '3-5 Years',
    courseProposal: '',
    portfolioOrLinkedin: '',
  })
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Hero Background Video Player & Visualizer Canvas
  const [bgVideoPlaying, setBgVideoPlaying] = useState<boolean>(true)
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Ambient Interactive Digital Classroom Waveform & Starfield in Hero
  useEffect(() => {
    const canvas = heroCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.height = canvas.parentElement?.clientHeight || 650
    }
    window.addEventListener('resize', handleResize)

    // Particle nodes for ambient connecting mesh
    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(212, 175, 55, ' : 'rgba(56, 189, 248, ',
    }))

    // Ambient floating academic glyphs (Cambridge, Tech, Data, Languages, Business)
    const academicGlyphs = [
      { text: '0580', x: width * 0.12, y: height * 0.35, vy: 0.16, alpha: 0.22 },
      { text: '<React/>', x: width * 0.85, y: height * 0.25, vy: -0.14, alpha: 0.22 },
      { text: 'ANOVA F-Test', x: width * 0.78, y: height * 0.72, vy: 0.12, alpha: 0.18 },
      { text: 'IELTS 8.5', x: width * 0.16, y: height * 0.78, vy: -0.15, alpha: 0.22 },
      { text: 'PMP® Sprint', x: width * 0.52, y: height * 0.15, vy: 0.14, alpha: 0.18 },
      { text: 'f(x)=ax²+bx+c', x: width * 0.35, y: height * 0.85, vy: -0.12, alpha: 0.18 },
    ]

    let tick = 0
    const render = () => {
      tick += 0.015
      ctx.clearRect(0, 0, width, height)

      // 1. Draw subtle ambient sine wave streams
      ctx.save()
      ctx.lineWidth = 1.4
      for (let w = 0; w < 3; w++) {
        ctx.beginPath()
        const grad = ctx.createLinearGradient(0, 0, width, 0)
        grad.addColorStop(0, 'rgba(56, 189, 248, 0)')
        grad.addColorStop(0.5, w === 1 ? 'rgba(212, 175, 55, 0.12)' : 'rgba(56, 189, 248, 0.14)')
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)')
        ctx.strokeStyle = grad

        const offset = w * 1.8
        const baseHeight = height * (0.42 + w * 0.15)
        for (let x = 0; x <= width; x += 12) {
          const y = baseHeight + Math.sin(x * 0.006 + tick + offset) * (18 + w * 8)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      ctx.restore()

      // 2. Draw connected particle nodes
      particles.forEach((p, idx) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}0.4)`
        ctx.fill()

        // Connect nearby points
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.11 * (1 - dist / 110)})`
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      })

      // 3. Render subtle floating academic text glyphs
      ctx.font = '600 13px system-ui, -apple-system, sans-serif'
      academicGlyphs.forEach((g) => {
        g.y += g.vy
        if (g.y < -20) g.y = height + 10
        if (g.y > height + 20) g.y = -10
        ctx.fillStyle = `rgba(226, 232, 240, ${g.alpha})`
        ctx.fillText(g.text, g.x, g.y)
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

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
          !c.careerOutcome?.includes('{"key"') &&
          // Guard against empty / ghost placeholder courses that have no curriculum or syllabus content
          Array.isArray(c.syllabus) &&
          c.syllabus.length > 0 &&
          Boolean(c.title && c.title.trim().length > 3)
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
  const [courseViewMode, setCourseViewMode] = useState<'grid' | 'list'>('grid')
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null)
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
  const [previewCert, setPreviewCert] = useState<CertificateData | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('view') === 'certificate' || window.location.hash === '#certificate' || window.location.hash === '#certificate-preview') {
        setPreviewCert(SAMPLE_CERTIFICATES.software_engineering)
      }
    }
  }, [])

  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    course: 'Comprehensive Computer Packages & Digital Skills',
    preferredShift: 'Early Morning Batch (6:00 AM - 8:00 AM EAT)',
    notes: '',
  })

  // Multi-Step Interactive Checkout & Mode of Payment State
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'receipt'>('details')
  const [checkoutPaymentPlan, setCheckoutPaymentPlan] = useState<'full' | 'installment'>('full')
  const [generatedAdmission, setGeneratedAdmission] = useState<{
    studentName: string
    admissionNumber: string
    receiptNumber: string
    courseTitle: string
    courseId?: string
    deliveryMode?: 'live_cohort' | 'self_paced'
    providerType?: 'individual_tutor' | 'partner_institution'
    institutionName?: string
    amountPaid: number
    totalFee: number
    balanceRemaining: number
    paymentMode: string
    referenceCode: string
    date: string
    isPendingVerification?: boolean
  } | null>(null)

  const filteredCourses = useMemo(() => {
    let list = coursesList
    if (activeCategory !== 'All') {
      if (activeCategory === 'IGCSE & British Curriculum') {
        list = list.filter(
          (c) =>
            c.category === 'Home Schooling' ||
            c.category === 'Tuition & Boosters' ||
            c.category === 'Cambridge International (Years 9-11)' ||
            c.category === 'Pearson Edexcel International (Years 9-11)' ||
            c.category === 'IGCSE' ||
            c.category?.toLowerCase().includes('igcse') ||
            c.category?.toLowerCase().includes('cambridge') ||
            c.category?.toLowerCase().includes('edexcel')
        )
      } else {
        list = list.filter((c) => c.category === activeCategory)
      }
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
      showToast('Please provide your full name and phone number to proceed.')
      return
    }
    setCheckoutStep('payment')
  }

  const handleCompleteEnrollmentAndPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    const selectedCourseObj = coursesList.find((c) => c.title === inquiryForm.course) || coursesList[0]
    
    const isLiveCohortCourse =
      selectedCourseObj?.delivery_mode === 'live_cohort' ||
      selectedCourseObj?.schedule?.toLowerCase().includes('live') ||
      selectedCourseObj?.title?.toLowerCase().includes('cambridge') ||
      selectedCourseObj?.title?.toLowerCase().includes('diploma') ||
      selectedCourseObj?.title?.toLowerCase().includes('igcse')

    const courseDeliveryMode: 'live_cohort' | 'self_paced' = isLiveCohortCourse ? 'live_cohort' : 'self_paced'

    // Dynamically retrieve feeUsd from official registry or admin override (self-paced video courses $19, live cohorts dynamic)
    const fullFeeNum = typeof selectedCourseObj?.feeUsd === 'number' && selectedCourseObj.feeUsd > 0
      ? selectedCourseObj.feeUsd
      : courseDeliveryMode === 'self_paced'
      ? 19
      : (Number(selectedCourseObj?.fee?.replace(/[^0-9]/g, '')) || 45)

    const installmentFeeNum = Math.round(fullFeeNum / 2)
    const amountToPay = checkoutPaymentPlan === 'full' ? fullFeeNum : installmentFeeNum
    const balanceRemaining = fullFeeNum - amountToPay

    // Only live classes should receive a formal matriculated admission number;
    // self-paced learners receive instant access with a learner pass code!
    const admNo = courseDeliveryMode === 'live_cohort'
      ? `EI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      : `SELF-PACED-${Math.floor(1000 + Math.random() * 9000)}`
    const recNo = `EI-REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

    // Paystack is the exclusive payment gateway accepted by Éclat Institute
    initializePaystackCheckout({
      email: inquiryForm.email || INSTITUTION_CONFIG.contact.admissionsEmail,
      amount: amountToPay,
      currency: 'KES',
      studentName: inquiryForm.name,
      admissionNumber: admNo,
      purpose: `Course Enrollment Tuition - ${selectedCourseObj.title}`,
      invoiceId: `INV-${admNo}`,
      onSuccess: async (reference) => {
        const verifiedRef = `PAYSTACK-${reference}`
        const modeLabel = 'Paystack Verified (M-Pesa / Card / Apple Pay)'

        // 1. Record inquiry
        await schoolStore.addInquiry({
          id: `inq-${Date.now()}`,
          visitor_name: inquiryForm.name,
          phone: inquiryForm.phone,
          email: inquiryForm.email,
          purpose: 'New Admission Inquiry',
          program_of_interest: inquiryForm.course,
          notes: `Shift: ${inquiryForm.preferredShift}. Plan: ${checkoutPaymentPlan} ($${amountToPay}). Mode: ${modeLabel}. Ref: ${verifiedRef} [Paystack Verified Instant]`,
          date: todayDate,
          recorded_by: 'Paystack Automated Gateway',
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
          stream: courseDeliveryMode === 'live_cohort' ? '100% Online Cohort' : 'Self-Paced Video Track',
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
          attendance_rate: 0,
          discipline_points: 100,
          merits_count: 0,
          demerits_count: 0,
        })

        // 3. Add verified payment record
        await schoolStore.recordPayment({
          id: `rcpt-${Date.now()}`,
          receipt_number: recNo,
          student_id: admNo,
          student_name: inquiryForm.name,
          admission_number: admNo,
          amount: amountToPay,
          amount_paid: amountToPay,
          payment_method: 'Card',
          reference_code: verifiedRef,
          payment_date: todayDate,
          paid_by: inquiryForm.name,
          recorded_by: 'Paystack Automated Gateway',
          balance_after: balanceRemaining,
          balance_remaining: balanceRemaining,
        })

        // 4. Enroll course in student's academic units
        try {
          await schoolStore.addCourseToStudentProgram(admNo, selectedCourseObj.id)
        } catch {}

        // 5. Auto-provision instant student profile & portal login session
        const studentUserId = `usr-${Date.now()}`
        const studentProfile: Profile = {
          id: studentUserId,
          full_name: inquiryForm.name,
          admission_number: admNo,
          role: 'student',
          first_login_at: new Date().toISOString(),
          access_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
        }

        try {
          // Store active student profile for instant seamless navigation into the course
          localStorage.setItem('eclat_active_profile', JSON.stringify(studentProfile))
          sessionStorage.setItem('eclat_active_profile', JSON.stringify(studentProfile))

          // Save credentials in local storage lookup table
          const stored = localStorage.getItem('eclat_local_credentials')
          const parsed = stored ? JSON.parse(stored) : {}
          const cleanAdm = admNo.toLowerCase().replace(/[^a-z0-9]/g, '')
          const cleanEmail = (inquiryForm.email || '').toLowerCase().replace(/[^a-z0-9]/g, '')
          const credData = {
            id: studentUserId,
            admission_number: admNo,
            full_name: inquiryForm.name,
            email: inquiryForm.email,
            phone: inquiryForm.phone,
            password: 'eclat_cleared',
            role: 'student' as Role,
            account_type: 'student',
            delivery_mode: courseDeliveryMode,
            profile: studentProfile,
            created_at: new Date().toISOString(),
          }
          parsed[cleanAdm] = credData
          if (cleanEmail) parsed[cleanEmail] = credData
          localStorage.setItem('eclat_local_credentials', JSON.stringify(parsed))
        } catch {}

        // 6. Set generated admission pass
        setGeneratedAdmission({
          studentName: inquiryForm.name,
          admissionNumber: admNo,
          receiptNumber: recNo,
          courseTitle: selectedCourseObj.title,
          courseId: selectedCourseObj.id,
          deliveryMode: courseDeliveryMode,
          providerType: (selectedCourseObj as any)?.provider_type || 'individual_tutor',
          institutionName: (selectedCourseObj as any)?.institution_name,
          amountPaid: amountToPay,
          totalFee: fullFeeNum,
          balanceRemaining,
          paymentMode: modeLabel,
          referenceCode: verifiedRef,
          date: todayDate,
          isPendingVerification: false,
        })

        setCheckoutStep('receipt')
        showToast(`Payment verified! Welcome to Éclat Institute, ${inquiryForm.name}!`)
      },
      onClose: () => {
        showToast('Paystack window closed. Please complete payment to issue your cleared admission receipt.')
      },
    })
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
        status: isCleared ? 'Officially Verified & Certified' : 'Verified (Academic Registry Clear)',
      })
      showToast(`Credential record verified for ${studentName}!`)
    } else {
      setCertResult({
        found: false,
      })
      showToast(`No student or certificate record matched "${q}".`)
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <DesktopCommandPalette />

      {/* Top Admissions & Quick Contacts Bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: isMobile ? '0.35rem 0.5rem' : '0.45rem 1rem',
          fontSize: isMobile ? '0.74rem' : '0.8rem',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isMobile ? '0.5rem' : '1rem',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
            <strong>Intake Ongoing:</strong> 15% Early Bird Tuition Voucher
          </span>
          <span className="hidden sm:inline" style={{ opacity: 0.8 }}>|</span>
          <span className="hidden sm:inline" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <PhoneIcon size={14} color="#ffffff" />
            <span>Admissions: <strong>{INSTITUTION_CONFIG.contact.phone}</strong></span>
          </span>
          <span className="hidden md:inline" style={{ opacity: 0.8 }}>|</span>
          <span className="hidden md:inline" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <GraduationCapIcon size={15} color="#ffffff" />
            <span>100% Online Live Classes & 24/7 Digital LMS</span>
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
          padding: isMobile ? '0.45rem 0.5rem' : '0.65rem 1rem',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '0.4rem', width: '100%', minWidth: 0 }}>
          {/* Left Side: Brand Logo & Explore Categories */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 1, minWidth: 0 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none', minWidth: 0 }}>
              <img
                src="/logo.png"
                alt="Éclat Institute Logo"
                style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4af37', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: isMobile ? 'clamp(0.88rem, 3.8vw, 1.15rem)' : '1.2rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', letterSpacing: '0.01em', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ÉCLAT INSTITUTE
                </div>
                <div className="hidden sm:block" style={{ fontSize: '0.68rem', color: '#8c6e28', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  100% Online Virtual Campus
                </div>
              </div>
            </Link>

            {/* Udemy-Style "Explore Categories" Dropdown (Desktop) */}
            <div ref={categoryDropdownRef} style={{ position: 'relative' }} className="hidden lg:block">
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
                <BookOpenIcon size={16} color="#1e3a8a" />
                <span>Explore Categories</span>
                <span style={{ fontSize: '0.75rem', transform: categoryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
              </button>

              {categoryDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: '270px',
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
                    { id: 'All', icon: SparklesIcon, label: 'All Online Programs', color: '#f59e0b' },
                    { id: 'Tech & Programming', icon: CodeIcon, label: 'Tech & Software Engineering', color: '#2563eb' },
                    { id: 'Data Science & Research', icon: DatabaseIcon, label: 'Data Science, R, SPSS & Stata', color: '#10b981' },
                    { id: 'Business Tech & Accounting', icon: CalculatorIcon, label: 'QuickBooks & Business Tech', color: '#059669' },
                    { id: 'Computer & Digital Skills', icon: LaptopIcon, label: 'Digital Literacy & Office Skills', color: '#6366f1' },
                    { id: 'Languages & Communication', icon: GlobeIcon, label: 'World Languages & IELTS', color: '#06b6d4' },
                    { id: 'Creative Arts & Design', icon: PaletteIcon, label: 'Creative Arts & UI/UX Design', color: '#ec4899' },
                    { id: 'IGCSE & British Curriculum', icon: BritishShieldIcon, label: '🇬🇧 British Curriculum (Cambridge & Edexcel)', color: '#00247D' },
                  ].map((cat) => {
                    const CatIcon = cat.icon
                    return (
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
                        <CatIcon size={16} color={cat.color} />
                        <span>{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Center: Global Search Bar (Udemy-Style) */}
          <div style={{ flex: 1, maxWidth: '420px', margin: '0 0.5rem' }} className="hidden md:block">
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search for courses, skills (e.g. Forex, Python, IELTS, React, Excel)..."
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
                  padding: '0.55rem 1rem 0.55rem 2.3rem',
                  borderRadius: '999px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.86rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <SearchIcon size={16} color="#64748b" />
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '2px' }}
                >
                  <XIcon size={14} color="#64748b" />
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Quick Action Links & Portals */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            {/* Desktop-Only Navigation & Actions */}
            {/* Desktop-Only Organized Navigation & Actions */}
            <div className="desktop-nav-container">
              <nav className="desktop-nav-links" style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                
                {/* 1. Academic Curricula & Programs Dropdown */}
                <div ref={academicsDropdownRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAcademicsDropdownOpen(!academicsDropdownOpen)
                      setServicesDropdownOpen(false)
                    }}
                    style={{
                      background: academicsDropdownOpen ? '#eff6ff' : 'transparent',
                      color: academicsDropdownOpen ? '#1d4ed8' : '#334155',
                      border: 'none',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <BookOpenIcon size={15} color="#1d4ed8" />
                    <span>Academics</span>
                    <ChevronDownIcon
                      size={13}
                      color="#64748b"
                      style={{
                        transform: academicsDropdownOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>

                  {academicsDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        width: '290px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                        padding: '0.5rem',
                        zIndex: 200,
                        animation: 'fadeIn 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <Link
                        to="/courses"
                        onClick={() => setAcademicsDropdownOpen(false)}
                        style={{
                          textDecoration: 'none',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#0f172a',
                          background: 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpenIcon size={15} color="#1d4ed8" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>All Programs & Diplomas</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>IT, Data Science, Business & Languages</div>
                        </div>
                      </Link>

                      <Link
                        to="/courses?cat=IGCSE"
                        onClick={() => setAcademicsDropdownOpen(false)}
                        style={{
                          textDecoration: 'none',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#0f172a',
                          background: 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fefce8')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fefce8', border: '1px solid #fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BritishShieldIcon size={15} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92400e' }}>British Curriculum & IGCSE</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Cambridge KE042 & Pearson Edexcel</div>
                        </div>
                      </Link>

                      <a
                        href="#intakes-section"
                        onClick={() => setAcademicsDropdownOpen(false)}
                        style={{
                          textDecoration: 'none',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#0f172a',
                          background: 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fffbeb')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CalendarIcon size={15} color="#d97706" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#b45309' }}>Intakes & Cohorts</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Admissions and start dates</div>
                        </div>
                      </a>

                      <Link
                        to="/timetable"
                        onClick={() => setAcademicsDropdownOpen(false)}
                        style={{
                          textDecoration: 'none',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#0f172a',
                          background: 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ClockIcon size={15} color="#475569" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>Virtual Timetable</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Live lecture schedule & slots</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. Institutional Services & Cloud Dropdown */}
                <div ref={servicesDropdownRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setServicesDropdownOpen(!servicesDropdownOpen)
                      setAcademicsDropdownOpen(false)
                    }}
                    style={{
                      background: servicesDropdownOpen ? '#f5f3ff' : 'transparent',
                      color: servicesDropdownOpen ? '#7c3aed' : '#334155',
                      border: 'none',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <BuildingIcon size={15} color="#7c3aed" />
                    <span>Cloud & Services</span>
                    <ChevronDownIcon
                      size={13}
                      color="#64748b"
                      style={{
                        transform: servicesDropdownOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>

                  {servicesDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        width: '320px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                        padding: '0.5rem',
                        zIndex: 200,
                        animation: 'fadeIn 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <Link
                        to="/publish-course"
                        onClick={() => setServicesDropdownOpen(false)}
                        style={{
                          textDecoration: 'none',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#0f172a',
                          background: 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fffbeb')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <SparklesIcon size={16} color="#ffffff" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>Publish Course & Monetize</span>
                            <span style={{ fontSize: '0.62rem', background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>50% Share</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Host your courses & earn recurring revenue</div>
                        </div>
                      </Link>

                      <Link
                        to="/hire"
                        onClick={() => setServicesDropdownOpen(false)}
                        style={{
                          textDecoration: 'none',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#0f172a',
                          background: 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <LaptopIcon size={16} color="#ffffff" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1d4ed8' }}>Hire Éclat Tech Services</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Custom web development, apps & data analytics</div>
                        </div>
                      </Link>

                      <Link
                        to="/careers"
                        onClick={() => setServicesDropdownOpen(false)}
                        style={{
                          textDecoration: 'none',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#0f172a',
                          background: 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #22c55e, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <GraduationCapIcon size={16} color="#ffffff" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#15803d' }}>Careers & Faculty</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Join our online teaching & operations team</div>
                        </div>
                      </Link>

                      <Link
                        to="/donate"
                        onClick={() => setServicesDropdownOpen(false)}
                        style={{
                          textDecoration: 'none',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#0f172a',
                          background: 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#ecfdf5')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <HeartHandshakeIcon size={16} color="#ffffff" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#047857' }}>Sponsor a Student / Donate</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Empower underprivileged learners & classrooms</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. E-Library Direct Link */}
                <Link
                  to="/library"
                  style={{
                    color: '#2563eb',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LibraryIcon size={15} color="#2563eb" />
                  <span>E-Library</span>
                </Link>

                {/* 4. Tuition Fees */}
                <a
                  href="#calculator"
                  style={{
                    color: '#475569',
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '0.45rem 0.55rem',
                    borderRadius: '8px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Fees
                </a>

                {/* 5. About */}
                <a
                  href="#about"
                  style={{
                    color: '#475569',
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '0.45rem 0.55rem',
                    borderRadius: '8px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  About
                </a>
              </nav>

              {/* Action Buttons: Get Apps, Apply, Portals */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginLeft: '0.25rem' }}>
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
                    gap: '5px',
                    fontSize: '0.78rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'inline-flex',
                  }}
                  onClick={() => {
                    setAppModalTab('windows')
                    setAppModalOpen(true)
                  }}
                  title="Download Official Native Apps (Windows & Android)"
                >
                  <SmartphoneIcon size={14} color="#ffffff" />
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setInquiryModalOpen(true)}
                >
                  <RocketIcon size={13} color="#1d4ed8" />
                  <span>Apply</span>
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowPortalDesksModal(true)}
                >
                  <LockIcon size={13} color="#ffffff" />
                  <span>Portals</span>
                </button>
              </div>
            </div>

            {/* Mobile-Only Actions & Hamburger Button */}
            <div className="landing-mobile-actions" style={{ alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                style={{
                  fontWeight: 800,
                  padding: '0.38rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
                  flexShrink: 0,
                }}
                onClick={() => setShowPortalDesksModal(true)}
              >
                <LockIcon size={12} color="#ffffff" />
                <span>Portals</span>
              </button>

              <button
                type="button"
                className="landing-mobile-menu-toggle"
                style={{
                  background: mobileNavOpen ? '#0f172a' : '#f8fafc',
                  color: mobileNavOpen ? '#d4af37' : '#0f172a',
                  border: mobileNavOpen ? '1.5px solid #d4af37' : '1.5px solid #cbd5e1',
                  width: '35px',
                  height: '35px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  flexShrink: 0,
                }}
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-label={mobileNavOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                title={mobileNavOpen ? 'Close Menu' : 'Open Website Menu'}
              >
                {mobileNavOpen ? (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Over Navigation Drawer Backdrop */}
        {mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(5, 8, 15, 0.72)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 9998,
              animation: 'fadeIn 0.2s ease',
            }}
          />
        )}

        {/* Mobile Slide-Over Navigation Drawer Panel */}
        {mobileNavOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(330px, 86vw)',
              background: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src="/logo.png"
                  alt="Éclat Institute Logo"
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #A51D24', boxShadow: '0 2px 6px rgba(165, 29, 36, 0.2)' }}
                />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#A51D24', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                    ÉCLAT INSTITUTE
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>
                    100% Online Virtual Campus
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 900,
                }}
                aria-label="Close menu"
              >
                <XIcon size={18} color="#0f172a" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
                background: '#ffffff',
              }}
            >
              {/* Category 1: Academic Programs & Curricula */}
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', paddingLeft: '0.2rem' }}>
                  Academics & Curricula
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <Link
                    to="/"
                    onClick={() => {
                      setMobileNavOpen(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    style={{
                      color: '#0f172a',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      background: '#f8fafc',
                    }}
                  >
                    <HomeIcon size={16} color="#0f172a" />
                    <span>Home Campus</span>
                  </Link>

                  <Link
                    to="/courses"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#1d4ed8',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      background: '#eff6ff',
                    }}
                  >
                    <BookOpenIcon size={16} color="#1d4ed8" />
                    <span>All Academic Programs</span>
                  </Link>

                  <Link
                    to="/courses?cat=IGCSE"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#92400e',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      background: '#fefce8',
                      border: '1px solid #fef08a',
                    }}
                  >
                    <BritishShieldIcon size={16} />
                    <span>British Curriculum & IGCSE</span>
                  </Link>

                  <a
                    href="#intakes-section"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#b45309',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      background: '#fffbeb',
                    }}
                  >
                    <CalendarIcon size={16} color="#d97706" />
                    <span>Intakes & Cohorts</span>
                  </a>

                  <Link
                    to="/timetable"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#334155',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      background: '#f8fafc',
                    }}
                  >
                    <ClockIcon size={16} color="#64748b" />
                    <span>Virtual Timetable</span>
                  </Link>
                </div>
              </div>

              {/* Category 2: Services */}
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', paddingLeft: '0.2rem' }}>
                  Services
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>

                  <Link
                    to="/publish-course"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#92400e',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                    }}
                  >
                    <SparklesIcon size={16} color="#d97706" />
                    <span>Publish Course (Earn 50% Share)</span>
                  </Link>

                  <Link
                    to="/hire"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#1d4ed8',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      background: '#eff6ff',
                    }}
                  >
                    <LaptopIcon size={16} color="#1d4ed8" />
                    <span>Hire Éclat (Tech Services)</span>
                  </Link>

                  <Link
                    to="/careers"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#15803d',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      background: '#f0fdf4',
                    }}
                  >
                    <GraduationCapIcon size={16} color="#15803d" />
                    <span>Careers & Faculty</span>
                  </Link>

                  <Link
                    to="/donate"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#047857',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    <HeartHandshakeIcon size={16} color="#059669" />
                    <span>Sponsor a Student / Donate</span>
                  </Link>
                </div>
              </div>

              {/* Category 3: Student Hub & Info */}
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', paddingLeft: '0.2rem' }}>
                  Student Hub
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <Link
                    to="/library"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#2563eb',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      background: '#eff6ff',
                    }}
                  >
                    <LibraryIcon size={16} color="#2563eb" />
                    <span>Free E-Library & Past Papers</span>
                  </Link>

                  <a
                    href="#calculator"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#334155',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      background: '#f8fafc',
                    }}
                  >
                    <CreditCardIcon size={16} color="#64748b" />
                    <span>Tuition Fees Calculator</span>
                  </a>

                  <a
                    href="#about"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      color: '#334155',
                      textDecoration: 'none',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      background: '#f8fafc',
                    }}
                  >
                    <BuildingIcon size={16} color="#64748b" />
                    <span>About Éclat Institute</span>
                  </a>

                  {/* Native Apps Download */}
                  <button
                    type="button"
                    onClick={() => {
                      setAppModalTab('windows')
                      setAppModalOpen(true)
                      setMobileNavOpen(false)
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: '#f0fdf4',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                    }}
                  >
                    <SmartphoneIcon size={16} color="#15803d" />
                    <span>Download Native Apps (Win & APK)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div
              style={{
                padding: '1rem 1.1rem',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false)
                  setInquiryModalOpen(true)
                }}
                className="btn btn-sm"
                style={{
                  background: '#d4af37',
                  color: '#0f172a',
                  fontWeight: 900,
                  textAlign: 'center',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(212, 175, 55, 0.35)',
                }}
              >
                <RocketIcon size={16} color="#0f172a" />
                <span>Apply & Enroll in Intake</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false)
                  setShowPortalDesksModal(true)
                }}
                className="btn btn-sm btn-primary"
                style={{
                  fontWeight: 800,
                  textAlign: 'center',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <LockIcon size={16} color="#ffffff" />
                <span>Student & Staff Portals</span>
              </button>

              <a
                href={getWhatsAppInquiryUrl('Hello Eclat Admissions! I need assistance with course enrollment.')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 800,
                  textAlign: 'center',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                }}
              >
                <MessageCircleIcon size={16} color="#ffffff" />
                <span>WhatsApp Admissions Desk</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Prominent Mobile Featured Action Bar (Instant Direct Access to Publish & Donate) */}
      <div
        className="landing-mobile-quick-strip"
        style={{
          background: '#ffffff',
          borderBottom: '1.5px solid #e2e8f0',
          padding: '0.45rem 0.65rem',
          gap: '0.5rem',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          zIndex: 90,
        }}
      >
        <Link
          to="/publish-course"
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
            fontWeight: 800,
            padding: '0.55rem 0.6rem',
            borderRadius: '9px',
            fontSize: '0.8rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <SparklesIcon size={15} color="#ffffff" />
          <span>✨ Publish & Earn 50%</span>
        </Link>
        <Link
          to="/donate"
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: '#ffffff',
            fontWeight: 800,
            padding: '0.55rem 0.6rem',
            borderRadius: '9px',
            fontSize: '0.8rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <HeartHandshakeIcon size={15} color="#ffffff" />
          <span>💖 Sponsor / Donate</span>
        </Link>
      </div>

      {/* Hero Section: 100% Online Global Academy Billboard */}
      <section
        style={{
          background: 'linear-gradient(160deg, #080e1a 0%, #0d1f3c 40%, #0a1628 100%)',
          color: '#ffffff',
          padding: isMobile ? '2.5rem 1rem 2rem' : '5rem 2rem 4rem',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #1e3a8a',
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
            background: 'radial-gradient(circle, #1d4ed8 0%, #0284c7 100%)',
            opacity: 0.18,
            filter: 'blur(140px)',
            pointerEvents: 'none',
          }}
        />

        {/* Real Visible Background Video Player (Campus & Virtual Classroom Stream) */}
        {bgVideoPlaying && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.52,
                filter: 'saturate(1.2) contrast(1.1)',
              }}
            >
              <source src="/videos/eclat-classroom-preview.mp4" type="video/mp4" />
            </video>

            {/* Cinema Dark Mask Overlay to ensure hero text is 100% readable while the video plays vividly */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(8, 14, 26, 0.78) 0%, rgba(13, 31, 60, 0.62) 50%, rgba(8, 14, 26, 0.88) 100%)',
              }}
            />

            {/* Subtle grid mesh overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>
        )}

        {/* Creative Ambient Animated Classroom Visualizer Waveform & Node Mesh */}
        <canvas
          ref={heroCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2,
            opacity: 0,
          }}
        />

        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 3 }}>
          {/* Academy Global Accreditation Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '999px',
              padding: isMobile ? '0.35rem 0.85rem' : '0.4rem 1.25rem',
              fontSize: isMobile ? '0.75rem' : '0.82rem',
              fontWeight: 700,
              color: '#93c5fd',
              letterSpacing: '0.03em',
              marginBottom: '1.75rem',
              maxWidth: '100%',
              flexWrap: 'wrap',
              textAlign: 'center',
              lineHeight: 1.35,
              boxSizing: 'border-box',
            }}
          >
            <SparklesIcon size={16} color="#d4af37" />
            <span style={{ maxWidth: '100%', wordBreak: 'break-word', whiteSpace: 'normal' }}>
              100% ONLINE VIRTUAL CAMPUS • TECH, BUSINESS &amp; ACCREDITED VOCATIONAL PATHWAYS
            </span>
          </div>

          {/* Clean, Authoritative Headline */}
          <h1
            className="landing-hero-heading"
            style={{
              fontSize: isMobile ? 'clamp(1.5rem, 5.5vw, 2.15rem)' : '3.6rem',
              fontWeight: 900,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              margin: '0 auto 1.25rem',
              maxWidth: '960px',
              color: '#ffffff',
              fontFamily: 'var(--font-heading)',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            Learn In-Demand Tech, Business Automation &amp; Professional Skills
          </h1>

          {/* Refined 2-sentence Subtitle */}
          <p
            style={{
              maxWidth: '780px',
              margin: '0 auto 2.25rem',
              fontSize: isMobile ? '0.95rem' : '1.15rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              fontWeight: 400,
              wordBreak: 'break-word',
            }}
          >
            Explore affordable on-demand video courses and live cohorts in software development, data science, POS accounting, and British examination series. Master career skills, manage your school on our cloud, or teach and earn 50% revenue share.
          </p>

          {/* Clean, High-Contrast CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.25rem', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
            <a
              href="#courses"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                padding: '0.85rem 1.75rem',
                fontSize: '1rem',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            >
              <span>Explore Programs & Courses</span>
              <ArrowRightIcon size={16} />
            </a>

            <Link
              to="/hire"
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1.5px solid rgba(255, 255, 255, 0.35)',
                color: '#ffffff',
                fontWeight: 700,
                padding: '0.85rem 1.75rem',
                fontSize: '1rem',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            >
              <LaptopIcon size={16} color="#60a5fa" />
              <span>Hire Our Tech Team</span>
            </Link>

            <Link
              to="/careers"
              style={{
                background: 'rgba(22, 163, 74, 0.25)',
                border: '1.5px solid rgba(74, 222, 128, 0.5)',
                color: '#4ade80',
                fontWeight: 800,
                padding: '0.85rem 1.5rem',
                fontSize: '0.95rem',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            >
              <GraduationCapIcon size={16} color="#4ade80" />
              <span>Teaching Careers</span>
            </Link>
          </div>

          {/* Hero Secondary Direct Actions: Publish Course & Donate */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
            <Link
              to="/publish-course"
              style={{
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.95) 0%, rgba(180, 83, 9, 0.95) 100%)',
                border: '1px solid rgba(253, 230, 138, 0.45)',
                color: '#ffffff',
                fontWeight: 800,
                padding: '0.65rem 1.35rem',
                fontSize: '0.88rem',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            >
              <SparklesIcon size={16} color="#ffffff" />
              <span>Publish Course &amp; Earn 50% Share</span>
            </Link>

            <Link
              to="/donate"
              style={{
                background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%)',
                border: '1px solid rgba(187, 247, 208, 0.45)',
                color: '#ffffff',
                fontWeight: 800,
                padding: '0.65rem 1.35rem',
                fontSize: '0.88rem',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            >
              <HeartHandshakeIcon size={16} color="#ffffff" />
              <span>💖 Sponsor a Student / Donate</span>
            </Link>
          </div>

          {/* Clean Institutional Trust Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: isMobile ? '1rem' : '2.5rem',
              flexWrap: 'wrap',
              fontSize: '0.85rem',
              color: '#94a3b8',
              fontWeight: 600,
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleIcon size={15} color="#38bdf8" /> 100% Live Virtual Labs
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleIcon size={15} color="#38bdf8" /> Cambridge CAIE (KE042)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleIcon size={15} color="#38bdf8" /> Pearson Edexcel (EDX-98421)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleIcon size={15} color="#38bdf8" /> 40+ Countries Represented
            </span>
          </div>
        </div>
      </section>

      {/* Canonical Disciplines & Institutional Focus */}
      <section style={{ background: '#f8fafc', padding: isMobile ? '2.5rem 1rem' : '3.5rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '1.75rem' : '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1e3a8a' }}>
              Academic Faculties & Professional Services
            </span>
            <h2 style={{ fontSize: isMobile ? '1.6rem' : '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0.4rem 0 0.5rem', letterSpacing: '-0.02em' }}>
              Structured Excellence Across Four Faculties
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              Direct Cambridge & Pearson accreditation, Silicon Valley tech curriculum, and corporate-grade industry services.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {[
              {
                title: 'Cambridge & Edexcel International',
                badge: 'Years 7–11 • IGCSE / Lower Sec',
                desc: 'Official exam-board mapped curriculum with certified educators and live personalized clinics.',
                link: '#courses',
                color: '#1e3a8a',
                bg: '#eff6ff',
                icon: BritishShieldIcon,
              },
              {
                title: 'Computer Science & Software',
                badge: 'Full-Stack & Cloud Architecture',
                desc: 'Production-ready software engineering: React 19, TypeScript, Python, Node, and secure REST APIs.',
                link: '#courses',
                color: '#0284c7',
                bg: '#f0f9ff',
                icon: LaptopIcon,
              },
              {
                title: 'Data Science & Statistical Research',
                badge: 'Python, R, SPSS & Econometrics',
                desc: 'Applied biostatistics, machine learning, econometric modeling, and thesis quantitative support.',
                link: '#courses',
                color: '#059669',
                bg: '#ecfdf5',
                icon: DatabaseIcon,
              },
              {
                title: 'World Languages & IELTS Mastery',
                badge: 'Global Certification Prep',
                desc: 'High-scoring IELTS Academic preparation, German Goethe-Zertifikat, French DELF, and Arabic.',
                link: '#courses',
                color: '#d97706',
                bg: '#fffbeb',
                icon: GlobeIcon,
              },
            ].map((fac, idx) => {
              const FacIcon = fac.icon
              return (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '12px', background: fac.bg, color: fac.color, marginBottom: '1rem' }}>
                      <FacIcon size={24} color={fac.color} />
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: fac.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                      {fac.badge}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', lineHeight: 1.35 }}>
                      {fac.title}
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                      {fac.desc}
                    </p>
                  </div>
                  <a
                    href={fac.link}
                    style={{
                      marginTop: '1.25rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: fac.color,
                      textDecoration: 'none',
                    }}
                  >
                    Explore Faculty Courses →
                  </a>
                </div>
              )
            })}
          </div>

          {/* Strategic Services Dual Cards: Hire Us & Careers */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.25rem', marginTop: '1.5rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: isMobile ? '1.5rem 1.25rem' : '1.75rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Enterprise & Client Solutions
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0 0.5rem' }}>
                  Hire Éclat Institute for Tech & Digital Services
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>
                  Full-stack engineering, bespoke web & mobile apps, business automation, retail POS & full accounting systems, institutional LMS portals, advanced data analytics, and corporate upskilling.
                </p>
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <Link
                  to="/hire"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.65rem 1.25rem',
                    background: '#38bdf8',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                  }}
                >
                  Request a Quote or Service →
                </Link>
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: isMobile ? '1.5rem 1.25rem' : '1.75rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fde047', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Faculty Recruitment
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0 0.5rem' }}>
                  Teach at Éclat — Academic & Faculty Openings
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>
                  We are hiring Cambridge IGCSE instructors, senior software trainers, data scientists, and language faculty for live online cohorts worldwide.
                </p>
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <Link
                  to="/careers"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.65rem 1.25rem',
                    background: '#fde047',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                  }}
                >
                  View Open Teaching Positions →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights & Value Metrics Section */}
      <section style={{ background: '#f8fafc', padding: isMobile ? '2rem 1rem' : '2.5rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

          {/* Live Intake Countdown Alert */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: isMobile ? '1rem 0.85rem' : '1.25rem 1.5rem',
              maxWidth: '820px',
              margin: '0 auto 2.5rem',
              display: 'flex',
              justifyContent: isMobile ? 'center' : 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: isMobile ? '0.75rem' : '1rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ textAlign: isMobile ? 'center' : 'left', width: isMobile ? '100%' : 'auto' }}>
              <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <SparklesIcon size={14} color="#b45309" style={{ marginRight: '5px', verticalAlign: 'middle' }} />100% ONLINE INTAKE REGISTRATION OPEN
              </div>
              <div style={{ fontSize: isMobile ? '0.94rem' : '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                Live Virtual Cohorts — Early Morning, Late Morning, Midday, Afternoon, Evening & Night Batches
              </div>
              <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>
                <GlobeIcon size={14} color="#1d4ed8" style={{ marginRight: '5px', verticalAlign: 'middle' }} />Study from anywhere in Kenya, Africa & Worldwide • 24/7 LMS Access
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'center', width: isMobile ? '100%' : 'auto' }}>
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.55rem', borderRadius: '8px', textAlign: 'center', minWidth: '44px' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e3a8a' }}>{String(timeLeft.days).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Days</div>
              </div>
              <span style={{ fontWeight: 900, color: '#94a3b8' }}>:</span>
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.55rem', borderRadius: '8px', textAlign: 'center', minWidth: '44px' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e3a8a' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Hours</div>
              </div>
              <span style={{ fontWeight: 900, color: '#94a3b8' }}>:</span>
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.55rem', borderRadius: '8px', textAlign: 'center', minWidth: '44px' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e3a8a' }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Mins</div>
              </div>
              <span style={{ fontWeight: 900, color: '#94a3b8' }}>:</span>
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.55rem', borderRadius: '8px', textAlign: 'center', minWidth: '44px' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a' }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Secs</div>
              </div>
            </div>
          </div>

          {/* Social Proof & Metrics Ribbon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: isMobile ? '1rem 0.75rem' : '1.5rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: isMobile ? '16px' : '20px',
              padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem',
              maxWidth: '1000px',
              margin: '0 auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div>
              <div style={{ fontSize: isMobile ? '1.8rem' : '2.4rem', fontWeight: 900, color: '#1e3a8a', lineHeight: 1 }}>100%</div>
              <div style={{ fontSize: isMobile ? '0.82rem' : '0.9rem', color: '#0f172a', fontWeight: 800, marginTop: '0.35rem' }}>Virtual & Online</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#64748b' }}>Learn from anywhere, any device</div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '1.8rem' : '2.4rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>Live</div>
              <div style={{ fontSize: isMobile ? '0.82rem' : '0.9rem', color: '#0f172a', fontWeight: 800, marginTop: '0.35rem' }}>Interactive Coaching</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#64748b' }}>Real-time code labs & speaking mocks</div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '1.8rem' : '2.4rem', fontWeight: 900, color: '#0284c7', lineHeight: 1 }}>24/7</div>
              <div style={{ fontSize: isMobile ? '0.82rem' : '0.9rem', color: '#0f172a', fontWeight: 800, marginTop: '0.35rem' }}>LMS Portal Access</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#64748b' }}>Class recordings, notes & quizzes</div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '1.8rem' : '2.4rem', fontWeight: 900, color: '#b45309', lineHeight: 1 }}>Verified</div>
              <div style={{ fontSize: isMobile ? '0.82rem' : '0.9rem', color: '#0f172a', fontWeight: 800, marginTop: '0.35rem' }}>Global E-Certificates</div>
              <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#64748b' }}>QR verifiable & LinkedIn ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us & Institutional Advantage */}
      <section id="about" style={{ padding: isMobile ? '3.5rem 1rem' : '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div id="why-eclat" style={{ textAlign: 'center', marginBottom: isMobile ? '2.25rem' : '3.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b45309' }}>
            <BuildingIcon size={15} color="#b45309" style={{ marginRight: '6px', verticalAlign: 'middle' }} />ABOUT ÉCLAT INSTITUTE
          </span>
          <h2 style={{ fontSize: isMobile ? '1.75rem' : '2.3rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.75rem', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
            Empowering Modern Learners Worldwide
          </h2>
          <p style={{ fontSize: isMobile ? '0.94rem' : '1.05rem', color: '#334155', maxWidth: '740px', margin: '0 auto', fontWeight: 500, lineHeight: 1.65 }}>
            Éclat Institute is a premier 100% Online Virtual Campus. We deliver live virtual lectures, hands-on project labs, and direct mentor code reviews to help students and working professionals excel across 5 key disciplines.
          </p>
        </div>

        {/* 5 Specialized Academic Faculties Grid */}
        <div style={{ marginBottom: isMobile ? '2rem' : '3rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'center', marginBottom: '1.25rem' }}>
            Our 5 Academic Departments
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: <LaptopIcon size={24} color="#2563eb" />, name: 'Tech & Software', desc: 'React 19, Node.js REST APIs, PostgreSQL & Ethical Hacking' },
              { icon: <DatabaseIcon size={24} color="#0284c7" />, name: 'Data Science & Research', desc: 'Python, RStudio Biostats, SPSS Surveys & Stata Econometrics' },
              { icon: <PaletteIcon size={24} color="#9333ea" />, name: 'Creative Arts & Design', desc: 'Figma UI/UX Design Systems, Adobe Suite & 3D Animation' },
              { icon: <GlobeIcon size={24} color="#16a34a" />, name: 'World Languages & IELTS', desc: 'IELTS Band 8.5+, German Goethe, Arabic & French' },
              { icon: <CalculatorIcon size={24} color="#d97706" />, name: 'Business Tech & Accounting', desc: 'QuickBooks Pro, VAT Tax Compliance & Payroll' },
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
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{dept.icon}</div>
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
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <LaptopIcon size={26} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Live Virtual Coding & Language Labs
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Interactive live screen-sharing, breakout speaking rooms, live GitHub code reviews, and direct instructor feedback on your projects.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ClockIcon size={26} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Flexible Shifts: Early Morning to Night
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Attend live online sessions across 6 flexible daily shifts (Early Morning, Late Morning, Midday, Afternoon, Evening, or Night). Missed a class? Watch HD video replays anytime on the portal.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <AwardIcon size={26} color="#9333ea" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Verified Digital E-Certificates
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Receive cryptographically signed digital certificates with instant QR verification for LinkedIn, remote jobs, and international applications.
            </p>
            <button
              type="button"
              onClick={() => setPreviewCert(SAMPLE_CERTIFICATES.software_engineering)}
              style={{
                marginTop: '0.85rem',
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: 0,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline',
              }}
            >
              <AwardIcon size={15} color="#2563eb" /><span>Preview Official Sample Diploma</span>
              <span>→</span>
            </button>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <CreditCardIcon size={26} color="#d97706" />
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
              <SparklesIcon size={14} color="#93c5fd" style={{ marginRight: '5px', verticalAlign: 'middle' }} />Deep-Dive Institutional Profile
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
            <BuildingIcon size={16} color="#ffffff" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Read Full About Page →
          </Link>
        </div>
      </section>

      {/* Featured Short Courses Showcase */}
      <section id="courses" style={{ background: '#ffffff', padding: isMobile ? '2.5rem 1rem' : '5rem 1.5rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b45309' }}>
                ONLINE PROGRAMS DIRECTORY
              </span>
              <h2 style={{ fontSize: isMobile ? '1.6rem' : '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0', fontFamily: 'var(--font-heading)' }}>
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
                placeholder="Search courses, faculties, or codes (e.g. Forex, Python, IELTS, React, Excel)..."
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
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <SearchIcon size={16} color="#64748b" />
              </span>
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
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                >
                  <XIcon size={14} color="#64748b" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills & Result Counter */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: isMobile ? 'nowrap' : 'wrap',
              overflowX: isMobile ? 'auto' : 'visible',
              width: isMobile ? '100%' : 'auto',
              paddingBottom: isMobile ? '0.5rem' : 0,
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}>
              {[
                { id: 'All', icon: SparklesIcon, label: 'All Programs', count: coursesList.length, color: '#f59e0b' },
                {
                  id: 'IGCSE & British Curriculum',
                  icon: BritishShieldIcon,
                  label: '🇬🇧 All IGCSE & British Programs',
                  count: coursesList.filter(
                    (c) =>
                      c.category === 'Home Schooling' ||
                      c.category === 'Tuition & Boosters' ||
                      c.category === 'Cambridge International (Years 9-11)' ||
                      c.category === 'Pearson Edexcel International (Years 9-11)' ||
                      c.category === 'IGCSE' ||
                      c.category?.toLowerCase().includes('igcse')
                  ).length,
                  color: '#0284c7',
                },
                { id: 'Home Schooling', icon: BookOpenIcon, label: '🏡 Home Schooling (Y7-11)', count: coursesList.filter((c) => c.category === 'Home Schooling').length, color: '#16a34a' },
                { id: 'Tuition & Boosters', icon: SparklesIcon, label: '📚 Private Tuition & Clinics', count: coursesList.filter((c) => c.category === 'Tuition & Boosters').length, color: '#d97706' },
                { id: 'Cambridge International (Years 9-11)', icon: BritishShieldIcon, label: 'Cambridge (Y9-11)', count: coursesList.filter((c) => c.category === 'Cambridge International (Years 9-11)').length, color: '#00247D' },
                { id: 'Pearson Edexcel International (Years 9-11)', icon: BritishShieldIcon, label: 'Pearson Edexcel (Y9-11)', count: coursesList.filter((c) => c.category === 'Pearson Edexcel International (Years 9-11)').length, color: '#00247D' },
                { id: 'Data Science & Research', icon: DatabaseIcon, label: 'Data, R & SPSS', count: coursesList.filter((c) => c.category === 'Data Science & Research').length, color: '#10b981' },
                { id: 'Tech & Programming', icon: CodeIcon, label: 'Tech & Software', count: coursesList.filter((c) => c.category === 'Tech & Programming').length, color: '#2563eb' },
                { id: 'Creative Arts & Design', icon: PaletteIcon, label: 'Creative Arts & Design', count: coursesList.filter((c) => c.category === 'Creative Arts & Design').length, color: '#ec4899' },
                { id: 'Languages & Communication', icon: GlobeIcon, label: 'Languages & IELTS', count: coursesList.filter((c) => c.category === 'Languages & Communication').length, color: '#06b6d4' },
                { id: 'Computer & Digital Skills', icon: LaptopIcon, label: 'Digital Literacy', count: coursesList.filter((c) => c.category === 'Computer & Digital Skills').length, color: '#6366f1' },
                { id: 'Business Tech & Accounting', icon: CalculatorIcon, label: 'Accounting & Tax', count: coursesList.filter((c) => c.category === 'Business Tech & Accounting').length, color: '#059669' },
              ].map((cat) => {
                const CatIcon = cat.icon
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    style={{
                      background: isActive ? '#0f172a' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      border: `1.5px solid ${isActive ? '#0f172a' : '#cbd5e1'}`,
                      borderRadius: '999px',
                      padding: isMobile ? '0.45rem 0.95rem' : '0.55rem 1.15rem',
                      fontSize: isMobile ? '0.8rem' : '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 4px 12px rgba(15, 23, 42, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <CatIcon size={15} color={isActive ? '#ffffff' : cat.color} />
                    <span>{cat.label}</span>
                    <span
                      style={{
                        background: isActive ? '#d4af37' : '#e2e8f0',
                        color: isActive ? '#0c0e12' : '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        padding: '2px 7px',
                        borderRadius: '999px',
                      }}
                    >
                      {cat.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', width: '100%', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
                Showing <strong style={{ color: '#0f172a' }}>{filteredCourses.length}</strong> accredited program{filteredCourses.length === 1 ? '' : 's'}
              </div>

              {/* View Switcher: Compact Grid vs Normal List */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#f1f5f9',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  gap: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setCourseViewMode('grid')}
                  title="Grid View (Udemy Compact Cards)"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    background: courseViewMode === 'grid' ? '#ffffff' : 'transparent',
                    color: courseViewMode === 'grid' ? '#0f172a' : '#64748b',
                    boxShadow: courseViewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LayoutGridIcon size={14} color={courseViewMode === 'grid' ? '#0f172a' : '#64748b'} />
                  <span>Card Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCourseViewMode('list')}
                  title="Compact List View (Zero Fatigue)"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    background: courseViewMode === 'list' ? '#ffffff' : 'transparent',
                    color: courseViewMode === 'list' ? '#0f172a' : '#64748b',
                    boxShadow: courseViewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LayoutListIcon size={14} color={courseViewMode === 'list' ? '#0f172a' : '#64748b'} />
                  <span>Compact List</span>
                </button>
              </div>
            </div>
          </div>

          {filteredCourses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <SearchIcon size={36} color="#94a3b8" />
              </div>
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

          {/* =========================================================================
              VIEW MODE 1: COMPACT LIST VIEW (Normal list instead of whole card to avoid fatigue)
             ========================================================================= */}
          {courseViewMode === 'list' && filteredCourses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredCourses.map((course) => {
                const isHovered = hoveredCourseId === course.id
                return (
                  <div
                    key={course.id}
                    id={course.id}
                    onMouseEnter={() => setHoveredCourseId(course.id)}
                    onMouseLeave={() => setHoveredCourseId(null)}
                    style={{
                      background: '#ffffff',
                      border: isHovered ? '1px solid #94a3b8' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: isMobile ? '0.85rem' : '0.85rem 1.25rem',
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.06)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Left: Thumbnail + Title & Metadata */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: isMobile ? '56px' : '72px',
                          height: isMobile ? '56px' : '72px',
                          borderRadius: '8px',
                          background: '#0f172a',
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden',
                          position: 'relative',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={course.imageUrl || getCoursePhoto(course.id, course.category, course.title)}
                          alt={course.title}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            background: 'rgba(255,255,255,0.92)',
                            borderRadius: '4px',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        >
                          <CourseIcon courseId={course.id} iconKey={course.icon} size={isMobile ? 12 : 14} />
                        </div>
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              color: course.tagColor || '#1e3a8a',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {course.category}
                          </span>
                          {course.bestseller && (
                            <span
                              style={{
                                background: '#fef3c7',
                                color: '#92400e',
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                border: '1px solid #fde68a',
                              }}
                            >
                              Bestseller
                            </span>
                          )}
                        </div>

                        <h3
                          style={{
                            fontSize: isMobile ? '0.94rem' : '1.02rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 3px',
                            whiteSpace: isMobile ? 'normal' : 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {course.title}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap' }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>{course.instructor || 'Éclat Senior Faculty'}</span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#b45309', fontWeight: 800 }}>
                            ★ {(course.rating || 4.9).toFixed(1)} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({(course.ratingCount || 1240).toLocaleString()})</span>
                          </span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <ClockIcon size={12} color="#64748b" /> {course.duration || '8 Weeks'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Fee & Action Buttons */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isMobile ? 'space-between' : 'flex-end',
                        gap: '1rem',
                        width: isMobile ? '100%' : 'auto',
                        borderTop: isMobile ? '1px solid #f1f5f9' : 'none',
                        paddingTop: isMobile ? '0.65rem' : 0,
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                          {course.feeUsd ? `$${course.feeUsd}` : (course.feeDisplay || course.fee || 'Inquire')}
                        </div>
                        {course.originalFee && course.originalFee !== 'Available upon request' && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {course.originalFee}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedCourseForModal(course)}
                          style={{
                            background: '#f8fafc',
                            border: '1.5px solid #cbd5e1',
                            color: '#0f172a',
                            borderRadius: '8px',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          Syllabus
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenCourseApplication(course)}
                          style={{
                            background: '#1d4ed8',
                            border: '1.5px solid #1d4ed8',
                            color: '#ffffff',
                            borderRadius: '8px',
                            padding: '0.45rem 1rem',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 6px rgba(29, 78, 216, 0.3)',
                          }}
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* =========================================================================
              VIEW MODE 2: UDEMY-STYLE COMPACT CARDS WITH HOVER PREVIEW POPOVER
             ========================================================================= */}
          {courseViewMode === 'grid' && filteredCourses.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredCourses.map((course) => {
                const isHovered = hoveredCourseId === course.id
                return (
                  <div
                    key={course.id}
                    id={course.id}
                    onMouseEnter={() => setHoveredCourseId(course.id)}
                    onMouseLeave={() => setHoveredCourseId(null)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'visible', // allow popover if desktop
                      position: 'relative',
                      boxShadow: isHovered ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer',
                    }}
                  >
                    {/* 16:9 Crisp Course Header Thumbnail Banner with Realistic Photo */}
                    <div
                      onClick={() => setSelectedCourseForModal(course)}
                      style={{
                        position: 'relative',
                        aspectRatio: '16 / 9',
                        width: '100%',
                        background: '#0f172a',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        borderBottom: '1px solid #f1f5f9',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={course.imageUrl || getCoursePhoto(course.id, course.category, course.title)}
                        alt={course.title}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.4s ease',
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                        onError={(e) => {
                          // Fallback to stylized gradient banner if image fails
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.05) 50%, rgba(0, 0, 0, 0.1) 100%)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Floating Micro Icon Pill at bottom-left */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(6px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                        }}
                      >
                        <CourseIcon courseId={course.id} iconKey={course.icon} size={18} />
                      </div>

                      {/* Top-Right Badge */}
                      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                        {course.bestseller ? (
                          <span
                            style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              fontWeight: 800,
                              fontSize: '0.65rem',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              border: '1px solid #fde68a',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            }}
                          >
                            Bestseller
                          </span>
                        ) : (
                          <span
                            style={{
                              background: 'rgba(255, 255, 255, 0.92)',
                              color: '#1e293b',
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                            }}
                          >
                            Live Online
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Udemy-Style Compact Body (Title, Instructor, Rating, Price) */}
                    <div
                      style={{
                        padding: '0.85rem 1rem',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {/* Course Title (2-line clamp) */}
                        <h3
                          onClick={() => setSelectedCourseForModal(course)}
                          title={course.title}
                          style={{
                            fontSize: '0.94rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 0.3rem',
                            lineHeight: 1.35,
                            fontFamily: 'var(--font-heading)',
                            height: '2.6rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {course.title}
                        </h3>

                        {/* Instructor line */}
                        <div
                          style={{
                            fontSize: '0.74rem',
                            color: '#64748b',
                            marginBottom: '0.45rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {course.instructor || 'Éclat Senior Faculty'}
                        </div>

                        {/* Rating row with stars */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.45rem' }}>
                          <span style={{ color: '#b45309', fontSize: '0.82rem', fontWeight: 900 }}>
                            {(course.rating || 4.9).toFixed(1)}
                          </span>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5px' }}>
                            {[...Array(5)].map((_, starIdx) => (
                              <StarIcon key={starIdx} size={11} color="#f59e0b" fill="#f59e0b" />
                            ))}
                          </div>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                            ({(course.ratingCount || 1240).toLocaleString()})
                          </span>
                        </div>

                        {/* Duration pill */}
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ClockIcon size={11} color="#64748b" /> {course.duration || '8 Weeks'}
                        </div>
                      </div>

                      {/* Pricing row & Action buttons */}
                      <div
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                            {course.feeUsd ? `$${course.feeUsd}` : (course.feeDisplay || course.fee || 'Inquire')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.45rem' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCourseForModal(course)
                            }}
                            style={{
                              background: '#f8fafc',
                              border: '1.5px solid #cbd5e1',
                              color: '#0f172a',
                              borderRadius: '6px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            }}
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenCourseApplication(course)
                            }}
                            style={{
                              background: '#1d4ed8',
                              border: '1.5px solid #1d4ed8',
                              color: '#ffffff',
                              borderRadius: '6px',
                              padding: '0.35rem 0.85rem',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(29, 78, 216, 0.3)',
                            }}
                          >
                            Enroll
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Udemy-Style Floating Hover Preview Popover (Desktop only) */}
                    {!isMobile && isHovered && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          left: '102%',
                          width: '320px',
                          background: '#ffffff',
                          borderRadius: '10px',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)',
                          border: '1px solid #cbd5e1',
                          padding: '1.25rem',
                          zIndex: 100,
                          pointerEvents: 'auto',
                          animation: 'fadeIn 0.15s ease',
                        }}
                      >
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem', lineHeight: 1.3 }}>
                          {course.title}
                        </h4>

                        <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginBottom: '0.4rem' }}>
                          ✓ Updated 2026 • Verified Éclat Curriculum
                        </div>

                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '0.75rem' }}>
                          {course.duration} • All Shifts Available • Certified Faculty
                        </div>

                        {/* What you'll learn checklist */}
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
                          What you'll learn:
                        </div>
                        <ul style={{ margin: '0 0 1rem', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {(course.skills || []).slice(0, 3).map((skill, sIdx) => (
                            <li key={sIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.76rem', color: '#475569', lineHeight: 1.35 }}>
                              <span style={{ color: '#16a34a', flexShrink: 0, fontWeight: 900 }}>✓</span>
                              <span>{skill}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Buttons in Popover */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenCourseApplication(course)}
                            style={{
                              width: '100%',
                              background: '#1d4ed8',
                              color: '#ffffff',
                              border: '1.5px solid #1d4ed8',
                              borderRadius: '8px',
                              padding: '0.65rem',
                              fontWeight: 800,
                              fontSize: '0.86rem',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)',
                            }}
                          >
                            Enroll Now — {course.feeUsd ? `$${course.feeUsd}` : (course.feeDisplay || course.fee || 'Inquire')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCourseForModal(course)}
                            style={{
                              width: '100%',
                              background: '#f8fafc',
                              color: '#0f172a',
                              border: '1.5px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '0.55rem',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                          >
                            View Full Syllabus Modules
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Become an Instructor / Course Developer Partnership Callout Billboard */}
      <section
        id="teach-with-us"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0a1120 100%)',
          color: '#ffffff',
          padding: isMobile ? '3.5rem 1rem' : '4.5rem 2rem',
          borderTop: '1px solid #334155',
          borderBottom: '1px solid #334155',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1180px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr',
              gap: isMobile ? '2rem' : '3.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Pitch & Value Proposition */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '1rem',
                }}
              >
                <SparklesIcon size={14} color="#fbbf24" />
                <span>Faculty & Content Creators Partnership</span>
              </div>

              <h2
                style={{
                  fontSize: isMobile ? '1.85rem' : '2.6rem',
                  fontWeight: 900,
                  lineHeight: 1.2,
                  margin: '0 0 1rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Are You a Tutor, Developer or Subject Expert?{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Create & Sell Courses With Us.
                </span>
              </h2>

              <p
                style={{
                  fontSize: isMobile ? '0.94rem' : '1.08rem',
                  lineHeight: 1.65,
                  color: '#cbd5e1',
                  margin: '0 0 1.5rem',
                }}
              >
                Join Éclat Institute’s accredited virtual faculty. Turn your expertise in{' '}
                <strong style={{ color: '#ffffff' }}>Coding, Tech, Forex, Accounting, Graphic Design, or Languages</strong> into a global revenue stream. 
                We provide the streaming platform, automated Paystack payment processing, DRM watermarking, and active student enrollment pipeline.
              </p>

              {/* 3 Value Pillars */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: '1rem',
                  marginBottom: '2rem',
                }}
              >
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>💰</div>
                  <strong style={{ fontSize: '0.92rem', color: '#f8fafc', display: 'block' }}>High Revenue Share</strong>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Earn upfront creation fees or recurring royalties per enrolled student.</span>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>🛡️</div>
                  <strong style={{ fontSize: '0.92rem', color: '#f8fafc', display: 'block' }}>Anti-Piracy DRM</strong>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Your video lectures are secured with student ID watermarks and protected streaming.</span>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>🌍</div>
                  <strong style={{ fontSize: '0.92rem', color: '#f8fafc', display: 'block' }}>Instant Distribution</strong>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Reach learners across Kenya, East Africa, and global online students.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                <Link
                  to="/publish-course"
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    padding: isMobile ? '0.75rem 1rem' : '0.85rem 1.6rem',
                    fontSize: isMobile ? '0.88rem' : '0.95rem',
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 18px rgba(217, 119, 6, 0.45)',
                    transition: 'all 0.15s ease',
                    width: isMobile ? '100%' : 'auto',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                >
                  <RocketIcon size={18} color="#ffffff" />
                  <span>Publish Course & Earn 50% Share →</span>
                </Link>

                <a
                  href={getWhatsAppInquiryUrl('Hello Eclat Academic Directorate! I am a tutor/course creator interested in developing courses with Éclat Institute.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#22c55e',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: isMobile ? '0.75rem 1rem' : '0.85rem 1.35rem',
                    fontSize: isMobile ? '0.88rem' : '0.92rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)',
                    width: isMobile ? '100%' : 'auto',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                >
                  <MessageCircleIcon size={18} color="#ffffff" />
                  <span>Chat With Dean on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Column: Instructor Highlights Card */}
            <div
              style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1.5px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '20px',
                padding: isMobile ? '1.5rem' : '2rem',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <img src="/logo.png" alt="Éclat" style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #d4af37' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>Faculty Partnership Fast-Track</h3>
                  <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>3 Simple Steps to Start Earning</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>1</div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>Submit Your Course Proposal</strong>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0', lineHeight: 1.45 }}>Share your topic, syllabus outline, or sample video module via our quick portal form.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>2</div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>Curriculum Review & Contract</strong>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0', lineHeight: 1.45 }}>Our academic committee reviews the proposal within 48 hours and agrees on revenue terms.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>3</div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>Publish & Monetize Globally</strong>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0', lineHeight: 1.45 }}>We publish your lessons into the Éclat LMS player and market your course to active cohorts.</p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '0.85rem',
                  background: 'rgba(245, 158, 11, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  fontSize: '0.78rem',
                  color: '#fef08a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircleIcon size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
                <span>We welcome both pre-recorded video courses and live cohort instructors!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tuition & Fees Inquiry Hub */}
      <section id="calculator" style={{ background: '#f1f5f9', padding: isMobile ? '3rem 1rem' : '4.5rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '1.75rem' : '2.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
              TUITION & FEES INQUIRY
            </span>
            <h2 style={{ fontSize: isMobile ? '1.45rem' : '2.1rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.5rem', lineHeight: 1.25 }}>
              Course Fees Inquiry & Payment Consultation
            </h2>
            <p style={{ fontSize: isMobile ? '0.88rem' : '0.95rem', color: '#475569', maxWidth: '600px', margin: '0 auto' }}>
              Select your desired program to inquire about official tuition schedules, installment plans, and scholarship opportunities directly with our admissions office.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: isMobile ? '16px' : '20px', padding: isMobile ? '1.25rem 1rem' : '2.5rem', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: isMobile ? '1.5rem' : '2rem' }}>
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
                        {c.icon} {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="label">2. Select Preferred Payment Structure</label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckIcon size={14} color="#16a34a" /> Full Payment</span>
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
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CreditCardIcon size={14} color="#2563eb" /> 2 Installments</span>
                    <div style={{ fontSize: '0.72rem', color: '#2563eb', marginTop: '2px' }}>50% Intake / 50% Midterm</div>
                  </button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', fontSize: '0.82rem', color: '#334155' }}>
                  <div><ClockIcon size={14} color="#64748b" style={{ marginRight: '5px', verticalAlign: 'middle' }} /><strong>Course Duration:</strong> {selectedCalcCourse.duration}</div>
                  <div><CalendarIcon size={14} color="#64748b" style={{ marginRight: '5px', verticalAlign: 'middle' }} /><strong>Timetable Shifts:</strong> {selectedCalcCourse.schedule}</div>
                  <div><BriefcaseIcon size={14} color="#64748b" style={{ marginRight: '5px', verticalAlign: 'middle' }} /><strong>Career Outcome:</strong> {selectedCalcCourse.careerOutcome}</div>
                </div>
              </div>

              {/* Live Fee Inquiry Output Card */}
              <div style={{ background: '#0f172a', color: '#ffffff', borderRadius: '16px', padding: isMobile ? '1.25rem 1rem' : '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 800 }}>Program Summary</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0 1rem' }}>
                    {selectedCalcCourse.title}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.85rem', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                      <span>Tuition Schedule:</span>
                      <span style={{ background: 'rgba(37, 99, 235, 0.25)', color: '#93c5fd', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
                        Custom Quote on Inquiry
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span>Payment Plan:</span>
                      <strong style={{ color: '#ffffff' }}>{calcPlan === 'full' ? 'Single Full Payment' : '2 Equal Installments'}</strong>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    <div><LockIcon size={13} color="#93c5fd" style={{ marginRight: '5px', verticalAlign: 'middle' }} /><strong>Accepted Modes:</strong> Visa, Mastercard, M-Pesa, Bank Wire</div>
                    <div style={{ color: '#93c5fd', marginTop: '3px' }}>Inquire now to receive official fee details and instant admission guidance.</div>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a
                    href={getWhatsAppInquiryUrl(`Hello Brent College Admissions! I would like to make a Fees Inquiry for ${selectedCalcCourse.title} (${calcPlan === 'full' ? 'Full Payment' : 'Installment Plan'}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      background: '#22c55e',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <MessageCircleIcon size={16} color="#ffffff" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Fees Inquiry on WhatsApp →
                  </a>

                  <button
                    type="button"
                    className="btn"
                    style={{
                      fontWeight: 800,
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1.5px solid rgba(255,255,255,0.45)',
                      background: 'rgba(255,255,255,0.12)',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleOpenCourseApplication(selectedCalcCourse)}
                  >
                    <AwardIcon size={16} color="#ffffff" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Proceed to Online Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Multi-Platform Learning Apps Showcase Section */}
      <section id="app-download" style={{ background: '#0a0f1d', color: '#ffffff', padding: isMobile ? '3rem 1rem' : '5rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '3.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
              OFFICIAL LEARNING APPLICATIONS
            </span>
            <h2 style={{ fontSize: isMobile ? '1.45rem' : '2.3rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0 0.75rem', fontFamily: 'var(--font-heading)', lineHeight: 1.25 }}>
              Study Anywhere on Dedicated Desktop & Mobile Apps
            </h2>
            <p style={{ fontSize: isMobile ? '0.9rem' : '1.05rem', color: '#94a3b8', maxWidth: '750px', margin: '0 auto', fontWeight: 500 }}>
              Download our dedicated mobile and desktop applications to study offline, attend live lectures, and track your coursework anywhere.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: isMobile ? '1.25rem' : '2rem' }}>
            {/* Android Mobile App Card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '20px', padding: isMobile ? '1.5rem 1.25rem' : '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SmartphoneIcon size={28} color="#22c55e" />
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '999px', padding: '0.3rem 0.75rem', fontSize: '0.74rem', fontWeight: 800, color: '#34d399' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> Published on APKPure
                  </span>
                </div>
                <h3 style={{ fontSize: isMobile ? '1.15rem' : '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem' }}>
                  Android Mobile App
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Take your entire college in your pocket. Live video classes, swipe-to-refresh cloud sync, and instant timetable push alerts. Verified and available on APKPure.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><CheckIcon size={14} color="#10b981" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Official APKPure Store Verified Package</li>
                  <li><CheckIcon size={14} color="#10b981" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Offline E-Library & Study Materials</li>
                  <li><CheckIcon size={14} color="#10b981" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Swipe Down Pull-to-Refresh Gesture</li>
                  <li><CheckIcon size={14} color="#10b981" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Instant Cloud Attendance & Exam Grades</li>
                </ul>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <a
                  href={OFFICIAL_APKPURE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    padding: '0.85rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    textDecoration: 'none',
                    fontSize: '0.94rem',
                  }}
                >
                  <SparklesIcon size={18} color="#ffffff" />
                  <span>Install via APKPure Store</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setAppModalTab('android')
                    setAppModalOpen(true)
                  }}
                  className="btn"
                  style={{
                    background: 'rgba(255, 255, 255, 0.14)',
                    color: '#ffffff',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    fontWeight: 700,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.86rem',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <SmartphoneIcon size={16} color="#ffffff" />
                  <span>Direct Download (.APK)</span>
                </button>
              </div>
            </div>

            {/* Windows Desktop App Card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '20px', padding: isMobile ? '1.5rem 1.25rem' : '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <LaptopIcon size={28} color="#3b82f6" />
                </div>
                <h3 style={{ fontSize: isMobile ? '1.15rem' : '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem' }}>
                  Windows Desktop App (.EXE)
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Built for focused learning on PC. Full-screen lecture viewer, offline digital library, and fast note-taking.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><CheckIcon size={14} color="#3b82f6" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Distraction-Free Full Screen Study</li>
                  <li><CheckIcon size={14} color="#3b82f6" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Zoom Controls & Dynamic Text Resizing</li>
                  <li><CheckIcon size={14} color="#3b82f6" style={{ marginRight: '6px', verticalAlign: 'middle' }} />1-Click Registration Slip & Fee Printing</li>
                  <li><CheckIcon size={14} color="#3b82f6" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Windows 10 & 11 64-bit Compatible</li>
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
                <LaptopIcon size={16} color="#ffffff" />
                <span>Download Windows App (.EXE)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Graduate Success Stories & Reviews */}
      <section id="testimonials" style={{ padding: isMobile ? '3rem 1rem' : '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '3.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
            STUDENT REVIEWS
          </span>
          <h2 style={{ fontSize: isMobile ? '1.45rem' : '2.3rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.75rem', lineHeight: 1.25 }}>
            Real Alumni. Real Career Transformations.
          </h2>
          <p style={{ fontSize: isMobile ? '0.9rem' : '1.05rem', color: '#334155', maxWidth: '650px', margin: '0 auto', fontWeight: 500 }}>
            Hear how our practical live online classes and mentor reviews helped students land rewarding jobs and scale their skills.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: isMobile ? '1.25rem' : '2rem' }}>
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '18px',
                padding: isMobile ? '1.25rem 1rem' : '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <StarIcon key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                    ))}
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
                <p style={{ fontSize: isMobile ? '0.9rem' : '0.98rem', color: '#0f172a', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.5rem', fontWeight: 500 }}>
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
      <section style={{ background: '#0f172a', color: '#ffffff', padding: isMobile ? '3rem 1rem' : '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#60a5fa' }}>
            SIMPLE & TRANSPARENT PROCESS
          </span>
          <h2 style={{ fontSize: isMobile ? '1.45rem' : '2.2rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0 2rem', lineHeight: 1.25 }}>
            Your 3-Step Journey to Professional Success
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: isMobile ? '1.25rem' : '2.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: isMobile ? '1.5rem 1.25rem' : '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileTextIcon size={34} color="#60a5fa" />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase' }}>Step 1</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0 0.5rem', color: '#ffffff' }}>Apply Online in 60s</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                Choose your short course and timetable shift. Our Admissions Registrar will reach out to confirm your admission calling letter.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: isMobile ? '1.5rem 1.25rem' : '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <LaptopIcon size={34} color="#34d399" />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>Step 2</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0 0.5rem', color: '#ffffff' }}>Intensive Practical Training</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                Attend interactive live video sessions and global project breakout rooms. Build real-world portfolio projects under active industry mentorship.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: isMobile ? '1.5rem 1.25rem' : '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <GraduationCapIcon size={34} color="#fbbf24" />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>Step 3</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0 0.5rem', color: '#ffffff' }}>Certification & Job Search</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                Receive your verified certificate, get your CV polished by our career team, and connect directly with hiring companies.
              </p>
            </div>
          </div>

          <div style={{ marginTop: isMobile ? '2rem' : '3.5rem' }}>
            <button
              type="button"
              className="btn btn-lg"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                padding: '0.9rem 2rem',
                fontSize: isMobile ? '1rem' : '1.1rem',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
                border: 'none',
                width: isMobile ? '100%' : 'auto',
                maxWidth: isMobile ? '360px' : 'none',
              }}
              onClick={() => setInquiryModalOpen(true)}
            >
              Start Your Application Today →
            </button>
          </div>
        </div>
      </section>

      {/* Intakes, Global Payment & Admissions Section */}
      <section id="intakes" style={{ padding: isMobile ? '2.5rem 1rem' : '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: isMobile ? '1.5rem' : '2.5rem' }}>
          {/* Global Payment Card */}
          <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#ffffff', borderRadius: '20px', padding: isMobile ? '1.35rem 1rem' : '2.5rem', boxShadow: '0 10px 25px rgba(5, 150, 105, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <CreditCardIcon size={28} color="#ffffff" />
              <div>
                <h3 style={{ fontSize: isMobile ? '1.15rem' : '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>International Tuition Payment Guide</h3>
                <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>Instant automated digital invoices & receipts</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: isMobile ? '1rem 0.85rem' : '1.25rem', marginTop: '1.5rem', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                <span style={{ marginTop: '4px', flexShrink: 0 }}><GlobeIcon size={14} color="#a7f3d0" /></span>
                <span style={{ minWidth: 0, wordBreak: 'break-word' }}><strong>Currency:</strong> <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>USD ($)</span> (or local equivalent)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                <span style={{ marginTop: '4px', flexShrink: 0 }}><CreditCardIcon size={14} color="#a7f3d0" /></span>
                <span style={{ minWidth: 0, wordBreak: 'break-word' }}><strong>Card Payment:</strong> Debit / Credit Card (Visa, Mastercard & Prepaid)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                <span style={{ marginTop: '4px', flexShrink: 0 }}><BuildingIcon size={14} color="#a7f3d0" /></span>
                <span style={{ minWidth: 0, wordBreak: 'break-word' }}><strong>Bank Wire & Mobile Money:</strong> Instant automated invoices generated upon registration</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                <span style={{ marginTop: '4px', flexShrink: 0 }}><CheckCircleIcon size={14} color="#a7f3d0" /></span>
                <span style={{ minWidth: 0, wordBreak: 'break-word' }}><strong>Installment Plan:</strong> 2 flexible parts accepted (50% on admission)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                <span style={{ marginTop: '4px', flexShrink: 0 }}><FileTextIcon size={14} color="#a7f3d0" /></span>
                <span style={{ minWidth: 0, wordBreak: 'break-word' }}><strong>Receipts:</strong> Official stamped digital receipts with instant QR verification</span>
              </div>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ffffff', color: '#065f46', fontWeight: 800, padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
                onClick={() => setInquiryModalOpen(true)}
              >
                <CreditCardIcon size={15} color="#065f46" />
                <span>Enroll & Proceed to Payment Desk →</span>
              </button>
            </div>
          </div>

          {/* Virtual Admissions & Support Desk Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: isMobile ? '1.35rem 1rem' : '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <GlobeIcon size={28} color="#2563eb" />
              <div>
                <h3 style={{ fontSize: isMobile ? '1.15rem' : '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Online Admissions & Virtual Support</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Live Zoom Classes • 24/7 Digital Learning Portal</div>
              </div>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', minWidth: 0 }}>
                <span style={{ marginTop: '4px', flexShrink: 0 }}><LaptopIcon size={15} color="#64748b" /></span>
                <span style={{ minWidth: 0, wordBreak: 'break-word' }}><strong>Delivery Mode:</strong> 100% Online (Live Interactive Video + LMS Modules)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', minWidth: 0 }}>
                <span style={{ marginTop: '4px', flexShrink: 0 }}><ClockIcon size={15} color="#64748b" /></span>
                <span style={{ minWidth: 0, wordBreak: 'break-word' }}><strong>Live Class Shifts:</strong> Early Morning, Late Morning, Midday, Afternoon, Evening & Night Batches</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', minWidth: 0 }}>
                <span style={{ marginTop: '4px', flexShrink: 0 }}><PhoneIcon size={15} color="#64748b" /></span>
                <span style={{ minWidth: 0, wordBreak: 'break-word' }}><strong>Admissions Hotline:</strong> {INSTITUTION_CONFIG.contact.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                <span style={{ marginTop: '4px', flexShrink: 0 }}><MailIcon size={15} color="#64748b" /></span>
                <span style={{ minWidth: 0, wordBreak: 'break-word' }}><strong>Direct Inquiries:</strong> {INSTITUTION_CONFIG.contact.email}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-4"
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => alert(`Online Class Orientation: Call or WhatsApp ${INSTITUTION_CONFIG.contact.phone} to receive a guest Zoom link for a free live class demo!`)}
            >
              <VideoIcon size={15} color="#334155" />
              <span>Request Free Live Class Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Online Certificate Verification Tool */}
      <section style={{ background: '#f8fafc', color: '#0f172a', padding: isMobile ? '3rem 1rem' : '4.5rem 1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1d4ed8' }}>
            OFFICIAL CREDENTIALS
          </span>
          <h2 style={{ fontSize: isMobile ? '1.45rem' : '2rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.5rem', lineHeight: 1.25 }}>
            Instant Graduate Certificate Verification
          </h2>
          <p style={{ fontSize: isMobile ? '0.88rem' : '0.92rem', color: '#475569', maxWidth: '600px', margin: '0 auto 1.75rem' }}>
            Employers, embassies, and academic institutions in Kenya, the Middle East, and worldwide can instantly verify authentic Eclat Institute credentials.
          </p>

          <form onSubmit={handleVerifyCert} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem', width: '100%' }}>
            <input
              type="text"
              className="input"
              style={{ width: isMobile ? '100%' : 'auto', maxWidth: '400px', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', fontSize: '0.95rem' }}
              placeholder="Enter Certificate Serial (e.g. EI-2026-089)"
              value={certQuery}
              onChange={(e) => setCertQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? '400px' : 'none', fontWeight: 800, padding: '0.75rem 1.5rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <SearchIcon size={16} color="#ffffff" />
              <span>Verify Certificate</span>
            </button>
          </form>

          {/* Quick Preview Sample Diploma Button */}
          <div style={{ marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={() => setPreviewCert(SAMPLE_CERTIFICATES.software_engineering)}
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '0.85rem',
                fontWeight: 800,
                padding: '0.55rem 1.35rem',
                borderRadius: '25px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(29, 78, 216, 0.1)',
                transition: 'all 0.15s ease',
              }}
            >
              <GraduationCapIcon size={16} color="#1d4ed8" />
              <span>View Official Sample Conferred Diploma (Preview)</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>→</span>
            </button>
          </div>

          {certResult && (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
              {certResult.found ? (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: '14px', padding: isMobile ? '1.25rem 1rem' : '1.5rem', color: '#14532d' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <ShieldCheckIcon size={28} color="#16a34a" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#15803d', textTransform: 'uppercase', fontWeight: 800 }}>Official Verification Confirmation</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#14532d' }}>Authentic Eclat Institute Credential</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: '0.75rem', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><UserIcon size={14} color="#16a34a" /> <span><strong>Graduate Name:</strong> {certResult.studentName}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><AwardIcon size={14} color="#16a34a" /> <span><strong>Awarded Qualification:</strong> {certResult.courseTitle}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><CalendarIcon size={14} color="#16a34a" /> <span><strong>Completion Date:</strong> {certResult.completionDate}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><FileTextIcon size={14} color="#16a34a" /> <span><strong>Certificate Reference:</strong> <span style={{ color: '#15803d', fontWeight: 800 }}>{certResult.certNumber}</span></span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><GlobeIcon size={14} color="#16a34a" /> <span><strong>Delivery Format:</strong> 100% Online (Verified Digital Credential)</span></div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewCert({
                        student_name: certResult.studentName || 'Verified Graduate',
                        admission_number: certResult.certNumber || 'EI-2026-001',
                        course_title: certResult.courseTitle || 'Executive Professional Diploma',
                        grade: 'Distinction (Grade A+)',
                        percentage: 95.5,
                        issue_date: certResult.completionDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                        certificate_no: certResult.certNumber || 'EI-CERT-2026-001',
                        duration: '12 Weeks Practical Intensive (120 CPD Hours)',
                        trainer_name: 'Eng. Beatrice Ochieng, M.Sc.',
                        skills_acquired: ['Hands-on Laboratory Mastery', 'Technical Workflow & Architecture', 'Verified Competencies'],
                        honors: 'Conferred with Highest Institutional Distinction',
                      })
                    }
                    style={{
                      marginTop: '1.25rem',
                      width: '100%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      padding: '0.8rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <FileTextIcon size={16} color="#ffffff" />
                    <span>View Official Conferred Certificate Document</span>
                  </button>
                </div>
              ) : (
                <div style={{ background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '14px', padding: '1.25rem', color: '#7f1d1d', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.35rem' }}>
                    <AlertTriangleIcon size={28} color="#ef4444" />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>No Certificate Record Found</div>
                  <div style={{ fontSize: '0.84rem', color: '#991b1b', marginTop: '0.25rem' }}>
                    Please check the certificate serial number or contact the Academic Registrar at <span style={{ color: '#0f172a', fontWeight: 700 }}>{INSTITUTION_CONFIG.contact.admissionsEmail}</span>.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Desktop & Mobile Footer */}
      <footer style={{ background: '#f8fafc', color: '#475569', padding: isMobile ? '3rem 1rem 6rem' : '4rem 1.5rem 2.5rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: isMobile ? '2rem' : '2.5rem', marginBottom: isMobile ? '2rem' : '3rem' }}>
          {/* Brand & Overview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <img src="/logo.png" alt="Éclat Institute Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #1d4ed8' }} />
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>ÉCLAT INSTITUTE</span>
                <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 700 }}>100% ONLINE VIRTUAL CAMPUS & ACADEMY</div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#475569', marginBottom: '1.25rem' }}>
              Global 100% Online Virtual Campus & Open Educational Platform. Delivering live interactive cohorts, self-paced video masterclasses, and verified digital credentials across Business, IT & Data Science, Languages, and British IGCSE, with open publishing for partner schools and expert tutors.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#334155', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <ShieldCheckIcon size={16} color="#1d4ed8" />
              <span>Verified Global Online Certifications</span>
            </div>
          </div>

          {/* Online Programs Directory */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '2px solid #1d4ed8', paddingBottom: '0.4rem', display: 'inline-block' }}>
              Online Tech & Language Programs
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <a href="#courses" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                <CodeIcon size={14} color="#64748b" />
                <span>Full-Stack Web Development (React 19 & Node.js)</span>
              </a>
              <a href="#courses" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                <DatabaseIcon size={14} color="#64748b" />
                <span>Python Programming & Data Analytics</span>
              </a>
              <a href="#courses" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                <LaptopIcon size={14} color="#64748b" />
                <span>Comprehensive Computer Packages & Digital Literacy</span>
              </a>
              <a href="#courses" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                <ShieldCheckIcon size={14} color="#64748b" />
                <span>Cybersecurity Fundamentals & Network Defense</span>
              </a>
              <a href="#courses" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                <CalculatorIcon size={14} color="#64748b" />
                <span>Computerized Accounting (QuickBooks & iTax)</span>
              </a>
              <a href="#courses" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                <GraduationCapIcon size={14} color="#64748b" />
                <span>IELTS Exam Preparation (Target Band 7.5 - 9.0)</span>
              </a>
              <a href="#courses" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                <GlobeIcon size={14} color="#64748b" />
                <span>English Language Mastery & Public Speaking</span>
              </a>
              <a href="#courses" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                <GlobeIcon size={14} color="#64748b" />
                <span>Arabic, French & German Languages</span>
              </a>
            </div>
          </div>

          {/* Tuition Payment Details */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '2px solid #16a34a', paddingBottom: '0.4rem', display: 'inline-block' }}>
              International Tuition & Payments
            </h4>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#475569' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.9rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>Global Multi-Currency Billing</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d', letterSpacing: '0.03em', margin: '2px 0' }}>USD ($) Accepted</div>
                <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                  Cards, PayPal, Bank Wire & Mobile Money
                </div>
              </div>
              <div style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <CreditCardIcon size={14} color="#64748b" />
                <span><span style={{ color: '#64748b' }}>Cards:</span> <strong style={{ color: '#0f172a' }}>Visa & Mastercard</strong></span>
              </div>
              <div style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <GlobeIcon size={14} color="#64748b" />
                <span><span style={{ color: '#64748b' }}>Online:</span> <strong style={{ color: '#0f172a' }}>PayPal, Stripe & Wire Transfer</strong></span>
              </div>
              <div style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <CheckCircleIcon size={14} color="#64748b" />
                <span><span style={{ color: '#64748b' }}>Installments:</span> <strong style={{ color: '#0f172a' }}>2–3 flexible parts accepted</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <FileTextIcon size={14} color="#64748b" />
                <span><span style={{ color: '#64748b' }}>Receipts:</span> <strong style={{ color: '#0f172a' }}>Official digital receipts with QR</strong></span>
              </div>
            </div>
          </div>

          {/* Virtual Admissions & Support */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '2px solid #ea580c', paddingBottom: '0.4rem', display: 'inline-block' }}>
              Virtual Admissions & Support
            </h4>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#475569' }}>
              <div style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <GlobeIcon size={14} color="#64748b" />
                <span><span style={{ color: '#64748b' }}>Delivery:</span> <strong style={{ color: '#0f172a' }}>{INSTITUTION_CONFIG.tagline} (Worldwide)</strong></span>
              </div>
              <div style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <PhoneIcon size={14} color="#64748b" />
                <span><span style={{ color: '#64748b' }}>Phone:</span> <strong style={{ color: '#0f172a' }}>{INSTITUTION_CONFIG.contact.phone}</strong></span>
              </div>
              <div style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <MessageCircleIcon size={14} color="#64748b" />
                <span><span style={{ color: '#64748b' }}>WhatsApp:</span> <strong style={{ color: '#0f172a' }}>{INSTITUTION_CONFIG.contact.phone}</strong></span>
              </div>
              <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <MailIcon size={14} color="#64748b" />
                <span><span style={{ color: '#64748b' }}>Email:</span> <a href={`mailto:${INSTITUTION_CONFIG.contact.admissionsEmail}`} style={{ color: '#1d4ed8', textDecoration: 'underline' }}>{INSTITUTION_CONFIG.contact.admissionsEmail}</a></span>
              </div>
              
              <div style={{ marginTop: '0.75rem', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ color: '#b45309', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ClockIcon size={14} color="#b45309" />
                  <span>Online Learning & Support:</span>
                </div>
                <div style={{ color: '#334155' }}>• Cloud LMS Portal: <strong>24/7 Unlimited Access</strong></div>
                <div style={{ color: '#334155' }}>• Live Batches: <strong>Early Morning to Night (6 Daily Shifts)</strong></div>
                <div style={{ color: '#16a34a' }}>• Student Support: <strong>Daily Virtual Desk</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', maxWidth: '1280px', margin: '0 auto' }}>
          <div>
            © {new Date().getFullYear()} <strong style={{ color: '#0f172a' }}>Éclat Institute</strong>. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: isMobile ? '0.75rem' : '1.25rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/about" style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <BuildingIcon size={14} color="#1d4ed8" />
              <span>About Us</span>
            </Link>
            <Link to="/hire" style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <LaptopIcon size={14} color="#1d4ed8" />
              <span>Hire Us</span>
            </Link>
            <Link to="/careers" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <GraduationCapIcon size={14} color="#16a34a" />
              <span>Careers</span>
            </Link>
            <Link to="/courses" style={{ color: '#475569', textDecoration: 'none' }}>Courses</Link>
            <Link to="/library" style={{ color: '#475569', textDecoration: 'none' }}>E-Library</Link>
            <Link to="/donate" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HeartHandshakeIcon size={14} color="#16a34a" />
              <span>Sponsor a Student</span>
            </Link>
            <Link to="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, fontSize: '0.82rem', padding: '0.4rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              onClick={() => setShowPortalDesksModal(true)}
            >
              <LockIcon size={13} color="#ffffff" />
              <span>Staff & Student Portals</span>
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
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', color: '#0f172a', padding: isMobile ? '1.1rem 0.85rem' : '1.75rem', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #cbd5e1', boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)' }}>
            {/* Modal Header & Step Indicator */}
            <div className="modal-header" style={{ padding: 0, paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <GraduationCapIcon size={22} color="#1e3a8a" />
                  <h3 className="modal-title" style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 900, color: '#1e3a8a', margin: 0 }}>
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
              <button type="button" className="modal-close" onClick={() => setInquiryModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XIcon size={18} />
              </button>
            </div>

            {/* Step Progress Tracker */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: '#f8fafc', padding: isMobile ? '0.45rem 0.6rem' : '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: isMobile ? '0.7rem' : '0.78rem' }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label className="label" style={{ fontSize: '0.82rem' }}>Phone / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        className="input"
                        placeholder="e.g. +254 712 345 678"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label" style={{ fontSize: '0.82rem' }}>Email Address *</label>
                      <input
                        type="email"
                        required
                        className="input"
                        placeholder="e.g. student@gmail.com"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label className="label" style={{ fontSize: '0.82rem' }}>Program of Interest *</label>
                      <select
                        className="select"
                        value={inquiryForm.course}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, course: e.target.value })}
                        style={{ width: '100%' }}
                      >
                        {coursesList.map((c) => (
                          <option key={c.id} value={c.title}>
                            {c.title} ({c.duration})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label" style={{ fontSize: '0.82rem' }}>Preferred Live Class Shift *</label>
                      <select
                        className="select"
                        value={inquiryForm.preferredShift}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, preferredShift: e.target.value })}
                        style={{ width: '100%' }}
                      >
                        <option value="Early Morning (6:30 AM - 8:30 AM EAT)">Early Morning (6:30 AM - 8:30 AM EAT)</option>
                        <option value="Late Morning (9:00 AM - 11:00 AM EAT)">Late Morning (9:00 AM - 11:00 AM EAT)</option>
                        <option value="Midday (11:30 AM - 1:30 PM EAT)">Midday (11:30 AM - 1:30 PM EAT)</option>
                        <option value="Afternoon (2:00 PM - 4:00 PM EAT)">Afternoon (2:00 PM - 4:00 PM EAT)</option>
                        <option value="Evening (5:00 PM - 7:00 PM EAT)">Evening (5:00 PM - 7:00 PM EAT)</option>
                        <option value="Night Batch (8:00 PM - 10:00 PM EAT)">Night Batch (8:00 PM - 10:00 PM EAT)</option>
                        <option value="Weekend Intensive (Saturdays 9 AM - 4 PM)">Weekend Intensive (Saturdays 9 AM - 4 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label" style={{ fontSize: '0.82rem' }}>Additional Notes or Inquiries (Optional)</label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="Mention country of residence, specific goals, or prior background..."
                      value={inquiryForm.notes}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                    />
                  </div>

                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setInquiryModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ fontWeight: 800, padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>Proceed to Payment Step →</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: PAYMENT PLAN & MODE OF PAYMENT */}
            {checkoutStep === 'payment' && (
              <form onSubmit={handleCompleteEnrollmentAndPayment}>
                {/* Course Summary Box */}
                {(() => {
                  const courseObj = coursesList.find((c) => c.title === inquiryForm.course) || coursesList[0]
                  const fullAmount = typeof courseObj?.feeUsd === 'number' && courseObj.feeUsd > 0
                    ? courseObj.feeUsd
                    : courseObj?.delivery_mode === 'self_paced'
                    ? 19
                    : (Number(courseObj?.fee?.replace(/[^0-9]/g, '')) || 45)
                  const instAmount = Math.round(fullAmount / 2)
                  const selectedAmount = checkoutPaymentPlan === 'full' ? fullAmount : instAmount
                  const remainingBal = fullAmount - selectedAmount
                  const fullAmountKes = courseObj?.feeKes || Math.round(fullAmount * 130)
                  const selectedAmountKes = Math.round(selectedAmount * 130)

                  return (
                    <div>
                      {/* Plan Selection Cards */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label className="label" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>Select Tuition Payment Structure:</label>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
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
                              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <CheckIcon size={11} color="#166534" />
                                <span>100% Cleared</span>
                              </span>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>
                              ${fullAmount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>(KES {fullAmountKes.toLocaleString()})</span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Immediate 100% course clearance & lifetime access</div>
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
                            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>
                              ${instAmount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>(KES {Math.round(fullAmountKes / 2).toLocaleString()})</span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>50% now · balance before course completion</div>
                          </div>
                        </div>
                      </div>


                      {/* Exclusive Official Payment Gateway: Paystack */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label className="label" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>Official Payment Channel (Sole Accepted Method):</label>
                        <div style={{ background: '#f8fafc', border: '1.5px solid #86efac', borderRadius: '12px', padding: '1.15rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CreditCardIcon size={18} color="#ffffff" />
                              </div>
                              <div>
                                <strong style={{ fontSize: '0.95rem', color: '#166534' }}>Paystack Secured Gateway</strong>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>M-Pesa STK Push • Visa • Mastercard • Apple Pay</div>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', padding: '3px 10px', borderRadius: '999px', border: '1px solid #86efac' }}>
                              <LockIcon size={12} color="#15803d" /> PCI-DSS Level 1 Encrypted
                            </span>
                          </div>

                          <p style={{ margin: 0, fontSize: '0.83rem', color: '#334155', lineHeight: 1.55 }}>
                            Éclat Institute processes all tuition fee payments exclusively through <strong>Paystack</strong>. 
                            When you click below, Paystack's official secure payment interface will open to complete your transaction with instant clearance. 
                            <strong>Offline cash or unverified manual deposits are strictly not accepted.</strong>
                          </p>

                          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.65rem', textAlign: 'center' }}>
                              <SmartphoneIcon size={16} color="#16a34a" style={{ marginBottom: '2px' }} />
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b' }}>M-Pesa Express</div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Instant STK prompt to phone</div>
                            </div>
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.65rem', textAlign: 'center' }}>
                              <CreditCardIcon size={16} color="#2563eb" style={{ marginBottom: '2px' }} />
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b' }}>Debit / Credit Cards</div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Visa & Mastercard 3D-Secure</div>
                            </div>
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.65rem', textAlign: 'center' }}>
                              <ShieldCheckIcon size={16} color="#059669" style={{ marginBottom: '2px' }} />
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b' }}>Automated Clearance</div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Immediate receipt & pass</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCheckoutStep('details')}>
                          ← Back to Details
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{
                            fontWeight: 800,
                            padding: '0.65rem 1.6rem',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            borderColor: '#059669',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                          }}
                        >
                          <ShieldCheckIcon size={18} color="#ffffff" />
                          <span>Pay ${selectedAmount} USD via Paystack (M-Pesa / Card) →</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </form>
            )}

            {/* STEP 3: OFFICIAL STAMPED DIGITAL RECEIPT / PROVISIONAL SLIP */}
            {checkoutStep === 'receipt' && generatedAdmission && (
              <div>
                <div
                  style={{
                    background: '#ffffff',
                    border: `2px solid ${generatedAdmission.isPendingVerification ? '#f59e0b' : '#d4af37'}`,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    marginBottom: '1.25rem',
                  }}
                >
                  {/* Receipt Header */}
                  <div style={{ textAlign: 'center', borderBottom: `2px solid ${generatedAdmission.isPendingVerification ? '#d97706' : '#1e3a8a'}`, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <img src="/logo.png" alt={INSTITUTION_CONFIG.name} style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${generatedAdmission.isPendingVerification ? '#f59e0b' : '#d4af37'}` }} />
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e3a8a', margin: '0.25rem 0 2px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      {generatedAdmission.providerType === 'partner_institution' && generatedAdmission.institutionName
                        ? generatedAdmission.institutionName
                        : INSTITUTION_CONFIG.name}
                    </h2>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                      {generatedAdmission.providerType === 'partner_institution'
                        ? 'Accredited Academic Partner • Conferred in Affiliation with Éclat Institute'
                        : `${INSTITUTION_CONFIG.tagline} • ${INSTITUTION_CONFIG.domain}`}
                    </div>
                    {generatedAdmission.deliveryMode === 'live_cohort' ? (
                      <div style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '3px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, marginTop: '5px' }}>
                        🎓 OFFICIAL TUITION RECEIPT & LIVE COHORT ADMISSION PASS
                      </div>
                    ) : (
                      <div style={{ display: 'inline-block', background: '#ecfdf5', color: '#047857', padding: '3px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, marginTop: '5px' }}>
                        ⚡ INSTANT SELF-PACED ACCESS PASS (NO ADMISSION HURDLE REQUIRED)
                      </div>
                    )}
                  </div>

                  {/* Metadata Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ wordBreak: 'break-word' }}>
                      <div><strong>Receipt / Ref #:</strong> <span style={{ color: '#1e3a8a', fontWeight: 800 }}>{generatedAdmission.receiptNumber}</span></div>
                      <div><strong>Student Name:</strong> {generatedAdmission.studentName}</div>
                      {generatedAdmission.deliveryMode === 'live_cohort' ? (
                        <div><strong>Formal Admission ID:</strong> <span style={{ fontWeight: 800, color: '#2563eb' }}>{generatedAdmission.admissionNumber}</span></div>
                      ) : (
                        <div><strong>Track Type:</strong> <span style={{ fontWeight: 800, color: '#16a34a' }}>Self-Paced (Instant Video Access)</span></div>
                      )}
                    </div>
                    <div style={{ wordBreak: 'break-word' }}>
                      <div><strong>Date:</strong> {generatedAdmission.date}</div>
                      <div><strong>Course:</strong> {generatedAdmission.courseTitle}</div>
                      <div><strong>Certification:</strong> <span style={{ color: '#0369a1', fontWeight: 700 }}>{generatedAdmission.providerType === 'partner_institution' ? `Issued by ${generatedAdmission.institutionName || 'Partner School'}` : 'Issued by Éclat Institute'}</span></div>
                    </div>
                  </div>

                  {/* Amount Paid Box */}
                  <div style={{ background: generatedAdmission.isPendingVerification ? '#fffbeb' : '#f0fdf4', border: `1px solid ${generatedAdmission.isPendingVerification ? '#fde68a' : '#bbf7d0'}`, borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '0.75rem' : '0', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: generatedAdmission.isPendingVerification ? '#92400e' : '#166534', fontWeight: 800, textTransform: 'uppercase' }}>
                        TUITION AMOUNT PAID (PAYSTACK VERIFIED):
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a' }}>
                        ${generatedAdmission.amountPaid} USD
                      </div>
                    </div>
                    <div style={{ textAlign: isMobile ? 'left' : 'right', fontSize: '0.8rem', color: '#475569' }}>
                      <div>Balance Due: <strong>${generatedAdmission.balanceRemaining} USD</strong></div>
                      <div style={{ color: generatedAdmission.balanceRemaining === 0 ? '#16a34a' : '#ea580c', fontWeight: 800 }}>
                        {generatedAdmission.balanceRemaining === 0 ? 'STATUS: FULLY CLEARED' : 'STATUS: 1ST INSTALLMENT CLEARED'}
                      </div>
                    </div>
                  </div>

                  {/* Digital Stamp */}
                  <div style={{ border: '1px dashed #94a3b8', borderRadius: '6px', padding: '0.5rem', textAlign: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                    <ShieldCheckIcon size={14} color="#16a34a" style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                    Verified Paystack Ref: <code>{generatedAdmission.referenceCode}</code> • {generatedAdmission.providerType === 'partner_institution' && generatedAdmission.institutionName ? generatedAdmission.institutionName : INSTITUTION_CONFIG.name} Automated Clearing
                  </div>
                </div>

                {/* Receipt Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><PrinterIcon size={14} color="#475569" /> Print Receipt</span>
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={getWhatsAppInquiryUrl(`Hello! My name is ${generatedAdmission.studentName}. I have completed payment of $${generatedAdmission.amountPaid} for ${generatedAdmission.courseTitle}. (Ref: ${generatedAdmission.referenceCode}).`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{ background: '#22c55e', color: '#ffffff', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <MessageCircleIcon size={14} color="#ffffff" style={{ marginRight: '4px', verticalAlign: 'middle' }} />WhatsApp Helpdesk
                    </a>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setInquiryModalOpen(false)
                        navigate(generatedAdmission.courseId ? `/student/courses/${generatedAdmission.courseId}` : '/student/courses')
                      }}
                      style={{ fontWeight: 800 }}
                    >
                      <GraduationCapIcon size={15} color="#ffffff" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      {generatedAdmission.deliveryMode === 'self_paced' ? 'Start Watching Lessons Now →' : 'Enter Student Portal →'}
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
                <XIcon size={18} />
              </button>
            </div>

            {/* Platform Segmented Switcher (Native Platforms) */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.4rem', marginBottom: '1.25rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '14px' }}>
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
                <SmartphoneIcon size={18} color={appModalTab === 'android' ? '#166534' : '#64748b'} />
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
                <LaptopIcon size={18} color={appModalTab === 'windows' ? '#1e40af' : '#64748b'} />
                <span>Windows PC (.EXE)</span>
              </button>
            </div>

            {/* TAB CONTENT: ANDROID */}
            {appModalTab === 'android' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '18px', padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SmartphoneIcon size={22} color="#166534" />
                      <strong style={{ fontSize: '1.05rem', color: '#166534' }}>Official Android Learning App</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', background: '#d1fae5', padding: '0.2rem 0.55rem', borderRadius: '20px', border: '1px solid #6ee7b7', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> Published on APKPure
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#15803d', lineHeight: 1.55, margin: '0 0 0.85rem', fontWeight: 500 }}>
                    Access your enrolled courses, watch interactive video lectures, download lecture notes, and take exams directly on your phone.
                  </p>

                  <div style={{ background: 'rgba(255, 255, 255, 0.7)', border: '1px solid #dcfce7', borderRadius: '10px', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.76rem', color: '#166534', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <span><strong>Package:</strong> <code>com.eclatinstitute.lms</code></span>
                    <span><strong>Version:</strong> v1.0.0 (31 MB)</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {/* Primary Option: APKPure Store */}
                    <a
                      href={OFFICIAL_APKPURE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <SparklesIcon size={18} color="#ffffff" />
                      <span>Install via APKPure Store (Official)</span>
                    </a>

                    {/* Secondary Option: Direct APK Download */}
                    <a
                      href={OFFICIAL_APK_URL}
                      download="eclat-institute.apk"
                      style={{
                        width: '100%',
                        background: '#ffffff',
                        color: '#166534',
                        fontWeight: 700,
                        padding: '0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.86rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        border: '1.5px solid #86efac',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <SmartphoneIcon size={16} color="#166534" />
                      <span>Direct Standalone .APK Download</span>
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                  <ShieldCheckIcon size={14} color="#16a34a" />
                  <span>100% Virus-Free & Verified Official Google Play Compatible APK</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: WINDOWS PC */}
            {appModalTab === 'windows' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '18px', padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LaptopIcon size={22} color="#1e40af" />
                      <strong style={{ fontSize: '1.05rem', color: '#1e40af' }}>Windows Desktop Learning App</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', background: '#dbeafe', padding: '0.2rem 0.55rem', borderRadius: '20px', border: '1px solid #93c5fd' }}>
                      64-bit • Windows 10/11
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#1d4ed8', lineHeight: 1.55, margin: '0 0 1rem', fontWeight: 500 }}>
                    Dedicated learning workstation for Windows with full-screen lecture viewing, fast note-taking, and digital library reader.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.5rem', marginBottom: '1.15rem' }}>
                    <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #dbeafe', fontSize: '0.78rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <LaptopIcon size={16} color="#1e40af" />
                      <span>Desktop Study Hub</span>
                    </div>
                    <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #dbeafe', fontSize: '0.78rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <PrinterIcon size={16} color="#1e40af" />
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
                    <LaptopIcon size={16} color="#ffffff" />
                    <span>Download Windows Installer (.EXE)</span>
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                  <ShieldCheckIcon size={14} color="#16a34a" />
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
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', color: '#0f172a', padding: '1.75rem', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)' }}>
            <div className="modal-header" style={{ padding: 0, paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><LockIcon size={20} color="#1e3a8a" /> College Portals & Management Workstations</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '0.25rem 0 0', fontWeight: 500 }}>
                  Select your role to access your personalized workstation:
                </p>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowPortalDesksModal(false)}><XIcon size={18} /></button>
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
                <GraduationCapIcon size={28} color="#1e3a8a" />
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
                <BuildingIcon size={28} color="#d97706" />
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
                <UsersIcon size={28} color="#059669" />
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><LockIcon size={12} color="#64748b" /> Staff Access</span>
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
              background: '#ffffff',
              color: '#0f172a',
              padding: '1.75rem',
              borderRadius: '18px',
              maxHeight: '90vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
              border: '1px solid #cbd5e1',
            }}
          >
            {/* Modal Hero Banner Photo */}
            <div
              style={{
                width: '100%',
                height: '160px',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '1rem',
                background: '#0f172a',
              }}
            >
              <img
                src={selectedCourseForModal.imageUrl || getCoursePhoto(selectedCourseForModal.id, selectedCourseForModal.category, selectedCourseForModal.title)}
                alt={selectedCourseForModal.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.15) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <CourseIcon courseId={selectedCourseForModal.id} iconKey={selectedCourseForModal.icon} size={22} />
                </div>
                <div>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#0f172a',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {selectedCourseForModal.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Header */}
            <div className="modal-header" style={{ padding: 0, paddingBottom: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', background: '#ffffff', color: '#0f172a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: selectedCourseForModal.tagColor || '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {selectedCourseForModal.tag}
                  </div>
                  <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0', lineHeight: 1.25 }}>
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
                  border: '1px solid #cbd5e1',
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
                <XIcon size={18} />
              </button>
            </div>

            {/* Course Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem', background: '#f8fafc', padding: isMobile ? '0.75rem' : '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Duration & Shift</div>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ClockIcon size={14} color="#64748b" /> {selectedCourseForModal.duration ? selectedCourseForModal.duration.replace(/4\s*Weeks?(\s*\(1\s*Month\))?|1\s*Month|6\s*Weeks?/gi, '8 Weeks (2 Months)') : '8 Weeks (2 Months)'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>{selectedCourseForModal.schedule}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Tuition & Fees</div>
                <div style={{ marginTop: '4px' }}>
                  <a
                    href={getWhatsAppInquiryUrl(`Hello Brent College Admissions! I would like to make a Fees Inquiry for ${selectedCourseForModal.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <MessageCircleIcon size={13} color="#2563eb" /> Fees Inquiry
                  </a>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Learning Format</div>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}><GlobeIcon size={14} color="#0f172a" /> 100% Online</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>Live Zoom & 24/7 LMS</div>
              </div>
            </div>

            {/* Key Skills Covered */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><AwardIcon size={16} color="#1e3a8a" /> Core Practical Competencies & Tools Covered:</span>
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
                    <CheckIcon size={12} color="#1d4ed8" style={{ marginRight: '4px', verticalAlign: 'middle' }} />{skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Week by Week Syllabus */}
            {selectedCourseForModal.syllabus && selectedCourseForModal.syllabus.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.65rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><BookOpenIcon size={16} color="#1e3a8a" /> Week-by-Week Practical Lab Breakdown:</span>
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
                        <FlaskIcon size={13} color="#2563eb" style={{ marginRight: '5px', verticalAlign: 'middle' }} /><strong>Lab Practical:</strong> {s.practicalLab}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Outcomes */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#166534' }}>
              <BriefcaseIcon size={15} color="#166534" style={{ marginRight: '6px', verticalAlign: 'middle' }} /><strong>Target Career Outcomes:</strong> {selectedCourseForModal.careerOutcome}
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
                <MessageCircleIcon size={15} color="#ffffff" style={{ marginRight: '6px', verticalAlign: 'middle' }} />WhatsApp Consultation
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
                <CreditCardIcon size={15} color="#ffffff" style={{ marginRight: '6px', verticalAlign: 'middle' }} />Enroll & Pay Online →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tutor & Course Creator Application Modal */}
      {tutorModalOpen && (
        <div className="modal-overlay" onClick={() => setTutorModalOpen(false)}>
          <div
            className="modal-content modal-md"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              color: '#0f172a',
              padding: isMobile ? '1.5rem 1.25rem' : '2rem',
              borderRadius: '20px',
              border: '1.5px solid #d4af37',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src="/logo.png"
                  alt="Éclat"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #d4af37' }}
                />
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    FACULTY & CONTENT PARTNERSHIP
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>
                    Create & Teach a Course With Éclat
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTutorModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <XIcon size={16} color="#0f172a" />
              </button>
            </div>

            {tutorSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#166534', margin: '0 0 0.5rem' }}>
                  Proposal Received!
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  Thank you, <strong>{tutorForm.fullName}</strong>. Our Academic Dean and Curriculum Directorate will review your syllabus proposal and reach out via WhatsApp/email within <strong>48 hours</strong> with contract terms and revenue share options.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={getWhatsAppInquiryUrl(`Hello Eclat Dean! I just submitted a tutor course proposal for: ${tutorForm.specialization}. My name is ${tutorForm.fullName}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{
                      background: '#22c55e',
                      color: '#ffffff',
                      padding: '0.65rem 1.25rem',
                      fontWeight: 800,
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <MessageCircleIcon size={16} color="#ffffff" />
                    <span>Follow Up on WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setTutorSuccess(false)
                      setTutorModalOpen(false)
                    }}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: '0.65rem 1.25rem', fontWeight: 700, borderRadius: '8px' }}
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setTutorSubmitting(true)
                  setTimeout(() => {
                    setTutorSubmitting(false)
                    setTutorSuccess(true)
                    try {
                      // Save application locally or in Supabase if table exists
                      const applications = JSON.parse(localStorage.getItem('eclat_tutor_proposals') || '[]')
                      applications.push({ ...tutorForm, submittedAt: new Date().toISOString() })
                      localStorage.setItem('eclat_tutor_proposals', JSON.stringify(applications))
                    } catch {}
                  }, 800)
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '0.75rem 0.95rem', fontSize: '0.82rem', color: '#854d0e', lineHeight: 1.5 }}>
                  💡 <strong>Earn with Éclat:</strong> We partner with expert tutors, software engineers, and professionals. You create the instructional video content or live sessions, and we handle student enrollments, Paystack payments, and certificate delivery!
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Kevin Kiprono / Faith Mwangi"
                      value={tutorForm.fullName}
                      onChange={(e) => setTutorForm({ ...tutorForm, fullName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. tutor@example.com"
                      value={tutorForm.email}
                      onChange={(e) => setTutorForm({ ...tutorForm, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +254 700 000 000"
                      value={tutorForm.phone}
                      onChange={(e) => setTutorForm({ ...tutorForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      Teaching / Professional Experience
                    </label>
                    <select
                      value={tutorForm.experienceYears}
                      onChange={(e) => setTutorForm({ ...tutorForm, experienceYears: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        background: '#ffffff',
                      }}
                    >
                      <option value="1-2 Years">1 - 2 Years</option>
                      <option value="3-5 Years">3 - 5 Years (Experienced)</option>
                      <option value="5-10 Years">5 - 10 Years (Senior Professional)</option>
                      <option value="10+ Years">10+ Years (Master Practitioner)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Course Domain / Subject Specialization *
                  </label>
                  <select
                    value={tutorForm.specialization}
                    onChange={(e) => setTutorForm({ ...tutorForm, specialization: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: '#ffffff',
                    }}
                  >
                    <option value="Tech & Programming (Full-Stack, React, Python)">Tech & Programming (Full-Stack, React, Python)</option>
                    <option value="Data Analytics & SQL / Power BI">Data Analytics & SQL / Power BI</option>
                    <option value="Cybersecurity & Ethical Hacking">Cybersecurity & Ethical Hacking</option>
                    <option value="Forex Trading & Algorithmic Bots">Forex Trading & Algorithmic Bots</option>
                    <option value="Computerized Accounting (QuickBooks, Tally, iTax)">Computerized Accounting (QuickBooks, Tally, iTax)</option>
                    <option value="Graphic Design, Canva & UI/UX">Graphic Design, Canva & UI/UX</option>
                    <option value="Cambridge IGCSE / Edexcel Core Subjects">Cambridge IGCSE / Edexcel Core Subjects</option>
                    <option value="Languages (IELTS, French, German, Arabic)">Languages (IELTS, French, German, Arabic)</option>
                    <option value="Digital Marketing & Social Media Growth">Digital Marketing & Social Media Growth</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Course Proposal Summary / Syllabus Outline *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Briefly describe what your course will teach, the target audience, number of modules, or whether you have pre-recorded lessons ready..."
                    value={tutorForm.courseProposal}
                    onChange={(e) => setTutorForm({ ...tutorForm, courseProposal: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.86rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    LinkedIn / Portfolio / Sample Lecture Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/... or Google Drive sample video link"
                    value={tutorForm.portfolioOrLinkedin}
                    onChange={(e) => setTutorForm({ ...tutorForm, portfolioOrLinkedin: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setTutorModalOpen(false)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.6rem 1.25rem', fontWeight: 700, borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={tutorSubmitting}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      borderColor: '#d97706',
                      padding: '0.65rem 1.6rem',
                      fontWeight: 800,
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
                    }}
                  >
                    {tutorSubmitting ? 'Transmitting Proposal...' : 'Submit Course Proposal →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: isMobile ? '76px' : '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e3a8a',
            color: '#ffffff',
            border: '1px solid #3b82f6',
            borderRadius: '12px',
            padding: '12px 20px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            fontSize: '0.88rem',
            fontWeight: 700,
            animation: 'fadeIn 0.3s ease',
            maxWidth: isMobile ? 'calc(100% - 32px)' : '480px',
            width: isMobile ? 'calc(100% - 32px)' : 'auto',
            boxSizing: 'border-box',
          }}
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '8px' }}
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* Sleek Modern Floating Support Desk (WhatsApp / Admissions Live Desk) */}
      <div style={{ position: 'fixed', bottom: isMobile ? '76px' : '24px', right: isMobile ? '16px' : '24px', zIndex: 9990, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: 'calc(100% - 32px)' }}>
        {supportModalOpen && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.4rem',
              boxShadow: '0 20px 48px rgba(15, 23, 42, 0.25)',
              border: '1px solid #e2e8f0',
              width: isMobile ? 'calc(100% - 32px)' : '320px',
              maxWidth: '360px',
              boxSizing: 'border-box',
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
                <XIcon size={16} />
              </button>
            </div>

            {/* Friendly Greeting Message */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 0.85rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem' }}>
              <strong>Hi there!</strong> Have questions about our 100% online programs, tuition installment plans, or live class schedules? Connect with our virtual admissions team:
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
                <MessageCircleIcon size={16} color="#ffffff" style={{ marginRight: '6px' }} />
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
                <PhoneIcon size={16} color="#1d4ed8" style={{ marginRight: '6px' }} />
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
                <MailIcon size={16} color="#475569" style={{ marginRight: '6px' }} />
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
            width: isMobile ? '52px' : '58px',
            height: isMobile ? '52px' : '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            color: '#ffffff',
            border: '2.5px solid #ffffff',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '1.4rem' : '1.6rem',
            position: 'relative',
            transition: 'transform 0.2s',
          }}
          title={`Live Admissions & WhatsApp Support (${INSTITUTION_CONFIG.contact.phone})`}
        >
          {supportModalOpen ? (
            <XIcon size={24} color="#ffffff" strokeWidth={2.5} />
          ) : (
            <svg width={isMobile ? '24' : '28'} height={isMobile ? '24' : '28'} viewBox="0 0 24 24" fill="#ffffff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
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

      {/* Floating Scroll to Top Button (Desktop Only — on mobile, Bottom Nav Home button handles this without colliding) */}
      {showScrollTop && !isMobile && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          style={{
            position: 'fixed',
            bottom: '96px',
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

      {/* World-Class Conferred Institutional Certificate Modal */}
      {previewCert && (
        <CertificateGenerator
          cert={previewCert}
          onClose={() => setPreviewCert(null)}
        />
      )}
    </div>
  )
}

