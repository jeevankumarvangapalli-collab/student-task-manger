# ScholarFlow Frontend: Student Academic Task Cockpit & DevBot AI

The lightweight, zero-configuration web interface for students to prioritize, monitor, and complete coursework with assistance from **DevBot AI** (powered by Google Gemini LLM).

---

## 🌟 Key Features

1. **Academic Assignments Feed**: Chronological grouping into Overdue, Due Today, Tomorrow, and Upcoming.
2. **Interactive Kanban Board**: Drag-and-drop workflow (To Do &rarr; In Progress &rarr; Review &rarr; Completed).
3. **Deadline Calendar**: Monthly view with daily load indicators and day inspector.
4. **Eisenhower Priority Matrix**: 4-quadrant cognitive load prioritization (Do First, Schedule, Delegate/Quick Wins, Backlog).
5. **Pomodoro Study Station**: 25m Focus, 5m Short Break, and 15m Long Break intervals with Web Audio sound synthesizers.
6. **Workload & Health Analytics**: 7-day workload forecast chart, course task share, and study pacing advice.
7. **🤖 DevBot AI Mentor (Gemini LLM)**:
   - Dedicated full cockpit view (`View 7` or shortcut `7` / `D`).
   - Global floating action button & slide-over drawer accessible from any screen.
   - Intelligent subtask decomposer in the assignment creation modal (`✨ DevBot AI Breakdown`).
   - Context-aware answers based on your pending deadlines and course syllabus.
8. **Persistent Dual-Mode Storage**:
   - Zero-config automatic local storage via the Web Storage API (`localStorage`).
   - One-click cloud database synchronization with **Supabase**.

---

## 🚀 How to Run

### Option 1: Direct in Browser (Zero Setup)
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Run via Backend Server (Recommended for Gemini LLM)
Start the backend server:
```bash
cd ../backend
npm install
npm start
```
Then visit `http://localhost:5000` in your browser.

---

## ⌨️ Keyboard Shortcuts
- <kbd>N</kbd> — Quick-add new assignment
- <kbd>/</kbd> — Focus global search bar
- <kbd>1</kbd> to <kbd>6</kbd> — Switch between Feed, Kanban, Calendar, Matrix, Pomodoro, and Analytics
- <kbd>7</kbd> or <kbd>D</kbd> — Open DevBot AI Assistant
- <kbd>Esc</kbd> — Close modals and search
