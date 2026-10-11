import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { PrintIcon, FinanceIcon, AcademicsIcon } from '../common/Icons'

interface StudentGuardianPortalViewProps {
  onOpenReportCard: (studentId: string) => void
  onOpenFeeStatement: (studentId: string) => void
  onOpenIdCard: (studentId: string) => void
}

export const StudentGuardianPortalView: React.FC<StudentGuardianPortalViewProps> = ({
  onOpenReportCard,
  onOpenFeeStatement,
  onOpenIdCard,
}) => {
  const { students, payments, exams, activeSchool, notices, timetable } = useSchoolErp()

  // Grab the first student or active student
  const student = students[0]
  const studentPayments = payments.filter((p) => p.studentId === student.id)
  const studentExams = exams.filter((e) => e.studentId === student.id)
  const classTimetable = timetable.filter((t) => t.className === student.className)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Student Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.6rem',
            }}
          >
            {student.fullName.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {student.fullName}
              </h1>
              <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                Active Enrolled
              </span>
            </div>
            <div style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px' }}>
              Admission No: <strong style={{ color: '#2563eb' }}>{student.admissionNo}</strong> • {student.className} ({student.stream}) • Guardian: {student.guardianName}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={() => onOpenReportCard(student.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <AcademicsIcon size={16} />
            <span>Terminal Report Card</span>
          </button>
          <button
            onClick={() => onOpenIdCard(student.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.6rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <PrintIcon size={16} />
            <span>Digital ID Badge</span>
          </button>
        </div>
      </div>

      {/* Split Cards: Fee Status & Academic Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Fee Statement Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Term Tuition & Fee Balance
            </h3>
            <button
              onClick={() => onOpenFeeStatement(student.id)}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Print Statement →
            </button>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Total Term Invoiced:</span>
              <strong style={{ fontSize: '0.9rem' }}>{activeSchool.currency} {student.totalFeeBilled.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Total Cleared:</span>
              <strong style={{ fontSize: '0.9rem', color: '#059669' }}>{activeSchool.currency} {student.totalFeePaid.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Outstanding Balance:</span>
              <strong style={{ fontSize: '1.2rem', color: student.feeBalance === 0 ? '#059669' : '#e11d48' }}>
                {activeSchool.currency} {student.feeBalance.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* M-Pesa Instructions Box */}
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#065f46' }}>
            <div style={{ fontWeight: 800, marginBottom: '2px' }}>📲 Pay Tuition via M-Pesa Paybill:</div>
            <div>Business No: <strong>400200</strong> • Account No: <strong>{student.admissionNo}</strong></div>
          </div>
        </div>

        {/* Academic Performance Summary */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Current Term Gradebook
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{activeSchool.currentTerm}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {studentExams.map((ex) => (
              <div
                key={ex.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ fontWeight: 600 }}>{ex.subject}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#64748b' }}>{ex.total}%</span>
                  <span style={{ fontWeight: 800, color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                    {ex.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Timetable for Student */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
          Weekly Classroom Timetable ({student.className})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          {classTimetable.map((slot) => (
            <div key={slot.id} style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{slot.day} • {slot.time}</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginTop: '2px' }}>{slot.subject}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{slot.teacherName} (📍 {slot.room})</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
