import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { PlusIcon, NoticeIcon } from '../common/Icons'

export const NoticesView: React.FC = () => {
  const { notices, addNotice, activeSchool, currentUser } = useSchoolErp()
  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'General' | 'Academic' | 'Finance' | 'Events'>('General')
  const [targetAudience, setTargetAudience] = useState<'All' | 'Teachers' | 'Students' | 'Guardians'>('All')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return

    addNotice({
      title,
      content,
      category,
      targetAudience,
      publishedBy: currentUser?.name || 'School Administration',
    })

    setTitle('')
    setContent('')
    setShowAddForm(false)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            School Announcements & Circulars
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Official notices broadcast to teachers, students, and guardians at {activeSchool.name}
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
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
            <span>Post New Announcement</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#0f172a' }}>Draft Announcement</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Closing dates for Term 1 examinations"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
              >
                <option value="General">General</option>
                <option value="Academic">Academic</option>
                <option value="Finance">Finance</option>
                <option value="Events">Events</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
              >
                <option value="All">All Portal Users</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Students">Students Only</option>
                <option value="Guardians">Guardians Only</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
              Notice Content
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full circular announcement text..."
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Publish Circular
            </button>
          </div>
        </form>
      )}

      {/* Notices Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notices.map((n) => (
          <div
            key={n.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    backgroundColor:
                      n.category === 'Academic'
                        ? '#eff6ff'
                        : n.category === 'Finance'
                        ? '#ecfdf5'
                        : '#fef3c7',
                    color:
                      n.category === 'Academic'
                        ? '#1d4ed8'
                        : n.category === 'Finance'
                        ? '#047857'
                        : '#b45309',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {n.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Audience: <strong>{n.targetAudience}</strong>
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📅 {n.date}</span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
              {n.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1rem' }}>
              {n.content}
            </p>
            <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              Published by: <strong>{n.publishedBy}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
