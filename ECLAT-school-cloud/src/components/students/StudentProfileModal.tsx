import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { Student } from '../../types/schoolErp'
import { XIcon, PrintIcon, AcademicsIcon, FinanceIcon, UserIcon } from '../common/Icons'

interface StudentProfileModalProps {
  studentId: string
  onClose: () => void
  onOpenReportCard: (id: string) => void
  onOpenIdCard: (id: string) => void
  onOpenFeeStatement: (id: string) => void
  onOpenAdmissionSlip: (id: string) => void
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  studentId,
  onClose,
  onOpenReportCard,
  onOpenIdCard,
  onOpenFeeStatement,
  onOpenAdmissionSlip,
}) => {
  const { students, payments, exams, activeSchool, updateStudent } = useSchoolErp()
  const [activeTab, setActiveTab] = useState<'profile' | 'fees' | 'grades'>('profile')

  const student = students.find((s) => s.id === studentId) || students[0]
  const studentPayments = payments.filter((p) => p.studentId === student.id)
  const studentExams = exams.filter((e) => e.studentId === student.id)

  const handleStatusToggle = (newStatus: Student['status']) => {
    updateStudent(student.id, { status: newStatus })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: student.gender === 'Female' ? '#db2777' : '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                border: '3px solid #ffffff',
              }}
            >
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{student.fullName}</h2>
                <span
                  style={{
                    backgroundColor: student.status === 'Active' ? '#15803d' : '#b91c1c',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                  }}
                >
                  {student.status}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '3px' }}>
                {student.admissionNo} • {student.className} ({student.stream}) • Enrolled: {student.enrollmentDate}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                border: 'none',
                backgroundColor: activeTab === 'profile' ? '#2563eb' : 'transparent',
                color: activeTab === 'profile' ? '#ffffff' : '#64748b',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Student Details
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              style={{
                border: 'none',
                backgroundColor: activeTab === 'fees' ? '#2563eb' : 'transparent',
                color: activeTab === 'fees' ? '#ffffff' : '#64748b',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Fee Ledger ({studentPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              style={{
                border: 'none',
                backgroundColor: activeTab === 'grades' ? '#2563eb' : 'transparent',
                color: activeTab === 'grades' ? '#ffffff' : '#64748b',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Academic Records ({studentExams.length})
            </button>
          </div>

          {/* Quick Print Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onOpenIdCard(student.id)}
              style={{
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <PrintIcon size={14} />
              <span>Print Student ID Badge</span>
            </button>
            <button
              onClick={() => onOpenAdmissionSlip(student.id)}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <PrintIcon size={14} />
              <span>Admission Letter</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'profile' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                    Personal Particulars
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Date of Birth:</span>
                      <strong>{student.dateOfBirth}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Gender:</span>
                      <strong>{student.gender}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Blood Group:</span>
                      <strong>{student.bloodGroup || 'O+'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Medical Remarks:</span>
                      <strong style={{ color: '#d97706' }}>{student.medicalNotes || 'None'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                    Parent / Guardian Contact
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Guardian Name:</span>
                      <strong>{student.guardianName} ({student.guardianRelation || 'Parent'})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Mobile Number:</span>
                      <strong>{student.guardianPhone}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Email Address:</span>
                      <strong>{student.guardianEmail}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Emergency Contact:</span>
                      <strong>Verified & SMS Enabled</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Enrollment Status Management:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleStatusToggle('Active')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: student.status === 'Active' ? '#dcfce7' : '#f8fafc',
                      color: student.status === 'Active' ? '#15803d' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Active Enrolled
                  </button>
                  <button
                    onClick={() => handleStatusToggle('Suspended')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: student.status === 'Suspended' ? '#fee2e2' : '#f8fafc',
                      color: student.status === 'Suspended' ? '#b91c1c' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Suspended
                  </button>
                  <button
                    onClick={() => handleStatusToggle('Alumni')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: student.status === 'Alumni' ? '#eff6ff' : '#f8fafc',
                      color: student.status === 'Alumni' ? '#1d4ed8' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Graduated / Alumni
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Billed:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{activeSchool.currency} {student.totalFeeBilled.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Paid:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>{activeSchool.currency} {student.totalFeePaid.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Outstanding Balance:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: student.feeBalance === 0 ? '#059669' : '#e11d48' }}>
                    {activeSchool.currency} {student.feeBalance.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => onOpenFeeStatement(student.id)}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Print Fee Statement
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Receipt No</th>
                    <th style={{ padding: '8px 12px' }}>Date</th>
                    <th style={{ padding: '8px 12px' }}>Method</th>
                    <th style={{ padding: '8px 12px' }}>Ref</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {studentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                        No fee payment transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    studentPayments.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#2563eb' }}>{p.receiptNo}</td>
                        <td style={{ padding: '8px 12px' }}>{p.date}</td>
                        <td style={{ padding: '8px 12px' }}>{p.paymentMethod}</td>
                        <td style={{ padding: '8px 12px', color: '#64748b' }}>{p.reference}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          {activeSchool.currency} {p.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'grades' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>
                  Continuous Assessment Performance Record
                </h4>
                <button
                  onClick={() => onOpenReportCard(student.id)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Generate Official Report Card
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Subject</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Opener (30)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Midterm (30)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Endterm (40)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Total (100)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentExams.map((ex) => (
                    <tr key={ex.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{ex.subject}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{ex.opener}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{ex.midterm}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{ex.endterm}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800 }}>{ex.total}%</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: '#1d4ed8' }}>
                        {ex.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
