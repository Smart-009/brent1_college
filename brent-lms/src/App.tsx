import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LayoutShell } from '@/components/layout/LayoutShell'
import { LoadingScreen } from '@/components/ui/Spinner'

// Direct import for Home/Landing page for instant render
import { Landing } from '@/features/landing/Landing'
const Login = lazy(() => import('@/features/auth/Login').then((m) => ({ default: m.Login })))
const ChangePassword = lazy(() => import('@/features/auth/ChangePassword').then((m) => ({ default: m.ChangePassword })))
const AccessExpired = lazy(() => import('@/features/auth/AccessExpired').then((m) => ({ default: m.AccessExpired })))

// Lazy-loaded Student Pages
const StudentDashboard = lazy(() => import('@/features/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard })))
const CourseList = lazy(() => import('@/features/student/CourseList').then((m) => ({ default: m.CourseList })))
const CourseDetail = lazy(() => import('@/features/student/CourseDetail').then((m) => ({ default: m.CourseDetail })))
const LessonPlayer = lazy(() => import('@/features/student/LessonPlayer').then((m) => ({ default: m.LessonPlayer })))
const ProgressView = lazy(() => import('@/features/student/ProgressView').then((m) => ({ default: m.ProgressView })))

// Lazy-loaded Teacher Pages
const TeacherDashboard = lazy(() => import('@/features/teacher/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard })))
const MyCourses = lazy(() => import('@/features/teacher/MyCourses').then((m) => ({ default: m.MyCourses })))
const CreateCourse = lazy(() => import('@/features/teacher/CreateCourse').then((m) => ({ default: m.CreateCourse })))
const LessonUploader = lazy(() => import('@/features/teacher/LessonUploader').then((m) => ({ default: m.LessonUploader })))
const EditLesson = lazy(() => import('@/features/teacher/EditLesson').then((m) => ({ default: m.EditLesson })))
const AttendanceTracker = lazy(() => import('@/features/teacher/AttendanceTracker').then((m) => ({ default: m.AttendanceTracker })))
const GradeBook = lazy(() => import('@/features/teacher/GradeBook').then((m) => ({ default: m.GradeBook })))
const StudentProgressView = lazy(() => import('@/features/teacher/StudentProgressView').then((m) => ({ default: m.StudentProgressView })))

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))
const ManageUsers = lazy(() => import('@/features/admin/ManageUsers').then((m) => ({ default: m.ManageUsers })))
const ManageClasses = lazy(() => import('@/features/admin/ManageClasses').then((m) => ({ default: m.ManageClasses })))
const ManageSubjects = lazy(() => import('@/features/admin/ManageSubjects').then((m) => ({ default: m.ManageSubjects })))
const ManageTerms = lazy(() => import('@/features/admin/ManageTerms').then((m) => ({ default: m.ManageTerms })))
const ActivationManager = lazy(() => import('@/features/admin/ActivationManager').then((m) => ({ default: m.ActivationManager })))
const ContentModeration = lazy(() => import('@/features/admin/ContentModeration').then((m) => ({ default: m.ContentModeration })))
const AnnouncementsAdmin = lazy(() => import('@/features/admin/AnnouncementsAdmin').then((m) => ({ default: m.AnnouncementsAdmin })))

// Lazy-loaded College SIMS & Hub Pages
const StudentDirectory = lazy(() => import('@/features/sis/StudentDirectory').then((m) => ({ default: m.StudentDirectory })))
const TimetableView = lazy(() => import('@/features/timetable/TimetableView').then((m) => ({ default: m.TimetableView })))
const ExamManagement = lazy(() => import('@/features/exams/ExamManagement').then((m) => ({ default: m.ExamManagement })))
const FeeManagement = lazy(() => import('@/features/fees/FeeManagement').then((m) => ({ default: m.FeeManagement })))
const ResourceLibrary = lazy(() => import('@/features/library/ResourceLibrary').then((m) => ({ default: m.ResourceLibrary })))
const DisciplineTracker = lazy(() => import('@/features/discipline/DisciplineTracker').then((m) => ({ default: m.DisciplineTracker })))
const ParentDashboard = lazy(() => import('@/features/parent/ParentDashboard').then((m) => ({ default: m.ParentDashboard })))
const SchoolNoticeboard = lazy(() => import('@/features/announcements/SchoolNoticeboard').then((m) => ({ default: m.SchoolNoticeboard })))
const BursarDesk = lazy(() => import('@/features/bursar/BursarDesk').then((m) => ({ default: m.BursarDesk })))
const SecretaryDesk = lazy(() => import('@/features/secretary/SecretaryDesk').then((m) => ({ default: m.SecretaryDesk })))

/** Auth Guard Component */
function RequireAuth({ children, allowedRoles }: { children: ReactElement; allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen message="Verifying security session..." />
  if (!user || !profile) return <Navigate to="/login" replace />

  // Forced password change check
  if (profile.first_login_at === null && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  // Role authorization check
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'admin') return <Navigate to="/admin" replace />
    if (profile.role === 'bursar') return <Navigate to="/bursar" replace />
    if (profile.role === 'teacher') return <Navigate to="/teacher" replace />
    if (profile.role === 'parent') return <Navigate to="/parent" replace />
    return <Navigate to="/student" replace />
  }

  return children
}

export function App() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading Brent College Portal..." />}>
      <Routes>
        {/* Public Landing & Login */}
        <Route path="/" element={<Landing />} />
        <Route path="/courses" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/access-expired" element={<AccessExpired />} />

        {/* Authenticated Layout Routes */}
        <Route
          element={
            <RequireAuth>
              <LayoutShell />
            </RequireAuth>
          }
        >
          {/* Universal College System Hub Modules */}
          <Route path="/timetable" element={<TimetableView />} />
          <Route path="/exams" element={<ExamManagement />} />
          <Route path="/fees" element={<FeeManagement />} />
          <Route path="/library" element={<ResourceLibrary />} />
          <Route path="/noticeboard" element={<SchoolNoticeboard />} />
          <Route path="/discipline" element={<DisciplineTracker />} />
          <Route path="/students" element={<StudentDirectory />} />

          {/* Specialized Roles & Desks */}
          <Route path="/bursar" element={<BursarDesk />} />
          <Route path="/secretary" element={<Navigate to="/bursar" replace />} />
          <Route path="/parent" element={<ParentDashboard />} />

          {/* Student Portal Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<CourseList />} />
          <Route path="/student/courses/:id" element={<CourseDetail />} />
          <Route path="/student/lesson/:lessonId" element={<LessonPlayer />} />
          <Route path="/student/progress" element={<ProgressView />} />

          {/* Teacher Portal Routes */}
          <Route
            path="/teacher"
            element={
              <RequireAuth allowedRoles={['teacher', 'admin']}>
                <TeacherDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/courses"
            element={
              <RequireAuth allowedRoles={['teacher', 'admin']}>
                <MyCourses />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/courses/new"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <CreateCourse />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/courses/new"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <CreateCourse />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/lesson/new"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <LessonUploader />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/lesson/:id/edit"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <EditLesson />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/attendance"
            element={
              <RequireAuth allowedRoles={['teacher', 'admin']}>
                <AttendanceTracker />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/gradebook"
            element={
              <RequireAuth allowedRoles={['teacher', 'admin']}>
                <GradeBook />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <RequireAuth allowedRoles={['teacher', 'admin']}>
                <StudentProgressView />
              </RequireAuth>
            }
          />

          {/* Admin Portal Routes */}
          <Route
            path="/admin"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <ManageUsers />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/classes"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <ManageClasses />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <ManageSubjects />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/terms"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <ManageTerms />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/activations"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <ActivationManager />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <ContentModeration />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <AnnouncementsAdmin />
              </RequireAuth>
            }
          />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
