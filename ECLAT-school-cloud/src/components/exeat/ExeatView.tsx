import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { ExeatPass } from '../../types/schoolErp'
import { PlusIcon, SearchIcon, PrintIcon, XIcon } from '../common/Icons'
import { PageHeader, KpiGrid, KpiCard, card, th, td, Badge, Modal, Field, inputStyle, btnPrimary, btnSecondary } from '../common/ui'

const parseDate = (value?: string): number => {
  if (!value) return NaN
  const t = Date.parse(value.replace(' ', 'T'))
  return isNaN(t) ? Date.parse(value) : t
}

const formatDateTime = (value: string) => {
  const t = parseDate(value)
  if (isNaN(t)) return value
  return new Date(t).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Derives live status: an active pass past its expected return time is Overdue. */
const effectiveStatus = (p: ExeatPass): ExeatPass['status'] => {
  if (p.status !== 'Active / Off-Campus') return p.status
  const due = parseDate(p.expectedReturnDate)
  return !isNaN(due) && due < Date.now() ? 'Overdue' : p.status
}

const STATUS_COLORS: Record<ExeatPass['status'], [string, string]> = {
  'Active / Off-Campus': ['#dbeafe', '#1e40af'],
  'Returned & Cleared': ['#dcfce7', '#15803d'],
  Overdue: ['#fee2e2', '#b91c1c'],
}

export const ExeatView: React.FC = () => {
  const { exeatPasses, students, issueExeatPass, clearExeatReturn, currentUser, activeSchool } = useSchoolErp()
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [printPass, setPrintPass] = useState<ExeatPass | null>(null)
  const [form, setForm] = useState({
    studentId: '',
    reason: 'Home Weekend' as ExeatPass['reason'],
    departureDate: '',
    expectedReturnDate: '',
    accompaniedBy: '',
  })

  const withStatus = exeatPasses.map((p) => ({ ...p, status: effectiveStatus(p) }))
  const filtered = withStatus.filter((p) => {
    const q = search.toLowerCase()
    return p.studentName.toLowerCase().includes(q) || p.admissionNo.toLowerCase().includes(q) || p.passNo.toLowerCase().includes(q)
  })

  const offCampus = withStatus.filter((p) => p.status === 'Active / Off-Campus').length
  const overdue = withStatus.filter((p) => p.status === 'Overdue').length
  const returned = withStatus.filter((p) => p.status === 'Returned & Cleared').length

  const selectedStudent = students.find((s) => s.id === form.studentId)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    if (parseDate(form.expectedReturnDate) <= parseDate(form.departureDate)) {
      alert('Expected return must be after departure.')
      return
    }
    const pass = issueExeatPass({
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      admissionNo: selectedStudent.admissionNo,
      className: selectedStudent.className,
      departureDate: form.departureDate,
      expectedReturnDate: form.expectedReturnDate,
      reason: form.reason,
      authorizedBy: `${currentUser?.name || 'Administrator'} (${currentUser?.designation || 'Admin'})`,
      accompaniedBy: form.accompaniedBy || `${selectedStudent.guardianName} (${selectedStudent.guardianPhone})`,
    })
    setIsOpen(false)
    setForm({ studentId: '', reason: 'Home Weekend', departureDate: '', expectedReturnDate: '', accompaniedBy: '' })
    setPrintPass(pass)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Exeat & Gate Passes"
        subtitle="Authorize student departures, print gate passes for security, and clear returns. Overdue students are flagged automatically."
        actions={
          <button style={btnPrimary} onClick={() => setIsOpen(true)}>
            <PlusIcon size={16} /> Issue Exeat Pass
          </button>
        }
      />

      <KpiGrid>
        <KpiCard label="Passes Issued" value={exeatPasses.length} hint="This term" />
        <KpiCard label="Currently Off-Campus" value={offCampus} color="#2563eb" hint="Within approved window" />
        <KpiCard label="Overdue Returns" value={overdue} color="#b91c1c" hint="Past expected return time" />
        <KpiCard label="Returned & Cleared" value={returned} color="#16a34a" hint="Checked back in at the gate" />
      </KpiGrid>

      <div style={{ ...card, padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', maxWidth: '400px' }}>
          <SearchIcon size={16} color="#64748b" />
          <input
            placeholder="Search student, admission or pass number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      <div style={{ ...card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={th}>Pass No</th>
              <th style={th}>Student</th>
              <th style={th}>Reason</th>
              <th style={th}>Departure</th>
              <th style={th}>Expected Return</th>
              <th style={th}>Accompanied By</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: p.status === 'Overdue' ? '#fff7f7' : undefined }}>
                <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{p.passNo}</td>
                <td style={td}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.studentName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.admissionNo} • {p.className}</div>
                </td>
                <td style={td}>{p.reason}</td>
                <td style={{ ...td, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDateTime(p.departureDate)}</td>
                <td style={{ ...td, fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: 600, color: p.status === 'Overdue' ? '#b91c1c' : '#0f172a' }}>
                  {formatDateTime(p.expectedReturnDate)}
                  {p.actualReturnDate && <div style={{ fontWeight: 400, color: '#16a34a' }}>Back: {formatDateTime(p.actualReturnDate)}</div>}
                </td>
                <td style={{ ...td, fontSize: '0.8rem', maxWidth: '200px' }}>{p.accompaniedBy}</td>
                <td style={td}>
                  <Badge bg={STATUS_COLORS[p.status][0]} fg={STATUS_COLORS[p.status][1]}>{p.status}</Badge>
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button style={{ ...btnSecondary, padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => setPrintPass(p)}>
                      <PrintIcon size={14} /> Pass
                    </button>
                    {p.status !== 'Returned & Cleared' && (
                      <button
                        style={{ ...btnPrimary, backgroundColor: '#16a34a', padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                        onClick={() => clearExeatReturn(p.id)}
                      >
                        Check In ✓
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ ...td, textAlign: 'center', color: '#94a3b8' }}>No exeat passes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <Modal title="Issue Exeat Pass" onClose={() => setIsOpen(false)}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Field label="Student">
              <select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} style={inputStyle}>
                <option value="">-- Select student --</option>
                {students.filter((s) => s.status === 'Active').map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.admissionNo} - {s.className})</option>
                ))}
              </select>
            </Field>
            {selectedStudent && selectedStudent.feeBalance > 0 && (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.6rem 0.85rem', fontSize: '0.8rem', color: '#92400e' }}>
                Note: outstanding fee balance of {activeSchool.currency} {selectedStudent.feeBalance.toLocaleString()}.
              </div>
            )}
            <Field label="Reason">
              <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value as ExeatPass['reason'] })} style={inputStyle}>
                <option value="Home Weekend">Home Weekend</option>
                <option value="Medical Appointment">Medical Appointment</option>
                <option value="Family Emergency">Family Emergency</option>
                <option value="School Event">School Event</option>
              </select>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Departure">
                <input required type="datetime-local" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Expected Return">
                <input required type="datetime-local" value={form.expectedReturnDate} onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })} style={inputStyle} />
              </Field>
            </div>
            <Field label="Picked up / accompanied by">
              <input
                value={form.accompaniedBy}
                onChange={(e) => setForm({ ...form, accompaniedBy: e.target.value })}
                style={inputStyle}
                placeholder={selectedStudent ? `Default: ${selectedStudent.guardianName} (${selectedStudent.guardianPhone})` : 'Name, relation & phone'}
              />
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" style={btnSecondary} onClick={() => setIsOpen(false)}>Cancel</button>
              <button type="submit" style={btnPrimary}>Authorize & Print</button>
            </div>
          </form>
        </Modal>
      )}

      {printPass && <PrintableExeatPass pass={printPass} onClose={() => setPrintPass(null)} />}
    </div>
  )
}

