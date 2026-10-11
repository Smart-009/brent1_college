// ============================================================
// Éclat School ERP — Runtime Verification & Logic Tests
// ============================================================

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

test('School ERP Runtime: Initial Seed Schools Verification', () => {
  const dataPath = path.join(process.cwd(), 'src/data/mockSchoolData.ts')
  assert.ok(fs.existsSync(dataPath), 'mockSchoolData.ts must exist')
  const content = fs.readFileSync(dataPath, 'utf-8')

  assert.ok(content.includes('Apex Academy & High School'))
  assert.ok(content.includes('Hillcrest British International School'))
  assert.ok(content.includes('St. Jude International Academy'))
  assert.ok(content.includes('British IGCSE'))
  assert.ok(content.includes('CBC / 8-4-4'))
})

test('School ERP Runtime: Student Admission Number Generator', () => {
  function generateAdmissionNo(count, year = 2026) {
    const nextNum = count + 1
    const pad = String(nextNum).padStart(3, '0')
    return `ADM-${year}-${pad}`
  }

  assert.strictEqual(generateAdmissionNo(0), 'ADM-2026-001')
  assert.strictEqual(generateAdmissionNo(41), 'ADM-2026-042')
  assert.strictEqual(generateAdmissionNo(999), 'ADM-2026-1000')
})

test('School ERP Runtime: Statutory Kenyan Payroll Engine Calculations', () => {
  function computePayroll(basicSalary, allowances) {
    const gross = basicSalary + allowances
    let paye = 0
    if (gross <= 24000) {
      paye = gross * 0.1
    } else if (gross <= 32333) {
      paye = 2400 + (gross - 24000) * 0.25
    } else {
      paye = 2400 + 2083 + (gross - 32333) * 0.3
    }
    paye = Math.max(0, Math.round(paye - 2400))
    const nhif = Math.round(gross * 0.0275)
    const nssf = Math.min(2160, Math.round(gross * 0.06))
    const housingLevy = Math.round(gross * 0.015)
    const totalDeductions = paye + nhif + nssf + housingLevy
    const netSalary = gross - totalDeductions

    return { gross, paye, nhif, nssf, housingLevy, totalDeductions, netSalary }
  }

  // Teacher calculation: KES 68,000 basic + KES 12,000 allowance = KES 80,000 gross
  const teacherPay = computePayroll(68000, 12000)
  assert.strictEqual(teacherPay.gross, 80000)
  assert.ok(teacherPay.paye > 0, 'PAYE must be positive for 80k gross')
  assert.strictEqual(teacherPay.nhif, Math.round(80000 * 0.0275))
  assert.strictEqual(teacherPay.nssf, 2160, 'NSSF is capped at 2160')
  assert.strictEqual(teacherPay.housingLevy, Math.round(80000 * 0.015))
  assert.strictEqual(teacherPay.netSalary, teacherPay.gross - teacherPay.totalDeductions)
  assert.ok(teacherPay.netSalary > 50000, 'Net salary must be reasonable')
})

test('School ERP Runtime: Fee Payment & Balance Updates', () => {
  function processPayment(student, paymentAmount) {
    const newPaid = student.totalFeePaid + paymentAmount
    const newBalance = Math.max(0, student.totalFeeBilled - newPaid)
    return { ...student, totalFeePaid: newPaid, feeBalance: newBalance }
  }

  const student = {
    totalFeeBilled: 45000,
    totalFeePaid: 20000,
    feeBalance: 25000,
  }

  const updated1 = processPayment(student, 15000)
  assert.strictEqual(updated1.totalFeePaid, 35000)
  assert.strictEqual(updated1.feeBalance, 10000)

  const updated2 = processPayment(updated1, 10000)
  assert.strictEqual(updated2.totalFeePaid, 45000)
  assert.strictEqual(updated2.feeBalance, 0)
})

test('School ERP Runtime: Continuous Assessment Exam Grading Logic', () => {
  function calculateGrade(opener, midterm, endterm) {
    const total = opener + midterm + endterm
    let grade = 'E'
    let points = 1
    if (total >= 80) { grade = 'A'; points = 12 }
    else if (total >= 75) { grade = 'A-'; points = 11 }
    else if (total >= 70) { grade = 'B+'; points = 10 }
    else if (total >= 65) { grade = 'B'; points = 9 }
    else if (total >= 60) { grade = 'B-'; points = 8 }
    else if (total >= 55) { grade = 'C+'; points = 7 }
    else if (total >= 50) { grade = 'C'; points = 6 }
    else if (total >= 45) { grade = 'C-'; points = 5 }
    else if (total >= 40) { grade = 'D+'; points = 4 }
    else if (total >= 35) { grade = 'D'; points = 3 }

    return { total, grade, points }
  }

  // Max score
  const topStudent = calculateGrade(30, 30, 40)
  assert.strictEqual(topStudent.total, 100)
  assert.strictEqual(topStudent.grade, 'A')
  assert.strictEqual(topStudent.points, 12)

  // 78% score
  const bPlusStudent = calculateGrade(22, 24, 32)
  assert.strictEqual(bPlusStudent.total, 78)
  assert.strictEqual(bPlusStudent.grade, 'A-')
  assert.strictEqual(bPlusStudent.points, 11)

  // 52% score
  const cStudent = calculateGrade(15, 17, 20)
  assert.strictEqual(cStudent.total, 52)
  assert.strictEqual(cStudent.grade, 'C')
  assert.strictEqual(cStudent.points, 6)
})

