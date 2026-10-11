import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { PlusIcon, FinanceIcon, CheckIcon } from '../common/Icons'

export const ExpensesView: React.FC = () => {
  const { expenses, recordExpense, activeSchool, payments } = useSchoolErp()
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState<any>('Utilities & Water')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Bank' | 'Cash'>('M-Pesa')
  const [approvedBy, setApprovedBy] = useState('Dr. James Kamau')

  const totalFeeIncome = payments.reduce((acc, p) => acc + p.amount, 0)
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0)
  const netSurplus = totalFeeIncome - totalExpenses

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || Number(amount) <= 0) return

    recordExpense({
      category,
      description,
      amount: Number(amount),
      approvedBy,
      paymentMethod,
    })

    setDescription('')
    setAmount('')
    setShowForm(false)
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
            School Operational Expenses & Payment Vouchers
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Track campus utility bills, laboratory consumables, catering, and repairs
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
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
          <span>Record Expense Voucher</span>
        </button>
      </div>

      {/* Financial P&L Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Tuition Inflows</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {activeSchool.currency} {totalFeeIncome.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Verified student collections</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Operational Outflows</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#e11d48', marginTop: '4px' }}>
            {activeSchool.currency} {totalExpenses.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{expenses.length} approved payment vouchers</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Net Operating Surplus</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: netSurplus >= 0 ? '#2563eb' : '#e11d48', marginTop: '4px' }}>
            {activeSchool.currency} {netSurplus.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: netSurplus >= 0 ? '#2563eb' : '#e11d48' }}>Current financial health</span>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#0f172a' }}>Record Expense Payment Voucher</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
              >
                <option value="Utilities & Water">Utilities & Water</option>
                <option value="Stationery & Books">Stationery & Books</option>
                <option value="Food & Catering">Food & Catering</option>
                <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                <option value="Transport & Fuel">Transport & Fuel</option>
                <option value="Staff Welfare">Staff Welfare</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Amount ({activeSchool.currency})</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 18500"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
              >
                <option value="M-Pesa">M-Pesa</option>
                <option value="Bank">Bank Wire</option>
                <option value="Cash">Petty Cash</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Approved By</label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Description & Purpose</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Purchase of 20 reams of A4 exam printing paper"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#059669', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Confirm Voucher
            </button>
          </div>
        </form>
      )}

      {/* Expenses Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Voucher No</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Date</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Category</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Description</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Mode</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Amount</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Authorized By</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#e11d48' }}>{exp.voucherNo}</td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{exp.date}</td>
                <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>{exp.category}</td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#334155' }}>{exp.description}</td>
                <td style={{ padding: '0.85rem 1.25rem' }}>
                  <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                    {exp.paymentMethod}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1.25rem', fontWeight: 800, color: '#e11d48' }}>
                  {activeSchool.currency} {exp.amount.toLocaleString()}
                </td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{exp.approvedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
