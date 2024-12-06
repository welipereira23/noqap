import { createClient } from '@supabase/supabase-js';

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

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient<Tables>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);