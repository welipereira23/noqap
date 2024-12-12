import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import type { Database } from '../types/supabase';

export type Tables = {
  non_accounting_days: {
    Row: {
      id: string
      user_id: string
      date: string
      type: string
      reason: string | null
      created_at: string
    }
    Insert: {
      id?: string
      user_id: string
      date: string
      type: string
      reason?: string | null
      created_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      date?: string
      type?: string
      reason?: string | null
      created_at?: string
    }
  }
};

if (!env.VITE_SUPABASE_URL) {
  throw new Error('Missing Supabase URL');
}

if (!env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase Anon Key');
}

// Criar uma única instância do cliente Supabase
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage // Forçar o uso do localStorage
    },
    global: {
      headers: {
        'X-Client-Info': 'bolt',
        'apikey': env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.VITE_SUPABASE_ANON_KEY}`
      }
    }
  }
);