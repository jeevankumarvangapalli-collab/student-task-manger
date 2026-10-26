# 🎓 StudyFlow — Student Task & Academic Life Manager

A modern, responsive student task management web application built from scratch with **React 18**, **Vite**, **JavaScript**, **Tailwind CSS v3**, and **Supabase**.

---

## 🌟 Key Features

1. **Dashboard & Academic Overview**:
   - Live metrics: Total Active Tasks, Due Today & Overdue, High & Urgent Priority counter, Completed Tasks.
   - Dynamic SVG Semester Completion Rate ring.
2. **Comprehensive Task Management**:
   - Create, edit, duplicate, and delete tasks.
   - Course assignment (with color-coded subject pills).
   - Priority tagging: **Urgent (Red)**, **High (Amber)**, **Medium (Blue)**, **Low (Slate)**.
   - Category tags: **Assignment**, **Exam / Quiz**, **Lab Report**, **Term Project**, **Reading Prep**, **Presentation**.
   - Due date and time picker with human-readable relative countdowns ("Today at 11:59 PM", "Overdue by 2d", "In 3d").
   - Interactive checklist subtasks with progress tracking.
   - Grade contribution percentage and estimated study time.
   - Instant completion checkbox with celebratory confetti!
3. **Multiple Views**:
   - **Grid / Card View**: Interactive cards with subtask checklists and direct action menus.
   - **Kanban Board View**: Drag-free 3-column workflow (*To Do*, *In Progress*, *Completed*) with single-click status transitions.
   - **Table View**: Compact spreadsheet view for scanning multiple deadlines quickly.
4. **Smart Filters & Real-Time Search**:
   - Status tabs: All Tasks, To Do, In Progress, Completed, Overdue.
   - Subject / Course filter dropdown.
   - Priority filter dropdown.
   - Sort by: Due Date (Earliest / Latest), Priority (Highest), Title (A–Z), Recently Added.
   - Instant search across task titles, notes, course codes, and subtasks.
5. **Study Focus Pomodoro Timer**:
   - Built-in floating study timer with Focus (25m), Short Break (5m), and Long Break (15m).
   - Links directly to whichever task you choose to focus on.
6. **Dark / Light Theme**:
   - Seamless dark mode support using Tailwind CSS and `localStorage` persistence.
7. **Supabase Cloud Synchronization**:
   - Operates in **Local Demo Mode** by default so you can use it immediately without needing a database right away.
   - Complete step-by-step in-app connection guide with a live **"Test Connection"** diagnostic probe before saving.

---

## 🚀 Getting Started

### 1. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build for Production
```bash
npm run build
```

---

## 🗄️ Supabase Database Setup (Step-by-Step for Beginners)

StudyFlow is designed to be beginner friendly and never claims the database is connected before you test it.

### Step 1: Create a Free Supabase Account
1. Visit [supabase.com](https://supabase.com) and sign up (or sign in with GitHub).
2. Click **New Project** and name it (e.g. `student-task-manager`).

### Step 2: Run the SQL Schema Script
1. In your Supabase dashboard, click **SQL Editor** on the left menu.
2. Click **New Query**.
3. Open `supabase_schema.sql` in this project folder, copy its contents, paste them into the SQL editor, and click **Run**.
4. This creates the `courses` and `tasks` tables with sample academic courses.

### Step 3: Connect to StudyFlow
1. In your Supabase project dashboard, click the gear icon (**Project Settings**) → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **anon / public Key**
3. In the StudyFlow app header, click the **Local Mode** button to open the Supabase modal.
4. Paste your Project URL and Anon Key into the inputs.
5. Click **Test & Connect Database**.
6. StudyFlow will run a live probe query. Once verified, your status badge turns to **Supabase Live**!

*(Alternatively, you can save these in `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)*.

---

## 📁 Project Structure

```
student-task-manager/
├── index.html                   # HTML entry point with Plus Jakarta Sans & SEO tags
├── package.json                 # Dependencies & scripts
├── vite.config.js               # Vite configuration for React
├── tailwind.config.js           # Tailwind CSS v3 theme, brand colors, glassmorphism
├── postcss.config.js            # PostCSS configuration
├── supabase_schema.sql          # Copy-pasteable SQL setup script
├── .env.example                 # Environment variables template
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main application state and view router
│   ├── index.css                # Tailwind directives and custom utility classes
│   ├── constants/
│   │   └── initialData.js       # Default academic courses, priorities, and sample tasks
│   ├── lib/
│   │   └── supabaseClient.js    # Supabase client, live connection tester, and storage layer
│   └── components/
│       ├── Navbar.jsx           # Header, brand, search bar, theme toggle, add task button
│       ├── StatsOverview.jsx    # Metric cards and completion rate ring
│       ├── FilterControls.jsx   # Status tabs, course & priority filters, sorting, view switch
│       ├── TaskCard.jsx         # Card view with subtasks checklist and actions
│       ├── TaskBoard.jsx        # Kanban board view (To Do / In Progress / Completed)
│       ├── TaskTable.jsx        # Compact tabular view
│       ├── TaskModal.jsx        # Task creation & editing modal with validation
│       ├── SupabaseModal.jsx    # Database connection manager with live tester & SQL script
│       ├── PomodoroTimer.jsx    # Floating study focus timer widget
│       ├── EmptyState.jsx       # Zero-data and filtered-state UI
│       └── Toast.jsx            # Action feedback alerts
└── legacy_backup/               # Backup of older pre-existing files
```
