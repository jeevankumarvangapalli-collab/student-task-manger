# ScholarFlow: Student Task Manager & DevBot AI Cockpit

> **Problem Statement**: Students frequently juggle multiple courses, homework assignments, exam preparation, and extracurricular commitments simultaneously. Without a centralized, accessible system, tracking multiple overlapping deadlines often leads to disorganization, missed due dates, and elevated academic stress.

**ScholarFlow** provides a lightweight, frictionless, and beautiful academic management cockpit paired with **DevBot**, an intelligent AI academic mentor powered by **Google Gemini LLM**. The project is cleanly architected into three distinct, decoupled modules: **Frontend**, **Backend**, and **Supabase**.

---

## 🏗️ Architecture & Directory Separation

```
student-task-manager/
├── frontend/                      # 🎨 CLIENT-SIDE WEB APPLICATION
│   ├── index.html                 # 7 interactive views + floating DevBot drawer & modals
│   ├── styles.css                 # Design system: glassmorphism, responsive, animations
│   ├── app.js                     # Core task store, Kanban, Calendar, Eisenhower matrix, Pomodoro
│   ├── chat.js                    # DevBot AI chat controller (Gemini integration, markdown, drawer)
│   ├── assets/                    # Logo and UI graphics
│   └── README.md                  # Frontend documentation
│
├── backend/                       # ⚙️ NODE.JS / EXPRESS API SERVER
│   ├── server.js                  # Express REST API, CORS, static serving, health checks
│   ├── services/
│   │   └── geminiService.js       # Google Gemini LLM service (Chat, Task Breakdown, Study Plan)
│   ├── routes/
│   │   └── api.js                 # Endpoints: /api/chat, /api/ai/breakdown, /api/tasks, etc.
│   ├── .env.example               # Environment variables template
│   ├── package.json               # Backend dependencies (express, cors, dotenv)
│   └── README.md                  # Backend setup & API reference
│
├── supabase/                      # ☁️ CLOUD DATABASE & REALTIME
│   ├── schema.sql                 # SQL tables (courses, tasks, pomo_stats, chat_messages), RLS & seed
│   ├── client.js                  # Universal Supabase client loader (Node.js & browser)
│   └── README.md                  # 5-minute Supabase setup guide
│
├── package.json                   # Root orchestrator script
└── README.md                      # Complete system documentation
```

---

## ⚡ Quick Start Guide

### Option 1: Full-Stack Mode (Frontend + Backend + Gemini LLM)

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure your API keys (`backend/.env`):**
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key:
   ```env
   PORT=5000
   GEMINI_API_KEY=AIzaSy...your_gemini_key
   GEMINI_MODEL=gemini-1.5-flash
   ```
   *(Get a free Gemini API key in 30 seconds at [Google AI Studio](https://aistudio.google.com/app/apikey))*.

3. **Start the backend server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   Open [http://localhost:5000](http://localhost:5000) in your browser.

---

### Option 2: Zero-Config Standalone Frontend (Offline / LocalStorage)

Open `frontend/index.html` directly in any web browser. Tasks are automatically saved to your browser's persistent `localStorage`. You can still test DevBot with built-in smart suggestions or enter your own Gemini API key directly in the UI settings!

---

### Option 3: Connect Supabase for Cloud Multi-Device Sync

1. Create a free project on [Supabase](https://supabase.com).
2. Go to **SQL Editor**, paste the contents of `supabase/schema.sql`, and click **Run**.
3. In ScholarFlow, click the **Cloud Sync** widget in the sidebar (or configure `backend/.env`).
4. Enter your **Project URL** and **Anon Key**, then click **Push Local Data &rarr; Cloud**.

---

## 🤖 DevBot AI Features (Google Gemini LLM)

DevBot acts as an empathetic academic coach and computer science mentor:

1. **Assignment Decomposer (`✨ DevBot AI Breakdown`)**:
   - Inside the Add/Edit Assignment modal, click **DevBot AI Breakdown**.
   - Gemini decomposes high-level assignments into 3–6 timed, actionable milestones with realistic Pomodoro estimates and adds them to your task checklist.

2. **7-Day Study Masterplan (`POST /api/ai/study-plan`)**:
   - DevBot inspects your pending deadlines and generates an active-recall study timetable with spaced breaks.

3. **Context-Aware Academic Chat (`POST /api/chat`)**:
   - DevBot knows your pending assignments, urgent deadlines, and courses.
   - Ask for homework debugging, algorithm explanations (e.g. Dijkstra, Dynamic Programming), or concept breakdowns.

4. **Floating Drawer & Full Cockpit View**:
   - Switch to **DevBot AI Coach** in the sidebar (shortcut: <kbd>7</kbd> or <kbd>D</kbd>).
   - Or click the floating **DevBot AI** pill in the bottom-right corner from *any* screen (Kanban, Calendar, Pomodoro).

---

## 📡 Backend API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | System health, Gemini key status, Supabase status |
| `/api/chat` | `POST` | Send conversation turn to Google Gemini LLM |
| `/api/ai/breakdown` | `POST` | Deconstruct assignment title & notes into subtasks |
| `/api/ai/study-plan` | `POST` | Generate structured multi-day study schedule |
| `/api/tasks` | `GET` / `POST` | Retrieve or persist tasks |
| `/api/tasks/:id` | `DELETE` | Delete task by ID |
| `/api/courses` | `GET` / `POST` | Retrieve or persist course subjects |

---

## ⌨️ Keyboard Shortcuts
- <kbd>N</kbd> — Quick-add assignment modal
- <kbd>/</kbd> — Focus search bar
- <kbd>1</kbd> — Assignments Feed
- <kbd>2</kbd> — Kanban Board
- <kbd>3</kbd> — Deadline Calendar
- <kbd>4</kbd> — Priority Matrix (Eisenhower)
- <kbd>5</kbd> — Focus Pomodoro Station
- <kbd>6</kbd> — Workload & Health Analytics
- <kbd>7</kbd> or <kbd>D</kbd> — DevBot AI Assistant
- <kbd>Esc</kbd> — Close active modal or drawer
