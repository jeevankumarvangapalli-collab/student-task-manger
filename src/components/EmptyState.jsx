import React from 'react'
import { FolderCheck, SearchX, Plus, RefreshCw } from 'lucide-react'

export default function EmptyState({
  isFiltered,
  onResetFilters,
  onOpenNewTaskModal,
  onLoadSampleData
}) {
  return (
    <div className="glass-card rounded-3xl p-10 sm:p-14 text-center border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
        {isFiltered ? <SearchX className="w-8 h-8" /> : <FolderCheck className="w-8 h-8" />}
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
        {isFiltered ? 'No matching tasks found' : 'All caught up! No academic tasks'}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        {isFiltered 
          ? 'Try adjusting your search query, subject filter, or priority filter to find what you are looking for.'
          : 'You currently have no tasks on your schedule. Create your first assignment or exam reminder to get started!'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isFiltered ? (
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 transition-colors"
          >
            Clear All Filters
          </button>
        ) : (
          <>
            <button
              onClick={onOpenNewTaskModal}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Academic Task
            </button>
            {onLoadSampleData && (
              <button
                onClick={onLoadSampleData}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Load Sample Schedule
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
