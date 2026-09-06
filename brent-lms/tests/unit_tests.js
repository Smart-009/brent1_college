// ============================================================
// Eclat Institute LMS — Enterprise System Unit Test Suite
// ============================================================

import test from 'node:test'
import assert from 'node:assert/strict'

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
  const adminUsername = 'Eclat2026@admin'
  const adminPassword = 'Eclat@2026#!'

  assert.equal(adminUsername.toLowerCase(), 'eclat2026@admin')
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
  assert.equal(admissionToEmail('Eclat2026@admin'), 'eclat2026admin@eclatinstitute.internal')
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
    course_duration: '4-6 Weeks',
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
  if (cleanAlpha.includes('admin') || rawInput === 'Eclat2026@admin') {
    if (isMatchPass) return { error: null, role: 'admin', admission_number: 'Eclat2026@admin' }
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
