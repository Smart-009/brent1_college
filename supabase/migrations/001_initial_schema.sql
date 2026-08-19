-- ============================================================
-- Brent College LMS — Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- -------------------------
-- EXTENSIONS
-- -------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------
-- PROFILES (extends auth.users)
-- -------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  admission_number TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'bursar', 'parent')),
  first_login_at TIMESTAMPTZ,
  access_expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------
-- SUBJECTS
-- -------------------------
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color_hex TEXT NOT NULL DEFAULT '#243A8E',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------
-- SCHOOL TERMS
-- -------------------------
CREATE TABLE IF NOT EXISTS school_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,          -- e.g. "Term 1", "Term 2", "Term 3"
  academic_year TEXT NOT NULL, -- e.g. "2026"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  half_term_start DATE,
  half_term_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------
-- CLASSES (grade groups)
-- -------------------------
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,           -- e.g. "Grade 8A", "Form 2"
  grade_level TEXT,             -- e.g. "Grade 8", "Form 2"
  academic_year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------
-- CLASS ENROLLMENTS (student ↔ class)
-- -------------------------
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- -------------------------
-- TEACHER SUBJECTS (teacher ↔ class ↔ subject)
-- -------------------------
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id, class_id)
);

-- -------------------------
-- COURSES
-- -------------------------
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------
-- LESSONS
-- -------------------------
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edit_locked_at TIMESTAMPTZ
);

-- -------------------------
-- LESSON RESOURCES (PDF notes etc.)
-- -------------------------
CREATE TABLE IF NOT EXISTS lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'application/pdf',
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edit_locked_at TIMESTAMPTZ
);

-- -------------------------
-- QUIZZES (multiple questions per lesson)
-- -------------------------
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,           -- Array of 4 option strings
  correct_option_index INTEGER NOT NULL CHECK (correct_option_index BETWEEN 0 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop unique constraint on lesson_id if it exists from older schema
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_lesson_id_key;

-- -------------------------
-- QUIZ ATTEMPTS
-- -------------------------
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  selected_option INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------
-- ENROLLMENTS / PROGRESS
-- -------------------------
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_lesson_ids UUID[] NOT NULL DEFAULT '{}',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

-- -------------------------
-- ACTIVATION CODES
-- -------------------------
CREATE TABLE IF NOT EXISTS activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  duration_days INTEGER NOT NULL DEFAULT 30,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ  -- NULL until redeemed
);

-- -------------------------
-- ATTENDANCE
-- -------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id, date)
);

-- -------------------------
-- ANNOUNCEMENTS
-- -------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target TEXT NOT NULL DEFAULT 'all',  -- 'all', 'students', 'teachers', or a class_id UUID
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- -------------------------
-- IN-APP NOTIFICATIONS
-- -------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Realtime for notifications safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- -------------------------
-- BADGES
-- -------------------------
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_emoji TEXT NOT NULL DEFAULT '🏅',
  criteria_type TEXT NOT NULL,  -- 'first_lesson', 'streak', 'course_complete', 'perfect_score', 'lessons_count'
  criteria_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------
-- STUDENT BADGES (awards)
-- -------------------------
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- -------------------------
-- STREAKS
-- -------------------------
CREATE TABLE IF NOT EXISTS streaks (
  student_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE
);

-- -------------------------
-- TRIGGER FUNCTION: 24h Edit Lock
-- -------------------------
CREATE OR REPLACE FUNCTION set_edit_lock_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  NEW.edit_locked_at := NEW.created_at + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_lessons_edit_lock ON lessons;
CREATE TRIGGER set_lessons_edit_lock
  BEFORE INSERT ON lessons
  FOR EACH ROW EXECUTE FUNCTION set_edit_lock_time();

DROP TRIGGER IF EXISTS set_resources_edit_lock ON lesson_resources;
CREATE TRIGGER set_resources_edit_lock
  BEFORE INSERT ON lesson_resources
  FOR EACH ROW EXECUTE FUNCTION set_edit_lock_time();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing policies before recreating to prevent collision
DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
  DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
  DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
  DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;

  -- Subjects
  DROP POLICY IF EXISTS "subjects_read_all" ON subjects;
  DROP POLICY IF EXISTS "subjects_admin_write" ON subjects;

  -- Terms
  DROP POLICY IF EXISTS "terms_read_all" ON school_terms;
  DROP POLICY IF EXISTS "terms_admin_write" ON school_terms;

  -- Classes
  DROP POLICY IF EXISTS "classes_read_auth" ON classes;
  DROP POLICY IF EXISTS "classes_admin_write" ON classes;

  -- Class Enrollments
  DROP POLICY IF EXISTS "ce_student_own" ON class_enrollments;
  DROP POLICY IF EXISTS "ce_teacher_read" ON class_enrollments;
  DROP POLICY IF EXISTS "ce_admin_all" ON class_enrollments;

  -- Teacher Subjects
  DROP POLICY IF EXISTS "ts_read_auth" ON teacher_subjects;
  DROP POLICY IF EXISTS "ts_admin_all" ON teacher_subjects;

  -- Courses
  DROP POLICY IF EXISTS "courses_read_all" ON courses;
  DROP POLICY IF EXISTS "courses_teacher_insert" ON courses;
  DROP POLICY IF EXISTS "courses_teacher_update" ON courses;
  DROP POLICY IF EXISTS "courses_teacher_delete" ON courses;
  DROP POLICY IF EXISTS "courses_admin_all" ON courses;

  -- Lessons
  DROP POLICY IF EXISTS "lessons_read_all" ON lessons;
  DROP POLICY IF EXISTS "lessons_teacher_insert" ON lessons;
  DROP POLICY IF EXISTS "lessons_teacher_update_24h" ON lessons;
  DROP POLICY IF EXISTS "lessons_teacher_delete_24h" ON lessons;
  DROP POLICY IF EXISTS "lessons_admin_all" ON lessons;

  -- Lesson Resources
  DROP POLICY IF EXISTS "lr_read_all" ON lesson_resources;
  DROP POLICY IF EXISTS "lr_teacher_insert" ON lesson_resources;
  DROP POLICY IF EXISTS "lr_teacher_update_24h" ON lesson_resources;
  DROP POLICY IF EXISTS "lr_teacher_delete_24h" ON lesson_resources;
  DROP POLICY IF EXISTS "lr_admin_all" ON lesson_resources;

  -- Quizzes
  DROP POLICY IF EXISTS "quizzes_read_all" ON quizzes;
  DROP POLICY IF EXISTS "quizzes_teacher_write" ON quizzes;
  DROP POLICY IF EXISTS "quizzes_teacher_update" ON quizzes;
  DROP POLICY IF EXISTS "quizzes_admin_all" ON quizzes;

  -- Quiz Attempts
  DROP POLICY IF EXISTS "qa_student_own" ON quiz_attempts;
  DROP POLICY IF EXISTS "qa_student_insert" ON quiz_attempts;
  DROP POLICY IF EXISTS "qa_teacher_read" ON quiz_attempts;
  DROP POLICY IF EXISTS "qa_admin_all" ON quiz_attempts;

  -- Enrollments
  DROP POLICY IF EXISTS "enroll_student_own" ON enrollments;
  DROP POLICY IF EXISTS "enroll_student_insert" ON enrollments;
  DROP POLICY IF EXISTS "enroll_student_update" ON enrollments;
  DROP POLICY IF EXISTS "enroll_teacher_read" ON enrollments;
  DROP POLICY IF EXISTS "enroll_admin_all" ON enrollments;

  -- Activation Codes
  DROP POLICY IF EXISTS "ac_student_own" ON activation_codes;
  DROP POLICY IF EXISTS "ac_admin_all" ON activation_codes;

  -- Attendance
  DROP POLICY IF EXISTS "att_student_own" ON attendance;
  DROP POLICY IF EXISTS "att_teacher_all" ON attendance;
  DROP POLICY IF EXISTS "att_admin_all" ON attendance;

  -- Announcements
  DROP POLICY IF EXISTS "ann_read_auth" ON announcements;
  DROP POLICY IF EXISTS "ann_teacher_write" ON announcements;
  DROP POLICY IF EXISTS "ann_author_update" ON announcements;
  DROP POLICY IF EXISTS "ann_admin_all" ON announcements;

  -- Notifications
  DROP POLICY IF EXISTS "notif_own" ON notifications;
  DROP POLICY IF EXISTS "notif_admin_insert" ON notifications;

  -- Badges
  DROP POLICY IF EXISTS "badges_read_all" ON badges;
  DROP POLICY IF EXISTS "badges_admin_write" ON badges;

  -- Student Badges
  DROP POLICY IF EXISTS "sb_own_read" ON student_badges;
  DROP POLICY IF EXISTS "sb_teacher_read" ON student_badges;
  DROP POLICY IF EXISTS "sb_admin_all" ON student_badges;

  -- Streaks
  DROP POLICY IF EXISTS "streaks_own" ON streaks;
  DROP POLICY IF EXISTS "streaks_teacher_read" ON streaks;
  DROP POLICY IF EXISTS "streaks_admin_all" ON streaks;
END $$;

