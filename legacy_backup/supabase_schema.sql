-- ============================================================================
-- ScholarFlow: Supabase Database Schema & Row Level Security (RLS) Setup
-- ============================================================================
-- Copy and run this script in your Supabase SQL Editor (Dashboard -> SQL Editor)

-- 1. Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'assignment',
  due_date TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo',
  estimated_minutes INTEGER DEFAULT 60,
  weight NUMERIC(5,2),
  notes TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Pomodoro / Study Stats Table
CREATE TABLE IF NOT EXISTS public.pomo_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  completed_blocks INTEGER NOT NULL DEFAULT 0,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 4. Enable Row Level Security (RLS) & Policies
-- ============================================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomo_stats ENABLE ROW LEVEL SECURITY;

-- Courses Policies (Users can only read/write their own courses, or anonymous session)
CREATE POLICY "Users can view their own courses" 
  ON public.courses FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own courses" 
  ON public.courses FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own courses" 
  ON public.courses FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own courses" 
  ON public.courses FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Tasks Policies
CREATE POLICY "Users can view their own tasks" 
  ON public.tasks FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own tasks" 
  ON public.tasks FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own tasks" 
  ON public.tasks FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own tasks" 
  ON public.tasks FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Pomodoro Stats Policies
CREATE POLICY "Users can view their own stats" 
  ON public.pomo_stats FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can upsert their own stats" 
  ON public.pomo_stats FOR ALL 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================================
-- 5. Realtime Publication (Optional - for cross-device live updates)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
