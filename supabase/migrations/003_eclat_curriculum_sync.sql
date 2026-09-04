-- ============================================================
-- clat Institute  Full Curriculum & Database Synchronization Migration
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/mxfuivzgcnxwyslrmzqa/sql)
-- ============================================================

-- 1. Ensure RLS Policies allow Public Read and Admin Management
ALTER TABLE IF EXISTS subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view subjects" ON subjects;
CREATE POLICY "Public can view subjects" ON subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view published courses" ON courses;
CREATE POLICY "Public can view published courses" ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view lessons" ON lessons;
CREATE POLICY "Public can view lessons" ON lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects;
CREATE POLICY "Admins can manage subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses" ON courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
CREATE POLICY "Admins can manage lessons" ON lessons FOR ALL USING (true) WITH CHECK (true);

-- 2. Allow teacher_id to be nullable on courses
ALTER TABLE IF EXISTS courses ALTER COLUMN teacher_id DROP NOT NULL;
ALTER TABLE IF EXISTS courses DROP CONSTRAINT IF EXISTS courses_teacher_id_fkey;

-- 3. Clear old high school subjects & Seed All 12 Accredited College Subjects
DELETE FROM teacher_subjects WHERE true;
DELETE FROM subjects WHERE name IN ('Integrated Science', 'Social Studies', 'IRE', 'Agriculture', 'Pre-Technical Studies', 'Mathematics');

INSERT INTO subjects (id, name, color_hex) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Full-Stack Web Development & Modern JavaScript', '#6366f1'),
  ('11111111-1111-1111-1111-111111111102', 'Python Programming, SQL & Data Analytics', '#0284c7'),
  ('11111111-1111-1111-1111-111111111103', 'Comprehensive Computer Packages & Digital Literacy', '#0f172a'),
  ('11111111-1111-1111-1111-111111111104', 'Cybersecurity Fundamentals & Ethical Defense', '#dc2626'),
  ('11111111-1111-1111-1111-111111111105', 'Computerized Accounting, QuickBooks & KRA iTax', '#b45309'),
  ('11111111-1111-1111-1111-111111111106', 'English Language & IELTS Academic / General Prep', '#2563eb'),
  ('11111111-1111-1111-1111-111111111107', 'Digital Marketing, Social Media & Content Creation', '#e11d48'),
  ('11111111-1111-1111-1111-111111111108', 'Graphics Design & Animation', '#9333ea'),
  ('11111111-1111-1111-1111-111111111109', 'French Language for Beginners & DELF Prep', '#3b82f6'),
  ('11111111-1111-1111-1111-111111111110', 'German Language for Work & Studies (Goethe Prep)', '#f59e0b'),
  ('11111111-1111-1111-1111-111111111111', 'Arabic Language & Islamic Calligraphy Basics', '#059669'),
  ('11111111-1111-1111-1111-111111111112', 'Kiswahili Sanifu & East African Business Fluency', '#16a34a')
ON CONFLICT (name) DO UPDATE SET color_hex = EXCLUDED.color_hex;

