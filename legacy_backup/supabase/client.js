/**
 * ScholarFlow: Supabase Client Configuration & Initialization Module
 * Provides unified access to Supabase database for both backend and frontend environments.
 */

// Universal environment variable extraction (supports Node.js process.env & browser window)
function getEnvConfig() {
  if (typeof process !== 'undefined' && process.env) {
    return {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
    };
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('scholarflow_supabase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          supabaseUrl: parsed.url || '',
          supabaseKey: parsed.key || ''
        };
      }
    } catch (e) {
      // Fallback
    }
  }
  return { supabaseUrl: '', supabaseKey: '' };
}

/**
 * Creates and returns an initialized Supabase Client.
 * In Node.js: Requires @supabase/supabase-js
 * In Browser: Requires @supabase/supabase-js CDN loaded on window.supabase
 */
function createSupabaseClient(customUrl = null, customKey = null) {
  const { supabaseUrl, supabaseKey } = getEnvConfig();
  const url = customUrl || supabaseUrl;
  const key = customKey || supabaseKey;

  if (!url || !key) {
    return null;
  }

  // Node.js environment
  if (typeof module !== 'undefined' && module.exports) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      return createClient(url, key);
    } catch (err) {
      console.warn('[Supabase] @supabase/supabase-js package not installed in Node.js backend.');
      return null;
    }
  }

  // Browser environment
  if (typeof window !== 'undefined' && window.supabase) {
    try {
      return window.supabase.createClient(url, key);
    } catch (err) {
      console.error('[Supabase] Failed to initialize browser Supabase client:', err);
      return null;
    }
  }

  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createSupabaseClient, getEnvConfig };
} else if (typeof window !== 'undefined') {
  window.createSupabaseClient = createSupabaseClient;
}
