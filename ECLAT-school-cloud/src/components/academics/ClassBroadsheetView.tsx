import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { PrintIcon } from '../common/Icons'

export const ClassBroadsheetView: React.FC = () => {
  const { students, exams, activeSchool } = useSchoolErp()
  const [selectedClass, setSelectedClass] = useState('Grade 10')

  const classStudents = students.filter((s) => s.className === selectedClass)
  const subjects = ['Mathematics', 'English Language', 'Physics', 'Biology', 'Chemistry']

  // Build ranking table
  const studentRows = classStudents.map((std) => {
    const studentExams = exams.filter((e) => e.studentId === std.id)
    const subjectScores: Record<string, number> = {}
    let totalScore = 0

    subjects.forEach((sub) => {
      const match = studentExams.find((e) => e.subject === sub)
      const score = match ? match.total : 0
      subjectScores[sub] = score
      totalScore += score
    })

    const count = studentExams.length || 1
    const meanScore = Math.round(totalScore / count)

    let meanGrade = 'E'
    if (meanScore >= 80) meanGrade = 'A'
    else if (meanScore >= 75) meanGrade = 'A-'
    else if (meanScore >= 70) meanGrade = 'B+'
    else if (meanScore >= 65) meanGrade = 'B'
    else if (meanScore >= 60) meanGrade = 'B-'
    else if (meanScore >= 55) meanGrade = 'C+'
    else if (meanScore >= 50) meanGrade = 'C'
    else meanGrade = 'D+'

    return {
      student: std,
      subjectScores,
      totalScore,
      meanScore,
      meanGrade,
    }
  })

  // Sort descending by totalScore for ranking
  studentRows.sort((a, b) => b.totalScore - a.totalScore)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      {/* Broadsheet Top Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            Class Academic Broadsheet & Merit Rankings
          </h3>
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {activeSchool.name} • {selectedClass} • Session: {activeSchool.currentTerm} ({activeSchool.academicYear})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
              }}
            >
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Year 9">Year 9</option>
              <option value="Year 10">Year 10</option>
              <option value="Year 11">Year 11</option>
            </select>
          </div>

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
              padding: '0.5rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <PrintIcon size={15} />
            <span>Print Broadsheet</span>
          </button>
        </div>
      </div>

      {/* Broadsheet Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'center' }}>
              <th style={{ padding: '0.65rem', width: '50px' }}>Rank</th>
              <th style={{ padding: '0.65rem', textAlign: 'left' }}>Adm No</th>
              <th style={{ padding: '0.65rem', textAlign: 'left' }}>Student Name</th>
              {subjects.map((sub) => (
                <th key={sub} style={{ padding: '0.65rem' }}>
                  {sub.substring(0, 4).toUpperCase()}
                </th>
              ))}
              <th style={{ padding: '0.65rem', backgroundColor: '#1e293b' }}>Total</th>
              <th style={{ padding: '0.65rem', backgroundColor: '#1e293b' }}>Mean %</th>
              <th style={{ padding: '0.65rem', backgroundColor: '#1e293b' }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {studentRows.length === 0 ? (
              <tr>
                <td colSpan={6 + subjects.length} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No students in this class.
                </td>
              </tr>
            ) : (
              studentRows.map((row, idx) => (
                <tr key={row.student.id} style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <td style={{ padding: '0.65rem', fontWeight: 800, color: idx < 3 ? '#2563eb' : '#475569' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '0.65rem', textAlign: 'left', fontWeight: 700, color: '#2563eb' }}>
                    {row.student.admissionNo}
                  </td>
                  <td style={{ padding: '0.65rem', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>
                    {row.student.fullName}
                  </td>
                  {subjects.map((sub) => {
                    const val = row.subjectScores[sub]
                    return (
                      <td key={sub} style={{ padding: '0.65rem', color: val > 0 ? '#0f172a' : '#cbd5e1' }}>
                        {val > 0 ? `${val}%` : '—'}
                      </td>
                    )
                  })}
                  <td style={{ padding: '0.65rem', fontWeight: 800, backgroundColor: '#f8fafc' }}>
                    {row.totalScore}
                  </td>
                  <td style={{ padding: '0.65rem', fontWeight: 800, color: '#059669', backgroundColor: '#f8fafc' }}>
                    {row.meanScore}%
                  </td>
                  <td style={{ padding: '0.65rem', fontWeight: 900, color: '#1d4ed8', backgroundColor: '#f8fafc' }}>
                    {row.meanGrade}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
