import { createClient } from '@supabase/supabase-js'

// Storage keys
const STORAGE_KEY_TASKS = 'studypulse_tasks_v1'
const STORAGE_KEY_CONFIG = 'studypulse_supabase_config'

/**
 * Get configured Supabase credentials from environment or localStorage
 */
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  
  // 1. Check user-defined overrides in localStorage first
  const saved = localStorage.getItem(STORAGE_KEY_CONFIG)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          isConfigured: true,
          source: 'user_settings'
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved Supabase credentials', e)
    }
  }

  // 2. Check Vite environment variables (.env.local / .env)
  if (envUrl && envKey && !envUrl.includes('your-project-id') && !envUrl.includes('YOUR_SUPABASE')) {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
      isConfigured: true,
      source: 'env'
    }
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none'
  }
}

/**
 * Singleton client cache
 */
let cachedClient = null
let lastConfigUrl = null
let lastConfigKey = null

/**
 * Create or return initialized Supabase Client instance (or null if not configured)
 */
export const getSupabaseClient = () => {
  const config = getSupabaseConfig()
  if (!config.isConfigured || !config.url || !config.anonKey) {
    return null
  }

  // Reuse cached client if config has not changed
  if (cachedClient && lastConfigUrl === config.url && lastConfigKey === config.anonKey) {
    return cachedClient
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
    lastConfigUrl = config.url
    lastConfigKey = config.anonKey
    return cachedClient
  } catch (err) {
    console.error('Error initializing Supabase client:', err)
    return null
  }
}

/**
 * Export default client instance
 */
export const supabase = getSupabaseClient()

/**
 * Save custom user credentials to localStorage
 */
export const saveSupabaseConfig = (url, anonKey) => {
  if (!url || !anonKey) {
    localStorage.removeItem(STORAGE_KEY_CONFIG)
    cachedClient = null
    return
  }
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }))
  cachedClient = null // force re-initialization
}

/**
 * Clear custom user credentials
 */
export const clearSupabaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY_CONFIG)
  cachedClient = null
}

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const client = getSupabaseClient()
  if (!client) return null
  try {
    const { data: { user }, error } = await client.auth.getUser()
    if (error) return null
    return user
  } catch {
    return null
  }
}

/**
 * Listen to auth state changes (login, logout, token refresh)
 */
export const onAuthStateChange = (callback) => {
  const client = getSupabaseClient()
  if (!client) return { data: { subscription: { unsubscribe: () => {} } } }
  return client.auth.onAuthStateChange(callback)
}

/**
 * Sign in student with email & password
 */
export const signInUser = async (email, password) => {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase client is not configured.')
  return client.auth.signInWithPassword({ email, password })
}

/**
 * Sign up student with email & password
 */
export const signUpUser = async (email, password) => {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase client is not configured.')
  return client.auth.signUp({ email, password })
}

/**
 * Sign out current student
 */
export const signOutUser = async () => {
  const client = getSupabaseClient()
  if (!client) return
  return client.auth.signOut()
}

/**
 * Live test connection against Supabase
 * Never claim it's connected without executing a live request!
 */
export const testSupabaseConnection = async (url, anonKey) => {
  if (!url || !anonKey) {
    return {
      success: false,
      error: 'Please provide both your Supabase Project URL and Anon/Public Key.'
    }
  }

  // Basic URL validation
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    return {
      success: false,
      error: 'Invalid Project URL. It should look like: https://xyzcompany.supabase.co'
    }
  }

  try {
    const testClient = createClient(url.trim(), anonKey.trim())
    
    // Lightweight probe query on courses table (system courses are public read)
    const { data, error } = await testClient
      .from('courses')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation "public.courses" does not exist')) {
        return {
          success: false,
          error: 'Connection reachable, but database tables do not exist in your Supabase project yet. Please run the script in supabase_schema.sql in the Supabase SQL Editor.',
          tableMissing: true
        }
      }
      return {
        success: false,
        error: `Supabase Error (${error.code || 'Unauthorized'}): ${error.message || 'Check your Anon Key and Project URL.'}`
      }
    }

    return {
      success: true,
      message: 'Connection verified! Your Supabase database is active and reachable.'
    }
  } catch (err) {
    return {
      success: false,
      error: `Network or configuration error: ${err.message || 'Could not contact Supabase.'}`
    }
  }
}

/**
 * Fetch all tasks (from Supabase if configured, otherwise fallback to localStorage)
 */
export const fetchTasksService = async (fallbackInitialTasks) => {
  const client = getSupabaseClient()
  
  if (client) {
    try {
      const { data, error } = await client
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true })

      if (!error && Array.isArray(data)) {
        const normalized = data.map(item => ({
          ...item,
          subtasks: Array.isArray(item.subtasks) ? item.subtasks : []
        }))
        return { tasks: normalized, isLiveDb: true }
      }
      console.warn('Supabase fetch failed, falling back to local storage:', error)
    } catch (err) {
      console.warn('Error reading from Supabase:', err)
    }
  }

  // Local storage fallback
  const saved = localStorage.getItem(STORAGE_KEY_TASKS)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        return { tasks: parsed, isLiveDb: false }
      }
    } catch (e) {
      console.error('Error reading localStorage tasks', e)
    }
  }

  // Seed initial tasks
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(fallbackInitialTasks))
  return { tasks: fallbackInitialTasks, isLiveDb: false }
}

/**
 * Upsert (create or update) a task in Supabase or localStorage
 */
export const upsertTaskService = async (task, currentTasks) => {
  const client = getSupabaseClient()
  let isLiveDb = false

  if (client) {
    try {
      // Auto-attach authenticated user ID if logged in
      const currentUser = await getCurrentUser()
      
      const payload = {
        id: task.id,
        title: task.title,
        course_id: task.course_id || null,
        type: task.type || 'assignment',
        due_date: task.due_date,
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        estimated_minutes: task.estimated_minutes || 60,
        weight: task.weight || null,
        notes: task.notes || '',
        subtasks: task.subtasks || [],
        completed_at: task.completed_at || null,
        updated_at: new Date().toISOString()
      }

      if (currentUser?.id) {
        payload.user_id = currentUser.id
      } else if (task.user_id) {
        payload.user_id = task.user_id
      }

      const { data, error } = await client
        .from('tasks')
        .upsert(payload)
        .select()

      if (!error) {
        isLiveDb = true
      } else {
        console.warn('Supabase upsert failed, saving locally:', error)
      }
    } catch (err) {
      console.warn('Supabase upsert network error:', err)
    }
  }

  // Always keep localStorage updated as reliable cache
  const existingIndex = currentTasks.findIndex(t => t.id === task.id)
  let updatedList = []
  if (existingIndex >= 0) {
    updatedList = [...currentTasks]
    updatedList[existingIndex] = task
  } else {
    updatedList = [task, ...currentTasks]
  }

  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updatedList))
  return { tasks: updatedList, isLiveDb }
}

/**
 * Delete a task
 */
export const deleteTaskService = async (taskId, currentTasks) => {
  const client = getSupabaseClient()
  let isLiveDb = false

  if (client) {
    try {
      const { error } = await client
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (!error) {
        isLiveDb = true
      } else {
        console.warn('Supabase delete failed, deleting locally:', error)
      }
    } catch (err) {
      console.warn('Supabase delete network error:', err)
    }
  }

  const updatedList = currentTasks.filter(t => t.id !== taskId)
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updatedList))
  return { tasks: updatedList, isLiveDb }
}
