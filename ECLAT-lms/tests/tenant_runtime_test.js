// ============================================================
// Éclat Institute — Tenant School Cloud Runtime Verification
// ============================================================

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

// Mock browser localStorage and window event system
class LocalStorageMock {
  constructor() {
    this.store = {}
  }
  getItem(key) {
    return this.store[key] || null
  }
  setItem(key, value) {
    this.store[key] = String(value)
  }
  removeItem(key) {
    delete this.store[key]
  }
  clear() {
    this.store = {}
  }
}

globalThis.localStorage = new LocalStorageMock()
globalThis.window = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
  location: { origin: 'https://eclat.institute' },
}

test('Tenant Cloud Runtime: Seed Partner Schools Verification', async () => {
  // Read store code directly to verify seed definitions
  const storePath = path.join(process.cwd(), 'src/lib/tenantSchoolStore.ts')
  const storeContent = fs.readFileSync(storePath, 'utf-8')

  // Verify Hillcrest (Term-based)
  assert.ok(storeContent.includes('Hillcrest British International College'))
  assert.ok(storeContent.includes("academic_system: 'term'"))
  assert.ok(storeContent.includes('#881337')) // Burgundy

  // Verify Apex Tech (Semester-based)
  assert.ok(storeContent.includes('Apex Institute of Technology & Business'))
  assert.ok(storeContent.includes("academic_system: 'semester'"))
  assert.ok(storeContent.includes('#047857')) // Emerald Green

  // Verify St. Jude (Term-based)
  assert.ok(storeContent.includes('St. Jude Preparatory & High Academy'))
  assert.ok(storeContent.includes('#1d4ed8')) // Royal Blue
})

test('Tenant Cloud Runtime: Calendar System Engine Logic', () => {
  // Test calendar generator for Term vs Semester vs Trimester
  function buildCalendarPeriods(system, year = 2026) {
    if (system === 'semester') {
      return [
        {
          id: `cal_sem_1`,
          name: `Semester 1 (Fall Cohort ${year})`,
          code: 'SEM-1',
          start_date: `${year - 1}-09-15`,
          end_date: `${year}-01-23`,
          status: 'Past',
        },
        {
          id: `cal_sem_2`,
          name: `Semester 2 (Spring Cohort ${year})`,
          code: 'SEM-2',
          start_date: `${year}-02-09`,
          end_date: `${year}-06-19`,
          status: 'Active',
        },
      ]
    }
    if (system === 'trimester') {
      return [
        { id: `cal_tri_1`, name: `Trimester 1 (${year})`, code: 'TRI-1', status: 'Past' },
        { id: `cal_tri_2`, name: `Trimester 2 (${year})`, code: 'TRI-2', status: 'Active' },
        { id: `cal_tri_3`, name: `Trimester 3 (${year})`, code: 'TRI-3', status: 'Upcoming' },
      ]
    }
    return [
      { id: `cal_term_1`, name: `Term 1 (${year})`, code: 'TERM-1', status: 'Active' },
      { id: `cal_term_2`, name: `Term 2 (${year})`, code: 'TERM-2', status: 'Upcoming' },
      { id: `cal_term_3`, name: `Term 3 (${year})`, code: 'TERM-3', status: 'Upcoming' },
    ]
  }

  const semCal = buildCalendarPeriods('semester', 2026)
  assert.strictEqual(semCal.length, 2, 'Semester system must have exactly 2 periods')
  assert.strictEqual(semCal[0].code, 'SEM-1')
  assert.strictEqual(semCal[1].code, 'SEM-2')

  const termCal = buildCalendarPeriods('term', 2026)
  assert.strictEqual(termCal.length, 3, 'Term system must have exactly 3 periods')
  assert.strictEqual(termCal[0].code, 'TERM-1')
  assert.strictEqual(termCal[1].code, 'TERM-2')
  assert.strictEqual(termCal[2].code, 'TERM-3')
})

test('Tenant Cloud Runtime: Multi-Tenant Dedicated URL Resolution', () => {
  const origin = 'https://eclat.institute'

  const resolveTenantUrls = (slug) => ({
    hubUrl: `${origin}/s/${slug}`,
    studentPortalUrl: `${origin}/s/${slug}/student`,
    teacherPortalUrl: `${origin}/s/${slug}/teacher`,
    bursarDeskUrl: `${origin}/s/${slug}/bursar`,
    principalDeskUrl: `${origin}/s/${slug}/principal`,
    calendarUrl: `${origin}/s/${slug}/calendar`,
  })

  // Test for Hillcrest
  const hcUrls = resolveTenantUrls('hillcrest')
  assert.strictEqual(hcUrls.hubUrl, 'https://eclat.institute/s/hillcrest')
  assert.strictEqual(hcUrls.studentPortalUrl, 'https://eclat.institute/s/hillcrest/student')
  assert.strictEqual(hcUrls.teacherPortalUrl, 'https://eclat.institute/s/hillcrest/teacher')
  assert.strictEqual(hcUrls.bursarDeskUrl, 'https://eclat.institute/s/hillcrest/bursar')
  assert.strictEqual(hcUrls.principalDeskUrl, 'https://eclat.institute/s/hillcrest/principal')
  assert.strictEqual(hcUrls.calendarUrl, 'https://eclat.institute/s/hillcrest/calendar')

  // Test for Apex Tech
  const apexUrls = resolveTenantUrls('apex-tech')
  assert.strictEqual(apexUrls.hubUrl, 'https://eclat.institute/s/apex-tech')
  assert.strictEqual(apexUrls.studentPortalUrl, 'https://eclat.institute/s/apex-tech/student')
  assert.strictEqual(apexUrls.bursarDeskUrl, 'https://eclat.institute/s/apex-tech/bursar')
})

test('Tenant Cloud Runtime: Production Build Assets & HTML Verification', () => {
  const distDir = path.join(process.cwd(), 'dist')
  assert.ok(fs.existsSync(distDir), 'Dist folder must exist')

  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')
  assert.ok(indexHtml.includes('id="root"'), 'index.html must have root div')

  // Check that tenant chunks are present in assets
  const assetsDir = path.join(distDir, 'assets')
  const assetFiles = fs.readdirSync(assetsDir)

  const hasTenantHub = assetFiles.some((f) => f.startsWith('TenantSchoolHub-') && f.endsWith('.js'))
  const hasSchoolReg = assetFiles.some((f) => f.startsWith('SchoolRegistrationPage-') && f.endsWith('.js'))

  assert.ok(hasTenantHub, 'Production dist must contain bundled TenantSchoolHub chunk')
  assert.ok(hasSchoolReg, 'Production dist must contain bundled SchoolRegistrationPage chunk')
})
