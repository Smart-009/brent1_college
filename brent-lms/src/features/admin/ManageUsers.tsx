import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { RoleBadge } from '@/components/ui/Badge'
import { isAccessExpired, formatDate, daysUntil } from '@/lib/utils'
import type { Profile, Role, Class } from '@/lib/database.types'

export function ManageUsers() {
  const queryClient = useQueryClient()

  const [activeRoleTab, setActiveRoleTab] = useState<'all' | 'student' | 'teacher'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [admissionNumber, setAdmissionNumber] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [classId, setClassId] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)

  // Fetch all profiles
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-manage-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as Profile[]
    },
  })

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['classes-admin-users'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name')
      return (data || []) as Class[]
    },
  })

  // Add user mutation (calls Supabase signup / edge function or fallback)
  const addUserMutation = useMutation({
    mutationFn: async () => {
      if (!fullName.trim() || !admissionNumber.trim() || !password.trim()) {
        throw new Error('Please complete all required fields.')
      }

      const email = `${admissionNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@brentcollege.internal`

      // Call Supabase signUp
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            admission_number: admissionNumber.trim().toUpperCase(),
            role,
          },
        },
      })

      if (authErr) throw authErr

      // If class ID selected for student, enroll in class
      if (role === 'student' && classId && authData.user) {
        await supabase.from('class_enrollments').insert({
          student_id: authData.user.id,
          class_id: classId,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-manage-users'] })
      setShowAddModal(false)
      setFullName('')
      setAdmissionNumber('')
      setPassword('')
      setModalError(null)
    },
    onError: (err: Error) => {
      setModalError(err.message)
    },
  })

  const filteredUsers = users?.filter((u) => {
    const matchesTab = activeRoleTab === 'all' ? true : u.role === activeRoleTab
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <PageWrapper
      title="User & Admission Management"
      subtitle="Issue admission numbers, set temporary passwords, and assign student grade classes."
      action={
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setRole('student')
              setShowAddModal(true)
            }}
          >
            + Add New Student
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRole('teacher')
              setShowAddModal(true)
            }}
          >
            + Add New Teacher
          </Button>
        </div>
      }
    >
      {/* Search & Tabs */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="search-wrapper mb-4">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search users by full name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="tabs mb-0">
            <button
              className={`tab-btn ${activeRoleTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('all')}
            >
              All Users ({users?.length || 0})
            </button>
            <button
              className={`tab-btn ${activeRoleTab === 'student' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('student')}
            >
              🎓 Students ({users?.filter((u) => u.role === 'student').length || 0})
            </button>
            <button
              className={`tab-btn ${activeRoleTab === 'teacher' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('teacher')}
            >
              👩‍🏫 Teachers ({users?.filter((u) => u.role === 'teacher').length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      ) : filteredUsers && filteredUsers.length > 0 ? (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Admission / ID</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Status / Access</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isExpired = u.role === 'student' && isAccessExpired(u.access_expires_at)
                  const daysLeft = u.access_expires_at ? daysUntil(u.access_expires_at) : null

                  return (
                    <tr key={u.id}>
                      <td className="font-mono text-xs font-bold">{u.admission_number}</td>
                      <td>{u.full_name}</td>
                      <td>
                        <RoleBadge role={u.role} />
                      </td>
                      <td>
                        {u.role === 'student' ? (
                          isExpired ? (
                            <span className="badge badge-danger">⏳ Expired (0 Days)</span>
                          ) : (
                            <span className="badge badge-success">
                              ✅ Active ({daysLeft} days left)
                            </span>
                          )
                        ) : (
                          <span className="badge badge-muted">Unlimited</span>
                        )}
                      </td>
                      <td className="text-xs text-muted">{formatDate(u.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-state-icon">👤</div>
          <div className="empty-state-title">No Users Found</div>
          <div className="empty-state-desc">
            No user profiles match your search filter.
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={role === 'student' ? '🎓 Issue New Student Admission' : '👩‍🏫 Create Teacher Account'}
        size="md"
      >
        {modalError && (
          <div className="alert alert-danger mb-4">
            <span className="alert-icon">⚠️</span>
            <div>{modalError}</div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            addUserMutation.mutate()
          }}
        >
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Hassan Abdi Mohamed"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admNo">
              {role === 'student' ? 'Admission Number *' : 'Staff ID / ID Number *'}
            </label>
            <input
              id="admNo"
              type="text"
              placeholder={role === 'student' ? 'BC-2026-001' : 'TCH-001'}
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              required
            />
            <span className="form-hint">Must be unique within Brent College</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tempPass">Temporary Password *</label>
            <input
              id="tempPass"
              type="text"
              placeholder="Min 6 characters (e.g. Brent2026!)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="form-hint">The user will be prompted to change this password on first login.</span>
          </div>

          {role === 'student' && (
            <div className="form-group">
              <label className="form-label" htmlFor="classGroup">Assign Class / Grade</label>
              <select id="classGroup" value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">-- Select Class --</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={addUserMutation.isPending}>
              Issue & Create Account →
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