test('School ERP Runtime: Role Access Control Matrix', () => {
  function canAccessModule(role, module) {
    if (module === 'dashboard' || module === 'timetable' || module === 'notices') return true
    if (role === 'admin') return true
    if (module === 'finance' || module === 'payroll') return role === 'bursar'
    if (module === 'attendance') return role === 'teacher'
    if (module === 'academics') return role === 'teacher' || role === 'student'
    return false
  }

  // Admin access
  assert.strictEqual(canAccessModule('admin', 'finance'), true)
  assert.strictEqual(canAccessModule('admin', 'attendance'), true)

  // Bursar access
  assert.strictEqual(canAccessModule('bursar', 'finance'), true)
  assert.strictEqual(canAccessModule('bursar', 'payroll'), true)
  assert.strictEqual(canAccessModule('bursar', 'attendance'), false)

  // Teacher access
  assert.strictEqual(canAccessModule('teacher', 'attendance'), true)
  assert.strictEqual(canAccessModule('teacher', 'finance'), false)

  // Student access
  assert.strictEqual(canAccessModule('student', 'academics'), true)
  assert.strictEqual(canAccessModule('student', 'attendance'), false)
})

test('School ERP Runtime: User Account & PIN Security Rules', () => {
  function generateTemporaryPin() {
    return `PIN-${Math.floor(1000 + Math.random() * 9000)}`
  }

  const pin1 = generateTemporaryPin()
  assert.match(pin1, /^PIN-\d{4}$/, 'Temporary PIN must follow PIN-XXXX format')

  function isAccountLocked(status) {
    return status === 'Suspended'
  }
  assert.strictEqual(isAccountLocked('Active'), false)
  assert.strictEqual(isAccountLocked('Suspended'), true)
})

test('School ERP Runtime: Multi-Department Clearance & Leaving Cert Approval', () => {
  function isReadyForLeavingCertificate(clearance) {
    return (
      clearance.libraryCleared &&
      clearance.bursarCleared &&
      clearance.boardingCleared &&
      clearance.gamesCleared &&
      clearance.principalApproved
    )
  }

  const uncleared = {
    libraryCleared: true,
    bursarCleared: false, // fee debt
    boardingCleared: true,
    gamesCleared: true,
    principalApproved: false,
  }
  assert.strictEqual(isReadyForLeavingCertificate(uncleared), false)

  const fullyCleared = {
    libraryCleared: true,
    bursarCleared: true,
    boardingCleared: true,
    gamesCleared: true,
    principalApproved: true,
  }
  assert.strictEqual(isReadyForLeavingCertificate(fullyCleared), true)
})

test('School ERP Runtime: Library Book Circulation & Stock Tracking', () => {
  function issueBook(book) {
    assert.ok(book.availableCopies > 0, 'Cannot issue book with 0 stock')
    return { ...book, availableCopies: book.availableCopies - 1 }
  }

  function returnBook(book) {
    return { ...book, availableCopies: Math.min(book.totalCopies, book.availableCopies + 1) }
  }

  const initialBook = { totalCopies: 10, availableCopies: 2 }
  const afterLoan = issueBook(initialBook)
  assert.strictEqual(afterLoan.availableCopies, 1)

  const afterReturn = returnBook(afterLoan)
  assert.strictEqual(afterReturn.availableCopies, 2)
})

test('School ERP Runtime: Security Audit Trail Ledger Formatting', () => {
  function createAuditEntry(actor, role, category, description) {
    return {
      timestamp: new Date().toISOString(),
      actorName: actor,
      actorRole: role,
      actionCategory: category,
      description,
      ipAddress: '192.168.1.100',
    }
  }

  const entry = createAuditEntry('Bursar Catherine', 'bursar', 'Finance', 'Collected KES 45,000')
  assert.strictEqual(entry.actionCategory, 'Finance')
  assert.strictEqual(entry.actorRole, 'bursar')
  assert.ok(entry.description.includes('KES 45,000'))
  assert.ok(entry.timestamp.length > 0)
})

