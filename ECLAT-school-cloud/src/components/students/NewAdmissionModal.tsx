import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { XIcon, CheckIcon } from '../common/Icons'

interface NewAdmissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (studentId: string) => void
}

export const NewAdmissionModal: React.FC<NewAdmissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { admitStudent, activeSchool } = useSchoolErp()

  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female'>('Male')
  const [dateOfBirth, setDateOfBirth] = useState('2010-05-15')
  const [className, setClassName] = useState('Grade 10')
  const [stream, setStream] = useState('East')
  const [guardianName, setGuardianName] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')
  const [initialFeeBilled, setInitialFeeBilled] = useState('45000')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !guardianName || !guardianPhone) {
      alert('Please fill in student full name, guardian name, and guardian phone number.')
      return
    }

    const created = admitStudent({
      fullName,
      gender,
      dateOfBirth,
      className,
      stream,
      guardianName,
      guardianPhone,
      guardianEmail: guardianEmail || `${fullName.toLowerCase().replace(/\s+/g, '.')}@guardian.com`,
      initialFeeBilled: Number(initialFeeBilled) || 45000,
      status: 'Active',
      enrollmentDate: new Date().toISOString().split('T')[0],
    })

    onSuccess(created.id)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem' }}>
              Student Admission & Registration
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              {activeSchool.name} • Sequential Admission Number will be assigned automatically
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '6px',
              padding: '0.4rem',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Full Name */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Full Student Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Victor Mutinda Kioko"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Gender */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Class */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Admitted Class / Grade
              </label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="Grade 9">Grade 9 (Junior Secondary)</option>
                <option value="Grade 10">Grade 10 (Senior Secondary)</option>
                <option value="Grade 11">Grade 11 (Senior Secondary)</option>
                <option value="Year 9">Year 9 (British Curriculum)</option>
                <option value="Year 10">Year 10 (IGCSE)</option>
                <option value="Year 11">Year 11 (IGCSE Final)</option>
              </select>
            </div>

            {/* Stream */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Class Stream
              </label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="East">East Stream</option>
                <option value="West">West Stream</option>
                <option value="North">North Stream</option>
                <option value="South">South Stream</option>
                <option value="Science A">Science A</option>
                <option value="Arts B">Arts B</option>
              </select>
            </div>

            {/* Guardian Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Margaret Kioko"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Guardian Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Guardian Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. +254 712 345 678"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Guardian Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Guardian Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. parent@gmail.com"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Initial Fee Structure */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Term Tuition Invoiced ({activeSchool.currency})
              </label>
              <input
                type="number"
                value={initialFeeBilled}
                onChange={(e) => setInitialFeeBilled(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.6rem 1.15rem',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.6rem 1.25rem',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
              }}
            >
              <CheckIcon size={16} />
              <span>Confirm Admission & Register</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
