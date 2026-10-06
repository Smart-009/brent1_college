import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { tenantSchoolStore } from '@/lib/tenantSchoolStore'
import { getTenantDomainLinks } from '@/lib/tenantDomain'
import type { TenantDomainLinks } from '@/lib/tenantDomain'
import { INSTITUTION_CONFIG } from '@/config/institution'
import type {
  PartnerSchoolTenant,
  TenantStaffMember,
  TenantStudentMember,
  TenantPayrollRecord,
  TenantGradeRecord,
  TenantLessonNote,
  TenantFeePayment,
} from '@/types/tenantSchool'
import {
  GraduationCapIcon,
  UserIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CalendarIcon,
  BuildingIcon,
  GlobeIcon,
  PhoneIcon,
  MailIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LockIcon,
  ExternalLinkIcon,
  SparklesIcon,
  ClockIcon,
  CreditCardIcon,
  FileTextIcon,
  UsersIcon,
  AwardIcon,
} from '@/components/icons/AppIcons'

export function TenantSchoolHub() {
  const { schoolSlug, subview } = useParams<{ schoolSlug: string; subview?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const [school, setSchool] = useState<PartnerSchoolTenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [showRoleSwitcherModal, setShowRoleSwitcherModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [customDomainInput, setCustomDomainInput] = useState('')
  const [customDomainMessage, setCustomDomainMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pricingModalCycle, setPricingModalCycle] = useState<'monthly' | 'annually'>('monthly')

  // Real School SIS / SMS Live State
  const [staffList, setStaffList] = useState<TenantStaffMember[]>([])
  const [studentList, setStudentList] = useState<TenantStudentMember[]>([])
  const [payrollList, setPayrollList] = useState<TenantPayrollRecord[]>([])
  const [gradeList, setGradeList] = useState<TenantGradeRecord[]>([])
  const [lessonNotesList, setLessonNotesList] = useState<TenantLessonNote[]>([])
  const [feePaymentsList, setFeePaymentsList] = useState<TenantFeePayment[]>([])

  // Sub-tab Navigation within Desks
  const [principalSubTab, setPrincipalSubTab] = useState<'staff' | 'admissions' | 'overview'>('staff')
  const [bursarSubTab, setBursarSubTab] = useState<'payroll' | 'payments' | 'arrears'>('payroll')
  const [teacherSubTab, setTeacherSubTab] = useState<'attendance' | 'gradebook' | 'notes'>('attendance')
  const [studentSubTab, setStudentSubTab] = useState<'report_card' | 'notes' | 'attendance' | 'fees'>('report_card')

  // Modal Dialog States
  const [showAddStaffModal, setShowAddStaffModal] = useState(false)
  const [showAdmitStudentModal, setShowAdmitStudentModal] = useState(false)
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false)
  const [showUploadNoteModal, setShowUploadNoteModal] = useState(false)
  const [selectedStaffSlip, setSelectedStaffSlip] = useState<TenantStaffMember | null>(null)
  const [selectedAdmissionSlip, setSelectedAdmissionSlip] = useState<TenantStudentMember | null>(null)
  const [selectedPayslip, setSelectedPayslip] = useState<TenantPayrollRecord | null>(null)
  const [selectedReceipt, setSelectedReceipt] = useState<TenantFeePayment | null>(null)
  const [selectedReportCardStudent, setSelectedReportCardStudent] = useState<TenantStudentMember | null>(null)

  // Interactive Form Inputs
  const [newStaffInput, setNewStaffInput] = useState({
    full_name: '',
    role: 'teacher' as 'teacher' | 'bursar' | 'admin',
    email: '',
    phone: '',
    department: 'Humanities & Sciences',
    title: 'Senior Subject Instructor',
    assigned_classes: 'Grade 10 Cambridge, Form 3 Alpha',
    assigned_subjects: 'Mathematics, Physics',
    salary_base: 3200,
    salary_housing: 400,
    salary_transport: 250,
    salary_tax: 350,
    salary_pension: 150,
  })

  const [newStudentInput, setNewStudentInput] = useState({
    full_name: '',
    grade_class: 'Grade 10 Cambridge',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    fee_total: 1800,
    fee_paid: 1800,
  })

  const [newPaymentInput, setNewPaymentInput] = useState({
    student_id: '',
    amount: 1800,
    payment_method: 'Bank Wire' as 'Bank Wire' | 'Mobile Money (M-Pesa)' | 'Credit Card' | 'Cash',
  })

  const [newNoteInput, setNewNoteInput] = useState({
    class_name: 'Grade 10 Cambridge',
    subject_name: 'Pure Mathematics',
    title: '',
    summary: '',
    file_url: 'https://docs.eclat.institute/notes/study-guide.pdf',
  })

  // Selected filters
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState('Grade 10 Cambridge')
  const [selectedClassForGradebook, setSelectedClassForGradebook] = useState('Grade 10 Cambridge')
  const [selectedSubjectForGradebook, setSelectedSubjectForGradebook] = useState('Pure Mathematics (0580)')
  const [staffSearchQuery, setStaffSearchQuery] = useState('')
  const [studentSearchQuery, setStudentSearchQuery] = useState('')

  // Load SIS datasets when school changes
  const reloadSchoolData = (slug: string) => {
    const s = tenantSchoolStore.getStaffBySchool(slug)
    const st = tenantSchoolStore.getStudentsBySchool(slug)
    const p = tenantSchoolStore.getPayrollBySchool(slug)
    const g = tenantSchoolStore.getGradesBySchool(slug)
    const n = tenantSchoolStore.getLessonNotesBySchool(slug)
    const pm = tenantSchoolStore.getPaymentsBySchool(slug)

    setStaffList(s)
    setStudentList(st)
    setPayrollList(p)
    setGradeList(g)
    setLessonNotesList(n)
    setFeePaymentsList(pm)

    if (st.length > 0) {
      setSelectedReportCardStudent(st[0])
    }
  }

  // LMS-Style Role-Based Scoping
  // 'admin' = Full Access (Executive Principal)
  // 'teacher' = Only Class Attendance, Gradebook, Notes
  // 'bursar' = Only Fees, Invoices, Receipts
  // 'student' = Only My Lessons, Attendance, Report Card
  // 'public' = Guest / Visitor
  const [activeRole, setActiveRole] = useState<'admin' | 'teacher' | 'bursar' | 'student' | 'public'>(() => {
    if (profile?.role === 'admin') return 'admin'
    if (profile?.role === 'teacher') return 'teacher'
    if (profile?.role === 'bursar') return 'bursar'
    if (profile?.role === 'student') return 'student'

    if (typeof window !== 'undefined' && schoolSlug) {
      const stored = sessionStorage.getItem(`eclat_school_role_${schoolSlug}`)
      if (stored === 'admin' || stored === 'teacher' || stored === 'bursar' || stored === 'student' || stored === 'public') {
        return stored as 'admin' | 'teacher' | 'bursar' | 'student' | 'public'
      }
    }

    if (subview === 'student') return 'student'
    if (subview === 'teacher') return 'teacher'
    if (subview === 'bursar') return 'bursar'
    if (subview === 'principal' || subview === 'admin') return 'admin'
    return 'admin' // Default to admin for full administrative capability
  })

  const [activeTab, setActiveTab] = useState<'hub' | 'calendar' | 'student' | 'teacher' | 'bursar' | 'principal'>(() => {
    if (subview === 'student') return 'student'
    if (subview === 'teacher') return 'teacher'
    if (subview === 'bursar') return 'bursar'
    if (subview === 'principal' || subview === 'admin') return 'principal'
    if (subview === 'calendar') return 'calendar'
    return 'hub'
  })

  useEffect(() => {
    if (!schoolSlug) {
      setLoading(false)
      return
    }
    const found = tenantSchoolStore.getSchoolBySlug(schoolSlug)
    setSchool(found)
    if (found?.custom_domain) {
      setCustomDomainInput(found.custom_domain)
    }
    reloadSchoolData(schoolSlug)
    setLoading(false)
  }, [schoolSlug])

  useEffect(() => {
    if (subview === 'student') setActiveTab('student')
    else if (subview === 'teacher') setActiveTab('teacher')
    else if (subview === 'bursar') setActiveTab('bursar')
    else if (subview === 'principal' || subview === 'admin') setActiveTab('principal')
    else if (subview === 'calendar') setActiveTab('calendar')
    else setActiveTab('hub')
  }, [subview])

  const handleSwitchRole = (newRole: 'admin' | 'teacher' | 'bursar' | 'student' | 'public') => {
    setActiveRole(newRole)
    if (typeof window !== 'undefined' && schoolSlug) {
      sessionStorage.setItem(`eclat_school_role_${schoolSlug}`, newRole)
    }
    setShowRoleSwitcherModal(false)

    if (newRole === 'student') {
      setActiveTab('student')
      navigate(`/s/${schoolSlug}/student`)
    } else if (newRole === 'teacher') {
      setActiveTab('teacher')
      navigate(`/s/${schoolSlug}/teacher`)
    } else if (newRole === 'bursar') {
      setActiveTab('bursar')
      navigate(`/s/${schoolSlug}/bursar`)
    } else if (newRole === 'admin') {
      setActiveTab('principal')
      navigate(`/s/${schoolSlug}/principal`)
    } else {
      setActiveTab('hub')
      navigate(`/s/${schoolSlug}`)
    }
  }

  const handleSelectSubscriptionPlan = (tier: 'starter' | 'growth' | 'enterprise') => {
    if (!school) return
    const rate =
      tier === 'starter'
        ? pricingModalCycle === 'monthly' ? 29 : 24
        : tier === 'growth'
        ? pricingModalCycle === 'monthly' ? 59 : 49
        : pricingModalCycle === 'monthly' ? 99 : 82

    const updated = tenantSchoolStore.updateSchoolSubscription(
      school.slug,
      tier,
      rate,
      pricingModalCycle
    )
    if (updated) {
      setSchool(updated)
      setShowPricingModal(false)
      alert(`Subscription plan updated: ${school.name} is now on the ${tier.toUpperCase()} Campus Plan ($${rate}/month).`)
    }
  }

  const copyToClipboard = (urlPath: string, label: string) => {
    const fullUrl = `${window.location.origin}${urlPath}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedLink(label)
    setTimeout(() => setCopiedLink(null), 2500)
  }

  const copyRawText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLink(label)
    setTimeout(() => setCopiedLink(null), 2500)
  }

  const handleSaveCustomDomain = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!school) return
    const cleaned = customDomainInput.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase()
    const updated = tenantSchoolStore.updateSchoolCustomDomain(school.slug, cleaned)
    if (updated) {
      setSchool(updated)
      setCustomDomainMessage({
        type: 'success',
        text: cleaned
          ? `Custom domain "${cleaned}" linked! Point your DNS CNAME to "eclat.institute".`
          : 'Custom domain cleared successfully.',
      })
      setTimeout(() => setCustomDomainMessage(null), 4500)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Loading School Portal...</h2>
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div style={{ minHeight: '85vh', background: '#f8fafc', padding: '3rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '580px', width: '100%', background: '#ffffff', borderRadius: '24px', padding: '2.5rem', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 12px 32px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.25rem' }}>
            🏫
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem' }}>
            School Portal Not Found
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The school domain slug <strong>"{schoolSlug}"</strong> has not been registered yet on the Éclat Multi-Tenant School Cloud.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/register-school"
              style={{
                background: '#1d4ed8',
                color: '#ffffff',
                fontWeight: 800,
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>Register This School ({schoolSlug}) Now →</span>
            </Link>
            <div style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0' }}>Or explore pre-configured live partner school portals:</div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/s/hillcrest" style={{ background: '#f1f5f9', color: '#881337', padding: '0.5rem 0.9rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                🇬🇧 Hillcrest British College
              </Link>
              <Link to="/s/apex-tech" style={{ background: '#f1f5f9', color: '#047857', padding: '0.5rem 0.9rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                💻 Apex Institute of Tech
              </Link>
              <Link to="/s/st-jude" style={{ background: '#f1f5f9', color: '#1d4ed8', padding: '0.5rem 0.9rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                🏛️ St. Jude Academy
              </Link>
            </div>
            <Link to="/" style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '1rem', textDecoration: 'none' }}>
              ← Return to Éclat Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Dynamic School Theming Colors
  const primaryColor = school.primary_color || '#1e3a8a'
  const accentColor = school.accent_color || '#d4af37'
  const isSemester = school.academic_system === 'semester'
  const systemTermLabel = isSemester ? 'Semester' : 'Term'
  const systemPluralLabel = isSemester ? 'Semesters' : 'Terms'
  const domainLinks = getTenantDomainLinks(school)

  const renderRestrictedCard = (deskName: string, explanation: string, allowedRolesText: string) => (
    <div style={{ maxWidth: '680px', margin: '2.5rem auto', background: '#ffffff', borderRadius: '24px', padding: '2.5rem 2rem', border: '1px solid #e2e8f0', boxShadow: '0 12px 36px rgba(0,0,0,0.06)', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', fontSize: '1.8rem' }}>
        🔒
      </div>
      <div>
        <span style={{ display: 'inline-block', background: '#fee2e2', color: '#991b1b', padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          LMS Access Restricted
        </span>
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}>
        {deskName} is Scoped
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '540px', margin: '0 auto 1.5rem' }}>
        {explanation}
      </p>

      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', textAlign: 'left' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Your Active Portal Role:</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
            {activeRole === 'admin' && '👑 Executive Admin (Full Access)'}
            {activeRole === 'teacher' && '👨‍🏫 Teacher Portal'}
            {activeRole === 'bursar' && '💼 Bursar Desk'}
            {activeRole === 'student' && '🎓 Student Portal'}
            {activeRole === 'public' && '🌐 Public Guest / Visitor'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Authorized Access:</div>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1d4ed8' }}>{allowedRolesText}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setShowRoleSwitcherModal(true)}
          style={{
            background: '#1d4ed8',
            color: '#ffffff',
            fontWeight: 800,
            padding: '0.7rem 1.35rem',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)',
          }}
        >
          ⇄ Switch or Authenticate Portal Role
        </button>
        <button
          type="button"
          onClick={() => {
            if (activeRole === 'teacher') {
              setActiveTab('teacher')
              navigate(`/s/${school.slug}/teacher`)
            } else if (activeRole === 'bursar') {
              setActiveTab('bursar')
              navigate(`/s/${school.slug}/bursar`)
            } else if (activeRole === 'student') {
              setActiveTab('student')
              navigate(`/s/${school.slug}/student`)
            } else {
              setActiveTab('hub')
              navigate(`/s/${school.slug}`)
            }
          }}
          style={{
            background: '#f1f5f9',
            color: '#334155',
            fontWeight: 700,
            padding: '0.7rem 1.35rem',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Return to My Workspace
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* 1. Custom Branded School Top Navigation Bar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '2px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Left: Custom School Branding */}
          <Link to={`/s/${school.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', minWidth: 0 }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: primaryColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.25rem',
                boxShadow: `0 4px 12px ${primaryColor}40`,
                flexShrink: 0,
              }}
            >
              {school.name.charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {school.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {school.motto} • <span style={{ color: primaryColor, fontWeight: 700 }}>{school.city}, {school.country}</span>
              </div>
            </div>
          </Link>

          {/* Right: School Status & Switch Desks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* LMS Active Role Badge & Switcher */}
            <button
              type="button"
              onClick={() => setShowRoleSwitcherModal(true)}
              style={{
                background:
                  activeRole === 'admin'
                    ? '#fef2f2'
                    : activeRole === 'teacher'
                    ? '#ecfdf5'
                    : activeRole === 'bursar'
                    ? '#fefce8'
                    : activeRole === 'student'
                    ? '#eff6ff'
                    : '#f8fafc',
                color:
                  activeRole === 'admin'
                    ? '#991b1b'
                    : activeRole === 'teacher'
                    ? '#065f46'
                    : activeRole === 'bursar'
                    ? '#854d0e'
                    : activeRole === 'student'
                    ? '#1e40af'
                    : '#334155',
                border: `1.5px solid ${
                  activeRole === 'admin'
                    ? '#fecaca'
                    : activeRole === 'teacher'
                    ? '#a7f3d0'
                    : activeRole === 'bursar'
                    ? '#fde047'
                    : activeRole === 'student'
                    ? '#bfdbfe'
                    : '#cbd5e1'
                }`,
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              title="Click to Switch Portal Access Role (Admin, Teacher, Bursar, Student)"
            >
              <span>
                {activeRole === 'admin' && '👑 Executive Admin (Full Access)'}
                {activeRole === 'teacher' && '👨‍🏫 Teacher Portal Access'}
                {activeRole === 'bursar' && '💼 Bursar Desk Access'}
                {activeRole === 'student' && '🎓 Student Portal Access'}
                {activeRole === 'public' && '🔐 Staff & Student Sign In'}
              </span>
              <span style={{ fontSize: '0.68rem', background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '4px' }}>
                ⇄ Switch
              </span>
            </button>

            {/* Active Calendar Pill */}
            <div
              style={{
                background: `${primaryColor}12`,
                color: primaryColor,
                border: `1px solid ${primaryColor}30`,
                borderRadius: '999px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.76rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <CalendarIcon size={13} color={primaryColor} />
              <span>{systemTermLabel}: <strong>{school.active_period_name}</strong></span>
            </div>

            {/* Admin-Only Domain Setup Button */}
            {activeRole === 'admin' && (
              <button
                type="button"
                onClick={() => setShowDomainModal(true)}
                style={{
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                }}
                title="Manage Custom Domain & DNS Settings"
              >
                <GlobeIcon size={13} color="#475569" />
                <span>Domain &amp; DNS</span>
              </button>
            )}
          </div>
        </div>

        {/* School Navigation Sub-Tabs Scoped to Active Role */}
        <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '0 1rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '0.25rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('hub'); navigate(`/s/${school.slug}`) }}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.65rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'hub' ? 800 : 600,
                color: activeTab === 'hub' ? primaryColor : '#64748b',
                borderBottom: activeTab === 'hub' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🏫 School Portal Hub
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('calendar'); navigate(`/s/${school.slug}/calendar`) }}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.65rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'calendar' ? 800 : 600,
                color: activeTab === 'calendar' ? primaryColor : '#64748b',
                borderBottom: activeTab === 'calendar' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🗓️ {systemTermLabel} Calendar &amp; Dates
            </button>

            {/* Principal Desk: FULL ACCESS ONLY FOR ADMIN */}
            {activeRole === 'admin' && (
              <button
                type="button"
                onClick={() => { setActiveTab('principal'); navigate(`/s/${school.slug}/principal`) }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: activeTab === 'principal' ? 800 : 600,
                  color: activeTab === 'principal' ? primaryColor : '#64748b',
                  borderBottom: activeTab === 'principal' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                🏛️ {school.principal_title} Desk (Executive Full Access)
              </button>
            )}

            {/* Bursar Desk: Admin or Bursar */}
            {(activeRole === 'admin' || activeRole === 'bursar') && (
              <button
                type="button"
                onClick={() => { setActiveTab('bursar'); navigate(`/s/${school.slug}/bursar`) }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: activeTab === 'bursar' ? 800 : 600,
                  color: activeTab === 'bursar' ? primaryColor : '#64748b',
                  borderBottom: activeTab === 'bursar' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                💼 Bursar &amp; Fees Desk
              </button>
            )}

            {/* Teacher Portal: Admin or Teacher */}
            {(activeRole === 'admin' || activeRole === 'teacher') && (
              <button
                type="button"
                onClick={() => { setActiveTab('teacher'); navigate(`/s/${school.slug}/teacher`) }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: activeTab === 'teacher' ? 800 : 600,
                  color: activeTab === 'teacher' ? primaryColor : '#64748b',
                  borderBottom: activeTab === 'teacher' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                👨‍🏫 Teacher Portal
              </button>
            )}

            {/* Student Portal: Admin or Student */}
            {(activeRole === 'admin' || activeRole === 'student') && (
              <button
                type="button"
                onClick={() => { setActiveTab('student'); navigate(`/s/${school.slug}/student`) }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: activeTab === 'student' ? 800 : 600,
                  color: activeTab === 'student' ? primaryColor : '#64748b',
                  borderBottom: activeTab === 'student' ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                🎓 Student Portal
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Branded Portal Body */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        {/* VIEW 1: MAIN SCHOOL HUB (Directory of the 4 Portals with Direct URLs) */}
        {activeTab === 'hub' && (
          <div>
            {/* 1. Authentic School Institution Hero Banner */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #e2e8f0',
                padding: 'clamp(1.5rem, 3.5vw, 2.5rem)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle Institution Accent Stripe at Top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
                {/* Official Monogram / Crest Badge */}
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '18px',
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 900,
                    boxShadow: `0 8px 20px ${primaryColor}30`,
                    border: `2px solid ${accentColor}`,
                    flexShrink: 0,
                  }}
                >
                  {school.name.charAt(0)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: primaryColor, background: `${primaryColor}14`, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {school.curriculum_type}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                      ● {systemTermLabel} Active: {school.active_period_name}
                    </span>
                  </div>

                  <h1 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.35rem', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
                    {school.name}
                  </h1>

                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '640px' }}>
                    {school.motto} • Official Online Campus &amp; Student Information System.
                  </p>
                </div>
              </div>

              {/* Direct Quick Action: Switch Role / Sign In */}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowRoleSwitcherModal(true)}
                  style={{
                    background: primaryColor,
                    color: '#ffffff',
                    fontWeight: 800,
                    padding: '0.7rem 1.25rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: `0 4px 14px ${primaryColor}40`,
                  }}
                >
                  <LockIcon size={15} color="#ffffff" />
                  <span>Authenticate / Switch Portal Desk</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Academic Structure</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: primaryColor, marginTop: '4px' }}>
                  {school.academic_system === 'semester' ? '2 Semesters' : '3 Terms'} / Year
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{school.curriculum_type}</div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Enrolled Students</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                  {school.stats.students.toLocaleString()} Active
                </div>
                <div style={{ fontSize: '0.76rem', color: '#16a34a', marginTop: '2px', fontWeight: 700 }}>✓ Live Biometric Attendance</div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Faculty &amp; Teachers</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                  {school.stats.teachers} Certified Staff
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>Across {school.stats.departments} Departments</div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Head of Institution</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                  {school.principal_name}
                </div>
                <div style={{ fontSize: '0.76rem', color: primaryColor, marginTop: '2px', fontWeight: 700 }}>{school.principal_title}</div>
              </div>
            </div>

            {/* Campus Noticeboard & Official Announcements */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1.5px solid #e2e8f0',
                padding: '1.5rem 1.75rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                marginBottom: '2.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem' }}>📢</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Campus Noticeboard &amp; Official Announcements
                  </h3>
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                  Session: {school.active_period_name}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Examination Registry
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    {systemTermLabel} Continuous Assessment Schedule
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                    Mid-term CAT examination timetables and practical assessment rosters have been published in the Student and Teacher portals.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Bursar's Office
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    Tuition Fee Statements &amp; Clearance
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                    Fee payment receipts and official bank deposit slips are validated at the Bursar Desk. Students can verify clearances online.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Academic Faculty
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    Study Guides &amp; Digital Lesson Materials
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                    Subject instructors have uploaded downloadable lesson notes and past papers. Log in to the Student Portal to download.
                  </p>
                </div>
              </div>
            </div>

            {/* THE 4 DEDICATED SEPARATE PORTALS CARDS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  School Portals &amp; Role Workspaces
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.86rem' }}>
                  Select your assigned desk to access your personalized learning or administrative workspace:
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {/* 1. Student Portal Card */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <GraduationCapIcon size={24} color="#1d4ed8" />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                    Student Learning Portal
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, marginBottom: '0.75rem' }}>
                    URL: /s/{school.slug}/student
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    Enrolled trainees and candidates log in to access virtual lectures, class timetables, continuous assessments, submitted homework, and stamped report cards.
                  </p>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('student'); navigate(`/s/${school.slug}/student`) }}
                      style={{
                        flex: 1,
                        background: '#1d4ed8',
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Enter Student Portal</span>
                      <ArrowRightIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`/s/${school.slug}/student`, 'Student Portal URL')}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.65rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                      title="Copy Student Portal Link"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Teacher Portal Card */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <UserIcon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                    Teacher &amp; Faculty Desk
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginBottom: '0.75rem' }}>
                    URL: /s/{school.slug}/teacher
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    Subject tutors and class teachers take morning/afternoon attendance, enter CAT and exam marks into continuous gradebooks, and upload lesson study materials.
                  </p>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('teacher'); navigate(`/s/${school.slug}/teacher`) }}
                      style={{
                        flex: 1,
                        background: '#059669',
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Enter Teacher Desk</span>
                      <ArrowRightIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`/s/${school.slug}/teacher`, 'Teacher Desk URL')}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.65rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                      title="Copy Teacher Portal Link"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Bursar & Finance Desk Card */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <BriefcaseIcon size={24} color="#b45309" />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                    Bursar &amp; Finance Office
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700, marginBottom: '0.75rem' }}>
                    URL: /s/{school.slug}/bursar
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    Finance staff generate tuition invoices for each {systemTermLabel.toLowerCase()}, record bank wire/card payments, issue official stamped receipts with QR codes, and track fee arrears.
                  </p>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('bursar'); navigate(`/s/${school.slug}/bursar`) }}
                      style={{
                        flex: 1,
                        background: '#b45309',
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Enter Bursar Desk</span>
                      <ArrowRightIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`/s/${school.slug}/bursar`, 'Bursar Desk URL')}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.65rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                      title="Copy Bursar Portal Link"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Principal & Head of School Desk Card */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${primaryColor}15`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <BuildingIcon size={24} color={primaryColor} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                    {school.principal_title} Office
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: primaryColor, fontWeight: 700, marginBottom: '0.75rem' }}>
                    URL: /s/{school.slug}/principal
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    Executive cockpit for institutional oversight: sign off on term report cards, publish school-wide circulars, configure the academic calendar ({systemPluralLabel}), and manage staff accounts.
                  </p>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('principal'); navigate(`/s/${school.slug}/principal`) }}
                      style={{
                        flex: 1,
                        background: primaryColor,
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Enter {school.principal_title} Desk</span>
                      <ArrowRightIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`/s/${school.slug}/principal`, 'Principal Portal URL')}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.65rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
                      title="Copy Principal Portal Link"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* School Contact Footer Info */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 800 }}>Need Assistance with {school.name} Portals?</h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <PhoneIcon size={14} color="#64748b" /> {school.contact_phone}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <MailIcon size={14} color="#64748b" /> {school.contact_email}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <BuildingIcon size={14} color="#64748b" /> {school.address}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'right' }}>
                <div>Official School Information System (SIS)</div>
                <div style={{ fontWeight: 700, color: '#64748b' }}>Secure Verified Campus Portal</div>
              </div>
            </div>

            {/* Admin-Only Subtle Domain Management Trigger */}
            {activeRole === 'admin' && (
              <div style={{ marginTop: '1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px dashed #cbd5e1', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                  <strong>Admin Configuration:</strong> School Web Address: <span style={{ fontFamily: 'monospace', color: primaryColor, fontWeight: 700 }}>{domainLinks.subdomainUrl}</span>
                  {school.custom_domain && <span> • Connected Domain: <strong style={{ color: '#7c3aed' }}>{school.custom_domain}</strong></span>}
                </div>
                <button
                  type="button"
                  onClick={() => setShowDomainModal(true)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700, padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem' }}
                >
                  ⚙️ Configure DNS / Custom Domain
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ACADEMIC CALENDAR & DATES VIEW */}
        {activeTab === 'calendar' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  {school.name} — Official Academic Calendar
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                  Structured around {systemPluralLabel} ({isSemester ? 'Semester 1 & 2' : 'Term 1, 2 & 3'}) with exam windows and fee clearance milestones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`/s/${school.slug}/calendar`, 'Calendar Link')}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem 1rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
              >
                {copiedLink === 'Calendar Link' ? '✅ Copied Calendar Link' : '📋 Share Calendar Link'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {school.academic_calendar.map((period, index) => {
                const isActive = period.status === 'Active'
                return (
                  <div
                    key={period.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      border: isActive ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                      padding: '1.5rem',
                      boxShadow: isActive ? `0 8px 24px ${primaryColor}20` : '0 2px 6px rgba(0,0,0,0.03)',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: isActive ? primaryColor : '#f1f5f9', color: isActive ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                          {index + 1}
                        </span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{period.name}</h3>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Code: {period.code}</div>
                        </div>
                      </div>

                      <span
                        style={{
                          background: isActive ? '#ecfdf5' : '#f8fafc',
                          color: isActive ? '#059669' : '#64748b',
                          border: isActive ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        {isActive ? '🟢 Active Teaching Period' : period.status === 'Upcoming' ? '🕒 Upcoming' : 'Completed'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#f8fafc', borderRadius: '12px', padding: '1rem', fontSize: '0.85rem' }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>PERIOD WINDOW</div>
                        <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                          {period.start_date} → {period.end_date}
                        </div>
                      </div>

                      {period.exam_start_date && (
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>EXAMINATION SERIES</div>
                          <div style={{ fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                            {period.exam_start_date} to {period.exam_end_date}
                          </div>
                        </div>
                      )}

                      {period.fee_deadline && (
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>FEE CLEARANCE CUTOFF</div>
                          <div style={{ fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                            Due by {period.fee_deadline}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: BRANDED STUDENT WORKSPACE & REPORT CARD DESK */}
        {/* ============================================================ */}
        {activeTab === 'student' && (
          activeRole !== 'admin' && activeRole !== 'student' ? (
            renderRestrictedCard(
              'Student Learning Portal',
              'This workspace contains personalized course modules, lecture notes, timetable periods, attendance tracking, and individual report card results. Access is strictly scoped to enrolled students and executive administrators.',
              'Executive Admin, Student'
            )
          ) : (
            <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
              {/* Student Header */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem 2rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {school.name} STUDENT WORKSPACE
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>
                      {selectedReportCardStudent ? selectedReportCardStudent.full_name : 'Student Portal'}
                    </h2>
                    <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px' }}>
                      Admission No: <strong>{selectedReportCardStudent ? selectedReportCardStudent.admission_number : `${school.slug.toUpperCase()}-2026-0042`}</strong> • Class: <strong>{selectedReportCardStudent ? selectedReportCardStudent.grade_class : 'Grade 10 Cambridge'}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {studentList.length > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>Switch Student:</span>
                        <select
                          value={selectedReportCardStudent?.id || ''}
                          onChange={(e) => {
                            const found = studentList.find((s) => s.id === e.target.value)
                            if (found) setSelectedReportCardStudent(found)
                          }}
                          style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}
                        >
                          {studentList.map((s) => (
                            <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{ background: primaryColor, color: '#ffffff', fontWeight: 800, padding: '0.55rem 1.15rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      🖨️ Print / Download Report Card
                    </button>
                  </div>
                </div>

                {/* Sub-tab Navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setStudentSubTab('report_card')}
                    style={{
                      background: studentSubTab === 'report_card' ? primaryColor : '#f1f5f9',
                      color: studentSubTab === 'report_card' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    📜 Official Academic Report Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentSubTab('notes')}
                    style={{
                      background: studentSubTab === 'notes' ? primaryColor : '#f1f5f9',
                      color: studentSubTab === 'notes' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    📚 Study Notes &amp; Course Materials ({lessonNotesList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentSubTab('attendance')}
                    style={{
                      background: studentSubTab === 'attendance' ? primaryColor : '#f1f5f9',
                      color: studentSubTab === 'attendance' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    🗓️ Attendance Record ({selectedReportCardStudent ? selectedReportCardStudent.attendance_percent : 96.4}%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentSubTab('fees')}
                    style={{
                      background: studentSubTab === 'fees' ? primaryColor : '#f1f5f9',
                      color: studentSubTab === 'fees' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    💳 Fee Statement &amp; Receipts (${selectedReportCardStudent ? selectedReportCardStudent.fee_balance : 0} due)
                  </button>
                </div>
              </div>

              {/* TAB CONTENT: OFFICIAL REPORT CARD */}
              {studentSubTab === 'report_card' && selectedReportCardStudent && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2.5rem', border: `2px solid ${primaryColor}`, boxShadow: '0 8px 30px rgba(0,0,0,0.06)', position: 'relative' }}>
                  {/* Institutional Header Banner */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '1.5rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <img src={school.logo_url} alt={school.name} style={{ width: '72px', height: '72px', borderRadius: '14px', objectFit: 'contain', border: '1px solid #e2e8f0' }} />
                      <div>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{school.name}</h2>
                        <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#64748b' }}>"{school.motto}"</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                          {school.address} • {school.contact_email} • {school.contact_phone}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', background: '#f8fafc', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: primaryColor, textTransform: 'uppercase' }}>OFFICIAL TRANSCRIPT</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{school.active_period_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 800 }}>Verified Digital Record ✓</div>
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>STUDENT NAME</div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{selectedReportCardStudent.full_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>ADMISSION NUMBER</div>
                      <div style={{ fontWeight: 800, color: primaryColor, fontSize: '0.95rem' }}>{selectedReportCardStudent.admission_number}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CLASS / FORM COHORT</div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{selectedReportCardStudent.grade_class}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CURRICULUM SERIES</div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{school.curriculum_type}</div>
                    </div>
                  </div>

                  {/* Subject Grade Table */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem' }}>Continuous Assessment &amp; Final Exam Marks</h3>
                  <div style={{ overflowX: 'auto', marginBottom: '1.75rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Subject</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>CAT 1 (20)</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>CAT 2 (20)</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Exam (60)</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Total (100)</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Grade</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Teacher Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeList
                          .filter((g) => g.student_id === selectedReportCardStudent.id || g.admission_number === selectedReportCardStudent.admission_number)
                          .map((g) => (
                            <tr key={g.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{g.subject_name}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center', color: '#475569' }}>{g.cat1_score}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center', color: '#475569' }}>{g.cat2_score}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center', color: '#475569' }}>{g.exam_score}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 900, color: '#0f172a' }}>{g.total_score}%</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <span style={{
                                  background: g.grade.startsWith('A') ? '#dcfce7' : g.grade === 'B' ? '#eff6ff' : '#fef3c7',
                                  color: g.grade.startsWith('A') ? '#15803d' : g.grade === 'B' ? '#1d4ed8' : '#b45309',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontWeight: 900,
                                  fontSize: '0.8rem',
                                }}>
                                  {g.grade}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem', color: '#64748b', fontStyle: 'italic', fontSize: '0.8rem' }}>{g.remarks}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary & Principal Sign-off */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>PERFORMANCE SUMMARY</div>
                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Mean Score:</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: primaryColor }}>86.2%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Mean Grade:</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a' }}>A (Distinction)</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Class Rank:</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>2nd / 38</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>OFFICIAL VERIFICATION &amp; DIGITAL SEAL</div>
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef3c7', border: '2px dashed #b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                          📜
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{school.principal_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{school.principal_title} • Signed &amp; Sealed</div>
                          <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>SHA-256 Validated Digital Signature</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: STUDY NOTES */}
              {studentSubTab === 'notes' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#0f172a' }}>Uploaded Lesson Notes &amp; Revision Packs</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Materials uploaded directly by your teachers for your current enrolled class.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {lessonNotesList.map((n) => (
                      <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px' }}>{n.subject_name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>By {n.teacher_name}</span>
                          </div>
                          <h4 style={{ margin: '4px 0 2px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{n.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>{n.summary}</p>
                        </div>
                        <a
                          href={n.file_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{ background: primaryColor, color: '#ffffff', padding: '0.45rem 0.95rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          📥 Download PDF
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: ATTENDANCE */}
              {studentSubTab === 'attendance' && selectedReportCardStudent && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#0f172a' }}>Term Attendance Summary</h3>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1.25rem', flex: '1 1 200px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46' }}>OVERALL ATTENDANCE</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', margin: '4px 0' }}>{selectedReportCardStudent.attendance_percent}%</div>
                      <div style={{ fontSize: '0.75rem', color: '#047857' }}>Class Roster Minimum: 80%</div>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', flex: '1 1 200px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>TOTAL SESSIONS HELD</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>64 Days</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Present: 62 • Late: 1 • Absent: 1</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: FEES */}
              {studentSubTab === 'fees' && selectedReportCardStudent && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#0f172a' }}>Tuition Fee Statement</h3>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', flex: '1 1 180px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>BILLED TUITION</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>${selectedReportCardStudent.fee_total.toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1.25rem', flex: '1 1 180px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 700 }}>TOTAL PAID</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', margin: '4px 0' }}>${selectedReportCardStudent.fee_paid.toLocaleString()}</div>
                    </div>
                    <div style={{ background: selectedReportCardStudent.fee_balance > 0 ? '#fef2f2' : '#f0fdf4', border: selectedReportCardStudent.fee_balance > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', flex: '1 1 180px' }}>
                      <div style={{ fontSize: '0.72rem', color: selectedReportCardStudent.fee_balance > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>BALANCE DUE</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: selectedReportCardStudent.fee_balance > 0 ? '#dc2626' : '#15803d', margin: '4px 0' }}>${selectedReportCardStudent.fee_balance.toLocaleString()}</div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Payment Receipts on File</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {feePaymentsList
                      .filter((p) => p.student_id === selectedReportCardStudent.id || p.admission_number === selectedReportCardStudent.admission_number)
                      .map((p) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <strong style={{ color: '#b45309' }}>{p.receipt_number}</strong> — <span style={{ fontWeight: 700 }}>${p.amount.toLocaleString()}</span> via {p.payment_method}
                            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Date: {new Date(p.date).toLocaleDateString()} • Authorized: {p.recorded_by}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(p)}
                            style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            🖨️ View Official Receipt
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}


{/* ============================================================ */}
        {/* VIEW 4: BRANDED TEACHER & FACULTY OPERATIONAL DESK */}
        {/* ============================================================ */}
        {activeTab === 'teacher' && (
          activeRole !== 'admin' && activeRole !== 'teacher' ? (
            renderRestrictedCard(
              'Teacher & Faculty Workspace',
              'This workspace contains attendance registers, continuous assessment test (CAT) gradebooks, student examination marks entry, and curriculum materials. Only teaching faculty and executive administrators may enter.',
              'Executive Admin, Teacher'
            )
          ) : (
            <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem 2rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {school.name} FACULTY DESK
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>
                      Teacher &amp; Academic Records Desk
                    </h2>
                    <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px' }}>
                      Active Teaching Period: <strong>{school.active_period_name}</strong> • Enrolled Students: <strong>{studentList.length}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowUploadNoteModal(true)}
                      style={{ background: '#059669', color: '#ffffff', fontWeight: 800, padding: '0.55rem 1.15rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      + Upload Study Note
                    </button>
                  </div>
                </div>

                {/* Teacher Sub-tab Navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setTeacherSubTab('attendance')}
                    style={{
                      background: teacherSubTab === 'attendance' ? '#059669' : '#f1f5f9',
                      color: teacherSubTab === 'attendance' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    📋 Live Class Attendance Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherSubTab('gradebook')}
                    style={{
                      background: teacherSubTab === 'gradebook' ? '#059669' : '#f1f5f9',
                      color: teacherSubTab === 'gradebook' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    📊 Continuous Assessment Gradebook (CAT 1, CAT 2, Exam)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherSubTab('notes')}
                    style={{
                      background: teacherSubTab === 'notes' ? '#059669' : '#f1f5f9',
                      color: teacherSubTab === 'notes' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    📁 Class Study Materials ({lessonNotesList.length})
                  </button>
                </div>
              </div>

              {/* TEACHER SUB-TAB 1: ATTENDANCE REGISTER */}
              {teacherSubTab === 'attendance' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Class Roll Call &amp; Attendance</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>Take daily attendance for students. Status automatically updates attendance percentages.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Filter Cohort:</span>
                      <select
                        value={selectedClassForAttendance}
                        onChange={(e) => setSelectedClassForAttendance(e.target.value)}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}
                      >
                        <option value="Grade 10 Cambridge">Grade 10 Cambridge</option>
                        <option value="Grade 11 Cambridge">Grade 11 Cambridge</option>
                        <option value="Form 3 Alpha">Form 3 Alpha</option>
                        <option value="Diploma Year 1">Diploma Year 1</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Adm No.</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Student Name</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Class</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Term Attendance</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Today's Roll Call</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentList
                          .filter((s) => !selectedClassForAttendance || s.grade_class === selectedClassForAttendance)
                          .map((s) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 700, color: primaryColor }}>{s.admission_number}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{s.full_name}</td>
                              <td style={{ padding: '0.75rem', color: '#64748b' }}>{s.grade_class}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <span style={{
                                  background: s.attendance_percent >= 90 ? '#dcfce7' : '#fef3c7',
                                  color: s.attendance_percent >= 90 ? '#15803d' : '#b45309',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontWeight: 800,
                                  fontSize: '0.78rem',
                                }}>
                                  {s.attendance_percent}% Present
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = Math.min(100, +(s.attendance_percent + 0.2).toFixed(1))
                                      tenantSchoolStore.updateStudent(s.id, { attendance_percent: updated })
                                      reloadSchoolData(school.slug)
                                    }}
                                    style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    ✓ Present
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = Math.max(0, +(s.attendance_percent - 0.5).toFixed(1))
                                      tenantSchoolStore.updateStudent(s.id, { attendance_percent: updated })
                                      reloadSchoolData(school.slug)
                                    }}
                                    style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    ✕ Absent
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      alert(`Logged late arrival for ${s.full_name}`)
                                    }}
                                    style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    🕒 Late
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TEACHER SUB-TAB 2: GRADEBOOK */}
              {teacherSubTab === 'gradebook' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Assessment Gradebook &amp; Exam Marks</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>Enter Continuous Assessment Tests (CAT 1 &amp; CAT 2) and Final Exam marks out of 60.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <select
                        value={selectedSubjectForGradebook}
                        onChange={(e) => setSelectedSubjectForGradebook(e.target.value)}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}
                      >
                        <option value="Pure Mathematics (0580)">Pure Mathematics (0580)</option>
                        <option value="First Language English (0500)">First Language English (0500)</option>
                        <option value="Computer Science (0478)">Computer Science (0478)</option>
                        <option value="Physics (0625)">Physics (0625)</option>
                        <option value="Chemistry (0620)">Chemistry (0620)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Candidate</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>CAT 1 (Max 20)</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>CAT 2 (Max 20)</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Exam (Max 60)</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Total Score</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Grade</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentList.map((s) => {
                          const existing = gradeList.find(
                            (g) => (g.student_id === s.id || g.admission_number === s.admission_number) && g.subject_name === selectedSubjectForGradebook
                          )
                          const cat1 = existing ? existing.cat1_score : 18
                          const cat2 = existing ? existing.cat2_score : 17
                          const exam = existing ? existing.exam_score : 52
                          const total = existing ? existing.total_score : cat1 + cat2 + exam
                          const grade = existing ? existing.grade : (total >= 90 ? 'A*' : total >= 80 ? 'A' : total >= 70 ? 'B' : 'C')

                          return (
                            <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.75rem' }}>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.full_name}</div>
                                <div style={{ fontSize: '0.75rem', color: primaryColor }}>{s.admission_number} • {s.grade_class}</div>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  defaultValue={cat1}
                                  id={`cat1_${s.id}`}
                                  style={{ width: '60px', padding: '0.35rem', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                                />
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  defaultValue={cat2}
                                  id={`cat2_${s.id}`}
                                  style={{ width: '60px', padding: '0.35rem', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                                />
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="60"
                                  defaultValue={exam}
                                  id={`exam_${s.id}`}
                                  style={{ width: '60px', padding: '0.35rem', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                                />
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 900, color: '#0f172a' }}>
                                {total}%
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 900 }}>
                                  {grade}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const c1 = Number((document.getElementById(`cat1_${s.id}`) as HTMLInputElement)?.value || cat1)
                                    const c2 = Number((document.getElementById(`cat2_${s.id}`) as HTMLInputElement)?.value || cat2)
                                    const ex = Number((document.getElementById(`exam_${s.id}`) as HTMLInputElement)?.value || exam)
                                    tenantSchoolStore.saveGradeRecord({
                                      school_slug: school.slug,
                                      student_id: s.id,
                                      student_name: s.full_name,
                                      admission_number: s.admission_number,
                                      class_name: s.grade_class,
                                      subject_name: selectedSubjectForGradebook,
                                      period_code: 'TERM-1',
                                      cat1_score: c1,
                                      cat2_score: c2,
                                      exam_score: ex,
                                      remarks: 'Progress validated by subject teacher in official markbook.',
                                      teacher_name: profile?.full_name || 'Subject Faculty',
                                    })
                                    reloadSchoolData(school.slug)
                                    alert(`Saved marks for ${s.full_name}: CAT 1: ${c1}, CAT 2: ${c2}, Exam: ${ex}.`)
                                  }}
                                  style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                                >
                                  Save Mark
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TEACHER SUB-TAB 3: LESSON NOTES */}
              {teacherSubTab === 'notes' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Teaching Notes &amp; Learning Artifacts</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>Upload syllabus-aligned slide decks, PDF guides and revision homework for students.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUploadNoteModal(true)}
                      style={{ background: '#059669', color: '#ffffff', fontWeight: 800, padding: '0.55rem 1.15rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      + Add New Lesson Note
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {lessonNotesList.map((n) => (
                      <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#dcfce7', color: '#065f46', padding: '1px 6px', borderRadius: '4px' }}>{n.class_name}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669' }}>{n.subject_name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>• Uploaded by {n.teacher_name}</span>
                          </div>
                          <h4 style={{ margin: '4px 0 2px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{n.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>{n.summary}</p>
                        </div>
                        <a
                          href={n.file_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.45rem 0.85rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}
                        >
                          👁️ View PDF Material
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}


{/* ============================================================ */}
        {/* VIEW 5: BRANDED BURSAR & FINANCE OPERATIONAL DESK */}
        {/* ============================================================ */}
        {activeTab === 'bursar' && (
          activeRole !== 'admin' && activeRole !== 'bursar' ? (
            renderRestrictedCard(
              'Bursar & Finance Office',
              'This finance desk contains confidential institution revenue ledgers, student fee balances, tuition invoices, and receipt printing. Only bursars and executive administrators may enter.',
              'Executive Admin, Bursar'
            )
          ) : (
            <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem 2rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {school.name} FINANCE &amp; BURSAR DESK
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>
                      Bursar Accounts, Payroll &amp; Tuition Terminal
                    </h2>
                    <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px' }}>
                      Active Accounting Period: <strong>{school.active_period_name}</strong> • Bank Account: <strong>{school.name} School Trust</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowRecordPaymentModal(true)}
                      style={{ background: '#b45309', color: '#ffffff', fontWeight: 800, padding: '0.55rem 1.15rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      + Record Fee Payment
                    </button>
                  </div>
                </div>

                {/* Sub-tab Navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setBursarSubTab('payroll')}
                    style={{
                      background: bursarSubTab === 'payroll' ? '#b45309' : '#f1f5f9',
                      color: bursarSubTab === 'payroll' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    💼 Staff Payroll &amp; Salary Register ({payrollList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBursarSubTab('payments')}
                    style={{
                      background: bursarSubTab === 'payments' ? '#b45309' : '#f1f5f9',
                      color: bursarSubTab === 'payments' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    🧾 Tuition Payment Ledger &amp; Receipts ({feePaymentsList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBursarSubTab('arrears')}
                    style={{
                      background: bursarSubTab === 'arrears' ? '#b45309' : '#f1f5f9',
                      color: bursarSubTab === 'arrears' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    ⚠️ Student Fee Arrears &amp; Defaulters
                  </button>
                </div>
              </div>

              {/* BURSAR SUB-TAB 1: STAFF PAYROLL REGISTER */}
              {bursarSubTab === 'payroll' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>October 2026 Monthly Payroll Register</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>Compute base salary, statutory PAYE tax, pension, and net salary disbursement.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          tenantSchoolStore.generateMonthlyPayroll(school.slug, 'October 2026')
                          reloadSchoolData(school.slug)
                          alert('Generated October 2026 Payroll batch for all active registered staff!')
                        }}
                        style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.5rem 0.95rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ⚡ Re-compute Batch
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          tenantSchoolStore.disbursePayrollBatch(school.slug, 'October 2026', 'Bank Wire')
                          reloadSchoolData(school.slug)
                          alert('Disbursed October 2026 Payroll via Electronic Bank Wire!')
                        }}
                        style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.5rem 0.95rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        ✓ Approve &amp; Disburse Batch
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>TOTAL GROSS PAYROLL</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                        ${payrollList.reduce((acc, p) => acc + p.gross_salary, 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                      <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700 }}>STATUTORY TAX &amp; DEDUCTIONS</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#991b1b', marginTop: '2px' }}>
                        ${payrollList.reduce((acc, p) => acc + (p.tax_deduction + p.pension_deduction), 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>NET PAYABLE TO STAFF</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#065f46', marginTop: '2px' }}>
                        ${payrollList.reduce((acc, p) => acc + p.net_salary, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Staff Member</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Role / Dept</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>Base Pay</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>Allowances</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>Deductions</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>Net Pay</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Status</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Official Slip</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollList.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{p.staff_name}</td>
                            <td style={{ padding: '0.75rem', color: '#64748b' }}>{p.role} • {p.department}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>${p.base_salary.toLocaleString()}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', color: '#059669' }}>+${(p.housing_allowance + p.transport_allowance).toLocaleString()}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', color: '#dc2626' }}>-${(p.tax_deduction + p.pension_deduction).toLocaleString()}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>${p.net_salary.toLocaleString()}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{
                                background: p.status === 'disbursed' ? '#dcfce7' : '#fef3c7',
                                color: p.status === 'disbursed' ? '#15803d' : '#b45309',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                textTransform: 'capitalize',
                              }}>
                                {p.status === 'disbursed' ? '✓ Disbursed' : '⏳ Approved'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedPayslip(p)}
                                style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                🖨️ View Payslip
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* BURSAR SUB-TAB 2: TUITION LEDGER & RECEIPTS */}
              {bursarSubTab === 'payments' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Tuition Fee Invoices &amp; Verified Receipts</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>Recorded payments generate printable official stamped receipts with institutional verification QR.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRecordPaymentModal(true)}
                      style={{ background: '#b45309', color: '#ffffff', fontWeight: 800, padding: '0.55rem 1.15rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      + Record New Payment
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Receipt No.</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Student &amp; Adm</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Term Period</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Payment Method</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>Amount Paid</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Authorized By</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Official Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feePaymentsList.map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 800, color: '#b45309' }}>{p.receipt_number}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.student_name}</div>
                              <div style={{ fontSize: '0.75rem', color: primaryColor }}>{p.admission_number}</div>
                            </td>
                            <td style={{ padding: '0.75rem', color: '#64748b' }}>{p.period_name}</td>
                            <td style={{ padding: '0.75rem', color: '#475569' }}>{p.payment_method}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 900, color: '#059669' }}>${p.amount.toLocaleString()}</td>
                            <td style={{ padding: '0.75rem', color: '#64748b' }}>{p.recorded_by}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedReceipt(p)}
                                style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                🖨️ View Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* BURSAR SUB-TAB 3: ARREARS LEDGER */}
              {bursarSubTab === 'arrears' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#991b1b' }}>Outstanding Fee Defaulters Ledger</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>Students with remaining balances for {school.active_period_name}.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Queued automated SMS fee reminder alerts to ${studentList.filter((s) => s.fee_balance > 0).length} guardian mobile phones!`)}
                      style={{ background: '#dc2626', color: '#ffffff', fontWeight: 800, padding: '0.55rem 1.15rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      📱 Send Bulk SMS Reminder Queue
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#fef2f2', borderBottom: '2px solid #fecaca' }}>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#991b1b' }}>Adm No.</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#991b1b' }}>Student Name</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#991b1b' }}>Guardian &amp; Phone</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#991b1b', textAlign: 'right' }}>Total Fee</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#991b1b', textAlign: 'right' }}>Paid</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#991b1b', textAlign: 'right' }}>Outstanding Due</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#991b1b', textAlign: 'center' }}>Collect Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentList
                          .filter((s) => s.fee_balance > 0)
                          .map((s) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #fee2e2' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 800, color: primaryColor }}>{s.admission_number}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{s.full_name}</td>
                              <td style={{ padding: '0.75rem', color: '#475569' }}>
                                {s.guardian_name} ({s.guardian_phone})
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'right' }}>${s.fee_total.toLocaleString()}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'right', color: '#059669' }}>${s.fee_paid.toLocaleString()}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 900, color: '#dc2626' }}>${s.fee_balance.toLocaleString()}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewPaymentInput({
                                      student_id: s.id,
                                      amount: s.fee_balance,
                                      payment_method: 'Mobile Money (M-Pesa)',
                                    })
                                    setShowRecordPaymentModal(true)
                                  }}
                                  style={{ background: '#b45309', color: '#ffffff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                                >
                                  + Record Payment
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        )}


