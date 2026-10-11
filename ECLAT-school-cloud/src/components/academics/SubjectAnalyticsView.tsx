import React, { useMemo, useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { ExamMark } from '../../types/schoolErp'
import { PageHeader, KpiGrid, KpiCard, card, th, td, Badge, inputStyle } from '../common/ui'

const GRADE_ORDER: ExamMark['grade'][] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'E']

const meanToGrade = (mean: number): ExamMark['grade'] => {
  if (mean >= 80) return 'A'
  if (mean >= 75) return 'A-'
  if (mean >= 70) return 'B+'
  if (mean >= 65) return 'B'
  if (mean >= 60) return 'B-'
  if (mean >= 55) return 'C+'
  if (mean >= 50) return 'C'
  if (mean >= 45) return 'C-'
  if (mean >= 40) return 'D+'
  if (mean >= 35) return 'D'
  return 'E'
}

const barColor = (mean: number) => (mean >= 70 ? '#16a34a' : mean >= 55 ? '#2563eb' : mean >= 40 ? '#f59e0b' : '#ef4444')

const HBar: React.FC<{ label: string; value: number; max?: number; suffix?: string; sub?: string }> = ({ label, value, max = 100, suffix = '%', sub }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 70px', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
    <div style={{ color: '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label}>
      {label}
      {sub && <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>{sub}</div>}
    </div>
    <div style={{ height: '14px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%', backgroundColor: barColor((value / max) * 100), borderRadius: '999px' }} />
    </div>
    <div style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{value.toFixed(1)}{suffix}</div>
  </div>
)

export const SubjectAnalyticsView: React.FC = () => {
  const { exams, students } = useSchoolErp()
  const classes = useMemo(() => Array.from(new Set(exams.map((e) => e.className))).sort(), [exams])
  const [classFilter, setClassFilter] = useState('All')

  const scoped = classFilter === 'All' ? exams : exams.filter((e) => e.className === classFilter)

  const subjectStats = useMemo(() => {
    const map = new Map<string, number[]>()
    scoped.forEach((e) => map.set(e.subject, [...(map.get(e.subject) || []), e.total]))
    return Array.from(map.entries())
      .map(([subject, scores]) => {
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length
        return { subject, mean, count: scores.length, high: Math.max(...scores), low: Math.min(...scores), grade: meanToGrade(mean) }
      })
      .sort((a, b) => b.mean - a.mean)
  }, [scoped])

  const gradeDist = useMemo(() => {
    const d: Record<string, number> = {}
    GRADE_ORDER.forEach((g) => (d[g] = 0))
    scoped.forEach((e) => (d[e.grade] = (d[e.grade] || 0) + 1))
    return d
  }, [scoped])
  const maxGradeCount = Math.max(1, ...Object.values(gradeDist))

  // Stream comparison (className + stream from student record)
  const streamStats = useMemo(() => {
    const map = new Map<string, number[]>()
    scoped.forEach((e) => {
      const s = students.find((st) => st.id === e.studentId)
      const key = `${e.className}${s?.stream ? ' ' + s.stream : ''}`
      map.set(key, [...(map.get(key) || []), e.total])
    })
    return Array.from(map.entries())
      .map(([stream, scores]) => ({ stream, mean: scores.reduce((a, b) => a + b, 0) / scores.length, entries: scores.length }))
      .sort((a, b) => b.mean - a.mean)
  }, [scoped, students])

  // Student ranking by mean score & mean points
  const ranking = useMemo(() => {
    const map = new Map<string, { name: string; adm: string; cls: string; totals: number[]; points: number[] }>()
    scoped.forEach((e) => {
      const r = map.get(e.studentId) || { name: e.studentName, adm: e.admissionNo, cls: e.className, totals: [], points: [] }
      r.totals.push(e.total)
      r.points.push(e.points)
      map.set(e.studentId, r)
    })
    return Array.from(map.entries())
      .map(([id, r]) => {
        const mean = r.totals.reduce((a, b) => a + b, 0) / r.totals.length
        const meanPoints = r.points.reduce((a, b) => a + b, 0) / r.points.length
        return { id, ...r, mean, meanPoints, grade: meanToGrade(mean), subjects: r.totals.length }
      })
      .sort((a, b) => b.mean - a.mean)
  }, [scoped])

  const overallMean = scoped.length ? scoped.reduce((s, e) => s + e.total, 0) / scoped.length : 0
  const passRate = scoped.length ? (scoped.filter((e) => e.total >= 50).length / scoped.length) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Subject Performance Analytics"
        subtitle="Live analysis of exam marks: subject means, grade distribution, stream comparison and merit ranking."
        actions={
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="All">All classes</option>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        }
      />

      <KpiGrid>
        <KpiCard label="Overall Mean Score" value={`${overallMean.toFixed(1)}%`} hint={`Mean grade ${meanToGrade(overallMean)}`} color={barColor(overallMean)} />
        <KpiCard label="Pass Rate (≥ 50%)" value={`${passRate.toFixed(0)}%`} hint={`${scoped.length} subject entries`} color="#2563eb" />
        <KpiCard label="Best Subject" value={subjectStats[0]?.subject || '—'} hint={subjectStats[0] ? `${subjectStats[0].mean.toFixed(1)}% mean` : 'No data'} color="#16a34a" />
        <KpiCard
          label="Needs Attention"
          value={subjectStats.length ? subjectStats[subjectStats.length - 1].subject : '—'}
          hint={subjectStats.length ? `${subjectStats[subjectStats.length - 1].mean.toFixed(1)}% mean` : 'No data'}
          color="#b91c1c"
        />
      </KpiGrid>

      {scoped.length === 0 ? (
        <div style={{ ...card, padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          No exam marks recorded yet. Enter marks under Exams & Broadsheet to see analytics.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1rem' }}>
            <div style={{ ...card, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Subject Mean Scores</div>
              {subjectStats.map((s) => (
                <HBar key={s.subject} label={s.subject} value={s.mean} sub={`${s.count} entries • ${s.low}–${s.high}`} />
              ))}
            </div>

            <div style={{ ...card, padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Grade Distribution</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.45rem', height: '200px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>
                {GRADE_ORDER.map((g) => (
                  <div key={g} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>{gradeDist[g] || ''}</div>
                    <div
                      title={`${g}: ${gradeDist[g]}`}
                      style={{
                        width: '100%',
                        height: `${(gradeDist[g] / maxGradeCount) * 85}%`,
                        minHeight: gradeDist[g] ? '4px' : 0,
                        backgroundColor: g.startsWith('A') ? '#16a34a' : g.startsWith('B') ? '#2563eb' : g.startsWith('C') ? '#f59e0b' : '#ef4444',
                        borderRadius: '4px 4px 0 0',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.35rem' }}>
                {GRADE_ORDER.map((g) => (
                  <div key={g} style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>{g}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...card, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>Class / Stream Comparison</div>
            {streamStats.map((s) => (
              <HBar key={s.stream} label={s.stream} value={s.mean} sub={`${s.entries} entries`} />
            ))}
          </div>

          <div style={{ ...card, overflowX: 'auto' }}>
            <div style={{ padding: '1rem 1rem 0', fontWeight: 700, color: '#0f172a' }}>Merit Ranking</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={th}>Rank</th>
                  <th style={th}>Student</th>
                  <th style={th}>Class</th>
                  <th style={{ ...th, textAlign: 'center' }}>Subjects</th>
                  <th style={{ ...th, textAlign: 'center' }}>Mean Score</th>
                  <th style={{ ...th, textAlign: 'center' }}>Mean Points</th>
                  <th style={{ ...th, textAlign: 'center' }}>Mean Grade</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, idx) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...td, fontWeight: 800, color: idx < 3 ? '#b45309' : '#64748b' }}>#{idx + 1}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.adm}</div>
                    </td>
                    <td style={td}>{r.cls}</td>
                    <td style={{ ...td, textAlign: 'center' }}>{r.subjects}</td>
                    <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{r.mean.toFixed(1)}%</td>
                    <td style={{ ...td, textAlign: 'center' }}>{r.meanPoints.toFixed(2)}</td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <Badge bg="#f1f5f9" fg={barColor(r.mean)}>{r.grade}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