-- -------------------------
-- PROFILES policies
-- -------------------------
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT USING (get_my_role() IN ('admin', 'teacher'));
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- SUBJECTS — public read, admin write
-- -------------------------
CREATE POLICY "subjects_read_all" ON subjects FOR SELECT USING (TRUE);
CREATE POLICY "subjects_admin_write" ON subjects FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- SCHOOL TERMS — public read, admin write
-- -------------------------
CREATE POLICY "terms_read_all" ON school_terms FOR SELECT USING (TRUE);
CREATE POLICY "terms_admin_write" ON school_terms FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- CLASSES — auth read, admin write
-- -------------------------
CREATE POLICY "classes_read_auth" ON classes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "classes_admin_write" ON classes FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- CLASS ENROLLMENTS
-- -------------------------
CREATE POLICY "ce_student_own" ON class_enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "ce_teacher_read" ON class_enrollments FOR SELECT USING (get_my_role() IN ('teacher', 'admin'));
CREATE POLICY "ce_admin_all" ON class_enrollments FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- TEACHER SUBJECTS
-- -------------------------
CREATE POLICY "ts_read_auth" ON teacher_subjects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "ts_admin_all" ON teacher_subjects FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- COURSES — public read, teacher own write, admin all
-- -------------------------
CREATE POLICY "courses_read_all" ON courses FOR SELECT USING (TRUE);
CREATE POLICY "courses_teacher_insert" ON courses FOR INSERT WITH CHECK (
  get_my_role() = 'teacher' AND teacher_id = auth.uid()
);
CREATE POLICY "courses_teacher_update" ON courses FOR UPDATE USING (
  get_my_role() = 'teacher' AND teacher_id = auth.uid()
);
CREATE POLICY "courses_teacher_delete" ON courses FOR DELETE USING (
  get_my_role() = 'teacher' AND teacher_id = auth.uid()
);
CREATE POLICY "courses_admin_all" ON courses FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- LESSONS — public read, teacher own within 24h, admin all
-- -------------------------
CREATE POLICY "lessons_read_all" ON lessons FOR SELECT USING (TRUE);
CREATE POLICY "lessons_teacher_insert" ON lessons FOR INSERT WITH CHECK (
  get_my_role() = 'teacher' AND
  (SELECT teacher_id FROM courses WHERE id = course_id) = auth.uid()
);
CREATE POLICY "lessons_teacher_update_24h" ON lessons FOR UPDATE USING (
  get_my_role() = 'teacher' AND
  (SELECT teacher_id FROM courses WHERE id = course_id) = auth.uid() AND
  NOW() < edit_locked_at
);
CREATE POLICY "lessons_teacher_delete_24h" ON lessons FOR DELETE USING (
  get_my_role() = 'teacher' AND
  (SELECT teacher_id FROM courses WHERE id = course_id) = auth.uid() AND
  NOW() < edit_locked_at
);
CREATE POLICY "lessons_admin_all" ON lessons FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- LESSON RESOURCES
-- -------------------------
CREATE POLICY "lr_read_all" ON lesson_resources FOR SELECT USING (TRUE);
CREATE POLICY "lr_teacher_insert" ON lesson_resources FOR INSERT WITH CHECK (
  get_my_role() = 'teacher' AND uploaded_by = auth.uid()
);
CREATE POLICY "lr_teacher_update_24h" ON lesson_resources FOR UPDATE USING (
  get_my_role() = 'teacher' AND uploaded_by = auth.uid() AND NOW() < edit_locked_at
);
CREATE POLICY "lr_teacher_delete_24h" ON lesson_resources FOR DELETE USING (
  get_my_role() = 'teacher' AND uploaded_by = auth.uid() AND NOW() < edit_locked_at
);
CREATE POLICY "lr_admin_all" ON lesson_resources FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- QUIZZES — public read, teacher own, admin all
-- -------------------------
CREATE POLICY "quizzes_read_all" ON quizzes FOR SELECT USING (TRUE);
CREATE POLICY "quizzes_teacher_write" ON quizzes FOR INSERT WITH CHECK (get_my_role() = 'teacher');
CREATE POLICY "quizzes_teacher_update" ON quizzes FOR UPDATE USING (get_my_role() = 'teacher');
CREATE POLICY "quizzes_admin_all" ON quizzes FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- QUIZ ATTEMPTS — own read/write, teacher read for their courses
-- -------------------------
CREATE POLICY "qa_student_own" ON quiz_attempts FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "qa_student_insert" ON quiz_attempts FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "qa_teacher_read" ON quiz_attempts FOR SELECT USING (get_my_role() = 'teacher');
CREATE POLICY "qa_admin_all" ON quiz_attempts FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- ENROLLMENTS — own read/write, teacher read, admin all
-- -------------------------
CREATE POLICY "enroll_student_own" ON enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "enroll_student_insert" ON enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "enroll_student_update" ON enrollments FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "enroll_teacher_read" ON enrollments FOR SELECT USING (get_my_role() = 'teacher');
CREATE POLICY "enroll_admin_all" ON enrollments FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- ACTIVATION CODES — own student read, admin all
-- -------------------------
CREATE POLICY "ac_student_own" ON activation_codes FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "ac_admin_all" ON activation_codes FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- ATTENDANCE — student own, teacher write/read, admin all
-- -------------------------
CREATE POLICY "att_student_own" ON attendance FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "att_teacher_all" ON attendance FOR ALL USING (get_my_role() = 'teacher');
CREATE POLICY "att_admin_all" ON attendance FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- ANNOUNCEMENTS — auth read, teacher/admin write
-- -------------------------
CREATE POLICY "ann_read_auth" ON announcements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "ann_teacher_write" ON announcements FOR INSERT WITH CHECK (get_my_role() IN ('teacher', 'admin'));
CREATE POLICY "ann_author_update" ON announcements FOR UPDATE USING (author_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "ann_admin_all" ON announcements FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- NOTIFICATIONS — own only
-- -------------------------
CREATE POLICY "notif_own" ON notifications FOR ALL USING (user_id = auth.uid());
CREATE POLICY "notif_admin_insert" ON notifications FOR INSERT WITH CHECK (get_my_role() = 'admin');

-- -------------------------
-- BADGES — public read, admin write
-- -------------------------
CREATE POLICY "badges_read_all" ON badges FOR SELECT USING (TRUE);
CREATE POLICY "badges_admin_write" ON badges FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- STUDENT BADGES — own read, system write
-- -------------------------
CREATE POLICY "sb_own_read" ON student_badges FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "sb_teacher_read" ON student_badges FOR SELECT USING (get_my_role() IN ('teacher', 'admin'));
CREATE POLICY "sb_admin_all" ON student_badges FOR ALL USING (get_my_role() = 'admin');

-- -------------------------
-- STREAKS — own read/update, admin all
-- -------------------------
CREATE POLICY "streaks_own" ON streaks FOR ALL USING (student_id = auth.uid());
CREATE POLICY "streaks_teacher_read" ON streaks FOR SELECT USING (get_my_role() = 'teacher');
CREATE POLICY "streaks_admin_all" ON streaks FOR ALL USING (get_my_role() = 'admin');

-- ============================================================
-- SEED DATA — Badges
-- ============================================================
INSERT INTO badges (name, description, icon_emoji, criteria_type, criteria_value) VALUES
  ('First Step',      'Complete your first lesson',            '🎯', 'first_lesson',     1),
  ('On Fire',         'Achieve a 7-day login streak',          '🔥', 'streak',            7),
  ('Course Champion', 'Complete a full course',                '⭐', 'course_complete',   1),
  ('Perfect Score',   'Score 100% on a quiz (first attempt)',  '💯', 'perfect_score',     1),
  ('Bookworm',        'Complete 5 lessons total',              '📚', 'lessons_count',     5)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, admission_number, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'admission_number', NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    admission_number = EXCLUDED.admission_number,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNCTION: Award badge to student
-- ============================================================
CREATE OR REPLACE FUNCTION award_badge(p_student_id UUID, p_criteria_type TEXT)
RETURNS VOID AS $$
DECLARE
  v_badge badges%ROWTYPE;
  v_count INTEGER;
BEGIN
  FOR v_badge IN SELECT * FROM badges WHERE criteria_type = p_criteria_type LOOP
    -- Check if already awarded
    IF NOT EXISTS (
      SELECT 1 FROM student_badges 
      WHERE student_id = p_student_id AND badge_id = v_badge.id
    ) THEN
      -- Check criteria
      CASE v_badge.criteria_type
        WHEN 'first_lesson' THEN
          SELECT COUNT(*) INTO v_count 
          FROM enrollments 
          WHERE student_id = p_student_id AND cardinality(completed_lesson_ids) >= 1;
          IF v_count > 0 THEN
            INSERT INTO student_badges (student_id, badge_id) VALUES (p_student_id, v_badge.id)
            ON CONFLICT (student_id, badge_id) DO NOTHING;
          END IF;
        WHEN 'lessons_count' THEN
          SELECT COALESCE(SUM(cardinality(completed_lesson_ids)), 0) INTO v_count
          FROM enrollments WHERE student_id = p_student_id;
          IF v_count >= v_badge.criteria_value THEN
            INSERT INTO student_badges (student_id, badge_id) VALUES (p_student_id, v_badge.id)
            ON CONFLICT (student_id, badge_id) DO NOTHING;
          END IF;
        WHEN 'course_complete' THEN
          SELECT COUNT(*) INTO v_count 
          FROM enrollments 
          WHERE student_id = p_student_id AND completed_at IS NOT NULL;
          IF v_count >= v_badge.criteria_value THEN
            INSERT INTO student_badges (student_id, badge_id) VALUES (p_student_id, v_badge.id)
            ON CONFLICT (student_id, badge_id) DO NOTHING;
          END IF;
        ELSE NULL;
      END CASE;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
