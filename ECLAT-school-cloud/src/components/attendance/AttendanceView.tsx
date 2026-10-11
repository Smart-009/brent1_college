import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { AttendanceIcon, CheckIcon } from '../common/Icons'

export const AttendanceView: React.FC = () => {
  const { students, activeSchool, saveAttendance } = useSchoolErp()
  const [selectedClass, setSelectedClass] = useState('Grade 10')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [attendanceState, setAttendanceState] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>>({})
  const [isSaved, setIsSaved] = useState(false)

  const classStudents = students.filter((s) => s.className === selectedClass)

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }))
    setIsSaved(false)
  }

  const handleSaveRollCall = () => {
    const records = classStudents.map((std) => ({
      studentId: std.id,
      studentName: std.fullName,
      className: std.className,
      date,
      status: attendanceState[std.id] || 'Present',
    }))
    saveAttendance(records)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  // Summary counts
  const total = classStudents.length
  const presentCount = classStudents.filter((s) => (attendanceState[s.id] || 'Present') === 'Present').length
  const absentCount = classStudents.filter((s) => attendanceState[s.id] === 'Absent').length
  const lateCount = classStudents.filter((s) => attendanceState[s.id] === 'Late').length
  const presentPercent = total > 0 ? Math.round((presentCount / total) * 100) : 100

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
            Daily Attendance Register & Roll Call
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            {activeSchool.name} • Morning & afternoon attendance roll call per stream
          </p>
        </div>

        <button
          onClick={handleSaveRollCall}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: isSaved ? '#059669' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.65rem 1.25rem',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
            transition: 'background-color 0.2s',
          }}
        >
          <CheckIcon size={16} />
          <span>{isSaved ? 'Attendance Saved Successfully!' : 'Submit Class Roll Call'}</span>
        </button>
      </div>

      {/* Date & Class Controls */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '0.85rem',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
              }}
            >
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Year 9">Year 9</option>
              <option value="Year 10">Year 10</option>
              <option value="Year 11">Year 11</option>
            </select>
          </div>
        </div>

        {/* Live Attendance Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem' }}>
          <span style={{ color: '#059669', fontWeight: 700 }}>Present: {presentCount}</span>
          <span style={{ color: '#e11d48', fontWeight: 700 }}>Absent: {absentCount}</span>
          <span style={{ color: '#d97706', fontWeight: 700 }}>Late: {lateCount}</span>
          <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
            Attendance Rate: {presentPercent}%
          </span>
        </div>
      </div>

      {/* Roster Table with Fast Toggles */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Adm No</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Student Name</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Class & Stream</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Present</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Late</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Absent</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Excused</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((std) => {
                const currentStatus = attendanceState[std.id] || 'Present'
                return (
                  <tr key={std.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#2563eb' }}>
                      {std.admissionNo}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#0f172a' }}>
                      {std.fullName}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>
                      {std.className} {std.stream}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                      <input
                        type="radio"
                        name={`att-${std.id}`}
                        checked={currentStatus === 'Present'}
                        onChange={() => handleStatusChange(std.id, 'Present')}
                        style={{ cursor: 'pointer', accentColor: '#16a34a' }}
                      />
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                      <input
                        type="radio"
                        name={`att-${std.id}`}
                        checked={currentStatus === 'Late'}
                        onChange={() => handleStatusChange(std.id, 'Late')}
                        style={{ cursor: 'pointer', accentColor: '#d97706' }}
                      />
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                      <input
                        type="radio"
                        name={`att-${std.id}`}
                        checked={currentStatus === 'Absent'}
                        onChange={() => handleStatusChange(std.id, 'Absent')}
                        style={{ cursor: 'pointer', accentColor: '#dc2626' }}
                      />
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                      <input
                        type="radio"
                        name={`att-${std.id}`}
                        checked={currentStatus === 'Excused'}
                        onChange={() => handleStatusChange(std.id, 'Excused')}
                        style={{ cursor: 'pointer', accentColor: '#4f46e5' }}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
