import { useState, useId } from 'react'
import { Link } from 'react-router-dom'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'
import {
  GraduationCapIcon,
  BriefcaseIcon,
  GlobeIcon,
  CheckCircleIcon,
  MessageCircleIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
  LaptopIcon,
  AwardIcon,
  UsersIcon,
  CodeIcon,
  DatabaseIcon,
  BookOpenIcon,
  CalculatorIcon,
  PaletteIcon,
  BritishShieldIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  FileTextIcon,
  XIcon,
  MenuIcon,
  HomeIcon,
  BuildingIcon,
} from '@/components/icons/AppIcons'

interface JobPosition {
  id: string
  referenceCode: string
  title: string
  faculty: string
  department: string
  workType: '100% Remote / Online' | 'Flexible Schedule' | 'Part-Time or Full-Time'
  badge: string
  badgeColor: string
  icon: any
  summary: string
  responsibilities: string[]
  requirements: string[]
  compensation: string
  urgency: 'Immediate Intake' | 'Open Application'
}

const OPEN_POSITIONS: JobPosition[] = [
  {
    id: 'pos-igcse-stem',
    referenceCode: 'ECLAT-FAC-2026-01',
    title: 'Cambridge CAIE & Pearson Edexcel IGCSE STEM Teachers',
    faculty: 'School of British International Curriculum (IGCSE)',
    department: 'Cambridge Mathematics, Physics & Computer Science',
    workType: '100% Remote / Online',
    badge: 'Urgent Priority',
    badgeColor: '#dc2626',
    icon: BritishShieldIcon,
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
    icon: CodeIcon,
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
    icon: DatabaseIcon,
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
    icon: GlobeIcon,
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
    icon: PaletteIcon,
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
    icon: CalculatorIcon,
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
  },
]

