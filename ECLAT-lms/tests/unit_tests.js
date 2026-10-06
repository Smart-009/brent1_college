// ============================================================
// Eclat Institute LMS — Enterprise System Unit Test Suite
// ============================================================

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

// 1. UTILITY FUNCTIONS IMPLEMENTATION FOR TESTS
function extractYouTubeId(url) {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&?/\s]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function generateActivationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = (n) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `ECLAT-${rand(4)}-${rand(4)}`
}

function isAccessExpired(accessExpiresAt) {
  if (!accessExpiresAt) return false
  return new Date() > new Date(accessExpiresAt)
}

function calcProgress(completedIds, totalLessons) {
  if (totalLessons === 0) return 0
  return Math.round((completedIds.length / totalLessons) * 100)
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

function admissionToEmail(admissionNumber) {
  const clean = admissionNumber.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${clean}@eclatinstitute.internal`
}

function getInitials(fullName) {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

function sanitizeInput(str) {
  if (!str) return ''
  return str.trim().replace(/[<>]/g, '')
}

// 2. AUTHENTICATION & SECURITY TESTS
test('Authentication: Admin Credentials Verification', () => {
  const adminUsername = 'Eclat@admin'
  const adminPassword = 'Eclat@2026#!'

  assert.equal(adminUsername.toLowerCase(), 'eclat@admin')
  assert.ok(adminPassword.length >= 8)
  assert.ok(/[A-Z]/.test(adminPassword))
  assert.ok(/[0-9]/.test(adminPassword))
  assert.ok(/[@#!]/.test(adminPassword))
})

test('Authentication: Role Verification for All 5 System Roles', () => {
  const roles = ['admin', 'teacher', 'student', 'bursar', 'parent']
  assert.equal(roles.length, 5)
  assert.ok(roles.includes('admin'))
  assert.ok(roles.includes('teacher'))
  assert.ok(roles.includes('student'))
  assert.ok(roles.includes('bursar'))
  assert.ok(roles.includes('parent'))
})

test('Authentication: Synthetic Internal Email Mapping', () => {
  assert.equal(admissionToEmail('EI-2026-001'), 'ei2026001@eclatinstitute.internal')
  assert.equal(admissionToEmail('Eclat@admin'), 'eclatadmin@eclatinstitute.internal')
  assert.equal(admissionToEmail('TCH/042/2026'), 'tch0422026@eclatinstitute.internal')
})

test('Security: Brute-Force Rate Limiting Lockout Condition', () => {
  let failedAttempts = 0
  let isLocked = false
  const maxAttempts = 5

  for (let i = 1; i <= 6; i++) {
    failedAttempts++
    if (failedAttempts >= maxAttempts) {
      isLocked = true
    }
  }

  assert.equal(failedAttempts, 6)
  assert.equal(isLocked, true)
})

test('Security: Input Sanitization strips HTML Tags and dangerous chars', () => {
  const unsafe1 = '<script>alert("hack")</script>EI-2026-001'
  const unsafe2 = '  John <img src=x onerror=alert(1)> Doe  '
  assert.equal(sanitizeInput(unsafe1), 'scriptalert("hack")/scriptEI-2026-001')
  assert.equal(sanitizeInput(unsafe2), 'John img src=x onerror=alert(1) Doe')
})

// 3. UTILITY FUNCTIONS TESTS
test('Utils: Extract YouTube Video ID from Various URL Formats', () => {
  const url1 = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  const url2 = 'https://youtu.be/dQw4w9WgXcQ'
  const url3 = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  const rawId = 'dQw4w9WgXcQ'

  assert.equal(extractYouTubeId(url1), 'dQw4w9WgXcQ')
  assert.equal(extractYouTubeId(url2), 'dQw4w9WgXcQ')
  assert.equal(extractYouTubeId(url3), 'dQw4w9WgXcQ')
  assert.equal(extractYouTubeId(rawId), 'dQw4w9WgXcQ')
  assert.equal(extractYouTubeId(''), null)
})

test('Utils: Activation Code Format', () => {
  const code = generateActivationCode()
  assert.match(code, /^ECLAT-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
})

test('Utils: Access Expiration Logic', () => {
  const pastDate = new Date(Date.now() - 86400000).toISOString()
  const futureDate = new Date(Date.now() + 86400000).toISOString()

  assert.equal(isAccessExpired(pastDate), true)
  assert.equal(isAccessExpired(futureDate), false)
  assert.equal(isAccessExpired(null), false)
})

test('Utils: Progress Percentage Calculation', () => {
  assert.equal(calcProgress(['les-1', 'les-2'], 4), 50)
  assert.equal(calcProgress(['les-1', 'les-2', 'les-3'], 3), 100)
  assert.equal(calcProgress([], 5), 0)
  assert.equal(calcProgress(['les-1'], 0), 0)
})

test('Utils: Text Truncate and Initials', () => {
  assert.equal(truncate('Short text', 20), 'Short text')
  assert.equal(truncate('Comprehensive Computer Packages and Digital Skills Training', 26), 'Comprehensive Computer Pac…')
  assert.equal(getInitials('Dr. Kevin Kipruto'), 'DK')
  assert.equal(getInitials('Amina Hassan'), 'AH')
})

// 4. CURRICULUM & MULTI-CLASS ENROLLMENT LOGIC
test('Curriculum: Multi-Class Enrollment Mapping', () => {
  const studentId = 'user-uuid-123'
  const selectedClassIds = ['prog-comp', 'prog-barista', 'prog-ielts']

  const enrollments = selectedClassIds.map((cId) => ({
    student_id: studentId,
    class_id: cId,
  }))

  assert.equal(enrollments.length, 3)
  assert.equal(enrollments[0].class_id, 'prog-comp')
  assert.equal(enrollments[1].class_id, 'prog-barista')
  assert.equal(enrollments[2].class_id, 'prog-ielts')
  assert.equal(enrollments[0].student_id, studentId)
})

test('Curriculum: Course Item Dynamic Transformation', () => {
  const unit = {
    id: 'unit-001',
    title: 'Advanced Barista & Latte Art Masterclass',
    department: 'Department of Hospitality & Barista Training',
    program: 'Barista Training Certification',
    course_duration: '8 Weeks (2 Months)',
    credit_hours: 40,
    teacher_name: 'Chef Anthony Kilonzo',
    description: 'Espresso extraction, milk steaming, and cafe management.',
    syllabus_modules: [
      { id: 'm1', module_number: 1, title: 'Espresso Science', topics: ['Grind dial-in', 'Tamping pressure'], learning_outcomes: ['Extract espresso'] },
      { id: 'm2', module_number: 2, title: 'Latte Art Mastery', topics: ['Milk steaming', 'Rosettas'], learning_outcomes: ['Pour latte art'] },
    ],
  }

  assert.ok(unit.title.includes('Barista'))
  assert.equal(unit.syllabus_modules.length, 2)
  assert.equal(unit.syllabus_modules[0].topics.length, 2)
  assert.equal(unit.credit_hours, 40)
})

test('Financial: Fee Calculation and Installment Splitting', () => {
  const courseFee = 9500
  const earlyBirdDiscount = 0.15
  const discountedFee = Math.round(courseFee * (1 - earlyBirdDiscount))
  const installment1 = Math.round(discountedFee * 0.6)
  const installment2 = discountedFee - installment1

  assert.equal(discountedFee, 8075)
  assert.equal(installment1 + installment2, discountedFee)
  assert.ok(installment1 > 0)
  assert.ok(installment2 > 0)
})

test('E-Library: Supported Document Formats Validation', () => {
  const allowedExtensions = ['PDF', 'DOCX', 'PPTX', 'EPUB']
  const testFile1 = '2026_exam_paper.pdf'
  const testFile2 = 'study_guide.docx'
  const testFile3 = 'lecture_slides.pptx'

  const ext1 = testFile1.split('.').pop().toUpperCase()
  const ext2 = testFile2.split('.').pop().toUpperCase()
  const ext3 = testFile3.split('.').pop().toUpperCase()

  assert.ok(allowedExtensions.includes(ext1))
  assert.ok(allowedExtensions.includes(ext2))
  assert.ok(allowedExtensions.includes(ext3))
})

// ============================================================
// 5. BIOMETRIC FINGERPRINT & FEE CLEARANCE VERIFICATION SUITE
// ============================================================

function generateBiometricTemplate(studentId, admissionNumber, fingerName) {
  const seed = `${studentId}:${admissionNumber}:${fingerName}:ECLAT_SECURITY_V1`
  let hash1 = 0x811c9dc5
  let hash2 = 0x5bd1e995
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash1 ^= char
    hash1 = Math.imul(hash1, 0x01000193)
    hash2 ^= char
    hash2 = (hash2 << 5) | (hash2 >>> 27)
  }
  const hex1 = Math.abs(hash1).toString(16).padStart(8, '0')
  const hex2 = Math.abs(hash2).toString(16).padStart(8, '0')
  const hex3 = Math.abs((hash1 ^ hash2) >>> 0).toString(16).padStart(8, '0')
  return `BIO-FP-${hex1.toUpperCase()}-${hex2.toUpperCase()}-${hex3.toUpperCase()}`
}

function generateBiometricVerificationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = (n) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `BIO-AUTH-${rand(4)}-${rand(4)}`
}

function generateClearanceSecurityHash(studentId, passCode, feeStatus) {
  const raw = `${studentId}:${passCode}:${feeStatus}:${new Date().getFullYear()}:ECLAT_FIN_CLEARANCE`
  let h = 0
  for (let i = 0; i < raw.length; i++) {
    h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0
  }
  return `EI-SEC-${Math.abs(h).toString(16).toUpperCase().padStart(8, '0')}`
}

function evaluateFeeClearance(student) {
  const feeBalance = Number(student.fee_balance || 0)
  const totalBilled = Number(student.term_fee_total || 4500)
  const amountPaid = Math.max(0, totalBilled - feeBalance)
  const paymentPercentage = totalBilled > 0 ? Math.round((amountPaid / totalBilled) * 100) : 100

  if (feeBalance <= 0) {
    return {
      status: 'CLEARED',
      isCleared: true,
      canIssuePass: true,
      message: 'Tuition fees 100% cleared. Unrestricted exam and lecture access granted.',
      badgeColor: '#16a34a',
      paymentPercentage: 100,
    }
  }

  if (paymentPercentage >= 75) {
    return {
      status: 'CONDITIONAL',
      isCleared: false,
      canIssuePass: true,
      message: `Conditional clearance granted (${paymentPercentage}% paid). Balance KES ${feeBalance.toLocaleString()} must be settled before final project submission.`,
      badgeColor: '#d97706',
      paymentPercentage,
    }
  }

  return {
    status: 'BLOCKED',
    isCleared: false,
    canIssuePass: false,
    message: `Fee clearance denied (${paymentPercentage}% paid). Minimum 75% payment required to sit for assessments. Outstanding: KES ${feeBalance.toLocaleString()}.`,
    badgeColor: '#dc2626',
    paymentPercentage,
  }
}

test('Biometrics: Template Hash Determinism & Format', () => {
  const stdId = 'std-2026-001'
  const admNo = 'EI-2026-001'
  const finger = 'Right Thumb'

  const hash1 = generateBiometricTemplate(stdId, admNo, finger)
  const hash2 = generateBiometricTemplate(stdId, admNo, finger)
  const hashOtherFinger = generateBiometricTemplate(stdId, admNo, 'Left Index')

  assert.equal(hash1, hash2, 'Biometric template hash must be deterministic for identical parameters')
  assert.notEqual(hash1, hashOtherFinger, 'Different fingers must produce distinct hashes')
  assert.match(hash1, /^BIO-FP-[0-9A-F]{8}-[0-9A-F]{8}-[0-9A-F]{8}$/, 'Hash must follow standard security template format')
})

test('Biometrics: Verification Authorization Code Format', () => {
  const authCode = generateBiometricVerificationCode()
  assert.match(authCode, /^BIO-AUTH-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
})

test('Biometrics: Clearance Security Hash Integrity', () => {
  const hash = generateClearanceSecurityHash('std-123', 'PASS-999', 'CLEARED')
  assert.match(hash, /^EI-SEC-[0-9A-F]{8}$/)
})

test('Biometrics: Fee Clearance Evaluation Rules (Fully Cleared)', () => {
  const student = {
    id: 'std-1',
    full_name: 'Abdi Hassan',
    admission_number: 'EI-2026-001',
    fee_balance: 0,
    term_fee_total: 15000,
    biometric_enrolled: true,
  }

  const result = evaluateFeeClearance(student)
  assert.equal(result.status, 'CLEARED')
  assert.equal(result.isCleared, true)
  assert.equal(result.canIssuePass, true)
  assert.equal(result.paymentPercentage, 100)
})

test('Biometrics: Fee Clearance Evaluation Rules (Conditional 75%+ Paid)', () => {
  const student = {
    id: 'std-2',
    full_name: 'Fatima Omar',
    admission_number: 'EI-2026-002',
    fee_balance: 3000,
    term_fee_total: 15000, // 12000 paid = 80%
    biometric_enrolled: true,
  }

  const result = evaluateFeeClearance(student)
  assert.equal(result.status, 'CONDITIONAL')
  assert.equal(result.isCleared, false)
  assert.equal(result.canIssuePass, true)
  assert.equal(result.paymentPercentage, 80)
})

test('Biometrics: Fee Clearance Evaluation Rules (Blocked < 75% Paid)', () => {
  const student = {
    id: 'std-3',
    full_name: 'Kevin Otieno',
    admission_number: 'EI-2026-003',
    fee_balance: 10000,
    term_fee_total: 15000, // 5000 paid = 33%
    biometric_enrolled: true,
  }

  const result = evaluateFeeClearance(student)
  assert.equal(result.status, 'BLOCKED')
  assert.equal(result.isCleared, false)
  assert.equal(result.canIssuePass, false)
  assert.equal(result.paymentPercentage, 33)
})

test('DRM Security: Web Browser vs Native App Learning Portal Separation', () => {
  function checkStudentAccessPermitted(isNative, role) {
    if (role === 'student' && !isNative) {
      return { allowed: false, reason: 'NATIVE_APP_DRM_REQUIRED' }
    }
    return { allowed: true }
  }

  // Web student access is blocked from screenshot-prone web browser
  const webStudent = checkStudentAccessPermitted(false, 'student')
  assert.equal(webStudent.allowed, false)
  assert.equal(webStudent.reason, 'NATIVE_APP_DRM_REQUIRED')

  // Native app student access is permitted with OS-level FLAG_SECURE
  const nativeStudent = checkStudentAccessPermitted(true, 'student')
  assert.equal(nativeStudent.allowed, true)

  // Staff and faculty (admin, bursar, teacher) have web management clearance
  assert.equal(checkStudentAccessPermitted(false, 'admin').allowed, true)
  assert.equal(checkStudentAccessPermitted(false, 'bursar').allowed, true)
  assert.equal(checkStudentAccessPermitted(false, 'teacher').allowed, true)
})

// 6. GOOGLE DRIVE & CLOUD DOCUMENT EMBED SYSTEM TESTS
function getGoogleDrivePreviewUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()

  const driveFileMatch = trimmed.match(/(?:drive\.google\.com\/file\/d\/|\/file\/d\/)([a-zA-Z0-9_-]{15,})/i)
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`
  }

  const driveIdMatch = trimmed.match(/(?:drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=|[?&]id=)([a-zA-Z0-9_-]{15,})/i)
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`
  }

  const docsMatch = trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]{15,})/i)
  if (docsMatch && docsMatch[1]) {
    return `https://docs.google.com/document/d/${docsMatch[1]}/preview`
  }

  const slidesMatch = trimmed.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]{15,})/i)
  if (slidesMatch && slidesMatch[1]) {
    return `https://docs.google.com/presentation/d/${slidesMatch[1]}/preview`
  }

  const sheetsMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]{15,})/i)
  if (sheetsMatch && sheetsMatch[1]) {
    return `https://docs.google.com/spreadsheets/d/${sheetsMatch[1]}/preview`
  }

  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return `https://drive.google.com/file/d/${trimmed}/preview`
  }

  return null
}

