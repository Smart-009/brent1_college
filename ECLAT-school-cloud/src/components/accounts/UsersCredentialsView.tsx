import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { UserAccount, UserRole } from '../../types/schoolErp'
import { SearchIcon, PrintIcon, PlusIcon, KeyIcon, CheckIcon, XIcon } from '../common/Icons'
import { PrintableLoginSlips } from './PrintableLoginSlips'

export const UsersCredentialsView: React.FC = () => {
  const { accounts, updateAccountStatus, resetAccountPin, createAccount } = useSchoolErp()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All')
  const [isPrintSlipsOpen, setIsPrintSlipsOpen] = useState(false)
  const [resetModalAccount, setResetModalAccount] = useState<UserAccount | null>(null)
  const [newPinInput, setNewPinInput] = useState('')
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false)

  // New account form state
  const [newUsername, setNewUsername] = useState('')
  const [newFullName, setNewFullName] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('student')
  const [newPin, setNewPin] = useState(`PIN-${Math.floor(1000 + Math.random() * 9000)}`)

  const filteredAccounts = accounts.filter((acc) => {
    const matchesRole = roleFilter === 'All' || acc.role === roleFilter
    const matchesSearch =
      acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesRole && matchesSearch
  })

  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetModalAccount || !newPinInput.trim()) return
    resetAccountPin(resetModalAccount.id, newPinInput.trim())
    setResetModalAccount(null)
    setNewPinInput('')
  }

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername || !newFullName) return
    createAccount({
      username: newUsername,
      fullName: newFullName,
      role: newRole,
      tempPin: newPin,
      status: 'Active',
    })
    setIsNewAccountModalOpen(false)
    setNewUsername('')
    setNewFullName('')
    setNewPin(`PIN-${Math.floor(1000 + Math.random() * 9000)}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            User Accounts & Login Credentials
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Issue student & guardian access passes, reset temporary PINs, and manage school system authorizations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsPrintSlipsOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <PrintIcon size={16} /> Batch Print Login Slips
          </button>
          <button
            onClick={() => setIsNewAccountModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <PlusIcon size={16} /> New User Account
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total System Users</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>{accounts.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>Full access registry</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Parent & Student Passes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '0.35rem' }}>
            {accounts.filter((a) => a.role === 'student').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Ready for print distribution</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Faculty & Staff Accounts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            {accounts.filter((a) => a.role !== 'student').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Teachers, Bursars & Admins</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Accounts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.35rem' }}>
            {accounts.filter((a) => a.status === 'Active').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Authorized to sign in</div>
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
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 300px' }}>
          <SearchIcon size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by name, username or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Filter Role:</span>
          {(['All', 'student', 'teacher', 'bursar', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: roleFilter === r ? '#2563eb' : '#cbd5e1',
                backgroundColor: roleFilter === r ? '#2563eb' : '#ffffff',
                color: roleFilter === r ? '#ffffff' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {r === 'student' ? 'Students & Guardians' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Account Holder</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Portal Username</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Temporary Access PIN</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Account Status</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Last Login</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((acc) => (
              <tr key={acc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{acc.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Created: {acc.createdAt}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                  {acc.username}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor:
                        acc.role === 'admin'
                          ? '#dbeafe'
                          : acc.role === 'bursar'
                          ? '#dcfce7'
                          : acc.role === 'teacher'
                          ? '#fef3c7'
                          : '#f3e8ff',
                      color:
                        acc.role === 'admin'
                          ? '#1e40af'
                          : acc.role === 'bursar'
                          ? '#166534'
                          : acc.role === 'teacher'
                          ? '#92400e'
                          : '#6b21a8',
                    }}
                  >
                    {acc.role}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      backgroundColor: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    {acc.tempPin}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: acc.status === 'Active' ? '#dcfce7' : acc.status === 'Suspended' ? '#fee2e2' : '#fef3c7',
                      color: acc.status === 'Active' ? '#15803d' : acc.status === 'Suspended' ? '#b91c1c' : '#b45309',
                    }}
                  >
                    {acc.status}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                  {acc.lastLogin}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setResetModalAccount(acc)
                        setNewPinInput(`PIN-${Math.floor(1000 + Math.random() * 9000)}`)
                      }}
                      title="Reset Access PIN"
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <KeyIcon size={14} /> Reset PIN
                    </button>
                    {acc.status === 'Active' ? (
                      <button
                        onClick={() => updateAccountStatus(acc.id, 'Suspended')}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '4px',
                          border: '1px solid #fca5a5',
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => updateAccountStatus(acc.id, 'Active')}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '4px',
                          border: '1px solid #86efac',
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reset PIN Modal */}
      {resetModalAccount && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Reset Temporary PIN</h3>
              <button
                onClick={() => setResetModalAccount(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <XIcon size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Assign a new temporary access PIN for <strong>{resetModalAccount.fullName}</strong> ({resetModalAccount.username}).
            </p>
            <form onSubmit={handleResetPinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  New Temporary PIN
                </label>
                <input
                  type="text"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setResetModalAccount(null)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Save & Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Account Modal */}
      {isNewAccountModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Create System Login Account</h3>
              <button
                onClick={() => setIsNewAccountModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <XIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Full Name / Beneficiary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grace Wanjiku Kamau"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Portal Username (Email or Admission No)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ADM-2026-009 or gwanjiku@school.ac.ke"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Access Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                >
                  <option value="student">Student & Guardian</option>
                  <option value="teacher">Faculty / Teacher</option>
                  <option value="bursar">Bursar / Finance Officer</option>
                  <option value="admin">Administrator / Principal</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Initial Temporary PIN
                </label>
                <input
                  type="text"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 700 }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewAccountModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Generate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Print Slips Modal */}
      {isPrintSlipsOpen && (
        <PrintableLoginSlips
          accounts={filteredAccounts.filter((a) => a.role === 'student')}
          onClose={() => setIsPrintSlipsOpen(false)}
        />
      )}
    </div>
  )
}
