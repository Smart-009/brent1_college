-- ============================================================
-- Éclat Institute — Enterprise Database Security Hardening
-- Migration 005: Strict Row Level Security (RLS) & Role Access Control
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mxfuivzgcnxwyslrmzqa/sql
-- ============================================================

-- 1. Helper function to check caller role securely
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Secure Profiles Table
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;
CREATE POLICY "Public can view basic profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.get_auth_role() = 'admin')
  WITH CHECK (auth.uid() = id OR public.get_auth_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR public.get_auth_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE
  USING (public.get_auth_role() = 'admin');

-- 3. Secure Courses & Classes Table
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true OR public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Staff can manage courses" ON public.courses;
CREATE POLICY "Staff can manage courses" ON public.courses
  FOR ALL
  USING (public.get_auth_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Anyone can view classes" ON public.classes;
CREATE POLICY "Anyone can view classes" ON public.classes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage classes" ON public.classes;
CREATE POLICY "Staff can manage classes" ON public.classes
  FOR ALL
  USING (public.get_auth_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_auth_role() IN ('admin', 'teacher'));

-- 4. Secure Lessons & Resources Table
ALTER TABLE IF EXISTS public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lesson_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view lessons" ON public.lessons;
CREATE POLICY "Students can view lessons" ON public.lessons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage lessons" ON public.lessons;
CREATE POLICY "Staff can manage lessons" ON public.lessons
  FOR ALL
  USING (public.get_auth_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Students can view lesson resources" ON public.lesson_resources;
CREATE POLICY "Students can view lesson resources" ON public.lesson_resources
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage lesson resources" ON public.lesson_resources;
CREATE POLICY "Staff can manage lesson resources" ON public.lesson_resources
  FOR ALL
  USING (public.get_auth_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_auth_role() IN ('admin', 'teacher'));

-- 5. Secure Enrollments & Quiz Progress
ALTER TABLE IF EXISTS public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT
  USING (student_id = auth.uid() OR public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Students can update own progress" ON public.enrollments;
CREATE POLICY "Students can update own progress" ON public.enrollments
  FOR ALL
  USING (student_id = auth.uid() OR public.get_auth_role() IN ('admin', 'teacher'))
  WITH CHECK (student_id = auth.uid() OR public.get_auth_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Students can submit quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Students can submit quiz attempts" ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (student_id = auth.uid() OR public.get_auth_role() IS NOT NULL);

DROP POLICY IF EXISTS "Students can view own quiz results" ON public.quiz_attempts;
CREATE POLICY "Students can view own quiz results" ON public.quiz_attempts
  FOR SELECT
  USING (student_id = auth.uid() OR public.get_auth_role() IN ('admin', 'teacher'));

-- 6. Secure Financial & Bursar Records
ALTER TABLE IF EXISTS public.fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own invoices" ON public.fee_invoices;
CREATE POLICY "Students view own invoices" ON public.fee_invoices
  FOR SELECT
  USING (student_id = auth.uid()::text OR public.get_auth_role() IN ('admin', 'bursar'));

DROP POLICY IF EXISTS "Bursars manage invoices" ON public.fee_invoices;
CREATE POLICY "Bursars manage invoices" ON public.fee_invoices
  FOR ALL
  USING (public.get_auth_role() IN ('admin', 'bursar'))
  WITH CHECK (public.get_auth_role() IN ('admin', 'bursar'));

DROP POLICY IF EXISTS "Students view own payments" ON public.fee_payments;
CREATE POLICY "Students view own payments" ON public.fee_payments
  FOR SELECT
  USING (student_id = auth.uid()::text OR public.get_auth_role() IN ('admin', 'bursar'));

DROP POLICY IF EXISTS "Bursars manage payments" ON public.fee_payments;
CREATE POLICY "Bursars manage payments" ON public.fee_payments
  FOR ALL
  USING (public.get_auth_role() IN ('admin', 'bursar'))
  WITH CHECK (public.get_auth_role() IN ('admin', 'bursar'));
