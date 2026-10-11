import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { DisciplineIncident } from '../../types/schoolErp'
import { ShieldIcon, PlusIcon, SearchIcon, CheckIcon, XIcon } from '../common/Icons'

export const DisciplineView: React.FC = () => {
  const { disciplineIncidents, students, addDisciplineIncident, resolveDisciplineIncident, currentUser } = useSchoolErp()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [resolveModalIncident, setResolveModalIncident] = useState<DisciplineIncident | null>(null)
  const [resolutionText, setResolutionText] = useState('')

  // Add Incident Form state
  const [studentId, setStudentId] = useState('')
  const [incidentType, setIncidentType] = useState<DisciplineIncident['incidentType']>('Truancy')
  const [severity, setSeverity] = useState<DisciplineIncident['severity']>('Minor')
  const [actionTaken, setActionTaken] = useState('')

  const commendationsCount = disciplineIncidents.filter((d) => d.severity === 'Commendation').length
  const activeInfractionsCount = disciplineIncidents.filter((d) => d.status !== 'Resolved' && d.severity !== 'Commendation').length
  const resolvedCount = disciplineIncidents.filter((d) => d.status === 'Resolved').length

  const filteredIncidents = disciplineIncidents.filter((inc) => {
    const matchesType = typeFilter === 'All' || inc.incidentType === typeFilter
    const matchesSearch =
      inc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.actionTaken.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault()
    const std = students.find((s) => s.id === studentId)
    if (!std) return

    addDisciplineIncident({
      studentId: std.id,
      studentName: std.fullName,
      admissionNo: std.admissionNo,
      className: std.className,
      incidentType,
      severity,
      actionTaken: actionTaken || 'Counseling session scheduled with class teacher.',
      status: severity === 'Commendation' ? 'Resolved' : 'Active',
      reportedBy: currentUser?.name || 'Duty Teacher',
    })

    setIsAddModalOpen(false)
    setStudentId('')
    setActionTaken('')
  }

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolveModalIncident || !resolutionText) return
    resolveDisciplineIncident(resolveModalIncident.id, resolutionText)
    setResolveModalIncident(null)
    setResolutionText('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Student Discipline & Pastoral Care
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Behavioral incident tracking, guidance & counseling referrals, parent interventions, and merit leadership awards.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
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
          <PlusIcon size={16} /> Log Conduct / Commendation
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Dossier Entries</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>{disciplineIncidents.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Logged this academic year</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Merits & Commendations</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>{commendationsCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Exemplary leadership & character</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Cases</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '0.35rem' }}>{activeInfractionsCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>Pending hearing or counseling</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Resolved & Cleared</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '0.35rem' }}>{resolvedCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Corrective counseling completed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 300px' }}>
          <SearchIcon size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by student, admission no or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Filter Type:</span>
          {(['All', 'Exemplary Leadership', 'Truancy', 'Dress Code', 'Bullying'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: typeFilter === t ? '#2563eb' : '#cbd5e1',
                backgroundColor: typeFilter === t ? '#2563eb' : '#ffffff',
                color: typeFilter === t ? '#ffffff' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Student / Admission</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Incident Type</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Severity</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Action Taken / Remarks</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Reported By</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map((inc) => (
              <tr key={inc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inc.studentName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {inc.admissionNo} • {inc.className}
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                  {inc.date}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: inc.incidentType === 'Exemplary Leadership' ? '#dcfce7' : '#f1f5f9',
                      color: inc.incidentType === 'Exemplary Leadership' ? '#15803d' : '#334155',
                    }}
                  >
                    {inc.incidentType}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor:
                        inc.severity === 'Commendation'
                          ? '#dcfce7'
                          : inc.severity === 'Minor'
                          ? '#fef3c7'
                          : inc.severity === 'Moderate'
                          ? '#ffedd5'
                          : '#fee2e2',
                      color:
                        inc.severity === 'Commendation'
                          ? '#15803d'
                          : inc.severity === 'Minor'
                          ? '#b45309'
                          : inc.severity === 'Moderate'
                          ? '#c2410c'
                          : '#b91c1c',
                    }}
                  >
                    {inc.severity}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', maxWidth: '300px', fontSize: '0.82rem', color: '#334155' }}>
                  {inc.actionTaken}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                  {inc.reportedBy}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: inc.status === 'Resolved' ? '#dcfce7' : '#fee2e2',
                      color: inc.status === 'Resolved' ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {inc.status}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  {inc.status !== 'Resolved' && (
                    <button
                      onClick={() => {
                        setResolveModalIncident(inc)
                        setResolutionText('')
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        border: '1px solid #86efac',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Resolve Case
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Incident Modal */}
      {isAddModalOpen && (
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
              maxWidth: '480px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Record Conduct or Commendation</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <XIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleAddIncident} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
                  <option value="">-- Choose student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo} - {s.className})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Category
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as any)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="Truancy">Truancy / Prep Absence</option>
                    <option value="Dress Code">Dress Code / Uniform</option>
                    <option value="Bullying">Bullying / Harassment</option>
                    <option value="Insubordination">Insubordination</option>
                    <option value="Academic Malpractice">Academic Dishonesty</option>
                    <option value="Exemplary Leadership">Exemplary Leadership (Merit)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="Minor">Minor (Verbal Correction)</option>
                    <option value="Moderate">Moderate (Parent Alert)</option>
                    <option value="Severe">Severe (Disciplinary Board)</option>
                    <option value="Commendation">Commendation (Award)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Action Taken / Recommendation / Citation
                </label>
                <textarea
                  rows={3}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="Describe disciplinary action, counseling outcome, or citation of exemplary merit..."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Case Modal */}
      {resolveModalIncident && (
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
              maxWidth: '440px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Resolve Pastoral Case</h3>
              <button onClick={() => setResolveModalIncident(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <XIcon size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Closing incident for <strong>{resolveModalIncident.studentName}</strong> ({resolveModalIncident.incidentType}).
            </p>
            <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Final Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="e.g. Completed counseling session, apologized to peers and guardian satisfied."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setResolveModalIncident(null)}
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
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mark as Resolved ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
