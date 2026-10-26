import React, { useState, useEffect } from 'react'
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Loader2, 
  Key, 
  Globe, 
  ShieldCheck,
  RefreshCw,
  HelpCircle
} from 'lucide-react'
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection 
} from '../lib/supabaseClient'

export default function SupabaseModal({
  isOpen,
  onClose,
  isLiveDb,
  onConnectionSuccess
}) {
  const [url, setUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [copiedSchema, setCopiedSchema] = useState(false)
  const [activeTab, setActiveTab] = useState('connect') // 'connect' | 'schema' | 'guide'

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig()
      setUrl(config.url || '')
      setAnonKey(config.anonKey || '')
      setTestResult(null)
      setCopiedSchema(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const sqlSchemaCode = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'assignment',
  due_date TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo',
  estimated_minutes INTEGER DEFAULT 60,
  weight NUMERIC(5,2),
  notes TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read/write on courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);`

  const handleCopySchema = () => {
    navigator.clipboard.writeText(sqlSchemaCode)
    setCopiedSchema(true)
    setTimeout(() => setCopiedSchema(false), 2500)
  }

  const handleTestAndSave = async (e) => {
    e.preventDefault()
    setIsTesting(true)
    setTestResult(null)

    const result = await testSupabaseConnection(url, anonKey)
    setIsTesting(false)
    setTestResult(result)

    if (result.success) {
      saveSupabaseConfig(url, anonKey)
      if (onConnectionSuccess) {
        onConnectionSuccess()
      }
    }
  }

  const handleDisconnect = () => {
    clearSupabaseConfig()
    setUrl('')
    setAnonKey('')
    setTestResult({
      success: false,
      info: 'Switched back to Local Storage Demo mode. Your local tasks are preserved.'
    })
    if (onConnectionSuccess) {
      onConnectionSuccess()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Supabase Cloud Database
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isLiveDb 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {isLiveDb ? 'Connected & Verified' : 'Demo Local Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sync academic tasks to your own free PostgreSQL database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-2.5 font-bold transition-colors border-b-2 ${
              activeTab === 'connect' 
                ? 'border-brand-600 text-brand-600 dark:text-brand-400' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            1. Connect & Test
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 font-bold transition-colors border-b-2 ${
              activeTab === 'schema' 
                ? 'border-brand-600 text-brand-600 dark:text-brand-400' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            2. SQL Schema Script
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 font-bold transition-colors border-b-2 ${
              activeTab === 'guide' 
                ? 'border-brand-600 text-brand-600 dark:text-brand-400' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            3. Beginner Step-by-Step
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          
          {/* TAB 1: Connect Form */}
          {activeTab === 'connect' && (
            <form onSubmit={handleTestAndSave} className="space-y-4">
              
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Zero fictitious data guarantee
                </p>
                <p>
                  StudyFlow does not invent database credentials. Enter your project URL and public anon key below, then click <strong>"Test Connection"</strong> to verify live communication with Supabase.
                </p>
              </div>

              {/* Status Banner */}
              {testResult && (
                <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : testResult.info
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 text-blue-800 dark:text-blue-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{testResult.success ? 'Verified Connected!' : 'Connection Status'}</p>
                    <p className="mt-0.5 leading-relaxed">{testResult.message || testResult.error || testResult.info}</p>
                    {testResult.tableMissing && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('schema')}
                        className="mt-2 text-xs font-bold text-brand-600 dark:text-brand-400 underline"
                      >
                        Click here to view and copy the SQL table schema script
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Project URL */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="supabase-project-url-input"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500 font-mono text-xs"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Found in your Supabase Dashboard under <strong>Project Settings → API</strong>.
                </p>
              </div>

              {/* Anon Public Key */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Public Anon Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="supabase-anon-key-input"
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-brand-500 font-mono text-xs"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  This is the safe client-side public key (never share your secret `service_role` key).
                </p>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                {isLiveDb ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                  >
                    Disconnect and use LocalStorage Demo
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Don't have a Supabase project yet? Works in Local Mode!
                  </span>
                )}

                <button
                  id="test-supabase-connection-btn"
                  type="submit"
                  disabled={isTesting}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/30 flex items-center gap-2 transition-all"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Testing Live Connection...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Test & Connect Database</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: SQL Schema Script */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Run this SQL in your Supabase project's <strong>SQL Editor</strong> to create the <code>courses</code> and <code>tasks</code> tables:
                </p>
                <button
                  onClick={handleCopySchema}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold hover:bg-brand-100 transition-colors"
                >
                  {copiedSchema ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                {sqlSchemaCode}
              </pre>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                A full version of this file is also stored in your project as <code>supabase_schema.sql</code>.
              </p>
            </div>
          )}

          {/* TAB 3: Beginner Step-by-Step Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              
              <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Create your free Supabase Account</h4>
                  <p className="mt-0.5">Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-brand-500 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a> and sign in with GitHub or email. Click <strong>"New project"</strong> and name it e.g. <code>student-task-manager</code>.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Run the SQL Schema</h4>
                  <p className="mt-0.5">In your Supabase project dashboard, click <strong>"SQL Editor"</strong> in the left sidebar. Click <strong>"New query"</strong>, paste the script from the <em>SQL Schema Script</em> tab above, and click <strong>"Run"</strong>.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Copy API Credentials & Test</h4>
                  <p className="mt-0.5">Click the gear icon <strong>Project Settings → API</strong>. Copy the <strong>Project URL</strong> and <strong>anon/public Key</strong>. Paste them in the <em>Connect & Test</em> tab and click <strong>"Test & Connect Database"</strong>!</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