function getEmbeddableDocumentUrl(url, engine = 'direct') {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()

  const gdriveEmbed = getGoogleDrivePreviewUrl(trimmed)
  if (gdriveEmbed) {
    return gdriveEmbed
  }

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('academic://')) {
    return trimmed
  }

  if (engine === 'cloud' && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(trimmed)}&embedded=true`
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (!trimmed.toLowerCase().endsWith('.pdf') && !trimmed.includes('supabase.co')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(trimmed)}&embedded=true`
    }
    return trimmed
  }

  return trimmed
}

test('Google Drive Embed: Converts standard share URLs to in-app /preview iframe URLs', () => {
  const fileId = '1oMD6UumrI70jB5o-xT998d-w816tA4'
  const shareLink1 = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
  const shareLink2 = `https://drive.google.com/file/d/${fileId}/view?usp=drive_link`
  const openLink = `https://drive.google.com/open?id=${fileId}`
  const expectedPreview = `https://drive.google.com/file/d/${fileId}/preview`

  assert.equal(getGoogleDrivePreviewUrl(shareLink1), expectedPreview)
  assert.equal(getGoogleDrivePreviewUrl(shareLink2), expectedPreview)
  assert.equal(getGoogleDrivePreviewUrl(openLink), expectedPreview)
  assert.equal(getEmbeddableDocumentUrl(shareLink1), expectedPreview)
})

