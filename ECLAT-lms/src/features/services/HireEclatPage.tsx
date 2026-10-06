import { useState, useId } from 'react'
import { Link } from 'react-router-dom'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'
import {
  CodeIcon,
  LaptopIcon,
  DatabaseIcon,
  ShieldCheckIcon,
  PaletteIcon,
  GraduationCapIcon,
  RocketIcon,
  CheckCircleIcon,
  PhoneIcon,
  MailIcon,
  MessageCircleIcon,
  GlobeIcon,
  BuildingIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  UsersIcon,
  ServerIcon,
  LockIcon,
  FileTextIcon,
  CalendarIcon,
  AwardIcon,
} from '@/components/icons/AppIcons'

interface TechService {
  id: string
  title: string
  category: string
  tagline: string
  badge: string
  icon: any
  color: string
  deliverables: string[]
  technologies: string[]
  bestFor: string
  timeline: string
}

const TECH_SERVICES: TechService[] = [
  {
    id: 'fullstack-web',
    title: 'Custom Web & Enterprise Full-Stack Engineering',
    category: 'Software Engineering',
    tagline: 'High-performance, scalable web portals, SaaS platforms, and enterprise dashboards built with modern frameworks.',
    badge: 'Flagship Service',
    icon: CodeIcon,
    color: '#2563eb',
    deliverables: [
      'Responsive React 19 / Next.js single-page applications & PWAs',
      'High-throughput RESTful & GraphQL backend APIs with Node.js & Python',
      'Relational PostgreSQL / Supabase architecture with Row Level Security',
      'Automated CI/CD pipelines, Docker containerization & zero-downtime deployment',
      'End-to-end unit, integration, and security test coverage',
    ],
    technologies: ['React 19', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Docker'],
    bestFor: 'Startups, SMEs, and corporate enterprises needing robust digital products.',
    timeline: '2 – 8 Weeks depending on scope',
  },
  {
    id: 'mobile-apps',
    title: 'Cross-Platform Mobile Application Development',
    category: 'Mobile Engineering',
    tagline: 'Native-feel iOS and Android mobile apps published to Google Play Store and Apple App Store.',
    badge: 'iOS & Android',
    icon: LaptopIcon,
    color: '#0891b2',
    deliverables: [
      'Capacitor & React Native mobile architectures with offline synchronization',
      'Push notifications, background jobs, and hardware biometric authentication',
      'Seamless in-app payments (M-Pesa Daraja, Stripe, PayPal, Visa/Mastercard)',
      'Store compliance, signing keys (.jks), and automated store releases',
      'Fluid 60fps animations and thumb-friendly touch interactions',
    ],
    technologies: ['Capacitor', 'Android SDK', 'iOS Swift / Xcode', 'React Native', 'SQLite', 'Firebase Cloud Messaging'],
    bestFor: 'Businesses launching customer-facing apps, booking tools, or fintech portals.',
    timeline: '3 – 6 Weeks',
  },
  {
    id: 'data-analytics',
    title: 'Data Science, Econometrics & BI Dashboards',
    category: 'Data & Analytics',
    tagline: 'Turn raw datasets into strategic growth intelligence with advanced statistical modeling and interactive dashboards.',
    badge: 'Research Grade',
    icon: DatabaseIcon,
    color: '#059669',
    deliverables: [
      'Automated ETL data ingestion pipelines and database cleansing',
      'Predictive analytics, forecasting, and classification machine learning models',
      'Interactive business intelligence dashboards (Power BI, Metabase, Streamlit)',
      'Academic & clinical research biostatistics (SPSS, R, Stata econometric regressions)',
      'Executive KPI reporting with automated scheduled PDF digests',
    ],
    technologies: ['Python', 'Pandas & NumPy', 'R & RStudio', 'IBM SPSS', 'Stata', 'Power BI', 'Scikit-Learn', 'PostgreSQL'],
    bestFor: 'Research firms, healthcare organizations, financial analysts, and corporate leadership.',
    timeline: '1 – 4 Weeks',
  },
  {
    id: 'cloud-devops',
    title: 'Cloud Infrastructure, DevOps & Database Engineering',
    category: 'Infrastructure',
    tagline: 'Resilient cloud infrastructure with military-grade redundancy, auto-scaling, and proactive server monitoring.',
    badge: 'High Reliability',
    icon: ServerIcon,
    color: '#7c3aed',
    deliverables: [
      'Cloud setup on AWS, DigitalOcean, Google Cloud & Vercel Enterprise',
      'PostgreSQL database optimization, query index tuning & replication',
      'Infrastructure as Code (IaC), GitOps workflows & GitHub Actions CI/CD',
      'Disaster recovery, automated daily encrypted backups & health monitors',
      'Domain DNS routing, SSL certificates, Cloudflare CDN & DDoS shields',
    ],
    technologies: ['AWS', 'Supabase Cloud', 'Docker', 'Linux / Ubuntu', 'Nginx', 'GitHub Actions', 'Cloudflare', 'PostgreSQL'],
    bestFor: 'Growing platforms experiencing traffic spikes or requiring enterprise uptime SLAs.',
    timeline: '1 – 3 Weeks',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Audits & Vulnerability Assessments',
    category: 'Cyber Defense',
    tagline: 'Identify and patch security holes before malicious actors exploit them. Comprehensive defensive auditing.',
    badge: 'Security Certified',
    icon: ShieldCheckIcon,
    color: '#dc2626',
    deliverables: [
      'Web application penetration testing (OWASP Top 10 vulnerabilities)',
      'API authentication auditing, rate limiting & token leak prevention',
      'Database access control, Row Level Security (RLS) enforcement & encryption',
      'Infrastructure vulnerability scan with actionable executive remediation report',
      'Employee cybersecurity hygiene training & phishing simulation',
    ],
    technologies: ['OWASP ZAP', 'Burp Suite', 'Nmap', 'SSL/TLS Cipher Audit', 'JWT & OAuth2', 'Bcrypt / Argon2'],
    bestFor: 'Fintechs, education institutes, legal practices, and eCommerce portals.',
    timeline: '1 – 2 Weeks',
  },
  {
    id: 'uiux-design',
    title: 'UI/UX Product Design & Design Systems',
    category: 'Product Design',
    tagline: 'World-class user interfaces designed to maximize conversion rates, user retention, and accessibility.',
    badge: 'Figma Mastery',
    icon: PaletteIcon,
    color: '#ea580c',
    deliverables: [
      'End-to-end user research, persona creation & customer journey maps',
      'High-fidelity interactive prototypes in Figma with component tokens',
      'Design systems with reusable components, color styles, and micro-interactions',
      'Full mobile & desktop responsive layout specifications',
      'Developer handoff with design tokens, CSS variables, and asset bundles',
    ],
    technologies: ['Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Wireframing', 'WCAG Accessibility Standards'],
    bestFor: 'New product launches, app redesigns, and high-converting marketing funnels.',
    timeline: '2 – 4 Weeks',
  },
  {
    id: 'lms-edtech',
    title: 'Custom LMS, School Portals & EdTech Systems',
    category: 'EdTech Solutions',
    tagline: 'Turnkey online learning environments with secure DRM video players, student gradebooks, and automated fee processing.',
    badge: 'EdTech Specialization',
    icon: GraduationCapIcon,
    color: '#4f46e5',
    deliverables: [
      'Complete Virtual Campus with student, teacher, parent, and admin portals',
      'Hardware-level video DRM, Google Drive preview embeds & screen protection',
      'Automatic fee invoice generation, receipt printing & exam clearance passes',
      'Cambridge IGCSE & national curriculum broadsheets and report card engines',
      'Live Google Meet / Zoom class integration with interactive timetable alerts',
    ],
    technologies: ['React 19', 'Electron Desktop', 'Capacitor Mobile', 'Supabase RLS', 'M-Pesa Daraja', 'PDF Generation'],
    bestFor: 'Colleges, private schools, academies, corporate training departments, and tutors.',
    timeline: '3 – 8 Weeks',
  },
  {
    id: 'corporate-training',
    title: 'Corporate Tech Upskilling & Executive Masterclasses',
    category: 'Corporate Training',
    tagline: 'Transform your organization’s workforce into digital powerhouses with customized instructor-led training.',
    badge: 'Enterprise Workforce',
    icon: RocketIcon,
    color: '#0d9488',
    deliverables: [
      'Tailored corporate syllabi crafted to match your company’s internal toolchain',
      'Live interactive hands-on labs with real company case studies',
      'Executive training in Advanced Excel VBA, Python Automation, AI Tools & Cyber',
      'Post-training skill assessments, certification exams, and progress analytics',
      'Continuous 60-day post-training instructor mentoring and Q&A desk',
    ],
    technologies: ['Advanced Excel & Power Query', 'Python Automation', 'Power BI', 'QuickBooks Online', 'AI Prompt Engineering'],
    bestFor: 'Corporate teams, banks, NGOs, government departments, and consulting firms.',
    timeline: 'Flexible 1-week bootcamps to 3-month corporate programs',
  },
]

export function HireEclatPage() {
  const [selectedService, setSelectedService] = useState<string>('fullstack-web')
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    serviceCategory: 'fullstack-web',
    budget: '$1,000 - $3,000',
    timeline: 'Within 1 Month',
    description: '',
  })

  const formId = useId()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const existing = JSON.parse(localStorage.getItem('eclat_hire_inquiries') || '[]')
      existing.unshift({
        ...formData,
        submittedAt: new Date().toISOString(),
      })
      localStorage.setItem('eclat_hire_inquiries', JSON.stringify(existing))
    } catch {}
    setFormSubmitted(true)
  }

  const getWhatsAppServiceInquiry = () => {
    const serviceName = TECH_SERVICES.find((s) => s.id === formData.serviceCategory)?.title || 'Tech Services'
    const msg = encodeURIComponent(
      `Hello Éclat Institute Enterprise Team! I would like to hire your team for: ${serviceName}.\n\n` +
      `My Name: ${formData.name || 'Client'}\n` +
      `Company: ${formData.company || 'Private Project'}\n` +
      `Budget Range: ${formData.budget}\n` +
      `Target Timeline: ${formData.timeline}\n` +
      `Brief Requirements: ${formData.description || 'Discuss details.'}`
    )
    return `https://wa.me/${INSTITUTION_CONFIG.contact.phone.replace(/[^0-9]/g, '')}?text=${msg}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header Navigation */}
      <header style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(10, 15, 29, 0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#ffffff' }}>
            <img src="/logo.png" alt="Éclat Institute Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #3b82f6' }} />
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.04em', color: '#ffffff', display: 'block' }}>ÉCLAT INSTITUTE</span>
              <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.08em' }}>ENTERPRISE TECH & CONSULTING</span>
            </div>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Home</Link>
            <Link to="/courses" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Courses</Link>
            <Link to="/careers" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Careers</Link>
            <Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>About</Link>
            <a
              href="#quote-form"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              Request a Quote
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '4.5rem 1.5rem 3.5rem', background: 'radial-gradient(ellipse at top, rgba(37, 99, 235, 0.18), transparent 70%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.82rem', color: '#93c5fd', fontWeight: 700, marginBottom: '1.5rem' }}>
            <RocketIcon size={15} color="#60a5fa" />
            <span>ÉCLAT INSTITUTE PROFESSIONAL SERVICES & SOFTWARE STUDIO</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 40%, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hire Éclat Institute to Build, Scale & Secure Your Tech
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '780px', margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
            Partner with the senior software engineers, data scientists, and cybersecurity specialists who power East Africa’s premier virtual academy. From full-stack web platforms and cross-platform mobile apps to biostatistical research and enterprise security.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#quote-form"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '0.85rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
              }}
            >
              <span>Start Your Project</span>
              <ArrowRightIcon size={16} />
            </a>
            <a
              href={`https://wa.me/${INSTITUTION_CONFIG.contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello! I would like to hire Éclat Institute for engineering/tech services.')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(22, 163, 74, 0.15)',
                border: '1px solid #16a34a',
                color: '#4ade80',
                padding: '0.85rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <MessageCircleIcon size={18} color="#4ade80" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginTop: '3.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#38bdf8' }}>99.9%</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Uptime & Production SLAs</div>
            </div>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#4ade80' }}>50+</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Delivered Tech Projects</div>
            </div>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#f59e0b' }}>100%</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Transparent Code & Ownership</div>
            </div>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#a855f7' }}>24/7</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Post-Launch Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Directory */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
            Comprehensive Enterprise Tech Services
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
            Modular, reliable, and production-tested solutions engineered to elevate your business operations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {TECH_SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <div
                key={service.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${service.color}20`, border: `1px solid ${service.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={24} color={service.color} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.3rem 0.75rem', borderRadius: '999px', background: `${service.color}15`, color: service.color, border: `1px solid ${service.color}35` }}>
                      {service.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.65rem' }}>
                    {service.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {service.tagline}
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      Key Deliverables
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {service.deliverables.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                          <CheckCircleIcon size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      Tech Stack
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {service.technologies.map((tech, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.2rem 0.55rem', borderRadius: '6px', color: '#e2e8f0' }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.82rem' }}>
                    <span style={{ color: '#64748b' }}>Typical Turnaround:</span>
                    <strong style={{ color: '#38bdf8' }}>{service.timeline}</strong>
                  </div>

                  <a
                    href="#quote-form"
                    onClick={() => {
                      setSelectedService(service.id)
                      setFormData((prev) => ({ ...prev, serviceCategory: service.id }))
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(37, 99, 235, 0.15)',
                      border: '1px solid #3b82f6',
                      color: '#60a5fa',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Request Proposal for this Service</span>
                    <ArrowRightIcon size={14} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Why Choose Éclat Institute Engineering Section */}
      <section style={{ background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 900, marginBottom: '0.5rem' }}>
              Why Organizations Choose Éclat Institute
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              We combine pedagogical rigor with real-world enterprise engineering standards.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <UsersIcon size={20} color="#3b82f6" />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>Senior Tech Practitioners</h4>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Your project is delivered by seasoned engineers and university professors with years of battle-tested industry experience.
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <LockIcon size={20} color="#10b981" />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>Strict IP & 100% Code Ownership</h4>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                You retain full source code rights, intellectual property, and database ownership with non-disclosure agreements (NDAs) upfront.
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircleIcon size={20} color="#f59e0b" />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>Milestone-Based Escrow</h4>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Pay as deliverables are demonstrated and tested. Zero surprises, weekly demo check-ins, and clear progress burn-downs.
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <AwardIcon size={20} color="#a855f7" />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>Free 60-Day Post-Launch SLA</h4>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Every project includes complimentary bug-fixing, security monitoring, and minor tweaks for two months following deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive RFP / Project Quote Form */}
      <section id="quote-form" style={{ maxWidth: '860px', margin: '0 auto', padding: '4.5rem 1.5rem' }}>
        <div style={{ background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px', padding: '2.5rem 2rem', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Direct Quote & RFP Submission
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.35rem', marginBottom: '0.5rem', color: '#ffffff' }}>
              Tell Us About Your Project
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Our senior engineering leads review all inquiries within 24 business hours.
            </p>
          </div>

          {formSubmitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '14px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckIcon size={28} color="#ffffff" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
                Inquiry Received Successfully!
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                Thank you, <strong>{formData.name}</strong>. An Éclat Institute project lead will review your specifications and email you a proposal at <strong>{formData.email}</strong>.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={getWhatsAppServiceInquiry()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <MessageCircleIcon size={16} />
                  <span>Send Immediate WhatsApp Copy</span>
                </a>
                <button
                  type="button"
                  onClick={() => setFormSubmitted(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label htmlFor={`${formId}-name`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Your Full Name *
                </label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label htmlFor={`${formId}-company`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Company / Organization
                </label>
                <input
                  id={`${formId}-company`}
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. Apex Health Analytics Ltd"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
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
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@organization.com"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
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
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+254 7XX XXX XXX"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label htmlFor={`${formId}-service`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Service Category *
                </label>
                <select
                  id={`${formId}-service`}
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                >
                  {TECH_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`${formId}-budget`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Estimated Budget
                </label>
                <select
                  id={`${formId}-budget`}
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                >
                  <option value="Under $1,000">Under $1,000 (Small sprint / audit)</option>
                  <option value="$1,000 - $3,000">$1,000 – $3,000 (Standard MVP / Module)</option>
                  <option value="$3,000 - $8,000">$3,000 – $8,000 (Complete Platform / App)</option>
                  <option value="$8,000+">$8,000+ (Enterprise Architecture)</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor={`${formId}-timeline`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Target Completion Timeline
                </label>
                <select
                  id={`${formId}-timeline`}
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                >
                  <option value="Urgent (1 - 2 Weeks)">Urgent (1 - 2 Weeks)</option>
                  <option value="Within 1 Month">Within 1 Month</option>
                  <option value="1 - 3 Months">1 - 3 Months</option>
                  <option value="Flexible / Consulting">Flexible / Consulting</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor={`${formId}-description`} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Project Overview & Scope Requirements *
                </label>
                <textarea
                  id={`${formId}-description`}
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what you want built, your primary objectives, target users, and any existing tools or repositories..."
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.95rem 1.5rem',
                    borderRadius: '10px',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  Submit Project Request & Get Free Consultation
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#070a14', padding: '3rem 1.5rem 2rem', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Éclat Institute" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem' }}>Éclat Institute Tech Services</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
            <Link to="/courses" style={{ color: '#94a3b8', textDecoration: 'none' }}>Courses</Link>
            <Link to="/careers" style={{ color: '#94a3b8', textDecoration: 'none' }}>Careers & Teaching</Link>
            <Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</Link>
            <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
          </div>
          <div>
            © {new Date().getFullYear()} Éclat Institute. All Rights Reserved. Delivered across East Africa & Worldwide.
          </div>
        </div>
      </footer>
    </div>
  )
}
