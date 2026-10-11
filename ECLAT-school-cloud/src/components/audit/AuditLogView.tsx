import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { AuditLog } from '../../types/schoolErp'
import { ActivityIcon, SearchIcon, FilterIcon } from '../common/Icons'

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useSchoolErp()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')

  const filteredLogs = auditLogs.filter((log) => {
    const matchesCategory = categoryFilter === 'All' || log.actionCategory === categoryFilter
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm)
    return matchesCategory && matchesSearch
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Security Audit Trail & Activity Ledger
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Immutable forensic audit log recording fee collections, marks entry, pupil admissions, credential resets, and administrative events.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Audit Events</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>{auditLogs.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>100% forensic tracking</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Financial Transactions</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
            {auditLogs.filter((l) => l.actionCategory === 'Finance').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Payments & vouchers</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Security & Auth Actions</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '0.35rem' }}>
            {auditLogs.filter((l) => l.actionCategory === 'Security').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>PIN resets & logins</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Academic & Student Events</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
            {auditLogs.filter((l) => l.actionCategory === 'Academics' || l.actionCategory === 'Students').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Grades & admissions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 300px' }}>
          <SearchIcon size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by actor name, action description or IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Category:</span>
          {(['All', 'Finance', 'Students', 'Academics', 'Security', 'System'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: categoryFilter === cat ? '#2563eb' : '#cbd5e1',
                backgroundColor: categoryFilter === cat ? '#2563eb' : '#ffffff',
                color: categoryFilter === cat ? '#ffffff' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Actor & Role</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Event Description</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Device IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {log.timestamp}
                </td>
                <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.actorName}</div>
                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor:
                        log.actorRole === 'admin'
                          ? '#dbeafe'
                          : log.actorRole === 'bursar'
                          ? '#dcfce7'
                          : log.actorRole === 'teacher'
                          ? '#fef3c7'
                          : '#f3e8ff',
                      color:
                        log.actorRole === 'admin'
                          ? '#1e40af'
                          : log.actorRole === 'bursar'
                          ? '#166534'
                          : log.actorRole === 'teacher'
                          ? '#92400e'
                          : '#6b21a8',
                    }}
                  >
                    {log.actorRole}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor:
                        log.actionCategory === 'Finance'
                          ? '#dcfce7'
                          : log.actionCategory === 'Security'
                          ? '#fee2e2'
                          : log.actionCategory === 'Students'
                          ? '#dbeafe'
                          : log.actionCategory === 'Academics'
                          ? '#fef3c7'
                          : '#f1f5f9',
                      color:
                        log.actionCategory === 'Finance'
                          ? '#15803d'
                          : log.actionCategory === 'Security'
                          ? '#b91c1c'
                          : log.actionCategory === 'Students'
                          ? '#1e40af'
                          : log.actionCategory === 'Academics'
                          ? '#b45309'
                          : '#475569',
                    }}
                  >
                    {log.actionCategory}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#1e293b', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  {log.description}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
