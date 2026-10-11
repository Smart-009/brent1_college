import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { ClearanceRecord } from '../../types/schoolErp'
import { CertificateIcon, PrintIcon, PlusIcon, SearchIcon, CheckIcon, XIcon } from '../common/Icons'
import { PrintableLeavingCertificate } from './PrintableLeavingCertificate'

export const ClearanceLeavingCertView: React.FC = () => {
  const { clearances, students, updateClearanceSignoff, addClearanceRecord } = useSchoolErp()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedForPrint, setSelectedForPrint] = useState<ClearanceRecord | null>(null)
  const [isNewClearanceModalOpen, setIsNewClearanceModalOpen] = useState(false)

  // Form states
  const [studentId, setStudentId] = useState('')
  const [exitReason, setExitReason] = useState<'Graduation' | 'Transfer' | 'Completed'>('Graduation')
  const [kcseIndexNo, setKcseIndexNo] = useState('')
  const [conductRemarks, setConductRemarks] = useState('')

  const filteredClearances = clearances.filter((c) =>
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateClearance = (e: React.FormEvent) => {
    e.preventDefault()
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    addClearanceRecord({
      studentId: student.id,
      studentName: student.fullName,
      admissionNo: student.admissionNo,
      className: student.className,
      academicYear: '2026',
      exitReason,
      libraryCleared: true,
      bursarCleared: student.feeBalance === 0,
      boardingCleared: true,
      gamesCleared: true,
      principalApproved: student.feeBalance === 0,
      conductRemarks: conductRemarks || 'Satisfactory academic progress and commendable personal conduct.',
      kcseIndexNo: kcseIndexNo || undefined,
    })

    setIsNewClearanceModalOpen(false)
    setStudentId('')
    setKcseIndexNo('')
    setConductRemarks('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Student Clearance & Leaving Certificates
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Multi-department exit sign-offs (Library, Bursary, Games, Boarding) and official stamped Leaving Certificate generator.
          </p>
        </div>
        <button
          onClick={() => setIsNewClearanceModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.6rem 1rem',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <PlusIcon size={16} /> Initiate Exit Clearance
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Clearance Files</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>{clearances.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Graduating & transferring pupils</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Fully Cleared & Certified</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
            {clearances.filter((c) => c.principalApproved).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Ready for certificate issuance</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Pending Dept Approvals</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
            {clearances.filter((c) => !c.principalApproved).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.25rem' }}>Awaiting fee or asset clearance</div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', maxWidth: '400px' }}>
          <SearchIcon size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by student name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* Clearance Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Student / Admission</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Exit Reason</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Library</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Bursary Fees</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Hostel</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Sports</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Principal Seal</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {filteredClearances.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.studentName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {c.admissionNo} • {c.className}
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: c.exitReason === 'Graduation' ? '#dbeafe' : '#fef3c7',
                      color: c.exitReason === 'Graduation' ? '#1e40af' : '#92400e',
                    }}
                  >
                    {c.exitReason}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => updateClearanceSignoff(c.id, 'libraryCleared', !c.libraryCleared)}
                    style={{
                      border: 'none',
                      background: c.libraryCleared ? '#dcfce7' : '#fee2e2',
                      color: c.libraryCleared ? '#15803d' : '#b91c1c',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {c.libraryCleared ? 'Cleared ✓' : 'Hold ✕'}
                  </button>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => updateClearanceSignoff(c.id, 'bursarCleared', !c.bursarCleared)}
                    style={{
                      border: 'none',
                      background: c.bursarCleared ? '#dcfce7' : '#fee2e2',
                      color: c.bursarCleared ? '#15803d' : '#b91c1c',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {c.bursarCleared ? 'Cleared ✓' : 'Hold ✕'}
                  </button>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => updateClearanceSignoff(c.id, 'boardingCleared', !c.boardingCleared)}
                    style={{
                      border: 'none',
                      background: c.boardingCleared ? '#dcfce7' : '#fee2e2',
                      color: c.boardingCleared ? '#15803d' : '#b91c1c',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {c.boardingCleared ? 'Cleared ✓' : 'Hold ✕'}
                  </button>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => updateClearanceSignoff(c.id, 'gamesCleared', !c.gamesCleared)}
                    style={{
                      border: 'none',
                      background: c.gamesCleared ? '#dcfce7' : '#fee2e2',
                      color: c.gamesCleared ? '#15803d' : '#b91c1c',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {c.gamesCleared ? 'Cleared ✓' : 'Hold ✕'}
                  </button>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => updateClearanceSignoff(c.id, 'principalApproved', !c.principalApproved)}
                    style={{
                      border: 'none',
                      background: c.principalApproved ? '#1e3a8a' : '#94a3b8',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {c.principalApproved ? 'Approved ★' : 'Pending'}
                  </button>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  {c.principalApproved ? (
                    <button
                      onClick={() => setSelectedForPrint(c)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #b45309',
                        backgroundColor: '#fffbeb',
                        color: '#b45309',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <CertificateIcon size={14} /> Print Certificate
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Clear all depts first
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Clearance Modal */}
      {isNewClearanceModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Initiate Student Clearance</h3>
              <button onClick={() => setIsNewClearanceModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <XIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateClearance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Select Student
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  required
                >
                  <option value="">-- Choose student from directory --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo} - {s.className}) [Fee Bal: KES {s.feeBalance.toLocaleString()}]
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Reason for Exit
                  </label>
                  <select
                    value={exitReason}
                    onChange={(e) => setExitReason(e.target.value as any)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="Graduation">Final Year Graduation</option>
                    <option value="Transfer">School Transfer</option>
                    <option value="Completed">Course Completion</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    KCSE / Exam Index No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20401102/055"
                    value={kcseIndexNo}
                    onChange={(e) => setKcseIndexNo(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Principal Conduct & Character Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Demonstrated exceptional discipline, active participant in school societies and exemplary leadership..."
                  value={conductRemarks}
                  onChange={(e) => setConductRemarks(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewClearanceModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Open Clearance Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Leaving Certificate Modal */}
      {selectedForPrint && (
        <PrintableLeavingCertificate
          clearance={selectedForPrint}
          onClose={() => setSelectedForPrint(null)}
        />
      )}
    </div>
  )
}
