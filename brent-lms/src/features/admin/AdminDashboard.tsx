import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { schoolStore } from '@/lib/schoolData'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { isAccessExpired, formatDate } from '@/lib/utils'
import type { Profile, Course } from '@/lib/database.types'

export function AdminDashboard() {
  const navigate = useNavigate()

  const handlePurgeForLaunch = () => {
    if (window.confirm('Are you sure you want to purge all dummy/test student records, invoices, and inquiries for live production launch?')) {
      schoolStore.purgeAllDataForLaunch()
      alert('All system test records have been wiped clean! The system is 100% fresh for live production launch.')
      window.location.reload()
    }
  }

  // Fetch all user counts
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data: profiles } = await supabase.from('profiles').select('*')
      const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true })
      const { count: lessonCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true })

      const students = profiles?.filter((p) => p.role === 'student') || []
      const teachers = profiles?.filter((p) => p.role === 'teacher') || []
      const expiredStudents = students.filter((s) => isAccessExpired(s.access_expires_at))

      return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        courseCount: courseCount || 0,
        lessonCount: lessonCount || 0,
        expiredStudentsCount: expiredStudents.length,
        activeStudentsCount: students.length - expiredStudents.length,
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
        .limit(5)
      return (data || []) as (Course & { teacher: Profile })[]
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
      subtitle="Brent College • Student admissions, activation codes, school terms & content moderation."
    >
      {/* Quick Action Control Bar */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #1a2a6e 0%, #243A8E 100%)', color: 'white' }}>
        <div className="card-body flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 style={{ color: 'white', fontFamily: 'var(--font-heading)', margin: 0, fontSize: 'var(--text-xl)' }}>
              Administrator Actions
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)' }}>
              Issue admission numbers, renew 30-day access windows, or override 24-hour video locks.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
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
            <Button variant="danger" size="sm" onClick={handlePurgeForLaunch}>
              🧹 Launch Mode (Clean Reset)
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
    </PageWrapper>
  )
}
