import React, { useState, useEffect } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Tag, 
  BookOpen, 
  FileText 
} from 'lucide-react'
import { COURSES, PRIORITIES, TASK_TYPES } from '../constants/initialData'

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit
}) {
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('cs101')
  const [type, setType] = useState('assignment')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('todo')
  const [estimatedMinutes, setEstimatedMinutes] = useState(60)
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [subtasks, setSubtasks] = useState([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [error, setError] = useState('')

  // Pre-fill fields when editing or creating
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '')
      setCourseId(taskToEdit.course_id || COURSES[0].id)
      setType(taskToEdit.type || 'assignment')
      
      // Format ISO string to datetime-local input string: YYYY-MM-DDTHH:mm
      if (taskToEdit.due_date) {
        const d = new Date(taskToEdit.due_date)
        const pad = (n) => String(n).padStart(2, '0')
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        setDueDate(formatted)
      } else {
        setDueDate('')
      }

      setPriority(taskToEdit.priority || 'medium')
      setStatus(taskToEdit.status || 'todo')
      setEstimatedMinutes(taskToEdit.estimated_minutes || 60)
      setWeight(taskToEdit.weight !== null && taskToEdit.weight !== undefined ? taskToEdit.weight : '')
      setNotes(taskToEdit.notes || '')
      setSubtasks(Array.isArray(taskToEdit.subtasks) ? [...taskToEdit.subtasks] : [])
    } else {
      // Default new task
      setTitle('')
      setCourseId(COURSES[0].id)
      setType('assignment')
      
      // Default due tomorrow at 11:59 PM
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(23, 59, 0, 0)
      const pad = (n) => String(n).padStart(2, '0')
      const formatted = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T23:59`
      setDueDate(formatted)

      setPriority('medium')
      setStatus('todo')
      setEstimatedMinutes(60)
      setWeight(10)
      setNotes('')
      setSubtasks([])
    }
    setError('')
  }, [taskToEdit, isOpen])

  if (!isOpen) return null

  const handleAddSubtask = (e) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    const newItem = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newSubtaskTitle.trim(),
      completed: false
    }
    setSubtasks([...subtasks, newItem])
    setNewSubtaskTitle('')
  }

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id))
  }

  const handleToggleSubtask = (id) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please enter a task title')
      return
    }
    if (!dueDate) {
      setError('Please select a due date and time')
      return
    }

    const payload = {
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
      title: title.trim(),
      course_id: courseId,
      type,
      due_date: new Date(dueDate).toISOString(),
      priority,
      status,
      estimated_minutes: Number(estimatedMinutes) || 60,
      weight: weight ? Number(weight) : null,
      notes: notes.trim(),
      subtasks,
      completed_at: status === 'completed' ? (taskToEdit?.completed_at || new Date().toISOString()) : null,
      created_at: taskToEdit?.created_at || new Date().toISOString()
    }

    onSave(payload)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {taskToEdit ? 'Edit Academic Task' : 'Create New Academic Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task / Assignment Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures Problem Set 4: Graph Algorithms"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
              required
            />
          </div>

          {/* Course & Task Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course / Subject
              </label>
              <select
                id="task-course-select"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500 cursor-pointer"
              >
                {COURSES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category / Type
              </label>
              <select
                id="task-type-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500 cursor-pointer"
              >
                {Object.entries(TASK_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Time, Priority, Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="task-due-date-input"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="urgent">🔴 Urgent (Do First)</option>
                <option value="high">🟠 High Priority</option>
                <option value="medium">🔵 Medium Priority</option>
                <option value="low">⚪ Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="todo">📋 To Do</option>
                <option value="in_progress">⏳ In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>

          {/* Study Estimate & Grade Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Time (Minutes)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="60"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grade Contribution (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 15 for 15% of final grade"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Notes / Instructions */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Study Guidelines
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Include rubric requirements, submission link, reading pages, or lecture references..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500 transition-all text-xs sm:text-sm"
            />
          </div>

          {/* Subtasks / Checklist Builder */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subtasks & Steps Checklist ({subtasks.length})
            </label>
            
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubtask(e)
                  }
                }}
                placeholder="Add step (e.g. Write intro paragraph) and press Enter"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 max-h-36 overflow-y-auto">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-task-submit-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/30 transition-all duration-200"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
