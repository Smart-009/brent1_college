import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'

export function AboutPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'mission' | 'methodology' | 'accreditation' | 'leadership'>('mission')

  const stats = [
    { number: '15,000+', label: 'Global Alumni & Students', icon: '🌍' },
    { number: '40+', label: 'Countries Represented', icon: '🌐' },
    { number: '98.4%', label: 'Course Completion Rate', icon: '📈' },
    { number: '100%', label: 'Live Interactive Virtual Labs', icon: '💻' },
    { number: '5', label: 'Specialized Academic Faculties', icon: '🏛️' },
    { number: '24/7', label: 'LMS Cloud & App Access', icon: '📱' },
  ]

  const faculties = [
    {
      id: 'tech',
      name: 'Faculty of Technology & Software Engineering',
      icon: '💻',
      color: '#3b82f6',
      badge: 'High Demand',
      description:
        'Industry-grade software engineering curriculum covering modern full-stack web development, backend architecture, cloud databases, and ethical hacking.',
      units: [
        'Full-Stack JavaScript (React 19, TypeScript & Node.js REST APIs)',
        'Python for Software Developers & Automation',
        'Relational & Cloud Databases (PostgreSQL, Supabase, MySQL)',
        'Cybersecurity, Network Defense & Ethical Hacking',
        'Git, GitHub CI/CD & Linux Server Administration',
      ],
      careerOutcomes: 'Full-Stack Developer, Backend Engineer, SOC Analyst, DevOps Associate',
    },
    {
      id: 'data',
      name: 'Faculty of Data Science, Econometrics & Research Methods',
      icon: '📊',
      color: '#10b981',
      badge: 'Academic & Research',
      description:
        'Rigorous quantitative methods, biostatistics, survey analysis, and econometric modeling taught with hands-on toolkits used by global research institutes.',
      units: [
        'Python for Data Analysis (Pandas, NumPy, Matplotlib & Seaborn)',
        'R Programming & RStudio Biostatistics for Health & Social Sciences',
        'IBM SPSS Statistics (Survey Coding, ANOVA, Multi-Level Regressions)',
        'Stata Econometric & Panel Data Modeling',
        'Advanced Microsoft Excel (VBA, Power Query, Macros & Dashboards)',
      ],
      careerOutcomes: 'Data Analyst, Quantitative Researcher, Biostatistician, Monitoring & Evaluation Specialist',
    },
    {
      id: 'design',
      name: 'Faculty of Creative Arts, UI/UX & Digital Media',
      icon: '🎨',
      color: '#8b5cf6',
      badge: 'Creative Portfolio',
      description:
        'User-centric interface design systems, brand identity, vector graphics, photo manipulation, and motion media created for modern digital products.',
      units: [
        'UI/UX Design Systems in Figma (Wireframing, Auto-Layout, Interactive Prototyping)',
        'Adobe Photoshop Mastery (Photo Editing, Retouching & Composite Art)',
        'Adobe Illustrator (Vector Branding, Logos, Iconography & Typography)',
        'Digital Graphic Design for Brand Identity & Social Advertising',
        'Video Editing & Motion Graphics in Adobe Premiere Pro',
      ],
      careerOutcomes: 'UI/UX Designer, Visual Brand Designer, Digital Content Creator, Product Designer',
    },
    {
      id: 'languages',
      name: 'Faculty of World Languages & International Testing',
      icon: '🗣️',
      color: '#f59e0b',
      badge: 'Global Mobility',
      description:
        'Immersive communicative language training and high-stakes international exam preparation delivered with 1-on-1 speaking breakout rooms and Cambridge-certified coaches.',
      units: [
        'IELTS Academic & General Training (Band 7.5 - 9.0 Strategy & Mock Speaking)',
        'German Language (Goethe-Zertifikat A1, A2, B1, B2 Preparation)',
        'French Language (DELF / DALF Immersion & Diplomatic French)',
        'Arabic Language (Modern Standard Arabic & Conversational Dialects)',
        'English Language Proficiency (Grammar, Academic Writing & Fluency)',
        'Swahili for International Travellers, Diplomats & Researchers',
      ],
      careerOutcomes: 'International Scholar, Multilingual Diplomat, Translator, Study Abroad Candidate',
    },
    {
      id: 'business',
      name: 'Faculty of Business Computing & Financial Technology',
      icon: '🧾',
      color: '#ec4899',
      badge: 'Corporate Finance',
      description:
        'Modern financial software, international bookkeeping, tax compliance, and automated payroll systems designed for modern enterprise workflows.',
      units: [
        'QuickBooks Online & Desktop Pro (Multi-Currency Setup, Bank Feeds, Reconciliations)',
        'Computerized Accounting Systems & International VAT/Tax Filing',
        'Payroll Management & Statutory Returns Compliance',
        'Sage Pastel & Contemporary Enterprise ERP Accounting',
        'Financial Modeling & Business Valuation in Excel',
      ],
      careerOutcomes: 'Financial Controller, QuickBooks Specialist, Tax Consultant, Bookkeeper',
    },
  ]

  const values = [
    {
      title: 'Practical Mastery over Rote Theory',
      icon: '⚡',
      desc: 'Every lecture is paired with live code labs, simulated mock sessions, or real-world project portfolios. Our students graduate with verifiable proof of competence.',
    },
    {
      title: '100% Live Instructor-Led Classes',
      icon: '🎙️',
      desc: 'Unlike passive pre-recorded video sites, Éclat offers live virtual classroom sessions with direct screen-shares, real-time Q&A, and mentor code reviews.',
    },
    {
      title: 'Global Inclusivity & Flexible Access',
      icon: '🌍',
      desc: 'Evening and weekend shifts accommodate working professionals across multiple international time zones with 24/7 cloud recording replays.',
    },
    {
      title: 'Cryptographic Credential Security',
      icon: '🔒',
      desc: 'All certificates feature instant QR code verification and tamper-proof identifiers for immediate credential validation by employers and universities worldwide.',
    },
  ]

  const leadership = [
    {
      name: 'Dr. Arthur Sterling, Ph.D.',
      role: 'Dean of Academic Affairs & Faculty Chair',
      qual: 'Ph.D. in Computer Science (Edinburgh), M.Sc. Data Systems (Oxford)',
      quote:
        'Our pedagogical mission is straightforward: empower motivated individuals worldwide with verifiable digital skills and real-world rigor.',
      avatar: '👨‍🏫',
    },
    {
      name: 'Prof. Helen Montgomery, Ed.D.',
      role: 'Director of Language Pedagogy & IELTS Methodologist',
      qual: 'Cambridge DELTA Certified, Ed.D. Applied Linguistics',
      quote:
        'Language fluency is the gateway to global opportunity. Our breakout rooms and 1-on-1 mock clinics ensure every student hits their target band.',
      avatar: '👩‍🏫',
    },
    {
      name: 'Eng. Marcus Vance',
      role: 'Head of Software Engineering Labs',
      qual: 'Former Principal Architect, Tech Lead in Fintech & Cloud Platforms',
      quote:
        'We do not teach syntax in a vacuum. We teach systems engineering, git workflows, architectural patterns, and production debugging.',
      avatar: '💻',
    },
    {
      name: 'Claire A. Mutua, CPA-K, M.Sc.',
      role: 'Head of Financial Tech & Business Systems',
      qual: 'CPA-K, M.Sc. Finance & Accounting, Certified QuickBooks Trainer',
      quote:
        'Contemporary finance demands automated reconciliation and cloud ERP dexterity. We bridge the gap between textbook bookkeeping and global corporate workflows.',
      avatar: '📊',
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070a13',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflowX: 'hidden',
      }}
    >
      {/* Top Banner Alert */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #1e40af 50%, #0f172a 100%)',
          color: '#ffffff',
          fontSize: '0.82rem',
          padding: '0.55rem 1rem',
          textAlign: 'center',
          fontWeight: 700,
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>🌟</span>
        <span>
          <strong>2026/2027 Academic Admissions:</strong> Live Online Evening & Weekend Batches are currently enrolling!
        </span>
        <a
          href={getWhatsAppInquiryUrl('Hello Admissions, I would like to inquire about enrolling in upcoming intakes.')}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fef08a', textDecoration: 'underline', marginLeft: '6px' }}
        >
          Inquire via WhatsApp →
        </a>
      </div>

      {/* Main Header / Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(7, 10, 19, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.85rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Logo Brand */}
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <img
              src="/logo.png"
              alt="Éclat Institute Logo"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid #d4af37',
                boxShadow: '0 0 12px rgba(212, 175, 55, 0.35)',
              }}
            />
            <div>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: '#d4af37',
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-heading, "Cinzel", serif)',
                  lineHeight: 1.1,
                }}
              >
                {INSTITUTION_CONFIG.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                100% Online Global Academy
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex"
            style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.88rem', fontWeight: 700 }}
          >
            <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
              Home
            </Link>
            <Link to="/courses" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Courses
            </Link>
            <Link to="/#intakes-section" style={{ color: '#f59e0b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🗓️</span>
              <span>Intakes</span>
            </Link>
            <Link to="/library" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              E-Library
            </Link>
            <Link to="/about" style={{ color: '#38bdf8', textDecoration: 'none', borderBottom: '2px solid #38bdf8', paddingBottom: '2px' }}>
              About Us
            </Link>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href={getWhatsAppInquiryUrl('Hello Admissions Desk, I want to learn more about Éclat Institute programs and admissions.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm hidden sm:inline-flex"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(22, 163, 74, 0.3)',
              }}
            >
              <span>💬</span>
              <span>WhatsApp Counselor</span>
            </a>

            <Link
              to="/login"
              className="btn btn-sm btn-primary"
              style={{
                fontWeight: 800,
                fontSize: '0.82rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              🔐 Student Portal
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              background: '#0d1322',
              borderTop: '1px solid rgba(59, 130, 246, 0.3)',
              marginTop: '0.85rem',
              padding: '1rem',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#f8fafc', textDecoration: 'none', padding: '0.5rem', fontWeight: 700 }}
            >
              🏠 Home
            </Link>
            <Link
              to="/courses"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#f8fafc', textDecoration: 'none', padding: '0.5rem', fontWeight: 700 }}
            >
              📚 Courses & Academic Programs
            </Link>
            <Link
              to="/#intakes-section"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#f59e0b', textDecoration: 'none', padding: '0.5rem', fontWeight: 700 }}
            >
              🗓️ Upcoming Academic Intakes
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#38bdf8', textDecoration: 'none', padding: '0.5rem', fontWeight: 800, background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px' }}
            >
              🏛️ About Éclat Institute
            </Link>
            <Link
              to="/library"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#f8fafc', textDecoration: 'none', padding: '0.5rem', fontWeight: 700 }}
            >
              📖 E-Library & Handbooks
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 1.5rem 3.5rem',
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(30, 58, 138, 0.4), transparent)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#fef08a',
              padding: '6px 16px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '1.25rem',
            }}
          >
            <span>🏛️</span>
            <span>Accredited 100% Online Global Academy</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 5vw, 3.5rem)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              margin: '0 0 1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Pioneering Rigorous, <span style={{ color: '#d4af37' }}>Practical Online Education</span> for the Modern World
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#94a3b8',
              lineHeight: 1.7,
              maxWidth: '820px',
              margin: '0 auto 2rem',
              fontWeight: 400,
            }}
          >
            {INSTITUTION_CONFIG.name} is an international digital institution dedicated to bridging the global skills divide. We engineer career-defining masterclasses in Software Engineering, Econometric Data Science, World Languages, Creative UI/UX Design, and Financial Technology with live mentor feedback and cryptographic certificate verification.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/courses"
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '0.85rem 1.75rem',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
              }}
            >
              🎓 Explore Academic Programs
            </Link>

            <a
              href={getWhatsAppInquiryUrl('Hello Admissions, I would like to schedule a 1-on-1 academic consultation regarding your online courses.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>💬</span>
              <span>Speak with Admissions</span>
            </a>
          </div>
        </div>
      </section>

      {/* Global Impact Numbers Bar */}
      <section
        style={{
          background: '#0a0f1d',
          padding: '2.5rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          {stats.map((st, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '16px',
                padding: '1.25rem 1rem',
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{st.icon}</div>
              <div
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading, sans-serif)',
                  lineHeight: 1.1,
                }}
              >
                {st.number}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.35rem' }}>
                {st.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Tabs: Mission, Pedagogy, Accreditation, Leadership */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '4.5rem 1.5rem' }}>
        {/* Navigation Tabs Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}
        >
          {[
            { id: 'mission', label: '🎯 Mission & Vision', icon: '✨' },
            { id: 'methodology', label: '🔬 Learning Methodology', icon: '💻' },
            { id: 'accreditation', label: '📜 Certificates & Security', icon: '🔒' },
            { id: 'leadership', label: '👨‍💼 Academic Leadership', icon: '🏛️' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #2563eb, #1e40af)' : '#131b2e',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                border: activeTab === tab.id ? '1px solid #3b82f6' : '1px solid #1e293b',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(37, 99, 235, 0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Mission & Vision */}
        {activeTab === 'mission' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                marginBottom: '3.5rem',
              }}
            >
              {/* Mission Card */}
              <div
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 58, 138, 0.25), rgba(15, 23, 42, 0.8))',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: '#1e3a8a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  🚀
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem' }}>
                  Our Academic Mission
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.96rem', margin: 0 }}>
                  To democratize access to elite-level technological, analytical, and linguistic education by delivering 100% online, live mentor-supported programs that equip learners worldwide with competitive, verifiable workplace competencies.
                </p>
              </div>

              {/* Vision Card */}
              <div
                style={{
                  background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.15), rgba(15, 23, 42, 0.8))',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'rgba(212, 175, 55, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  👁️
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fef08a', margin: '0 0 1rem' }}>
                  Our Global Vision
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.96rem', margin: 0 }}>
                  To become the world's most trusted online academy for applied skills, recognized by multinational employers, academic institutions, and remote global organizations for unparalleled graduate readiness and ethical rigor.
                </p>
              </div>
            </div>

            {/* Core Values Grid */}
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', textAlign: 'center', margin: '0 0 2rem' }}>
              Institutional Core Values
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {values.map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#0d1424',
                    border: '1px solid #1e293b',
                    borderRadius: '16px',
                    padding: '1.75rem',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{val.icon}</div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem' }}>
                    {val.title}
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Learning Methodology */}
        {activeTab === 'methodology' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem' }}>
                The Éclat Hybrid-Live Pedagogy
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7 }}>
                We believe passive video binge-watching does not produce world-class software engineers or fluent language speakers. Our multi-tiered learning loop guarantees active participation and mentor oversight.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
              {[
                {
                  step: '01',
                  title: 'Live Interactive Masterclasses',
                  icon: '🎙️',
                  desc: 'Scheduled Zoom sessions with live code walk-throughs, grammar breakdowns, real-time screen-sharing, and open mic Q&A.',
                },
                {
                  step: '02',
                  title: 'Breakout Speaking & Code Labs',
                  icon: '👥',
                  desc: 'Small student pods for live pair programming, sprint simulations, and 1-on-1 IELTS speaking mock rooms under mentor supervision.',
                },
                {
                  step: '03',
                  title: 'Production Capstone Projects',
                  icon: '🚀',
                  desc: 'Build real-world artifacts: full-stack web applications, econometric panel research papers, Figma UI design portfolios, and multi-currency QuickBooks reconciliations.',
                },
                {
                  step: '04',
                  title: '24/7 Cloud LMS & Offline Apps',
                  icon: '📲',
                  desc: 'All live lectures are recorded in high-definition and uploaded to the student portal within 2 hours. Access offline lecture notes via our Android, iOS, and Windows native applications.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#0d1424',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '16px',
                    padding: '2rem',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1.25rem',
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: 'rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    {item.step}
                  </div>
                  <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.6rem' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Accreditation & Certificate Security */}
        {activeTab === 'accreditation' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div
              style={{
                background: 'linear-gradient(145deg, #0f172a, #0b0f19)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '24px',
                padding: '3rem 2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2.5rem',
                alignItems: 'center',
              }}
            >
              <div>
                <span
                  style={{
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: '#fef08a',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  Instant Global Credential Verification
                </span>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '0.75rem 0 1rem' }}>
                  Cryptographically Verified Digital Certificates
                </h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Every graduate from {INSTITUTION_CONFIG.name} is issued a tamper-proof digital certificate featuring a unique cryptographic verification hash and scannable QR code. Employers and university admission boards can verify credential authenticity in real-time without paper delays.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    'Instant 1-Click "Add to LinkedIn" Credential Integration',
                    'Direct PDF Download with Embedded Cryptographic Signature',
                    'Official Academic Transcript Generation with GPA & Unit Breakdown',
                    'Hardware-Guarded Digital Rights Management (DRM) on Learning Materials',
                  ].map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                      <span style={{ color: '#22c55e', fontWeight: 900 }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Mockup Visual */}
              <div
                style={{
                  background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)',
                  border: '2px solid #d4af37',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: '#d4af37', textTransform: 'uppercase' }}>
                  ÉCLAT INSTITUTE OF TECHNOLOGY & LANGUAGES
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: '0.5rem 0 0.25rem' }}>
                  Certificate of Professional Achievement
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '1rem' }}>
                  Awarded to Qualified Graduate with High Distinction
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem', margin: '0 auto 1rem', maxWidth: '280px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>VERIFICATION ID:</div>
                  <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 800, letterSpacing: '0.05em' }}>
                    ECLAT-2026-CERT-948271
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>
                  ● Authenticity Verified on Official Ledger
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Academic Leadership */}
        {activeTab === 'leadership' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.75rem' }}>
                Academic Leadership & Faculty Leads
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.98rem', lineHeight: 1.6 }}>
                Our leadership comprises recognized computer scientists, Cambridge-certified linguists, econometricians, and software architects with decades of collective experience in global industry and academia.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.75rem' }}>
              {leadership.map((lead, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#0d1424',
                    border: '1px solid #1e293b',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{lead.avatar}</div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
                      {lead.name}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700, marginBottom: '0.5rem' }}>
                      {lead.role}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem', fontStyle: 'italic' }}>
                      {lead.qual}
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderLeft: '3px solid #d4af37',
                      padding: '0.75rem',
                      fontSize: '0.8rem',
                      color: '#cbd5e1',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                    }}
                  >
                    "{lead.quote}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5 Specialized Academic Faculties Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #0a0f1e 0%, #070a13 100%)',
          padding: '5rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                padding: '4px 14px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              Academic Scope
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0.75rem 0 0.5rem' }}>
              Our 5 Academic Faculties
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '720px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.6 }}>
              Comprehensive curricula engineered to take learners from foundational principles to advanced industrial proficiency.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            {faculties.map((fac) => (
              <div
                key={fac.id}
                style={{
                  background: '#0d1424',
                  border: `1px solid ${fac.color}33`,
                  borderRadius: '20px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{fac.icon}</span>
                    <span
                      style={{
                        background: `${fac.color}22`,
                        color: fac.color,
                        border: `1px solid ${fac.color}55`,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      {fac.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.75rem', lineHeight: 1.3 }}>
                    {fac.name}
                  </h3>

                  <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {fac.description}
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Key Course Units:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      {fac.units.map((u, idx) => (
                        <li key={idx} style={{ marginBottom: '3px' }}>
                          {u}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                    Target Career Pathways:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700, marginTop: '2px' }}>
                    {fac.careerOutcomes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions & Registration Support Desk */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div
          style={{
            background: 'linear-gradient(145deg, #1e3a8a, #0f172a)',
            borderRadius: '24px',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎓</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem' }}>
            Ready to Begin Your Studies with {INSTITUTION_CONFIG.name}?
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto 2rem' }}>
            Join thousands of graduates across 40+ countries who have unlocked remote careers, international academic scholarships, and industry certifications.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={getWhatsAppInquiryUrl('Hello Admissions, I would like to register for the next cohort.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
                padding: '0.9rem 1.8rem',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)',
              }}
            >
              <span>💬</span>
              <span>Apply via WhatsApp Admissions</span>
            </a>

            <Link
              to="/courses"
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
                padding: '0.9rem 1.8rem',
                borderRadius: '12px',
                textDecoration: 'none',
              }}
            >
              📚 Browse Course Catalog
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
              marginTop: '2.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.85rem',
              color: '#94a3b8',
            }}
          >
            <div>
              <strong>Email:</strong> {INSTITUTION_CONFIG.contact.email}
            </div>
            <div>
              <strong>Hotline / WhatsApp:</strong> {INSTITUTION_CONFIG.contact.phoneFormatted}
            </div>
            <div>
              <strong>Official Website:</strong> {INSTITUTION_CONFIG.websiteUrl}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#05070d',
          padding: '3rem 1.5rem',
          color: '#64748b',
          fontSize: '0.85rem',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Éclat" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #d4af37' }} />
            <div>
              <div style={{ color: '#ffffff', fontWeight: 800 }}>{INSTITUTION_CONFIG.name}</div>
              <div style={{ fontSize: '0.72rem' }}>100% Online Global Academy</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Home
            </Link>
            <Link to="/courses" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Courses
            </Link>
            <Link to="/library" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              E-Library
            </Link>
            <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
          </div>

          <div>
            © 2026 {INSTITUTION_CONFIG.name}. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
