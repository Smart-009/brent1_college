import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  SchoolProfile,
  Student,
  StaffMember,
  FeePayment,
  FeeStructureItem,
  SchoolExpense,
  PayrollRecord,
  ExamMark,
  AttendanceRecord,
  Notice,
  SmsBroadcast,
  TimetableSlot,
  ErpSessionUser,
  UserRole,
  UserAccount,
  ClearanceRecord,
  LibraryBook,
  BookLoan,
  HostelDorm,
  TransportRoute,
  DisciplineIncident,
  AuditLog,
  ClinicVisit,
  ExeatPass,
  CbcAssessment,
} from '../types/schoolErp'
import {
  INITIAL_SCHOOLS,
  INITIAL_STUDENTS,
  INITIAL_STAFF,
  INITIAL_PAYMENTS,
  INITIAL_FEE_STRUCTURES,
  INITIAL_EXPENSES,
  INITIAL_SMS_BROADCASTS,
  INITIAL_EXAMS,
  INITIAL_NOTICES,
  INITIAL_TIMETABLE,
  INITIAL_USER_ACCOUNTS,
  INITIAL_CLEARANCE_RECORDS,
  INITIAL_LIBRARY_BOOKS,
  INITIAL_BOOK_LOANS,
  INITIAL_HOSTELS,
  INITIAL_TRANSPORT_ROUTES,
  INITIAL_DISCIPLINE_INCIDENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLINIC_VISITS,
  INITIAL_EXEAT_PASSES,
  INITIAL_CBC_ASSESSMENTS,
} from '../data/mockSchoolData'

interface SchoolErpContextType {
  activeSchool: SchoolProfile
  setActiveSchool: (school: SchoolProfile) => void
  currentUser: ErpSessionUser | null
  setCurrentUser: (user: ErpSessionUser | null) => void
  schools: SchoolProfile[]
  students: Student[]
  staff: StaffMember[]
  payments: FeePayment[]
  feeStructures: FeeStructureItem[]
  expenses: SchoolExpense[]
  payroll: PayrollRecord[]
  exams: ExamMark[]
  attendance: AttendanceRecord[]
  notices: Notice[]
  smsBroadcasts: SmsBroadcast[]
  timetable: TimetableSlot[]
  accounts: UserAccount[]
  clearances: ClearanceRecord[]
  libraryBooks: LibraryBook[]
  bookLoans: BookLoan[]
  hostels: HostelDorm[]
  transportRoutes: TransportRoute[]
  disciplineIncidents: DisciplineIncident[]
  auditLogs: AuditLog[]
  clinicVisits: ClinicVisit[]
  exeatPasses: ExeatPass[]
  cbcAssessments: CbcAssessment[]
  
