import React from 'react'
import { 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  Kanban, 
  ListOrdered,
  X,
  BookOpen
} from 'lucide-react'
import { COURSES, PRIORITIES } from '../constants/initialData'

export default function FilterControls({
  statusFilter,
  setStatusFilter,
  courseFilter,
  setCourseFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  taskCounts,
  onResetFilters,
  isFiltered
}) {
  const statusTabs = [
    { key: 'all', label: 'All Tasks', count: taskCounts.all },
    { key: 'todo', label: 'To Do', count: taskCounts.todo },
    { key: 'in_progress', label: 'In Progress', count: taskCounts.inProgress },
    { key: 'completed', label: 'Completed', count: taskCounts.completed },
    { key: 'overdue', label: 'Overdue', count: taskCounts.overdue },
  ]

  return (
    <div className="space-y-4 mb-6">
      
      {/* Top Row: Status Tabs + View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Status Horizontal Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl overflow-x-auto no-scrollbar">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.key
            return (
              <button
                key={tab.key}
                id={`status-filter-${tab.key}`}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold ${
                  isActive 
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300' 
                    : 'bg-slate-300/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* View Switcher: Grid vs Board vs Table */}
        <div className="flex items-center self-end sm:self-auto gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl">
          <button
            id="view-mode-grid-btn"
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            id="view-mode-board-btn"
            onClick={() => setViewMode('board')}
            title="Kanban Board View"
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'board'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Kanban className="w-4 h-4" />
          </button>
          <button
            id="view-mode-table-btn"
            onClick={() => setViewMode('table')}
            title="Table View"
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Bottom Row: Detailed Dropdown Filters & Sorting */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
        
        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-500">Course:</span>
          <select
            id="filter-course-select"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-slate-900">All Subjects</option>
            {COURSES.map(c => (
              <option key={c.id} value={c.id} className="dark:bg-slate-900">
                {c.code} - {c.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-500">Priority:</span>
          <select
            id="filter-priority-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-slate-900">All Priorities</option>
            <option value="urgent" className="dark:bg-slate-900">Urgent</option>
            <option value="high" className="dark:bg-slate-900">High</option>
            <option value="medium" className="dark:bg-slate-900">Medium</option>
            <option value="low" className="dark:bg-slate-900">Low</option>
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-500">Sort:</span>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer"
          >
            <option value="due_asc" className="dark:bg-slate-900">Due Date (Earliest)</option>
            <option value="due_desc" className="dark:bg-slate-900">Due Date (Latest)</option>
            <option value="priority_desc" className="dark:bg-slate-900">Priority (Highest)</option>
            <option value="title_asc" className="dark:bg-slate-900">Title (A to Z)</option>
            <option value="created_desc" className="dark:bg-slate-900">Recently Added</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            id="reset-all-filters-btn"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}

      </div>

    </div>
  )
}