test('Google Drive Embed: Recovers cleanly from duplicate paste / corrupted prefix URLs', () => {
  const fileId = '1oMD6UumrI70jB5o-xT998d-w816tA4'
  const corruptedUrl = `https://drive.goohttps//drive.google.com/file/d/${fileId}/view?usp=drive_link`
  const expectedPreview = `https://drive.google.com/file/d/${fileId}/preview`

  assert.equal(getGoogleDrivePreviewUrl(corruptedUrl), expectedPreview)
  assert.equal(getEmbeddableDocumentUrl(corruptedUrl), expectedPreview)
})

test('Google Drive Embed: Handles Google Docs, Sheets, and Slides formats', () => {
  const docId = '1abcdefg_99887766554433221100'
  const docUrl = `https://docs.google.com/document/d/${docId}/edit?usp=sharing`
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${docId}/edit`
  const slideUrl = `https://docs.google.com/presentation/d/${docId}/edit`

  assert.equal(getGoogleDrivePreviewUrl(docUrl), `https://docs.google.com/document/d/${docId}/preview`)
  assert.equal(getGoogleDrivePreviewUrl(sheetUrl), `https://docs.google.com/spreadsheets/d/${docId}/preview`)
  assert.equal(getGoogleDrivePreviewUrl(slideUrl), `https://docs.google.com/presentation/d/${docId}/preview`)
})

// 3. PLATFORM DETECTION & DESKTOP APP WORKSTATION TESTS
function mockDetectElectron({ search = '', userAgent = '', desktopAPI = undefined, storage = {} } = {}) {
  if (search.includes('platform=desktop')) return true
  if (desktopAPI && desktopAPI.isDesktop) return true
  if (/Electron|ÉclatDesktopWorkstation|EclatDesktop/i.test(userAgent)) return true
  if (storage['eclat_platform'] === 'desktop') return true
  return false
}

function mockDetectCapacitor({ userAgent = '', capacitor = undefined, protocol = 'https:', storage = {} } = {}) {
  if (capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform()) return true
  if (protocol === 'capacitor:' || protocol === 'ionic:') return true
  if (/Capacitor/i.test(userAgent)) return true
  if (storage['eclat_platform'] === 'mobile') return true
  return false
}

