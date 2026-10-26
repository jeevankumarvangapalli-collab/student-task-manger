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
  type TEXT NOT NULL DEFAULT 'assignment', -- 'assignment', 'exam', 'lab', 'project', 'reading', 'extracurricular'
  due_date TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'completed'
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

-- 4. Create DevBot Chat Messages Table (for AI Chat History)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  role TEXT NOT NULL, -- 'user' or 'model'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 5. Enable Row Level Security (RLS) & Policies
-- ============================================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomo_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Courses Policies (Support authenticated users + anonymous demo sessions)
CREATE POLICY "Users can view courses" 
  ON public.courses FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

CREATE POLICY "Users can insert courses" 
  ON public.courses FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

CREATE POLICY "Users can update courses" 
  ON public.courses FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

CREATE POLICY "Users can delete courses" 
  ON public.courses FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

-- Tasks Policies
CREATE POLICY "Users can view tasks" 
  ON public.tasks FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

CREATE POLICY "Users can insert tasks" 
  ON public.tasks FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

CREATE POLICY "Users can update tasks" 
  ON public.tasks FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

CREATE POLICY "Users can delete tasks" 
  ON public.tasks FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

-- Pomodoro Stats Policies
CREATE POLICY "Users can view stats" 
  ON public.pomo_stats FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

CREATE POLICY "Users can upsert stats" 
  ON public.pomo_stats FOR ALL 
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

-- Chat Messages Policies
CREATE POLICY "Users can view chat messages" 
  ON public.chat_messages FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

CREATE POLICY "Users can insert chat messages" 
  ON public.chat_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

CREATE POLICY "Users can delete chat messages" 
  ON public.chat_messages FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

-- ============================================================================
-- 6. Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON public.tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON public.chat_messages(created_at);

-- ============================================================================
-- 7. Realtime Publication (Enables cross-device live sync)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'courses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;
END $$;

-- ============================================================================
-- 8. Starter Seed Data (Optional - run to populate sample courses & assignments)
-- ============================================================================
INSERT INTO public.courses (id, code, name, color) VALUES
  ('c1', 'CS 101', 'Intro to Algorithms & Data Structures', '#6366f1'),
  ('c2', 'MATH 201', 'Multivariable Calculus', '#ec4899'),
  ('c3', 'PHYS 150', 'Classical Mechanics & Lab', '#f59e0b'),
  ('c4', 'ENG 102', 'Academic Research & Composition', '#10b981'),
  ('c5', 'BIO 110', 'Cellular & Molecular Biology', '#06b6d4')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tasks (id, course_id, title, type, due_date, priority, status, estimated_minutes, weight, notes, subtasks) VALUES
  ('t1', 'c1', 'Problem Set 4: Graph Traversals & Dijkstra Algorithm', 'assignment', timezone('utc'::text, now()) + interval '4 hours', 'urgent', 'in_progress', 90, 15, 'Implement BFS, DFS and Dijkstra in Python. Submit on Gradescope with all 12 test assertions passing.', '[{"id":"s1","text":"Adjacency list graph representation","completed":true},{"id":"s2","text":"Implement priority queue for Dijkstra","completed":true},{"id":"s3","text":"Write cycle detection unit tests","completed":false}]'::jsonb),
  ('t2', 'c2', 'Midterm Exam Preparation & Formula Sheet', 'exam', timezone('utc'::text, now()) + interval '1 day', 'urgent', 'todo', 120, 25, 'Covers Partial derivatives, Lagrange multipliers, double and triple integrals in polar coordinates.', '[{"id":"s4","text":"Complete 2024 Practice Exam","completed":true},{"id":"s5","text":"Condense single-page handwritten reference sheet","completed":false}]'::jsonb),
  ('t3', 'c3', 'Weekly Physics Lab 5 Report: Damped Harmonic Motion', 'lab', timezone('utc'::text, now()) - interval '1 day', 'high', 'review', 75, 10, 'Include error bars and damping coefficient calculations from tracker video data.', '[{"id":"s6","text":"Plot oscillation decay curves in Python/Matplotlib","completed":true},{"id":"s7","text":"Draft discussion and error propagation section","completed":true}]'::jsonb),
  ('t4', 'c4', 'Term Research Essay Draft: AI Ethics in Healthcare', 'project', timezone('utc'::text, now()) + interval '4 days', 'high', 'todo', 180, 30, 'Minimum 2,500 words, MLA 9th edition format. Need at least 8 peer-reviewed academic citations.', '[{"id":"s8","text":"Formulate thesis statement and 4-point outline","completed":true},{"id":"s9","text":"Draft Introduction and Literature Review","completed":false},{"id":"s10","text":"Cite primary studies on diagnostic fairness","completed":false}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
