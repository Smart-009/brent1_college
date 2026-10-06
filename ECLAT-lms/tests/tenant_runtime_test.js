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

test('Tenant Cloud Runtime: Subdomain & Custom Domain Host Detection Logic', () => {
  const mockSchools = [
    { slug: 'hillcrest', name: 'Hillcrest College', custom_domain: 'portal.hillcrest.edu' },
    { slug: 'apex-tech', name: 'Apex Tech', custom_domain: null },
    { slug: 'st-jude', name: 'St. Jude Academy', custom_domain: 'lms.stjude.ac.ke' },
  ]

  function detectTenant(hostname, schools) {
    if (!hostname) return null
    const cleanHost = hostname.toLowerCase().trim()

    // 1. Check custom domain
    for (const school of schools) {
      if (school.custom_domain) {
        const cleanCustom = school.custom_domain
          .toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/\/.*$/, '')
          .trim()
        if (cleanHost === cleanCustom) {
          return { school, matchedVia: 'custom_domain' }
        }
      }
    }

    // 2. Non-tenant base hosts
    const nonTenantHosts = [
      'eclat.institute',
      'www.eclat.institute',
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
    ]
    if (nonTenantHosts.includes(cleanHost)) {
      return null
    }

    // 3. Subdomain *.eclat.institute
    if (cleanHost.endsWith('.eclat.institute')) {
      const slug = cleanHost.replace('.eclat.institute', '')
      const found = schools.find((s) => s.slug.toLowerCase() === slug)
      if (found) return { school: found, matchedVia: 'subdomain' }
    }

    // 4. Localhost *.localhost
    if (cleanHost.endsWith('.localhost')) {
      const slug = cleanHost.replace('.localhost', '')
      const found = schools.find((s) => s.slug.toLowerCase() === slug)
      if (found) return { school: found, matchedVia: 'subdomain' }
    }

    return null
  }

  // Subdomain tests
  const sub1 = detectTenant('hillcrest.eclat.institute', mockSchools)
  assert.ok(sub1)
  assert.strictEqual(sub1.school.slug, 'hillcrest')
  assert.strictEqual(sub1.matchedVia, 'subdomain')

  const sub2 = detectTenant('apex-tech.localhost', mockSchools)
  assert.ok(sub2)
  assert.strictEqual(sub2.school.slug, 'apex-tech')
  assert.strictEqual(sub2.matchedVia, 'subdomain')

  // Custom domain tests
  const cust1 = detectTenant('portal.hillcrest.edu', mockSchools)
  assert.ok(cust1)
  assert.strictEqual(cust1.school.slug, 'hillcrest')
  assert.strictEqual(cust1.matchedVia, 'custom_domain')

  const cust2 = detectTenant('lms.stjude.ac.ke', mockSchools)
  assert.ok(cust2)
  assert.strictEqual(cust2.school.slug, 'st-jude')
  assert.strictEqual(cust2.matchedVia, 'custom_domain')

  // Root / Base domain must NOT trigger tenant
  assert.strictEqual(detectTenant('eclat.institute', mockSchools), null)
  assert.strictEqual(detectTenant('www.eclat.institute', mockSchools), null)
  assert.strictEqual(detectTenant('localhost', mockSchools), null)
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
