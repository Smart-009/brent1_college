import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { cloudServicesStore } from '@/lib/cloudServicesStore'
import { getPublisherAnalytics, PublisherSummaryReport, PublisherCourseAnalytics, EnrolledLearnerRecord } from '@/lib/publisherAnalytics'
import { INSTITUTION_CONFIG, getWhatsAppInquiryUrl } from '@/config/institution'

export function PublisherPortal() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [selectedPublisherKey, setSelectedPublisherKey] = useState<string>('')
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all')
  const [learnerSearchQuery, setLearnerSearchQuery] = useState<string>('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'cleared' | 'pending'>('all')
  const [activeTab, setActiveTab] = useState<'courses' | 'learners' | 'payouts'>('courses')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Listen to store updates
  useEffect(() => {
    return cloudServicesStore.subscribe(() => {
      setRefreshTrigger((prev) => prev + 1)
    })
  }, [])

  // Analytics computation
  const { publishers, instituteTotals } = useMemo(() => {
    return getPublisherAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  // Determine current active publisher
  useEffect(() => {
    if (publishers.length > 0 && !selectedPublisherKey) {
      // Check query param first
      const queryPub = searchParams.get('publisher')
      if (queryPub) {
        const match = publishers.find((p) => p.publisherKey.includes(queryPub.toLowerCase()) || p.displayName.toLowerCase().includes(queryPub.toLowerCase()))
        if (match) {
          setSelectedPublisherKey(match.publisherKey)
          return
        }
      }
      // Check if logged in user matches a publisher
      if (profile) {
        const userMatch = publishers.find(
          (p) =>
            p.email?.toLowerCase() === profile.admission_number?.toLowerCase() ||
            p.displayName?.toLowerCase() === profile.full_name?.toLowerCase() ||
            p.publisherKey.includes(profile.full_name?.toLowerCase() || '')
        )
        if (userMatch) {
          setSelectedPublisherKey(userMatch.publisherKey)
          return
        }
      }
      // Default to first publisher or 'all' if admin
      setSelectedPublisherKey(publishers[0].publisherKey)
    }
  }, [publishers, profile, searchParams, selectedPublisherKey])

  // Current active publisher report
  const currentPublisher: PublisherSummaryReport | undefined = useMemo(() => {
    return publishers.find((p) => p.publisherKey === selectedPublisherKey) || publishers[0]
  }, [publishers, selectedPublisherKey])

  // Filtered courses
  const displayedCourses: PublisherCourseAnalytics[] = useMemo(() => {
    if (!currentPublisher) return []
    if (selectedCourseFilter === 'all') return currentPublisher.courses
    return currentPublisher.courses.filter((c) => c.courseId === selectedCourseFilter)
  }, [currentPublisher, selectedCourseFilter])

  // Flattened learners
  const allLearners: EnrolledLearnerRecord[] = useMemo(() => {
    if (!currentPublisher) return []
    const list: EnrolledLearnerRecord[] = []
    currentPublisher.courses.forEach((c) => {
      if (selectedCourseFilter === 'all' || c.courseId === selectedCourseFilter) {
        c.learners.forEach((l) => list.push(l))
      }
    })
    return list
  }, [currentPublisher, selectedCourseFilter])

  // Filtered learners
  const filteredLearners = useMemo(() => {
    return allLearners.filter((l) => {
      const q = learnerSearchQuery.toLowerCase()
      const matchesSearch =
        l.name.toLowerCase().includes(q) ||
        l.admissionNumber.toLowerCase().includes(q) ||
        l.enrolledCourseTitle.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q)

      const matchesStatus =
        paymentStatusFilter === 'all'
          ? true
          : paymentStatusFilter === 'cleared'
          ? l.isCleared
          : !l.isCleared

      return matchesSearch && matchesStatus
    })
  }, [allLearners, learnerSearchQuery, paymentStatusFilter])

  const isAdmin = profile?.role === 'admin'

  return (
    <PageWrapper
      title="Course Publisher & Revenue Portal"
      subtitle="Follow up with enrolled students, track tuition revenue, monitor pending installment balances, and review royalty payouts."
      action={
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => navigate(isAdmin ? '/admin' : '/teacher')}>
            ← {isAdmin ? 'Back to Admin Portal' : 'Back to Teacher Dashboard'}
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/publish-course')} style={{ fontWeight: 800 }}>
            + Publish New Course ↗
          </Button>
        </div>
      }
    >
      {/* Publisher Account Header & Switcher */}
      <div
        className="card mb-6"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)',
          color: '#ffffff',
          border: '1px solid #334155',
          borderRadius: '16px',
        }}
      >
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)',
                }}
              >
                {currentPublisher?.providerType === 'partner_institution' ? '🏫' : '👩‍🏫'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                    {currentPublisher?.displayName || 'Course Publisher'}
                  </span>
                  <span
                    style={{
                      background: 'rgba(20, 184, 166, 0.25)',
                      border: '1px solid rgba(20, 184, 166, 0.5)',
                      color: '#5eead4',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {currentPublisher?.providerType === 'partner_institution' ? 'Partner School / Academy' : 'Verified Tutor Publisher'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                  {currentPublisher?.email} {currentPublisher?.phone ? `• ${currentPublisher.phone}` : ''} • {currentPublisher?.totalCoursesCount || 0} Published Courses
                </div>
              </div>
            </div>

            {/* Publisher Switcher (if multiple or Admin) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {publishers.length > 1 && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '3px' }}>
                    {isAdmin ? 'SELECT PUBLISHER (ADMIN VIEW):' : 'SWITCH PUBLISHER ACCOUNT:'}
                  </div>
                  <select
                    className="input"
                    value={selectedPublisherKey}
                    onChange={(e) => setSelectedPublisherKey(e.target.value)}
                    style={{
                      background: '#1e293b',
                      color: '#ffffff',
                      borderColor: '#475569',
                      padding: '0.45rem 0.8rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      minWidth: '220px',
                    }}
                  >
                    {publishers.map((p) => (
                      <option key={p.publisherKey} value={p.publisherKey}>
                        {p.displayName} ({p.courses.length} courses)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards: Students, Revenue, Pending Balance, Publisher Earnings */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Metric 1: Total Enrolled Students */}
        <div className="card" style={{ borderLeft: '4px solid #3b82f6', background: '#f8faff' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                Enrolled Students
              </span>
              <span style={{ fontSize: '1.25rem' }}>👥</span>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1e3a8a' }}>
              {currentPublisher?.totalStudentsEnrolled || 0}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              Across {currentPublisher?.totalCoursesCount || 0} published courses
            </div>
          </div>
        </div>

        {/* Metric 2: Gross Tuition Revenue Generated */}
        <div className="card" style={{ borderLeft: '4px solid #10b981', background: '#f0fdf4' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>
                Gross Tuition Revenue
              </span>
              <span style={{ fontSize: '1.25rem' }}>💰</span>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#047857' }}>
              ${(currentPublisher?.totalRevenueGeneratedUsd || 0).toLocaleString()} USD
            </div>
            <div style={{ fontSize: '0.74rem', color: '#15803d', marginTop: '4px' }}>
              Paystack verified tuition receipts
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Balance (Outstanding Tuition) */}
        <div className="card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                Pending Student Balance
              </span>
              <span style={{ fontSize: '1.25rem' }}>⏳</span>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#b45309' }}>
              ${(currentPublisher?.totalPendingBalanceUsd || 0).toLocaleString()} USD
            </div>
            <div style={{ fontSize: '0.74rem', color: '#b45309', marginTop: '4px' }}>
              Uncollected installment fees
            </div>
          </div>
        </div>

        {/* Metric 4: Publisher Royalties / Net Earnings */}
        <div className="card" style={{ borderLeft: '4px solid #8b5cf6', background: '#faf5ff' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#5b21b6', textTransform: 'uppercase' }}>
                Publisher Royalty Earnings
              </span>
              <span style={{ fontSize: '1.25rem' }}>📈</span>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#6d28d9' }}>
              ${(currentPublisher?.totalPublisherEarningsUsd || 0).toLocaleString()} USD
            </div>
            <div style={{ fontSize: '0.74rem', color: '#7c3aed', marginTop: '4px' }}>
              Disbursed: ${(currentPublisher?.totalDisbursedUsd || 0).toLocaleString()} • Available: ${(currentPublisher?.availableBalanceUsd || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'courses' ? '#0f766e' : '#f1f5f9',
            color: activeTab === 'courses' ? '#ffffff' : '#334155',
            fontWeight: 800,
            borderRadius: '8px',
          }}
        >
          📖 My Published Courses ({currentPublisher?.courses.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('learners')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'learners' ? '#0f766e' : '#f1f5f9',
            color: activeTab === 'learners' ? '#ffffff' : '#334155',
            fontWeight: 800,
            borderRadius: '8px',
          }}
        >
          👥 Enrolled Students &amp; Balance Follow-Up ({allLearners.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'payouts' ? '#0f766e' : '#f1f5f9',
            color: activeTab === 'payouts' ? '#ffffff' : '#334155',
            fontWeight: 800,
            borderRadius: '8px',
          }}
        >
          💳 Payouts &amp; Disbursement History ({currentPublisher?.payouts.length || 0})
        </button>
      </div>

      {/* TAB 1: COURSES BREAKDOWN */}
      {activeTab === 'courses' && (
        <div className="card">
          <div className="card-header flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 style={{ margin: 0 }}>Courses Published by {currentPublisher?.displayName}</h3>
              <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                Follow up with enrolled trainee numbers, gross fee collections, pending balances, and creator revenue shares.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={() => navigate('/publish-course')}>
                + Publish Another Course Unit
              </Button>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course Unit &amp; Track</th>
                  <th>Tuition Fee</th>
                  <th>Enrolled Learners</th>
                  <th>Revenue Generated</th>
                  <th>Pending Balance</th>
                  <th>Publisher Share %</th>
                  <th>Net Creator Earnings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No published courses found. Click <strong>+ Publish Another Course Unit</strong> to upload syllabus and monetize!
                    </td>
                  </tr>
                ) : (
                  displayedCourses.map((c) => (
                    <tr key={c.courseId}>
                      <td>
                        <div className="font-bold text-sm" style={{ color: '#0f172a' }}>{c.courseTitle}</div>
                        <div className="text-xs text-muted">
                          {c.category} • <span style={{ color: '#0284c7', fontWeight: 700 }}>{c.deliveryMode === 'live_cohort' ? '🎥 Live Cohort' : '⚡ Self-Paced Masterclass'}</span>
                        </div>
                      </td>
                      <td className="font-bold">${c.suggestedPriceUsd} USD</td>
                      <td>
                        <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 9px', borderRadius: '6px', fontWeight: 800, fontSize: '0.82rem' }}>
                          👥 {c.enrolledStudentsCount} Learners
                        </span>
                      </td>
                      <td className="font-bold" style={{ color: '#16a34a' }}>
                        ${c.revenueGeneratedUsd.toLocaleString()} USD
                      </td>
                      <td>
                        {c.pendingBalanceUsd > 0 ? (
                          <span style={{ color: '#ea580c', fontWeight: 800, fontSize: '0.82rem' }}>
                            ${c.pendingBalanceUsd.toLocaleString()} USD Due
                          </span>
                        ) : (
                          <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.78rem' }}>
                            ✓ All Cleared
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem' }}>
                          {c.payoutSplitPct}% Share
                        </span>
                      </td>
                      <td className="font-bold" style={{ color: '#7c3aed' }}>
                        ${c.publisherEarningsUsd.toLocaleString()} USD
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            c.status === 'Approved & Live' ? 'badge-success' : c.status === 'Paused' ? 'badge-danger' : 'badge-warning'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                            onClick={() => {
                              setSelectedCourseFilter(c.courseId)
                              setActiveTab('learners')
                            }}
                          >
                            Follow Up Learners ({c.enrolledStudentsCount}) →
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                            onClick={() => navigate(`/student/courses/${c.courseId}`)}
                          >
                            Preview
                          </button>
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

      {/* TAB 2: ENROLLED STUDENTS & PENDING BALANCE FOLLOW-UP */}
      {activeTab === 'learners' && (
        <div className="card">
          <div className="card-header flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 style={{ margin: 0 }}>👥 Enrolled Students &amp; Balance Follow-Up ({filteredLearners.length})</h3>
              <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                Follow up directly with registered students on tuition fee clearance, learning progress, and academic mentorship.
              </p>
            </div>
            {/* Filter controls */}
            <div className="flex gap-2 flex-wrap items-center" style={{ width: '100%', maxWidth: '640px' }}>
              <select
                className="input"
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', flex: '1 1 180px', minWidth: '160px', maxWidth: '100%' }}
              >
                <option value="all">All Published Courses</option>
                {currentPublisher?.courses.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.courseTitle} ({c.enrolledStudentsCount})
                  </option>
                ))}
              </select>

              <select
                className="input"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', flex: '1 1 160px', minWidth: '150px', maxWidth: '100%' }}
              >
                <option value="all">All Payment Statuses</option>
                <option value="pending">⚠️ Pending Balances Only</option>
                <option value="cleared">✓ Fully Cleared Only</option>
              </select>

              <input
                type="text"
                className="input"
                placeholder="Search student by name, admission #, phone..."
                value={learnerSearchQuery}
                onChange={(e) => setLearnerSearchQuery(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', flex: '1 1 200px', minWidth: '180px', maxWidth: '100%' }}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student Name &amp; ID</th>
                  <th>Enrolled Course</th>
                  <th>Tuition Paid</th>
                  <th>Pending Balance</th>
                  <th>Payment Status</th>
                  <th>Enrolled Date</th>
                  <th>Follow-Up Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLearners.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No students found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredLearners.map((lrn) => (
                    <tr key={`${lrn.id}-${lrn.enrolledCourseId}`}>
                      <td>
                        <div className="font-bold text-sm" style={{ color: '#0f172a' }}>{lrn.name}</div>
                        <div className="text-xs text-muted" style={{ fontFamily: 'monospace' }}>
                          ID: {lrn.admissionNumber} • {lrn.email}
                        </div>
                      </td>
                      <td>
                        <div className="text-xs font-semibold" style={{ color: '#1e3a8a' }}>
                          {lrn.enrolledCourseTitle}
                        </div>
                      </td>
                      <td className="font-bold" style={{ color: '#16a34a' }}>
                        ${lrn.amountPaidUsd} USD
                      </td>
                      <td>
                        {lrn.pendingBalanceUsd > 0 ? (
                          <div style={{ color: '#ea580c', fontWeight: 800 }}>
                            ${lrn.pendingBalanceUsd} USD
                            <div style={{ fontSize: '0.68rem', color: '#c2410c' }}>Installment Due</div>
                          </div>
                        ) : (
                          <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.78rem' }}>
                            $0 (Cleared)
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${lrn.isCleared ? 'badge-success' : 'badge-warning'}`}>
                          {lrn.isCleared ? '✓ Fully Cleared' : '⏳ Balance Due'}
                        </span>
                      </td>
                      <td className="text-xs text-muted">
                        {lrn.enrolledAt ? new Date(lrn.enrolledAt).toLocaleDateString() : 'Active'}
                      </td>
                      <td>
                        <div className="flex gap-2 flex-wrap">
                          {lrn.phone && (
                            <a
                              href={getWhatsAppInquiryUrl(
                                `Hello ${lrn.name}! This is ${currentPublisher?.displayName} from ${INSTITUTION_CONFIG.name}. Follow up regarding your enrollment in ${lrn.enrolledCourseTitle}.${
                                  lrn.pendingBalanceUsd > 0
                                    ? ` Please note you have an outstanding fee balance of $${lrn.pendingBalanceUsd} USD.`
                                    : ' How are your lessons progressing?'
                                }`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm"
                              style={{
                                background: '#22c55e',
                                color: '#ffffff',
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                textDecoration: 'none',
                                fontWeight: 800,
                              }}
                            >
                              💬 WhatsApp
                            </a>
                          )}
                          {lrn.email && (
                            <a
                              href={`mailto:${lrn.email}?subject=Follow-Up: ${encodeURIComponent(lrn.enrolledCourseTitle)}&body=Hello ${encodeURIComponent(lrn.name)},%0D%0A%0D%0AThis is your course instructor following up on your learning progress in ${encodeURIComponent(lrn.enrolledCourseTitle)}.`}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '3px 8px', textDecoration: 'none' }}
                            >
                              ✉️ Email
                            </a>
                          )}
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

      {/* TAB 3: PAYOUTS & DISBURSEMENT HISTORY */}
      {activeTab === 'payouts' && (
        <div className="grid grid-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0 }}>💳 Payout Settings &amp; Banking Details</h3>
              <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                Your registered disbursement channel configured for automated or manual tuition payouts.
              </p>
            </div>
            <div className="card-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>PAYOUT REVENUE SPLIT:</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#7c3aed' }}>
                      {currentPublisher?.courses[0]?.payoutSplitPct || 50}% Creator Royalty
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>PAYOUT FREQUENCY:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      Monthly Automated Settlement
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>TOTAL DISBURSED TO DATE:</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#16a34a' }}>
                      ${(currentPublisher?.totalDisbursedUsd || 0).toLocaleString()} USD
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CURRENT AVAILABLE BALANCE:</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0284c7' }}>
                      ${(currentPublisher?.availableBalanceUsd || 0).toLocaleString()} USD
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, marginBottom: '6px' }}>
                  REGISTERED DISBURSEMENT METHOD:
                </div>
                <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 700 }}>
                  📱 M-Pesa Express / Bank Wire
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  Contact: {currentPublisher?.phone || currentPublisher?.email || 'Registered Instructor Phone'}
                </div>
              </div>

              <div style={{ marginTop: '1rem', background: '#ecfdf5', padding: '0.75rem', borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '0.76rem', color: '#065f46' }}>
                💡 <strong>Admin Verification Policy:</strong> All revenue share splits, payment clearances, and payout disbursements are managed directly by {INSTITUTION_CONFIG.name} administrative directorate.
              </div>
            </div>
          </div>

          {/* Recorded Payouts Table */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0 }}>📜 Recorded Disbursement Receipts ({currentPublisher?.payouts.length || 0})</h3>
              <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                Official institution disbursement receipts and settlement references.
              </p>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date &amp; Ref</th>
                    <th>Amount</th>
                    <th>Disbursement Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!currentPublisher?.payouts || currentPublisher.payouts.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No disbursements recorded yet. Payouts will appear here as soon as approved by the administration.
                      </td>
                    </tr>
                  ) : (
                    currentPublisher.payouts.map((po) => (
                      <tr key={po.id}>
                        <td>
                          <div className="font-bold text-xs" style={{ color: '#0f172a' }}>{new Date(po.disbursedAt).toLocaleDateString()}</div>
                          <div className="text-xs text-muted"><code>{po.referenceCode}</code></div>
                        </td>
                        <td className="font-bold" style={{ color: '#16a34a' }}>
                          ${po.amount} {po.currency || 'USD'}
                        </td>
                        <td className="text-xs">
                          <span style={{ fontWeight: 700 }}>{po.payoutMethod}</span>
                          {po.notes && <div className="text-muted">{po.notes}</div>}
                        </td>
                        <td>
                          <span className="badge badge-success">✓ {po.status}</span>
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
    </PageWrapper>
  )
}
