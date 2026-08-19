import { useState } from 'react'
import { schoolStore } from '@/lib/schoolData'
import type { ReportCard, ExamSession } from '@/types/school'
import { ReportCardGenerator } from './ReportCardGenerator'
import { CertificateGenerator } from '@/components/shared/CertificateGenerator'
import type { CertificateData } from '@/components/shared/CertificateGenerator'

export function ExamManagement() {
  const [exams] = useState<ExamSession[]>(() => schoolStore.getExams())
  const [reportCards] = useState<ReportCard[]>(() => schoolStore.getReportCards())
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null)
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null)
  const [activeTab, setActiveTab] = useState<'sessions' | 'reportcards' | 'ranking'>('reportcards')

  const topStudent = reportCards.reduce((prev, curr) => (curr.mean_percentage > prev.mean_percentage ? curr : prev), reportCards[0])
  const averageMean = (reportCards.reduce((acc, c) => acc + c.mean_percentage, 0) / (reportCards.length || 1)).toFixed(1)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Practical Assessments & Modular Transcripts</h1>
          <p className="page-subtitle">
            Short course practical workshops, continuous assessment (CAT), competency rankings, and official completion transcripts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.print()}
          >
            🖨️ Print Broadsheet Ranking
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Assessment Series</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {exams[0]?.title || 'Practical Assessment Series'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>
            {exams.length > 0 ? 'Results Published & Audited' : 'Awaiting Faculty Schedule'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Cohort Mean Score</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#16a34a', marginTop: '0.25rem' }}>
            {reportCards.length > 0 ? `${averageMean}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            {reportCards.length > 0 ? 'Audited Final Assessment' : 'No graded report cards yet'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Top Performing Trainee</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#7c3aed', marginTop: '0.25rem' }}>
            {topStudent ? topStudent.student_name : 'Pending Assessment'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            {topStudent ? `${topStudent.mean_percentage}% • Rank #1` : 'Records update on evaluation'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ea580c' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Modular Pass Rate</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ea580c', marginTop: '0.25rem' }}>
            {reportCards.length > 0 ? '100%' : 'N/A'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>
            {reportCards.length > 0 ? 'All Candidates Pass & Credit' : 'Awaiting graded reports'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6" style={{ padding: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'reportcards' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('reportcards')}
          >
            📋 Official College Transcripts / Reports
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'sessions' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('sessions')}
          >
            📅 Practical Assessment Sessions & Schedules
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'ranking' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('ranking')}
          >
            🏆 Departmental Merit Ranking Table
          </button>
        </div>
      </div>

      {/* Tab 1: Student Report Cards List */}
      {activeTab === 'reportcards' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Generated Semester 1 Official Transcripts & Grade Sheets</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Click on any student to view, print, or download their official Brent College transcript with GPA and Dean’s remarks.
            </p>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Adm No.</th>
                  <th>Student Name</th>
                  <th>Program / Diploma</th>
                  <th>Total Marks</th>
                  <th>Mean %</th>
                  <th>Classification</th>
                  <th>Points</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reportCards.map((rc) => (
                  <tr key={rc.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedReportCard(rc)}>
                    <td style={{ fontWeight: 700, color: rc.class_position <= 3 ? '#eab308' : 'inherit' }}>
                      #{rc.class_position}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{rc.admission_number}</td>
                    <td style={{ fontWeight: 600 }}>{rc.student_name}</td>
                    <td><span className="badge badge-info">{rc.class_name}</span></td>
                    <td>{rc.total_marks} / {rc.max_marks}</td>
                    <td style={{ fontWeight: 700 }}>{rc.mean_percentage}%</td>
                    <td>
                      <span className="badge badge-success" style={{ fontWeight: 700 }}>
                        {rc.mean_grade}
                      </span>
                    </td>
                    <td><strong>{rc.overall_points} pts</strong></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCert({
                              student_name: rc.student_name,
                              admission_number: rc.admission_number,
                              course_title: rc.class_name,
                              grade: rc.mean_grade,
                              percentage: rc.mean_percentage,
                              issue_date: rc.issue_date || new Date().toLocaleDateString('en-GB'),
                              certificate_no: `BC-${rc.admission_number.replace(/[^a-zA-Z0-9]/g, '')}`,
                              duration: '4 to 12 Weeks Intensive Practical Training',
                              trainer_name: 'Lead Vocational Instructor',
                              skills_acquired: rc.subjects.map((s) => s.subject_name),
                            })
                          }}
                          style={{ fontWeight: 700, padding: '0.3rem 0.65rem' }}
                        >
                          🎓 Certificate
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedReportCard(rc)
                          }}
                          style={{ fontWeight: 700, padding: '0.3rem 0.65rem' }}
                        >
                          📄 Transcript
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Exam Sessions */}
      {activeTab === 'sessions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exams.map((session) => (
            <div key={session.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge ${session.status === 'Published' ? 'badge-success' : session.status === 'Active' ? 'badge-warning' : 'badge-info'}`}>
                  {session.status}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{session.academic_year}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>
                {session.title}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div><strong>Academic Period:</strong> {session.term}</div>
                <div><strong>Examination Start:</strong> {session.start_date}</div>
                <div><strong>Examination End:</strong> {session.end_date}</div>
                <div><strong>Audited by:</strong> College Academic Board & TVET/CDACC Verifier</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Merit Ranking */}
      {activeTab === 'ranking' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Diploma in Computer Science & ICT (Year 2) — Master Academic Merit Board
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Broadsheet of all 7 semester modular units (CS 201, CS 202, CS 203, NET 204, MAT 201, ENT 101, CMS 101)
          </p>

          <div className="table-responsive">
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Student Name</th>
                  <th>CS 201</th>
                  <th>CS 202</th>
                  <th>CS 203</th>
                  <th>NET 204</th>
                  <th>MAT 201</th>
                  <th>ENT 101</th>
                  <th>CMS 101</th>
                  <th>Total</th>
                  <th>Mean %</th>
                  <th>Classification</th>
                </tr>
              </thead>
              <tbody>
                {reportCards.map((rc) => {
                  const getSubScore = (code: string) => {
                    const found = rc.subjects.find((s) => s.subject_code.includes(code))
                    return found ? `${found.total_score}% (${found.grade})` : '-'
                  }

                  return (
                    <tr key={rc.id}>
                      <td style={{ fontWeight: 700 }}>#{rc.class_position}</td>
                      <td style={{ fontWeight: 600 }}>{rc.student_name}</td>
                      <td>{getSubScore('CS 201')}</td>
                      <td>{getSubScore('CS 202')}</td>
                      <td>{getSubScore('CS 203')}</td>
                      <td>{getSubScore('NET 204')}</td>
                      <td>{getSubScore('MAT 201')}</td>
                      <td>{getSubScore('ENT 101')}</td>
                      <td>{getSubScore('CMS 101')}</td>
                      <td style={{ fontWeight: 700 }}>{rc.total_marks}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{rc.mean_percentage}%</td>
                      <td><span className="badge badge-success">{rc.mean_grade}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Report Card Printable Modal */}
      {selectedReportCard && (
        <ReportCardGenerator
          reportCard={selectedReportCard}
          onClose={() => setSelectedReportCard(null)}
        />
      )}

      {/* Official Certificate of Completion Printable Modal */}
      {selectedCert && (
        <CertificateGenerator
          cert={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  )
}
