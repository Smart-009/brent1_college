import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { Student } from '../../types/schoolErp'
import { SearchIcon, PlusIcon, PrintIcon, AcademicsIcon, UserIcon } from '../common/Icons'

interface StudentsViewProps {
  onOpenAdmissionModal: () => void
  onOpenImportModal: () => void
  onSelectStudentProfile: (studentId: string) => void
  onViewReportCard: (studentId: string) => void
  onViewAdmissionLetter: (studentId: string) => void
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onOpenAdmissionModal,
  onOpenImportModal,
  onSelectStudentProfile,
  onViewReportCard,
  onViewAdmissionLetter,
}) => {
  const { students, activeSchool, currentUser, exportStudentsCsv } = useSchoolErp()
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('All')

  const filteredStudents = students.filter((std) => {
    const matchesSearch =
      std.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.guardianPhone.includes(searchTerm)
    const matchesClass = classFilter === 'All' || std.className === classFilter
    return matchesSearch && matchesClass
  })

  const uniqueClasses = ['All', ...Array.from(new Set(students.map((s) => s.className)))]

  const handleDownloadCsv = () => {
    const csvContent = exportStudentsCsv()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${activeSchool.name.replace(/\s+/g, '_')}_Student_Roster.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Action Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
            Student Registry & Admissions
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Total {students.length} students actively registered at {activeSchool.name}
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadCsv}
              style={{
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
              Export CSV
            </button>
            <button
              onClick={onOpenImportModal}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Import CSV Roster
            </button>
            <button
              onClick={onOpenAdmissionModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.15rem',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
              }}
            >
              <PlusIcon size={16} />
              <span>Admit Student</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '260px' }}>
          <SearchIcon size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by student name, admission number, or guardian phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.88rem',
              color: '#0f172a',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Class Filter:</span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
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
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Admission No</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Student Name</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Class & Stream</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Guardian Details</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Fee Balance</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    No student records matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#2563eb' }}>
                      <button
                        onClick={() => onSelectStudentProfile(std.id)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        {std.admissionNo}
                      </button>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div
                        onClick={() => onSelectStudentProfile(std.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: std.gender === 'Female' ? '#fdf2f8' : '#eff6ff',
                            color: std.gender === 'Female' ? '#db2777' : '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          {std.fullName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{std.fullName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {std.gender} • DOB: {std.dateOfBirth}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{std.className}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                        Stream: {std.stream}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>{std.guardianName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{std.guardianPhone}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      {std.feeBalance === 0 ? (
                        <span
                          style={{
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          ✓ Cleared
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          Bal: {activeSchool.currency} {std.feeBalance.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => onSelectStudentProfile(std.id)}
                          title="View Complete Student Dossier"
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => onViewReportCard(std.id)}
                          title="Generate & Print Academic Report Card"
                          style={{
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#1d4ed8',
                            cursor: 'pointer',
                          }}
                        >
                          Report Card
                        </button>
                        <button
                          onClick={() => onViewAdmissionLetter(std.id)}
                          title="Print Admission Letter"
                          style={{
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          Letter
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
    </div>
  )
}
