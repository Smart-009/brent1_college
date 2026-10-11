import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { XIcon, PrintIcon } from '../common/Icons'

interface PrintableReportCardProps {
  studentId: string
  onClose: () => void
}

export const PrintableReportCard: React.FC<PrintableReportCardProps> = ({ studentId, onClose }) => {
  const { students, exams, activeSchool } = useSchoolErp()

  const student = students.find((s) => s.id === studentId) || students[0]
  const studentExams = exams.filter((e) => e.studentId === student.id)

  const totalPoints = studentExams.reduce((acc, e) => acc + e.points, 0)
  const averageMarks = studentExams.length > 0 ? Math.round(studentExams.reduce((acc, e) => acc + e.total, 0) / studentExams.length) : 0

  let meanGrade = 'B'
  if (averageMarks >= 80) meanGrade = 'A'
  else if (averageMarks >= 75) meanGrade = 'A-'
  else if (averageMarks >= 70) meanGrade = 'B+'
  else if (averageMarks >= 65) meanGrade = 'B'
  else if (averageMarks >= 60) meanGrade = 'B-'
  else if (averageMarks >= 55) meanGrade = 'C+'
  else if (averageMarks >= 50) meanGrade = 'C'
  else meanGrade = 'D+'

  const handlePrint = () => {
    window.print()
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
        zIndex: 150,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Controls Toolbar (Hidden in print) */}
        <div
          className="no-print"
          style={{
            padding: '0.85rem 1.5rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 600 }}>
            <PrintIcon size={18} color="#38bdf8" />
            <span>Terminal Academic Report Card Preview</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <PrintIcon size={16} />
              <span>Print A4 Document</span>
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 0.65rem',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <XIcon size={16} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          id="printable-report"
          style={{
            padding: '2.5rem',
            color: '#0f172a',
            fontFamily: 'serif',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Official Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: activeSchool.crestColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.5rem',
                margin: '0 auto 0.75rem',
                border: '2px solid #0f172a',
              }}
            >
              {activeSchool.logoText}
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.04em', margin: '0 0 0.25rem', textTransform: 'uppercase' }}>
              {activeSchool.name}
            </h1>
            <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#475569', marginBottom: '0.35rem' }}>
              "{activeSchool.motto}"
            </div>
            <div style={{ fontSize: '0.8rem', color: '#334155' }}>
              {activeSchool.address} • Tel: {activeSchool.phone} • Email: {activeSchool.email}
            </div>
            <div style={{ marginTop: '0.75rem', display: 'inline-block', border: '1px solid #0f172a', padding: '0.25rem 1.25rem', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Official Terminal Academic Performance Report
            </div>
          </div>

          {/* Student Particulars Table */}
          <table style={{ width: '100%', marginBottom: '1.5rem', fontSize: '0.88rem', borderCollapse: 'collapse', fontFamily: 'sans-serif' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', width: '20%', fontWeight: 700, color: '#475569' }}>Student Name:</td>
                <td style={{ padding: '4px 0', width: '35%', fontWeight: 800, fontSize: '1rem' }}>{student.fullName}</td>
                <td style={{ padding: '4px 0', width: '20%', fontWeight: 700, color: '#475569' }}>Admission No:</td>
                <td style={{ padding: '4px 0', width: '25%', fontWeight: 800, color: '#2563eb' }}>{student.admissionNo}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: 700, color: '#475569' }}>Class / Grade:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>{student.className} ({student.stream})</td>
                <td style={{ padding: '4px 0', fontWeight: 700, color: '#475569' }}>Term / Session:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>{activeSchool.currentTerm} ({activeSchool.academicYear})</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: 700, color: '#475569' }}>Curriculum:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>{activeSchool.curriculum}</td>
                <td style={{ padding: '4px 0', fontWeight: 700, color: '#475569' }}>Class Rank:</td>
                <td style={{ padding: '4px 0', fontWeight: 800, color: '#059669' }}>2 of 48</td>
              </tr>
            </tbody>
          </table>

          {/* Marks Breakdown Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Subject</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Opener (30)</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Midterm (30)</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Endterm (40)</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Total (100)</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Grade</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Points</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Subject Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {studentExams.map((ex) => (
                <tr key={ex.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', fontWeight: 700 }}>{ex.subject}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{ex.opener}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{ex.midterm}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{ex.endterm}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800 }}>{ex.total}%</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800 }}>{ex.grade}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{ex.points}</td>
                  <td style={{ padding: '8px', fontSize: '0.8rem', color: '#334155' }}>{ex.teacherRemarks}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Aggregate Summary Box */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: '2rem',
              fontFamily: 'sans-serif',
              textAlign: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Mean Score</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{averageMarks}%</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Total Points</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{totalPoints}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Overall Mean Grade</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb' }}>{meanGrade}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Academic Status</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>PROMOTED</div>
            </div>
          </div>

          {/* Signatures & Seal Block */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2.5rem', fontFamily: 'sans-serif' }}>
            <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Class Teacher's Remarks & Signature:</div>
              <p style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '4px 0 1.5rem', color: '#475569' }}>
                "An outstanding and disciplined student who shows consistent academic leadership."
              </p>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: 28th March 2026</div>
            </div>

            <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem', textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Principal's Official Stamp & Seal:</div>
              <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span style={{ border: '2px dashed #2563eb', color: '#2563eb', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', transform: 'rotate(-5deg)' }}>
                  ★ APPROVED & STAMPED ★
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Office of the Principal • {activeSchool.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
