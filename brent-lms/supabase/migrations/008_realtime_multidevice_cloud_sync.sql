-- ============================================================
-- clat Institute  Migration 008: Multi-Device Realtime Cloud Sync
-- Enables seamless cross-device synchronization between mobile, laptop & desktop
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/mxfuivzgcnxwyslrmzqa/sql
-- ============================================================

-- 1. Create Universal Cloud State Sync Table
CREATE TABLE IF NOT EXISTS public.app_cloud_sync (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

ALTER TABLE public.app_cloud_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_cloud_sync_read_all" ON public.app_cloud_sync;
CREATE POLICY "app_cloud_sync_read_all" ON public.app_cloud_sync
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "app_cloud_sync_write_all" ON public.app_cloud_sync;
CREATE POLICY "app_cloud_sync_write_all" ON public.app_cloud_sync
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Upgrade library_resources Table (Remove check constraints & add metadata)
CREATE TABLE IF NOT EXISTS public.library_resources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL DEFAULT 'Short Course / Certificate',
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size TEXT,
  file_type TEXT NOT NULL DEFAULT 'PDF',
  downloads_count INTEGER NOT NULL DEFAULT 0,
  year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  uploaded_by TEXT,
  uploaded_by_id UUID,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop any legacy CHECK constraints on category or file_type that prevented dynamic categories / comics / office docs
DO $$
BEGIN
  ALTER TABLE public.library_resources DROP CONSTRAINT IF EXISTS library_resources_category_check;
  ALTER TABLE public.library_resources DROP CONSTRAINT IF EXISTS library_resources_file_type_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Add description and tags columns if they don't already exist
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.library_resources ADD COLUMN IF NOT EXISTS class_level TEXT DEFAULT 'Short Course / Certificate';

-- Upgrade library_resources RLS for seamless cross-device reads & writes
ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lib_resources_read_all" ON public.library_resources;
CREATE POLICY "lib_resources_read_all" ON public.library_resources
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "lib_resources_write_all" ON public.library_resources;
CREATE POLICY "lib_resources_write_all" ON public.library_resources
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Ensure Courses & Lessons RLS allows cross-device persistence
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "courses_read_all" ON public.courses;
    CREATE POLICY "courses_read_all" ON public.courses FOR SELECT USING (true);
    DROP POLICY IF EXISTS "courses_write_all" ON public.courses;
    CREATE POLICY "courses_write_all" ON public.courses FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lessons') THEN
    ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "lessons_read_all" ON public.lessons;
    CREATE POLICY "lessons_read_all" ON public.lessons FOR SELECT USING (true);
    DROP POLICY IF EXISTS "lessons_write_all" ON public.lessons;
    CREATE POLICY "lessons_write_all" ON public.lessons FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'announcements') THEN
    ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "announcements_read_all" ON public.announcements;
    CREATE POLICY "announcements_read_all" ON public.announcements FOR SELECT USING (true);
    DROP POLICY IF EXISTS "announcements_write_all" ON public.announcements;
    CREATE POLICY "announcements_write_all" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'intake_schedules') THEN
    ALTER TABLE public.intake_schedules ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "intake_schedules_read_all" ON public.intake_schedules;
    CREATE POLICY "intake_schedules_read_all" ON public.intake_schedules FOR SELECT USING (true);
    DROP POLICY IF EXISTS "intake_schedules_write_all" ON public.intake_schedules;
    CREATE POLICY "intake_schedules_write_all" ON public.intake_schedules FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. Enable Supabase Realtime Publication for app_cloud_sync and library_resources
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.app_cloud_sync;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.library_resources;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
