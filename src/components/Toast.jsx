import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast, onClose])

  if (!toast) return null

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500" />,
    info: <Info className="w-4 h-4 text-brand-500" />
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-fadeIn">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-xs font-medium text-slate-800 dark:text-slate-100 max-w-sm">
        {icons[toast.type] || icons.info}
        <span className="flex-1">{toast.message}</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
