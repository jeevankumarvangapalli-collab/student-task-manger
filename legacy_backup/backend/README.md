# ScholarFlow Backend API Server

This backend powers the **DevBot AI Assistant** (Google Gemini LLM calls) and coordinates cloud database persistence (Supabase / local fallback) for the ScholarFlow Student Task Cockpit.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and insert your Google Gemini API key:
```env
PORT=5000
GEMINI_API_KEY=AIzaSy...your_gemini_key
GEMINI_MODEL=gemini-1.5-flash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
```
> **Get a free Gemini API Key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate an API key in under 30 seconds.

### 3. Start the Server
```bash
# Production start
npm start

# Development mode with auto-reload (Node.js 18+)
npm run dev
```

Server will run at `http://localhost:5000`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Sample Body |
|---|---|---|---|
| `GET` | `/api/health` | System health & API key diagnostics | None |
| `POST` | `/api/chat` | Send message to Gemini DevBot | `{"message":"How to prioritize today?", "history":[]}` |
| `POST` | `/api/ai/breakdown` | Break assignment into subtasks | `{"title":"Algorithms PS4", "course":"CS 101"}` |
| `POST` | `/api/ai/study-plan` | Generate personalized multi-day plan | `{"tasks":[...], "days": 5}` |
| `GET` | `/api/tasks` | List all tasks | None |
| `POST` | `/api/tasks` | Create or upsert task | `{"title":"Physics Lab", "dueDate":"2026-10-30"}` |
| `DELETE`| `/api/tasks/:id` | Delete task | None |
| `GET` | `/api/courses` | List enrolled courses | None |

---

## 🤖 DevBot Features
- **Context-Aware Mentoring**: DevBot automatically inspects the student's pending assignments, overdue deadlines, and course syllabus to tailor study tips.
- **Smart Assignment Breakdown**: Parses assignments into 3-6 realistic subtasks with estimated minutes.
- **Offline / Demo Resilience**: If no Gemini API key is configured yet, DevBot continues running in interactive demo mode with helpful study frameworks!
