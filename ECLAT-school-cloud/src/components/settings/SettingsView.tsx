import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { SettingsIcon, CheckIcon } from '../common/Icons'

export const SettingsView: React.FC = () => {
  const { activeSchool, setActiveSchool } = useSchoolErp()

  const [name, setName] = useState(activeSchool.name)
  const [motto, setMotto] = useState(activeSchool.motto)
  const [academicYear, setAcademicYear] = useState(activeSchool.academicYear)
  const [currentTerm, setCurrentTerm] = useState(activeSchool.currentTerm)
  const [curriculum, setCurriculum] = useState(activeSchool.curriculum)
  const [phone, setPhone] = useState(activeSchool.phone)
  const [email, setEmail] = useState(activeSchool.email)
  const [address, setAddress] = useState(activeSchool.address)
  const [currency, setCurrency] = useState(activeSchool.currency)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveSchool({
      ...activeSchool,
      name,
      motto,
      academicYear,
      currentTerm,
      curriculum,
      phone,
      email,
      address,
      currency,
    })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
          Institution Configuration & ERP Settings
        </h1>
        <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
          Manage your school's official identity, term calendar, and statutory currency
        </p>
      </div>

      <form
        onSubmit={handleSave}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Official School Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              School Motto
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Current Academic Term / Session
            </label>
            <input
              type="text"
              value={currentTerm}
              onChange={(e) => setCurrentTerm(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Primary Curriculum
            </label>
            <select
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value as any)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#ffffff' }}
            >
              <option value="CBC / 8-4-4">CBC / 8-4-4 (Kenya)</option>
              <option value="British IGCSE">British IGCSE (Cambridge & Edexcel)</option>
              <option value="American / AP">American / AP</option>
              <option value="International Baccalaureate">International Baccalaureate (IB)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#ffffff' }}
            >
              <option value="KES">Kenyan Shillings (KES)</option>
              <option value="USD">US Dollars ($ USD)</option>
              <option value="GBP">British Pounds (£ GBP)</option>
              <option value="UGX">Ugandan Shillings (UGX)</option>
              <option value="TZS">Tanzanian Shillings (TZS)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Contact Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Official Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Physical & Postal Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
          {isSaved && (
            <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
              ✓ Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.65rem 1.4rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
            }}
          >
            <CheckIcon size={16} />
            <span>Save School Configuration</span>
          </button>
        </div>
      </form>
    </div>
  )
}