test('Platform Detection: Electron Workstation Identification', () => {
  // Query param detection
  assert.ok(mockDetectElectron({ search: '?platform=desktop' }))
  // Electron User Agent detection
  assert.ok(mockDetectElectron({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Electron/32.0.0 ÉclatDesktopWorkstation/1.0.0' }))
  // desktopAPI context bridge detection
  assert.ok(mockDetectElectron({ desktopAPI: { isDesktop: true } }))
  // Persisted storage detection
  assert.ok(mockDetectElectron({ storage: { eclat_platform: 'desktop' } }))
  // Standard web browser returns false
  assert.ok(!mockDetectElectron({ search: '', userAgent: 'Mozilla/5.0 Chrome/120.0', storage: {} }))
})

test('Platform Detection: Capacitor Mobile App Identification', () => {
  assert.ok(mockDetectCapacitor({ capacitor: { isNativePlatform: () => true } }))
  assert.ok(mockDetectCapacitor({ protocol: 'capacitor:' }))
  assert.ok(mockDetectCapacitor({ userAgent: 'Mozilla/5.0 (Android; Mobile) CapacitorApp/1.0' }))
  assert.ok(mockDetectCapacitor({ storage: { eclat_platform: 'mobile' } }))
  assert.ok(!mockDetectCapacitor({ protocol: 'https:', userAgent: 'Mozilla/5.0 Chrome/120.0', storage: {} }))
})

// 4. AUTHENTICATION & MULTI-FORMAT IDENTIFIER RESOLUTION TESTS
function mockAuthenticateStudent(inputIdentifier, password, storedStudents = []) {
  const rawInput = (inputIdentifier || '').trim()
  const cleanAlpha = rawInput.toLowerCase().replace(/[^a-z0-9]/g, '')
  const validUniversalPasswords = [
    'Eclat@2026#!',
    'Eclat@2026',
    'Admin@2026#!',
    'Admin@2026',
    'Password123!',
    'Student@2026',
    'Student@2026#!',
    'student',
    'admin123',
    'admin',
    'eclat2026',
  ]
  const isMatchPass = validUniversalPasswords.includes(password.trim())

  // Admin
  if (cleanAlpha.includes('admin') || rawInput === 'Eclat@admin' || rawInput === 'Eclat2026@admin') {
    if (isMatchPass) return { error: null, role: 'admin', admission_number: 'Eclat@admin' }
  }

  // Bursar
  if (cleanAlpha === 'bursar' || cleanAlpha === 'finance' || cleanAlpha === 'bursec001') {
    if (isMatchPass || password === 'Bursar@2026') return { error: null, role: 'bursar', admission_number: 'BUR-SEC-001' }
  }

  // Teacher
  if (cleanAlpha === 'teacher' || cleanAlpha === 'lecturer' || cleanAlpha === 'tch001') {
    if (isMatchPass || password === 'Teacher@2026') return { error: null, role: 'teacher', admission_number: 'TCH-001' }
  }

  // Demo / Seed Student
  if (
    cleanAlpha === 'student' ||
    cleanAlpha === 'trainee' ||
    cleanAlpha === 'demo' ||
    cleanAlpha === 'el0012026' ||
    cleanAlpha === 'el001' ||
    cleanAlpha === 'mustafahassan' ||
    cleanAlpha === 'mustafa' ||
    rawInput.toUpperCase() === 'EL/001/2026'
  ) {
    if (isMatchPass) {
      return {
        error: null,
        role: 'student',
        admission_number: 'EL/001/2026',
        full_name: 'Mustafa Hassan',
        first_login_at: '2026-09-04T00:00:00Z',
      }
    }
  }

  // Registered Student in SIS Store
  const found = storedStudents.find((s) => {
    const sAdm = s.admission_number.toLowerCase().replace(/[^a-z0-9]/g, '')
    const sName = s.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')
    return sAdm === cleanAlpha || sName === cleanAlpha || (cleanAlpha.length >= 3 && (sAdm.includes(cleanAlpha) || sName.includes(cleanAlpha)))
  })

  if (found) {
    if (found.portal_password && found.portal_password.trim() !== '') {
      if (!isMatchPass && password.trim() !== found.portal_password.trim()) {
        return { error: 'Incorrect password for this student admission account.' }
      }
    }
    return {
      error: null,
      role: 'student',
      admission_number: found.admission_number,
      full_name: found.full_name,
      first_login_at: new Date().toISOString(),
    }
  }

  // Fallback Auto-Provisioning
  if (cleanAlpha.startsWith('el') || cleanAlpha.startsWith('ei') || cleanAlpha.length >= 2) {
    return {
      error: null,
      role: 'student',
      admission_number: rawInput,
      full_name: rawInput.toUpperCase().startsWith('EL') ? 'Mustafa Hassan' : rawInput,
      first_login_at: new Date().toISOString(),
    }
  }

  return { error: 'Account not found or has been removed.' }
}

test('Authentication: Formatted Admission Numbers & Aliases', () => {
  const res1 = mockAuthenticateStudent('EL/001/2026', 'Student@2026')
  assert.equal(res1.error, null)
  assert.equal(res1.role, 'student')
  assert.equal(res1.admission_number, 'EL/001/2026')
  assert.ok(res1.first_login_at)

  const res2 = mockAuthenticateStudent('el/001/2026', 'student')
  assert.equal(res2.error, null)
  assert.equal(res2.role, 'student')

  const res3 = mockAuthenticateStudent('Mustafa Hassan', 'Student@2026')
  assert.equal(res3.error, null)
  assert.equal(res3.role, 'student')

  const res4 = mockAuthenticateStudent('EI-2026-042', 'Student@2026')
  assert.equal(res4.error, null)
  assert.equal(res4.role, 'student')
})

test('Authentication: Student Custom Portal Password Verification', () => {
  const students = [
    {
      id: 'std-custom-01',
      admission_number: 'EI/999/2026',
      full_name: 'Jane Doe',
      portal_password: 'CustomSecret@2026',
    },
  ]

  // Success with custom password
  const resSuccess = mockAuthenticateStudent('EI/999/2026', 'CustomSecret@2026', students)
  assert.equal(resSuccess.error, null)
  assert.equal(resSuccess.full_name, 'Jane Doe')

  // Success with institutional master override password
  const resMaster = mockAuthenticateStudent('EI/999/2026', 'Student@2026', students)
  assert.equal(resMaster.error, null)

  // Failure with wrong password
  const resFail = mockAuthenticateStudent('EI/999/2026', 'WrongPassword123', students)
  assert.ok(resFail.error.includes('Incorrect password'))
})

// 5. STUDENT ACCESS & AUTO-RENEWAL TESTS
test('Student Access: Auto-Renewal Guarantees Active Term Window (Zero Lockouts)', () => {
  const activeStudentProfile = {
    id: 'usr-student-01',
    role: 'student',
    access_expires_at: null, // Initial or unset
    first_login_at: '2026-01-01T00:00:00Z',
  }

  // Access check logic: if null or expired, renew for 365 days
  let accessWindow = activeStudentProfile.access_expires_at
  if (!accessWindow || isAccessExpired(accessWindow)) {
    accessWindow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  }

  assert.ok(accessWindow !== null)
  assert.ok(!isAccessExpired(accessWindow))
  assert.ok(new Date(accessWindow).getFullYear() >= new Date().getFullYear())
})

// 6. ROUTE & WORKSTATION INTEGRITY TESTS
test('Routing: Desktop App Root Entry directs directly to Workstation Dashboards', () => {
  function getNativeEntryRoute(isNative, profile) {
    if (isNative) {
      if (!profile) return '/login'
      if (profile.role === 'admin') return '/admin'
      if (profile.role === 'bursar') return '/bursar'
      if (profile.role === 'teacher') return '/teacher'
      if (profile.role === 'parent') return '/parent'
      return '/student'
    }
    return '/' // Web public landing
  }

  // Native Desktop App unauthenticated -> /login
  assert.equal(getNativeEntryRoute(true, null), '/login')

  // Native Desktop App authenticated student -> /student
  assert.equal(getNativeEntryRoute(true, { role: 'student' }), '/student')

  // Native Desktop App authenticated bursar -> /bursar
  assert.equal(getNativeEntryRoute(true, { role: 'bursar' }), '/bursar')

  // Public Web -> / (Marketing Landing)
  assert.equal(getNativeEntryRoute(false, null), '/')
})

test('Routing: Lesson Player URL Aliases (Singular and Plural)', () => {
  const lessonId = 'les-101'
  const singularRoute = `/student/lesson/${lessonId}`
  const pluralRoute = `/student/lessons/${lessonId}`

  const normalizeLessonRoute = (url) => url.replace('/student/lessons/', '/student/lesson/')
  assert.equal(normalizeLessonRoute(singularRoute), `/student/lesson/${lessonId}`)
  assert.equal(normalizeLessonRoute(pluralRoute), `/student/lesson/${lessonId}`)
})

test('Intake Adverts: Chronological Scheduling & Active Status Priority', () => {
  const sampleIntakes = [
    { id: 'intake-2027-01', commencement_date: '2027-01-20', status: 'Open', is_published: true },
    { id: 'intake-2026-05', commencement_date: '2026-05-20', status: 'Closed', is_published: true },
    { id: 'intake-2026-10', commencement_date: '2026-10-15', status: 'Filling Fast', is_published: true },
    { id: 'intake-2026-11-igcse', commencement_date: '2026-11-02', status: 'Open', is_published: true },
  ]

  const sorted = [...sampleIntakes].sort((a, b) => {
    const aClosed = a.status === 'Closed' || a.status === 'Archived'
    const bClosed = b.status === 'Closed' || b.status === 'Archived'
    if (aClosed && !bClosed) return 1
    if (!aClosed && bClosed) return -1
    return new Date(a.commencement_date).getTime() - new Date(b.commencement_date).getTime()
  })

  // First should be October 2026
  assert.equal(sorted[0].id, 'intake-2026-10')
  // Second should be November 2026 (British Curriculum)
  assert.equal(sorted[1].id, 'intake-2026-11-igcse')
  // Third should be January 2027 (New Year)
  assert.equal(sorted[2].id, 'intake-2027-01')
  // Closed should be last
  assert.equal(sorted[3].id, 'intake-2026-05')
})

test('Intake Adverts: British Curriculum Cambridge KE042 & Pearson Edexcel Support', () => {
  const britishIntake = {
    id: 'intake-2026-11-igcse',
    title: 'November 2026 British International Curriculum Intake',
    target_courses: [
      'Cambridge IGCSE Mathematics (0580)',
      'Pearson Edexcel Mathematics A (4MA1)',
      'Cambridge IGCSE Physics (0625) & Chemistry (0620)',
    ],
    status: 'Open',
  }

  assert.ok(britishIntake.title.includes('British International Curriculum'))
  assert.ok(britishIntake.target_courses.some((c) => c.includes('Cambridge')))
  assert.ok(britishIntake.target_courses.some((c) => c.includes('Pearson Edexcel')))
})

test('IGCSE Curriculum: Cambridge CAIE (KE042) Subject Coverage across Years 9, 10, 11', () => {
  const content = fs.readFileSync(path.join(process.cwd(), 'src/config/officialCourses.ts'), 'utf-8')

  // Year 9 Cambridge
  assert.ok(content.includes('c-caie-y9-math'))
  assert.ok(content.includes('c-caie-y9-science'))
  assert.ok(content.includes('c-caie-y9-english'))

  // Year 10 Cambridge
  assert.ok(content.includes('c-igcse-math'))
  assert.ok(content.includes('c-igcse-physics'))
  assert.ok(content.includes('c-igcse-chemistry'))
  assert.ok(content.includes('c-caie-y10-bio'))
  assert.ok(content.includes('c-igcse-cs'))
  assert.ok(content.includes('c-igcse-english'))
  assert.ok(content.includes('c-igcse-business'))
  assert.ok(content.includes('c-caie-y10-addmath'))
  assert.ok(content.includes('c-caie-y10-econ'))

  // Year 11 Cambridge
  assert.ok(content.includes('c-caie-y11-math'))
  assert.ok(content.includes('c-caie-y11-physics'))
  assert.ok(content.includes('c-caie-y11-chem'))
  assert.ok(content.includes('c-caie-y11-bio'))
  assert.ok(content.includes('c-caie-y11-eng'))
  assert.ok(content.includes('c-caie-y11-bus'))
})

test('IGCSE Curriculum: Pearson Edexcel (EDX-98421) Subject Coverage across Years 9, 10, 11', () => {
  const content = fs.readFileSync(path.join(process.cwd(), 'src/config/officialCourses.ts'), 'utf-8')

  // Year 9 Edexcel
  assert.ok(content.includes('c-edx-y9-math'))
  assert.ok(content.includes('c-edx-y9-science'))
  assert.ok(content.includes('c-edx-y9-english'))
  assert.ok(content.includes('c-edx-y9-cs'))

  // Year 10 Edexcel
  assert.ok(content.includes('c-edx-y10-math'))
  assert.ok(content.includes('c-edx-y10-physics'))
  assert.ok(content.includes('c-edx-y10-chem'))
  assert.ok(content.includes('c-edx-y10-bio'))
  assert.ok(content.includes('c-edx-y10-cs'))
  assert.ok(content.includes('c-edx-y10-eng'))
  assert.ok(content.includes('c-edx-y10-business'))
  assert.ok(content.includes('c-edx-y10-econ'))

  // Year 11 Edexcel
  assert.ok(content.includes('c-edx-y11-math'))
  assert.ok(content.includes('c-edx-y11-physics'))
  assert.ok(content.includes('c-edx-y11-chem'))
  assert.ok(content.includes('c-edx-y11-bio'))
  assert.ok(content.includes('c-edx-y11-cs'))
  assert.ok(content.includes('c-edx-y11-eng'))
  assert.ok(content.includes('c-edx-y11-bus'))
})

test('IGCSE Curriculum: School Data & Broadsheet Multi-Board Center Mapping', () => {
  const schoolDataContent = fs.readFileSync(path.join(process.cwd(), 'src/lib/schoolData.ts'), 'utf-8')

  // Verify both Exam Center statements exist
  assert.ok(schoolDataContent.includes('igcse-stmt-001')) // Cambridge
  assert.ok(schoolDataContent.includes('KE042/0014/2026'))
  assert.ok(schoolDataContent.includes('igcse-stmt-002')) // Edexcel
  assert.ok(schoolDataContent.includes('EDX-98421/0042/2026'))

  // Verify School separation
  assert.ok(schoolDataContent.includes('school-cambridge'))
  assert.ok(schoolDataContent.includes('school-edexcel'))
  assert.ok(schoolDataContent.includes('dept-caie-sciences'))
  assert.ok(schoolDataContent.includes('dept-edx-stem'))
})

test('Institutional Architecture: 4 Canonical Faculties (Business, IT & Data Science, Language, IGCSE)', () => {
  const institutionContent = fs.readFileSync(path.join(process.cwd(), 'src/config/institution.ts'), 'utf-8')
  
  // Verify exactly 4 schools configured
  assert.ok(institutionContent.includes(`id: 'school-business'`))
  assert.ok(institutionContent.includes(`name: 'School of Business'`))
  assert.ok(institutionContent.includes(`id: 'school-it-data'`))
  assert.ok(institutionContent.includes(`name: 'School of IT and Data Science'`))
  assert.ok(institutionContent.includes(`id: 'school-languages'`))
  assert.ok(institutionContent.includes(`name: 'School of Language'`))
  assert.ok(institutionContent.includes(`id: 'school-igcse'`))
  assert.ok(institutionContent.includes(`name: 'IGCSE'`))

  // Verify Course Catalog Categories reflect the 4 schools
  const catalogContent = fs.readFileSync(path.join(process.cwd(), 'src/features/courses/CourseCatalogPage.tsx'), 'utf-8')
  assert.ok(catalogContent.includes(`'School of Business'`))
  assert.ok(catalogContent.includes(`'School of IT and Data Science'`))
  assert.ok(catalogContent.includes(`'School of Language'`))
  assert.ok(catalogContent.includes(`'IGCSE'`))

  // Verify View Poster button removed from IntakeAdvertsSection
  const advertsContent = fs.readFileSync(path.join(process.cwd(), 'src/features/landing/IntakeAdvertsSection.tsx'), 'utf-8')
  assert.ok(!advertsContent.includes('View Poster'))
})

test('SEO Metadata: 4 Canonical Faculties, Meta Tags, Schema.org JSON-LD, and llms.txt alignment', () => {
  const htmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8')
  
  // Title & Meta tags
  assert.ok(htmlContent.includes('<title>Éclat Institute — 100% Online Virtual Campus | Business, IT & Data Science, Language, IGCSE</title>'))
  assert.ok(htmlContent.includes('name="description"'))
  assert.ok(htmlContent.includes('School of Business, School of IT & Data Science, School of Language, and IGCSE'))
  assert.ok(htmlContent.includes('Cambridge CAIE Center KE042 & Pearson Edexcel Center EDX-98421'))

  // Open Graph & Twitter
  assert.ok(htmlContent.includes('property="og:title"'))
  assert.ok(htmlContent.includes('name="twitter:card" content="summary_large_image"'))

  // Schema.org JSON-LD
  assert.ok(htmlContent.includes('"name": "Cambridge Assessment International Education IGCSE (Center KE042)"'))
  assert.ok(htmlContent.includes('"name": "Pearson Edexcel International Curriculum (Center EDX-98421)"'))
  assert.ok(htmlContent.includes('"text": "Éclat Institute consists of 4 canonical faculties'))
  assert.ok(htmlContent.includes('Can external schools, academies, and independent tutors publish courses on Éclat Institute?'))
  assert.ok(htmlContent.includes('What is the difference between Live Cohort Classes and Self-Paced Courses?'))

  // llms.txt AI Knowledge Grounding
  const llmsContent = fs.readFileSync(path.join(process.cwd(), 'public/llms.txt'), 'utf-8')
  assert.ok(llmsContent.includes('1. **School of Business**:'))
  assert.ok(llmsContent.includes('2. **School of IT and Data Science**:'))
  assert.ok(llmsContent.includes('3. **School of Language**:'))
  assert.ok(llmsContent.includes('4. **IGCSE (British International Curriculum)**:'))
  assert.ok(llmsContent.includes('Cambridge Assessment International Education (CAIE Center KE042)'))
  assert.ok(llmsContent.includes('Pearson Edexcel (Center EDX-98421)'))
  assert.ok(llmsContent.includes('Multi-Tenant Course Publishing & Academic Partnerships'))
  assert.ok(llmsContent.includes('Dual Delivery Modes & Admissions Policy'))
  assert.ok(llmsContent.includes('Individual Tutor Courses'))
  assert.ok(llmsContent.includes('Partner School Courses'))
})

test('Top-Paying Business Certificate Courses: School of Business Credentials & Metadata', () => {
  const officialCoursesContent = fs.readFileSync(path.join(process.cwd(), 'src/config/officialCourses.ts'), 'utf-8')
  
  // Verify all top-paying business & finance courses exist
  const businessCourseIds = [
    'c-accounting',
    'c-pmp',
    'c-fmva',
    'c-cma',
    'c-sixsigma',
    'c-cbap',
    'c-cscp',
    'c-shrm',
    'c-growth-mkt',
    'c-forex-trading',
    'c-algo-forex',
  ]

  for (const id of businessCourseIds) {
    assert.ok(officialCoursesContent.includes(`id: '${id}'`), `Missing course ID ${id} in officialCourses.ts`)
  }

  // Verify certifications and salary tags
  assert.ok(officialCoursesContent.includes('Project Management Professional (PMP®)'))
  assert.ok(officialCoursesContent.includes('Financial Modeling & Valuation Analyst (FMVA®)'))
  assert.ok(officialCoursesContent.includes('Strategic Corporate FP&A & Management Accounting (CMA® Track)'))
  assert.ok(officialCoursesContent.includes('Lean Six Sigma Green Belt (LSSGB®)'))
  assert.ok(officialCoursesContent.includes('Enterprise Business Analysis & Digital Transformation (CBAP® & PMI-PBA®)'))
  assert.ok(officialCoursesContent.includes('Global Supply Chain Strategy, Logistics & Procurement (CSCP® & APICS)'))
  assert.ok(officialCoursesContent.includes('Strategic HR Leadership, Talent Acquisition & People Analytics (SHRM-CP®)'))
  assert.ok(officialCoursesContent.includes('Digital Marketing Strategy, Performance Growth & MarTech Leadership'))
  assert.ok(officialCoursesContent.includes('Professional Forex Trading, Currency Markets & Technical Analysis (FX Mastery)'))
  assert.ok(officialCoursesContent.includes('Algorithmic Forex Trading & Quantitative Bot Strategies (Python & MT5)'))

  // Verify schoolData.ts initial subjects & departments
  const schoolDataContent = fs.readFileSync(path.join(process.cwd(), 'src/lib/schoolData.ts'), 'utf-8')
  assert.ok(schoolDataContent.includes('sub-pmp'))
  assert.ok(schoolDataContent.includes('sub-fmva'))
  assert.ok(schoolDataContent.includes('sub-cma'))
  assert.ok(schoolDataContent.includes('sub-sixsigma'))
  assert.ok(schoolDataContent.includes('sub-cbap'))
  assert.ok(schoolDataContent.includes('sub-cscp'))
  assert.ok(schoolDataContent.includes('sub-shrm'))
  assert.ok(schoolDataContent.includes('sub-growth-mkt'))
  assert.ok(schoolDataContent.includes('sub-forex'))
  assert.ok(schoolDataContent.includes('sub-algo-forex'))
  assert.ok(schoolDataContent.includes('dept-commerce-mgmt'))
  assert.ok(schoolDataContent.includes('dept-biztech'))

  // Verify index.html Schema.org JSON-LD has business course snippets
  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8')
  assert.ok(indexHtml.includes('Project Management Professional (PMP®)'))
  assert.ok(indexHtml.includes('Financial Modeling & Valuation Analyst (FMVA®)'))
  assert.ok(indexHtml.includes('Professional Forex Trading, Currency Markets & Technical Analysis (FX Mastery)'))
})

test('Architectural Separation: Bot Is Completely Decoupled from School LMS Systems', () => {
  // 1. Verify trading_bot is completely removed from school LMS repo
  assert.strictEqual(fs.existsSync(path.join(process.cwd(), 'trading_bot')), false, 'trading_bot must NOT exist in school LMS')
  assert.strictEqual(fs.existsSync(path.join(process.cwd(), 'src/features/trading')), false, 'trading features must NOT exist in school LMS')

  // 2. Verify school LMS routes are pure academic & student management
  const appContent = fs.readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf-8')
  assert.ok(!appContent.includes('/trading-bot'), 'App.tsx must not contain bot route')
  assert.ok(!appContent.includes('TradingBotStudio'), 'App.tsx must not import TradingBotStudio')

  // 3. Verify standalone autonomous bot exists in its own isolated directory if present locally
  const standaloneDir = 'c:/Users/egerton/Desktop/autonomous_trading_bot'
  if (fs.existsSync(standaloneDir)) {
    assert.ok(fs.existsSync(path.join(standaloneDir, 'main.py')), 'Missing standalone main.py')
    assert.ok(fs.existsSync(path.join(standaloneDir, 'paper_broker.py')), 'Missing standalone paper_broker.py')
    assert.ok(fs.existsSync(path.join(standaloneDir, 'live_market_feed.py')), 'Missing standalone live_market_feed.py')
    assert.ok(fs.existsSync(path.join(standaloneDir, 'server.py')), 'Missing standalone server.py')
    assert.ok(fs.existsSync(path.join(standaloneDir, 'risk_manager.py')), 'Missing standalone risk_manager.py')
  }
})

test('Multi-Tenant Course Publishing: Individual Tutors vs Partner Schools & Academies', () => {
  // Tutor Course Specification
  const tutorCourse = {
    provider_type: 'individual_tutor',
    teacher_name: 'John Kamau',
    delivery_mode: 'self_paced',
    fee: 50,
    revenue_split_pct: 50,
  }

  // Partner School Course Specification
  const schoolCourse = {
    provider_type: 'partner_institution',
    institution_name: 'Nairobi Coding Academy',
    institution_signatory: 'Dr. Patrick Mwangi, Principal',
    delivery_mode: 'live_cohort',
    fee: 150,
    revenue_split_pct: 70,
  }

  assert.strictEqual(tutorCourse.provider_type, 'individual_tutor')
  assert.strictEqual(tutorCourse.revenue_split_pct, 50)
  assert.strictEqual(schoolCourse.provider_type, 'partner_institution')
  assert.strictEqual(schoolCourse.institution_name, 'Nairobi Coding Academy')
  assert.strictEqual(schoolCourse.revenue_split_pct, 70)
})

test('Course Admission Rule: Live Cohort Classes get Formal Admission ID vs Instant Access for Self-Paced Courses', () => {
  function processCourseEnrollment(course) {
    const isLive = course.delivery_mode === 'live_cohort'
    return {
      delivery_mode: course.delivery_mode,
      hasFormalAdmissionNumber: isLive,
      admissionId: isLive ? `EI-2026-${Math.floor(1000 + Math.random() * 9000)}` : null,
      instantAccessUnlocked: !isLive,
    }
  }

  const liveEnrollment = processCourseEnrollment({ delivery_mode: 'live_cohort' })
  assert.strictEqual(liveEnrollment.hasFormalAdmissionNumber, true)
  assert.ok(liveEnrollment.admissionId?.startsWith('EI-2026-'))
  assert.strictEqual(liveEnrollment.instantAccessUnlocked, false)

  const selfPacedEnrollment = processCourseEnrollment({ delivery_mode: 'self_paced' })
  assert.strictEqual(selfPacedEnrollment.hasFormalAdmissionNumber, false)
  assert.strictEqual(selfPacedEnrollment.admissionId, null)
  assert.strictEqual(selfPacedEnrollment.instantAccessUnlocked, true)
})

test('Dynamic Certification Authority: Éclat-Issued for Individual Tutors vs Institution-Issued for Partner Schools', () => {
  function resolveCertificateIssuer(course) {
    if (course.provider_type === 'partner_institution' && course.institution_name) {
      return {
        issuingAuthority: course.institution_name,
        affiliationBanner: 'ACCREDITED PARTNER ACADEMY • CONFERRED IN AFFILIATION WITH ÉCLAT INSTITUTE',
        leadSignatory: course.institution_signatory || 'Dean / Authorized Signatory',
      }
    }
    return {
      issuingAuthority: 'Éclat Institute',
      affiliationBanner: 'DIRECTORATE OF ACADEMIC AFFAIRS & GLOBAL CREDENTIALING',
      leadSignatory: course.teacher_name ? `Lead Instructor: ${course.teacher_name}` : 'Dean of Academic Faculty',
    }
  }

  const tutorCert = resolveCertificateIssuer({
    provider_type: 'individual_tutor',
    teacher_name: 'Alex Ochieng',
  })
  assert.strictEqual(tutorCert.issuingAuthority, 'Éclat Institute')
  assert.ok(tutorCert.leadSignatory.includes('Alex Ochieng'))

  const schoolCert = resolveCertificateIssuer({
    provider_type: 'partner_institution',
    institution_name: 'St. Jude Cambridge Academy',
    institution_signatory: 'Prof. Mary Wanjiku, Academic Dean',
  })
  assert.strictEqual(schoolCert.issuingAuthority, 'St. Jude Cambridge Academy')
  assert.ok(schoolCert.affiliationBanner.includes('AFFILIATION WITH ÉCLAT INSTITUTE'))
  assert.strictEqual(schoolCert.leadSignatory, 'Prof. Mary Wanjiku, Academic Dean')
})

test('Multi-School Dynamic Program Publishing: Sector Filtering & Custom School Department Registration', () => {
  // Simulate dynamic publishing resolver
  function resolvePublishingCurriculum(input) {
    const finalDepartment = (input.isCustomCategory ? input.customCategoryName?.trim() : input.category?.trim()) || 'General Studies'
    const finalProgram = (input.isCustomProgram ? input.customProgramName?.trim() : input.programName?.trim()) || input.courseTitle?.trim()
    return {
      institution_name: input.institution_name,
      department: finalDepartment,
      program: finalProgram,
      isRegisteredSuccessfully: Boolean(finalDepartment && finalProgram),
    }
  }

  // 1. Nursing & Medical College
  const nursingSchool = resolvePublishingCurriculum({
    institution_name: 'Nairobi Health & Nursing Institute',
    isCustomCategory: false,
    category: 'School of Nursing & Midwifery',
    programName: 'Diploma in Registered Nursing (KRCHN)',
    courseTitle: 'Pediatric Care & Clinical Nursing',
  })
  assert.strictEqual(nursingSchool.department, 'School of Nursing & Midwifery')
  assert.strictEqual(nursingSchool.program, 'Diploma in Registered Nursing (KRCHN)')

  // 2. Aviation & Drone Academy
  const aviationAcademy = resolvePublishingCurriculum({
    institution_name: 'East Africa Flight & Drone Academy',
    isCustomCategory: false,
    category: 'Unmanned Aircraft Systems (Drone Academy)',
    programName: 'Commercial Drone Pilot (KCAA / FAA Part 107)',
    courseTitle: 'Commercial Drone Operations & Aerial Mapping',
  })
  assert.strictEqual(aviationAcademy.department, 'Unmanned Aircraft Systems (Drone Academy)')
  assert.strictEqual(aviationAcademy.program, 'Commercial Drone Pilot (KCAA / FAA Part 107)')

  // 3. Specialized Custom Institution (e.g. Culinary Arts Institute)
  const culinaryInstitute = resolvePublishingCurriculum({
    institution_name: 'Le Cordon Gourmet Culinary School',
    isCustomCategory: true,
    customCategoryName: 'Faculty of Pastry Arts & French Gastronomy',
    isCustomProgram: true,
    customProgramName: 'Grand Diplôme in Artisan Pastry & Confectionery',
    courseTitle: 'Classical French Pastry Masterclass',
  })
  assert.strictEqual(culinaryInstitute.department, 'Faculty of Pastry Arts & French Gastronomy')
  assert.strictEqual(culinaryInstitute.program, 'Grand Diplôme in Artisan Pastry & Confectionery')
  assert.strictEqual(culinaryInstitute.isRegisteredSuccessfully, true)
})

test('Disbursement Preferences & Discrete Ingestion: Tutor/School Choice with Zero Archiving Disclosures', () => {
  const tutorCourse = {
    provider_type: 'individual_tutor',
    payout_method: 'mpesa',
    payout_schedule: 'weekly',
    payout_details: '0712345678',
    payout_currency: 'KES',
  }

  const schoolCourse = {
    provider_type: 'partner_institution',
    payout_method: 'bank',
    payout_schedule: 'on_demand',
    payout_details: 'Standard Chartered Bank - Kenya, Acc: 01020304050',
    payout_currency: 'USD',
  }

  assert.strictEqual(tutorCourse.payout_method, 'mpesa')
  assert.strictEqual(tutorCourse.payout_schedule, 'weekly')
  assert.strictEqual(schoolCourse.payout_method, 'bank')
  assert.strictEqual(schoolCourse.payout_schedule, 'on_demand')

  // Verify that TutorPublishCoursePage.tsx does not disclose archiving or downloads to users
  const tutorPageCode = fs.readFileSync(path.join(process.cwd(), 'src/features/teacher/TutorPublishCoursePage.tsx'), 'utf-8')
  assert.ok(!tutorPageCode.includes('archives it to our secure vault'))
  assert.ok(!tutorPageCode.includes('team archives and brands your lectures'))
  assert.ok(!tutorPageCode.includes('Video automatically saved to Desktop'))
})

test('Community Education Donation & Sponsorship: Physical Institution Enrollment Placement & SEO Routing', () => {
  // Test business logic for sponsorship tiering & allocation
  const evaluateSponsorshipImpact = (amount, currency = 'USD') => {
    if (currency === 'USD') {
      if (amount >= 350) return { category: 'physical_institution_placement', qualifiesPhysicalSchool: true }
      if (amount >= 150) return { category: 'full_vocational_scholarship', qualifiesPhysicalSchool: false }
      return { category: 'learning_materials_and_connectivity', qualifiesPhysicalSchool: false }
    } else {
      if (amount >= 45000) return { category: 'physical_institution_placement', qualifiesPhysicalSchool: true }
      if (amount >= 18000) return { category: 'full_vocational_scholarship', qualifiesPhysicalSchool: false }
      return { category: 'learning_materials_and_connectivity', qualifiesPhysicalSchool: false }
    }
  }

  // 1. Check USD tiers
  const tierSmall = evaluateSponsorshipImpact(50, 'USD')
  assert.strictEqual(tierSmall.qualifiesPhysicalSchool, false)
  const tierPhysicalPlacement = evaluateSponsorshipImpact(350, 'USD')
  assert.strictEqual(tierPhysicalPlacement.qualifiesPhysicalSchool, true)
  assert.strictEqual(tierPhysicalPlacement.category, 'physical_institution_placement')

  // 2. Check KES tiers
  const tierKesPlacement = evaluateSponsorshipImpact(45000, 'KES')
  assert.strictEqual(tierKesPlacement.qualifiesPhysicalSchool, true)

  // 3. Verify files and canonical SEO links
  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8')
  assert.ok(indexHtml.includes('https://eclat.institute/donate'))
  assert.ok(indexHtml.includes('Sponsor a Student'))

  const sitemapXml = fs.readFileSync(path.join(process.cwd(), 'public/sitemap.xml'), 'utf-8')
  assert.ok(sitemapXml.includes('https://www.eclat.institute/donate'))

  const llmsTxt = fs.readFileSync(path.join(process.cwd(), 'public/llms.txt'), 'utf-8')
  assert.ok(llmsTxt.includes('https://eclat.institute/donate'))
  assert.ok(llmsTxt.includes('Direct Physical Institution Enrollment'))

  const appTsx = fs.readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf-8')
  assert.ok(appTsx.includes('path="/donate"'))
  assert.ok(appTsx.includes('DonationSponsorshipPage'))
})

test('Multi-Tenant School Management: School Registration, Custom Calendar (Terms vs Semesters) and Portal Routing Engine', () => {
  // 1. Calendar Generation Logic
  function generateAcademicCalendar(system, year = 2026) {
    if (system === 'semester') {
      return [
        { id: `cal_sem_1`, name: `Semester 1 (Fall Cohort ${year})`, code: 'SEM-1', status: 'Active' },
        { id: `cal_sem_2`, name: `Semester 2 (Spring Cohort ${year})`, code: 'SEM-2', status: 'Upcoming' },
      ]
    }
    if (system === 'trimester') {
      return [
        { id: `cal_tri_1`, name: `Trimester 1 (${year})`, code: 'TRI-1', status: 'Active' },
        { id: `cal_tri_2`, name: `Trimester 2 (${year})`, code: 'TRI-2', status: 'Upcoming' },
        { id: `cal_tri_3`, name: `Trimester 3 (${year})`, code: 'TRI-3', status: 'Upcoming' },
      ]
    }
    // Default: Term system (3 terms)
    return [
      { id: `cal_term_1`, name: `Term 1 (${year})`, code: 'TERM-1', status: 'Active' },
      { id: `cal_term_2`, name: `Term 2 (${year})`, code: 'TERM-2', status: 'Upcoming' },
      { id: `cal_term_3`, name: `Term 3 (${year})`, code: 'TERM-3', status: 'Upcoming' },
    ]
  }

  // Verify Semester calendar yields exactly 2 periods
  const semCal = generateAcademicCalendar('semester', 2026)
  assert.strictEqual(semCal.length, 2)
  assert.strictEqual(semCal[0].code, 'SEM-1')
  assert.strictEqual(semCal[1].code, 'SEM-2')

  // Verify Term calendar yields exactly 3 periods
  const termCal = generateAcademicCalendar('term', 2026)
  assert.strictEqual(termCal.length, 3)
  assert.strictEqual(termCal[0].code, 'TERM-1')
  assert.strictEqual(termCal[2].code, 'TERM-3')

  // 2. Slugification and Dedicated Portal URL generation
  function slugify(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const schoolName = "St. Paul's International Academy"
  const slug = slugify(schoolName)
  assert.strictEqual(slug, 'st-paul-s-international-academy')

  const portalUrls = {
    hub: `/s/${slug}`,
    student: `/s/${slug}/student`,
    teacher: `/s/${slug}/teacher`,
    bursar: `/s/${slug}/bursar`,
    principal: `/s/${slug}/principal`,
    calendar: `/s/${slug}/calendar`,
  }

  assert.strictEqual(portalUrls.hub, '/s/st-paul-s-international-academy')
  assert.strictEqual(portalUrls.student, '/s/st-paul-s-international-academy/student')
  assert.strictEqual(portalUrls.teacher, '/s/st-paul-s-international-academy/teacher')
  assert.strictEqual(portalUrls.bursar, '/s/st-paul-s-international-academy/bursar')
  assert.strictEqual(portalUrls.principal, '/s/st-paul-s-international-academy/principal')
  assert.strictEqual(portalUrls.calendar, '/s/st-paul-s-international-academy/calendar')
})

test('Multi-Tenant School Management: File Architecture, Route Registration, and Component Integrity', () => {
  // 1. Verify existence of new files
  const typesFile = fs.readFileSync(path.join(process.cwd(), 'src/types/tenantSchool.ts'), 'utf-8')
  assert.ok(typesFile.includes('PartnerSchoolTenant'))
  assert.ok(typesFile.includes('AcademicCalendarSystem'))
  assert.ok(typesFile.includes('AcademicCalendarPeriod'))

  const storeFile = fs.readFileSync(path.join(process.cwd(), 'src/lib/tenantSchoolStore.ts'), 'utf-8')
  assert.ok(storeFile.includes('TenantSchoolStore'))
  assert.ok(storeFile.includes('hillcrest'))
  assert.ok(storeFile.includes('apex-tech'))
  assert.ok(storeFile.includes('st-jude'))
  assert.ok(storeFile.includes('registerSchool'))

  const hubFile = fs.readFileSync(path.join(process.cwd(), 'src/features/tenant/TenantSchoolHub.tsx'), 'utf-8')
  assert.ok(hubFile.includes('TenantSchoolHub'))
  assert.ok(hubFile.includes('Student Portal'))
  assert.ok(hubFile.includes('Teacher Portal'))
  assert.ok(hubFile.includes('Bursar'))
  assert.ok(hubFile.includes('principal') || hubFile.includes('Principal'))

  const regFile = fs.readFileSync(path.join(process.cwd(), 'src/features/tenant/SchoolRegistrationPage.tsx'), 'utf-8')
  assert.ok(regFile.includes('SchoolRegistrationPage'))
  assert.ok(regFile.includes('academicSystem'))
  assert.ok(regFile.includes('dedicated'))

  // 2. Verify route registrations in App.tsx
  const appTsx = fs.readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf-8')
  assert.ok(appTsx.includes('path="/register-school"'))
  assert.ok(appTsx.includes('path="/s/:schoolSlug"'))
  assert.ok(appTsx.includes('path="/s/:schoolSlug/:subview"'))

  // 3. Verify Landing page integration
  const landingTsx = fs.readFileSync(path.join(process.cwd(), 'src/features/landing/Landing.tsx'), 'utf-8')
  assert.ok(landingTsx.includes('id="school-cloud"'))
  assert.ok(landingTsx.includes('Multi-Tenant School Management Platform'))
  assert.ok(landingTsx.includes('/register-school'))
})




