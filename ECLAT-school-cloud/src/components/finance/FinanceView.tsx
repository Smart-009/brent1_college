import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { FinanceIcon, PlusIcon, SearchIcon, PrintIcon } from '../common/Icons'

interface FinanceViewProps {
  onOpenFeeModal: () => void
  onViewReceipt: (paymentId: string) => void
  onViewFeeStatement: (studentId: string) => void
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  onOpenFeeModal,
  onViewReceipt,
  onViewFeeStatement,
}) => {
  const { payments, students, activeSchool, currentUser, feeStructures, exportPaymentsCsv } = useSchoolErp()
  const [activeTab, setActiveTab] = useState<'payments' | 'structures'>('payments')
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('All')

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0)
  const totalBilled = students.reduce((acc, s) => acc + s.totalFeeBilled, 0)
  const totalBalance = students.reduce((acc, s) => acc + s.feeBalance, 0)
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter
    return matchesSearch && matchesMethod
  })

  const isBursarOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'bursar'

  const handleExportCsv = () => {
    const csv = exportPaymentsCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${activeSchool.name.replace(/\s+/g, '_')}_Fee_Ledger.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
            Bursary & Fee Collection Ledger
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Real-time fee tracking, M-Pesa / Bank reconciliation, and official receipt issuance
          </p>
        </div>

        {isBursarOrAdmin && (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={handleExportCsv}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Export CSV Ledger
            </button>
            <button
              onClick={onOpenFeeModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5,150,105,0.25)',
              }}
            >
              <PlusIcon size={16} />
              <span>Record Fee Payment</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('payments')}
          style={{
            backgroundColor: activeTab === 'payments' ? '#059669' : '#ffffff',
            color: activeTab === 'payments' ? '#ffffff' : '#64748b',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Payment Transactions Ledger
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          style={{
            backgroundColor: activeTab === 'structures' ? '#059669' : '#ffffff',
            color: activeTab === 'structures' ? '#ffffff' : '#64748b',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Fee Schedules & Structures by Class
        </button>
      </div>

      {activeTab === 'structures' ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#0f172a' }}>
            Official Fee Schedules ({activeSchool.currentTerm} {activeSchool.academicYear})
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Class / Grade</th>
                <th style={{ padding: '0.75rem 1rem' }}>Term</th>
                <th style={{ padding: '0.75rem 1rem' }}>Tuition Fee</th>
                <th style={{ padding: '0.75rem 1rem' }}>Boarding & Meals</th>
                <th style={{ padding: '0.75rem 1rem' }}>Activity & Sports</th>
                <th style={{ padding: '0.75rem 1rem' }}>Lab & Exams</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Invoiced</th>
              </tr>
            </thead>
            <tbody>
              {feeStructures.map((fs) => (
                <tr key={fs.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>{fs.className}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{fs.term}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{activeSchool.currency} {fs.tuitionFee.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{activeSchool.currency} {fs.boardingFee.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{activeSchool.currency} {fs.activityFee.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{activeSchool.currency} {fs.labExamFee.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                    {activeSchool.currency} {fs.totalTermFee.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* Financial Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Invoiced
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {activeSchool.currency} {totalBilled.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Current academic session</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Collected
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {activeSchool.currency} {totalCollected.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                {collectionRate}% Collection Rate
              </span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Pending Balance
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e11d48', marginTop: '4px' }}>
                {activeSchool.currency} {totalBalance.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#e11d48' }}>Outstanding student balances</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Verified Receipts
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                {payments.length}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Stamped receipts generated</span>
            </div>
          </div>

          {/* Filter and Search Bar */}
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
                placeholder="Search by receipt number, student name, or M-Pesa reference..."
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
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Payment Mode:</span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
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
                <option value="All">All Methods</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Bank Wire">Bank Wire</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
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
                    <th style={{ padding: '0.85rem 1.25rem' }}>Receipt No</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Date</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Student Name</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Class</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Method & Ref</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Amount Paid</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#2563eb' }}>
                        {p.receiptNo}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{p.date}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.studentName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.admissionNo}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>{p.className}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span
                          style={{
                            backgroundColor: p.paymentMethod === 'M-Pesa' ? '#dcfce7' : '#eff6ff',
                            color: p.paymentMethod === 'M-Pesa' ? '#15803d' : '#1d4ed8',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {p.paymentMethod}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          Ref: {p.reference}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                        {activeSchool.currency} {p.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => onViewReceipt(p.id)}
                            style={{
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              cursor: 'pointer',
                            }}
                          >
                            Receipt
                          </button>
                          <button
                            onClick={() => onViewFeeStatement(p.studentId)}
                            style={{
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: '#1d4ed8',
                              cursor: 'pointer',
                            }}
                          >
                            Statement
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
