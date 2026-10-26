import React from 'react'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CalendarDays, 
  Flame, 
  TrendingUp 
} from 'lucide-react'

export default function StatsOverview({ tasks }) {
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const todo = tasks.filter(t => t.status === 'todo').length
  
  // Calculate Urgent & High Priority count
  const urgentOrHigh = tasks.filter(t => 
    t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')
  ).length

  // Due today or overdue
  const now = new Date()
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const dueSoonOrOverdue = tasks.filter(t => {
    if (t.status === 'completed') return false
    const due = new Date(t.due_date)
    return due <= todayEnd
  }).length

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      
      {/* Metric 1: Total & Active */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Active Tasks
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
              {todo + inProgress}
            </span>
            <span className="text-xs text-slate-400">/ {total} total</span>
          </div>
          <p className="text-[11px] text-indigo-500 font-medium mt-1">
            {inProgress} currently in progress
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <CalendarDays className="w-5 h-5" />
        </div>
      </div>

      {/* Metric 2: Due Today or Overdue */}
      <div className={`glass-card p-4 rounded-2xl flex items-center justify-between ${
        dueSoonOrOverdue > 0 ? 'border-rose-300/80 dark:border-rose-900/60 bg-rose-50/20' : ''
      }`}>
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Due Today / Overdue
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl sm:text-3xl font-extrabold ${
              dueSoonOrOverdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'
            }`}>
              {dueSoonOrOverdue}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {dueSoonOrOverdue > 0 ? 'Needs attention today' : 'All clear for today!'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Metric 3: High & Urgent Priority */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            High & Urgent
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {urgentOrHigh}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            High grade impact
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Metric 4: Completed */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Finished
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {completed}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Tasks submitted
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Metric 5: Progress Radial Ring / Completion % */}
      <div className="glass-card p-4 rounded-2xl col-span-2 lg:col-span-1 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Completion Rate
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">
              {completionRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Semester pace
          </p>
        </div>

        {/* Dynamic SVG Circular Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-brand-500 transition-all duration-700 ease-out"
              strokeDasharray={`${completionRate}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">
            {completed}/{total}
          </span>
        </div>
      </div>

    </div>
  )
}
