import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { PlusIcon, SearchIcon, UserIcon } from '../common/Icons'

interface StaffViewProps {
  onOpenNewStaffModal: () => void
}

export const StaffView: React.FC<StaffViewProps> = ({ onOpenNewStaffModal }) => {
  const { staff, activeSchool, currentUser } = useSchoolErp()
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')

  const filteredStaff = staff.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter
    return matchesSearch && matchesDept
  })

  const departments = ['All', ...Array.from(new Set(staff.map((s) => s.department)))]

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
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
            Academic & Administrative Staff Roster
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            {staff.length} staff members on institutional payroll at {activeSchool.name}
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={onOpenNewStaffModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
            }}
          >
            <PlusIcon size={16} />
            <span>Onboard New Employee</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '260px' }}>
          <SearchIcon size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by staff name, designation, or employee number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.88rem',
              color: '#0f172a',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '0.85rem',
              color: '#0f172a',
              outline: 'none',
            }}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table */}
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
                <th style={{ padding: '0.85rem 1.25rem' }}>Emp No</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Employee Name</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Designation & Role</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Basic Salary</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Gross Pay</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((emp) => {
                const gross = emp.basicSalary + emp.allowances
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#2563eb' }}>
                      {emp.employeeNo}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{emp.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {emp.email} • {emp.phone}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{emp.designation}</div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color:
                            emp.role === 'admin'
                              ? '#2563eb'
                              : emp.role === 'bursar'
                              ? '#059669'
                              : '#d97706',
                        }}
                      >
                        Role: {emp.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>{emp.department}</td>
                    <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>
                      {activeSchool.currency} {emp.basicSalary.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>
                      {activeSchool.currency} {gross.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <span
                        style={{
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {emp.status}
                      </span>
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