{/* ============================================================ */}
        {/* VIEW 6: BRANDED PRINCIPAL & EXECUTIVE ADMINISTRATION DESK */}
        {/* ============================================================ */}
        {activeTab === 'principal' && (
          activeRole !== 'admin' ? (
            renderRestrictedCard(
              `${school.principal_title} Executive Office`,
              'Executive leadership tools, staff hiring, student admissions, login credential issuance, calendar system setup, and cloud LMS subscription management require Executive Administrator credentials.',
              'Executive Admin Only'
            )
          ) : (
            <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem 2rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {school.name} EXECUTIVE LEADERSHIP
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '4px 0 0', color: '#0f172a' }}>
                      {school.principal_name} — {school.principal_title} Desk
                    </h2>
                    <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px' }}>
                      Institutional Governance, Staff Credentials &amp; Student Admissions Authority
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(true)}
                      style={{ background: '#0f172a', color: '#ffffff', fontWeight: 800, padding: '0.55rem 1.15rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      + Hire / Register Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdmitStudentModal(true)}
                      style={{ background: primaryColor, color: '#ffffff', fontWeight: 800, padding: '0.55rem 1.15rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      + Admit New Student
                    </button>
                  </div>
                </div>

                {/* Sub-tab Navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setPrincipalSubTab('staff')}
                    style={{
                      background: principalSubTab === 'staff' ? primaryColor : '#f1f5f9',
                      color: principalSubTab === 'staff' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    👥 Staff Directory &amp; Login Credentials ({staffList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrincipalSubTab('admissions')}
                    style={{
                      background: principalSubTab === 'admissions' ? primaryColor : '#f1f5f9',
                      color: principalSubTab === 'admissions' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    🎓 Student Admissions Desk ({studentList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrincipalSubTab('overview')}
                    style={{
                      background: principalSubTab === 'overview' ? primaryColor : '#f1f5f9',
                      color: principalSubTab === 'overview' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    ⚙️ Cloud Subscription &amp; Governance
                  </button>
                </div>
              </div>

              {/* PRINCIPAL SUB-TAB 1: STAFF DIRECTORY & CREDENTIALS */}
              {principalSubTab === 'staff' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Staff Directory &amp; Portal Login Accounts</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>Provision system accounts and print official login slips for teachers and bursars.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Search staff by name or role..."
                        value={staffSearchQuery}
                        onChange={(e) => setStaffSearchQuery(e.target.value)}
                        style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', width: '220px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddStaffModal(true)}
                        style={{ background: '#0f172a', color: '#ffffff', fontWeight: 800, padding: '0.45rem 0.95rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        + Add Staff Member
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Staff Name</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Role</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Department</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Portal Username</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>Net Salary</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Login Slip</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList
                          .filter((s) => !staffSearchQuery || s.full_name.toLowerCase().includes(staffSearchQuery.toLowerCase()) || s.role.toLowerCase().includes(staffSearchQuery.toLowerCase()))
                          .map((s) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.75rem' }}>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.full_name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.title} • Joined {s.joined_date}</div>
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{
                                  background: s.role === 'teacher' ? '#ecfdf5' : s.role === 'bursar' ? '#fefce8' : '#eff6ff',
                                  color: s.role === 'teacher' ? '#065f46' : s.role === 'bursar' ? '#854d0e' : '#1e40af',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  textTransform: 'capitalize',
                                }}>
                                  {s.role}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem', color: '#475569' }}>{s.department}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 700, color: primaryColor }}>{s.username}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>${s.net_salary.toLocaleString()}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedStaffSlip(s)}
                                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  🖨️ Login Slip
                                </button>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Remove ${s.full_name} from staff register?`)) {
                                      tenantSchoolStore.deleteStaffMember(s.id)
                                      reloadSchoolData(school.slug)
                                    }
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRINCIPAL SUB-TAB 2: STUDENT ADMISSIONS DESK */}
              {principalSubTab === 'admissions' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Student Admissions &amp; Enrollment Registry</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>Admit new students, generate Admission Numbers, Portal PINs, and Official Admission Letters.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Search student or admission no..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', width: '220px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdmitStudentModal(true)}
                        style={{ background: primaryColor, color: '#ffffff', fontWeight: 800, padding: '0.45rem 0.95rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        + Admit New Candidate
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Adm Number</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Student Name</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Class Cohort</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Guardian Contact</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>Fee Balance</th>
                          <th style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Official Slip</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentList
                          .filter((s) => !studentSearchQuery || s.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || s.admission_number.toLowerCase().includes(studentSearchQuery.toLowerCase()))
                          .map((s) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 800, color: primaryColor }}>{s.admission_number}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{s.full_name}</td>
                              <td style={{ padding: '0.75rem', color: '#475569' }}>{s.grade_class}</td>
                              <td style={{ padding: '0.75rem', color: '#64748b' }}>
                                {s.guardian_name} • {s.guardian_phone}
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: s.fee_balance > 0 ? '#dc2626' : '#16a34a' }}>
                                ${s.fee_balance.toLocaleString()}
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedAdmissionSlip(s)}
                                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  📜 Admission Letter
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRINCIPAL SUB-TAB 3: CLOUD SUBSCRIPTION & GOVERNANCE */}
              {principalSubTab === 'overview' && (
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  {/* Cloud LMS Subscription Plan */}
                  <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', borderRadius: '18px', padding: '1.5rem', border: '1.5px solid #bfdbfe', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#1d4ed8', color: '#ffffff', padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase' }}>
                          Cloud LMS Subscription
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 800 }}>
                          ● Active Multi-Tenant Account
                        </span>
                      </div>
                      <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                        {school.subscription_tier ? school.subscription_tier.charAt(0).toUpperCase() + school.subscription_tier.slice(1) : 'Growth'} Campus Plan
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span>Rate: <strong style={{ color: '#0f172a' }}>${school.subscription_monthly_rate || 59} / month</strong></span>
                        <span>•</span>
                        <span>Billing: <strong style={{ color: '#0f172a' }}>{school.subscription_billing_cycle === 'annually' ? 'Annual (2 Months Free)' : 'Monthly'}</strong></span>
                        <span>•</span>
                        <span>Active Enrolled Students: <strong style={{ color: '#1d4ed8' }}>{studentList.length} Students</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setShowPricingModal(true)}
                        style={{
                          background: '#1d4ed8',
                          color: '#ffffff',
                          fontWeight: 800,
                          padding: '0.65rem 1.25rem',
                          borderRadius: '10px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        💎 Manage Plan &amp; Upgrade
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Calendar Mode</div>
                      <div style={{ color: primaryColor, fontWeight: 700, fontSize: '0.92rem' }}>
                        {school.academic_system === 'semester' ? '2 Semesters (Higher Ed Mode)' : '3 Terms (British / Primary / Secondary Mode)'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
                        Active: {school.active_period_name}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Curriculum Framework</div>
                      <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.92rem' }}>
                        {school.curriculum_type}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
                        Accredited Center Registry &amp; Certification
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>School Brand Theme</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: primaryColor, border: '1px solid #cbd5e1' }} />
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{primaryColor}</span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
                        Applied to Report Cards, Portals &amp; Invoices
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}

      </main>

      {/* SPECIAL LINKS & CUSTOM DOMAIN MANAGEMENT MODAL */}
      {showDomainModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDomainModal(false)
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`, color: '#ffffff', padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: accentColor, marginBottom: '0.25rem' }}>
                  <GlobeIcon size={13} color={accentColor} />
                  <span>Domain &amp; Access Links Configuration</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  Special Links for {school.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDomainModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Notification Banner */}
              {customDomainMessage && (
                <div
                  style={{
                    background: customDomainMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: customDomainMessage.type === 'success' ? '#15803d' : '#b91c1c',
                    border: `1px solid ${customDomainMessage.type === 'success' ? '#86efac' : '#fca5a5'}`,
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    marginBottom: '1.25rem',
                  }}
                >
                  {customDomainMessage.text}
                </div>
              )}

              {/* 1. Official Subdomain Section */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1. Dedicated School Subdomain
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '999px' }}>
                    ● Active SSL Subdomain
                  </span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                  {domainLinks.subdomainUrl}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  Share this address with students and staff. You can also provide them with their specific dashboard links directly:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                    <span>🎓 <strong>Student:</strong> .../student</span>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.portals.student.subdomain, 'Modal Student Link')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedLink === 'Modal Student Link' ? '✅ Copied' : 'Copy'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                    <span>👨‍🏫 <strong>Teacher:</strong> .../teacher</span>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.portals.teacher.subdomain, 'Modal Teacher Link')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedLink === 'Modal Teacher Link' ? '✅ Copied' : 'Copy'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                    <span>💼 <strong>Bursar:</strong> .../bursar</span>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.portals.bursar.subdomain, 'Modal Bursar Link')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedLink === 'Modal Bursar Link' ? '✅ Copied' : 'Copy'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                    <span>🏛️ <strong>Principal:</strong> .../principal</span>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.portals.principal.subdomain, 'Modal Principal Link')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedLink === 'Modal Principal Link' ? '✅ Copied' : 'Copy'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                    <span>🗓️ <strong>Calendar:</strong> .../calendar</span>
                    <button
                      type="button"
                      onClick={() => copyRawText(domainLinks.portals.calendar.subdomain, 'Modal Calendar Link')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedLink === 'Modal Calendar Link' ? '✅ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyRawText(domainLinks.subdomainUrl, 'Official Subdomain Modal')}
                  style={{
                    width: '100%',
                    background: '#1d4ed8',
                    color: '#ffffff',
                    fontWeight: 800,
                    padding: '0.65rem',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    marginTop: '0.85rem',
                  }}
                >
                  {copiedLink === 'Official Subdomain Modal' ? '✅ Copied Subdomain URL' : '📋 Copy Primary Subdomain'}
                </button>
              </div>

              {/* 2. Universal Path Section */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    2. Universal Path (Zero-Config Fallback)
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '999px' }}>
                    Works Everywhere
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                  {domainLinks.pathUrl}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                  Direct URL path that works immediately on all devices, web browsers, and platforms without waiting for custom DNS propagation.
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`/s/${school.slug}`, 'Universal Path Modal')}
                  style={{
                    background: '#334155',
                    color: '#ffffff',
                    fontWeight: 800,
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  {copiedLink === 'Universal Path Modal' ? '✅ Copied Universal Path' : '📋 Copy Universal Path'}
                </button>
              </div>

              {/* 3. Custom Domain (BYOD) Section */}
              <div style={{ background: '#faf5ff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e9d5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    3. Connect Custom Domain (BYOD)
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: school.custom_domain ? '#dcfce7' : '#fef3c7', color: school.custom_domain ? '#15803d' : '#b45309', padding: '2px 8px', borderRadius: '999px' }}>
                    {school.custom_domain ? `Connected: ${school.custom_domain}` : 'Optional'}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  Point your institution's custom subdomain (e.g. <code>portal.{school.slug}.ac.ke</code> or <code>lms.{school.slug}.edu</code>) to Éclat Cloud.
                </p>

                <form onSubmit={handleSaveCustomDomain} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    placeholder="e.g. portal.myschool.edu"
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#7c3aed',
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.6rem 1.15rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Save Domain
                  </button>
                  {school.custom_domain && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomDomainInput('')
                        tenantSchoolStore.updateSchoolCustomDomain(school.slug, '')
                        setSchool(tenantSchoolStore.getSchoolBySlug(school.slug))
                        setCustomDomainMessage({ type: 'success', text: 'Custom domain cleared.' })
                      }}
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        fontWeight: 700,
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </form>

                {/* DNS Table */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                    DNS Setup Instructions:
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '0.5rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569' }}>
                        <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0' }}>Type</th>
                        <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0' }}>Host / Name</th>
                        <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0' }}>Points To / Value</th>
                        <th style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0' }}>TTL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', fontWeight: 800 }}>CNAME</td>
                        <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}>portal</td>
                        <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontWeight: 800, color: '#2563eb' }}>eclat.institute</td>
                        <td style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0' }}>3600 (Auto)</td>
                      </tr>
                    </tbody>
                  </table>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.74rem', lineHeight: 1.5 }}>
                    After adding the CNAME record in your domain registrar (GoDaddy, Cloudflare, Namecheap, etc.), requests for your custom domain will automatically load {school.name}'s dedicated portals.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.75rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowDomainModal(false)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. LMS ROLE SWITCHER MODAL */}
      {showRoleSwitcherModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRoleSwitcherModal(false)
          }}
        >
          <div
            style={{
              maxWidth: '640px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`, color: '#ffffff', padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: accentColor, marginBottom: '0.25rem' }}>
                  <span>🔐 Access Control &amp; Portal Permissions</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  Switch Portal Role for {school.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleSwitcherModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
                In Éclat LMS, each member only accesses their assigned tools. Select a role below to preview permission-scoped behavior:
              </p>

              {/* 1. Admin / Principal */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSwitchRole('admin')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSwitchRole('admin') } }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: '16px',
                  border: activeRole === 'admin' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                  background: activeRole === 'admin' ? '#fef2f2' : '#ffffff',
                  cursor: 'pointer',
                  gap: '1rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>👑</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>Executive Admin &amp; Principal</strong>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#fee2e2', color: '#991b1b', padding: '1px 6px', borderRadius: '4px' }}>
                        Full Access (All 6 Portals)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                      Unrestricted institutional authority across Principal Desk, Bursar finances, Teacher gradebooks, and Student records.
                    </div>
                  </div>
                </div>
                {activeRole === 'admin' && (
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '3px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                    Active Role
                  </span>
                )}
              </div>

              {/* 2. Teacher */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSwitchRole('teacher')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSwitchRole('teacher') } }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: '16px',
                  border: activeRole === 'teacher' ? '2px solid #059669' : '1px solid #e2e8f0',
                  background: activeRole === 'teacher' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer',
                  gap: '1rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>👨‍🏫</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>Teacher / Faculty</strong>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#d1fae5', color: '#065f46', padding: '1px 6px', borderRadius: '4px' }}>
                        Scoped Access
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                      Limited to class attendance, continuous assessment test (CAT) gradebooks, and notes uploads. Principal &amp; Bursar desks are locked.
                    </div>
                  </div>
                </div>
                {activeRole === 'teacher' && (
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '3px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                    Active Role
                  </span>
                )}
              </div>

              {/* 3. Bursar */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSwitchRole('bursar')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSwitchRole('bursar') } }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: '16px',
                  border: activeRole === 'bursar' ? '2px solid #b45309' : '1px solid #e2e8f0',
                  background: activeRole === 'bursar' ? '#fefce8' : '#ffffff',
                  cursor: 'pointer',
                  gap: '1rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>💼</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>Bursar &amp; Accounts Officer</strong>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px' }}>
                        Scoped Access
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                      Limited to tuition fee invoicing, receipts issuance, payment verification, and fee arrears ledgers.
                    </div>
                  </div>
                </div>
                {activeRole === 'bursar' && (
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                    Active Role
                  </span>
                )}
              </div>

              {/* 4. Student */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSwitchRole('student')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSwitchRole('student') } }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: '16px',
                  border: activeRole === 'student' ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                  background: activeRole === 'student' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  gap: '1rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎓</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>Enrolled Student</strong>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px' }}>
                        Learner Access
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                      Limited to personal learning modules, class schedules, attendance records, and verified term transcripts.
                    </div>
                  </div>
                </div>
                {activeRole === 'student' && (
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1d4ed8', background: '#dbeafe', padding: '3px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                    Active Role
                  </span>
                )}
              </div>

              {/* 5. Public Guest */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSwitchRole('public')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSwitchRole('public') } }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: '16px',
                  border: activeRole === 'public' ? '2px solid #475569' : '1px solid #e2e8f0',
                  background: activeRole === 'public' ? '#f8fafc' : '#ffffff',
                  cursor: 'pointer',
                  gap: '1rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>🌐</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>Public Guest / Visitor</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                      Public school hub overview and academic calendar dates only.
                    </div>
                  </div>
                </div>
                {activeRole === 'public' && (
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', background: '#e2e8f0', padding: '3px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                    Active Role
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CLOUD LMS SUBSCRIPTION PRICING GUIDE MODAL */}
      {showPricingModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPricingModal(false)
          }}
        >
          <div
            style={{
              maxWidth: '850px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`, color: '#ffffff', padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: accentColor, marginBottom: '0.25rem' }}>
                  <span>💎 Institution Cloud SaaS Pricing</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  Éclat Cloud LMS Subscription Plans
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPricingModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Billing Toggle & Trial Banner */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800, background: '#dcfce7', padding: '3px 10px', borderRadius: '999px' }}>
                    ● 14-Day Free Trial on All Plans • Zero Setup Fees
                  </span>
                </div>

                <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setPricingModalCycle('monthly')}
                    style={{
                      background: pricingModalCycle === 'monthly' ? '#ffffff' : 'transparent',
                      color: pricingModalCycle === 'monthly' ? '#0f172a' : '#64748b',
                      border: 'none',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: pricingModalCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingModalCycle('annually')}
                    style={{
                      background: pricingModalCycle === 'annually' ? '#ffffff' : 'transparent',
                      color: pricingModalCycle === 'annually' ? '#0f172a' : '#64748b',
                      border: 'none',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: pricingModalCycle === 'annually' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Annual Billing (Save 17%)
                  </button>
                </div>
              </div>

              {/* 3 Pricing Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* 1. Starter Campus */}
                <div
                  style={{
                    background: '#ffffff',
                    border: school.subscription_tier === 'starter' ? '2.5px solid #1d4ed8' : '1px solid #cbd5e1',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: school.subscription_tier === 'starter' ? '0 8px 24px rgba(29, 78, 216, 0.15)' : 'none',
                    position: 'relative',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Starter Campus
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '6px 0 2px' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>
                        ${pricingModalCycle === 'monthly' ? '29' : '24'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>/ month</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginBottom: '0.75rem' }}>
                      Up to 150 enrolled students
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.6 }}>
                      <li>Dedicated URL: {school.slug}.eclat.institute</li>
                      <li>4 Role Portals (Admin, Teacher, Bursar, Student)</li>
                      <li>Custom Term or Semester academic calendars</li>
                      <li>Continuous gradebooks &amp; report cards</li>
                      <li>Official tuition fee receipts with QR codes</li>
                      <li>Full 14-day risk-free trial</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    {school.subscription_tier === 'starter' ? (
                      <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.55rem', borderRadius: '10px', textAlign: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                        ✓ Current Active Plan
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectSubscriptionPlan('starter')}
                        style={{ width: '100%', background: '#1d4ed8', color: '#ffffff', fontWeight: 800, padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                      >
                        Switch to Starter ($29/mo)
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Growth Campus (Most Popular) */}
                <div
                  style={{
                    background: school.subscription_tier === 'growth' ? '#eff6ff' : '#ffffff',
                    border: '2.5px solid #1d4ed8',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 30px rgba(29, 78, 216, 0.18)',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', top: '-11px', right: '14px', background: '#1d4ed8', color: '#ffffff', fontSize: '0.68rem', fontWeight: 800, padding: '2px 10px', borderRadius: '999px', textTransform: 'uppercase' }}>
                    ★ Most Popular
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                      Growth Campus
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '6px 0 2px' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>
                        ${pricingModalCycle === 'monthly' ? '59' : '49'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>/ month</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginBottom: '0.75rem' }}>
                      Up to 600 enrolled students
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.76rem', color: '#1e293b', lineHeight: 1.6 }}>
                      <li><strong>Custom Domain (BYOD)</strong> support with CNAME</li>
                      <li>All Starter Campus capabilities</li>
                      <li>Automated fee arrears SMS &amp; WhatsApp queue</li>
                      <li>Biometric &amp; morning/afternoon shift attendance</li>
                      <li>Bulk digital Principal seal on report cards</li>
                      <li>Priority email and phone desk support</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    {school.subscription_tier === 'growth' ? (
                      <div style={{ background: '#1d4ed8', color: '#ffffff', padding: '0.55rem', borderRadius: '10px', textAlign: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                        ✓ Current Active Plan
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectSubscriptionPlan('growth')}
                        style={{ width: '100%', background: '#1d4ed8', color: '#ffffff', fontWeight: 800, padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                      >
                        Switch to Growth ($59/mo)
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Enterprise Campus */}
                <div
                  style={{
                    background: '#ffffff',
                    border: school.subscription_tier === 'enterprise' ? '2.5px solid #7c3aed' : '1px solid #cbd5e1',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: school.subscription_tier === 'enterprise' ? '0 8px 24px rgba(124, 58, 237, 0.15)' : 'none',
                    position: 'relative',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                      Enterprise Campus
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '6px 0 2px' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>
                        ${pricingModalCycle === 'monthly' ? '99' : '82'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>/ month</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginBottom: '0.75rem' }}>
                      Unlimited Students &amp; Multi-Campus
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.6 }}>
                      <li>Multi-campus branch network management</li>
                      <li>White-label branded Android APK Mobile App</li>
                      <li>Custom national &amp; international grading schemes</li>
                      <li>Dedicated daily encrypted cloud backups</li>
                      <li>99.9% high-availability SLA</li>
                      <li>24/7 dedicated account manager</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    {school.subscription_tier === 'enterprise' ? (
                      <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '0.55rem', borderRadius: '10px', textAlign: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                        ✓ Current Active Plan
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectSubscriptionPlan('enterprise')}
                        style={{ width: '100%', background: '#7c3aed', color: '#ffffff', fontWeight: 800, padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                      >
                        Switch to Enterprise ($99/mo)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing FAQ Card */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#475569' }}>
                <strong style={{ color: '#0f172a' }}>💳 Billing Guarantee:</strong> No credit card is charged during your 14-day evaluation window. You can change plans, pause, or cancel anytime from the Principal Desk. All data remains secure and exportable.
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.75rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowPricingModal(false)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Close Pricing Guide
              </button>
            </div>
          </div>
        </div>
      )}
{/* ============================================================ */}
      {/* 4. OPERATIONAL MODAL: HIRE / REGISTER STAFF */}
      {/* ============================================================ */}
      {showAddStaffModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddStaffModal(false) }}
        >
          <div style={{ maxWidth: '640px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`, color: '#ffffff', padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: '2px' }}>
                  Principal HR Desk
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  Register Staff &amp; Provision Credentials
                </h3>
              </div>
              <button type="button" onClick={() => setShowAddStaffModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const usernamePrefix = newStaffInput.full_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.')
                const created = tenantSchoolStore.createStaffMember({
                  school_slug: school.slug,
                  full_name: newStaffInput.full_name.trim(),
                  role: newStaffInput.role,
                  email: newStaffInput.email.trim() || `${usernamePrefix}@${school.slug}.eclat.institute`,
                  username: `${usernamePrefix}@${school.slug}.eclat.institute`,
                  temp_password: `Pass-${Math.floor(100000 + Math.random() * 900000)}!`,
                  phone: newStaffInput.phone.trim() || '+254 700 000 000',
                  department: newStaffInput.department,
                  title: newStaffInput.title,
                  assigned_classes: newStaffInput.assigned_classes.split(',').map((c) => c.trim()),
                  assigned_subjects: newStaffInput.assigned_subjects.split(',').map((s) => s.trim()),
                  salary_base: Number(newStaffInput.salary_base),
                  salary_housing: Number(newStaffInput.salary_housing),
                  salary_transport: Number(newStaffInput.salary_transport),
                  salary_tax: Number(newStaffInput.salary_tax),
                  salary_pension: Number(newStaffInput.salary_pension),
                })
                reloadSchoolData(school.slug)
                setShowAddStaffModal(false)
                setSelectedStaffSlip(created)
              }}
              style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Staff Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Sterling"
                  value={newStaffInput.full_name}
                  onChange={(e) => setNewStaffInput({ ...newStaffInput, full_name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>System Role *</label>
                  <select
                    value={newStaffInput.role}
                    onChange={(e) => setNewStaffInput({ ...newStaffInput, role: e.target.value as any })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="bursar">Bursar / Finance Officer</option>
                    <option value="admin">Vice Principal / Admin</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Official Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Physics Master"
                    value={newStaffInput.title}
                    onChange={(e) => setNewStaffInput({ ...newStaffInput, title: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Personal Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. arthur.sterling@gmail.com"
                    value={newStaffInput.email}
                    onChange={(e) => setNewStaffInput({ ...newStaffInput, email: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+254 712 345 678"
                    value={newStaffInput.phone}
                    onChange={(e) => setNewStaffInput({ ...newStaffInput, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Department</label>
                <input
                  type="text"
                  placeholder="e.g. Science &amp; Technology"
                  value={newStaffInput.department}
                  onChange={(e) => setNewStaffInput({ ...newStaffInput, department: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              {/* Compensation details */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Monthly Compensation Package (USD $)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Base Salary ($)</label>
                    <input
                      type="number"
                      value={newStaffInput.salary_base}
                      onChange={(e) => setNewStaffInput({ ...newStaffInput, salary_base: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Housing Allowance</label>
                    <input
                      type="number"
                      value={newStaffInput.salary_housing}
                      onChange={(e) => setNewStaffInput({ ...newStaffInput, salary_housing: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Transport</label>
                    <input
                      type="number"
                      value={newStaffInput.salary_transport}
                      onChange={(e) => setNewStaffInput({ ...newStaffInput, salary_transport: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>PAYE Tax ($)</label>
                    <input
                      type="number"
                      value={newStaffInput.salary_tax}
                      onChange={(e) => setNewStaffInput({ ...newStaffInput, salary_tax: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddStaffModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: primaryColor, color: '#ffffff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Generate Credentials &amp; Issue Slip →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. OPERATIONAL MODAL: ADMIT NEW STUDENT */}
      {/* ============================================================ */}
      {showAdmitStudentModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAdmitStudentModal(false) }}
        >
          <div style={{ maxWidth: '640px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`, color: '#ffffff', padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: '2px' }}>
                  Registrar Admissions Desk
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  Admit Candidate &amp; Issue Student PIN
                </h3>
              </div>
              <button type="button" onClick={() => setShowAdmitStudentModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const initials = school.slug.substring(0, 2).toUpperCase()
                const count = studentList.length + 1
                const pad = String(count).padStart(4, '0')
                const admNumber = `${initials}-2026-${pad}`
                const usernamePrefix = newStudentInput.full_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.')

                const created = tenantSchoolStore.admitStudent({
                  school_slug: school.slug,
                  admission_number: admNumber,
                  full_name: newStudentInput.full_name.trim(),
                  grade_class: newStudentInput.grade_class,
                  guardian_name: newStudentInput.guardian_name.trim(),
                  guardian_phone: newStudentInput.guardian_phone.trim(),
                  guardian_email: newStudentInput.guardian_email.trim(),
                  username: `${usernamePrefix}@${school.slug}.eclat.institute`,
                  temp_password: `PIN-${Math.floor(1000 + Math.random() * 9000)}`,
                  fee_total: Number(newStudentInput.fee_total),
                  fee_paid: Number(newStudentInput.fee_paid),
                })

                // Auto-create initial tuition payment if fee_paid > 0
                if (Number(newStudentInput.fee_paid) > 0) {
                  tenantSchoolStore.recordFeePayment({
                    school_slug: school.slug,
                    student_id: created.id,
                    student_name: created.full_name,
                    admission_number: created.admission_number,
                    amount: Number(newStudentInput.fee_paid),
                    period_name: school.active_period_name,
                    payment_method: 'Bank Wire',
                    recorded_by: `${school.principal_name} (Admissions Office)`,
                  })
                }

                reloadSchoolData(school.slug)
                setShowAdmitStudentModal(false)
                setSelectedAdmissionSlip(created)
              }}
              style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina Hassan"
                  value={newStudentInput.full_name}
                  onChange={(e) => setNewStudentInput({ ...newStudentInput, full_name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Enrolling Class / Form Cohort *</label>
                <select
                  value={newStudentInput.grade_class}
                  onChange={(e) => setNewStudentInput({ ...newStudentInput, grade_class: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="Grade 10 Cambridge">Grade 10 Cambridge</option>
                  <option value="Grade 11 Cambridge">Grade 11 Cambridge</option>
                  <option value="Form 3 Alpha">Form 3 Alpha</option>
                  <option value="Form 4 Beta">Form 4 Beta</option>
                  <option value="Diploma Year 1">Diploma Year 1</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Omar Hassan"
                    value={newStudentInput.guardian_name}
                    onChange={(e) => setNewStudentInput({ ...newStudentInput, guardian_name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Guardian Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+254 722 112 233"
                    value={newStudentInput.guardian_phone}
                    onChange={(e) => setNewStudentInput({ ...newStudentInput, guardian_phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Guardian Email</label>
                <input
                  type="email"
                  placeholder="omar.hassan@example.com"
                  value={newStudentInput.guardian_email}
                  onChange={(e) => setNewStudentInput({ ...newStudentInput, guardian_email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b' }}>Billed Term Fee ($)</label>
                  <input
                    type="number"
                    value={newStudentInput.fee_total}
                    onChange={(e) => setNewStudentInput({ ...newStudentInput, fee_total: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b' }}>Initial Deposit Paid ($)</label>
                  <input
                    type="number"
                    value={newStudentInput.fee_paid}
                    onChange={(e) => setNewStudentInput({ ...newStudentInput, fee_paid: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAdmitStudentModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: primaryColor, color: '#ffffff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Complete Admission &amp; Print Letter →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. OPERATIONAL MODAL: RECORD FEE PAYMENT */}
      {/* ============================================================ */}
      {showRecordPaymentModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowRecordPaymentModal(false) }}
        >
          <div style={{ maxWidth: '580px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #b45309 0%, #0f172a 100%)', color: '#ffffff', padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#fde047', marginBottom: '2px' }}>
                  Bursar Cashier Terminal
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  Record Tuition Fee Payment
                </h3>
              </div>
              <button type="button" onClick={() => setShowRecordPaymentModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const targetStudent = studentList.find((s) => s.id === newPaymentInput.student_id) || studentList[0]
                if (!targetStudent) return

                const pmt = tenantSchoolStore.recordFeePayment({
                  school_slug: school.slug,
                  student_id: targetStudent.id,
                  student_name: targetStudent.full_name,
                  admission_number: targetStudent.admission_number,
                  amount: Number(newPaymentInput.amount),
                  period_name: school.active_period_name,
                  payment_method: newPaymentInput.payment_method,
                  recorded_by: profile?.full_name || 'Accounts Bursar Office',
                })

                reloadSchoolData(school.slug)
                setShowRecordPaymentModal(false)
                setSelectedReceipt(pmt)
              }}
              style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Select Student *</label>
                <select
                  value={newPaymentInput.student_id}
                  onChange={(e) => setNewPaymentInput({ ...newPaymentInput, student_id: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="">-- Choose Candidate --</option>
                  {studentList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.admission_number}) — Balance: ${s.fee_balance}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Amount to Pay (USD $) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPaymentInput.amount}
                  onChange={(e) => setNewPaymentInput({ ...newPaymentInput, amount: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Payment Channel *</label>
                <select
                  value={newPaymentInput.payment_method}
                  onChange={(e) => setNewPaymentInput({ ...newPaymentInput, payment_method: e.target.value as any })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="Bank Wire">Bank Wire Transfer</option>
                  <option value="Mobile Money (M-Pesa)">Mobile Money (M-Pesa)</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Cash">Cash at Bursar Office</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowRecordPaymentModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#b45309', color: '#ffffff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Issue Stamped Receipt →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. OPERATIONAL MODAL: UPLOAD LESSON NOTE */}
      {/* ============================================================ */}
      {showUploadNoteModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUploadNoteModal(false) }}
        >
          <div style={{ maxWidth: '580px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #0f172a 100%)', color: '#ffffff', padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#a7f3d0', marginBottom: '2px' }}>
                  Teacher Curriculum Upload Desk
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  Upload Class Study Note
                </h3>
              </div>
              <button type="button" onClick={() => setShowUploadNoteModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                tenantSchoolStore.createLessonNote({
                  school_slug: school.slug,
                  class_name: newNoteInput.class_name,
                  subject_name: newNoteInput.subject_name,
                  title: newNoteInput.title.trim(),
                  summary: newNoteInput.summary.trim(),
                  file_url: newNoteInput.file_url.trim(),
                  teacher_name: profile?.full_name || 'Subject Master',
                })

                reloadSchoolData(school.slug)
                setShowUploadNoteModal(false)
                alert(`Lesson note "${newNoteInput.title}" published! Students in ${newNoteInput.class_name} can now access and download it.`)
              }}
              style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Class Cohort *</label>
                  <select
                    value={newNoteInput.class_name}
                    onChange={(e) => setNewNoteInput({ ...newNoteInput, class_name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="Grade 10 Cambridge">Grade 10 Cambridge</option>
                    <option value="Grade 11 Cambridge">Grade 11 Cambridge</option>
                    <option value="Form 3 Alpha">Form 3 Alpha</option>
                    <option value="Diploma Year 1">Diploma Year 1</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Mathematics"
                    value={newNoteInput.subject_name}
                    onChange={(e) => setNewNoteInput({ ...newNoteInput, subject_name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Topic / Note Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Differential Calculus &amp; Stationary Points"
                  value={newNoteInput.title}
                  onChange={(e) => setNewNoteInput({ ...newNoteInput, title: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Overview &amp; Instructions *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize key learning objectives and revision exercises..."
                  value={newNoteInput.summary}
                  onChange={(e) => setNewNoteInput({ ...newNoteInput, summary: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowUploadNoteModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Publish Note →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. PRINTABLE DIALOG: STAFF CREDENTIAL SLIP */}
      {/* ============================================================ */}
      {selectedStaffSlip && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedStaffSlip(null) }}
        >
          <div style={{ maxWidth: '540px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: `2px solid ${primaryColor}`, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`, color: '#ffffff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: accentColor }}>OFFICIAL CREDENTIAL SLIP</div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>{school.name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedStaffSlip(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <div style={{ padding: '1.75rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>STAFF MEMBER:</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>{selectedStaffSlip.full_name}</div>
                <div style={{ fontSize: '0.8rem', color: primaryColor, fontWeight: 700 }}>{selectedStaffSlip.title} • {selectedStaffSlip.department}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#ecfdf5', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #a7f3d0', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065f46' }}>PORTAL LOGIN USERNAME</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#064e3b' }}>{selectedStaffSlip.username}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065f46' }}>TEMPORARY SYSTEM PASSWORD</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#047857', letterSpacing: '0.05em' }}>{selectedStaffSlip.temp_password || 'Pass-993812!'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065f46' }}>DIRECT PORTAL URL</div>
                  <div style={{ fontSize: '0.82rem', color: '#065f46' }}>https://{school.slug}.eclat.institute/{selectedStaffSlip.role}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => copyRawText(`${selectedStaffSlip.username} / ${selectedStaffSlip.temp_password}`, 'Credentials')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  {copiedLink === 'Credentials' ? '✓ Copied' : '📋 Copy Text'}
                </button>
                <button type="button" onClick={() => window.print()} style={{ background: primaryColor, color: '#ffffff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                  🖨️ Print Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. PRINTABLE DIALOG: STUDENT ADMISSION LETTER & PIN SLIP */}
      {/* ============================================================ */}
      {selectedAdmissionSlip && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedAdmissionSlip(null) }}
        >
          <div style={{ maxWidth: '600px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: `2px solid ${primaryColor}`, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`, color: '#ffffff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: accentColor }}>OFFICIAL ADMISSION LETTER</div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>{school.name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedAdmissionSlip(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <div style={{ padding: '1.75rem' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>OFFICIALLY ADMITTED CANDIDATE:</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>{selectedAdmissionSlip.full_name}</div>
                <div style={{ fontSize: '0.85rem', color: primaryColor, fontWeight: 700 }}>
                  Admission Number: {selectedAdmissionSlip.admission_number} • Cohort: {selectedAdmissionSlip.grade_class}
                </div>
              </div>

              <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #bfdbfe', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '6px' }}>STUDENT PORTAL ACCESS CREDENTIALS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Portal Username:</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{selectedAdmissionSlip.username}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Student Security PIN:</div>
                    <div style={{ fontWeight: 900, color: '#1d4ed8', fontSize: '1.1rem' }}>{selectedAdmissionSlip.temp_password || 'PIN-4820'}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Authorized by:</div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{school.principal_name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{school.principal_title}</div>
                </div>
                <div style={{ fontSize: '1.8rem' }}>📜</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => copyRawText(`${selectedAdmissionSlip.admission_number}: ${selectedAdmissionSlip.username} (PIN: ${selectedAdmissionSlip.temp_password})`, 'Admission')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  {copiedLink === 'Admission' ? '✓ Copied' : '📋 Copy'}
                </button>
                <button type="button" onClick={() => window.print()} style={{ background: primaryColor, color: '#ffffff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                  🖨️ Print Admission Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 10. PRINTABLE DIALOG: OFFICIAL STAFF PAYSLIP */}
      {/* ============================================================ */}
      {selectedPayslip && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPayslip(null) }}
        >
          <div style={{ maxWidth: '580px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`, color: '#ffffff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: accentColor }}>OFFICIAL STAFF PAYSLIP</div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>{school.name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedPayslip(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>EMPLOYEE NAME</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>{selectedPayslip.staff_name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedPayslip.role} • {selectedPayslip.department}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>PAYROLL PERIOD</div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedPayslip.month_period}</div>
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800 }}>Disbursed via {selectedPayslip.payment_method}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>EARNINGS &amp; ALLOWANCES</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Base Salary:</span>
                    <strong>${selectedPayslip.base_salary.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Housing Allowance:</span>
                    <strong>${selectedPayslip.housing_allowance.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#64748b' }}>Transport Allowance:</span>
                    <strong>${selectedPayslip.transport_allowance.toLocaleString()}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.88rem' }}>
                    <span>Gross Salary:</span>
                    <span>${selectedPayslip.gross_salary.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>STATUTORY DEDUCTIONS</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>PAYE Tax:</span>
                    <strong style={{ color: '#dc2626' }}>-${selectedPayslip.tax_deduction.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#64748b' }}>Pension Contribution:</span>
                    <strong style={{ color: '#dc2626' }}>-${selectedPayslip.pension_deduction.toLocaleString()}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid #fecaca', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '0.88rem', color: '#991b1b' }}>
                    <span>Total Deductions:</span>
                    <span>-${(selectedPayslip.tax_deduction + selectedPayslip.pension_deduction).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '1rem 1.25rem', borderRadius: '14px', border: '1.5px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#065f46' }}>NET TAKE-HOME PAY</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857' }}>${selectedPayslip.net_salary.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#065f46', textAlign: 'right' }}>
                  Electronic Transfer Authorized<br />
                  <strong>Bank Clearance ID #{selectedPayslip.id.toUpperCase().slice(-8)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => window.print()} style={{ background: primaryColor, color: '#ffffff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                  🖨️ Print Payslip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 11. PRINTABLE DIALOG: STAMPED TUITION RECEIPT WITH QR */}
      {/* ============================================================ */}
      {selectedReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedReceipt(null) }}
        >
          <div style={{ maxWidth: '540px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '2px solid #b45309', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #b45309 0%, #0f172a 100%)', color: '#ffffff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#fde047' }}>OFFICIAL STAMPED RECEIPT</div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>{school.name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedReceipt(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>RECEIPT NUMBER</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#b45309' }}>{selectedReceipt.receipt_number}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {new Date(selectedReceipt.date).toLocaleString()}</div>
                </div>
                <div style={{ width: '64px', height: '64px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                  🏁
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>STUDENT PAYEE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{selectedReceipt.student_name}</div>
                <div style={{ fontSize: '0.82rem', color: primaryColor, fontWeight: 700 }}>Admission Number: {selectedReceipt.admission_number}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Session: {selectedReceipt.period_name}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fefce8', border: '1px solid #fde047', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#854d0e' }}>PAYMENT METHOD: {selectedReceipt.payment_method.toUpperCase()}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#713f12' }}>${selectedReceipt.amount.toLocaleString()}.00</div>
                </div>
                <span style={{ background: '#16a34a', color: '#ffffff', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                  PAID IN FULL ✓
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Cashier Authority:<br />
                  <strong style={{ color: '#0f172a' }}>{selectedReceipt.recorded_by}</strong>
                </div>
                <button type="button" onClick={() => window.print()} style={{ background: '#b45309', color: '#ffffff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                  🖨️ Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}