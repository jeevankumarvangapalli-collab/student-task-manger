import React, { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Coffee, 
  Brain, 
  X,
  CheckCircle2 
} from 'lucide-react'

export default function PomodoroTimer({
  isOpen,
  onClose,
  activeTask
}) {
  const [mode, setMode] = useState('focus') // 'focus' (25m) | 'short' (5m) | 'long' (15m)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  // Mode durations in seconds
  const DURATIONS = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  }

  // Switch modes
  const handleSwitchMode = (newMode) => {
    setMode(newMode)
    setTimeLeft(DURATIONS[newMode])
    setIsRunning(false)
  }

  // Timer interval
  useEffect(() => {
    let timer = null
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      if (mode === 'focus') {
        setSessionsCompleted(prev => prev + 1)
        alert('🎉 Focus session completed! Great job! Time for a short break.')
        handleSwitchMode('short')
      } else {
        alert('☕ Break is over! Ready to focus again?')
        handleSwitchMode('focus')
      }
    }
    return () => clearInterval(timer)
  }, [isRunning, timeLeft, mode])

  if (!isOpen) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const progressPercent = Math.round(((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100)

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 sm:w-88 glass-card rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Timer className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">
            Study Pomodoro
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Target Task banner */}
      {activeTask && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-700 dark:text-indigo-300 truncate">
          <span className="font-semibold">Focusing on:</span> {activeTask.title}
        </div>
      )}

      {/* Mode Selectors */}
      <div className="flex items-center justify-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-semibold">
        <button
          onClick={() => handleSwitchMode('focus')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mode === 'focus' 
              ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Focus (25m)
        </button>
        <button
          onClick={() => handleSwitchMode('short')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mode === 'short' 
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Short (5m)
        </button>
        <button
          onClick={() => handleSwitchMode('long')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mode === 'long' 
              ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Long (15m)
        </button>
      </div>

      {/* Timer Display */}
      <div className="flex flex-col items-center justify-center my-2">
        <span className="text-4xl font-extrabold tracking-wider font-mono text-slate-800 dark:text-white">
          {formattedTime}
        </span>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              mode === 'focus' ? 'bg-brand-500' : mode === 'short' ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => handleSwitchMode(mode)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center gap-2 transition-transform active:scale-95 ${
            isRunning 
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25' 
              : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>
      </div>

      {/* Completed counter */}
      <div className="mt-3 text-center text-[10px] text-slate-400">
        🍅 {sessionsCompleted} focus blocks completed today
      </div>

    </div>
  )
}