const PrintableExeatPass: React.FC<{ pass: ExeatPass; onClose: () => void }> = ({ pass, onClose }) => {
  const { activeSchool } = useSchoolErp()
  const row = (label: string, value: string) => (
    <div style={{ display: 'flex', borderBottom: '1px dashed #cbd5e1', padding: '0.45rem 0', fontSize: '0.88rem' }}>
      <span style={{ width: '170px', color: '#64748b', fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#0f172a', fontWeight: 600 }}>{value}</span>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.75)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', overflowY: 'auto' }}>
      <div className="no-print" style={{ width: '100%', maxWidth: '620px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: '#fff', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <span style={{ fontWeight: 700 }}>Exeat Gate Pass — {pass.passNo}</span>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={() => window.print()} style={{ ...btnPrimary, padding: '0.45rem 0.9rem' }}><PrintIcon size={15} /> Print</button>
          <button onClick={onClose} style={{ ...btnPrimary, backgroundColor: '#334155', padding: '0.45rem 0.9rem' }}><XIcon size={15} /> Close</button>
        </div>
      </div>

      <div className="print-sheet" style={{ width: '100%', maxWidth: '620px', backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', border: '3px solid #0f172a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '10px', backgroundColor: activeSchool.crestColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
            {activeSchool.logoText}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{activeSchool.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{activeSchool.address} • {activeSchool.phone}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>EXEAT PASS</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#b91c1c' }}>{pass.passNo}</div>
          </div>
        </div>

        {row('Student', pass.studentName)}
        {row('Admission / Class', `${pass.admissionNo} • ${pass.className}`)}
        {row('Reason', pass.reason)}
        {row('Departure', formatDateTime(pass.departureDate))}
        {row('Must return by', formatDateTime(pass.expectedReturnDate))}
        {row('Released to', pass.accompaniedBy)}
        {row('Authorized by', pass.authorizedBy)}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem', fontSize: '0.78rem', color: '#334155' }}>
          <div>
            <div style={{ borderBottom: '1px solid #0f172a', height: '30px' }} />
            Gate security — OUT (time & sign)
          </div>
          <div>
            <div style={{ borderBottom: '1px solid #0f172a', height: '30px' }} />
            Gate security — IN (time & sign)
          </div>
          <div>
            <div style={{ borderBottom: '1px solid #0f172a', height: '30px' }} />
            Guardian signature
          </div>
          <div>
            <div style={{ borderBottom: '1px solid #0f172a', height: '30px' }} />
            Boarding master / Principal stamp
          </div>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1.25rem', marginBottom: 0 }}>
          This pass must be presented at the gate on exit and return. Late return will be recorded as a disciplinary matter.
        </p>
      </div>
    </div>
  )
}
