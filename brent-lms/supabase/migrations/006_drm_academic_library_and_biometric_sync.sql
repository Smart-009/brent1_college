-- ============================================================
-- clat Institute  Comprehensive Database Migration 006
-- Academic E-Reader Handbooks, DRM Audit, Biometrics & SIMS
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/mxfuivzgcnxwyslrmzqa/sql
-- ============================================================

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  hod_name TEXT NOT NULL,
  hod_email TEXT NOT NULL,
  programs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Faculty Teachers Table
CREATE TABLE IF NOT EXISTS public.faculty_teachers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  qualifications TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Academic E-Reader Handbooks (Curriculum DRM-Protected Content)
CREATE TABLE IF NOT EXISTS public.academic_handbooks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  discipline TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'All Trainees / Diploma',
  author TEXT NOT NULL DEFAULT 'clat Institute Academic Board',
  year INTEGER NOT NULL DEFAULT 2026,
  readings_count INTEGER NOT NULL DEFAULT 0,
  chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
  takeaways JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_drm_protected BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Biometric Fee Clearance Passes Table
CREATE TABLE IF NOT EXISTS public.biometric_clearance_passes (
  id TEXT PRIMARY KEY,
  clearance_code TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_hash TEXT NOT NULL,
  verified_by TEXT NOT NULL DEFAULT 'Biometric Clearance Engine',
  status TEXT NOT NULL DEFAULT 'VERIFIED_CLEARED' CHECK (status IN ('VERIFIED_CLEARED', 'PROVISIONAL', 'REVOKED')),
  qr_payload TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Course Units Table (Modular Academic Units)
CREATE TABLE IF NOT EXISTS public.course_units (
  id TEXT PRIMARY KEY,
  unit_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  level TEXT NOT NULL,
  credit_hours INTEGER NOT NULL DEFAULT 3,
  instructor_name TEXT NOT NULL,
  is_core BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Semester Unit Registrations Table
CREATE TABLE IF NOT EXISTS public.unit_registrations (
  id TEXT PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  registered_units JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_credit_hours INTEGER NOT NULL DEFAULT 0,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'PENDING', 'DROPPED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DRM & Anti-Screen Capture Audit Logs
CREATE TABLE IF NOT EXISTS public.drm_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT,
  admission_number TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('PRINTSCREEN_BLOCKED', 'FOCUS_LOSS_BLACKOUT', 'WINDOW_PROTECTION_ENABLED', 'UNAUTHORIZED_CLIPBOARD_COPY', 'WATERMARK_TAMPER_ATTEMPT')),
  window_title TEXT,
  ip_address TEXT,
  platform TEXT DEFAULT 'Windows Desktop AppX',
  action_taken TEXT NOT NULL DEFAULT 'WIPED_AND_BLOCKED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Secretary & Bursar Inquiries Table
CREATE TABLE IF NOT EXISTS public.secretary_inquiries (
  id TEXT PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,
  student_id TEXT,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  student_admission TEXT,
  category TEXT NOT NULL CHECK (category IN ('Fee Inquiry', 'Admission', 'Academic Transcript', 'Discipline / Clearance', 'General')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  resolved_by TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Timetable Periods Table
CREATE TABLE IF NOT EXISTS public.timetable_periods (
  id TEXT PRIMARY KEY,
  period_number INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  subject_id TEXT,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  color_hex TEXT NOT NULL DEFAULT '#2563eb',
  teacher_id TEXT,
  teacher_name TEXT NOT NULL,
  room TEXT NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  class_id TEXT,
  class_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Exam Sessions & Results Table
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Active', 'Completed', 'Published')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.report_cards (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  class_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  exam_session_title TEXT NOT NULL,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_marks NUMERIC NOT NULL DEFAULT 0,
  max_marks NUMERIC NOT NULL DEFAULT 0,
  mean_percentage NUMERIC NOT NULL DEFAULT 0,
  mean_grade TEXT NOT NULL DEFAULT 'F',
  overall_points NUMERIC NOT NULL DEFAULT 0,
  class_position INTEGER NOT NULL DEFAULT 1,
  total_students_in_class INTEGER NOT NULL DEFAULT 1,
  stream_position INTEGER NOT NULL DEFAULT 1,
  attendance_present_days INTEGER NOT NULL DEFAULT 0,
  attendance_total_days INTEGER NOT NULL DEFAULT 0,
  class_teacher_remarks TEXT,
  principal_remarks TEXT,
  term_closing_date DATE,
  next_term_opening_date DATE,
  fee_balance_next_term NUMERIC NOT NULL DEFAULT 0,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_handbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_clearance_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drm_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretary_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

-- Read policies for public/students
DROP POLICY IF EXISTS "Public can view departments" ON public.departments;
CREATE POLICY "Public can view departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view faculty" ON public.faculty_teachers;
CREATE POLICY "Public can view faculty" ON public.faculty_teachers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can read academic handbooks" ON public.academic_handbooks;
CREATE POLICY "Authenticated users can read academic handbooks" ON public.academic_handbooks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view course units" ON public.course_units;
CREATE POLICY "Public can view course units" ON public.course_units FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view timetable" ON public.timetable_periods;
CREATE POLICY "Public can view timetable" ON public.timetable_periods FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view published exams" ON public.exam_sessions;
CREATE POLICY "Public can view published exams" ON public.exam_sessions FOR SELECT USING (true);

-- Student own data policies
DROP POLICY IF EXISTS "Students can view own biometric passes" ON public.biometric_clearance_passes;
CREATE POLICY "Students can view own biometric passes" ON public.biometric_clearance_passes
  FOR SELECT USING (student_id = auth.uid()::text OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Students can view own unit registrations" ON public.unit_registrations;
CREATE POLICY "Students can view own unit registrations" ON public.unit_registrations
  FOR SELECT USING (student_id = auth.uid()::text OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Students can view own report cards" ON public.report_cards;
CREATE POLICY "Students can view own report cards" ON public.report_cards
  FOR SELECT USING (student_id = auth.uid()::text OR auth.uid() IS NOT NULL);

-- Staff Full Access Policies
DROP POLICY IF EXISTS "Staff can manage departments" ON public.departments;
CREATE POLICY "Staff can manage departments" ON public.departments
  FOR ALL USING (public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Staff can manage faculty" ON public.faculty_teachers;
CREATE POLICY "Staff can manage faculty" ON public.faculty_teachers
  FOR ALL USING (public.get_auth_role() IN ('admin'));

DROP POLICY IF EXISTS "Staff can manage academic handbooks" ON public.academic_handbooks;
CREATE POLICY "Staff can manage academic handbooks" ON public.academic_handbooks
  FOR ALL USING (public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Staff can manage course units" ON public.course_units;
CREATE POLICY "Staff can manage course units" ON public.course_units
  FOR ALL USING (public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Staff can manage timetable" ON public.timetable_periods;
CREATE POLICY "Staff can manage timetable" ON public.timetable_periods
  FOR ALL USING (public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Staff can manage exams and reports" ON public.exam_sessions;
CREATE POLICY "Staff can manage exams and reports" ON public.exam_sessions
  FOR ALL USING (public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Staff can manage report cards" ON public.report_cards;
CREATE POLICY "Staff can manage report cards" ON public.report_cards
  FOR ALL USING (public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Bursar and Admin manage clearance passes" ON public.biometric_clearance_passes;
CREATE POLICY "Bursar and Admin manage clearance passes" ON public.biometric_clearance_passes
  FOR ALL USING (public.get_auth_role() IN ('admin', 'bursar'));

DROP POLICY IF EXISTS "Anyone can log DRM security events" ON public.drm_security_events;
CREATE POLICY "Anyone can log DRM security events" ON public.drm_security_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view DRM security events" ON public.drm_security_events;
CREATE POLICY "Admin can view DRM security events" ON public.drm_security_events
  FOR SELECT USING (public.get_auth_role() IN ('admin'));

DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.secretary_inquiries;
CREATE POLICY "Anyone can submit inquiry" ON public.secretary_inquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can manage inquiries" ON public.secretary_inquiries;
CREATE POLICY "Staff can manage inquiries" ON public.secretary_inquiries
  FOR ALL USING (public.get_auth_role() IN ('admin', 'bursar'));

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_handbooks_discipline ON public.academic_handbooks(discipline);
CREATE INDEX IF NOT EXISTS idx_biometric_student ON public.biometric_clearance_passes(student_id);
CREATE INDEX IF NOT EXISTS idx_biometric_code ON public.biometric_clearance_passes(clearance_code);
CREATE INDEX IF NOT EXISTS idx_unit_reg_student ON public.unit_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_timetable_class ON public.timetable_periods(class_id);
CREATE INDEX IF NOT EXISTS idx_report_cards_student ON public.report_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_drm_events_type ON public.drm_security_events(event_type, created_at DESC);
