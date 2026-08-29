import { useState, useMemo } from 'react'
import { schoolStore } from '@/lib/schoolData'
import type { StudentRecord, PaymentReminder } from '@/types/school'
import { BiometricEnrollModal } from '@/components/biometrics/BiometricEnrollModal'
import { BiometricScannerModal } from '@/components/biometrics/BiometricScannerModal'

export function StudentDirectory() {
  const [students, setStudents] = useState<StudentRecord[]>(() => schoolStore.getStudents())
  const [departments] = useState(() => schoolStore.getDepartments())
  const [subjects] = useState(() => schoolStore.getSubjects())

  // Dynamic program options derived from active departments and subjects
  const programOptions = useMemo(() => {
    const fromSubjects = subjects.map((s) => s.name)
    const fromDepts = departments.flatMap((d) => d.programs || [])
    return Array.from(new Set([...fromSubjects, ...fromDepts]))
  }, [departments, subjects])

  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [feeFilter, setFeeFilter] = useState('All')
  const [biometricFilter, setBiometricFilter] = useState<'All' | 'Enrolled' | 'Not Enrolled'>('All')
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [studentToEnroll, setStudentToEnroll] = useState<StudentRecord | null>(null)
  const [showBiometricStation, setShowBiometricStation] = useState(false)
  const [reminderTarget, setReminderTarget] = useState<StudentRecord | null>(null)
  const [bulkReminderSuccess, setBulkReminderSuccess] = useState<string | null>(null)

  // New Student Form State
  const [newStudent, setNewStudent] = useState<Partial<StudentRecord>>({
    full_name: '',
    admission_number: `BC-${new Date().getFullYear()}-00${students.length + 1}`,
    gender: 'Male',
    grade_level: '4 to 12 Weeks (Short Course Certificate)',
    stream: 'Practical Lab Trainee',
    class_name: programOptions[0] || 'Comprehensive Computer Packages & Digital Skills',
    dob: '2005-01-01',
    status: 'Active',
    fee_balance: 0,
    term_fee_total: 4500,
    attendance_rate: 100,
    discipline_points: 100,
    merits_count: 0,
    demerits_count: 0,
    guardian: {
      name: '',
      relationship: 'Father',
      phone: '',
      email: '',
      occupation: '',
      address: '',
    },
  })

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.guardian.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchClass = classFilter === 'All' || s.class_name.includes(classFilter)
      const matchFee =
        feeFilter === 'All' ||
        (feeFilter === 'Cleared' && s.fee_balance === 0) ||
        (feeFilter === 'Outstanding' && s.fee_balance > 0)

      const matchBiometric =
        biometricFilter === 'All' ||
        (biometricFilter === 'Enrolled' && s.biometric_enrolled) ||
        (biometricFilter === 'Not Enrolled' && !s.biometric_enrolled)

      return matchSearch && matchClass && matchFee && matchBiometric
    })
  }, [students, searchTerm, classFilter, feeFilter, biometricFilter])

  // --- Excel / CSV Export ---
  const handleExportExcel = () => {
    const headers = [
      'Admission Number',
      'Full Name',
      'Gender',
      'Date of Birth',
      'Program / Diploma',
      'Academic Year & Semester',
      'Stream / Specialization',
      'Enrollment Date',
      'Status',
      'Guardian Name',
      'Relationship',
      'Guardian Phone',
      'Guardian Email',
      'Emergency Contact',
      'Fee Billed (KES)',
      'Fee Balance (KES)',
      'Fee Status',
      'Attendance Rate (%)',
      'Discipline Index (100)',
      'Merits Awarded',
    ]

    const rows = filteredStudents.map((s) => [
      `"${s.admission_number}"`,
      `"${s.full_name}"`,
      `"${s.gender}"`,
      `"${s.dob}"`,
      `"${s.class_name}"`,
      `"${s.grade_level}"`,
      `"${s.stream}"`,
      `"${s.enrollment_date}"`,
      `"${s.status}"`,
      `"${s.guardian.name}"`,
      `"${s.guardian.relationship}"`,
      `"${s.guardian.phone}"`,
      `"${s.guardian.email}"`,
      `"${s.emergency_contact}"`,
      s.term_fee_total,
      s.fee_balance,
      `"${s.fee_cleared ? 'Cleared' : 'Outstanding'}"`,
      `${s.attendance_rate}%`,
      s.discipline_points,
      s.merits_count,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Brent_College_Students_Registry_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // --- Add Student ---
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudent.full_name || !newStudent.admission_number) return

    const record: StudentRecord = {
      id: `std-${Date.now()}`,
      admission_number: newStudent.admission_number || `BC-2026-00${students.length + 1}`,
      full_name: newStudent.full_name || '',
      gender: newStudent.gender as 'Male' | 'Female',
      dob: newStudent.dob || '2005-01-01',
      class_id: 'cls-custom',
      class_name: newStudent.class_name || 'Diploma in Computer Science & ICT',
      grade_level: newStudent.grade_level || 'Year 1 (Semester 1)',
      stream: newStudent.stream || 'Software Engineering',
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'Active',
      guardian: newStudent.guardian || {
        name: 'Parent / Sponsor',
        relationship: 'Father',
        phone: '+254 700 000 000',
        email: 'guardian@example.ke',
      },
      emergency_contact: newStudent.guardian?.phone || '+254 700 000 000',
      blood_group: 'O+',
      fee_balance: Number(newStudent.fee_balance) || 0,
      term_fee_total: Number(newStudent.term_fee_total) || 48000,
      fee_cleared: Number(newStudent.fee_balance) === 0,
      attendance_rate: 100,
      discipline_points: 100,
      merits_count: 0,
      demerits_count: 0,
    }

    schoolStore.addStudent(record)
    setStudents(schoolStore.getStudents())
    setShowAddModal(false)
  }

  // --- Edit Student ---
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return

    schoolStore.updateStudent(editingStudent.id, {
      ...editingStudent,
      fee_cleared: editingStudent.fee_balance === 0,
    })
    setStudents(schoolStore.getStudents())
    if (selectedStudent?.id === editingStudent.id) {
      setSelectedStudent(editingStudent)
    }
    setEditingStudent(null)
  }

  // --- Delete Student ---
  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove student "${name}" from the active registry?`)) {
      schoolStore.deleteStudent(id)
      setStudents(schoolStore.getStudents())
      setSelectedStudent(null)
    }
  }

  // --- Send Single Payment Reminder ---
  const handleDispatchReminder = (student: StudentRecord) => {
    const reminder: PaymentReminder = {
      id: `rem-${Date.now()}`,
      student_id: student.id,
      student_name: student.full_name,
      admission_number: student.admission_number,
      guardian_name: student.guardian.name,
      guardian_phone: student.guardian.phone,
      amount_due: student.fee_balance,
      channel: 'SMS',
      message_text: `Dear ${student.guardian.name}, reminder from Brent College Accounts: ${student.full_name} (${student.admission_number}) has an outstanding tuition balance of KES ${student.fee_balance.toLocaleString()}. Pay via Paybill 247247, Acc: ${student.admission_number}. Thank you.`,
      sent_by: 'Bursar & Accounts Desk',
      sent_at: new Date().toLocaleString(),
      status: 'Delivered',
    }

    schoolStore.sendReminder(reminder)
    setReminderTarget(null)
    setBulkReminderSuccess(`SMS payment reminder successfully sent to ${student.guardian.name} (${student.guardian.phone})!`)
    setTimeout(() => setBulkReminderSuccess(null), 5000)
  }

  // --- Send Bulk Payment Reminders ---
  const handleSendBulkReminders = () => {
    const overdueList = students.filter((s) => s.fee_balance > 0)
    if (overdueList.length === 0) {
      alert('All students currently have cleared fees. No reminders to dispatch!')
      return
    }

    overdueList.forEach((student) => {
      schoolStore.sendReminder({
        id: `rem-${Date.now()}-${student.id}`,
        student_id: student.id,
        student_name: student.full_name,
        admission_number: student.admission_number,
        guardian_name: student.guardian.name,
        guardian_phone: student.guardian.phone,
        amount_due: student.fee_balance,
        channel: 'SMS',
        message_text: `Dear ${student.guardian.name}, reminder from Brent College Accounts: ${student.full_name} (${student.admission_number}) has an outstanding tuition balance of KES ${student.fee_balance.toLocaleString()}. Pay via Paybill 247247, Acc: ${student.admission_number}. Thank you.`,
        sent_by: 'Bursar & Accounts Desk (Bulk Dispatch)',
        sent_at: new Date().toLocaleString(),
        status: 'Delivered',
      })
    })

    setBulkReminderSuccess(`Bulk SMS Payment Reminders dispatched to ${overdueList.length} guardian contacts!`)
    setTimeout(() => setBulkReminderSuccess(null), 6000)
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Student Information System (SIS)</h1>
          <p className="page-subtitle">
            Comprehensive college student directory, guardian contacts, program enrollments, fee accounts, and biometric security registry.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: '#0284c7', borderColor: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setShowBiometricStation(true)}
          >
            <span>🖐️</span> Biometric Fee Verification
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportExcel}
            title="Export filtered student list to Microsoft Excel"
          >
            📥 Download Excel (.xlsx / .csv)
          </button>
          <button
            type="button"
            className="btn"
            style={{ background: '#f59e0b', color: '#78350f', fontWeight: 700 }}
            onClick={handleSendBulkReminders}
            title="Dispatch payment SMS reminders to all students with overdue balances"
          >
            📢 Send Overdue Payment Reminders
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Register New Student
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {bulkReminderSuccess && (
        <div className="card mb-4" style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.85rem 1.25rem' }}>
          ✅ {bulkReminderSuccess}
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Enrolled Students</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {students.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>100% Active Attendance</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Fees Cleared Rate</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#16a34a', marginTop: '0.25rem' }}>
            {students.length > 0 ? Math.round((students.filter((s) => s.fee_cleared).length / students.length) * 100) : 100}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            {students.filter((s) => s.fee_cleared).length} cleared of {students.length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Biometric Fingerprints</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0284c7', marginTop: '0.25rem' }}>
            {students.filter((s) => s.biometric_enrolled).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.2rem' }}>
            {students.length > 0 ? Math.round((students.filter((s) => s.biometric_enrolled).length / students.length) * 100) : 0}% Enrolled
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ea580c' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Outstanding Fee Accounts</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ea580c', marginTop: '0.25rem' }}>
            {students.filter((s) => s.fee_balance > 0).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Total Overdue: KES {students.reduce((acc, s) => acc + s.fee_balance, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-6" style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label className="label" style={{ fontSize: '0.75rem' }}>Search Student, Admission # or Guardian</label>
            <input
              type="text"
              className="input"
              placeholder={`e.g. Abdi Hassan or BC-${new Date().getFullYear()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="label" style={{ fontSize: '0.75rem' }}>Filter by Program</label>
            <select
              className="input"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="All">All Programs & Departments</option>
              {programOptions.map((prog) => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" style={{ fontSize: '0.75rem' }}>Fee Clearance Status</label>
            <select
              className="input"
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
            >
              <option value="All">All Fee Statuses</option>
              <option value="Cleared">Fee Cleared (0 Balance)</option>
              <option value="Outstanding">Has Outstanding Balance</option>
            </select>
          </div>

          <div>
            <label className="label" style={{ fontSize: '0.75rem' }}>Biometric Registry</label>
            <select
              className="input"
              value={biometricFilter}
              onChange={(e) => setBiometricFilter(e.target.value as any)}
            >
              <option value="All">All Students</option>
              <option value="Enrolled">🟢 Biometrically Enrolled</option>
              <option value="Not Enrolled">⚪ Not Enrolled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Adm No.</th>
                <th>Student Name</th>
                <th>Program & Year</th>
                <th>Biometrics</th>
                <th>Guardian Contact</th>
                <th>Attendance</th>
                <th>Fee Status</th>
                <th style={{ textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                    No student records found. Click "+ Register New Student" to add a student to the directory.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{std.admission_number}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{std.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{std.gender} • DOB: {std.dob}</div>
                    </td>
                    <td>
                      <div className="badge badge-info">{std.class_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{std.grade_level}</div>
                    </td>
                    <td>
                      {std.biometric_enrolled ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                            🟢 {std.biometric_finger_name || 'Enrolled'}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-xs btn-secondary"
                          style={{ fontSize: '0.7rem', color: '#0284c7', borderColor: '#bae6fd' }}
                          onClick={() => {
                            setStudentToEnroll(std)
                            setShowEnrollModal(true)
                          }}
                        >
                          🖐️ Enroll
                        </button>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{std.guardian.name} ({std.guardian.relationship})</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{std.guardian.phone}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', width: '50px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${std.attendance_rate}%`,
                              background: std.attendance_rate >= 90 ? '#16a34a' : '#ea580c',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{std.attendance_rate}%</span>
                      </div>
                    </td>
                    <td>
                      {std.fee_balance === 0 ? (
                        <span className="badge badge-success">✓ Cleared</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span className="badge badge-warning">
                            KES {std.fee_balance.toLocaleString()} Due
                          </span>
                          <button
                            type="button"
                            className="btn btn-xs"
                            style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '0.7rem' }}
                            onClick={() => setReminderTarget(std)}
                          >
                            📢 Remind Payer
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedStudent(std)}
                          title="View Profile Dossier"
                        >
                          👁️ Dossier
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setEditingStudent(std)}
                          title="Edit Student Information"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteStudent(std.id, std.full_name)}
                          title="Delete / Archive Student"
                        >
                          🗑️
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

      {/* Student Profile Detailed Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                  }}
                >
                  {selectedStudent.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="modal-title">{selectedStudent.full_name}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Admission No: <strong>{selectedStudent.admission_number}</strong> • {selectedStudent.class_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Bio Details */}
              <div className="card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                  👤 Personal & Academic Bio
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div><strong>Gender:</strong> {selectedStudent.gender}</div>
                  <div><strong>Date of Birth:</strong> {selectedStudent.dob}</div>
                  <div><strong>Program:</strong> {selectedStudent.class_name}</div>
                  <div><strong>Year & Semester:</strong> {selectedStudent.grade_level}</div>
                  <div><strong>Specialization:</strong> {selectedStudent.stream}</div>
                  <div><strong>Enrollment Date:</strong> {selectedStudent.enrollment_date}</div>
                  <div><strong>Blood Group:</strong> {selectedStudent.blood_group || 'O+'}</div>
                  <div><strong>Status:</strong> <span className="badge badge-success">{selectedStudent.status}</span></div>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                  👨‍👩‍👦 Guardian & Sponsor Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div><strong>Guardian Name:</strong> {selectedStudent.guardian.name}</div>
                  <div><strong>Relationship:</strong> {selectedStudent.guardian.relationship}</div>
                  <div><strong>Phone Number:</strong> {selectedStudent.guardian.phone}</div>
                  <div><strong>Email Address:</strong> {selectedStudent.guardian.email}</div>
                  <div><strong>Occupation:</strong> {selectedStudent.guardian.occupation || 'N/A'}</div>
                  <div><strong>Residential Address:</strong> {selectedStudent.guardian.address || 'Nairobi, Kenya'}</div>
                  <div><strong>Emergency Hotline:</strong> {selectedStudent.emergency_contact}</div>
                </div>
              </div>

              {/* Financial & Fee Status */}
              <div className="card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                  💳 Tuition & Financial Ledger
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div><strong>Total Semester Billed:</strong> KES {selectedStudent.term_fee_total.toLocaleString()}</div>
                  <div><strong>Outstanding Balance:</strong> <span style={{ fontWeight: 700, color: selectedStudent.fee_balance > 0 ? '#ea580c' : '#16a34a' }}>KES {selectedStudent.fee_balance.toLocaleString()}</span></div>
                  <div><strong>Clearance Status:</strong> {selectedStudent.fee_cleared ? <span className="badge badge-success">Fully Cleared</span> : <span className="badge badge-warning">Pending Payment</span>}</div>
                  <div><strong>Exam Clearance Card:</strong> {selectedStudent.fee_cleared ? 'Issued & Valid' : 'Withheld until balance cleared'}</div>
                </div>
              </div>

              {/* Conduct & Attendance */}
              <div className="card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                  ⭐ Conduct & Lecture Attendance
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div><strong>Lecture Attendance Rate:</strong> {selectedStudent.attendance_rate}%</div>
                  <div><strong>Discipline Index:</strong> {selectedStudent.discipline_points}/100</div>
                  <div><strong>Merit Commendations:</strong> ⭐ {selectedStudent.merits_count} awarded</div>
                  <div><strong>Demerit Points:</strong> ⚠️ {selectedStudent.demerits_count} recorded</div>
                  <div><strong>Dean’s Standing:</strong> <span className="badge badge-info">Honors Standing</span></div>
                </div>
              </div>

              {/* Biometric Security & Fingerprint Registry Card */}
              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #0284c7' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0284c7' }}>
                  🖐️ Biometric Security & Fee Clearance Registry
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div>
                    <strong>Enrollment Status:</strong>{' '}
                    {selectedStudent.biometric_enrolled ? (
                      <span className="badge badge-success">✓ Active & Enrolled</span>
                    ) : (
                      <span className="badge badge-danger">Not Enrolled</span>
                    )}
                  </div>
                  {selectedStudent.biometric_enrolled ? (
                    <>
                      <div><strong>Primary Finger:</strong> 🖐️ {selectedStudent.biometric_finger_name || 'Right Index'}</div>
                      <div><strong>Enrolled Date:</strong> {selectedStudent.biometric_enrolled_at ? new Date(selectedStudent.biometric_enrolled_at).toLocaleDateString() : 'Active'}</div>
                      <div><strong>Enrolled Officer:</strong> {selectedStudent.biometric_enrolled_by || 'Bursar Desk'}</div>
                      <div>
                        <strong>Template Hash:</strong>{' '}
                        <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                          {selectedStudent.biometric_template_hash?.slice(0, 24)}...
                        </code>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      No fingerprint recorded yet. Student must enroll biometrics for instant exam sitting clearance and fee payment verification.
                    </div>
                  )}

                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      style={{ background: '#0284c7', borderColor: '#0284c7', width: '100%' }}
                      onClick={() => {
                        setStudentToEnroll(selectedStudent)
                        setShowEnrollModal(true)
                      }}
                    >
                      {selectedStudent.biometric_enrolled ? '🖐️ Re-scan & Update Fingerprint' : '🖐️ Enroll Student Fingerprint'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                >
                  🖨️ Print Dossier
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingStudent(selectedStudent)
                    setSelectedStudent(null)
                  }}
                >
                  ✏️ Edit Student Info
                </button>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedStudent(null)}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="modal-overlay" onClick={() => setEditingStudent(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Student Record: {editingStudent.full_name}</h3>
              <button type="button" className="modal-close" onClick={() => setEditingStudent(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={editingStudent.full_name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Admission Number *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={editingStudent.admission_number}
                      onChange={(e) => setEditingStudent({ ...editingStudent, admission_number: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Gender</label>
                    <select
                      className="input"
                      value={editingStudent.gender}
                      onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as any })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Date of Birth</label>
                    <input
                      type="date"
                      className="input"
                      value={editingStudent.dob}
                      onChange={(e) => setEditingStudent({ ...editingStudent, dob: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      className="input"
                      value={editingStudent.status}
                      onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Transferred">Transferred</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Program / Diploma Title</label>
                    <input
                      type="text"
                      className="input"
                      value={editingStudent.class_name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, class_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Academic Year / Semester</label>
                    <input
                      type="text"
                      className="input"
                      value={editingStudent.grade_level}
                      onChange={(e) => setEditingStudent({ ...editingStudent, grade_level: e.target.value })}
                    />
                  </div>
                </div>

                {/* Guardian Details */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                    Guardian & Sponsor Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="label">Guardian Name</label>
                      <input
                        type="text"
                        className="input"
                        value={editingStudent.guardian.name}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            guardian: { ...editingStudent.guardian, name: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Guardian Phone</label>
                      <input
                        type="text"
                        className="input"
                        value={editingStudent.guardian.phone}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            guardian: { ...editingStudent.guardian, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Guardian Email</label>
                      <input
                        type="email"
                        className="input"
                        value={editingStudent.guardian.email}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            guardian: { ...editingStudent.guardian, email: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Balances */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                    Fees & Attendance
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="label">Total Term Fee (KES)</label>
                      <input
                        type="number"
                        className="input"
                        value={editingStudent.term_fee_total}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, term_fee_total: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Outstanding Balance (KES)</label>
                      <input
                        type="number"
                        className="input"
                        value={editingStudent.fee_balance}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, fee_balance: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Attendance Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="input"
                        value={editingStudent.attendance_rate}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, attendance_rate: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingStudent(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Payment Reminder Modal */}
      {reminderTarget && (
        <div className="modal-overlay" onClick={() => setReminderTarget(null)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Send Payment SMS Reminder</h3>
              <button type="button" className="modal-close" onClick={() => setReminderTarget(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                <div><strong>Student:</strong> {reminderTarget.full_name} ({reminderTarget.admission_number})</div>
                <div><strong>Guardian / Sponsor:</strong> {reminderTarget.guardian.name}</div>
                <div><strong>Recipient Phone:</strong> 📲 {reminderTarget.guardian.phone}</div>
                <div><strong>Outstanding Balance:</strong> <span style={{ color: '#ea580c', fontWeight: 700 }}>KES {reminderTarget.fee_balance.toLocaleString()}</span></div>
              </div>

              <div>
                <label className="label" style={{ fontSize: '0.8rem' }}>SMS Message Preview:</label>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '0.85rem',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    color: '#1e293b',
                    fontFamily: 'monospace',
                  }}
                >
                  Dear {reminderTarget.guardian.name}, reminder from Brent College Accounts: {reminderTarget.full_name} ({reminderTarget.admission_number}) has an outstanding tuition balance of KES {reminderTarget.fee_balance.toLocaleString()}. Kindly clear via Paybill 247247, Acc: {reminderTarget.admission_number} before the examination clearance deadline.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setReminderTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleDispatchReminder(reminderTarget)}
              >
                📲 Dispatch SMS Reminder Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register New College Student</h3>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Enter student full name"
                    value={newStudent.full_name}
                    onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Admission Number *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={newStudent.admission_number}
                      onChange={(e) => setNewStudent({ ...newStudent, admission_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select
                      className="input"
                      value={newStudent.gender}
                      onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'Male' | 'Female' })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="label">Enrolled Short Course / Program *</label>
                    <select
                      className="input"
                      value={newStudent.class_name}
                      onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                    >
                      {programOptions.map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Course Duration</label>
                    <select
                      className="input"
                      value={newStudent.grade_level}
                      onChange={(e) => setNewStudent({ ...newStudent, grade_level: e.target.value })}
                    >
                      <option value="1 Month (Intensive Bootcamp)">1 Month (Intensive Bootcamp)</option>
                      <option value="2 Months (Fast-Track Skills)">2 Months (Fast-Track Skills)</option>
                      <option value="3 Months (Certificate Program)">3 Months (Certificate Program)</option>
                      <option value="4 Months (Professional Course)">4 Months (Professional Course)</option>
                      <option value="6 Months (Modular Diploma)">6 Months (Modular Diploma)</option>
                      <option value="2 Weeks (Executive Masterclass)">2 Weeks (Executive Masterclass)</option>
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Guardian / Sponsor Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="label">Guardian Name *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="Enter guardian full name"
                        value={newStudent.guardian?.name}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            guardian: { ...newStudent.guardian!, name: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Guardian Phone *</label>
                      <input
                        type="tel"
                        required
                        className="input"
                        placeholder="+254 700 000 000"
                        value={newStudent.guardian?.phone}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            guardian: { ...newStudent.guardian!, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save & Enroll Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Biometric Student Enrollment Modal */}
      {showEnrollModal && studentToEnroll && (
        <BiometricEnrollModal
          student={studentToEnroll}
          officerName="Registrar Desk"
          onClose={() => {
            setShowEnrollModal(false)
            setStudentToEnroll(null)
          }}
          onEnrolled={(updated) => {
            setStudents(schoolStore.getStudents())
            if (selectedStudent && selectedStudent.id === updated.id) {
              setSelectedStudent(updated)
            }
          }}
        />
      )}

      {/* Biometric Scanner Terminal Modal */}
      {showBiometricStation && (
        <BiometricScannerModal
          officerName="Registrar Desk"
          onClose={() => setShowBiometricStation(false)}
        />
      )}
    </div>
  )
}
