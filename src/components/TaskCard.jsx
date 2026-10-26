import React, { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  CheckSquare, 
  Square, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  FileText,
  GraduationCap,
  FlaskConical,
  FolderGit2,
  BookOpen,
  Presentation,
  PlayCircle
} from 'lucide-react'
import { COURSES, PRIORITIES, TASK_TYPES } from '../constants/initialData'

export default function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onUpdateSubtask,
  onSelectForFocus
}) {
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const isCompleted = task.status === 'completed'
  const course = COURSES.find(c => c.id === task.course_id)
  const priorityInfo = PRIORITIES[task.priority] || PRIORITIES.medium
  const typeInfo = TASK_TYPES[task.type] || TASK_TYPES.assignment

  // Task type icon selector
  const renderTypeIcon = () => {
    switch (task.type) {
      case 'exam': return <GraduationCap className="w-3.5 h-3.5" />
      case 'lab': return <FlaskConical className="w-3.5 h-3.5" />
      case 'project': return <FolderGit2 className="w-3.5 h-3.5" />
      case 'reading': return <BookOpen className="w-3.5 h-3.5" />
      case 'presentation': return <Presentation className="w-3.5 h-3.5" />
      default: return <FileText className="w-3.5 h-3.5" />
    }
  }

  // Format due date relative status
  const formatDue = (dateStr) => {
    if (!dateStr) return { text: 'No due date', status: 'normal' }
    const due = new Date(dateStr)
    const now = new Date()
    
    // Clear hours for day difference
    const dDue = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffTime = dDue.getTime() - dNow.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    const timeStr = due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (diffDays < 0) {
      return { 
        text: `Overdue by ${Math.abs(diffDays)}d`, 
        status: 'overdue',
        badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900' 
      }
    } else if (diffDays === 0) {
      return { 
        text: `Today at ${timeStr}`, 
        status: 'today',
        badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900' 
      }
    } else if (diffDays === 1) {
      return { 
        text: `Tomorrow at ${timeStr}`, 
        status: 'tomorrow',
        badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900' 
      }
    } else {
      const monthStr = due.toLocaleDateString([], { month: 'short', day: 'numeric' })
      return { 
        text: `${monthStr} (${diffDays}d left)`, 
        status: 'future',
        badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
      }
    }
  }

  const dueInfo = formatDue(task.due_date)
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : []
  const completedSubtasks = subtasks.filter(s => s.completed).length
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0

  return (
    <div 
      className={`relative glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between border transition-all duration-200 ${
        isCompleted 
          ? 'opacity-70 bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800' 
          : task.priority === 'urgent'
            ? 'border-rose-200 dark:border-rose-900/60 shadow-sm'
            : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top Header: Course & Priority Pills + Actions Menu */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Course Tag */}
            {course && (
              <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: `${course.color}15`,
                  color: course.color,
                  border: `1px solid ${course.color}40`
                }}
              >
                {course.code}
              </span>
            )}

            {/* Task Type Tag */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {renderTypeIcon()}
              <span>{typeInfo.label}</span>
            </span>

            {/* Priority Tag */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${priorityInfo.badgeBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotColor} ${task.priority === 'urgent' && !isCompleted ? 'animate-ping' : ''}`} />
              <span>{priorityInfo.label}</span>
            </span>
          </div>

          {/* Quick Context Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div 
                className="absolute right-0 top-7 w-36 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-20 text-xs"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => { setShowMenu(false); onEdit(task); }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Task
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDuplicate(task); }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                {onSelectForFocus && (
                  <button
                    onClick={() => { setShowMenu(false); onSelectForFocus(task); }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400"
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> Start Focus
                  </button>
                )}
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  onClick={() => { setShowMenu(false); onDelete(task.id); }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Title & Completion Checkbox */}
        <div className="flex items-start gap-3 mt-1">
          <button
            onClick={() => onToggleComplete(task)}
            className={`mt-0.5 flex-shrink-0 transition-transform active:scale-90 ${
              isCompleted ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 hover:text-brand-500'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950/40" />
            ) : (
              <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-brand-500" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-bold text-slate-900 dark:text-white leading-snug break-words ${
              isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}>
              {task.title}
            </h3>
            
            {task.notes && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {task.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subtasks Progress & Expandable Toggle */}
      {subtasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
          >
            <div className="flex items-center gap-1.5">
              <span>Checklist: {completedSubtasks}/{subtasks.length}</span>
              <span className="text-[10px] text-slate-400">({subtaskProgress}%)</span>
            </div>
            {showSubtasks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Mini progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-brand-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>

          {/* Expanded Subtask List */}
          {showSubtasks && (
            <div className="mt-2.5 space-y-1.5 pl-1">
              {subtasks.map((st) => (
                <label 
                  key={st.id} 
                  className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => onUpdateSubtask(task.id, st.id, !st.completed)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className={st.completed ? 'line-through text-slate-400' : 'group-hover:text-slate-900 dark:group-hover:text-white'}>
                    {st.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Info: Due Date, Estimated Time, Grade Weight */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Due Date Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border font-medium ${dueInfo.badgeClass}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{dueInfo.text}</span>
        </div>

        {/* Study Time & Weight Tags */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          {task.estimated_minutes && (
            <span title="Estimated study time">
              ⏱️ {task.estimated_minutes >= 60 ? `${(task.estimated_minutes / 60).toFixed(1)}h` : `${task.estimated_minutes}m`}
            </span>
          )}
          {task.weight && (
            <span title="Grade contribution weight">
              ⚖️ {task.weight}%
            </span>
          )}
        </div>

      </div>

    </div>
  )
}
