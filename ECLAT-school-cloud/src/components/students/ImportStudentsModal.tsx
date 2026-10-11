import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { XIcon, CheckIcon } from '../common/Icons'

interface ImportStudentsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (count: number) => void
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { bulkImportStudents } = useSchoolErp()
  const [csvText, setCsvText] = useState(
    `Full Name,Gender,Class,Stream,Guardian Name,Guardian Phone,Fee Billed
Erick Omondi,Male,Grade 10,East,John Omondi,+254712000111,45000
Brenda Chebet,Female,Grade 10,West,Nancy Chebet,+254722111222,45000
Samuel Wanjala,Male,Grade 11,North,Paul Wanjala,+254733222333,52000
Miriam Atieno,Female,Grade 9,South,Grace Atieno,+254714333444,42000`
  )

  if (!isOpen) return null

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault()
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      alert('CSV must contain a header and at least one student row.')
      return
    }

    const importedStudents: Array<{
      fullName: string
      gender: 'Male' | 'Female'
      className: string
      stream: string
      guardianName: string
      guardianPhone: string
      feeBilled?: number
    }> = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''))
      if (parts.length >= 6) {
        importedStudents.push({
          fullName: parts[0],
          gender: parts[1].toLowerCase().startsWith('f') ? 'Female' : 'Male',
          className: parts[2] || 'Grade 10',
          stream: parts[3] || 'East',
          guardianName: parts[4],
          guardianPhone: parts[5],
          feeBilled: parts[6] ? Number(parts[6]) : 45000,
        })
      }
    }

    if (importedStudents.length === 0) {
      alert('Could not parse any valid student records. Please check the CSV format.')
      return
    }

    const count = bulkImportStudents(importedStudents)
    onSuccess(count)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 140,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '640px',
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
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Import Students from CSV / Excel Roster
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Migrate existing student cohorts in bulk. Admission numbers will be assigned sequentially.
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleImport} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              CSV Content (Paste columns: Full Name, Gender, Class, Stream, Guardian Name, Guardian Phone, Fee Billed)
            </label>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setCsvText(
                  `Full Name,Gender,Class,Stream,Guardian Name,Guardian Phone,Fee Billed
Collins Kiprotich,Male,Grade 10,East,James Kiprotich,+254711998877,45000
Sharon Akinyi,Female,Grade 10,West,Mary Akinyi,+254722887766,45000`
                )
              }}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Reset Sample Template
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <CheckIcon size={16} />
                <span>Import Students</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
