import React, { useMemo, useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { CbcAssessment } from '../../types/schoolErp'
import { PlusIcon, SearchIcon } from '../common/Icons'
import { PageHeader, KpiGrid, KpiCard, card, th, td, Badge, Modal, Field, inputStyle, btnPrimary, btnSecondary } from '../common/ui'

type Level = CbcAssessment['performanceLevel']

export const CBC_LEVELS: Record<Level, { label: string; points: number; bg: string; fg: string; descriptor: string }> = {
  EE: { label: 'Exceeding Expectations', points: 4, bg: '#dcfce7', fg: '#15803d', descriptor: 'Consistently demonstrates the competence beyond the expected level.' },
  ME: { label: 'Meeting Expectations', points: 3, bg: '#dbeafe', fg: '#1e40af', descriptor: 'Demonstrates the competence at the expected level.' },
  AE: { label: 'Approaching Expectations', points: 2, bg: '#fef3c7', fg: '#b45309', descriptor: 'Demonstrates the competence with some support.' },
  BE: { label: 'Below Expectations', points: 1, bg: '#fee2e2', fg: '#b91c1c', descriptor: 'Requires substantial support to demonstrate the competence.' },
}

const LEARNING_AREAS = [
  'English', 'Kiswahili', 'Mathematics', 'Integrated Science', 'Health Education', 'Pre-Technical Studies',
  'Social Studies', 'Religious Education', 'Business Studies', 'Agriculture', 'Life Skills Education',
  'Sports & Physical Education', 'Creative Arts & Sports', 'Computer Science',
]

const CORE_COMPETENCIES = [
  'Communication & Collaboration', 'Critical Thinking & Problem Solving', 'Creativity & Imagination',
  'Citizenship', 'Digital Literacy', 'Learning to Learn', 'Self-Efficacy',
]

const CORE_VALUES = ['Love', 'Responsibility', 'Respect', 'Unity', 'Peace', 'Patriotism', 'Integrity']

const LevelBadge: React.FC<{ level: Level }> = ({ level }) => (
  <span title={CBC_LEVELS[level].label}>
    <Badge bg={CBC_LEVELS[level].bg} fg={CBC_LEVELS[level].fg}>{level}</Badge>
  </span>
)

export const CbcAssessmentView: React.FC = () => {
  const { cbcAssessments, students, recordCbcAssessment, activeSchool } = useSchoolErp()
  const [tab, setTab] = useState<'records' | 'learners'>('records')
  const [search, setSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState('All')
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    studentId: '',
    learningArea: LEARNING_AREAS[0],
    strand: '',
    substrand: '',
    performanceLevel: 'ME' as Level,
    coreCompetencies: [] as string[],
    valuesDemonstrated: [] as string[],
    teacherRemarks: '',
  })

  const levelCounts = useMemo(() => {
    const c: Record<Level, number> = { EE: 0, ME: 0, AE: 0, BE: 0 }
    cbcAssessments.forEach((a) => { c[a.performanceLevel] += 1 })
    return c
  }, [cbcAssessments])

  const total = cbcAssessments.length || 1

  const filtered = cbcAssessments.filter((a) => {
    const q = search.toLowerCase()
    const matchQ = a.studentName.toLowerCase().includes(q) || a.admissionNo.toLowerCase().includes(q) || a.strand.toLowerCase().includes(q)
    return matchQ && (areaFilter === 'All' || a.learningArea === areaFilter)
  })

  // Per-learner summary: average points → overall level
  const learnerSummaries = useMemo(() => {
    const map = new Map<string, { name: string; adm: string; cls: string; items: CbcAssessment[] }>()
    cbcAssessments.forEach((a) => {
      const entry = map.get(a.studentId) || { name: a.studentName, adm: a.admissionNo, cls: a.className, items: [] }
      entry.items.push(a)
      map.set(a.studentId, entry)
    })
    return Array.from(map.entries()).map(([id, e]) => {
      const avg = e.items.reduce((s, i) => s + CBC_LEVELS[i.performanceLevel].points, 0) / e.items.length
      const overall: Level = avg >= 3.5 ? 'EE' : avg >= 2.5 ? 'ME' : avg >= 1.5 ? 'AE' : 'BE'
      const competencies = Array.from(new Set(e.items.flatMap((i) => i.coreCompetencies)))
      return { id, ...e, avg, overall, competencies }
    }).sort((a, b) => b.avg - a.avg)
  }, [cbcAssessments])

  const toggle = (key: 'coreCompetencies' | 'valuesDemonstrated', value: string) => {
    const list = form[key]
    setForm({ ...form, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const s = students.find((x) => x.id === form.studentId)
    if (!s) return
    recordCbcAssessment({
      studentId: s.id,
      studentName: s.fullName,
      admissionNo: s.admissionNo,
      className: s.className,
      learningArea: form.learningArea,
      strand: form.strand,
      substrand: form.substrand,
      performanceLevel: form.performanceLevel,
      coreCompetencies: form.coreCompetencies,
      valuesDemonstrated: form.valuesDemonstrated,
      teacherRemarks: form.teacherRemarks,
      assessmentTerm: `${activeSchool.currentTerm} ${activeSchool.academicYear}`,
    })
    setIsOpen(false)
    setForm({ ...form, studentId: '', strand: '', substrand: '', coreCompetencies: [], valuesDemonstrated: [], teacherRemarks: '' })
  }

  const chip = (active: boolean): React.CSSProperties => ({
    padding: '0.3rem 0.65rem',
    borderRadius: '999px',
    border: `1px solid ${active ? '#2563eb' : '#cbd5e1'}`,
    backgroundColor: active ? '#2563eb' : '#ffffff',
    color: active ? '#ffffff' : '#475569',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="CBC Competency Assessment"
        subtitle="Rubric-based assessment (EE / ME / AE / BE) per learning area, strand and sub-strand, with core competencies and values."
        actions={
          <button style={btnPrimary} onClick={() => setIsOpen(true)}>
            <PlusIcon size={16} /> New Rubric Assessment
          </button>
        }
      />

      <KpiGrid>
        {(Object.keys(CBC_LEVELS) as Level[]).map((lvl) => (
          <KpiCard
            key={lvl}
            label={`${lvl} — ${CBC_LEVELS[lvl].label}`}
            value={levelCounts[lvl]}
            color={CBC_LEVELS[lvl].fg}
            hint={`${Math.round((levelCounts[lvl] / total) * 100)}% of all assessments`}
          />
        ))}
      </KpiGrid>

      {/* Distribution bar */}
      <div style={{ ...card, padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.6rem' }}>Performance level distribution</div>
        <div style={{ display: 'flex', height: '22px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
          {(Object.keys(CBC_LEVELS) as Level[]).map((lvl) =>
            levelCounts[lvl] > 0 ? (
              <div
                key={lvl}
                title={`${CBC_LEVELS[lvl].label}: ${levelCounts[lvl]}`}
                style={{ width: `${(levelCounts[lvl] / total) * 100}%`, backgroundColor: CBC_LEVELS[lvl].fg, color: '#fff', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {lvl}
              </div>
            ) : null
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {(Object.keys(CBC_LEVELS) as Level[]).map((lvl) => (
            <div key={lvl} style={{ fontSize: '0.75rem', color: '#64748b' }}>
              <strong style={{ color: CBC_LEVELS[lvl].fg }}>{lvl} ({CBC_LEVELS[lvl].points})</strong> — {CBC_LEVELS[lvl].descriptor}
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={tab === 'records' ? btnPrimary : btnSecondary} onClick={() => setTab('records')}>Assessment Records</button>
          <button style={tab === 'learners' ? btnPrimary : btnSecondary} onClick={() => setTab('learners')}>Learner Progress Summary</button>
        </div>
        {tab === 'records' && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.45rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <SearchIcon size={15} color="#64748b" />
              <input placeholder="Search learner or strand..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem' }} />
            </div>
            <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
              <option value="All">All learning areas</option>
              {Array.from(new Set([...LEARNING_AREAS, ...cbcAssessments.map((a) => a.learningArea)])).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {tab === 'records' ? (
        <div style={{ ...card, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={th}>Learner</th>
                <th style={th}>Learning Area</th>
                <th style={th}>Strand / Sub-strand</th>
                <th style={th}>Level</th>
                <th style={th}>Core Competencies</th>
                <th style={th}>Values</th>
                <th style={th}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                  <td style={td}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{a.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.admissionNo} • {a.className} • {a.assessmentTerm}</div>
                  </td>
                  <td style={{ ...td, fontWeight: 600 }}>{a.learningArea}</td>
                  <td style={{ ...td, fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{a.strand}</div>
                    <div style={{ color: '#64748b' }}>{a.substrand}</div>
                  </td>
                  <td style={td}><LevelBadge level={a.performanceLevel} /></td>
                  <td style={{ ...td, fontSize: '0.75rem', maxWidth: '200px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {a.coreCompetencies.map((c) => <Badge key={c} bg="#f1f5f9" fg="#334155">{c}</Badge>)}
                    </div>
                  </td>
                  <td style={{ ...td, fontSize: '0.78rem', color: '#475569' }}>{a.valuesDemonstrated.join(', ') || '—'}</td>
                  <td style={{ ...td, fontSize: '0.8rem', color: '#334155', maxWidth: '260px' }}>{a.teacherRemarks}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#94a3b8' }}>No assessments match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {learnerSummaries.map((l) => (
            <div key={l.id} style={{ ...card, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{l.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.adm} • {l.cls}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <LevelBadge level={l.overall} />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>avg {l.avg.toFixed(2)} / 4</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {l.items.map((i) => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.3rem' }}>
                    <span style={{ color: '#334155' }}>{i.learningArea}</span>
                    <LevelBadge level={i.performanceLevel} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                <strong>Competencies shown:</strong> {l.competencies.join(', ') || '—'}
              </div>
            </div>
          ))}
          {learnerSummaries.length === 0 && <div style={{ color: '#94a3b8' }}>No learner assessments yet.</div>}
        </div>
      )}

      {isOpen && (
        <Modal title="New CBC Rubric Assessment" onClose={() => setIsOpen(false)} width={620}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Learner">
                <select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} style={inputStyle}>
                  <option value="">-- Select learner --</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.fullName} ({s.className})</option>)}
                </select>
              </Field>
              <Field label="Learning Area">
                <select value={form.learningArea} onChange={(e) => setForm({ ...form, learningArea: e.target.value })} style={inputStyle}>
                  {LEARNING_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Strand">
                <input required value={form.strand} onChange={(e) => setForm({ ...form, strand: e.target.value })} style={inputStyle} placeholder="e.g. Numbers" />
              </Field>
              <Field label="Sub-strand">
                <input required value={form.substrand} onChange={(e) => setForm({ ...form, substrand: e.target.value })} style={inputStyle} placeholder="e.g. Fractions" />
              </Field>
            </div>

            <Field label="Performance Level">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {(Object.keys(CBC_LEVELS) as Level[]).map((lvl) => {
                  const active = form.performanceLevel === lvl
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setForm({ ...form, performanceLevel: lvl })}
                      style={{
                        padding: '0.6rem 0.4rem',
                        borderRadius: '6px',
                        border: `2px solid ${active ? CBC_LEVELS[lvl].fg : '#e2e8f0'}`,
                        backgroundColor: active ? CBC_LEVELS[lvl].bg : '#ffffff',
                        color: CBC_LEVELS[lvl].fg,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>{lvl}</div>
                      <div style={{ fontSize: '0.68rem' }}>{CBC_LEVELS[lvl].label}</div>
                    </button>
                  )
                })}
              </div>
            </Field>

            <Field label="Core Competencies Demonstrated">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {CORE_COMPETENCIES.map((c) => (
                  <button type="button" key={c} style={chip(form.coreCompetencies.includes(c))} onClick={() => toggle('coreCompetencies', c)}>{c}</button>
                ))}
              </div>
            </Field>

            <Field label="Core Values Demonstrated">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {CORE_VALUES.map((v) => (
                  <button type="button" key={v} style={chip(form.valuesDemonstrated.includes(v))} onClick={() => toggle('valuesDemonstrated', v)}>{v}</button>
                ))}
              </div>
            </Field>

            <Field label="Teacher Remarks">
              <textarea required rows={3} value={form.teacherRemarks} onChange={(e) => setForm({ ...form, teacherRemarks: e.target.value })} style={inputStyle} placeholder="Evidence observed, areas of strength and next steps..." />
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" style={btnSecondary} onClick={() => setIsOpen(false)}>Cancel</button>
              <button type="submit" style={btnPrimary}>Save Assessment</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
