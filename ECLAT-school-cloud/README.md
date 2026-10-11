# School Management ERP — Enterprise Edition

An enterprise-grade, clean light-themed School Information System (SIS) & ERP software engineered for primary, secondary, and international educational institutions.

---

## 🏛️ System Architecture & ERP Modules

Built in the style of top enterprise school management systems (PowerSchool, Fedena, QuickSchools):

1. **📊 Executive Dashboard (`DashboardView.tsx`)**:
   - Enrollment KPI metrics, Fee Collection totals, Outstanding balances, and Monthly Payroll liabilities.
   - Recent fee collection ledger with instant receipt generation.
   - School noticeboard circulars.

2. **👨‍🎓 Student Directory & Admissions (`StudentsView.tsx` & `NewAdmissionModal.tsx`)**:
   - Sequential Admission Number generator (`ADM-2026-001`, `ADM-2026-002`...).
   - Class and stream filters with instant search by name, admission no, or guardian phone.
   - One-click **Terminal Academic Report Card** and **Admission Slip** generation.

3. **👨‍🏫 Staff & HR Roster (`StaffView.tsx` & `NewStaffModal.tsx`)**:
   - Academic & support staff management with designations, departments, basic pay, and allowances.
   - Onboard new employee wizard.

4. **💰 Bursar Desk & Financial Ledger (`FinanceView.tsx` & `CollectFeeModal.tsx`)**:
   - Tuition and fee structures by class.
   - Real-time Fee Payment collection (M-Pesa, Bank Wire, Cheque, Cash).
   - Generates official stamped fee receipts.

5. **💼 Staff Statutory Payroll Engine (`PayrollView.tsx`)**:
   - Full automated statutory deductions: Gross Salary, PAYE, NHIF/SHIF, NSSF Tier I & II, Housing Levy (1.5%), and Net Take-Home Pay.
   - Individual official printable salary payslips.

6. **📝 Academics & Continuous Assessment (`AcademicsView.tsx` & `GradeEntryModal.tsx`)**:
   - Marksheet entry per class and subject: Opener (30) + Midterm (30) + Endterm (40) = Total (100%).
   - Auto-computed letter grades (A through E) and point averages.
   - Printable official terminal report cards with school crest and principal signature.

7. **📅 Daily Attendance Register (`AttendanceView.tsx`)**:
   - Class roll call register with Present, Absent, Late, and Excused toggles.
   - Real-time attendance rate calculation.

8. **⏰ Weekly Class Timetable (`TimetableView.tsx`)**:
   - Matrix schedule view across Monday to Friday by period, subject, teacher, and room.

9. **📢 Noticeboard (`NoticesView.tsx`)**:
   - Circulars for teachers, students, and guardians.

10. **⚙️ School Settings (`SettingsView.tsx`)**:
    - School profile, academic year, term dates, and statutory currency.

---

## 🚀 How to Run Locally

```bash
cd "c:\Users\egerton\Desktop\ECLAT WEBSITE\ECLAT-school-cloud"

# Start local server (Runs on port 5180)
npm run dev

# Run automated logic and runtime test suite
npm test

# Build production bundle
npm run build
```

---

## ⚡ 1-Click Fast Role Switcher

When testing or demonstrating to schools, use the role toolbar at the top right of the screen or the login portal to immediately switch perspective between:
- 👑 **Principal / Admin** (Full ERP control)
- 💼 **Bursar** (Fees, Payments & Payroll)
- 📚 **Teacher** (Continuous Assessment marks & Attendance roll call)
- 🎓 **Student / Parent** (Terminal Report Cards & Fee Statements)
