import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { PrintIcon, FinanceIcon, CheckIcon } from '../common/Icons'

interface PayrollViewProps {
  onViewPayslip: (staffId: string) => void
}

export const PayrollView: React.FC<PayrollViewProps> = ({ onViewPayslip }) => {
  const { payroll, activeSchool, processPayrollForMonth, staff } = useSchoolErp()
  const [selectedMonth, setSelectedMonth] = useState('January')
  const [selectedYear, setSelectedYear] = useState(2026)
  const [isProcessing, setIsProcessing] = useState(false)

  const totalGross = payroll.reduce((acc, p) => acc + p.grossSalary, 0)
  const totalPaye = payroll.reduce((acc, p) => acc + p.paye, 0)
  const totalNhif = payroll.reduce((acc, p) => acc + p.nhif, 0)
  const totalNssf = payroll.reduce((acc, p) => acc + p.nssf, 0)
  const totalHousingLevy = payroll.reduce((acc, p) => acc + p.housingLevy, 0)
  const totalDeductions = totalPaye + totalNhif + totalNssf + totalHousingLevy
  const totalNet = totalGross - totalDeductions

  const handleProcessPayroll = () => {
    setIsProcessing(true)
    setTimeout(() => {
      processPayrollForMonth(selectedMonth, selectedYear)
      setIsProcessing(false)
      alert(`Payroll successfully computed for ${selectedMonth} ${selectedYear}!`)
    }, 400)
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
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
            Staff Payroll & Statutory Remittances Engine
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Automated calculations for Gross, PAYE, NHIF/SHIF, NSSF Tier I & II, Housing Levy, and Net Salary
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#0f172a',
              outline: 'none',
            }}
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
              <option key={m} value={m}>
                {m} {selectedYear}
              </option>
            ))}
          </select>

          <button
            onClick={handleProcessPayroll}
            disabled={isProcessing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.55rem 1.15rem',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
            }}
          >
            <CheckIcon size={16} />
            <span>{isProcessing ? 'Calculating…' : `Re-Compute ${selectedMonth} Payroll`}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Gross Pay
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {activeSchool.currency} {totalGross.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{staff.length} staff members</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total PAYE Tax
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#e11d48', marginTop: '4px' }}>
            {activeSchool.currency} {totalPaye.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Statutory income tax</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            NHIF / SHIF & NSSF
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
            {activeSchool.currency} {(totalNhif + totalNssf).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Health & Pension statutory</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Housing Levy (1.5%)
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
            {activeSchool.currency} {totalHousingLevy.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Affordable housing levy</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Net Disbursed
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {activeSchool.currency} {totalNet.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Net salary payout</span>
        </div>
      </div>

      {/* Payroll Table */}
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
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.85rem 1rem' }}>Designation</th>
                <th style={{ padding: '0.85rem 1rem' }}>Basic Pay</th>
                <th style={{ padding: '0.85rem 1rem' }}>Gross Pay</th>
                <th style={{ padding: '0.85rem 1rem' }}>PAYE</th>
                <th style={{ padding: '0.85rem 1rem' }}>NHIF</th>
                <th style={{ padding: '0.85rem 1rem' }}>NSSF</th>
                <th style={{ padding: '0.85rem 1rem' }}>Housing Levy</th>
                <th style={{ padding: '0.85rem 1rem' }}>Net Pay</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Official Payslip</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((rec) => (
                <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{rec.staffName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{rec.employeeNo}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{rec.designation}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                    {activeSchool.currency} {rec.basicSalary.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                    {activeSchool.currency} {rec.grossSalary.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#e11d48' }}>
                    {activeSchool.currency} {rec.paye.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                    {activeSchool.currency} {rec.nhif.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                    {activeSchool.currency} {rec.nssf.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#7c3aed' }}>
                    {activeSchool.currency} {rec.housingLevy.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#059669', fontSize: '0.92rem' }}>
                    {activeSchool.currency} {rec.netSalary.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => onViewPayslip(rec.staffId)}
                      style={{
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <PrintIcon size={14} />
                      <span>Print Payslip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