-- 4. Seed All 12 Accredited Courses
INSERT INTO courses (id, title, description, subject_id, is_published) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Full-Stack Web Development & Modern JavaScript', '100% Online: Master React 19, Node.js APIs, PostgreSQL database architecture, and cloud deployment.', '11111111-1111-1111-1111-111111111101', true),
  ('22222222-2222-2222-2222-222222222202', 'Python Programming, SQL & Data Analytics', '100% Online: Python data analysis, Pandas, SQL relational queries, and automated data visualization.', '11111111-1111-1111-1111-111111111102', true),
  ('22222222-2222-2222-2222-222222222203', 'Comprehensive Computer Packages & Digital Literacy', '100% Online: Ms Word, Excel Pro, PowerPoint presentations, Google Workspace, speed typing & Canva graphics.', '11111111-1111-1111-1111-111111111103', true),
  ('22222222-2222-2222-2222-222222222204', 'Cybersecurity Fundamentals & Ethical Defense', '100% Online: Threat detection, network security defense, password hashing, encryption & risk assessment.', '11111111-1111-1111-1111-111111111104', true),
  ('22222222-2222-2222-2222-222222222205', 'Computerized Accounting, QuickBooks & KRA iTax', '100% Online: QuickBooks Pro, monthly KRA iTax filing (VAT, PAYE), payroll computations & financial balance sheets.', '11111111-1111-1111-1111-111111111105', true),
  ('22222222-2222-2222-2222-222222222206', 'English Language & IELTS Academic / General Prep', '100% Online: Spoken English fluency, business correspondence, IELTS 7.5+ band strategies & exam preparation.', '11111111-1111-1111-1111-111111111106', true),
  ('22222222-2222-2222-2222-222222222207', 'Digital Marketing, Social Media & Content Creation', '100% Online: Meta Ads, TikTok & Instagram growth, SEO ranking, Google Ads, email funnels & influencer monetization.', '11111111-1111-1111-1111-111111111107', true),
  ('22222222-2222-2222-2222-222222222208', 'Graphics Design & Animation', 'Comprehensive online course in Graphics Design & Animation covering Canva, Adobe Photoshop, Illustrator, and motion graphics.', '11111111-1111-1111-1111-111111111108', true),
  ('22222222-2222-2222-2222-222222222209', 'French Language for Beginners & DELF Prep', '100% Online: Spoken French, listening comprehension, grammar, and international DELF examination prep.', '11111111-1111-1111-1111-111111111109', true),
  ('22222222-2222-2222-2222-222222222210', 'German Language for Work & Studies (Goethe Prep)', '100% Online: German grammar, conversational fluency, Goethe-Zertifikat A1/A2 preparation for work & university.', '11111111-1111-1111-1111-111111111110', true),
  ('22222222-2222-2222-2222-222222222211', 'Arabic Language & Islamic Calligraphy Basics', '100% Online: Modern Standard Arabic, conversational reading, vocabulary & Arabic calligraphy foundations.', '11111111-1111-1111-1111-111111111111', true),
  ('22222222-2222-2222-2222-222222222212', 'Kiswahili Sanifu & East African Business Fluency', '100% Online: Spoken Swahili fluency, business negotiations, translation & East African trade communication.', '11111111-1111-1111-1111-111111111112', true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- 5. Seed Core Video Lessons
INSERT INTO lessons (id, course_id, title, description, youtube_url, order_index) VALUES
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222208', 'Lesson 1: Introduction to Graphic Design & Tools Setup', 'Welcome to Graphics Design & Animation! In this session we explore core design theory, setup software and begin hands-on practical design.', 'https://www.youtube.com/watch?v=un50Bs4BvZ8', 1),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222208', 'Lesson 2: Mastering Canva Pro for Brand Kits', 'Practical workflow for creating high-impact brand kits, flyers, posters, and social media carousels in Canva.', 'https://www.youtube.com/watch?v=un50Bs4BvZ8', 2),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222208', 'Lesson 3: Adobe Photoshop Foundations & Layer Mastery', 'Deep dive into Photoshop layers, selection tools, masking, color grading, and commercial asset exports.', 'https://www.youtube.com/watch?v=un50Bs4BvZ8', 3),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222201', 'Lesson 1: Modern Web Architecture & Frontend Setup', 'Introduction to full-stack engineering, development tools setup, and modern JavaScript syntax.', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 1),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222202', 'Lesson 1: Python Fundamentals & Data Structures', 'Mastering Python syntax, variables, lists, dictionaries, and programmatic logic.', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 1),
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222204', 'Lesson 1: Network Security, Firewalls & Threat Analysis', 'Understanding attack vectors, packet inspection, and firewall defense strategies.', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 1)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, youtube_url = EXCLUDED.youtube_url;
