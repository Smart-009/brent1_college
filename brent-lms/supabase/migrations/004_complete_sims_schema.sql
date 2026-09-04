-- ============================================================
-- clat Institute LMS & SIMS  Complete Schema Upgrade
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. Enhance `classes` table with full vocational course columns
ALTER TABLE IF EXISTS classes ADD COLUMN IF NOT EXISTS hod_name TEXT DEFAULT 'Faculty Instructor';
ALTER TABLE IF EXISTS classes ADD COLUMN IF NOT EXISTS fee_amount NUMERIC DEFAULT 75;
ALTER TABLE IF EXISTS classes ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '3 Months (Certificate Course)';
ALTER TABLE IF EXISTS classes ADD COLUMN IF NOT EXISTS shifts TEXT DEFAULT 'Mon, Wed & Fri: 7:30 PM - 9:30 PM EAT';
ALTER TABLE IF EXISTS classes ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';

-- 2. Enhance `profiles` table with student records, SIMS, and biometric fields
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female', 'Other'));
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS grade_level TEXT DEFAULT 'Vocational Certificate';
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT 'Virtual Cohort';
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS guardian_phone TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS guardian_email TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS guardian_relationship TEXT DEFAULT 'Parent';
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS fee_balance NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS term_fee_total NUMERIC DEFAULT 75;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS fee_cleared BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS attendance_rate NUMERIC DEFAULT 100;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS discipline_points INTEGER DEFAULT 100;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS merits_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS demerits_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS biometric_enrolled BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS biometric_finger_name TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS biometric_template_hash TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS biometric_credential_id TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS biometric_enrolled_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS certificate_granted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS certificate_granted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS certificate_number TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS certificate_grade TEXT;

-- 3. Create `fee_invoices` table
CREATE TABLE IF NOT EXISTS fee_invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  term_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  tuition_fee NUMERIC NOT NULL DEFAULT 0,
  boarding_fee NUMERIC NOT NULL DEFAULT 0,
  activity_fee NUMERIC NOT NULL DEFAULT 0,
  exam_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  balance_due NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create `fee_payments` (Receipts) table
CREATE TABLE IF NOT EXISTS fee_payments (
  id TEXT PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  invoice_id TEXT,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  amount_paid NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('MPESA', 'BANK_TRANSFER', 'CASH', 'CHEQUE', 'ONLINE_CARD')),
  transaction_reference TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by TEXT NOT NULL DEFAULT 'Bursar',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create `discipline_records` table
CREATE TABLE IF NOT EXISTS discipline_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  class_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('Merit', 'Demerit', 'Commendation', 'Warning', 'Suspension')),
  points INTEGER NOT NULL DEFAULT 0,
  incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT,
  action_taken TEXT,
  reported_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create `secretary_inquiries` table
CREATE TABLE IF NOT EXISTS secretary_inquiries (
  id TEXT PRIMARY KEY,
  inquiry_number TEXT UNIQUE NOT NULL,
  visitor_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  interested_program TEXT NOT NULL,
  source TEXT DEFAULT 'Website / Walk-in',
  inquiry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'REGISTERED', 'FOLLOW_UP', 'CLOSED')),
  notes TEXT,
  recorded_by TEXT NOT NULL DEFAULT 'Front Desk Secretary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create `exam_sessions` table
CREATE TABLE IF NOT EXISTS exam_sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  term_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Create `report_cards` table
CREATE TABLE IF NOT EXISTS report_cards (
  id TEXT PRIMARY KEY,
  exam_session_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  class_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  total_marks NUMERIC NOT NULL DEFAULT 0,
  mean_grade TEXT NOT NULL DEFAULT 'A',
  gpa NUMERIC NOT NULL DEFAULT 4.0,
  class_rank INTEGER,
  total_students INTEGER,
  conduct_remarks TEXT,
  principal_remarks TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Enable Row Level Security (RLS) across all tables
ALTER TABLE IF EXISTS fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discipline_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS secretary_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS report_cards ENABLE ROW LEVEL SECURITY;

-- 10. Configure RLS Access Policies
DROP POLICY IF EXISTS "Public can view fee invoices" ON fee_invoices;
CREATE POLICY "Public can view fee invoices" ON fee_invoices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage fee invoices" ON fee_invoices;
CREATE POLICY "Admins can manage fee invoices" ON fee_invoices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view fee payments" ON fee_payments;
CREATE POLICY "Public can view fee payments" ON fee_payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage fee payments" ON fee_payments;
CREATE POLICY "Admins can manage fee payments" ON fee_payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view discipline records" ON discipline_records;
CREATE POLICY "Public can view discipline records" ON discipline_records FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage discipline records" ON discipline_records;
CREATE POLICY "Admins can manage discipline records" ON discipline_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view secretary inquiries" ON secretary_inquiries;
CREATE POLICY "Public can view secretary inquiries" ON secretary_inquiries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage secretary inquiries" ON secretary_inquiries;
CREATE POLICY "Admins can manage secretary inquiries" ON secretary_inquiries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view exam sessions" ON exam_sessions;
CREATE POLICY "Public can view exam sessions" ON exam_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage exam sessions" ON exam_sessions;
CREATE POLICY "Admins can manage exam sessions" ON exam_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view report cards" ON report_cards;
CREATE POLICY "Public can view report cards" ON report_cards FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage report cards" ON report_cards;
CREATE POLICY "Admins can manage report cards" ON report_cards FOR ALL USING (true) WITH CHECK (true);
