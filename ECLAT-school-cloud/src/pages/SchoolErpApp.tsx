import React, { useState } from 'react'
import { useSchoolErp } from '../context/SchoolErpContext'
import { ErpLayout } from '../components/layout/ErpLayout'
import { ActiveTab } from '../components/layout/ErpSidebar'
import { DashboardView } from '../components/dashboard/DashboardView'
import { StudentsView } from '../components/students/StudentsView'
import { StaffView } from '../components/staff/StaffView'
import { FinanceView } from '../components/finance/FinanceView'
import { ExpensesView } from '../components/finance/ExpensesView'
import { PayrollView } from '../components/finance/PayrollView'
import { AcademicsView } from '../components/academics/AcademicsView'
import { AttendanceView } from '../components/attendance/AttendanceView'
import { TimetableView } from '../components/timetable/TimetableView'
import { NoticesView } from '../components/notices/NoticesView'
import { SmsBroadcastView } from '../components/communication/SmsBroadcastView'
import { SettingsView } from '../components/settings/SettingsView'
import { StudentGuardianPortalView } from '../components/portal/StudentGuardianPortalView'
import { LibraryView } from '../components/library/LibraryView'
import { TransportHostelView } from '../components/hostel_transport/TransportHostelView'
import { DisciplineView } from '../components/discipline/DisciplineView'
import { ClearanceLeavingCertView } from '../components/clearance/ClearanceLeavingCertView'
import { UsersCredentialsView } from '../components/accounts/UsersCredentialsView'
import { AuditLogView } from '../components/audit/AuditLogView'
import { ClinicView } from '../components/clinic/ClinicView'
import { ExeatView } from '../components/exeat/ExeatView'
import { CbcAssessmentView } from '../components/academics/CbcAssessmentView'
import { SubjectAnalyticsView } from '../components/academics/SubjectAnalyticsView'

// Modals
import { NewAdmissionModal } from '../components/students/NewAdmissionModal'
import { ImportStudentsModal } from '../components/students/ImportStudentsModal'
import { StudentProfileModal } from '../components/students/StudentProfileModal'
import { NewStaffModal } from '../components/staff/NewStaffModal'
import { CollectFeeModal } from '../components/finance/CollectFeeModal'
import { GradeEntryModal } from '../components/academics/GradeEntryModal'

// Printables
import { PrintableReportCard } from '../components/printables/PrintableReportCard'
import { PrintableFeeReceipt } from '../components/printables/PrintableFeeReceipt'
import { PrintablePayslip } from '../components/printables/PrintablePayslip'
import { PrintableStudentIdCard } from '../components/students/PrintableStudentIdCard'
import { PrintableAdmissionLetter } from '../components/students/PrintableAdmissionLetter'
import { StudentFeeStatementModal } from '../components/finance/StudentFeeStatementModal'