  // Actions
  admitStudent: (data: Omit<Student, 'id' | 'admissionNo' | 'totalFeePaid' | 'feeBalance'> & { initialFeeBilled: number }) => Student
  updateStudent: (studentId: string, updates: Partial<Student>) => void
  bulkImportStudents: (imported: Array<{ fullName: string; gender: 'Male' | 'Female'; className: string; stream: string; guardianName: string; guardianPhone: string; feeBilled?: number }>) => number
  onboardStaff: (data: Omit<StaffMember, 'id' | 'employeeNo'>) => StaffMember
  recordPayment: (payment: Omit<FeePayment, 'id' | 'receiptNo' | 'date' | 'receivedBy'>) => FeePayment
  recordExpense: (expense: Omit<SchoolExpense, 'id' | 'voucherNo' | 'date'>) => SchoolExpense
  sendSmsBroadcast: (recipientType: SmsBroadcast['recipientType'], message: string) => SmsBroadcast
  processPayrollForMonth: (month: string, year: number) => void
  recordExamMark: (mark: Omit<ExamMark, 'id' | 'total' | 'grade' | 'points'>) => ExamMark
  saveAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void
  addNotice: (notice: Omit<Notice, 'id' | 'date'>) => void
  loginAsRole: (role: UserRole) => void
  logout: () => void
  exportStudentsCsv: () => string
  exportPaymentsCsv: () => string
  updateAccountStatus: (id: string, status: UserAccount['status']) => void
  resetAccountPin: (id: string, newPin: string) => void
  createAccount: (data: Omit<UserAccount, 'id' | 'createdAt' | 'lastLogin'>) => UserAccount
  updateClearanceSignoff: (id: string, field: 'libraryCleared' | 'bursarCleared' | 'boardingCleared' | 'gamesCleared' | 'principalApproved', value: boolean) => void
  addClearanceRecord: (data: Omit<ClearanceRecord, 'id' | 'clearanceDate'>) => ClearanceRecord
  issueBookLoan: (data: Omit<BookLoan, 'id' | 'borrowDate' | 'status' | 'fineAmount'>) => BookLoan
  returnBookLoan: (loanId: string) => void
  addLibraryBook: (book: Omit<LibraryBook, 'id'>) => LibraryBook
  addDisciplineIncident: (incident: Omit<DisciplineIncident, 'id' | 'date'>) => DisciplineIncident
  resolveDisciplineIncident: (id: string, action: string) => void
  logAudit: (category: AuditLog['actionCategory'], description: string) => void
  logClinicVisit: (data: Omit<ClinicVisit, 'id'>) => ClinicVisit
  issueExeatPass: (data: Omit<ExeatPass, 'id' | 'passNo' | 'status'>) => ExeatPass
  clearExeatReturn: (id: string) => void
  recordCbcAssessment: (data: Omit<CbcAssessment, 'id'>) => CbcAssessment
}

const SchoolErpContext = createContext<SchoolErpContextType | null>(null)

