-- ============================================================
-- Brent College LMS  E-Library & Academic Resources Migration
-- ============================================================

-- 1. Create library_resources table
CREATE TABLE IF NOT EXISTS library_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Past Papers', 'Revision Notes', 'Textbooks', 'Syllabus', 'Marking Schemes', 'Lab Manuals')),
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL DEFAULT 'Short Course / Certificate',
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size TEXT,
  file_type TEXT NOT NULL DEFAULT 'PDF' CHECK (file_type IN ('PDF', 'DOCX', 'PPTX', 'EPUB', 'ZIP', 'HTML')),
  downloads_count INTEGER NOT NULL DEFAULT 0,
  year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  uploaded_by TEXT,
  uploaded_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create index for fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_library_resources_category ON library_resources(category);
CREATE INDEX IF NOT EXISTS idx_library_resources_subject ON library_resources(subject);
CREATE INDEX IF NOT EXISTS idx_library_resources_created_at ON library_resources(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE library_resources ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "lib_resources_read_all" ON library_resources;
CREATE POLICY "lib_resources_read_all" ON library_resources
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "lib_resources_insert_admin_teacher" ON library_resources;
CREATE POLICY "lib_resources_insert_admin_teacher" ON library_resources
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      get_my_role() IN ('admin', 'teacher') OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    )
  );

DROP POLICY IF EXISTS "lib_resources_update_admin_teacher" ON library_resources;
CREATE POLICY "lib_resources_update_admin_teacher" ON library_resources
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      get_my_role() IN ('admin', 'teacher') OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    )
  );

DROP POLICY IF EXISTS "lib_resources_delete_admin" ON library_resources;
CREATE POLICY "lib_resources_delete_admin" ON library_resources
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND (
      get_my_role() = 'admin' OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- 5. Storage Bucket Configuration for E-Library Assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('library-resources', 'library-resources', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage Bucket Access Policies
DROP POLICY IF EXISTS "lib_storage_read_all" ON storage.objects;
CREATE POLICY "lib_storage_read_all" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'library-resources');

DROP POLICY IF EXISTS "lib_storage_insert_staff" ON storage.objects;
CREATE POLICY "lib_storage_insert_staff" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'library-resources' AND (
      auth.role() = 'authenticated' OR
      get_my_role() IN ('admin', 'teacher')
    )
  );

DROP POLICY IF EXISTS "lib_storage_delete_admin" ON storage.objects;
CREATE POLICY "lib_storage_delete_admin" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'library-resources' AND (
      auth.role() = 'authenticated' OR
      get_my_role() = 'admin'
    )
  );
