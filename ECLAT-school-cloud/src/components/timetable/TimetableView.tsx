import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { TimetableIcon } from '../common/Icons'

export const TimetableView: React.FC = () => {
  const { timetable, activeSchool } = useSchoolErp()
  const [selectedClass, setSelectedClass] = useState('Grade 10')

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]

  const periods = [
    '08:00 - 08:45 AM',
    '08:45 - 09:30 AM',
    '09:45 - 10:30 AM',
    '10:45 - 11:30 AM',
    '11:30 - 12:15 PM',
    '02:00 - 02:45 PM',
  ]

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
            Academic Class Timetable & Schedules
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            {activeSchool.name} • Weekly teaching schedule and laboratory venues
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Select Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
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
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left', width: '140px' }}>Period / Time</th>
                {days.map((day) => (
                  <th key={day} style={{ padding: '0.85rem 1rem' }}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, pIdx) => (
                <tr key={period} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#f8fafc' }}>
                    {period}
                  </td>
                  {days.map((day) => {
                    const match = timetable.find(
                      (t) => t.className === selectedClass && t.day === day && t.time === period
                    )
                    return (
                      <td key={day} style={{ padding: '0.75rem 0.85rem', textAlign: 'center', verticalAlign: 'top' }}>
                        {match ? (
                          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.5rem' }}>
                            <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.85rem' }}>
                              {match.subject}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                              {match.teacherName}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                              📍 {match.room}
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: '#cbd5e1', fontSize: '0.75rem', padding: '0.5rem' }}>
                            {pIdx === 2 ? '☕ Morning Break' : 'Study Hall'}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
