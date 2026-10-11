import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { PlusIcon, PrintIcon, AcademicsIcon } from '../common/Icons'
import { ClassBroadsheetView } from './ClassBroadsheetView'

interface AcademicsViewProps {
  onOpenGradeModal: () => void
  onViewReportCard: (studentId: string) => void
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({
  onOpenGradeModal,
  onViewReportCard,
}) => {
  const { exams, students, activeSchool, currentUser } = useSchoolErp()
  const [activeTab, setActiveTab] = useState<'marksheets' | 'broadsheet'>('marksheets')
  const [selectedClass, setSelectedClass] = useState('Grade 10')
  const [selectedSubject, setSelectedSubject] = useState('All')

  // Filter exams by class
  const classStudents = students.filter((s) => s.className === selectedClass)
  const studentIdsInClass = new Set(classStudents.map((s) => s.id))

  const filteredExams = exams.filter((e) => {
    const inClass = studentIdsInClass.has(e.studentId)
    const matchesSubject = selectedSubject === 'All' || e.subject === selectedSubject
    return inClass && matchesSubject
  })

  const subjects = ['All', 'Mathematics', 'English Language', 'Physics', 'Biology', 'Chemistry']

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
            Academic Marksheets & Continuous Assessment
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            {activeSchool.name} • Continuous assessment (Opener 30% + Midterm 30% + Endterm 40%)
          </p>
        </div>

        {currentUser?.role !== 'student' && (
          <button
            onClick={onOpenGradeModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
            }}
          >
            <PlusIcon size={16} />
            <span>Enter / Update Exam Marks</span>
          </button>
        )}
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('marksheets')}
          style={{
            backgroundColor: activeTab === 'marksheets' ? '#2563eb' : '#ffffff',
            color: activeTab === 'marksheets' ? '#ffffff' : '#64748b',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Detailed Subject Marksheets
        </button>
        <button
          onClick={() => setActiveTab('broadsheet')}
          style={{
            backgroundColor: activeTab === 'broadsheet' ? '#2563eb' : '#ffffff',
            color: activeTab === 'broadsheet' ? '#ffffff' : '#64748b',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Class Broadsheet & Merit Rankings
        </button>
      </div>

      {activeTab === 'broadsheet' ? (
        <ClassBroadsheetView />
      ) : (
        <>
          {/* Filter Strip */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Select Class:</span>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Filter Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
              Grading Scale: <strong>A (80-100)</strong> • <strong>B (60-79)</strong> • <strong>C (45-59)</strong> • <strong>D (35-44)</strong> • <strong>E (0-34)</strong>
            </div>
          </div>

          {/* Marksheet Table */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              marginBottom: '2rem',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Adm No</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Student Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Subject</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Opener (30)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Midterm (30)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Endterm (40)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Total (100)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Grade</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Teacher Remarks</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Report Card</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        No marks recorded yet for {selectedClass}. Click "Enter / Update Exam Marks" to add scores.
                      </td>
                    </tr>
                  ) : (
                    filteredExams.map((ex) => (
                      <tr key={ex.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#2563eb' }}>
                          {ex.admissionNo}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                          {ex.studentName}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 500 }}>
                          {ex.subject}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#475569' }}>
                          {ex.opener}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#475569' }}>
                          {ex.midterm}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#475569' }}>
                          {ex.endterm}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                          {ex.total}%
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <span
                            style={{
                              backgroundColor:
                                ex.grade.startsWith('A')
                                  ? '#dcfce7'
                                  : ex.grade.startsWith('B')
                                  ? '#eff6ff'
                                  : ex.grade.startsWith('C')
                                  ? '#fef3c7'
                                  : '#fee2e2',
                              color:
                                ex.grade.startsWith('A')
                                  ? '#15803d'
                                  : ex.grade.startsWith('B')
                                  ? '#1d4ed8'
                                  : ex.grade.startsWith('C')
                                  ? '#b45309'
                                  : '#b91c1c',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                            }}
                          >
                            {ex.grade}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem', maxWidth: '220px' }}>
                          {ex.teacherRemarks}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => onViewReportCard(ex.studentId)}
                            style={{
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#1d4ed8',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <PrintIcon size={14} />
                            <span>Print Report Card</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
