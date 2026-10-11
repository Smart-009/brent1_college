import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  cloudServicesStore,
  type CloudServicesConfig,
  type TechServiceItem,
  type HireInquiryItem,
  type JobPositionItem,
  type CareerApplicationItem,
  type DonationLedgerItem,
  type PublishedTutorCourseRecord,
} from '@/lib/cloudServicesStore'
import { schoolStore } from '@/lib/schoolData'
import { tenantSchoolStore } from '@/lib/tenantSchoolStore'
import { formatDate } from '@/lib/utils'

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input className="form-input" {...props} />
    </div>
  )
}

function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <textarea className="form-textarea" {...props} />
    </div>
  )
}

type CloudTab = 'overview' | 'publish' | 'hire' | 'careers' | 'donate' | 'schools'

export function ManageCloudServices() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<CloudTab>('overview')
  const [config, setConfig] = useState<CloudServicesConfig>(() => cloudServicesStore.getConfig())
  const [techServices, setTechServices] = useState<TechServiceItem[]>(() => cloudServicesStore.getTechServices())
  const [hireInquiries, setHireInquiries] = useState<HireInquiryItem[]>(() => cloudServicesStore.getHireInquiries())
  const [jobPositions, setJobPositions] = useState<JobPositionItem[]>(() => cloudServicesStore.getJobPositions())
  const [careerApps, setCareerApps] = useState<CareerApplicationItem[]>(() => cloudServicesStore.getCareerApplications())
  const [tutorCourses, setTutorCourses] = useState<PublishedTutorCourseRecord[]>(() => cloudServicesStore.getPublishedTutorCourses())
  const [donations, setDonations] = useState<DonationLedgerItem[]>(() => cloudServicesStore.getDonationsLedger())
  const [partnerSchools, setPartnerSchools] = useState(() => tenantSchoolStore.getSchools())
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Modals State
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<TechServiceItem | null>(null)
  const [svcTitle, setSvcTitle] = useState('')
  const [svcCategory, setSvcCategory] = useState('Software Engineering')
  const [svcTagline, setSvcTagline] = useState('')
  const [svcBadge, setSvcBadge] = useState('Enterprise Service')
  const [svcTimeline, setSvcTimeline] = useState('2 – 4 Weeks')
  const [svcBestFor, setSvcBestFor] = useState('')
  const [svcDeliverables, setSvcDeliverables] = useState('')
  const [svcTechnologies, setSvcTechnologies] = useState('')

  const [jobModalOpen, setJobModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPositionItem | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobRef, setJobRef] = useState('')
  const [jobFaculty, setJobFaculty] = useState('School of IT and Data Science')
  const [jobDept, setJobDept] = useState('')
  const [jobWorkType, setJobWorkType] = useState<JobPositionItem['workType']>('100% Remote / Online')
  const [jobUrgency, setJobUrgency] = useState<JobPositionItem['urgency']>('Immediate Intake')
  const [jobCompensation, setJobCompensation] = useState('Competitive hourly & monthly faculty stipend (USD / KES)')
  const [jobSummary, setJobSummary] = useState('')
  const [jobResponsibilities, setJobResponsibilities] = useState('')
  const [jobRequirements, setJobRequirements] = useState('')

  const [donationModalOpen, setDonationModalOpen] = useState(false)
  const [donDonorName, setDonDonorName] = useState('')
  const [donDonorEmail, setDonDonorEmail] = useState('')
  const [donDonorPhone, setDonDonorPhone] = useState('')
  const [donAmount, setDonAmount] = useState(150)
  const [donCurrency, setDonCurrency] = useState<'USD' | 'KES'>('USD')
  const [donTrack, setDonTrack] = useState('Physical Institutional Placement Fund')
  const [donStudentName, setDonStudentName] = useState('')
  const [donStudentAdm, setDonStudentAdm] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4500)
  }

  const refreshAll = () => {
    setConfig(cloudServicesStore.getConfig())
    setTechServices(cloudServicesStore.getTechServices())
    setHireInquiries(cloudServicesStore.getHireInquiries())
    setJobPositions(cloudServicesStore.getJobPositions())
    setCareerApps(cloudServicesStore.getCareerApplications())
    setTutorCourses(cloudServicesStore.getPublishedTutorCourses())
    setDonations(cloudServicesStore.getDonationsLedger())
    setPartnerSchools(tenantSchoolStore.getSchools())
  }

  useEffect(() => {
    cloudServicesStore.syncFromCloud().then(refreshAll).catch(() => {})
    const unsub = cloudServicesStore.subscribe(refreshAll)
    return () => unsub()
  }, [])

  const handleToggleConfig = (patch: Partial<CloudServicesConfig>, label: string) => {
    const updated = cloudServicesStore.updateConfig(patch)
    setConfig(updated)
    showToast(`✓ Updated: ${label}`)
  }

  // Tech Service Modal Handlers
  const openAddServiceModal = (svc?: TechServiceItem) => {
    if (svc) {
      setEditingService(svc)
      setSvcTitle(svc.title)
      setSvcCategory(svc.category)
      setSvcTagline(svc.tagline)
      setSvcBadge(svc.badge)
      setSvcTimeline(svc.timeline)
      setSvcBestFor(svc.bestFor)
      setSvcDeliverables(svc.deliverables.join('\n'))
      setSvcTechnologies(svc.technologies.join(', '))
    } else {
      setEditingService(null)
      setSvcTitle('')
      setSvcCategory('Software Engineering')
      setSvcTagline('')
      setSvcBadge('Enterprise Service')
      setSvcTimeline('2 – 6 Weeks')
      setSvcBestFor('Businesses, institutions, and corporate teams.')
      setSvcDeliverables('Full-stack architecture & cloud deployment\nAutomated testing & documentation')
      setSvcTechnologies('React 19, TypeScript, Node.js, PostgreSQL')
    }
    setServiceModalOpen(true)
  }

  const handleSaveTechService = (e: React.FormEvent) => {
    e.preventDefault()
    if (!svcTitle.trim()) return
    const item: TechServiceItem = {
      id: editingService?.id || `svc-${Date.now()}`,
      title: svcTitle.trim(),
      category: svcCategory.trim(),
      tagline: svcTagline.trim(),
      badge: svcBadge.trim() || 'Enterprise',
      iconKey: editingService?.iconKey || 'code',
      color: editingService?.color || '#2563eb',
      deliverables: svcDeliverables.split('\n').map((s) => s.trim()).filter(Boolean),
      technologies: svcTechnologies.split(',').map((s) => s.trim()).filter(Boolean),
      bestFor: svcBestFor.trim(),
      timeline: svcTimeline.trim(),
      isActive: true,
    }
    cloudServicesStore.saveTechService(item)
    setServiceModalOpen(false)
    showToast(`✓ Saved Tech Service: "${item.title}"`)
  }

  // Job Position Modal Handlers
  const openJobModal = (job?: JobPositionItem) => {
    if (job) {
      setEditingJob(job)
      setJobTitle(job.title)
      setJobRef(job.referenceCode)
      setJobFaculty(job.faculty)
      setJobDept(job.department)
      setJobWorkType(job.workType)
      setJobUrgency(job.urgency)
      setJobCompensation(job.compensation)
      setJobSummary(job.summary)
      setJobResponsibilities(job.responsibilities.join('\n'))
      setJobRequirements(job.requirements.join('\n'))
    } else {
      const nextNum = String(jobPositions.length + 1).padStart(2, '0')
      setEditingJob(null)
      setJobTitle('')
      setJobRef(`ECLAT-FAC-2026-${nextNum}`)
      setJobFaculty('School of IT and Data Science')
      setJobDept('Department of Computing & Digital Skills')
      setJobWorkType('100% Remote / Online')
      setJobUrgency('Immediate Intake')
      setJobCompensation('Competitive hourly & monthly faculty stipend (USD / KES)')
      setJobSummary('')
      setJobResponsibilities('Conduct live online interactive classes\nGrade practical assignments and mentor students')
      setJobRequirements('Relevant Bachelor’s or Master’s degree\n2+ years teaching or industry experience')
    }
    setJobModalOpen(true)
  }

  const handleSaveJobPosition = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobTitle.trim()) return
    const item: JobPositionItem = {
      id: editingJob?.id || `pos-${Date.now()}`,
      referenceCode: jobRef.trim() || `ECLAT-FAC-${Date.now()}`,
      title: jobTitle.trim(),
      faculty: jobFaculty.trim(),
      department: jobDept.trim() || jobFaculty.trim(),
      workType: jobWorkType,
      badge: jobUrgency === 'Immediate Intake' ? 'Urgent Priority' : jobUrgency === 'Closed' ? 'Closed' : 'Open Role',
      badgeColor: jobUrgency === 'Immediate Intake' ? '#dc2626' : jobUrgency === 'Closed' ? '#64748b' : '#2563eb',
      iconKey: editingJob?.iconKey || 'graduation',
      summary: jobSummary.trim(),
      responsibilities: jobResponsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: jobRequirements.split('\n').map((s) => s.trim()).filter(Boolean),
      compensation: jobCompensation.trim(),
      urgency: jobUrgency,
      isActive: jobUrgency !== 'Closed',
    }
    cloudServicesStore.saveJobPosition(item)
    setJobModalOpen(false)
    showToast(`✓ Saved Faculty Position: "${item.title}"`)
  }

  // 1-Click Onboard Applicant as Faculty Teacher
  const handleOnboardApplicant = async (app: CareerApplicationItem) => {
    const existingTeachers = schoolStore.getTeachers()
    const staffId = `STF-${new Date().getFullYear()}-${String(existingTeachers.length + 1).padStart(3, '0')}`
    const defaultPass = `Eclat${new Date().getFullYear()}!`

    await schoolStore.addTeacher({
      id: `tch-${Date.now()}`,
      staff_id: staffId,
      name: app.fullName,
      title: app.highestQualification || 'Faculty Instructor',
      email: app.email,
      department: app.positionTitle || 'Online Faculty',
      specialty: app.positionTitle || 'Online Faculty Instructor',
      portal_password: defaultPass,
      class_ids: [],
      created_at: new Date().toISOString(),
    })

    // Also register in eclat_local_credentials for immediate login
    try {
      const stored = JSON.parse(localStorage.getItem('eclat_local_credentials') || '{}')
      const cleanKey = staffId.toLowerCase().replace(/[^a-z0-9]/g, '')
      const profile = {
        id: `usr-${Date.now()}`,
        full_name: app.fullName,
        admission_number: staffId,
        role: 'teacher' as const,
        first_login_at: new Date().toISOString(),
        access_expires_at: null,
        is_active: true,
        created_at: new Date().toISOString(),
      }
      stored[cleanKey] = {
        id: profile.id,
        admission_number: staffId,
        email: app.email,
        password: defaultPass,
        full_name: app.fullName,
        role: 'teacher',
        profile,
      }
      localStorage.setItem('eclat_local_credentials', JSON.stringify(stored))
    } catch {}

    cloudServicesStore.updateCareerApplicationStatus(app.id, 'Hired & Onboarded')
    showToast(`✓ Onboarded ${app.fullName} as Teacher! Staff ID: ${staffId} | Password: ${defaultPass}`)
  }

  const handleSaveManualDonation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!donDonorName.trim() || donAmount <= 0) return
    const ref = `SPON-${Date.now().toString().slice(-6)}`
    cloudServicesStore.addDonationRecord({
      id: ref,
      reference: ref,
      amount: Number(donAmount),
      currency: donCurrency,
      donorName: donDonorName.trim(),
      donorEmail: donDonorEmail.trim() || 'sponsor@eclat.institute',
      donorPhone: donDonorPhone.trim(),
      track: donTrack,
      message: donStudentName ? `Allocated to ${donStudentName} (${donStudentAdm})` : 'Recorded by Admin Desk',
      timestamp: new Date().toISOString(),
      allocatedStudentName: donStudentName.trim() || undefined,
      allocatedStudentAdmNo: donStudentAdm.trim() || undefined,
      status: donStudentName.trim() ? 'Allocated to Student' : 'Verified',
    })
    setDonationModalOpen(false)
    setDonDonorName('')
    setDonDonorEmail('')
    setDonDonorPhone('')
    setDonStudentName('')
    setDonStudentAdm('')
    showToast(`✓ Recorded Sponsorship (${donCurrency} ${donAmount}) — Ref: ${ref}`)
  }

  const totalUsdDonations = donations
    .filter((d) => d.currency === 'USD')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
  const totalKesDonations = donations
    .filter((d) => d.currency === 'KES')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)

  return (
    <PageWrapper
      title="Cloud & Services Administration Hub"
      subtitle="Manage Course Publishing & Monetization (50% Share), Hire Eclat Tech Services, Careers & Faculty, Student Sponsorships, and Partner School Cloud."
      action={
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin')}>
            ← Back to Admin Dashboard
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              cloudServicesStore.pushToCloud()
              showToast('☁️ Cloud & Services synchronized to live database!')
            }}
          >
            ☁️ Sync Cloud Services
          </Button>
        </div>
      }
    >
      {toastMsg && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1.5px solid #10b981',
            color: '#065f46',
            padding: '0.85rem 1.15rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            fontWeight: 800,
            fontSize: '0.88rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900, color: '#065f46' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Executive Control Banner: Public Navbar Visibility & Direct Service Launchers */}
      <div
        className="card mb-6"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #1e3a8a 100%)',
          color: '#ffffff',
          border: 'none',
        }}
      >
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(167, 139, 250, 0.2)', border: '1px solid rgba(167, 139, 250, 0.4)', padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, color: '#ddd6fe', marginBottom: '6px' }}>
                🏛️ INSTITUTIONAL CLOUD & SERVICES CONTROL DESK
              </div>
              <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>
                Manage All 4 Cloud & Services Portals + Multi-Tenant School Cloud
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.82)', margin: '4px 0 0', fontSize: '0.82rem' }}>
                All Cloud & Services modules are managed here in the Admin Portal. You can also launch each portal directly or control whether the dropdown appears on the public homepage.
              </p>
            </div>

            {/* Public Navbar Visibility Toggle */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>
                  Public Homepage &ldquo;Cloud &amp; Services&rdquo; Menu
                </div>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                  {config.showInPublicNavbar
                    ? 'Currently visible on public website header'
                    : 'Managed in Admin Portal Only (Hidden from public navbar)'}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggleConfig(
                    { showInPublicNavbar: !config.showInPublicNavbar },
                    config.showInPublicNavbar
                      ? 'Cloud & Services hidden from public navbar (Admin Portal Only)'
                      : 'Cloud & Services enabled on public homepage navbar'
                  )
                }
                style={{
                  background: config.showInPublicNavbar ? '#10b981' : '#475569',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {config.showInPublicNavbar ? '● Public Visible' : '🔒 Admin Portal Only'}
              </button>
            </div>
          </div>

          {/* 4 Service Cards matching the Cloud & Services Menu + Partner School Cloud */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {/* 1. Publish Course & Monetize */}
            <div
              onClick={() => setActiveTab('publish')}
              style={{
                background: activeTab === 'publish' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: activeTab === 'publish' ? '2px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '12px',
                padding: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '5px 8px', borderRadius: '8px', fontSize: '0.9rem' }}>⭐</span>
                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.68rem', fontWeight: 900, padding: '2px 7px', borderRadius: '6px' }}>
                  {config.defaultTutorRevenueSplitPct}% Share
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>Publish Course &amp; Monetize</div>
              <div style={{ fontSize: '0.73rem', color: '#cbd5e1', marginTop: '2px' }}>
                {tutorCourses.length} Published Tutor Courses
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/publish-course')
                  }}
                  style={{ background: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Open Publisher ↗
                </button>
              </div>
            </div>

            {/* 2. Hire Eclat Tech Services */}
            <div
              onClick={() => setActiveTab('hire')}
              style={{
                background: activeTab === 'hire' ? 'rgba(59, 130, 246, 0.28)' : 'rgba(255, 255, 255, 0.08)',
                border: activeTab === 'hire' ? '2px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '12px',
                padding: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '5px 8px', borderRadius: '8px', fontSize: '0.9rem' }}>💻</span>
                <span style={{ background: 'rgba(96, 165, 250, 0.25)', color: '#bfdbfe', fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px' }}>
                  {techServices.length} Services • {hireInquiries.length} Quotes
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>Hire Eclat Tech Services</div>
              <div style={{ fontSize: '0.73rem', color: '#cbd5e1', marginTop: '2px' }}>
                Custom web dev, apps &amp; data analytics
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/hire')
                  }}
                  style={{ background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Open Tech Page ↗
                </button>
              </div>
            </div>

            {/* 3. Careers & Faculty */}
            <div
              onClick={() => setActiveTab('careers')}
              style={{
                background: activeTab === 'careers' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: activeTab === 'careers' ? '2px solid #4ade80' : '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '12px',
                padding: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)', padding: '5px 8px', borderRadius: '8px', fontSize: '0.9rem' }}>🎓</span>
                <span style={{ background: 'rgba(74, 222, 128, 0.25)', color: '#bbf7d0', fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px' }}>
                  {jobPositions.filter((j) => j.urgency !== 'Closed').length} Roles • {careerApps.length} Apps
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>Careers &amp; Faculty</div>
              <div style={{ fontSize: '0.73rem', color: '#cbd5e1', marginTop: '2px' }}>
                Online teaching &amp; operations recruitment
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/careers')
                  }}
                  style={{ background: '#22c55e', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Open Careers Page ↗
                </button>
              </div>
            </div>

            {/* 4. Sponsor a Student / Donate */}
            <div
              onClick={() => setActiveTab('donate')}
              style={{
                background: activeTab === 'donate' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: activeTab === 'donate' ? '2px solid #34d399' : '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '12px',
                padding: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ background: 'linear-gradient(135deg, #10b981, #047857)', padding: '5px 8px', borderRadius: '8px', fontSize: '0.9rem' }}>💚</span>
                <span style={{ background: 'rgba(52, 211, 153, 0.25)', color: '#a7f3d0', fontSize: '0.68rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px' }}>
                  ${totalUsdDonations.toLocaleString()} • {donations.length} Grants
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>Sponsor a Student / Donate</div>
              <div style={{ fontSize: '0.73rem', color: '#cbd5e1', marginTop: '2px' }}>
                Empower underprivileged learners &amp; classrooms
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/donate')
                  }}
                  style={{ background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Open Sponsorship Page ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'overview', label: '⚙️ Overview & Menu Settings' },
          { id: 'publish', label: `⭐ Publish Course & Monetize (${tutorCourses.length})` },
          { id: 'hire', label: `💻 Hire Tech Services (${techServices.length} Services / ${hireInquiries.length} Quotes)` },
          { id: 'careers', label: `🎓 Careers & Faculty (${jobPositions.length} Roles / ${careerApps.length} Apps)` },
          { id: 'donate', label: `💚 Sponsor / Donate (${donations.length})` },
          { id: 'schools', label: `🏫 Partner Schools Cloud (${partnerSchools.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as CloudTab)}
            className="btn btn-sm"
            style={{
              background: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
              color: activeTab === t.id ? '#ffffff' : 'var(--color-text)',
              fontWeight: 800,
              border: activeTab === t.id ? 'none' : '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '0.5rem 0.95rem',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 0: OVERVIEW & MENU SETTINGS */}
      {activeTab === 'overview' && (
        <div className="grid grid-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0 }}>🏛️ Cloud &amp; Services Visibility &amp; Revenue Configuration</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <div>
                  <div className="font-bold text-sm">Show &ldquo;Cloud &amp; Services&rdquo; Dropdown on Public Navbar</div>
                  <div className="text-xs text-muted">
                    When disabled, Cloud &amp; Services is managed strictly inside this Admin Portal.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showInPublicNavbar}
                  onChange={(e) => handleToggleConfig({ showInPublicNavbar: e.target.checked }, 'Public Navbar Visibility')}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <div>
                  <div className="font-bold text-sm">Enable &ldquo;Publish Course &amp; Monetize&rdquo; Module</div>
                  <div className="text-xs text-muted">Allow tutors and partner academies to publish courses &amp; earn revenue split.</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enablePublishCourse}
                  onChange={(e) => handleToggleConfig({ enablePublishCourse: e.target.checked }, 'Publish Course Module')}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <div>
                  <div className="font-bold text-sm">Enable &ldquo;Hire Eclat Tech Services&rdquo; Module</div>
                  <div className="text-xs text-muted">Custom web engineering, mobile apps, POS accounting &amp; data science quotes.</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableHireServices}
                  onChange={(e) => handleToggleConfig({ enableHireServices: e.target.checked }, 'Hire Eclat Tech Services Module')}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <div>
                  <div className="font-bold text-sm">Enable &ldquo;Careers &amp; Faculty&rdquo; Recruitment Portal</div>
                  <div className="text-xs text-muted">Display open teaching positions and accept online faculty applications.</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableCareers}
                  onChange={(e) => handleToggleConfig({ enableCareers: e.target.checked }, 'Careers & Faculty Portal')}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <div>
                  <div className="font-bold text-sm">Enable &ldquo;Sponsor a Student / Donate&rdquo; Foundation Portal</div>
                  <div className="text-xs text-muted">Accept student scholarship sponsorships and educational grants.</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableDonations}
                  onChange={(e) => handleToggleConfig({ enableDonations: e.target.checked }, 'Sponsor a Student / Donate Portal')}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div className="grid grid-2 gap-4 pt-2">
                <div>
                  <label className="form-label text-xs font-bold">Default Individual Tutor Split (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={90}
                    className="form-input"
                    value={config.defaultTutorRevenueSplitPct}
                    onChange={(e) =>
                      handleToggleConfig(
                        {
                          defaultTutorRevenueSplitPct: Number(e.target.value) || 50,
                          publishCourseBadge: `${Number(e.target.value) || 50}% Share`,
                        },
                        'Default Tutor Revenue Split'
                      )
                    }
                  />
                </div>
                <div>
                  <label className="form-label text-xs font-bold">Default Partner School Split (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={95}
                    className="form-input"
                    value={config.defaultSchoolRevenueSplitPct}
                    onChange={(e) =>
                      handleToggleConfig({ defaultSchoolRevenueSplitPct: Number(e.target.value) || 70 }, 'Default Partner School Split')
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0 }}>🚀 Quick Module Management &amp; Live Routes</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                {
                  title: 'Publish Course & Monetize',
                  desc: 'Manage tutor/school courses, revenue splits (50%/70%), and payout disbursements.',
                  tab: 'publish' as CloudTab,
                  route: '/publish-course',
                  badge: `${tutorCourses.length} Courses`,
                },
                {
                  title: 'Hire Eclat Tech Services',
                  desc: 'Edit the 10 enterprise tech service offerings and respond to client quote requests.',
                  tab: 'hire' as CloudTab,
                  route: '/hire',
                  badge: `${hireInquiries.length} Inquiries`,
                },
                {
                  title: 'Careers & Faculty Recruitment',
                  desc: 'Post faculty vacancies, review teacher applications, and 1-click onboard new teachers.',
                  tab: 'careers' as CloudTab,
                  route: '/careers',
                  badge: `${careerApps.length} Applicants`,
                },
                {
                  title: 'Sponsor a Student / Donate',
                  desc: 'Track donor grants, record offline sponsorships, and allocate scholarships to students.',
                  tab: 'donate' as CloudTab,
                  route: '/donate',
                  badge: `$${totalUsdDonations.toLocaleString()} Raised`,
                },
                {
                  title: 'Multi-Tenant Partner Schools Cloud',
                  desc: 'Manage partner academies hosted on Eclat Cloud (/s/:schoolSlug).',
                  tab: 'schools' as CloudTab,
                  route: '/register-school',
                  badge: `${partnerSchools.length} Schools`,
                },
              ].map((m) => (
                <div
                  key={m.title}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-bold text-sm">{m.title}</span>
                      <span className="badge badge-primary">{m.badge}</span>
                    </div>
                    <div className="text-xs text-muted mt-1">{m.desc}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => setActiveTab(m.tab)}>
                      Manage
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(m.route)}>
                      View Page ↗
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PUBLISH COURSE & MONETIZE */}
      {activeTab === 'publish' && (
        <div className="card">
          <div className="card-header flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 style={{ margin: 0 }}>⭐ Publish Course &amp; Monetize — Tutor &amp; Partner School Courses</h3>
              <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                Approve tutor courses, adjust revenue share splits ({config.defaultTutorRevenueSplitPct}% Tutor / {config.defaultSchoolRevenueSplitPct}% Partner School), and manage payout settings.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="accent" size="sm" onClick={() => navigate('/teacher/courses/new')}>
                + Build Official Course Unit
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/publish-course')}>
                + Launch Course Publisher (/publish-course) ↗
              </Button>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course Title &amp; Category</th>
                  <th>Provider / Instructor</th>
                  <th>Delivery Mode</th>
                  <th>Tuition Fee</th>
                  <th>Revenue Share</th>
                  <th>Payout Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tutorCourses.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                      No external tutor or partner school courses submitted yet. Click <strong>+ Launch Course Publisher</strong> above to publish and monetize a course.
                    </td>
                  </tr>
                ) : (
                  tutorCourses.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="font-bold">{c.courseTitle}</div>
                        <div className="text-xs text-muted">{c.category}</div>
                      </td>
                      <td>
                        <div className="font-semibold text-sm">{c.institutionName || c.tutorName}</div>
                        <div className="text-xs text-muted">
                          {c.providerType === 'partner_institution' ? '🏫 Partner School' : '👩‍🏫 Individual Tutor'} • {c.email}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">
                          {c.deliveryMode === 'live_cohort' ? '🎥 Live Cohort' : '⚡ Self-Paced'}
                        </span>
                      </td>
                      <td className="font-bold">${c.suggestedPriceUsd} USD</td>
                      <td>
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem' }}>
                          {c.payoutSplitPct || 50}% Creator Share
                        </span>
                      </td>
                      <td className="text-xs">
                        <div className="font-semibold">{(c.payoutMethod || 'mpesa').toUpperCase()} ({c.payoutSchedule || 'monthly'})</div>
                        <div className="text-muted">{c.payoutDetails}</div>
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'Approved & Live' ? 'badge-success' : 'badge-warning'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const nextStatus = c.status === 'Approved & Live' ? 'Paused' : 'Approved & Live'
                              cloudServicesStore.savePublishedTutorCourse({ ...c, status: nextStatus })
                              showToast(`Updated "${c.courseTitle}" status to ${nextStatus}`)
                            }}
                          >
                            {c.status === 'Approved & Live' ? 'Pause' : 'Approve'}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              cloudServicesStore.deletePublishedTutorCourse(c.id)
                              showToast(`Removed course "${c.courseTitle}"`)
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HIRE ECLAT TECH SERVICES */}
      {activeTab === 'hire' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Client Quote Inquiries Table */}
          <div className="card">
            <div className="card-header flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 style={{ margin: 0 }}>📩 Client Tech Service &amp; Quote Inquiries ({hireInquiries.length})</h3>
                <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                  Incoming software engineering, mobile app, POS accounting, and data analytics quote requests from clients.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/hire')}>
                Open Public /hire Page ↗
              </Button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Client &amp; Company</th>
                    <th>Requested Service</th>
                    <th>Budget &amp; Timeline</th>
                    <th>Project Requirements</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hireInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No client quote requests submitted yet. Inquiries from <code>/hire</code> appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    hireInquiries.map((inq) => (
                      <tr key={inq.id}>
                        <td>
                          <div className="font-bold">{inq.name}</div>
                          <div className="text-xs text-muted">{inq.company || 'Private Client'}</div>
                          <div className="text-xs">{inq.email} • {inq.phone}</div>
                        </td>
                        <td className="font-semibold text-sm">{inq.serviceCategory}</td>
                        <td className="text-xs">
                          <div className="font-bold text-primary">{inq.budget}</div>
                          <div className="text-muted">{inq.timeline}</div>
                        </td>
                        <td className="text-xs" style={{ maxWidth: '280px' }}>{inq.description}</td>
                        <td className="text-xs text-muted">{formatDate(inq.submittedAt)}</td>
                        <td>
                          <select
                            className="form-select text-xs"
                            value={inq.status}
                            onChange={(e) => {
                              cloudServicesStore.updateHireInquiryStatus(inq.id, e.target.value as HireInquiryItem['status'])
                              showToast(`Updated inquiry status for ${inq.name}`)
                            }}
                          >
                            <option value="New Inquiry">New Inquiry</option>
                            <option value="Quote Sent">Quote Sent</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {inq.phone && (
                              <a
                                href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${inq.name}, this is Eclat Institute Enterprise Engineering regarding your project inquiry (${inq.serviceCategory}).`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-primary"
                                style={{ textDecoration: 'none' }}
                              >
                                WhatsApp
                              </a>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                cloudServicesStore.deleteHireInquiry(inq.id)
                                showToast('Inquiry deleted')
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tech Services Catalog Management */}
          <div className="card">
            <div className="card-header flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 style={{ margin: 0 }}>💻 Enterprise Tech Service Offerings ({techServices.length})</h3>
                <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                  Add, edit, or remove service packages displayed on the Hire Eclat Tech Services portal.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => openAddServiceModal()}>
                + Add New Tech Service
              </Button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Service Title</th>
                    <th>Category &amp; Badge</th>
                    <th>Delivery Timeline</th>
                    <th>Technologies</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {techServices.map((svc) => (
                    <tr key={svc.id}>
                      <td>
                        <div className="font-bold">{svc.title}</div>
                        <div className="text-xs text-muted" style={{ maxWidth: '360px' }}>{svc.tagline}</div>
                      </td>
                      <td>
                        <div className="font-semibold text-xs">{svc.category}</div>
                        <span className="badge badge-primary">{svc.badge}</span>
                      </td>
                      <td className="text-xs font-semibold">{svc.timeline}</td>
                      <td className="text-xs" style={{ maxWidth: '240px' }}>
                        {svc.technologies.slice(0, 5).join(', ')}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openAddServiceModal(svc)}>
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              cloudServicesStore.deleteTechService(svc.id)
                              showToast(`Removed service "${svc.title}"`)
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CAREERS & FACULTY RECRUITMENT */}
      {activeTab === 'careers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Submitted Faculty & Staff Applications */}
          <div className="card">
            <div className="card-header flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 style={{ margin: 0 }}>👩‍🏫 Faculty &amp; Staff Job Applications ({careerApps.length})</h3>
                <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                  Review candidate applications submitted from <code>/careers</code> and onboard approved instructors into the Faculty Directory with 1 click.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/careers')}>
                Open Public /careers Page ↗
              </Button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Applicant Name &amp; Contact</th>
                    <th>Applied Position</th>
                    <th>Qualification &amp; Exp.</th>
                    <th>Portfolio / Summary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {careerApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No faculty job applications received yet. Applications submitted at <code>/careers</code> appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    careerApps.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div className="font-bold">{app.fullName}</div>
                          <div className="text-xs">{app.email} • {app.phone}</div>
                          <div className="text-xs text-muted">{app.country}</div>
                        </td>
                        <td className="font-semibold text-sm">{app.positionTitle || app.positionId}</td>
                        <td className="text-xs">
                          <div className="font-bold">{app.highestQualification}</div>
                          <div className="text-muted">{app.experienceYears}</div>
                        </td>
                        <td className="text-xs" style={{ maxWidth: '260px' }}>
                          {app.portfolioUrl && (
                            <div>
                              <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-bold">
                                View CV / Portfolio ↗
                              </a>
                            </div>
                          )}
                          <div className="text-muted">{app.teachingPhilosophy}</div>
                        </td>
                        <td>
                          <select
                            className="form-select text-xs"
                            value={app.status}
                            onChange={(e) => {
                              cloudServicesStore.updateCareerApplicationStatus(app.id, e.target.value as CareerApplicationItem['status'])
                              showToast(`Updated application status for ${app.fullName}`)
                            }}
                          >
                            <option value="Pending Review">Pending Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Hired & Onboarded">Hired &amp; Onboarded</option>
                            <option value="Declined">Declined</option>
                          </select>
                        </td>
                        <td>
                          <div className="flex gap-2 flex-wrap">
                            {app.status !== 'Hired & Onboarded' && (
                              <Button variant="primary" size="sm" onClick={() => handleOnboardApplicant(app)}>
                                ✓ Hire &amp; Issue Teacher ID
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                cloudServicesStore.deleteCareerApplication(app.id)
                                showToast('Application removed')
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Open Job Positions Table */}
          <div className="card">
            <div className="card-header flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 style={{ margin: 0 }}>📋 Published Faculty &amp; Operations Vacancies ({jobPositions.length})</h3>
                <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                  Post new teaching vacancies, update compensation packages, or close filled roles.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => openJobModal()}>
                + Post New Job Vacancy
              </Button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Ref Code</th>
                    <th>Role Title &amp; Faculty</th>
                    <th>Work Type</th>
                    <th>Compensation</th>
                    <th>Status / Urgency</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobPositions.map((pos) => (
                    <tr key={pos.id}>
                      <td className="font-mono text-xs font-bold">{pos.referenceCode}</td>
                      <td>
                        <div className="font-bold">{pos.title}</div>
                        <div className="text-xs text-muted">{pos.faculty} • {pos.department}</div>
                      </td>
                      <td className="text-xs">{pos.workType}</td>
                      <td className="text-xs" style={{ maxWidth: '240px' }}>{pos.compensation}</td>
                      <td>
                        <span className={`badge ${pos.urgency === 'Closed' ? 'badge-secondary' : pos.urgency === 'Immediate Intake' ? 'badge-danger' : 'badge-success'}`}>
                          {pos.urgency}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openJobModal(pos)}>
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              cloudServicesStore.deleteJobPosition(pos.id)
                              showToast(`Deleted vacancy "${pos.title}"`)
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SPONSOR A STUDENT / DONATE */}
      {activeTab === 'donate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid grid-3 gap-4">
            <div className="stat-card">
              <div className="stat-icon stat-icon-success">💵</div>
              <div>
                <div className="stat-value">${totalUsdDonations.toLocaleString()} USD</div>
                <div className="stat-label">Total USD Sponsorships</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-primary">💳</div>
              <div>
                <div className="stat-value">KES {totalKesDonations.toLocaleString()}</div>
                <div className="stat-label">Total KES Sponsorships</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-accent">🎓</div>
              <div>
                <div className="stat-value">{donations.length}</div>
                <div className="stat-label">Recorded Grants &amp; Donations</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 style={{ margin: 0 }}>💚 Student Sponsorship &amp; Foundation Donations Ledger</h3>
                <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                  Track online Paystack donations, record manual grants, and allocate scholarships to students.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={() => setDonationModalOpen(true)}>
                  + Record Sponsorship / Grant
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/donate')}>
                  Open Public /donate Page ↗
                </Button>
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Receipt Ref</th>
                    <th>Benefactor / Donor</th>
                    <th>Amount</th>
                    <th>Sponsorship Track</th>
                    <th>Allocated Student</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No sponsorship contributions recorded yet. Click <strong>+ Record Sponsorship / Grant</strong> to log a scholarship contribution.
                      </td>
                    </tr>
                  ) : (
                    donations.map((d) => (
                      <tr key={d.id || d.reference}>
                        <td className="font-mono text-xs font-bold">{d.reference}</td>
                        <td>
                          <div className="font-bold">{d.donorName}</div>
                          <div className="text-xs text-muted">{d.donorEmail} {d.donorPhone ? `• ${d.donorPhone}` : ''}</div>
                        </td>
                        <td className="font-bold text-success">
                          {d.currency} {Number(d.amount).toLocaleString()}
                        </td>
                        <td className="text-xs">{d.track}</td>
                        <td className="text-xs">
                          {d.allocatedStudentName ? (
                            <span className="badge badge-success">
                              🎓 {d.allocatedStudentName} ({d.allocatedStudentAdmNo})
                            </span>
                          ) : (
                            <span className="badge badge-secondary">Unallocated Pool</span>
                          )}
                        </td>
                        <td className="text-xs text-muted">{formatDate(d.timestamp)}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              cloudServicesStore.deleteDonationRecord(d.id || d.reference)
                              showToast('Donation record removed')
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MULTI-TENANT PARTNER SCHOOLS CLOUD */}
      {activeTab === 'schools' && (
        <div className="card">
          <div className="card-header flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 style={{ margin: 0 }}>🏫 Multi-Tenant Partner Schools Hosted on Eclat Cloud ({partnerSchools.length})</h3>
              <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                Manage external partner schools, academies, and colleges running dedicated portals on Eclat Cloud.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/register-school')}>
              + Register New Partner School ↗
            </Button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Institution Name</th>
                  <th>Portal URL Slug</th>
                  <th>Curriculum &amp; System</th>
                  <th>Principal / Dean</th>
                  <th>Students &amp; Staff</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {partnerSchools.map((sch) => (
                  <tr key={sch.id}>
                    <td>
                      <div className="font-bold">{sch.name}</div>
                      <div className="text-xs text-muted">{sch.city}, {sch.country}</div>
                    </td>
                    <td className="font-mono text-xs">
                      <a href={`/s/${sch.slug}`} className="text-primary font-bold">
                        /s/{sch.slug}
                      </a>
                    </td>
                    <td className="text-xs">
                      <div className="font-semibold">{sch.curriculum_type}</div>
                      <div className="text-muted">{sch.academic_system.toUpperCase()} Calendar</div>
                    </td>
                    <td className="text-xs">
                      <div className="font-semibold">{sch.principal_name}</div>
                      <div className="text-muted">{sch.contact_email}</div>
                    </td>
                    <td className="text-xs">
                      <strong>{sch.stats.students}</strong> Students • <strong>{sch.stats.teachers}</strong> Staff
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={() => navigate(`/s/${sch.slug}`)}>
                          Open School Hub ↗
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/s/${sch.slug}/principal`)}>
                          Principal Desk
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT TECH SERVICE */}
      <Modal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        title={editingService ? 'Edit Tech Service Package' : 'Add New Tech Service Package'}
      >
        <form onSubmit={handleSaveTechService} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Input label="Service Title *" value={svcTitle} onChange={(e) => setSvcTitle(e.target.value)} required placeholder="e.g. Custom Enterprise Web & Cloud Engineering" />
          <div className="grid grid-2 gap-3">
            <Input label="Category *" value={svcCategory} onChange={(e) => setSvcCategory(e.target.value)} required />
            <Input label="Highlight Badge" value={svcBadge} onChange={(e) => setSvcBadge(e.target.value)} placeholder="e.g. Flagship Service" />
          </div>
          <Input label="Tagline / Summary *" value={svcTagline} onChange={(e) => setSvcTagline(e.target.value)} required />
          <div className="grid grid-2 gap-3">
            <Input label="Delivery Timeline" value={svcTimeline} onChange={(e) => setSvcTimeline(e.target.value)} placeholder="e.g. 2 – 6 Weeks" />
            <Input label="Best Suited For" value={svcBestFor} onChange={(e) => setSvcBestFor(e.target.value)} />
          </div>
          <Textarea
            label="Key Deliverables (One per line)"
            rows={4}
            value={svcDeliverables}
            onChange={(e) => setSvcDeliverables(e.target.value)}
          />
          <Input
            label="Technologies (Comma separated)"
            value={svcTechnologies}
            onChange={(e) => setSvcTechnologies(e.target.value)}
            placeholder="React 19, Node.js, TypeScript, PostgreSQL"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setServiceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Tech Service
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD / EDIT JOB POSITION */}
      <Modal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        title={editingJob ? 'Edit Faculty / Staff Vacancy' : 'Post New Faculty / Staff Vacancy'}
      >
        <form onSubmit={handleSaveJobPosition} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="grid grid-2 gap-3">
            <Input label="Job Title *" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required placeholder="e.g. Senior Python & Data Science Lecturer" />
            <Input label="Reference Code *" value={jobRef} onChange={(e) => setJobRef(e.target.value)} required />
          </div>
          <div className="grid grid-2 gap-3">
            <div>
              <label className="form-label">Canonical Faculty</label>
              <select className="form-select" value={jobFaculty} onChange={(e) => setJobFaculty(e.target.value)}>
                <option value="School of Business">School of Business</option>
                <option value="School of IT and Data Science">School of IT and Data Science</option>
                <option value="School of Language">School of Language</option>
                <option value="School of British International Curriculum (IGCSE)">School of British International Curriculum (IGCSE)</option>
                <option value="Institutional Operations & Administration">Institutional Operations &amp; Administration</option>
              </select>
            </div>
            <Input label="Department" value={jobDept} onChange={(e) => setJobDept(e.target.value)} placeholder="e.g. Department of Data Science" />
          </div>
          <div className="grid grid-2 gap-3">
            <div>
              <label className="form-label">Work Arrangement</label>
              <select className="form-select" value={jobWorkType} onChange={(e) => setJobWorkType(e.target.value as JobPositionItem['workType'])}>
                <option value="100% Remote / Online">100% Remote / Online</option>
                <option value="Flexible Schedule">Flexible Schedule</option>
                <option value="Part-Time or Full-Time">Part-Time or Full-Time</option>
              </select>
            </div>
            <div>
              <label className="form-label">Hiring Status / Urgency</label>
              <select className="form-select" value={jobUrgency} onChange={(e) => setJobUrgency(e.target.value as JobPositionItem['urgency'])}>
                <option value="Immediate Intake">Immediate Intake</option>
                <option value="Open Application">Open Application</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <Input label="Compensation Package *" value={jobCompensation} onChange={(e) => setJobCompensation(e.target.value)} required />
          <Textarea label="Role Summary *" rows={2} value={jobSummary} onChange={(e) => setJobSummary(e.target.value)} required />
          <Textarea label="Responsibilities (One per line)" rows={3} value={jobResponsibilities} onChange={(e) => setJobResponsibilities(e.target.value)} />
          <Textarea label="Requirements (One per line)" rows={3} value={jobRequirements} onChange={(e) => setJobRequirements(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setJobModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Job Position
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: RECORD MANUAL SPONSORSHIP / DONATION */}
      <Modal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        title="Record Sponsorship Grant / Student Scholarship"
      >
        <form onSubmit={handleSaveManualDonation} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Input label="Sponsor / Benefactor Name *" value={donDonorName} onChange={(e) => setDonDonorName(e.target.value)} required placeholder="e.g. Global Education Trust / Dr. James K." />
          <div className="grid grid-2 gap-3">
            <Input label="Sponsor Email" type="email" value={donDonorEmail} onChange={(e) => setDonDonorEmail(e.target.value)} />
            <Input label="Sponsor Phone" value={donDonorPhone} onChange={(e) => setDonDonorPhone(e.target.value)} />
          </div>
          <div className="grid grid-2 gap-3">
            <div>
              <label className="form-label">Currency</label>
              <select className="form-select" value={donCurrency} onChange={(e) => setDonCurrency(e.target.value as 'USD' | 'KES')}>
                <option value="USD">USD ($)</option>
                <option value="KES">KES (KSh)</option>
              </select>
            </div>
            <Input
              label="Contribution Amount *"
              type="number"
              min={1}
              value={String(donAmount)}
              onChange={(e) => setDonAmount(Number(e.target.value) || 0)}
              required
            />
          </div>
          <div>
            <label className="form-label">Sponsorship Track</label>
            <select className="form-select" value={donTrack} onChange={(e) => setDonTrack(e.target.value)}>
              <option value="Physical Institutional Placement Fund">Physical Institutional Placement Fund</option>
              <option value="Vocational Bootcamp Sponsorship">Vocational Bootcamp Sponsorship</option>
              <option value="General Education Support Fund">General Education Support Fund</option>
            </select>
          </div>
          <div className="grid grid-2 gap-3">
            <Input label="Allocate to Student Name (Optional)" value={donStudentName} onChange={(e) => setDonStudentName(e.target.value)} placeholder="e.g. Grace Wanjiku" />
            <Input label="Student Admission No. (Optional)" value={donStudentAdm} onChange={(e) => setDonStudentAdm(e.target.value)} placeholder="e.g. EI-2026-014" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setDonationModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Record Sponsorship
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
