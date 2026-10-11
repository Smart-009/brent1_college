import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { ActiveTab } from '../layout/ErpSidebar'
import {
  StudentsIcon,
  StaffIcon,
  FinanceIcon,
  AcademicsIcon,
  AttendanceIcon,
  PlusIcon,
  PrintIcon,
} from '../common/Icons'

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void
  onOpenAdmissionModal: () => void
  onOpenFeeModal: () => void
  onViewReceipt: (paymentId: string) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenAdmissionModal,
  onOpenFeeModal,
  onViewReceipt,
}) => {
  const { activeSchool, students, staff, payments, payroll, currentUser } = useSchoolErp()

  // Computed metrics
  const totalStudents = students.length
  const totalStaff = staff.length
  const totalFeeCollected = payments.reduce((acc, p) => acc + p.amount, 0)
  const totalOutstanding = students.reduce((acc, s) => acc + s.feeBalance, 0)
  const totalMonthlyPayroll = payroll.reduce((acc, pr) => acc + pr.grossSalary, 0)

  const isStudent = currentUser?.role === 'student'
  const isTeacher = currentUser?.role === 'teacher'

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
            Welcome back, {currentUser?.name || 'Administrator'}
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            {activeSchool.name} • Academic Year {activeSchool.academicYear} • Active Session: <strong>{activeSchool.currentTerm}</strong>
          </p>
        </div>

        {/* Quick Action Buttons */}
        {!isStudent && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdmissionModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                }}
              >
                <PlusIcon size={16} />
                <span>Admit Student</span>
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.role === 'bursar') && (
              <button
                onClick={onOpenFeeModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(5,150,105,0.25)',
                }}
              >
                <FinanceIcon size={16} />
                <span>Collect Fee</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('attendance')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <AttendanceIcon size={16} />
              <span>Roll Call</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Card 1: Students */}
        <div
          onClick={() => !isStudent && setActiveTab('students')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            cursor: !isStudent ? 'pointer' : 'default',
            transition: 'transform 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Enrolled Students
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StudentsIcon size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{totalStudents}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
            ✓ 100% Active in {activeSchool.currentTerm}
          </div>
        </div>

        {/* Card 2: Staff */}
        {!isStudent && (
          <div
            onClick={() => !isTeacher && setActiveTab('staff')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: !isTeacher ? 'pointer' : 'default',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Academic & Support Staff
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StaffIcon size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{totalStaff}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Teachers, Bursars & Admin
            </div>
          </div>
        )}

        {/* Card 3: Fee Collections */}
        {!isTeacher && (
          <div
            onClick={() => setActiveTab('finance')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Total Fees Collected
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FinanceIcon size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {activeSchool.currency} {totalFeeCollected.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
              {payments.length} verified transactions
            </div>
          </div>
        )}

        {/* Card 4: Outstanding Fees */}
        {!isTeacher && (
          <div
            onClick={() => setActiveTab('finance')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Pending Fee Balance
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FinanceIcon size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e11d48' }}>
              {activeSchool.currency} {totalOutstanding.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Across all classes & streams
            </div>
          </div>
        )}

        {/* Card 5: Monthly Payroll (Admin/Bursar only) */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'bursar') && (
          <div
            onClick={() => setActiveTab('payroll')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Monthly Payroll Gross
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FinanceIcon size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {activeSchool.currency} {totalMonthlyPayroll.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600, marginTop: '4px' }}>
              PAYE & statutory deductions synced
            </div>
          </div>
        )}
      </div>

      {/* Main Content Split: Recent Collections & Notices */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left: Recent Fee Collections */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Recent Fee Collection Ledger
            </h3>
            <button
              onClick={() => setActiveTab('finance')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View All Payments →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Receipt No</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Class</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Method</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((pay) => (
                  <tr key={pay.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#2563eb' }}>{pay.receiptNo}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{pay.studentName}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{pay.className}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          backgroundColor: pay.paymentMethod === 'M-Pesa' ? '#dcfce7' : '#eff6ff',
                          color: pay.paymentMethod === 'M-Pesa' ? '#15803d' : '#1d4ed8',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      {activeSchool.currency} {pay.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => onViewReceipt(pay.id)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <PrintIcon size={14} />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: School Notices */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              School Noticeboard
            </h3>
            <button
              onClick={() => setActiveTab('notices')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All Notices →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                Term 1 Mid-Term Break Schedule
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
                School breaks on Friday 27th Feb at 12:30 PM. Academic Clinic consultations follow.
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                Published: 15 Feb 2026 • Office of the Principal
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                Fee Clearance for Mid-Term Exams
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
                All fee balances should be settled. Official stamped receipts can be printed online.
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                Published: 10 Feb 2026 • Bursar Desk
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
