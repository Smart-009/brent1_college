import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { MobileAppBottomNav } from '@/components/layout/MobileAppBottomNav'
import { DesktopCommandPalette } from '@/components/shared/DesktopCommandPalette'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'

interface CourseItem {
  id: string
  title: string
  category: string
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

const ALL_PROGRAMS: CourseItem[] = [
  {
    id: 'python-ds',
    title: 'Python for Data Science, AI & Machine Learning',
    category: 'Data Science & Research',
    tag: 'Highest Demand',
    tagColor: '#3b82f6',
    duration: '8 Weeks',
    schedule: 'Mon & Wed 7:30PM - 9:30PM EAT (Live Zoom)',
    fee: 'KES 24,000 / $185',
    installment: 'KES 12,000 x 2 Months',
    careerOutcome: 'Junior Data Scientist, Python Developer, AI Research Assistant',
    skills: ['Pandas', 'NumPy', 'Scikit-Learn', 'Matplotlib', 'Jupyter', 'APIs'],
    icon: '🐍',
    popular: true,
    syllabus: [
      { week: 'Week 1-2', topic: 'Python Programming Essentials & OOP', practicalLab: 'Build a Banking Automation & Data Cleaner CLI' },
      { week: 'Week 3-4', topic: 'Data Wrangling with Pandas & NumPy', practicalLab: 'Analyze Real-World Healthcare & Financial Datasets' },
      { week: 'Week 5-6', topic: 'Exploratory Data Analysis & Seaborn Visualizations', practicalLab: 'Create an Interactive Interactive Market Intelligence Dashboard' },
      { week: 'Week 7-8', topic: 'Supervised Machine Learning & Predictive Models', practicalLab: 'Deploy a Customer Churn Predictor on Streamlit Cloud' },
    ],
  },
  {
    id: 'spss-stata-r',
    title: 'Data Analysis with SPSS, STATA & R Programming',
    category: 'Data Science & Research',
    tag: 'Academic Research',
    tagColor: '#10b981',
    duration: '6 Weeks',
    schedule: 'Tue & Thu 7:00PM - 9:00PM EAT (Live Zoom)',
    fee: 'KES 22,000 / $170',
    installment: 'KES 11,000 x 2 Months',
    careerOutcome: 'Monitoring & Evaluation (M&E) Specialist, Research Analyst, Biostatistician',
    skills: ['SPSS Regression', 'STATA Panel Data', 'R Studio', 'Hypothesis Testing', 'APA Formatting'],
    icon: '📊',
    popular: true,
    syllabus: [
      { week: 'Week 1-2', topic: 'Descriptive Statistics & SPSS Survey Coding', practicalLab: 'Clean and Code Multi-Indicator Survey Questionnaires' },
      { week: 'Week 3-4', topic: 'Hypothesis Testing (ANOVA, Chi-Square, T-Tests)', practicalLab: 'Conduct Cross-Tabulation & Factor Analysis on National Demographics' },
      { week: 'Week 5', topic: 'STATA Econometric & Panel Regression Modeling', practicalLab: 'Run Fixed and Random Effects on Financial Growth Data' },
      { week: 'Week 6', topic: 'R Studio Data Visualization with ggplot2', practicalLab: 'Generate Publication-Ready APA Tables & Theses Figures' },
    ],
  },
  {
    id: 'fullstack-web',
    title: 'Full-Stack Web Development (React, Node.js & TypeScript)',
    category: 'Tech & Programming',
    tag: 'Industry Ready',
    tagColor: '#6366f1',
    duration: '12 Weeks',
    schedule: 'Mon, Wed, Fri 7:00PM - 9:00PM EAT (Live Zoom)',
    fee: 'KES 35,000 / $270',
    installment: 'KES 12,000 / Month x 3',
    careerOutcome: 'Full-Stack Software Engineer, Frontend React Developer',
    skills: ['React 18', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
    icon: '💻',
    popular: true,
    syllabus: [
      { week: 'Week 1-3', topic: 'Modern JavaScript (ES6+), DOM & TypeScript Foundations', practicalLab: 'Build Interactive Web Apps with Real-Time State' },
      { week: 'Week 4-6', topic: 'React Single Page Applications & Tailwind CSS', practicalLab: 'Develop a Modern E-Commerce Platform with Cart & Checkout' },
      { week: 'Week 7-9', topic: 'Backend APIs with Node.js, Express & JWT Auth', practicalLab: 'Create Secure Role-Based REST APIs with PostgreSQL' },
      { week: 'Week 10-12', topic: 'Deployment, Cloud Hosting & CI/CD Pipelines', practicalLab: 'Deploy Full-Stack Production System on Vercel & Supabase' },
    ],
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Product Design & Figma Prototyping',
    category: 'Creative Arts & Design',
    tag: 'Creative Career',
    tagColor: '#ec4899',
    duration: '6 Weeks',
    schedule: 'Tue & Thu 6:30PM - 8:30PM EAT (Live Zoom)',
    fee: 'KES 20,000 / $155',
    installment: 'KES 10,000 x 2 Months',
    careerOutcome: 'UI/UX Designer, Product Designer, Mobile App Prototyper',
    skills: ['Figma Auto-Layout', 'Design Systems', 'User Research', 'Wireframing', 'Interactive Prototypes'],
    icon: '🎨',
    syllabus: [
      { week: 'Week 1-2', topic: 'Design Thinking & User Experience Research', practicalLab: 'Conduct User Interviews and Build Personas & Journey Maps' },
      { week: 'Week 3-4', topic: 'Wireframing, Typography & Color Hierarchy', practicalLab: 'Create High-Fidelity Mobile App Screens in Figma' },
      { week: 'Week 5-6', topic: 'Components, Auto-Layout & Interactive Prototyping', practicalLab: 'Build & Publish a Complete Portfolio Case Study on Behance' },
    ],
  },
  {
    id: 'ielts-prep',
    title: 'IELTS Academic & General Masterclass (Band 8.0+ Target)',
    category: 'Languages & Communication',
    tag: 'Global Study & Visa',
    tagColor: '#eab308',
    duration: '6 Weeks',
    schedule: 'Mon, Tue, Wed 6:00PM - 7:30PM EAT (Live Zoom)',
    fee: 'KES 18,000 / $140',
    installment: 'KES 9,000 x 2 Months',
    careerOutcome: 'UK / Canada / Australia University Admission & Work Visa Qualification',
    skills: ['Essay Writing Task 1 & 2', 'Academic Reading', '1-on-1 Speaking Drills', 'Listening Strategies'],
    icon: '🗣️',
    popular: true,
    syllabus: [
      { week: 'Week 1-2', topic: 'Speaking Fluency, Pronunciation & Part 1-3 Mock Interviews', practicalLab: 'Live 1-on-1 Evaluated Video Speaking Assessments' },
      { week: 'Week 3-4', topic: 'Writing Task 1 (Graphs/Charts) & Task 2 (Discursive Essays)', practicalLab: 'Weekly Expert Band 8.0+ Essay Reviews & Corrections' },
      { week: 'Week 5-6', topic: 'Speed Reading Techniques & Multi-Accent Listening Mastery', practicalLab: 'Full-Length Computer-Delivered Mock Examinations' },
    ],
  },
  {
    id: 'german-a1-b1',
    title: 'German Language for Career & Study in Germany (A1 - B1)',
    category: 'Languages & Communication',
    tag: 'Goethe Zertifikat',
    tagColor: '#f97316',
    duration: '10 Weeks',
    schedule: 'Mon & Wed 6:30PM - 8:30PM EAT (Live Zoom)',
    fee: 'KES 25,000 / $195',
    installment: 'KES 12,500 x 2 Months',
    careerOutcome: 'Nursing & IT Opportunity in Germany, Goethe A1/B1 Certification',
    skills: ['Grammar & Cases', 'Conversation Practice', 'Listening Comprehension', 'Goethe Exam Prep'],
    icon: '🇩🇪',
    syllabus: [
      { week: 'Week 1-3', topic: 'Alphabet, Pronunciation, Articles & Everyday Dialogues', practicalLab: 'Daily Real-Life Speaking Practice & Vocabulary Drills' },
      { week: 'Week 4-7', topic: 'Sentence Structure, Dative/Accusative Cases & Past Tenses', practicalLab: 'Drafting Official Emails & Workplace Scenarios' },
      { week: 'Week 8-10', topic: 'Goethe Institute Examination Drills & Mock Tests', practicalLab: 'Timed Official Reading, Writing & Oral Assessments' },
    ],
  },
  {
    id: 'arabic-fluent',
    title: 'Arabic Language: Modern Standard & Gulf Dialect (Khaleeji)',
    category: 'Languages & Communication',
    tag: 'Middle East Careers',
    tagColor: '#059669',
    duration: '8 Weeks',
    schedule: 'Tue & Thu 6:30PM - 8:30PM EAT (Live Zoom)',
    fee: 'KES 20,000 / $155',
    installment: 'KES 10,000 x 2 Months',
    careerOutcome: 'Diplomatic Interpreter, Gulf Professional, Tourism & Translation',
    skills: ['Arabic Script & Phonetics', 'Business Arabic', 'Gulf Dialect Conversation', 'Grammar (Nahw)'],
    icon: '🇦🇪',
    syllabus: [
      { week: 'Week 1-2', topic: 'Arabic Script Mastery & Authentic Phonetics', practicalLab: 'Reading & Writing Everyday Phrases with Tajweed Rules' },
      { week: 'Week 3-5', topic: 'Everyday Conversational Arabic & Essential Grammar', practicalLab: 'Simulated Conversations for Travel, Hospitality & Business' },
      { week: 'Week 6-8', topic: 'Professional Arabic & Gulf Dialect Immersion', practicalLab: 'Drafting Commercial Letters & Real-Time Dialogues' },
    ],
  },
  {
    id: 'accounting-quickbooks',
    title: 'Practical Accounting with QuickBooks, Sage & KRA iTax',
    category: 'Business Tech & Accounting',
    tag: 'Employment Ready',
    tagColor: '#0284c7',
    duration: '6 Weeks',
    schedule: 'Tue & Thu 7:00PM - 9:00PM EAT (Live Zoom)',
    fee: 'KES 18,000 / $140',
    installment: 'KES 9,000 x 2 Months',
    careerOutcome: 'Accountant, Accounts Assistant, Payroll Administrator, Tax Consultant',
    skills: ['QuickBooks Online', 'KRA iTax VAT & PAYE', 'Payroll Computation', 'Financial Statements'],
    icon: '💼',
    syllabus: [
      { week: 'Week 1-2', topic: 'QuickBooks Company Setup, Chart of Accounts & Invoicing', practicalLab: 'Set up Multi-Currency Ledgers & Customer/Vendor Accounts' },
      { week: 'Week 3-4', topic: 'Bank Reconciliation, Inventory & Expense Ledgers', practicalLab: 'Reconcile Real Multi-Month Bank Statements & Card Receipts' },
      { week: 'Week 5-6', topic: 'KRA iTax Monthly Returns (VAT, PAYE, Withholding Tax) & Payroll', practicalLab: 'Compute Statutory Deductions (NSSF, NHIF/SHIF, Housing Levy)' },
    ],
  },
]

const CATEGORIES = [
  'All',
  'Data Science & Research',
  'Tech & Programming',
  'Creative Arts & Design',
  'Languages & Communication',
  'Business Tech & Accounting',
]

export function CourseCatalogPage() {
  const { profile } = useAuthContext()
  const navigate = useNavigate()
  const [selectedCat, setSelectedCat] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null)

  const filteredCourses = useMemo(() => {
    return ALL_PROGRAMS.filter((c) => {
      const matchCat = selectedCat === 'All' || c.category === selectedCat
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        c.careerOutcome.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [selectedCat, search])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <DesktopCommandPalette />

      {/* Top Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(9, 13, 22, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img src="/logo.png" alt="Éclat Emblem" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #d4af37' }} />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#d4af37', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                ÉCLAT INSTITUTE
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
                Academic Programs & Syllabus Directory
              </div>
            </div>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link
            to="/library"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            📖 E-Library
          </Link>

          <Link
            to={profile ? (profile.role === 'admin' ? '/admin' : profile.role === 'teacher' ? '/teacher' : '/student') : '/login'}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
            }}
          >
            {profile ? '🎓 My Portal' : '🔐 Sign In'}
          </Link>
        </div>
      </header>

      {/* Hero Header Strip */}
      <div style={{ background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.25) 0%, transparent 100%)', padding: '2rem 1.25rem 1.5rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <span style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', padding: '3px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
          📚 2026 Academic Catalog
        </span>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#ffffff', margin: '0.75rem 0 0.4rem', fontFamily: 'var(--font-heading)' }}>
          Explore Accredited Career Masterclasses
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
          100% online evening live classes, verifiable global certificates, real-world practical projects, and flexible 2-month installment fee plans.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search programs by skill or title (e.g. Python, IELTS, SPSS, React, Figma, QuickBooks, German)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1.1rem',
                borderRadius: '14px',
                background: '#131b2e',
                border: '1px solid #24304d',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              }}
            />
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              scrollbarWidth: 'none',
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                style={{
                  flexShrink: 0,
                  background: selectedCat === cat ? '#2563eb' : '#131b2e',
                  color: selectedCat === cat ? '#ffffff' : '#94a3b8',
                  border: selectedCat === cat ? '1px solid #3b82f6' : '1px solid #24304d',
                  borderRadius: '999px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat === 'All' ? '🔥 All Programs' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem 2rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', fontWeight: 600 }}>
          Showing <strong style={{ color: '#ffffff' }}>{filteredCourses.length}</strong> program{filteredCourses.length === 1 ? '' : 's'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              style={{
                background: '#131b2e',
                borderRadius: '18px',
                border: '1px solid #24304d',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      border: '1px solid #334155',
                      flexShrink: 0,
                    }}
                  >
                    {course.icon}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        background: `${course.tagColor}22`,
                        color: course.tagColor,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        display: 'inline-block',
                        marginBottom: '4px',
                      }}
                    >
                      {course.tag}
                    </span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#4ade80' }}>
                      {course.fee}
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                  {course.title}
                </h3>

                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                  💼 Career Outcome: <strong style={{ color: '#cbd5e1' }}>{course.careerOutcome}</strong>
                </p>

                {/* Duration & Schedule Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span style={{ background: '#182238', padding: '3px 8px', borderRadius: '6px', border: '1px solid #2e3d61' }}>⏱️ {course.duration}</span>
                  <span style={{ background: '#182238', padding: '3px 8px', borderRadius: '6px', border: '1px solid #2e3d61' }}>🏛️ {course.schedule.split('(')[0]}</span>
                </div>

                {/* Skills Learned */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {course.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#1e293b',
                        color: '#cbd5e1',
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCourse(course)}
                  style={{
                    flex: 1,
                    background: '#1e293b',
                    color: '#cbd5e1',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '0.65rem 0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  📖 View Syllabus
                </button>

                <a
                  href={getWhatsAppInquiryUrl(`Hello Admissions! I would like to enroll in ${course.title}. Please provide registration steps.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    background: '#2563eb',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '0.65rem 0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  Enroll Now →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Syllabus Modal */}
      {selectedCourse && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedCourse(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#131b2e',
              border: '1px solid #24304d',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '1.5rem',
              color: '#f8fafc',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #24304d' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase' }}>
                  {selectedCourse.category}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>
                  {selectedCourse.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                style={{ background: '#1e293b', border: 'none', color: '#94a3b8', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', background: '#0a0e17', padding: '0.75rem', borderRadius: '12px', fontSize: '0.8rem' }}>
              <div>⏱️ <strong>Duration:</strong> {selectedCourse.duration}</div>
              <div>💳 <strong>Fee:</strong> {selectedCourse.fee}</div>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#93c5fd', margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Weekly Syllabus & Practical Labs
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {selectedCourse.syllabus?.map((s, idx) => (
                <div key={idx} style={{ background: '#182238', borderRadius: '10px', padding: '0.75rem', border: '1px solid #2e3d61' }}>
                  <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 800 }}>{s.week}</div>
                  <div style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 700, margin: '2px 0' }}>{s.topic}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>🧪 Lab: {s.practicalLab}</div>
                </div>
              ))}
            </div>

            <a
              href={getWhatsAppInquiryUrl(`Hello Eclat Admissions! I reviewed the syllabus for ${selectedCourse.title} and would like to register.`)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%',
                background: '#2563eb',
                color: '#ffffff',
                padding: '0.8rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            >
              <span>🚀</span>
              <span>Enroll in This Program</span>
            </a>
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Nav */}
      <MobileAppBottomNav />
    </div>
  )
}
