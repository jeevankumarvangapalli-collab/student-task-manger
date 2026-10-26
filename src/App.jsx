import React, { useState, useEffect, useMemo } from 'react'
import confetti from 'canvas-confetti'
import Navbar from './components/Navbar'
import StatsOverview from './components/StatsOverview'
import FilterControls from './components/FilterControls'
import TaskCard from './components/TaskCard'
import TaskBoard from './components/TaskBoard'
import TaskTable from './components/TaskTable'
import TaskModal from './components/TaskModal'
import SupabaseModal from './components/SupabaseModal'
import AuthModal from './components/AuthModal'
import PomodoroTimer from './components/PomodoroTimer'
import EmptyState from './components/EmptyState'
import Toast from './components/Toast'
import { INITIAL_TASKS, COURSES, PRIORITIES } from './constants/initialData'
import { 
  fetchTasksService, 
  upsertTaskService, 
  deleteTaskService, 
  getCurrentUser,
  signOutUser,
  onAuthStateChange
} from './lib/supabaseClient'

export default function App() {
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('studypulse_theme') === 'dark' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // User Authentication State
  const [user, setUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Task & Database State
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLiveDb, setIsLiveDb] = useState(false)

  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'todo' | 'in_progress' | 'completed' | 'overdue'
  const [courseFilter, setCourseFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('due_asc')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'board' | 'table'

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false)
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false)
  const [pomodoroActiveTask, setPomodoroActiveTask] = useState(null)

  // Toast State
  const [toast, setToast] = useState(null)

  const showToast = (type, message) => {
    setToast({ type, message })
  }

  // Handle Theme switching class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('studypulse_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('studypulse_theme', 'light')
    }
  }, [darkMode])

  // Load Tasks Service Wrapper
  const loadData = async () => {
    setLoading(true)
    const { tasks: loadedTasks, isLiveDb: liveStatus } = await fetchTasksService(INITIAL_TASKS)
    setTasks(loadedTasks)
    setIsLiveDb(liveStatus)
    setLoading(false)
  }

  // Check initial authenticated user and listen for auth events
  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u)
      loadData()
    })

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        loadData()
      } else if (event === 'SIGNED_OUT') {
        loadData()
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOutUser()
    setUser(null)
    showToast('info', 'Signed out of Supabase.')
    loadData()
  }

  // Confetti celebration helper
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
      })
    } catch (e) {
      // Ignore if confetti fails
    }
  }

  // Save Task (Create or Update)
  const handleSaveTask = async (taskData) => {
    const isNew = !tasks.some(t => t.id === taskData.id)
    const { tasks: updatedTasks, isLiveDb: live } = await upsertTaskService(taskData, tasks)
    setTasks(updatedTasks)
    setIsLiveDb(live)
    showToast('success', isNew ? 'Task created successfully!' : 'Task updated successfully!')
  }

  // Toggle Completion
  const handleToggleComplete = async (task) => {
    const willBeCompleted = task.status !== 'completed'
    const updated = {
      ...task,
      status: willBeCompleted ? 'completed' : 'todo',
      completed_at: willBeCompleted ? new Date().toISOString() : null
    }

    if (willBeCompleted) {
      triggerCelebration()
      showToast('success', `Completed: "${task.title}"! 🎉`)
    }

    const { tasks: updatedTasks, isLiveDb: live } = await upsertTaskService(updated, tasks)
    setTasks(updatedTasks)
    setIsLiveDb(live)
  }

  // Quick move status (e.g. from board or table)
  const handleQuickMoveStatus = async (task, newStatus) => {
    const willBeCompleted = newStatus === 'completed'
    const updated = {
      ...task,
      status: newStatus,
      completed_at: willBeCompleted ? new Date().toISOString() : null
    }

    if (willBeCompleted) {
      triggerCelebration()
    }

    const { tasks: updatedTasks, isLiveDb: live } = await upsertTaskService(updated, tasks)
    setTasks(updatedTasks)
    setIsLiveDb(live)
  }

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId)
    const { tasks: updatedTasks, isLiveDb: live } = await deleteTaskService(taskId, tasks)
    setTasks(updatedTasks)
    setIsLiveDb(live)
    showToast('info', `Deleted: "${taskToDelete?.title || 'Task'}"`)
  }

  // Duplicate Task
  const handleDuplicateTask = async (task) => {
    const clone = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (Copy)`,
      status: 'todo',
      completed_at: null,
      created_at: new Date().toISOString()
    }
    const { tasks: updatedTasks, isLiveDb: live } = await upsertTaskService(clone, tasks)
    setTasks(updatedTasks)
    setIsLiveDb(live)
    showToast('success', 'Task duplicated!')
  }

  // Update a subtask checklist item
  const handleUpdateSubtask = async (taskId, subtaskId, completed) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const subtasks = Array.isArray(task.subtasks) ? [...task.subtasks] : []
    const updatedSubtasks = subtasks.map(st => st.id === subtaskId ? { ...st, completed } : st)

    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks
    }

    const { tasks: updatedTasks, isLiveDb: live } = await upsertTaskService(updatedTask, tasks)
    setTasks(updatedTasks)
    setIsLiveDb(live)
  }

  // Focus timer selection
  const handleSelectForFocus = (task) => {
    setPomodoroActiveTask(task)
    setIsPomodoroOpen(true)
  }

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setCourseFilter('all')
    setPriorityFilter('all')
    setSortBy('due_asc')
  }

  // Restore sample demo tasks
  const handleLoadSampleData = () => {
    setTasks(INITIAL_TASKS)
    localStorage.setItem('studypulse_tasks_v1', JSON.stringify(INITIAL_TASKS))
    showToast('info', 'Loaded sample academic tasks.')
  }

  // Compute status counts for filter tabs
  const now = new Date()
  const taskCounts = useMemo(() => {
    const counts = {
      all: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status !== 'completed' && new Date(t.due_date) < now).length,
    }
    return counts
  }, [tasks])

  // Filter & Sort Pipeline
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Status filter
        if (statusFilter === 'todo' && task.status !== 'todo') return false
        if (statusFilter === 'in_progress' && task.status !== 'in_progress') return false
        if (statusFilter === 'completed' && task.status !== 'completed') return false
        if (statusFilter === 'overdue') {
          const isOverdue = task.status !== 'completed' && new Date(task.due_date) < now
          if (!isOverdue) return false
        }

        // Course filter
        if (courseFilter !== 'all' && task.course_id !== courseFilter) return false

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false

        // Live search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase()
          const course = COURSES.find(c => c.id === task.course_id)
          const matchTitle = task.title?.toLowerCase().includes(term)
          const matchNotes = task.notes?.toLowerCase().includes(term)
          const matchCourse = course ? (course.code.toLowerCase().includes(term) || course.name.toLowerCase().includes(term)) : false
          const matchSubtasks = task.subtasks?.some(st => st.title.toLowerCase().includes(term))

          if (!matchTitle && !matchNotes && !matchCourse && !matchSubtasks) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'due_asc') {
          return new Date(a.due_date) - new Date(b.due_date)
        }
        if (sortBy === 'due_desc') {
          return new Date(b.due_date) - new Date(a.due_date)
        }
        if (sortBy === 'priority_desc') {
          const wA = PRIORITIES[a.priority]?.weight || 0
          const wB = PRIORITIES[b.priority]?.weight || 0
          return wB - wA
        }
        if (sortBy === 'title_asc') {
          return a.title.localeCompare(b.title)
        }
        if (sortBy === 'created_desc') {
          return new Date(b.created_at) - new Date(a.created_at)
        }
        return 0
      })
  }, [tasks, statusFilter, courseFilter, priorityFilter, searchTerm, sortBy])

  const isFiltered = searchTerm !== '' || statusFilter !== 'all' || courseFilter !== 'all' || priorityFilter !== 'all'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      
      {/* Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLiveDb={isLiveDb}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenNewTaskModal={() => {
          setTaskToEdit(null)
          setIsTaskModalOpen(true)
        }}
        onTogglePomodoro={() => setIsPomodoroOpen(!isPomodoroOpen)}
        isPomodoroOpen={isPomodoroOpen}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Academic Stats Overview Bar */}
        <StatsOverview tasks={tasks} />

        {/* Filter & View Switcher Bar */}
        <FilterControls
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          taskCounts={taskCounts}
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
        />

        {/* Content Views */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs sm:text-sm animate-pulse">
            Loading your academic schedule from Supabase...
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            isFiltered={isFiltered}
            onResetFilters={handleResetFilters}
            onOpenNewTaskModal={() => {
              setTaskToEdit(null)
              setIsTaskModalOpen(true)
            }}
            onLoadSampleData={tasks.length === 0 ? handleLoadSampleData : null}
          />
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={(t) => {
                      setTaskToEdit(t)
                      setIsTaskModalOpen(true)
                    }}
                    onDelete={handleDeleteTask}
                    onDuplicate={handleDuplicateTask}
                    onUpdateSubtask={handleUpdateSubtask}
                    onSelectForFocus={handleSelectForFocus}
                  />
                ))}
              </div>
            )}

            {viewMode === 'board' && (
              <TaskBoard
                tasks={filteredTasks}
                onToggleComplete={handleToggleComplete}
                onEdit={(t) => {
                  setTaskToEdit(t)
                  setIsTaskModalOpen(true)
                }}
                onDelete={handleDeleteTask}
                onDuplicate={handleDuplicateTask}
                onUpdateSubtask={handleUpdateSubtask}
                onSelectForFocus={handleSelectForFocus}
                onQuickMoveStatus={handleQuickMoveStatus}
                onOpenNewTaskModal={() => {
                  setTaskToEdit(null)
                  setIsTaskModalOpen(true)
                }}
              />
            )}

            {viewMode === 'table' && (
              <TaskTable
                tasks={filteredTasks}
                onToggleComplete={handleToggleComplete}
                onEdit={(t) => {
                  setTaskToEdit(t)
                  setIsTaskModalOpen(true)
                }}
                onDelete={handleDeleteTask}
                onDuplicate={handleDuplicateTask}
                onQuickMoveStatus={handleQuickMoveStatus}
              />
            )}
          </>
        )}

      </main>

      {/* Floating Pomodoro Timer Widget */}
      <PomodoroTimer
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        activeTask={pomodoroActiveTask}
      />

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setTaskToEdit(null)
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Supabase Connection Setup Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isLiveDb={isLiveDb}
        onConnectionSuccess={() => {
          loadData()
          showToast('success', 'Supabase database connected and synchronized!')
        }}
      />

      {/* Supabase Auth Modal (Sign Up / Sign In) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authUser, message) => {
          setUser(authUser)
          loadData()
          showToast('success', message)
        }}
      />

      {/* Transient Toast Alerts */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  )
}
