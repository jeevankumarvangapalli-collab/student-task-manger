import React from 'react'
import { 
  CheckCircle2, 
  Plus, 
  Search, 
  Database, 
  Moon, 
  Sun, 
  Sparkles,
  BookOpen,
  Timer,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react'

export default function Navbar({
  searchTerm,
  setSearchTerm,
  darkMode,
  setDarkMode,
  isLiveDb,
  user,
  onOpenAuthModal,
  onSignOut,
  onOpenSupabaseModal,
  onOpenNewTaskModal,
  onTogglePomodoro,
  isPomodoroOpen
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-glow-brand ring-2 ring-brand-500/30">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 dark:from-brand-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                StudyFlow
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                Academic Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
              Student Task & Exam Manager
            </p>
          </div>
        </div>

        {/* Global Live Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="global-task-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assignments, exams, subjects, notes..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Pomodoro Timer Toggle */}
          <button
            id="toggle-pomodoro-btn"
            onClick={onTogglePomodoro}
            title="Focus Pomodoro Timer"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl border transition-all duration-200 ${
              isPomodoroOpen 
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            <span className="hidden sm:inline">Focus</span>
          </button>

          {/* Supabase Status Pill */}
          <button
            id="open-supabase-status-btn"
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              isLiveDb
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
            }`}
            title="Click to view database connection status"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLiveDb ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isLiveDb ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <Database className="w-3.5 h-3.5" />
            <span className="hidden lg:inline font-semibold">
              {isLiveDb ? 'Supabase Live' : 'Local Mode'}
            </span>
          </button>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[130px] truncate" title={user.email}>
                <UserCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="truncate hidden sm:inline">{user.email?.split('@')[0]}</span>
              </div>
              <button
                id="sign-out-btn"
                onClick={onSignOut}
                title="Sign out of student account"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="open-auth-modal-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-500" />
              <span>Sign In</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* New Task Button */}
          <button
            id="create-task-primary-btn"
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/25 transition-all duration-200 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

      </div>

      {/* Mobile Search Bar */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 md:hidden bg-slate-50 dark:bg-slate-900/60">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="global-task-search-input-mobile"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks, courses, notes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
          />
        </div>
      </div>
    </header>
  )
}
