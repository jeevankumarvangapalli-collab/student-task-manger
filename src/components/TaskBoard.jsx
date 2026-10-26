import React from 'react'
import { Plus, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import TaskCard from './TaskCard'

export default function TaskBoard({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onUpdateSubtask,
  onSelectForFocus,
  onQuickMoveStatus,
  onOpenNewTaskModal
}) {
  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'border-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      tasks: tasks.filter(t => t.status === 'todo')
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: 'border-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      tasks: tasks.filter(t => t.status === 'in_progress')
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'border-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      tasks: tasks.filter(t => t.status === 'completed')
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {columns.map(col => (
        <div 
          key={col.id} 
          className="bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col min-h-[500px]"
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full border-2 ${col.color}`} />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {col.title}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeBg}`}>
                {col.tasks.length}
              </span>
            </div>

            {col.id === 'todo' && (
              <button
                onClick={onOpenNewTaskModal}
                className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                title="Add task to this column"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cards list in Column */}
          <div className="space-y-3.5 flex-1">
            {col.tasks.length === 0 ? (
              <div className="h-40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No tasks in {col.title.toLowerCase()}</span>
              </div>
            ) : (
              col.tasks.map(task => (
                <div key={task.id} className="group relative">
                  <TaskCard
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onUpdateSubtask={onUpdateSubtask}
                    onSelectForFocus={onSelectForFocus}
                  />

                  {/* Quick status transitions footer */}
                  <div className="mt-1 flex items-center justify-end gap-1 px-1">
                    {col.id !== 'todo' && (
                      <button
                        onClick={() => onQuickMoveStatus(task, col.id === 'completed' ? 'in_progress' : 'todo')}
                        className="text-[10px] font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-0.5 py-0.5 px-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Move to previous status"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>{col.id === 'completed' ? 'In Progress' : 'To Do'}</span>
                      </button>
                    )}
                    {col.id !== 'completed' && (
                      <button
                        onClick={() => onQuickMoveStatus(task, col.id === 'todo' ? 'in_progress' : 'completed')}
                        className="text-[10px] font-semibold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-0.5 py-0.5 px-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Advance status"
                      >
                        <span>{col.id === 'todo' ? 'In Progress' : 'Complete'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      ))}
    </div>
  )
}
