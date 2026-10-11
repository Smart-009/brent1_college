import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { ClinicVisit } from '../../types/schoolErp'
import { PlusIcon, SearchIcon } from '../common/Icons'
import { PageHeader, KpiGrid, KpiCard, card, th, td, Badge, Modal, Field, inputStyle, btnPrimary, btnSecondary, nowStamp } from '../common/ui'

const STATUS_COLORS: Record<ClinicVisit['status'], [string, string]> = {
  'Treated & Discharged': ['#dcfce7', '#15803d'],
  'Admitted to Sick Bay': ['#fef3c7', '#b45309'],
  'Referred to Hospital': ['#fee2e2', '#b91c1c'],
}

export const ClinicView: React.FC = () => {
  const { clinicVisits, students, logClinicVisit, sendSmsBroadcast, currentUser } = useSchoolErp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | ClinicVisit['status']>('All')
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<ClinicVisit | null>(null)

  const [form, setForm] = useState({
    studentId: '',
    symptomsComplained: '',
    diagnosis: '',
    treatmentAdministered: '',
    medicationDispensed: '',
    status: 'Treated & Discharged' as ClinicVisit['status'],
    parentNotified: true,
    notes: '',
  })

  const filtered = clinicVisits.filter((v) => {
    const q = search.toLowerCase()
    const matchesQ = v.studentName.toLowerCase().includes(q) || v.admissionNo.toLowerCase().includes(q) || v.diagnosis.toLowerCase().includes(q)
    return matchesQ && (statusFilter === 'All' || v.status === statusFilter)
  })

  const inSickBay = clinicVisits.filter((v) => v.status === 'Admitted to Sick Bay').length
  const referred = clinicVisits.filter((v) => v.status === 'Referred to Hospital').length

  // Students with medical notes / allergies on record
  const flaggedStudents = students.filter((s) => s.medicalNotes && s.medicalNotes.trim().length > 0)
  const selectedStudent = students.find((s) => s.id === form.studentId)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    logClinicVisit({
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      admissionNo: selectedStudent.admissionNo,
      className: selectedStudent.className,
      visitDate: nowStamp(),
      symptomsComplained: form.symptomsComplained,
      diagnosis: form.diagnosis,
      treatmentAdministered: form.treatmentAdministered,
      medicationDispensed: form.medicationDispensed || 'None',
      nurseName: currentUser?.name || 'School Nurse',
      status: form.status,
      parentNotified: form.parentNotified,
      notes: form.notes,
    })
    if (form.parentNotified && form.status !== 'Treated & Discharged') {
      sendSmsBroadcast(
        'Specific Class',
        `Dear ${selectedStudent.guardianName}, ${selectedStudent.fullName} was seen at the school clinic today (${form.diagnosis}). Status: ${form.status}. Kindly contact the school nurse.`
      )
    }
    setIsOpen(false)
    setForm({ studentId: '', symptomsComplained: '', diagnosis: '', treatmentAdministered: '', medicationDispensed: '', status: 'Treated & Discharged', parentNotified: true, notes: '' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="School Clinic & Sick Bay"
        subtitle="Record sanatorium visits, diagnoses, medication dispensed, sick bay admissions and hospital referrals."
        actions={
          <button style={btnPrimary} onClick={() => setIsOpen(true)}>
            <PlusIcon size={16} /> Record Clinic Visit
          </button>
        }
      />

      <KpiGrid>
        <KpiCard label="Total Visits (Term)" value={clinicVisits.length} hint="All recorded consultations" />
        <KpiCard label="Currently in Sick Bay" value={inSickBay} color="#b45309" hint="Under overnight observation" />
        <KpiCard label="Hospital Referrals" value={referred} color="#b91c1c" hint="Escalated to external care" />
        <KpiCard label="Medical Alerts on File" value={flaggedStudents.length} color="#2563eb" hint="Students with allergies / conditions" />
      </KpiGrid>

      <div style={{ ...card, padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 280px', maxWidth: '400px' }}>
          <SearchIcon size={16} color="#64748b" />
          <input
            placeholder="Search student, admission no or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="All">All statuses</option>
          <option value="Treated & Discharged">Treated & Discharged</option>
          <option value="Admitted to Sick Bay">Admitted to Sick Bay</option>
          <option value="Referred to Hospital">Referred to Hospital</option>
        </select>
      </div>

      <div style={{ ...card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={th}>Date / Time</th>
              <th style={th}>Student</th>
              <th style={th}>Complaint</th>
              <th style={th}>Diagnosis</th>
              <th style={th}>Medication</th>
              <th style={th}>Status</th>
              <th style={th}>Parent</th>
              <th style={{ ...th, textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ ...td, color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{v.visitDate}</td>
                <td style={td}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.studentName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.admissionNo} • {v.className}</div>
                </td>
                <td style={{ ...td, maxWidth: '220px', fontSize: '0.82rem', color: '#334155' }}>{v.symptomsComplained}</td>
                <td style={{ ...td, fontWeight: 600, color: '#0f172a' }}>{v.diagnosis}</td>
                <td style={{ ...td, fontSize: '0.82rem' }}>{v.medicationDispensed}</td>
                <td style={td}>
                  <Badge bg={STATUS_COLORS[v.status][0]} fg={STATUS_COLORS[v.status][1]}>{v.status}</Badge>
                </td>
                <td style={td}>
                  {v.parentNotified ? <Badge bg="#dbeafe" fg="#1e40af">Notified</Badge> : <Badge bg="#f1f5f9" fg="#64748b">Not yet</Badge>}
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button style={{ ...btnSecondary, padding: '0.35rem 0.7rem', fontSize: '0.78rem' }} onClick={() => setSelected(v)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ ...td, textAlign: 'center', color: '#94a3b8' }}>No clinic visits match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <Modal title="Record Clinic Visit" onClose={() => setIsOpen(false)} width={560}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Field label="Student">
              <select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} style={inputStyle}>
                <option value="">-- Select student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.admissionNo} - {s.className})</option>
                ))}
              </select>
            </Field>

            {selectedStudent && (
              <div style={{ backgroundColor: selectedStudent.medicalNotes ? '#fef2f2' : '#f8fafc', border: `1px solid ${selectedStudent.medicalNotes ? '#fecaca' : '#e2e8f0'}`, borderRadius: '6px', padding: '0.65rem 0.85rem', fontSize: '0.8rem' }}>
                <strong>Blood group:</strong> {selectedStudent.bloodGroup || 'Unknown'} &nbsp;•&nbsp;
                <strong>Medical notes:</strong>{' '}
                <span style={{ color: selectedStudent.medicalNotes ? '#b91c1c' : '#64748b', fontWeight: selectedStudent.medicalNotes ? 700 : 400 }}>
                  {selectedStudent.medicalNotes || 'None on file'}
                </span>
                <br />
                <strong>Guardian:</strong> {selectedStudent.guardianName} ({selectedStudent.guardianPhone})
              </div>
            )}

            <Field label="Symptoms / Complaint">
              <textarea required rows={2} value={form.symptomsComplained} onChange={(e) => setForm({ ...form, symptomsComplained: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Diagnosis">
              <input required value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} style={inputStyle} placeholder="e.g. Common cold, Malaria (RDT+), Sprain" />
            </Field>
            <Field label="Treatment Administered">
              <textarea required rows={2} value={form.treatmentAdministered} onChange={(e) => setForm({ ...form, treatmentAdministered: e.target.value })} style={inputStyle} placeholder="Vitals, procedures, observation..." />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Medication Dispensed">
                <input value={form.medicationDispensed} onChange={(e) => setForm({ ...form, medicationDispensed: e.target.value })} style={inputStyle} placeholder="Drug, dose, quantity" />
              </Field>
              <Field label="Outcome">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClinicVisit['status'] })} style={inputStyle}>
                  <option value="Treated & Discharged">Treated & Discharged</option>
                  <option value="Admitted to Sick Bay">Admitted to Sick Bay</option>
                  <option value="Referred to Hospital">Referred to Hospital</option>
                </select>
              </Field>
            </div>
            <Field label="Notes">
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={inputStyle} />
            </Field>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
              <input type="checkbox" checked={form.parentNotified} onChange={(e) => setForm({ ...form, parentNotified: e.target.checked })} />
              Notify guardian (SMS is sent automatically for sick bay admissions & referrals)
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" style={btnSecondary} onClick={() => setIsOpen(false)}>Cancel</button>
              <button type="submit" style={btnPrimary}>Save Visit</button>
            </div>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal title={`Clinic Record — ${selected.studentName}`} onClose={() => setSelected(null)}>
          <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.88rem', color: '#334155' }}>
            <div><strong>Date:</strong> {selected.visitDate}</div>
            <div><strong>Admission / Class:</strong> {selected.admissionNo} • {selected.className}</div>
            <div><strong>Complaint:</strong> {selected.symptomsComplained}</div>
            <div><strong>Diagnosis:</strong> {selected.diagnosis}</div>
            <div><strong>Treatment:</strong> {selected.treatmentAdministered}</div>
            <div><strong>Medication:</strong> {selected.medicationDispensed}</div>
            <div><strong>Attending:</strong> {selected.nurseName}</div>
            <div><strong>Outcome:</strong> <Badge bg={STATUS_COLORS[selected.status][0]} fg={STATUS_COLORS[selected.status][1]}>{selected.status}</Badge></div>
            {selected.notes && <div><strong>Notes:</strong> {selected.notes}</div>}
          </div>
        </Modal>
      )}
    </div>
  )
}
