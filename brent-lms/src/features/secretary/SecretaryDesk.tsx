import { useState } from 'react'
import { schoolStore } from '@/lib/schoolData'
import type { StudentRecord, SecretaryInquiry, CourseUnit, UnitRegistrationReceipt } from '@/types/school'
import { UnitRegistrationSlip } from '@/components/shared/UnitRegistrationSlip'

export function SecretaryDesk() {
  const [students] = useState<StudentRecord[]>(() => schoolStore.getStudents())
  const [inquiries, setInquiries] = useState<SecretaryInquiry[]>(() => schoolStore.getInquiries())
  const [courseUnits] = useState<CourseUnit[]>(() => schoolStore.getCourseUnits())
  const [unitRegistrations, setUnitRegistrations] = useState<UnitRegistrationReceipt[]>(() => schoolStore.getUnitRegistrations())
  const [activeTab, setActiveTab] = useState<'admissions' | 'unit_registration' | 'idcards' | 'inquiries'>('admissions')

  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState<StudentRecord | null>(null)
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<StudentRecord | null>(null)
  const [selectedSlipForView, setSelectedSlipForView] = useState<UnitRegistrationReceipt | null>(null)
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [showUnitRegModal, setShowUnitRegModal] = useState(false)

  // Unit Registration Form State
  const [regStudentId, setRegStudentId] = useState<string>(students[0]?.id || '')
  const [regCourseDuration, setRegCourseDuration] = useState('4 to 12 Weeks (Practical Certificate)')
  const [regAcademicYear, setRegAcademicYear] = useState('2026 Intake Batch')
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([])

  // Inquiry Form
  const [newInquiry, setNewInquiry] = useState<Partial<SecretaryInquiry>>({
    visitor_name: '',
    phone: '',
    email: '',
    purpose: 'New Admission Inquiry',
    program_of_interest: '',
    notes: '',
    status: 'Open',
  })

  const handleAddInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInquiry.visitor_name || !newInquiry.phone) return

    const item: SecretaryInquiry = {
      id: `inq-${Date.now()}`,
      visitor_name: newInquiry.visitor_name || '',
      phone: newInquiry.phone || '',
      email: newInquiry.email || '',
      purpose: newInquiry.purpose as any,
      program_of_interest: newInquiry.program_of_interest,
      notes: newInquiry.notes || '',
      recorded_by: 'College Secretary (Mrs. Grace Odhiambo)',
      created_at: new Date().toLocaleString(),
      status: 'Open',
    }

    await schoolStore.addInquiry(item)
    setInquiries(schoolStore.getInquiries())
    setShowInquiryModal(false)
    setNewInquiry({ visitor_name: '', phone: '', email: '', purpose: 'New Admission Inquiry', notes: '' })
  }

  const handleToggleUnitSelect = (unitId: string) => {
    if (selectedUnitIds.includes(unitId)) {
      setSelectedUnitIds(selectedUnitIds.filter((id) => id !== unitId))
    } else {
      setSelectedUnitIds([...selectedUnitIds, unitId])
    }
  }

  const handleCompleteUnitRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetStudent = students.find((s) => s.id === regStudentId) || students[0]
    if (!targetStudent) {
      alert('Please select a student.')
      return
    }

    if (selectedUnitIds.length === 0) {
      alert('Please select at least one course unit to register.')
      return
    }

    const selectedUnitsList = courseUnits.filter((u) => selectedUnitIds.includes(u.id))
    const totalCredits = selectedUnitsList.reduce((acc, u) => acc + (u.credit_hours || 3), 0)

    const receipt: UnitRegistrationReceipt = {
      id: `reg-${Date.now()}`,
      receipt_number: `UNIT-REG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      student_id: targetStudent.id,
      student_name: targetStudent.full_name,
      admission_number: targetStudent.admission_number,
      program: targetStudent.class_name,
      academic_year: regAcademicYear,
      course_duration: regCourseDuration,
      semester: regCourseDuration,
      registered_unit_ids: selectedUnitIds,
      registered_units: selectedUnitsList.map((u) => ({
        code: u.code,
        title: u.title,
        credit_hours: u.credit_hours,
        teacher_name: u.teacher_name,
      })),
      total_credits: totalCredits,
      fee_clearance_status: targetStudent.fee_cleared ? 'Cleared' : 'Conditional Approval',
      registered_by: 'Academic Registrar & Admissions Desk',
      registered_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      exam_card_issued: true,
    }

    await schoolStore.registerStudentUnits(receipt)
    setUnitRegistrations(schoolStore.getUnitRegistrations())
    setShowUnitRegModal(false)
    setSelectedSlipForView(receipt)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">📋 Secretary, Admissions & Registrar Desk</h1>
          <p className="page-subtitle">
            Student admission processing, official admission letters, formal semester unit registration, and front office inquiries.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowUnitRegModal(true)}
          >
            🎓 Register Student Units & Issue Slip
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowInquiryModal(true)}
          >
            + Log Visitor / Intake Inquiry
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Registered Students</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {students.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>All Admissions Processed</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Unit Registrations Issued</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>
            {unitRegistrations.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>Official Slips Generated</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Front Office Inquiries</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.25rem' }}>
            {inquiries.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>Intake & Document Desk</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ea580c' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Accredited Units in Catalog</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ea580c', marginTop: '0.25rem' }}>
            {courseUnits.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>Faculty Curriculum Units</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6" style={{ padding: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'admissions' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('admissions')}
          >
            📜 Admission Letters & Student Register
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'unit_registration' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('unit_registration')}
          >
            🎓 Unit Registration Clearance Slips ({unitRegistrations.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'idcards' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('idcards')}
          >
            🪪 Student ID Card Generator
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'inquiries' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('inquiries')}
          >
            📝 Visitor & Front Desk Inquiries ({inquiries.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Admission Letters */}
      {activeTab === 'admissions' && (
        <div>
          {students.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
              <h3>No Enrolled Students</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                Register students in the Student Directory to generate official provisional admission letters.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Adm No</th>
                      <th>Student Full Name</th>
                      <th>Program & Department</th>
                      <th>Guardian Phone</th>
                      <th>Enrollment Date</th>
                      <th>Status</th>
                      <th>Admission Letter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td><strong>{student.admission_number}</strong></td>
                        <td>{student.full_name}</td>
                        <td>{student.class_name}</td>
                        <td>{student.guardian?.phone || student.emergency_contact}</td>
                        <td>{student.enrollment_date}</td>
                        <td><span className="badge badge-success">{student.status}</span></td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => setSelectedStudentForLetter(student)}
                          >
                            📄 Print Calling Letter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Unit Registrations & Official Slips */}
      {activeTab === 'unit_registration' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Formal Semester Unit Registrations & Exam Slips
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0' }}>
                Students can only access course units that have been officially registered by Management.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowUnitRegModal(true)}
            >
              + Register Units for Student
            </button>
          </div>

          {unitRegistrations.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
              <h4>No Semester Unit Registrations Processed Yet</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Click "+ Register Units for Student" above to clear a student for their semester course units.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Slip Number</th>
                    <th>Adm No</th>
                    <th>Student Name</th>
                    <th>Course Duration</th>
                    <th>Units Cleared</th>
                    <th>Total Credits</th>
                    <th>Fee Status</th>
                    <th>Registration Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unitRegistrations.map((reg) => (
                    <tr key={reg.id}>
                      <td><strong>{reg.receipt_number}</strong></td>
                      <td>{reg.admission_number}</td>
                      <td>{reg.student_name}</td>
                      <td><span className="badge badge-info">{reg.course_duration || reg.semester || '3 Months Short Course'}</span></td>
                      <td><span className="badge badge-primary">{reg.registered_units?.length || 0} Units</span></td>
                      <td><strong>{reg.total_credits} Credits</strong></td>
                      <td>
                        <span className={`badge ${reg.fee_clearance_status === 'Cleared' ? 'badge-success' : 'badge-warning'}`}>
                          ✓ {reg.fee_clearance_status}
                        </span>
                      </td>
                      <td>{reg.registered_at}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          onClick={() => setSelectedSlipForView(reg)}
                        >
                          🖨️ View & Print Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: ID Cards */}
      {activeTab === 'idcards' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Print Student ID Badges</h3>
          {students.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>No students enrolled yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {students.map((std) => (
                <div key={std.id} className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {std.full_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{std.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{std.admission_number}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    {std.class_name}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs btn-block"
                    onClick={() => setSelectedStudentForIdCard(std)}
                  >
                    🪪 Generate ID Badge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Front Office & Visitor Intake Logs</h3>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowInquiryModal(true)}>
              + New Visitor Inquiry
            </button>
          </div>
          {inquiries.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem' }}>No front desk inquiries logged yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Visitor Name</th>
                    <th>Phone</th>
                    <th>Purpose</th>
                    <th>Program</th>
                    <th>Notes</th>
                    <th>Officer</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr key={inq.id}>
                      <td>{inq.created_at}</td>
                      <td><strong>{inq.visitor_name}</strong></td>
                      <td>{inq.phone}</td>
                      <td><span className="badge badge-info">{inq.purpose}</span></td>
                      <td>{inq.program_of_interest || 'General'}</td>
                      <td style={{ maxWidth: '240px' }}>{inq.notes}</td>
                      <td>{inq.recorded_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Register Units Modal */}
      {showUnitRegModal && (
        <div className="modal-overlay" onClick={() => setShowUnitRegModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Formal Semester Course Unit Registration</h3>
              <button type="button" className="modal-close" onClick={() => setShowUnitRegModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCompleteUnitRegistration}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Select Student */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="label">Select Student *</label>
                    <select
                      className="input"
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.admission_number} — {s.full_name} ({s.class_name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Course Duration / Period</label>
                    <select className="input" value={regCourseDuration} onChange={(e) => setRegCourseDuration(e.target.value)}>
                      <option value="1 Month (Intensive Bootcamp)">1 Month (Intensive Bootcamp)</option>
                      <option value="2 Months (Fast-Track Skills)">2 Months (Fast-Track Skills)</option>
                      <option value="3 Months (Certificate Program)">3 Months (Certificate Program)</option>
                      <option value="4 Months (Professional Course)">4 Months (Professional Course)</option>
                      <option value="6 Months (Modular Diploma)">6 Months (Modular Diploma)</option>
                      <option value="2 Weeks (Executive Masterclass)">2 Weeks (Executive Masterclass)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Academic Year</label>
                    <input
                      type="text"
                      className="input"
                      value={regAcademicYear}
                      onChange={(e) => setRegAcademicYear(e.target.value)}
                    />
                  </div>
                </div>

                {/* Course Units Selector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="label" style={{ margin: 0 }}>Select Course Units to Register:</label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                      Selected: {selectedUnitIds.length} Units (
                      {courseUnits
                        .filter((u) => selectedUnitIds.includes(u.id))
                        .reduce((acc, u) => acc + (u.credit_hours || 3), 0)}{' '}
                      Total Credits)
                    </span>
                  </div>

                  {courseUnits.length === 0 ? (
                    <div style={{ padding: '1.5rem', background: 'var(--color-bg-secondary)', borderRadius: '6px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        No course units exist in the curriculum yet. Please build course units in the Faculty Portal first.
                      </p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                      {courseUnits.map((unit) => {
                        const isChecked = selectedUnitIds.includes(unit.id)
                        return (
                          <label
                            key={unit.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.6rem 0.85rem',
                              background: isChecked ? 'rgba(37, 99, 235, 0.08)' : 'var(--color-bg-secondary)',
                              border: isChecked ? '1px solid var(--color-primary)' : '1px solid transparent',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleUnitSelect(unit.id)}
                              />
                              <div>
                                <strong style={{ color: 'var(--color-primary)' }}>{unit.code}</strong> — {unit.title}
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                  {unit.program} • Lecturer: {unit.teacher_name}
                                </div>
                              </div>
                            </div>
                            <span className="badge badge-info">{unit.credit_hours} Credits</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUnitRegModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={courseUnits.length === 0}>
                  🚀 Issue Official Unit Registration Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="modal-overlay" onClick={() => setShowInquiryModal(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Log Front Office Visitor / Inquiry</h3>
              <button type="button" className="modal-close" onClick={() => setShowInquiryModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddInquiry}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="label">Visitor Full Name *</label>
                  <input type="text" required className="input" value={newInquiry.visitor_name} onChange={(e) => setNewInquiry({ ...newInquiry, visitor_name: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input type="tel" required className="input" value={newInquiry.phone} onChange={(e) => setNewInquiry({ ...newInquiry, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" className="input" value={newInquiry.email} onChange={(e) => setNewInquiry({ ...newInquiry, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Program of Interest</label>
                  <input type="text" className="input" value={newInquiry.program_of_interest} onChange={(e) => setNewInquiry({ ...newInquiry, program_of_interest: e.target.value })} />
                </div>
                <div>
                  <label className="label">Notes / Inquiry Summary</label>
                  <textarea rows={3} className="input" value={newInquiry.notes} onChange={(e) => setNewInquiry({ ...newInquiry, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInquiryModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Inquiry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unit Registration Printable Slip Modal */}
      {selectedSlipForView && (
        <UnitRegistrationSlip
          receipt={selectedSlipForView}
          onClose={() => setSelectedSlipForView(null)}
        />
      )}
    </div>
  )
}
