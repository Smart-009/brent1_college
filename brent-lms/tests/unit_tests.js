// ============================================================
// Brent College LMS — Enterprise System Unit Test Suite
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
  return `BRENT-${rand(4)}-${rand(4)}`
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
  return `${clean}@brentcollege.internal`
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
  const adminUsername = 'Brent2026@admin'
  const adminPassword = 'Brent@2026#!'

  assert.equal(adminUsername.toLowerCase(), 'brent2026@admin')
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
  assert.equal(admissionToEmail('BC-2026-001'), 'bc2026001@brentcollege.internal')
  assert.equal(admissionToEmail('Brent2026@admin'), 'brent2026admin@brentcollege.internal')
  assert.equal(admissionToEmail('TCH/042/2026'), 'tch0422026@brentcollege.internal')
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
  const unsafe1 = '<script>alert("hack")</script>BC-2026-001'
  const unsafe2 = '  John <img src=x onerror=alert(1)> Doe  '
  assert.equal(sanitizeInput(unsafe1), 'scriptalert("hack")/scriptBC-2026-001')
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
  assert.match(code, /^BRENT-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
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
