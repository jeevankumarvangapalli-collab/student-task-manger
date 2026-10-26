import React, { useState } from 'react'
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import { signInUser, signUpUser } from '../lib/supabaseClient'

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess
}) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfoMessage('')

    if (!email.trim() || !password.trim()) {
      setError('Please provide both an email and password.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await signUpUser(email.trim(), password)
        if (signUpError) {
          setError(signUpError.message)
        } else {
          if (data.session) {
            // Auto signed-in
            onAuthSuccess(data.user, 'Account created and signed in successfully!')
            onClose()
          } else {
            // Email confirmation required by Supabase settings
            setInfoMessage('Account created! Please check your email to confirm registration, or sign in if email confirmation is disabled in your Supabase project.')
          }
        }
      } else {
        const { data, error: signInError } = await signInUser(email.trim(), password)
        if (signInError) {
          setError(signInError.message)
        } else if (data.user) {
          onAuthSuccess(data.user, `Welcome back, ${data.user.email}!`)
          onClose()
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials and network.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {mode === 'signin' ? 'Sign In to StudyFlow' : 'Create Student Account'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Sync academic tasks securely with Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); setInfoMessage(''); }}
            className={`flex-1 py-3 font-semibold text-center transition-colors border-b-2 ${
              mode === 'signin'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setInfoMessage(''); }}
            className={`flex-1 py-3 font-semibold text-center transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Register / Sign Up
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Student Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="auth-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500 transition-all font-medium text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="auth-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500 transition-all font-medium text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          {/* RLS guarantee badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Protected by Row Level Security (only you see your tasks)</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/30 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'Sign In to My Tasks' : 'Register Account'}</span>
              )}
            </button>
          </div>

        </form>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center text-[11px] text-slate-500">
          {mode === 'signin' ? (
            <span>
              Don't have an account yet?{' '}
              <button 
                type="button" 
                onClick={() => { setMode('signup'); setError(''); }} 
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Sign up here
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button 
                type="button" 
                onClick={() => { setMode('signin'); setError(''); }} 
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