export const SchoolErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Schools
  const [schools, setSchools] = useState<SchoolProfile[]>(() => {
    const saved = localStorage.getItem('eclat_erp_schools')
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS
  })

  const [activeSchool, setActiveSchoolState] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('eclat_erp_active_school_id')
    const found = schools.find((s) => s.id === saved)
    return found || schools[0]
  })

  // 2. Current User
  const [currentUser, setCurrentUserState] = useState<ErpSessionUser | null>(() => {
    const saved = localStorage.getItem('eclat_erp_user')
    if (saved) return JSON.parse(saved)
    return {
      id: 'stf-1',
      name: 'Dr. James Waweru Kamau',
      role: 'admin',
      email: 'principal@school.ac.ke',
      designation: 'Principal & Chief Administrator',
      schoolId: 'school-1',
    }
  })

  // 3. Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('eclat_erp_students')
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS
  })

  // 4. Staff
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('eclat_erp_staff')
    return saved ? JSON.parse(saved) : INITIAL_STAFF
  })

  // 5. Fee Payments
  const [payments, setPayments] = useState<FeePayment[]>(() => {
    const saved = localStorage.getItem('eclat_erp_payments')
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS
  })

  // 6. Fee Structures
  const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>(() => {
    const saved = localStorage.getItem('eclat_erp_fee_structures')
    return saved ? JSON.parse(saved) : INITIAL_FEE_STRUCTURES
  })

  // 7. Expenses
  const [expenses, setExpenses] = useState<SchoolExpense[]>(() => {
    const saved = localStorage.getItem('eclat_erp_expenses')
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES
  })

  // 8. Payroll Records
  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('eclat_erp_payroll')
    if (saved) return JSON.parse(saved)
    return INITIAL_STAFF.map((emp) => calculatePayrollForStaff(emp, 'January', 2026))
  })

  // 9. Exam Marks
  const [exams, setExams] = useState<ExamMark[]>(() => {
    const saved = localStorage.getItem('eclat_erp_exams')
    return saved ? JSON.parse(saved) : INITIAL_EXAMS
  })

  // 10. Attendance
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('eclat_erp_attendance')
    return saved ? JSON.parse(saved) : []
  })

  // 11. Notices
  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('eclat_erp_notices')
    return saved ? JSON.parse(saved) : INITIAL_NOTICES
  })

  // 12. SMS Broadcasts
  const [smsBroadcasts, setSmsBroadcasts] = useState<SmsBroadcast[]>(() => {
    const saved = localStorage.getItem('eclat_erp_sms')
    return saved ? JSON.parse(saved) : INITIAL_SMS_BROADCASTS
  })

  // 13. Timetable
  const [timetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE)

  // 14. Accounts & Credentials
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('eclat_erp_accounts')
    return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS
  })

  // 15. Student Clearance
  const [clearances, setClearances] = useState<ClearanceRecord[]>(() => {
    const saved = localStorage.getItem('eclat_erp_clearances')
    return saved ? JSON.parse(saved) : INITIAL_CLEARANCE_RECORDS
  })

  // 16. Library Books & Loans
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(() => {
    const saved = localStorage.getItem('eclat_erp_library_books')
    return saved ? JSON.parse(saved) : INITIAL_LIBRARY_BOOKS
  })

  const [bookLoans, setBookLoans] = useState<BookLoan[]>(() => {
    const saved = localStorage.getItem('eclat_erp_book_loans')
    return saved ? JSON.parse(saved) : INITIAL_BOOK_LOANS
  })

  // 17. Hostels & Transport
  const [hostels, setHostels] = useState<HostelDorm[]>(() => {
    const saved = localStorage.getItem('eclat_erp_hostels')
    return saved ? JSON.parse(saved) : INITIAL_HOSTELS
  })

  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>(() => {
    const saved = localStorage.getItem('eclat_erp_transport_routes')
    return saved ? JSON.parse(saved) : INITIAL_TRANSPORT_ROUTES
  })

  // 18. Discipline & Pastoral
  const [disciplineIncidents, setDisciplineIncidents] = useState<DisciplineIncident[]>(() => {
    const saved = localStorage.getItem('eclat_erp_discipline')
    return saved ? JSON.parse(saved) : INITIAL_DISCIPLINE_INCIDENTS
  })

  // 19. System Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('eclat_erp_audit_logs')
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS
  })

  // 20. Sanatorium Clinic Visits
  const [clinicVisits, setClinicVisits] = useState<ClinicVisit[]>(() => {
    const saved = localStorage.getItem('eclat_erp_clinic_visits')
    return saved ? JSON.parse(saved) : INITIAL_CLINIC_VISITS
  })

  // 21. Student Exeat & Gate Passes
  const [exeatPasses, setExeatPasses] = useState<ExeatPass[]>(() => {
    const saved = localStorage.getItem('eclat_erp_exeat_passes')
    return saved ? JSON.parse(saved) : INITIAL_EXEAT_PASSES
  })

  // 22. CBC Competency Assessments
  const [cbcAssessments, setCbcAssessments] = useState<CbcAssessment[]>(() => {
    const saved = localStorage.getItem('eclat_erp_cbc_assessments')
    return saved ? JSON.parse(saved) : INITIAL_CBC_ASSESSMENTS
  })

  // LocalStorage Sync Effects
  useEffect(() => { localStorage.setItem('eclat_erp_schools', JSON.stringify(schools)) }, [schools])
  useEffect(() => { localStorage.setItem('eclat_erp_active_school_id', activeSchool.id) }, [activeSchool])
  useEffect(() => {
    if (currentUser) localStorage.setItem('eclat_erp_user', JSON.stringify(currentUser))
    else localStorage.removeItem('eclat_erp_user')
  }, [currentUser])
  useEffect(() => { localStorage.setItem('eclat_erp_students', JSON.stringify(students)) }, [students])
  useEffect(() => { localStorage.setItem('eclat_erp_staff', JSON.stringify(staff)) }, [staff])
  useEffect(() => { localStorage.setItem('eclat_erp_payments', JSON.stringify(payments)) }, [payments])
  useEffect(() => { localStorage.setItem('eclat_erp_fee_structures', JSON.stringify(feeStructures)) }, [feeStructures])
  useEffect(() => { localStorage.setItem('eclat_erp_expenses', JSON.stringify(expenses)) }, [expenses])
  useEffect(() => { localStorage.setItem('eclat_erp_payroll', JSON.stringify(payroll)) }, [payroll])
  useEffect(() => { localStorage.setItem('eclat_erp_exams', JSON.stringify(exams)) }, [exams])
  useEffect(() => { localStorage.setItem('eclat_erp_attendance', JSON.stringify(attendance)) }, [attendance])
  useEffect(() => { localStorage.setItem('eclat_erp_notices', JSON.stringify(notices)) }, [notices])
  useEffect(() => { localStorage.setItem('eclat_erp_sms', JSON.stringify(smsBroadcasts)) }, [smsBroadcasts])
  useEffect(() => { localStorage.setItem('eclat_erp_accounts', JSON.stringify(accounts)) }, [accounts])
  useEffect(() => { localStorage.setItem('eclat_erp_clearances', JSON.stringify(clearances)) }, [clearances])
  useEffect(() => { localStorage.setItem('eclat_erp_library_books', JSON.stringify(libraryBooks)) }, [libraryBooks])
  useEffect(() => { localStorage.setItem('eclat_erp_book_loans', JSON.stringify(bookLoans)) }, [bookLoans])
  useEffect(() => { localStorage.setItem('eclat_erp_hostels', JSON.stringify(hostels)) }, [hostels])
  useEffect(() => { localStorage.setItem('eclat_erp_transport_routes', JSON.stringify(transportRoutes)) }, [transportRoutes])
  useEffect(() => { localStorage.setItem('eclat_erp_discipline', JSON.stringify(disciplineIncidents)) }, [disciplineIncidents])
  useEffect(() => { localStorage.setItem('eclat_erp_audit_logs', JSON.stringify(auditLogs)) }, [auditLogs])
  useEffect(() => { localStorage.setItem('eclat_erp_clinic_visits', JSON.stringify(clinicVisits)) }, [clinicVisits])
  useEffect(() => { localStorage.setItem('eclat_erp_exeat_passes', JSON.stringify(exeatPasses)) }, [exeatPasses])
  useEffect(() => { localStorage.setItem('eclat_erp_cbc_assessments', JSON.stringify(cbcAssessments)) }, [cbcAssessments])

  function calculatePayrollForStaff(emp: StaffMember, month: string, year: number): PayrollRecord {
    const gross = emp.basicSalary + emp.allowances
    let paye = 0
    if (gross <= 24000) paye = gross * 0.1
    else if (gross <= 32333) paye = 2400 + (gross - 24000) * 0.25
    else paye = 2400 + 2083 + (gross - 32333) * 0.3
    paye = Math.max(0, Math.round(paye - 2400))
    const nhif = Math.round(gross * 0.0275)
    const nssf = Math.min(2160, Math.round(gross * 0.06))
    const housingLevy = Math.round(gross * 0.015)
    const totalDeductions = paye + nhif + nssf + housingLevy
    const netSalary = gross - totalDeductions

    return {
      id: `pr-${emp.id}-${month.toLowerCase()}-${year}`,
      staffId: emp.id,
      staffName: emp.fullName,
      employeeNo: emp.employeeNo,
      designation: emp.designation,
      month,
      year,
      basicSalary: emp.basicSalary,
      allowances: emp.allowances,
      grossSalary: gross,
      paye,
      nhif,
      nssf,
      housingLevy,
      totalDeductions,
      netSalary,
      status: 'Paid',
      paymentDate: `${year}-01-28`,
    }
  }

  function calculateGrade(total: number): { grade: ExamMark['grade']; points: number } {
    if (total >= 80) return { grade: 'A', points: 12 }
    if (total >= 75) return { grade: 'A-', points: 11 }
    if (total >= 70) return { grade: 'B+', points: 10 }
    if (total >= 65) return { grade: 'B', points: 9 }
    if (total >= 60) return { grade: 'B-', points: 8 }
    if (total >= 55) return { grade: 'C+', points: 7 }
    if (total >= 50) return { grade: 'C', points: 6 }
    if (total >= 45) return { grade: 'C-', points: 5 }
    if (total >= 40) return { grade: 'D+', points: 4 }
    if (total >= 35) return { grade: 'D', points: 3 }
    return { grade: 'E', points: 1 }
  }

  const setActiveSchool = (s: SchoolProfile) => setActiveSchoolState(s)
  const setCurrentUser = (u: ErpSessionUser | null) => setCurrentUserState(u)

  const logAudit = (category: AuditLog['actionCategory'], description: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' }),
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      actionCategory: category,
      description,
      ipAddress: '192.168.1.' + Math.floor(100 + Math.random() * 50),
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  const admitStudent = (data: Omit<Student, 'id' | 'admissionNo' | 'totalFeePaid' | 'feeBalance'> & { initialFeeBilled: number }): Student => {
    const nextNum = students.length + 1
    const pad = String(nextNum).padStart(3, '0')
    const admissionNo = `ADM-2026-${pad}`
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      admissionNo,
      totalFeeBilled: data.initialFeeBilled,
      totalFeePaid: 0,
      feeBalance: data.initialFeeBilled,
    }
    setStudents((prev) => [newStudent, ...prev])
    logAudit('Students', `Admitted new student ${data.fullName} into ${data.className} (Assigned ${admissionNo})`)
    return newStudent
  }

  const updateStudent = (studentId: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s)))
  }

  const bulkImportStudents = (imported: Array<{ fullName: string; gender: 'Male' | 'Female'; className: string; stream: string; guardianName: string; guardianPhone: string; feeBilled?: number }>): number => {
    const newStudents: Student[] = imported.map((item, idx) => {
      const nextNum = students.length + idx + 1
      const pad = String(nextNum).padStart(3, '0')
      const initialFee = item.feeBilled || 45000
      return {
        id: `std-bulk-${Date.now()}-${idx}`,
        admissionNo: `ADM-2026-${pad}`,
        fullName: item.fullName,
        gender: item.gender,
        dateOfBirth: '2010-01-01',
        className: item.className || 'Grade 10',
        stream: item.stream || 'East',
        guardianName: item.guardianName,
        guardianPhone: item.guardianPhone,
        guardianEmail: `${item.fullName.toLowerCase().replace(/\s+/g, '.')}@guardian.com`,
        guardianRelation: 'Parent',
        bloodGroup: 'O+',
        feeBalance: initialFee,
        totalFeeBilled: initialFee,
        totalFeePaid: 0,
        status: 'Active',
        enrollmentDate: new Date().toISOString().split('T')[0],
      }
    })
    setStudents((prev) => [...newStudents, ...prev])
    return newStudents.length
  }

  const onboardStaff = (data: Omit<StaffMember, 'id' | 'employeeNo'>): StaffMember => {
    const nextNum = staff.length + 1
    const employeeNo = `EMP-${String(nextNum).padStart(3, '0')}`
    const newMember: StaffMember = {
      ...data,
      id: `stf-${Date.now()}`,
      employeeNo,
    }
    setStaff((prev) => [...prev, newMember])
    return newMember
  }

  const recordPayment = (paymentData: Omit<FeePayment, 'id' | 'receiptNo' | 'date' | 'receivedBy'>): FeePayment => {
    const receiptNo = `RCP-2026-${String(payments.length + 1001)}`
    const newPayment: FeePayment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNo,
      date: new Date().toISOString().split('T')[0],
      receivedBy: currentUser?.name || 'Madam Catherine Achieng',
    }

    setPayments((prev) => [newPayment, ...prev])

    setStudents((prev) =>
      prev.map((std) => {
        if (std.id === paymentData.studentId) {
          const newPaid = std.totalFeePaid + paymentData.amount
          const newBal = Math.max(0, std.totalFeeBilled - newPaid)
          return {
            ...std,
            totalFeePaid: newPaid,
            feeBalance: newBal,
          }
        }
        return std
      })
    )

    logAudit('Finance', `Received fee payment of ${activeSchool.currency} ${paymentData.amount.toLocaleString()} for ${paymentData.studentName} (${paymentData.admissionNo}) via ${paymentData.paymentMethod} (Ref: ${paymentData.reference})`)

    return newPayment
  }

  const recordExpense = (expenseData: Omit<SchoolExpense, 'id' | 'voucherNo' | 'date'>): SchoolExpense => {
    const voucherNo = `PV-2026-${String(expenses.length + 104)}`
    const newExpense: SchoolExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      voucherNo,
      date: new Date().toISOString().split('T')[0],
    }
    setExpenses((prev) => [newExpense, ...prev])
    logAudit('Finance', `Approved campus expense voucher ${voucherNo} for ${activeSchool.currency} ${expenseData.amount.toLocaleString()} (${expenseData.category}: ${expenseData.description})`)
    return newExpense
  }

  const sendSmsBroadcast = (recipientType: SmsBroadcast['recipientType'], message: string): SmsBroadcast => {
    let count = students.length
    if (recipientType === 'Fee Defaulters') {
      count = students.filter((s) => s.feeBalance > 0).length
    } else if (recipientType === 'Teaching Staff') {
      count = staff.filter((s) => s.role === 'teacher').length
    }

    const newSms: SmsBroadcast = {
      id: `sms-${Date.now()}`,
      recipientType,
      message,
      recipientCount: count,
      timestamp: new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'Delivered',
    }
    setSmsBroadcasts((prev) => [newSms, ...prev])
    return newSms
  }

  const processPayrollForMonth = (month: string, year: number) => {
    const newPayrollRecords = staff.map((emp) => calculatePayrollForStaff(emp, month, year))
    setPayroll(newPayrollRecords)
  }

  const recordExamMark = (markData: Omit<ExamMark, 'id' | 'total' | 'grade' | 'points'>): ExamMark => {
    const total = markData.opener + markData.midterm + markData.endterm
    const { grade, points } = calculateGrade(total)
    const newMark: ExamMark = {
      ...markData,
      id: `ex-${Date.now()}`,
      total,
      grade,
      points,
    }
    setExams((prev) => [newMark, ...prev.filter((e) => !(e.studentId === markData.studentId && e.subject === markData.subject))])
    return newMark
  }

  const saveAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    const newRecords: AttendanceRecord[] = records.map((r, i) => ({
      ...r,
      id: `att-${Date.now()}-${i}`,
    }))
    setAttendance((prev) => [...newRecords, ...prev])
  }

  const addNotice = (noticeData: Omit<Notice, 'id' | 'date'>) => {
    const newNotice: Notice = {
      ...noticeData,
      id: `ntc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    }
    setNotices((prev) => [newNotice, ...prev])
  }

  const loginAsRole = (role: UserRole) => {
    let mockUser: ErpSessionUser
    if (role === 'admin') {
      const p = staff.find((s) => s.role === 'admin') || staff[0]
      mockUser = {
        id: p.id,
        name: p.fullName,
        role: 'admin',
        email: p.email,
        designation: p.designation,
        schoolId: activeSchool.id,
      }
    } else if (role === 'bursar') {
      const b = staff.find((s) => s.role === 'bursar') || staff[1]
      mockUser = {
        id: b.id,
        name: b.fullName,
        role: 'bursar',
        email: b.email,
        designation: b.designation,
        schoolId: activeSchool.id,
      }
    } else if (role === 'teacher') {
      const t = staff.find((s) => s.role === 'teacher') || staff[2]
      mockUser = {
        id: t.id,
        name: t.fullName,
        role: 'teacher',
        email: t.email,
        designation: t.designation,
        schoolId: activeSchool.id,
      }
    } else {
      const std = students[0]
      mockUser = {
        id: std.id,
        name: std.fullName,
        role: 'student',
        email: std.guardianEmail,
        designation: `Student (${std.className} - ${std.stream})`,
        schoolId: activeSchool.id,
        studentId: std.id,
      }
    }
    setCurrentUser(mockUser)
  }

  const logout = () => setCurrentUser(null)

  const exportStudentsCsv = (): string => {
    const headers = 'Admission No,Full Name,Gender,Class,Stream,Guardian Name,Guardian Phone,Fee Billed,Fee Paid,Fee Balance\n'
    const rows = students
      .map((s) => `"${s.admissionNo}","${s.fullName}","${s.gender}","${s.className}","${s.stream}","${s.guardianName}","${s.guardianPhone}",${s.totalFeeBilled},${s.totalFeePaid},${s.feeBalance}`)
      .join('\n')
    return headers + rows
  }

  const exportPaymentsCsv = (): string => {
    const headers = 'Receipt No,Date,Student Name,Admission No,Class,Method,Reference,Amount,Received By\n'
    const rows = payments
      .map((p) => `"${p.receiptNo}","${p.date}","${p.studentName}","${p.admissionNo}","${p.className}","${p.paymentMethod}","${p.reference}",${p.amount},"${p.receivedBy}"`)
      .join('\n')
    return headers + rows
  }

  const updateAccountStatus = (id: string, status: UserAccount['status']) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, status } : acc))
    )
    logAudit('Security', `Updated account status for user ID ${id} to "${status}"`)
  }

  const resetAccountPin = (id: string, newPin: string) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, tempPin: newPin, status: 'MustChangePassword' } : acc))
    )
    logAudit('Security', `Reset temporary access PIN for account ID ${id}`)
  }

  const createAccount = (data: Omit<UserAccount, 'id' | 'createdAt' | 'lastLogin'>): UserAccount => {
    const newAcc: UserAccount = {
      ...data,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
    }
    setAccounts((prev) => [newAcc, ...prev])
    logAudit('Security', `Created system login account for ${data.fullName} (${data.role.toUpperCase()})`)
    return newAcc
  }

  const updateClearanceSignoff = (
    id: string,
    field: 'libraryCleared' | 'bursarCleared' | 'boardingCleared' | 'gamesCleared' | 'principalApproved',
    value: boolean
  ) => {
    setClearances((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
    logAudit('Students', `Updated clearance signoff ${field}=${value} on clearance ID ${id}`)
  }

  const addClearanceRecord = (data: Omit<ClearanceRecord, 'id' | 'clearanceDate'>): ClearanceRecord => {
    const nextNum = clearances.length + 1
    const newClr: ClearanceRecord = {
      ...data,
      id: `clr-${Date.now()}`,
      clearanceDate: new Date().toISOString().split('T')[0],
      leavingCertificateNo: `SLC/2026/${String(nextNum).padStart(4, '0')}`,
    }
    setClearances((prev) => [newClr, ...prev])
    logAudit('Students', `Initiated exit clearance dossier for ${data.studentName} (${data.admissionNo})`)
    return newClr
  }

  const issueBookLoan = (data: Omit<BookLoan, 'id' | 'borrowDate' | 'status' | 'fineAmount'>): BookLoan => {
    const newLoan: BookLoan = {
      ...data,
      id: `ln-${Date.now()}`,
      borrowDate: new Date().toISOString().split('T')[0],
      status: 'Borrowed',
      fineAmount: 0,
    }
    setBookLoans((prev) => [newLoan, ...prev])
    // Decrement available copies
    setLibraryBooks((prev) =>
      prev.map((bk) =>
        bk.id === data.bookId ? { ...bk, availableCopies: Math.max(0, bk.availableCopies - 1) } : bk
      )
    )
    logAudit('System', `Issued library book "${data.bookTitle}" to ${data.borrowerName} (${data.borrowerRole})`)
    return newLoan
  }

  const returnBookLoan = (loanId: string) => {
    const foundLoan = bookLoans.find((l) => l.id === loanId)
    if (!foundLoan) return
    setBookLoans((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, status: 'Returned', returnDate: new Date().toISOString().split('T')[0] } : l
      )
    )
    // Increment available copies
    setLibraryBooks((prev) =>
      prev.map((bk) =>
        bk.id === foundLoan.bookId ? { ...bk, availableCopies: bk.availableCopies + 1 } : bk
      )
    )
    logAudit('System', `Recorded return of library book "${foundLoan.bookTitle}" from ${foundLoan.borrowerName}`)
  }

  const addLibraryBook = (bookData: Omit<LibraryBook, 'id'>): LibraryBook => {
    const newBook: LibraryBook = {
      ...bookData,
      id: `bk-${Date.now()}`,
    }
    setLibraryBooks((prev) => [newBook, ...prev])
    logAudit('System', `Cataloged new library accession: "${bookData.title}" by ${bookData.author}`)
    return newBook
  }

  const addDisciplineIncident = (incidentData: Omit<DisciplineIncident, 'id' | 'date'>): DisciplineIncident => {
    const newIncident: DisciplineIncident = {
      ...incidentData,
      id: `dsc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    }
    setDisciplineIncidents((prev) => [newIncident, ...prev])
    logAudit('Students', `Recorded ${incidentData.severity} pastoral/conduct incident for ${incidentData.studentName}`)
    return newIncident
  }

  const resolveDisciplineIncident = (id: string, action: string) => {
    setDisciplineIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'Resolved', actionTaken: action } : i))
    )
    logAudit('Students', `Resolved pastoral/discipline incident ID ${id}`)
  }

  const logClinicVisit = (data: Omit<ClinicVisit, 'id'>): ClinicVisit => {
    const newVisit: ClinicVisit = {
      ...data,
      id: `cln-${Date.now()}`,
    }
    setClinicVisits((prev) => [newVisit, ...prev])
    logAudit('Students', `Recorded sanatorium sick bay visit for ${data.studentName}: ${data.diagnosis}`)
    return newVisit
  }

  const issueExeatPass = (data: Omit<ExeatPass, 'id' | 'passNo' | 'status'>): ExeatPass => {
    const passNo = `EXEAT-2026-${String(exeatPasses.length + 101)}`
    const newPass: ExeatPass = {
      ...data,
      id: `ext-${Date.now()}`,
      passNo,
      status: 'Active / Off-Campus',
    }
    setExeatPasses((prev) => [newPass, ...prev])
    logAudit('Security', `Authorized exeat gate pass ${passNo} for ${data.studentName} (${data.reason})`)
    return newPass
  }

  const clearExeatReturn = (id: string) => {
    const now = new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
    setExeatPasses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Returned & Cleared', actualReturnDate: now } : p))
    )
    logAudit('Security', `Cleared campus gate return for exeat pass ID ${id}`)
  }

  const recordCbcAssessment = (data: Omit<CbcAssessment, 'id'>): CbcAssessment => {
    const newAss: CbcAssessment = {
      ...data,
      id: `cbc-${Date.now()}`,
    }
    setCbcAssessments((prev) => [newAss, ...prev])
    logAudit('Academics', `Evaluated CBC rubric for ${data.studentName} in ${data.learningArea} (${data.performanceLevel})`)
    return newAss
  }

  return (
    <SchoolErpContext.Provider
      value={{
        activeSchool,
        setActiveSchool,
        currentUser,
        setCurrentUser,
        schools,
        students,
        staff,
        payments,
        feeStructures,
        expenses,
        payroll,
        exams,
        attendance,
        notices,
        smsBroadcasts,
        timetable,
        accounts,
        clearances,
        libraryBooks,
        bookLoans,
        hostels,
        transportRoutes,
        disciplineIncidents,
        auditLogs,
        clinicVisits,
        exeatPasses,
        cbcAssessments,
        admitStudent,
        updateStudent,
        bulkImportStudents,
        onboardStaff,
        recordPayment,
        recordExpense,
        sendSmsBroadcast,
        processPayrollForMonth,
        recordExamMark,
        saveAttendance,
        addNotice,
        loginAsRole,
        logout,
        exportStudentsCsv,
        exportPaymentsCsv,
        updateAccountStatus,
        resetAccountPin,
        createAccount,
        updateClearanceSignoff,
        addClearanceRecord,
        issueBookLoan,
        returnBookLoan,
        addLibraryBook,
        addDisciplineIncident,
        resolveDisciplineIncident,
        logAudit,
        logClinicVisit,
        issueExeatPass,
        clearExeatReturn,
        recordCbcAssessment,
      }}
    >
      {children}
    </SchoolErpContext.Provider>
  )
}

export const useSchoolErp = () => {
  const context = useContext(SchoolErpContext)
  if (!context) throw new Error('useSchoolErp must be used within a SchoolErpProvider')
  return context
}
