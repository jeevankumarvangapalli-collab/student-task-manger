# ScholarFlow: Supabase Cloud Database Setup

This directory contains the database schema, security policies, and client setup to connect ScholarFlow to Supabase for multi-device live synchronization.

---

## 🚀 Quick Setup Guide (5 Minutes)

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and log in or create a free account.
2. Click **New project**, choose an organization, give your project a name (e.g. `scholarflow-db`), and set a secure database password.
3. Select the region closest to you and click **Create new project**.

---

### Step 2: Run the SQL Schema Script
1. In your Supabase dashboard, navigate to the **SQL Editor** tab (icon on the left sidebar).
2. Click **New Query**.
3. Open `schema.sql` from this folder, copy all contents, paste it into the SQL Editor, and click **Run** (or `Ctrl+Enter`).
4. You will see:
   - `courses` table created with RLS enabled
   - `tasks` table created with RLS enabled
   - `pomo_stats` table created with RLS enabled
   - `chat_messages` table created with RLS enabled
   - Default starter courses and assignments seeded

---

### Step 3: Get Your API Credentials
1. In your Supabase dashboard, click the **Settings** gear icon (bottom left) -> **API** (or Project Settings -> Data API).
2. Copy the two values:
   - **Project URL**: e.g., `https://yourprojectid.supabase.co`
   - **Project API Anon Key**: e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI...`

---

### Step 4: Configure the Project

#### Option A: In the Backend (`/backend/.env`)
Copy `.env.example` to `.env` in the `backend/` folder:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://yourprojectid.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

#### Option B: Directly in the Frontend UI
1. Open ScholarFlow in your browser.
2. In the left sidebar, click the **Cloud Sync** widget (or gear icon).
3. Paste your **Supabase URL** and **Anon Key**.
4. Click **Test & Connect** -> **Push Local to Cloud**.

---

## 📁 Schema Overview

| Table | Description | Key Columns |
|---|---|---|
| `courses` | Academic courses and subject modules | `id`, `code`, `name`, `color`, `user_id` |
| `tasks` | Assignments, exams, labs, projects | `id`, `course_id`, `title`, `type`, `due_date`, `priority`, `status`, `subtasks` |
| `pomo_stats` | Pomodoro focus session minutes & streaks | `user_id`, `completed_blocks`, `total_minutes`, `streak` |
| `chat_messages` | DevBot AI chat history & generated task data | `id`, `role`, `content`, `metadata`, `created_at` |

---

## 🔒 Security (Row Level Security)
Row Level Security (RLS) is enabled on all tables.
The policies allow both authenticated Supabase Auth users and anonymous local sessions to securely manage their tasks.
