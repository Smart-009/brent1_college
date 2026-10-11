import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { CheckIcon } from '../common/Icons'

export const SmsBroadcastView: React.FC = () => {
  const { smsBroadcasts, sendSmsBroadcast, students, staff, activeSchool } = useSchoolErp()
  const [recipientType, setRecipientType] = useState<any>('All Guardians')
  const [message, setMessage] = useState(
    'Dear Parent, kindly note that termly fee balances must be cleared by Friday to facilitate printing of continuous assessment cards. Bursar Desk.'
  )
  const [isSent, setIsSent] = useState(false)

  const defaultersCount = students.filter((s) => s.feeBalance > 0).length
  const totalGuardians = students.length

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message) return

    sendSmsBroadcast(recipientType, message)
    setIsSent(true)
    setTimeout(() => setIsSent(false), 3000)
  }

  const charCount = message.length
  const smsPages = Math.ceil(charCount / 160) || 1

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
          Bulk SMS & Guardian Communicator
        </h1>
        <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
          Direct mobile SMS broadcasts to guardians, teachers, and fee-defaulter groups with instant delivery
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Composer Form */}
        <form
          onSubmit={handleSend}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#0f172a' }}>
            Compose Bulk SMS Broadcast
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Target Audience
            </label>
            <select
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="All Guardians">All Registered Guardians ({totalGuardians} contacts)</option>
              <option value="Fee Defaulters">Parents with Fee Balances Only ({defaultersCount} contacts)</option>
              <option value="Teaching Staff">Academic Teaching Staff ({staff.filter(s => s.role === 'teacher').length} contacts)</option>
            </select>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              SMS Message Body
            </label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.75rem', color: '#64748b' }}>
            <span>
              {charCount} characters • <strong>{smsPages} SMS Page(s)</strong>
            </span>
            <span>Sender ID: <strong>{activeSchool.name.substring(0, 11).toUpperCase()}</strong></span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() =>
                setMessage(
                  'Dear Parent, reminder to clear outstanding fee balances via Paybill 400200 Acc: [ADM-NO]. Stamped receipts are available online. Bursar.'
                )
              }
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.72rem',
                cursor: 'pointer',
              }}
            >
              Preset: Fee Reminder
            </button>
            <button
              type="button"
              onClick={() =>
                setMessage(
                  'Dear Parent, school closes for mid-term break on Friday 27 Feb at 12:30 PM. Academic Clinic consultations follow. Principal.'
                )
              }
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.72rem',
                cursor: 'pointer',
              }}
            >
              Preset: Mid-Term Break
            </button>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
            {isSent && (
              <span style={{ color: '#059669', fontSize: '0.82rem', fontWeight: 600 }}>
                ✓ SMS broadcast dispatched to all recipients!
              </span>
            )}
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
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
              <span>Broadcast SMS via Cloud Gateway</span>
            </button>
          </div>
        </form>

        {/* Live Phone Preview */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>
            📱 Guardian Mobile Preview
          </div>

          {/* Smartphone mockup */}
          <div
            style={{
              width: '260px',
              backgroundColor: '#0f172a',
              borderRadius: '24px',
              padding: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '2px solid #334155',
            }}
          >
            <div style={{ backgroundColor: '#f1f5f9', borderRadius: '18px', padding: '12px', minHeight: '260px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a' }}>{activeSchool.name.substring(0, 15)}</span>
              </div>
              <div
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  borderBottomLeftRadius: '2px',
                  fontSize: '0.72rem',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  marginTop: 'auto',
                }}
              >
                {message || 'Type your message...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
          Broadcast Dispatch Logs
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
              <th style={{ padding: '0.75rem 1rem' }}>Target Audience</th>
              <th style={{ padding: '0.75rem 1rem' }}>Message Excerpt</th>
              <th style={{ padding: '0.75rem 1rem' }}>Recipients</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {smsBroadcasts.map((sms) => (
              <tr key={sms.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{sms.timestamp}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{sms.recipientType}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#334155', maxWidth: '350px' }}>{sms.message}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#2563eb' }}>{sms.recipientCount} SMS</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                  <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                    ✓ {sms.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
