import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { XIcon, CheckIcon } from '../common/Icons'

interface GradeEntryModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GradeEntryModal: React.FC<GradeEntryModalProps> = ({ isOpen, onClose }) => {
  const { students, recordExamMark, activeSchool } = useSchoolErp()

  const [studentId, setStudentId] = useState(students[0]?.id || '')
  const [subject, setSubject] = useState('Mathematics')
  const [opener, setOpener] = useState('25')
  const [midterm, setMidterm] = useState('26')
  const [endterm, setEndterm] = useState('36')
  const [teacherRemarks, setTeacherRemarks] = useState('Good grasp of key principles and consistent improvement.')

  if (!isOpen) return null

  const selectedStudent = students.find((s) => s.id === studentId) || students[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) {
      alert('Please select a student.')
      return
    }

    const op = Math.min(30, Math.max(0, Number(opener) || 0))
    const mid = Math.min(30, Math.max(0, Number(midterm) || 0))
    const end = Math.min(40, Math.max(0, Number(endterm) || 0))

    recordExamMark({
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      admissionNo: selectedStudent.admissionNo,
      className: selectedStudent.className,
      subject,
      opener: op,
      midterm: mid,
      endterm: end,
      teacherRemarks: teacherRemarks || 'Satisfactory effort.',
    })

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
          maxWidth: '560px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e2e8f0',
        }}
      >
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
              Enter Continuous Assessment Marks
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              {activeSchool.name} • Opener (30) + Midterm (30) + Endterm (40) = 100%
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

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Select Student *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            >
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.admissionNo} — {std.fullName} ({std.className} {std.stream})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="Mathematics">Mathematics</option>
              <option value="English Language">English Language</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Computer Studies">Computer Studies</option>
              <option value="Geography">Geography</option>
              <option value="History">History</option>
              <option value="Business Studies">Business Studies</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Opener (Max 30)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={opener}
                onChange={(e) => setOpener(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Midterm (Max 30)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={midterm}
                onChange={(e) => setMidterm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Endterm (Max 40)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={endterm}
                onChange={(e) => setEndterm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Subject Teacher Qualitative Remarks
            </label>
            <input
              type="text"
              value={teacherRemarks}
              onChange={(e) => setTeacherRemarks(e.target.value)}
              placeholder="e.g. Demonstrates exceptional problem-solving acumen."
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
              }}
            >
              <CheckIcon size={16} />
              <span>Save & Calculate Grade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