export function CareersPage() {
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<string>('pos-igcse-stem')
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [appData, setAppData] = useState({
    fullName: '',
    email: '',
    phone: '',
    positionId: 'pos-igcse-stem',
    country: '',
    experienceYears: '3 - 5 Years',
    highestQualification: 'Bachelor’s Degree',
    portfolioUrl: '',
    teachingPhilosophy: '',
  })

  const formId = useId()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAppData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setApplicationSubmitted(true)
  }

  const getWhatsAppApplicationUrl = () => {
    const position = OPEN_POSITIONS.find((p) => p.id === appData.positionId)
    const positionTitle = position ? position.title : 'Faculty Position'
    const refCode = position ? position.referenceCode : 'ECLAT-FAC'
    const msg = encodeURIComponent(
      `Hello Éclat Institute Dean of Academic Affairs! I am applying for the faculty role: ${positionTitle} [${refCode}].\n\n` +
      `Full Name: ${appData.fullName}\n` +
      `Email: ${appData.email}\n` +
      `Phone/WhatsApp: ${appData.phone}\n` +
      `Country: ${appData.country}\n` +
      `Experience: ${appData.experienceYears}\n` +
      `Highest Qualification: ${appData.highestQualification}\n` +
      `Portfolio / CV Link: ${appData.portfolioUrl || 'Attached separately'}\n\n` +
      `Summary: ${appData.teachingPhilosophy || 'Eager to contribute to online excellence.'}`
    )
    return `https://wa.me/${INSTITUTION_CONFIG.contact.phone.replace(/[^0-9]/g, '')}?text=${msg}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Header Navigation */}
      <header style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(11, 17, 32, 0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: '#ffffff', minWidth: 0 }}>
            <img src="/logo.png" alt="Éclat Institute Logo" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #3b82f6', flexShrink: 0 }} />
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.04em', color: '#ffffff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ÉCLAT INSTITUTE</span>
              <span className="hidden sm:block" style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>ACADEMIC FACULTY & CAREERS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Home</Link>
            <Link to="/courses" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Courses</Link>
            <Link to="/hire" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Hire Us</Link>
            <Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>About</Link>
            <a
              href="#apply-form"
              style={{
                background: '#16a34a',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
              }}
            >
              Apply as Teacher
            </a>
          </nav>

          {/* Mobile Actions & Hamburger Button */}
          <div className="flex md:hidden" style={{ alignItems: 'center', gap: '0.5rem' }}>
            <a
              href="#apply-form"
              style={{
                background: '#16a34a',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              Apply
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: mobileMenuOpen ? '#1e293b' : '#0f172a',
                color: '#ffffff',
                border: '1.5px solid #334155',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <XIcon size={18} color="#ffffff" /> : <MenuIcon size={18} color="#ffffff" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Over Navigation Drawer Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(5, 8, 15, 0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 9998,
            }}
          />
        )}

        {/* Mobile Slide-Over Drawer Panel */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(300px, 85vw)',
              background: '#0b1120',
              borderLeft: '1px solid #1e293b',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/logo.png" alt="Éclat Logo" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #3b82f6' }} />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff' }}>ÉCLAT INSTITUTE</div>
                  <div style={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 700 }}>ACADEMIC FACULTY</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: '#1e293b', border: '1px solid #334155', color: '#ffffff', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close menu"
              >
                <XIcon size={18} color="#ffffff" />
              </button>
            </div>

            <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f8fafc', textDecoration: 'none', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 600, background: '#131d31' }}>
                <HomeIcon size={16} color="#34d399" />
                <span>Home</span>
              </Link>
              <Link to="/courses" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f8fafc', textDecoration: 'none', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 600, background: '#131d31' }}>
                <BookOpenIcon size={16} color="#34d399" />
                <span>Courses & Programs</span>
              </Link>
              <Link to="/careers" onClick={() => setMobileMenuOpen(false)} style={{ color: '#34d399', textDecoration: 'none', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700, background: '#1e293b' }}>
                <GraduationCapIcon size={16} color="#34d399" />
                <span>Careers & Teaching</span>
              </Link>
              <Link to="/hire" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f8fafc', textDecoration: 'none', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 600, background: '#131d31' }}>
                <BriefcaseIcon size={16} color="#34d399" />
                <span>Hire Us (Services)</span>
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f8fafc', textDecoration: 'none', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 600, background: '#131d31' }}>
                <BuildingIcon size={16} color="#34d399" />
                <span>About Us</span>
              </Link>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a
                  href="#apply-form"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: '#16a34a', color: '#ffffff', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', fontWeight: 800, fontSize: '0.88rem' }}
                >
                  Apply as Teacher
                </a>
                <a
                  href={`https://wa.me/${INSTITUTION_CONFIG.contact.phone.replace(/[^0-9]/g, '')}?text=Hello%20Éclat%20Dean!%20I%20am%20interested%20in%20joining%20the%20teaching%20faculty.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <MessageCircleIcon size={16} color="#ffffff" />
                  <span>WhatsApp Dean</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={{ padding: isMobile ? '3rem 1rem 2.5rem' : '4.5rem 1.5rem 3.5rem', background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15), transparent 70%)', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: isMobile ? '0.72rem' : '0.82rem', color: '#6ee7b7', fontWeight: 700, marginBottom: '1.25rem', maxWidth: '100%', flexWrap: 'wrap', textAlign: 'center', lineHeight: 1.35, boxSizing: 'border-box' }}>
            <GraduationCapIcon size={15} color="#34d399" />
            <span style={{ maxWidth: '100%', wordBreak: 'break-word', whiteSpace: 'normal' }}>GLOBAL TEACHING CALL: 2026/2027 ACADEMIC YEAR INTAKE</span>
          </div>

          <h1 style={{ fontSize: isMobile ? 'clamp(1.75rem, 6.5vw, 2.3rem)' : 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 40%, #a7f3d0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', wordBreak: 'break-word' }}>
            Teach at Éclat Institute — Inspire Global Minds from Anywhere
          </h1>

          <p style={{ fontSize: isMobile ? '0.95rem' : '1.15rem', color: '#94a3b8', maxWidth: '780px', margin: '0 auto 2rem', lineHeight: 1.65, wordBreak: 'break-word' }}>
            Join a forward-thinking virtual faculty educating ambitious students across Kenya, East Africa, the UK, the Middle East, and beyond. We are currently recruiting passionate educators in Cambridge IGCSE, Software Engineering, Data Science, World Languages, and Business Finance.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
            <a
              href="#positions"
              style={{
                background: '#16a34a',
                color: '#ffffff',
                padding: isMobile ? '0.75rem 1.25rem' : '0.85rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: isMobile ? '0.9rem' : '1rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 10px 25px rgba(22, 163, 74, 0.4)',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            >
              <span>Explore Open Positions</span>
              <ArrowRightIcon size={16} />
            </a>
            <a
              href="#apply-form"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: isMobile ? '0.75rem 1.25rem' : '0.85rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: isMobile ? '0.9rem' : '1rem',
                textDecoration: 'none',
                textAlign: 'center',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            >
              Direct Application Form
            </a>
          </div>

          {/* Faculty Benefits Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: isMobile ? '0.85rem' : '1.25rem', marginTop: isMobile ? '2.5rem' : '3.5rem', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ padding: isMobile ? '1rem' : '1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', boxSizing: 'border-box' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <LaptopIcon size={20} color="#22c55e" />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>100% Virtual &amp; Remote</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Deliver lectures from your home or office. Zero commute time with automated attendance and class links.
              </p>
            </div>

            <div style={{ padding: isMobile ? '1rem' : '1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', boxSizing: 'border-box' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <ClockIcon size={20} color="#3b82f6" />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>Flexible Batch Schedules</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Morning, afternoon, evening, and weekend batches tailored to fit alongside your current commitments.
              </p>
            </div>

            <div style={{ padding: isMobile ? '1rem' : '1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', boxSizing: 'border-box' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <AwardIcon size={20} color="#f59e0b" />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>Prompt, Guaranteed Pay</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Reliable biometric &amp; digital hourly stipend disbursements in USD or local currency, without delays.
              </p>
            </div>

            <div style={{ padding: isMobile ? '1rem' : '1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', boxSizing: 'border-box' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <UsersIcon size={20} color="#a855f7" />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>Dedicated Academic Tooling</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                Access our proprietary cloud LMS, digital gradebook, curriculum question banks, and licensed Google Workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions List */}
      <section id="positions" style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '2.5rem 1rem' : '4rem 1.5rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '3rem' }}>
          <h2 style={{ fontSize: isMobile ? '1.65rem' : '2.2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
            Current Open Faculty Positions
          </h2>
          <p style={{ color: '#94a3b8', fontSize: isMobile ? '0.92rem' : '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.5, wordBreak: 'break-word' }}>
            Select a position to view qualifications, curriculum syllabi, and application criteria.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.25rem' : '1.75rem', width: '100%', boxSizing: 'border-box' }}>
          {OPEN_POSITIONS.map((pos) => {
            const Icon = pos.icon
            const isSelected = selectedPosition === pos.id

            return (
              <div
                key={pos.id}
                style={{
                  background: isSelected ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? `2px solid ${pos.badgeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: isMobile ? '14px' : '16px',
                  padding: isMobile ? '1.25rem 0.85rem' : '2rem',
                  transition: 'all 0.2s',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: '1rem', marginBottom: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '0.75rem' : '1rem', minWidth: 0, flex: 1, width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '12px', background: `${pos.badgeColor}20`, border: `1px solid ${pos.badgeColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={isMobile ? 20 : 24} color={pos.badgeColor} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1, width: '100%', boxSizing: 'border-box' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>REF: {pos.referenceCode}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', background: `${pos.badgeColor}15`, color: pos.badgeColor, border: `1px solid ${pos.badgeColor}35` }}>
                          {pos.badge}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>
                          {pos.workType}
                        </span>
                      </div>
                      <h3 style={{ fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.25, wordBreak: 'break-word' }}>
                        {pos.title}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem', wordBreak: 'break-word' }}>
                        {pos.faculty} • <span style={{ color: '#38bdf8' }}>{pos.department}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="#apply-form"
                    onClick={() => {
                      setSelectedPosition(pos.id)
                      setAppData((prev) => ({ ...prev, positionId: pos.id }))
                    }}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: isMobile ? '0.65rem 1rem' : '0.65rem 1.4rem',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box',
                      flexShrink: 0,
                    }}
                  >
                    <span>Apply for Position</span>
                    <ArrowRightIcon size={15} />
                  </a>
                </div>

                <p style={{ fontSize: isMobile ? '0.88rem' : '0.95rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {pos.summary}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: isMobile ? '1.25rem' : '1.5rem',
                    marginBottom: '1.25rem',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: isMobile ? '1rem 0.85rem' : '1.25rem',
                    borderRadius: '12px',
                    boxSizing: 'border-box',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                      Key Responsibilities
                    </h5>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', boxSizing: 'border-box' }}>
                      {pos.responsibilities.map((r, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: isMobile ? '0.82rem' : '0.85rem', color: '#cbd5e1', lineHeight: 1.45, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                          <CheckCircleIcon size={14} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ minWidth: 0, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                      Minimum Requirements &amp; Profile
                    </h5>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', boxSizing: 'border-box' }}>
                      {pos.requirements.map((req, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: isMobile ? '0.82rem' : '0.85rem', color: '#cbd5e1', lineHeight: 1.45, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                          <CheckIcon size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ minWidth: 0, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: isMobile ? '0.82rem' : '0.88rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#94a3b8', minWidth: 0, flex: 1 }}>
                    <AwardIcon size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ wordBreak: 'break-word' }}>Compensation: <strong style={{ color: '#ffffff' }}>{pos.compensation}</strong></span>
                  </div>
                  <div style={{ color: '#38bdf8', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Status: {pos.urgency}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Online Teacher Application Form */}
      <section id="apply-form" style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '2.5rem 1rem' : '4rem 1.5rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: isMobile ? '16px' : '20px', padding: isMobile ? '1.5rem 1rem' : '2.5rem 2rem', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '1.5rem' : '2rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Official Academic Application Portal
            </span>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, marginTop: '0.35rem', marginBottom: '0.5rem', color: '#ffffff', wordBreak: 'break-word' }}>
              Submit Your Teaching Application
            </h2>
            <p style={{ color: '#94a3b8', fontSize: isMobile ? '0.88rem' : '0.95rem', lineHeight: 1.5 }}>
              We review faculty credentials within 48 hours and invite shortlisted teachers for a 20-minute virtual micro-teaching demo.
            </p>
          </div>

          {applicationSubmitted ? (
            <div style={{ textAlign: 'center', padding: isMobile ? '2rem 1rem' : '3rem 1.5rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '14px', boxSizing: 'border-box' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckIcon size={28} color="#ffffff" />
              </div>
              <h3 style={{ fontSize: isMobile ? '1.3rem' : '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
                Application Submitted Successfully!
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: isMobile ? '0.88rem' : '0.95rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                Thank you, <strong>{appData.fullName}</strong>. The Academic Dean & Faculty Recruitment Committee has received your credentials. We will contact you at <strong>{appData.email}</strong> regarding the online teaching interview.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={getWhatsAppApplicationUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    padding: isMobile ? '0.7rem 1.1rem' : '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: isMobile ? '100%' : 'auto',
                    boxSizing: 'border-box',
                    fontSize: isMobile ? '0.88rem' : '0.95rem',
                  }}
                >
                  <MessageCircleIcon size={16} />
                  <span>Notify Academic Dean via WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setApplicationSubmitted(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: 'none',
                    padding: isMobile ? '0.7rem 1.1rem' : '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    boxSizing: 'border-box',
                    fontSize: isMobile ? '0.88rem' : '0.95rem',
                  }}
                >
                  Apply for Another Position
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
              <div>
                <label htmlFor={`${formId}-fullName`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Full Name *
                </label>
                <input
                  id={`${formId}-fullName`}
                  type="text"
                  name="fullName"
                  required
                  value={appData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Samuel Maina, MSc"
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label htmlFor={`${formId}-email`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Email Address *
                </label>
                <input
                  id={`${formId}-email`}
                  type="email"
                  name="email"
                  required
                  value={appData.email}
                  onChange={handleInputChange}
                  placeholder="teacher@example.com"
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label htmlFor={`${formId}-phone`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  WhatsApp / Phone Number *
                </label>
                <input
                  id={`${formId}-phone`}
                  type="tel"
                  name="phone"
                  required
                  value={appData.phone}
                  onChange={handleInputChange}
                  placeholder="+254 7XX XXX XXX"
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label htmlFor={`${formId}-country`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Country / Current Location *
                </label>
                <input
                  id={`${formId}-country`}
                  type="text"
                  name="country"
                  required
                  value={appData.country}
                  onChange={handleInputChange}
                  placeholder="e.g. Kenya / Nigeria / UK / UAE"
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor={`${formId}-position`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Select Position Applying For *
                </label>
                <select
                  id={`${formId}-position`}
                  name="positionId"
                  value={appData.positionId}
                  onChange={handleInputChange}
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: isMobile ? '0.88rem' : '0.95rem' }}
                >
                  {OPEN_POSITIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.referenceCode}] {p.title} — {p.faculty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`${formId}-experience`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Years of Teaching / Practice *
                </label>
                <select
                  id={`${formId}-experience`}
                  name="experienceYears"
                  value={appData.experienceYears}
                  onChange={handleInputChange}
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: isMobile ? '0.88rem' : '0.95rem' }}
                >
                  <option value="1 - 2 Years">1 – 2 Years (Associate Instructor)</option>
                  <option value="3 - 5 Years">3 – 5 Years (Senior Lecturer)</option>
                  <option value="5 - 10 Years">5 – 10 Years (Principal Master)</option>
                  <option value="10+ Years">10+ Years (Department Chair / Expert)</option>
                </select>
              </div>

              <div>
                <label htmlFor={`${formId}-qualification`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Highest Academic Degree / Credential *
                </label>
                <select
                  id={`${formId}-qualification`}
                  name="highestQualification"
                  value={appData.highestQualification}
                  onChange={handleInputChange}
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: isMobile ? '0.88rem' : '0.95rem' }}
                >
                  <option value="Bachelor’s Degree">Bachelor’s Degree (BSc, BEd, BA)</option>
                  <option value="Master’s Degree">Master’s Degree (MSc, MEd, MA, MBA)</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                  <option value="Professional Certification">Industry / Board Certified (CPA, PMP, CEFR)</option>
                  <option value="Diploma / Associate">Higher National Diploma / Associate</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor={`${formId}-portfolio`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Link to Resume / CV / LinkedIn Profile / Portfolio *
                </label>
                <input
                  id={`${formId}-portfolio`}
                  type="url"
                  name="portfolioUrl"
                  required
                  value={appData.portfolioUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourname or Google Drive CV Link"
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor={`${formId}-philosophy`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Brief Teaching Philosophy &amp; Subject Specialization *
                </label>
                <textarea
                  id={`${formId}-philosophy`}
                  name="teachingPhilosophy"
                  required
                  rows={4}
                  value={appData.teachingPhilosophy}
                  onChange={handleInputChange}
                  placeholder="Briefly describe your approach to virtual student engagement, exam preparation methodology, and your key strengths in this subject..."
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#ffffff',
                    border: 'none',
                    padding: isMobile ? '0.85rem 1.25rem' : '0.95rem 1.5rem',
                    borderRadius: '10px',
                    fontSize: isMobile ? '0.98rem' : '1.05rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(22, 163, 74, 0.4)',
                    boxSizing: 'border-box',
                  }}
                >
                  Submit Teacher Application
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Recruitment FAQs */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '0 1rem 3rem' : '0 1.5rem 4rem', width: '100%', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: isMobile ? '1.3rem' : '1.5rem', fontWeight: 900, textAlign: 'center', marginBottom: isMobile ? '1.5rem' : '2rem', color: '#ffffff', wordBreak: 'break-word' }}>
          Frequently Asked Questions for Teacher Applicants
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ padding: isMobile ? '1rem' : '1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', boxSizing: 'border-box' }}>
            <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.35rem', lineHeight: 1.35, wordBreak: 'break-word' }}>
              Do I need to be located in Kenya to teach at Éclat Institute?
            </h5>
            <p style={{ fontSize: isMobile ? '0.84rem' : '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>
              No! Éclat Institute is a 100% virtual campus. We employ educators residing in Kenya, the United Kingdom, Egypt, Germany, Nigeria, the UAE, and across the globe. You only need a stable internet connection, an HD webcam/microphone, and subject expertise.
            </p>
          </div>

          <div style={{ padding: isMobile ? '1rem' : '1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', boxSizing: 'border-box' }}>
            <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.35rem', lineHeight: 1.35, wordBreak: 'break-word' }}>
              How does scheduling work? Can I teach part-time alongside another job?
            </h5>
            <p style={{ fontSize: isMobile ? '0.84rem' : '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>
              Yes. Many of our faculty members are working software engineers, university professors, or secondary school educators. We have early morning (6:00 AM – 8:00 AM), evening (6:00 PM – 9:00 PM), and intensive weekend batches.
            </p>
          </div>

          <div style={{ padding: isMobile ? '1rem' : '1.25rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', boxSizing: 'border-box' }}>
            <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.35rem', lineHeight: 1.35, wordBreak: 'break-word' }}>
              What tools and software does Éclat provide for teachers?
            </h5>
            <p style={{ fontSize: isMobile ? '0.84rem' : '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>
              Teachers receive official `@eclatinstitute.internal` email credentials, access to our customized Teacher Workstation Dashboard, Google Workspace for Education with Meet recordings, past paper repository access, and live tech support.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#070a14', padding: isMobile ? '2.5rem 1rem 1.5rem' : '3rem 1.5rem 2rem', color: '#64748b', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Éclat Institute" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem' }}>Éclat Institute Academic Board</span>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? '1rem' : '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
            <Link to="/courses" style={{ color: '#94a3b8', textDecoration: 'none' }}>Courses</Link>
            <Link to="/hire" style={{ color: '#94a3b8', textDecoration: 'none' }}>Hire Us (Tech Services)</Link>
            <Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</Link>
            <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
          </div>
          <div>
            © {new Date().getFullYear()} Éclat Institute. Equal Opportunity Virtual Employer.
          </div>
        </div>
      </footer>
    </div>
  )
}
