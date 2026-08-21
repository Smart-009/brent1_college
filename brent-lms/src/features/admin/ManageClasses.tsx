import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'

export interface DepartmentProgram {
  id: string
  name: string
  hod_name?: string
  grade_level: string | null
  academic_year: string | null
  fee_amount?: number
  duration?: string
  shifts?: string
  icon?: string
  created_at?: string
}

const CURRENT_YEAR = new Date().getFullYear()

const DEFAULT_DEPARTMENTS: DepartmentProgram[] = [
  {
    id: 'dept-ict',
    name: 'Computer Packages & Digital Information Technology',
    hod_name: 'Mr. David Mwangi',
    grade_level: 'Vocational Short Course Certificate',
    academic_year: `${CURRENT_YEAR} Practical Intake`,
    fee_amount: 4500,
    duration: '4-6 Weeks',
    shifts: 'Morning (8:30AM) / Evening (5:30PM)',
    icon: '💻',
  },
  {
    id: 'dept-barista',
    name: 'Professional Barista & Specialty Coffee Brewing',
    hod_name: 'Chef Michael Omondi',
    grade_level: 'Master Barista Certification',
    academic_year: `${CURRENT_YEAR} Practical Intake`,
    fee_amount: 9500,
    duration: '4-6 Weeks',
    shifts: 'Morning (9:00AM) / Afternoon (2:00PM)',
    icon: '☕',
  },
  {
    id: 'dept-languages',
    name: 'Languages & Communication (English & Kiswahili)',
    hod_name: 'Madam Amina Hassan',
    grade_level: 'Fluency Certificate',
    academic_year: `${CURRENT_YEAR} Practical Intake`,
    fee_amount: 4000,
    duration: '4-8 Weeks',
    shifts: 'Morning (7:30AM) / Evening (5:30PM)',
    icon: '🗣️',
  },
  {
    id: 'dept-beauty',
    name: 'Henna Artistry, Cosmetology & Bridal Makeup',
    hod_name: 'Ustadh Fatima Noor',
    grade_level: 'Professional Beauty Certificate',
    academic_year: `${CURRENT_YEAR} Practical Intake`,
    fee_amount: 8000,
    duration: '4-6 Weeks',
    shifts: 'Morning (9:00AM) / Afternoon (1:30PM)',
    icon: '💄',
  },
  {
    id: 'dept-fashion',
    name: 'Fashion Design, Sewing & Garment Tailoring',
    hod_name: 'Madam Mary Wanjiku',
    grade_level: 'Master Tailor Certificate',
    academic_year: `${CURRENT_YEAR} Practical Intake`,
    fee_amount: 10000,
    duration: '8-12 Weeks',
    shifts: 'Full Day Intensive (8:30AM - 4:00PM)',
    icon: '✂️',
  },
  {
    id: 'dept-ielts',
    name: 'IELTS Academic & General Exam Preparation (Band 7.5+)',
    hod_name: 'Prof. Eric Kiprono',
    grade_level: 'International English Certification',
    academic_year: `${CURRENT_YEAR} Practical Intake`,
    fee_amount: 12000,
    duration: '4-6 Weeks',
    shifts: 'Evening (5:30PM) / Saturday Intensive',
    icon: '🌍',
  },
]

