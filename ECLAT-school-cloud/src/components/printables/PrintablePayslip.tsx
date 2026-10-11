import React from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { XIcon, PrintIcon } from '../common/Icons'

interface PrintablePayslipProps {
  staffId: string
  onClose: () => void
}

export const PrintablePayslip: React.FC<PrintablePayslipProps> = ({ staffId, onClose }) => {
  const { payroll, activeSchool, staff } = useSchoolErp()

  const payslip = payroll.find((p) => p.staffId === staffId) || payroll[0]
  const employee = staff.find((s) => s.id === staffId)

  const handlePrint = () => {
    window.print()
  }

  if (!payslip) return null

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
        zIndex: 150,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          className="no-print"
          style={{
            padding: '0.85rem 1.5rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 600 }}>
            <PrintIcon size={18} color="#a855f7" />
            <span>Staff Salary Payslip Preview</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <PrintIcon size={16} />
              <span>Print Payslip</span>
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 0.65rem',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <XIcon size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: '2.5rem', fontFamily: 'sans-serif', color: '#0f172a' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
              {activeSchool.name}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              Payroll & Remittances Directorate • Confidential Salary Advice
            </div>
            <div style={{ marginTop: '0.5rem', display: 'inline-block', border: '1px solid #0f172a', padding: '3px 14px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
              Salary Slip: {payslip.month} {payslip.year}
            </div>
          </div>

          {/* Employee Info */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Employee Name:</span>
                <div style={{ fontWeight: 800 }}>{payslip.staffName}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Employee Number:</span>
                <div style={{ fontWeight: 800, color: '#2563eb' }}>{payslip.employeeNo}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Designation:</span>
                <div style={{ fontWeight: 600 }}>{payslip.designation}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Disbursement Date:</span>
                <div style={{ fontWeight: 600 }}>{payslip.paymentDate || '28th of the month'}</div>
              </div>
            </div>
          </div>

          {/* Earnings vs Deductions Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Earnings */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '0.6rem 0.85rem', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                Earnings
              </div>
              <div style={{ padding: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Basic Pay</span>
                  <strong>{activeSchool.currency} {payslip.basicSalary.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Allowances</span>
                  <strong>{activeSchool.currency} {payslip.allowances.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 4px', borderTop: '1px solid #e2e8f0', fontWeight: 800 }}>
                  <span>Gross Earnings</span>
                  <span>{activeSchool.currency} {payslip.grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Statutory Deductions */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '0.6rem 0.85rem', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                Statutory Deductions
              </div>
              <div style={{ padding: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>PAYE Income Tax</span>
                  <strong style={{ color: '#e11d48' }}>{activeSchool.currency} {payslip.paye.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>NHIF / SHIF Health</span>
                  <strong>{activeSchool.currency} {payslip.nhif.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>NSSF Pension (I & II)</span>
                  <strong>{activeSchool.currency} {payslip.nssf.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Housing Levy (1.5%)</span>
                  <strong>{activeSchool.currency} {payslip.housingLevy.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 4px', borderTop: '1px solid #e2e8f0', fontWeight: 800 }}>
                  <span>Total Deductions</span>
                  <span style={{ color: '#e11d48' }}>{activeSchool.currency} {payslip.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Take-Home Pay Box */}
          <div
            style={{
              border: '2px solid #2563eb',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
              Net Take-Home Salary
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e3a8a', marginTop: '4px' }}>
              {activeSchool.currency} {payslip.netSalary.toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
            <div>Finance Officer: <strong>Madam Catherine Achieng</strong></div>
            <div>Approved: <strong>Dr. James Kamau (Principal)</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}
