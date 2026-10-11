export type UserRole = 'admin' | 'bursar' | 'teacher' | 'student'

export interface SchoolProfile {
  id: string
  name: string
  code: string
  motto: string
  logoText: string
  crestColor: string
  curriculum: 'CBC / 8-4-4' | 'British IGCSE' | 'American / AP' | 'International Baccalaureate'
  academicYear: string
  currentTerm: string
  calendarSystem: 'terms' | 'semesters'
  address: string
  phone: string
  email: string
  website: string
  currency: string
}

export interface Student {
  id: string
  admissionNo: string
  fullName: string
  gender: 'Male' | 'Female'
  dateOfBirth: string
  className: string
  stream: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  guardianRelation?: string
  bloodGroup?: string
  medicalNotes?: string
  feeBalance: number
  totalFeeBilled: number
  totalFeePaid: number
  status: 'Active' | 'Suspended' | 'Alumni'
  enrollmentDate: string
}

export interface StaffMember {
  id: string
  employeeNo: string
  fullName: string
  role: UserRole
  designation: string
  department: string
  phone: string
  email: string
  nationalId: string
  basicSalary: number
  allowances: number
  employmentType: 'Full-Time' | 'Contract' | 'Part-Time'
  status: 'Active' | 'On Leave' | 'Terminated'
}

export interface FeePayment {
  id: string
  receiptNo: string
  studentId: string
  studentName: string
  admissionNo: string
  className: string
  amount: number
  paymentMethod: 'M-Pesa' | 'Bank Wire' | 'Cheque' | 'Cash'
  reference: string
  date: string
  term: string
  academicYear: string
  receivedBy: string
}

export interface FeeStructureItem {
  id: string
  className: string
  term: string
  tuitionFee: number
  boardingFee: number
  activityFee: number
  labExamFee: number
  totalTermFee: number
}

export interface SchoolExpense {
  id: string
  voucherNo: string
  category: 'Utilities & Water' | 'Stationery & Books' | 'Food & Catering' | 'Repairs & Maintenance' | 'Transport & Fuel' | 'Staff Welfare'
  description: string
  amount: number
  date: string
  approvedBy: string
  paymentMethod: 'M-Pesa' | 'Bank' | 'Cash'
}

export interface PayrollRecord {
  id: string
  staffId: string
  staffName: string
  employeeNo: string
  designation: string
  month: string
  year: number
  basicSalary: number
  allowances: number
  grossSalary: number
  paye: number
  nhif: number
  nssf: number
  housingLevy: number
  totalDeductions: number
  netSalary: number
  status: 'Paid' | 'Pending' | 'Draft'
  paymentDate?: string
}

export interface ExamMark {
  id: string
  studentId: string
  studentName: string
  admissionNo: string
  className: string
  subject: string
  opener: number // max 30
  midterm: number // max 30
  endterm: number // max 40
  total: number // max 100
  grade: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E'
  points: number
  teacherRemarks: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  className: string
  date: string
  status: 'Present' | 'Absent' | 'Late' | 'Excused'
}

export interface Notice {
  id: string
  title: string
  content: string
  category: 'General' | 'Academic' | 'Finance' | 'Events'
  targetAudience: 'All' | 'Teachers' | 'Students' | 'Guardians'
  date: string
  publishedBy: string
}

export interface SmsBroadcast {
  id: string
  recipientType: 'All Guardians' | 'Fee Defaulters' | 'Specific Class' | 'Teaching Staff'
  message: string
  recipientCount: number
  timestamp: string
  status: 'Delivered' | 'Pending' | 'Failed'
}

export interface TimetableSlot {
  id: string
  className: string
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  time: string
  subject: string
  teacherName: string
  room: string
}

export interface ErpSessionUser {
  id: string
  name: string
  role: UserRole
  email: string
  designation: string
  schoolId: string
  studentId?: string
}

export interface UserAccount {
  id: string
  username: string
  fullName: string
  role: UserRole
  linkedEntityId?: string
  tempPin: string
  status: 'Active' | 'Suspended' | 'MustChangePassword'
  lastLogin: string
  createdAt: string
}

export interface ClearanceRecord {
  id: string
  studentId: string
  studentName: string
  admissionNo: string
  className: string
  academicYear: string
  exitReason: 'Graduation' | 'Transfer' | 'Completed'
  libraryCleared: boolean
  bursarCleared: boolean
  boardingCleared: boolean
  gamesCleared: boolean
  principalApproved: boolean
  clearanceDate: string
  conductRemarks: string
  kcseIndexNo?: string
  leavingCertificateNo?: string
}

export interface LibraryBook {
  id: string
  isbn: string
  title: string
  author: string
  category: 'Science' | 'Mathematics' | 'Languages' | 'Humanities' | 'Literature' | 'General'
  totalCopies: number
  availableCopies: number
  shelfLocation: string
}

export interface BookLoan {
  id: string
  bookId: string
  bookTitle: string
  borrowerId: string
  borrowerName: string
  borrowerRole: 'Student' | 'Staff'
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: 'Borrowed' | 'Returned' | 'Overdue'
  fineAmount: number
}

export interface HostelDorm {
  id: string
  name: string
  gender: 'Boys' | 'Girls' | 'Mixed'
  capacity: number
  occupied: number
  wardenName: string
  wardenPhone: string
  wing: string
}

export interface TransportRoute {
  id: string
  routeName: string
  vehicleReg: string
  driverName: string
  driverPhone: string
  pickupZones: string[]
  feePerTerm: number
  enrolledStudentCount: number
}

export interface DisciplineIncident {
  id: string
  studentId: string
  studentName: string
  admissionNo: string
  className: string
  date: string
  incidentType: 'Truancy' | 'Dress Code' | 'Bullying' | 'Vandalism' | 'Insubordination' | 'Exemplary Leadership' | 'Academic Malpractice'
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Commendation'
  actionTaken: string
  status: 'Active' | 'Resolved' | 'Under Review'
  reportedBy: string
}

export interface AuditLog {
  id: string
  timestamp: string
  actorName: string
  actorRole: UserRole
  actionCategory: 'Finance' | 'Academics' | 'Students' | 'Staff' | 'Security' | 'System'
  description: string
  ipAddress: string
}

export interface ClinicVisit {
  id: string
  studentId: string
  studentName: string
  admissionNo: string
  className: string
  visitDate: string
  symptomsComplained: string
  diagnosis: string
  treatmentAdministered: string
  medicationDispensed: string
  nurseName: string
  status: 'Treated & Discharged' | 'Admitted to Sick Bay' | 'Referred to Hospital'
  parentNotified: boolean
  notes?: string
}

export interface ExeatPass {
  id: string
  passNo: string
  studentId: string
  studentName: string
  admissionNo: string
  className: string
  departureDate: string
  expectedReturnDate: string
  actualReturnDate?: string
  reason: 'Medical Appointment' | 'Family Emergency' | 'School Event' | 'Home Weekend'
  authorizedBy: string
  accompaniedBy: string
  status: 'Active / Off-Campus' | 'Returned & Cleared' | 'Overdue'
}

export interface CbcAssessment {
  id: string
  studentId: string
  studentName: string
  admissionNo: string
  className: string
  learningArea: string
  strand: string
  substrand: string
  performanceLevel: 'EE' | 'ME' | 'AE' | 'BE' // Exceeding, Meeting, Approaching, Below Expectations
  coreCompetencies: string[]
  valuesDemonstrated: string[]
  teacherRemarks: string
  assessmentTerm: string
}


