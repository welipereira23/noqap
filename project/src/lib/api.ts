import { createClient } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';
import { QueryClient } from '@tanstack/react-query';
import { env } from '../config/env';
import { Database } from '../types/supabase';

// Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
});

// Supabase Client
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);

// Stripe Client
export const stripe = loadStripe(env.VITE_STRIPE_PUBLISHABLE_KEY);

// API Functions
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      prices (
        *,
        products (*)
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getShifts(userId: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getNonAccountingDays(userId: string) {
  const { data, error } = await supabase
    .from('non_accounting_days')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createShift(userId: string, shift: {
  startTime: Date;
  endTime: Date;
  description?: string;
}) {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      user_id: userId,
      start_time: shift.startTime.toISOString(),
      end_time: shift.endTime.toISOString(),
      description: shift.description
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createNonAccountingDay(userId: string, day: {
  date: Date;
  type: string;
  reason?: string;
}) {
  const { data, error } = await supabase
    .from('non_accounting_days')
    .insert({
      user_id: userId,
      date: day.date.toISOString(),
      type: day.type,
      reason: day.reason
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}