export const SchoolErpApp: React.FC = () => {
  const { students, currentUser } = useSchoolErp()
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')

  // Modals state
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isNewStaffOpen, setIsNewStaffOpen] = useState(false)
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false)
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false)

  // Target IDs for Modals & Printables
  const [selectedProfileStudentId, setSelectedProfileStudentId] = useState<string | null>(null)
  const [reportCardStudentId, setReportCardStudentId] = useState<string | null>(null)
  const [feeReceiptPaymentId, setFeeReceiptPaymentId] = useState<string | null>(null)
  const [feeStatementStudentId, setFeeStatementStudentId] = useState<string | null>(null)
  const [payslipStaffId, setPayslipStaffId] = useState<string | null>(null)
  const [idCardStudentId, setIdCardStudentId] = useState<string | null>(null)
  const [admissionLetterStudentId, setAdmissionLetterStudentId] = useState<string | null>(null)

  const isStudent = currentUser?.role === 'student'

  return (
    <ErpLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* If current role is Student / Guardian and on Dashboard, render dedicated portal view */}
      {isStudent && activeTab === 'dashboard' ? (
        <StudentGuardianPortalView
          onOpenReportCard={(id) => setReportCardStudentId(id)}
          onOpenFeeStatement={(id) => setFeeStatementStudentId(id)}
          onOpenIdCard={(id) => setIdCardStudentId(id)}
        />
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenAdmissionModal={() => setIsAdmissionOpen(true)}
              onOpenFeeModal={() => setIsFeeModalOpen(true)}
              onViewReceipt={(id) => setFeeReceiptPaymentId(id)}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              onOpenAdmissionModal={() => setIsAdmissionOpen(true)}
              onOpenImportModal={() => setIsImportOpen(true)}
              onSelectStudentProfile={(id) => setSelectedProfileStudentId(id)}
              onViewReportCard={(id) => setReportCardStudentId(id)}
              onViewAdmissionLetter={(id) => setAdmissionLetterStudentId(id)}
            />
          )}

          {activeTab === 'staff' && (
            <StaffView onOpenNewStaffModal={() => setIsNewStaffOpen(true)} />
          )}

          {activeTab === 'finance' && (
            <FinanceView
              onOpenFeeModal={() => setIsFeeModalOpen(true)}
              onViewReceipt={(id) => setFeeReceiptPaymentId(id)}
              onViewFeeStatement={(id) => setFeeStatementStudentId(id)}
            />
          )}

          {activeTab === 'expenses' && <ExpensesView />}

          {activeTab === 'payroll' && (
            <PayrollView onViewPayslip={(id) => setPayslipStaffId(id)} />
          )}

          {activeTab === 'academics' && (
            <AcademicsView
              onOpenGradeModal={() => setIsGradeModalOpen(true)}
              onViewReportCard={(id) => setReportCardStudentId(id)}
            />
          )}

          {activeTab === 'attendance' && <AttendanceView />}

          {activeTab === 'timetable' && <TimetableView />}

          {activeTab === 'cbc' && <CbcAssessmentView />}

          {activeTab === 'analytics' && <SubjectAnalyticsView />}

          {activeTab === 'clinic' && <ClinicView />}

          {activeTab === 'exeat' && <ExeatView />}

          {activeTab === 'library' && <LibraryView />}

          {activeTab === 'hostel_transport' && <TransportHostelView />}

          {activeTab === 'discipline' && <DisciplineView />}

          {activeTab === 'clearance' && <ClearanceLeavingCertView />}

          {activeTab === 'accounts' && <UsersCredentialsView />}

          {activeTab === 'sms' && <SmsBroadcastView />}

          {activeTab === 'notices' && <NoticesView />}

          {activeTab === 'audit' && <AuditLogView />}

          {activeTab === 'settings' && <SettingsView />}
        </>
      )}

      {/* Modal Dialogues */}
      <NewAdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        onSuccess={(id) => setAdmissionLetterStudentId(id)}
      />

      <ImportStudentsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={(count) => alert(`Successfully imported ${count} students into the school registry!`)}
      />

      <NewStaffModal
        isOpen={isNewStaffOpen}
        onClose={() => setIsNewStaffOpen(false)}
      />

      <CollectFeeModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        onSuccess={(id) => setFeeReceiptPaymentId(id)}
      />

      <GradeEntryModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
      />

      {/* Student Profile Dossier Modal */}
      {selectedProfileStudentId && (
        <StudentProfileModal
          studentId={selectedProfileStudentId}
          onClose={() => setSelectedProfileStudentId(null)}
          onOpenReportCard={(id) => setReportCardStudentId(id)}
          onOpenIdCard={(id) => setIdCardStudentId(id)}
          onOpenFeeStatement={(id) => setFeeStatementStudentId(id)}
          onOpenAdmissionSlip={(id) => setAdmissionLetterStudentId(id)}
        />
      )}

      {/* Printable Overlays */}
      {reportCardStudentId && (
        <PrintableReportCard
          studentId={reportCardStudentId}
          onClose={() => setReportCardStudentId(null)}
        />
      )}

      {feeReceiptPaymentId && (
        <PrintableFeeReceipt
          paymentId={feeReceiptPaymentId}
          onClose={() => setFeeReceiptPaymentId(null)}
        />
      )}

      {feeStatementStudentId && (
        <StudentFeeStatementModal
          studentId={feeStatementStudentId}
          onClose={() => setFeeStatementStudentId(null)}
        />
      )}

      {payslipStaffId && (
        <PrintablePayslip
          staffId={payslipStaffId}
          onClose={() => setPayslipStaffId(null)}
        />
      )}

      {idCardStudentId && (
        <PrintableStudentIdCard
          studentId={idCardStudentId}
          onClose={() => setIdCardStudentId(null)}
        />
      )}

      {admissionLetterStudentId && (
        <PrintableAdmissionLetter
          studentId={admissionLetterStudentId}
          onClose={() => setAdmissionLetterStudentId(null)}
        />
      )}
    </ErpLayout>
  )
}
