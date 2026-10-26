-- ============================================================================
-- StudyFlow / Student Task Manager: Secure Supabase Database Schema
-- ============================================================================
-- Safe to rerun on both brand-new or existing databases.
-- Does NOT drop or truncate any existing tables or rows.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. COURSES TABLE & SAFE MIGRATIONS
-- ----------------------------------------------------------------------------
-- Hybrid design:
-- - Shared system courses have user_id = NULL (read-only for all students)
-- - Custom courses created by students have user_id = auth.uid()
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Migration: Ensure user_id column exists if table was created previously
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- 2. TASKS TABLE & SAFE MIGRATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'assignment', -- 'assignment', 'exam', 'lab', 'project', 'reading', 'presentation'
  due_date TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'completed'
  estimated_minutes INTEGER DEFAULT 60,
  weight NUMERIC(5,2),
  notes TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Migrations: Ensure all expected columns exist if table was created previously
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 60;
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2);
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ----------------------------------------------------------------------------
-- 3. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
-- Fast user isolation, status filtering, and chronological sorting
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);

-- ----------------------------------------------------------------------------
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 5. CLEAN UP INSECURE & LEGACY POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access on courses" ON public.courses;
DROP POLICY IF EXISTS "Public full access on tasks" ON public.tasks;
DROP POLICY IF EXISTS "Courses access policy" ON public.courses;
DROP POLICY IF EXISTS "Tasks access policy" ON public.tasks;
DROP POLICY IF EXISTS "Users can read courses" ON public.courses;
DROP POLICY IF EXISTS "Users can create courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update courses" ON public.courses;
DROP POLICY IF EXISTS "Users can delete courses" ON public.courses;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;

-- ----------------------------------------------------------------------------
-- 6. SECURE RLS POLICIES FOR COURSES
-- ----------------------------------------------------------------------------
-- A. Any authenticated student can read:
--    1) Shared catalog courses (user_id IS NULL)
--    2) Their own custom courses (user_id = auth.uid())
CREATE POLICY "Users can read courses" 
  ON public.courses 
  FOR SELECT 
  TO authenticated 
  USING (user_id IS NULL OR user_id = auth.uid());

-- B. Students can create their own custom courses
CREATE POLICY "Users can create courses" 
  ON public.courses 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- C. Students can only update their own custom courses (system courses remain protected)
CREATE POLICY "Users can update courses" 
  ON public.courses 
  FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- D. Students can only delete their own custom courses
CREATE POLICY "Users can delete courses" 
  ON public.courses 
  FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 7. SECURE RLS POLICIES FOR TASKS (STRICT USER ISOLATION)
-- ----------------------------------------------------------------------------
-- A. SELECT: Students can only query their own tasks
CREATE POLICY "Users can view own tasks" 
  ON public.tasks 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

-- B. INSERT: Students can only insert tasks where user_id matches their authenticated UID
CREATE POLICY "Users can insert own tasks" 
  ON public.tasks 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- C. UPDATE: Students can only update their own tasks
CREATE POLICY "Users can update own tasks" 
  ON public.tasks 
  FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- D. DELETE: Students can only delete their own tasks
CREATE POLICY "Users can delete own tasks" 
  ON public.tasks 
  FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 8. DEFAULT SHARED SAMPLE COURSES (GLOBAL TEMPLATES)
-- ----------------------------------------------------------------------------
-- Default courses have user_id = NULL, making them shared templates for all students
INSERT INTO public.courses (id, user_id, code, name, color)
VALUES
  ('cs101', NULL, 'CS 101', 'Computer Science & Data Structures', '#6366f1'),
  ('math201', NULL, 'MATH 201', 'Calculus & Linear Algebra', '#0284c7'),
  ('phys102', NULL, 'PHYS 102', 'Physics: Electromagnetism', '#059669'),
  ('eng210', NULL, 'ENG 210', 'Academic Writing & Research', '#d97706'),
  ('bio105', NULL, 'BIO 105', 'Molecular Biology & Genetics', '#e11d48')
ON CONFLICT (id) DO NOTHING;
