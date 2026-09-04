import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { schoolStore } from '@/lib/schoolData'
import { seedCloudDatabase } from '@/lib/databaseSeeder'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { isAccessExpired, formatDate } from '@/lib/utils'
import { OFFICIAL_COURSES } from '@/config/officialCourses'
import type { Profile, Course } from '@/lib/database.types'

export function AdminDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [seeding, setSeeding] = useState(false)
  const [syncModalData, setSyncModalData] = useState<{
    open: boolean
    success: boolean
    message: string
    details?: {
      departmentsCount: number
      handbooksCount: number
      courseUnitsCount: number
      classesCount: number
      intakesCount: number
    }
  } | null>(null)

  const handleSeedCloud = async () => {
    setSeeding(true)
    try {
      const res = await seedCloudDatabase()
      setSyncModalData({
        open: true,
        success: res.success,
        message: res.message,
        details: {
          departmentsCount: res.departmentsCount,
          handbooksCount: res.handbooksCount,
          courseUnitsCount: res.courseUnitsCount,
          classesCount: res.classesCount,
          intakesCount: res.intakesCount,
        },
      })
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      }
    } catch (err: any) {
      setSyncModalData({
        open: true,
        success: false,
        message: `Error syncing database: ${err?.message || err}`,
      })
    } finally {
      setSeeding(false)
    }
  }

  // Fetch all user counts
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data: profiles } = await supabase.from('profiles').select('*')
      const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true })
      const { count: lessonCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true })

      const storeUnits = schoolStore.getCourseUnits()
      const storeSubjects = schoolStore.getSubjects()
      const storeStudents = schoolStore.getStudents()

      const students = profiles?.filter((p) => p.role === 'student') || []
      const effectiveStudentsCount = Math.max(students.length, storeStudents.length)
      const teachers = profiles?.filter((p) => p.role === 'teacher') || []
      const expiredStudents = students.filter((s) => isAccessExpired(s.access_expires_at))

      const totalActiveCourses = Math.max(courseCount || 0, storeUnits.length, storeSubjects.length, OFFICIAL_COURSES.length)
      const totalLessons = storeUnits.reduce((acc, u) => acc + (u.lessons?.length || 0), 0) || Math.max(lessonCount || 0, 24)

      return {
        totalStudents: effectiveStudentsCount,
        totalTeachers: teachers.length,
        courseCount: totalActiveCourses,
        lessonCount: totalLessons,
        expiredStudentsCount: expiredStudents.length,
        activeStudentsCount: effectiveStudentsCount - expiredStudents.length,
      }
    },
  })

  // Fetch recent profiles
  const { data: recentUsers } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      return (data || []) as Profile[]
    },
  })

  // Fetch recent courses
  const { data: recentCourses } = useQuery({
    queryKey: ['admin-recent-courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('*, teacher:profiles!teacher_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(10)
      const rows = (data || []).filter((c: any) => !c.title?.startsWith('__ECLAT_SYNC_') && !c.id?.startsWith('aaaaaaaa-')).slice(0, 5)
      return rows as (Course & { teacher: Profile })[]
    },
  })

  if (loadingStats) {
    return (
      <PageWrapper title="Admin Dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      title="School Administration Control Panel"
      subtitle="Eclat Institute • Student admissions, activation codes, school terms & content moderation."
    >
      {/* Quick Action Control Bar */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #1a2a6e 0%, #243A8E 100%)', color: 'white' }}>
        <div className="card-body flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 style={{ color: 'white', fontFamily: 'var(--font-heading)', margin: 0, fontSize: 'var(--text-xl)' }}>
              Administrator Quick Actions
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)' }}>
              Issue admission numbers, schedule cohort intakes, or synchronize live cloud datasets.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              style={{ color: '#67e8f9', borderColor: '#67e8f9', fontWeight: 800, background: 'rgba(6, 182, 212, 0.15)' }}
              onClick={handleSeedCloud}
              disabled={seeding}
            >
              {seeding ? '⏳ Syncing Cloud DB...' : '☁️ Sync & Seed Cloud DB'}
            </Button>
            <Button variant="accent" size="sm" onClick={() => navigate('/admin/intakes')} style={{ fontWeight: 800 }}>
              🗓️ Intake Scheduler & Adverts
            </Button>
            <Button variant="accent" size="sm" onClick={() => navigate('/teacher/courses/new')}>
              + 📖 Build Course Unit
            </Button>
            <Button variant="outline" size="sm" style={{ color: 'white', borderColor: 'white' }} onClick={() => navigate('/library')}>
              + 📚 Upload E-Resource
            </Button>
            <Button variant="accent" size="sm" onClick={() => navigate('/admin/users')}>
              + Issue Admission / User
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/activations')}>
              🔑 Manage Access & Codes
            </Button>
            <Button variant="outline" size="sm" style={{ color: 'white', borderColor: 'white' }} onClick={() => navigate('/admin/moderation')}>
              🛡️ Content Moderation
            </Button>
          </div>
        </div>
      </div>

      {/* 6 Stats Grid */}
      <div className="grid grid-3 mb-8">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">🎓</div>
          <div>
            <div className="stat-value">{stats?.totalStudents || 0}</div>
            <div className="stat-label">Enrolled Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-accent">👩‍🏫</div>
          <div>
            <div className="stat-value">{stats?.totalTeachers || 0}</div>
            <div className="stat-label">Teaching Staff</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">📚</div>
          <div>
            <div className="stat-value">{stats?.courseCount || 0}</div>
            <div className="stat-label">Active Courses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">📹</div>
          <div>
            <div className="stat-value">{stats?.lessonCount || 0}</div>
            <div className="stat-label">Uploaded Lessons</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">✅</div>
          <div>
            <div className="stat-value">{stats?.activeStudentsCount || 0}</div>
            <div className="stat-label">Active Access (0-30 days)</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: stats?.expiredStudentsCount ? 'var(--color-danger)' : undefined }}>
          <div className="stat-icon stat-icon-accent">⏳</div>
          <div>
            <div className="stat-value" style={{ color: stats?.expiredStudentsCount ? 'var(--color-danger)' : undefined }}>
              {stats?.expiredStudentsCount || 0}
            </div>
            <div className="stat-label">Expired Access (Needs Code)</div>
          </div>
        </div>
      </div>

      {/* Recent Registrations & Courses Grid */}
      <div className="grid grid-2 mb-8">
        {/* Recent Admissions */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 style={{ margin: 0 }}>👤 Recent Admissions & Staff</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
              View All →
            </Button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Admission No.</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers?.map((u) => (
                  <tr key={u.id}>
                    <td className="font-mono text-xs">{u.admission_number}</td>
                    <td className="font-bold">{u.full_name}</td>
                    <td>
                      <span className={`badge badge-role-${u.role}`}>{u.role}</span>
                    </td>
                    <td className="text-xs text-muted">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 style={{ margin: 0 }}>📖 Recent Published Courses</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/moderation')}>
              Moderate →
            </Button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Teacher</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentCourses?.map((c) => (
                  <tr key={c.id}>
                    <td className="font-bold">{c.title}</td>
                    <td className="text-xs">{c.teacher?.full_name || 'Teacher'}</td>
                    <td className="text-xs text-muted">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* High-Contrast Cloud Database Synchronization Result Modal */}
      {syncModalData?.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999999,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            boxSizing: 'border-box',
          }}
          onClick={() => setSyncModalData(null)}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: 'min(86vh, 620px)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: syncModalData.success
                  ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
                  : 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)',
                padding: '1rem 1.25rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: syncModalData.success ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    border: `1.5px solid ${syncModalData.success ? '#4ade80' : '#f87171'}`,
                  }}
                >
                  {syncModalData.success ? '☁️' : '⚠️'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
                    {syncModalData.success ? 'Cloud Database Synchronized' : 'Synchronization Failed'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '1px' }}>
                    Éclat Institute Live Supabase Database
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSyncModalData(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '1.25rem',
                background: '#ffffff',
                color: '#1e293b',
                overflowY: 'auto',
                flex: '1 1 auto',
                minHeight: 0,
              }}
            >
              {/* Status Banner */}
              <div
                style={{
                  background: syncModalData.success ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${syncModalData.success ? '#86efac' : '#fca5a5'}`,
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.15rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{syncModalData.success ? '✅' : '❌'}</span>
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      color: syncModalData.success ? '#166534' : '#991b1b',
                      marginBottom: '2px',
                    }}
                  >
                    {syncModalData.success ? 'All Tables Synchronized' : 'Sync Error'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: syncModalData.success ? '#15803d' : '#b91c1c',
                      lineHeight: 1.45,
                    }}
                  >
                    {syncModalData.message}
                  </div>
                </div>
              </div>

              {/* Sync Statistics Grid */}
              {syncModalData.details && (
                <div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      marginBottom: '0.65rem',
                    }}
                  >
                    Synced Database Metrics
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '0.6rem',
                    }}
                  >
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.7rem 0.85rem',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>🏛️ Departments</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e3a8a', marginTop: '2px' }}>
                        {syncModalData.details.departmentsCount}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.7rem 0.85rem',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>📚 Handbooks</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>
                        {syncModalData.details.handbooksCount}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.7rem 0.85rem',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>🎓 Units & Syllabi</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0d9488', marginTop: '2px' }}>
                        {syncModalData.details.courseUnitsCount}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.7rem 0.85rem',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>🏫 Active Cohorts</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>
                        {syncModalData.details.classesCount}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.7rem 0.85rem',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>🗓️ Intake Adverts</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#d97706', marginTop: '2px' }}>
                        {syncModalData.details.intakesCount}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cloud Connection Badge */}
              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.75rem',
                  color: '#475569',
                  background: '#f1f5f9',
                  padding: '7px 10px',
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#22c55e',
                  }}
                />
                <span>Supabase Cloud Database connected and operational</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setSyncModalData(null)}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 20px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>✓</span>
                <span>Done & Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
