import React from 'react'
import { 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Trash2, 
  Copy,
  AlertCircle 
} from 'lucide-react'
import { COURSES, PRIORITIES } from '../constants/initialData'

export default function TaskTable({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onQuickMoveStatus
}) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">Status</th>
              <th className="py-3 px-4 min-w-[220px]">Task & Course</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Time Est.</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map(task => {
              const isCompleted = task.status === 'completed'
              const course = COURSES.find(c => c.id === task.course_id)
              const priorityInfo = PRIORITIES[task.priority] || PRIORITIES.medium
              const due = new Date(task.due_date)
              const isOverdue = !isCompleted && due < new Date()

              return (
                <tr 
                  key={task.id} 
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    isCompleted ? 'bg-slate-50/40 dark:bg-slate-950/20 opacity-70' : ''
                  }`}
                >
                  {/* Completion toggle */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onToggleComplete(task)}
                      className={`transition-colors ${
                        isCompleted ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 hover:text-brand-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 fill-emerald-100 dark:fill-emerald-950/40" />
                      ) : (
                        <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 hover:border-brand-500" />
                      )}
                    </button>
                  </td>

                  {/* Title & Course */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className={`font-semibold text-slate-800 dark:text-slate-100 ${
                        isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}>
                        {task.title}
                      </span>
                      {course && (
                        <span 
                          className="inline-block mt-0.5 text-[10px] font-bold"
                          style={{ color: course.color }}
                        >
                          {course.code} • {course.name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityInfo.badgeBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotColor}`} />
                      {priorityInfo.label}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className={`flex items-center gap-1.5 font-medium ${
                      isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{due.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {isOverdue && <span className="text-[10px] px-1 bg-rose-100 dark:bg-rose-900/60 rounded">Overdue</span>}
                    </div>
                  </td>

                  {/* Time Estimate */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {task.estimated_minutes ? `${task.estimated_minutes} min` : '-'}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={task.status}
                      onChange={(e) => onQuickMoveStatus(task, e.target.value)}
                      className="px-2 py-1 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(task)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicate(task)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