export function ManageClasses() {
  const queryClient = useQueryClient()

  // Local state initialized with storage or defaults
  const [localDepts, setLocalDepts] = useState<DepartmentProgram[]>(() => {
    try {
      const saved = localStorage.getItem('brent_admin_departments')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return DEFAULT_DEPARTMENTS
  })

  const saveLocalDepts = (items: DepartmentProgram[]) => {
    setLocalDepts(items)
    try {
      localStorage.setItem('brent_admin_departments', JSON.stringify(items))
    } catch {
      // ignore
    }
  }

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDept, setEditingDept] = useState<DepartmentProgram | null>(null)
  const [deptToDelete, setDeptToDelete] = useState<DepartmentProgram | null>(null)

  // Form Fields
  const [name, setName] = useState('')
  const [hodName, setHodName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('Vocational Short Course Certificate')
  const [academicYear, setAcademicYear] = useState(`${CURRENT_YEAR} Practical Intake`)
  const [feeAmount, setFeeAmount] = useState<number>(4500)
  const [duration, setDuration] = useState('4-6 Weeks')
  const [shifts, setShifts] = useState('Morning / Evening Shifts')
  const [icon, setIcon] = useState('🎓')

  // Fetch departments from Supabase (merging with local state)
  const { isLoading } = useQuery({
    queryKey: ['admin-classes'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('classes').select('*').order('name')
        if (!error && data && data.length > 0) {
          // Merge data from supabase if present
          const merged = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            grade_level: d.grade_level || 'Vocational Short Course Certificate',
            academic_year: d.academic_year || `${CURRENT_YEAR} Practical Intake`,
            hod_name: d.hod_name || 'Lead Instructor',
            fee_amount: d.fee_amount || 4500,
            duration: d.duration || '4-6 Weeks',
            shifts: d.shifts || 'Morning / Evening Shifts',
            icon: d.icon || '🎓',
          }))
          saveLocalDepts(merged)
          return merged
        }
      } catch {
        // use local
      }
      return localDepts
    },
  })

  // Open Edit Modal
  const handleOpenEdit = (dept: DepartmentProgram) => {
    setEditingDept(dept)
    setName(dept.name)
    setHodName(dept.hod_name || '')
    setGradeLevel(dept.grade_level || 'Vocational Short Course Certificate')
    setAcademicYear(dept.academic_year || `${CURRENT_YEAR} Practical Intake`)
    setFeeAmount(dept.fee_amount || 4500)
    setDuration(dept.duration || '4-6 Weeks')
    setShifts(dept.shifts || 'Morning / Evening Shifts')
    setIcon(dept.icon || '🎓')
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingDept(null)
    setName('')
    setHodName('')
    setGradeLevel('Vocational Short Course Certificate')
    setAcademicYear(`${CURRENT_YEAR} Practical Intake`)
    setFeeAmount(4500)
    setDuration('4-6 Weeks')
    setShifts('Morning (8:30AM) / Evening (5:30PM)')
    setIcon('🎓')
    setShowAddModal(true)
  }

  // Save (Create or Update) Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) return

      if (editingDept) {
        // Update existing department
        const updatedList = localDepts.map((d) =>
          d.id === editingDept.id
            ? {
                ...d,
                name: name.trim(),
                hod_name: hodName.trim() || 'Lead Instructor',
                grade_level: gradeLevel.trim() || 'Vocational Short Course Certificate',
                academic_year: academicYear.trim() || `${CURRENT_YEAR} Practical Intake`,
                fee_amount: Number(feeAmount) || 0,
                duration: duration.trim(),
                shifts: shifts.trim(),
                icon: icon.trim() || '🎓',
              }
            : d
        )
        saveLocalDepts(updatedList)

        try {
          await supabase
            .from('classes')
            .update({
              name: name.trim(),
              grade_level: gradeLevel.trim() || null,
              academic_year: academicYear.trim() || `${CURRENT_YEAR}`,
            })
            .eq('id', editingDept.id)
        } catch {
          // ignore error if supabase schema lacks columns
        }
      } else {
        // Create new department
        const newDept: DepartmentProgram = {
          id: `dept-${Date.now()}`,
          name: name.trim(),
          hod_name: hodName.trim() || 'Lead Instructor',
          grade_level: gradeLevel.trim() || 'Vocational Short Course Certificate',
          academic_year: academicYear.trim() || `${CURRENT_YEAR} Practical Intake`,
          fee_amount: Number(feeAmount) || 0,
          duration: duration.trim(),
          shifts: shifts.trim(),
          icon: icon.trim() || '🎓',
        }
        const updatedList = [newDept, ...localDepts]
        saveLocalDepts(updatedList)

        try {
          await supabase.from('classes').insert({
            name: name.trim(),
            grade_level: gradeLevel.trim() || null,
            academic_year: academicYear.trim() || `${CURRENT_YEAR}`,
          })
        } catch {
          // ignore
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] })
      setShowAddModal(false)
      setEditingDept(null)
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const updatedList = localDepts.filter((d) => d.id !== id)
      saveLocalDepts(updatedList)

      try {
        await supabase.from('classes').delete().eq('id', id)
      } catch {
        // ignore
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] })
      setDeptToDelete(null)
    },
  })

  return (
    <PageWrapper
      title="Academic Departments & Vocational Programs"
      subtitle="Full control to create, edit, update, and manage all vocational training departments, HODs, course durations, and tuition fee structures."
      action={
        <Button variant="primary" onClick={handleOpenCreate} style={{ fontWeight: 800 }}>
          + Add New Department / Program
        </Button>
      }
    >
      {/* Department Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #1e3a8a' }}>
          <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 700 }}>Total Academic Departments</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1e3a8a', marginTop: '0.2rem' }}>
            {localDepts.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Active Vocational Programs</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 700 }}>Intake Status</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#16a34a', marginTop: '0.2rem' }}>
            Open 2026
          </div>
          <div style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>Rolling Monthly Admissions</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 700 }}>Short Course Durations</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#d97706', marginTop: '0.2rem' }}>
            4 – 12 Wks
          </div>
          <div style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>Practical Lab Focused</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 700 }}>Campus Location</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#7c3aed', marginTop: '0.4rem' }}>
            Sahl Mall
          </div>
          <div style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>4th Street, Eastleigh, Nairobi</div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      ) : localDepts && localDepts.length > 0 ? (
        <div className="grid grid-2 gap-6">
          {localDepts.map((d) => (
            <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid #cbd5e1' }}>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '2rem', padding: '0.5rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                      {d.icon || '🎓'}
                    </span>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#090d16', margin: 0, lineHeight: 1.3 }}>
                        {d.name}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: '#1e3a8a', fontWeight: 700, marginTop: '2px' }}>
                        👤 Head of Dept: <strong>{d.hod_name || 'Lead Faculty Trainer'}</strong>
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-primary" style={{ fontWeight: 800, fontSize: '0.78rem' }}>
                    {d.academic_year || '2026 Intake'}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1rem', marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#475569', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Course Tuition Fee
                    </span>
                    <strong style={{ color: '#16a34a', fontSize: '1.1rem', fontWeight: 900 }}>
                      KES {d.fee_amount ? d.fee_amount.toLocaleString() : '4,500'}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: '#475569', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Duration
                    </span>
                    <strong style={{ color: '#090d16', fontWeight: 800 }}>
                      ⏱️ {d.duration || '4-6 Weeks'}
                    </strong>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#475569', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Timetable Shifts & Lab Hours
                    </span>
                    <strong style={{ color: '#1e3a8a', fontWeight: 700 }}>
                      📅 {d.shifts || 'Morning (8:30AM) / Evening (5:30PM)'}
                    </strong>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#475569', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Qualification Award
                    </span>
                    <span style={{ color: '#090d16', fontWeight: 600 }}>
                      📜 {d.grade_level || 'Vocational Short Course Certificate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderTop: '1px solid #cbd5e1', padding: '0.85rem 1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ID: <code>{d.id}</code>
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEdit(d)}
                    style={{ fontWeight: 700, color: '#1e3a8a', background: '#eff6ff', borderColor: '#bfdbfe' }}
                  >
                    ✏️ Edit & Update
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeptToDelete(d)}
                    style={{ fontWeight: 700 }}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-state-icon">🏫</div>
          <div className="empty-state-title">No Departments Configured</div>
          <div className="empty-state-desc">
            Create your first college department / vocational program to begin managing short courses and student enrollments.
          </div>
          <Button variant="primary" onClick={handleOpenCreate}>
            + Create First Department
          </Button>
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {(showAddModal || editingDept) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowAddModal(false)
            setEditingDept(null)
          }}
          title={editingDept ? `✏️ Edit Department: ${editingDept.name}` : '🏫 Add New Academic Department & Program'}
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="deptIcon">Icon</label>
                  <input
                    id="deptIcon"
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    style={{ textAlign: 'center', fontSize: '1.25rem' }}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="deptName">Department / Course Name *</label>
                  <input
                    id="deptName"
                    type="text"
                    placeholder="e.g. Professional Barista & Specialty Coffee Brewing"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="hodName">Head of Department / Lead Trainer *</label>
                  <input
                    id="hodName"
                    type="text"
                    placeholder="e.g. Chef Michael Omondi"
                    value={hodName}
                    onChange={(e) => setHodName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="feeAmount">Course Tuition Fee (KES) *</label>
                  <input
                    id="feeAmount"
                    type="number"
                    min="500"
                    placeholder="e.g. 9500"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="courseDuration">Course Duration *</label>
                  <input
                    id="courseDuration"
                    type="text"
                    placeholder="e.g. 4-6 Weeks / 8 Weeks / 12 Weeks"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="academicYear">Intake Category</label>
                  <input
                    id="academicYear"
                    type="text"
                    placeholder="e.g. 2026 Practical Intake"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="shifts">Timetable Shifts & Lab Hours *</label>
                <input
                  id="shifts"
                  type="text"
                  placeholder="e.g. Morning (8:30AM - 11:30AM) / Evening (5:30PM - 7:30PM)"
                  value={shifts}
                  onChange={(e) => setShifts(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="gradeLevel">Certification / Qualification Award *</label>
                <input
                  id="gradeLevel"
                  type="text"
                  placeholder="e.g. Master Barista Certificate / Short Course Competency"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingDept(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={saveMutation.isPending} style={{ fontWeight: 800 }}>
                {editingDept ? '💾 Update Department →' : '🚀 Save Department →'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deptToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeptToDelete(null)}
          onConfirm={() => deleteMutation.mutate(deptToDelete.id)}
          title="Delete Academic Department?"
          message={`Are you sure you want to delete "${deptToDelete.name}"? All associated short course configurations for this department will be removed.`}
          confirmLabel="Delete Department"
          loading={deleteMutation.isPending}
        />
      )}
    </PageWrapper>
  )
}
