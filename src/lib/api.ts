import { loadStripe } from '@stripe/stripe-js';
import { QueryClient } from '@tanstack/react-query';
import { env } from '../config/env';
import { supabase } from './supabase';

// Query Client com configuração otimizada
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
      onError: (error) => {
        console.error('Query error:', error);
      }
    }
  }
});

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

export async function getShifts(userId: string, year?: number) {
  console.log('Buscando shifts para o usuário:', userId, 'ano:', year);
  try {
    let query = supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId);

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query
        .gte('start_time', startDate)
        .lte('start_time', endDate);
    }

    const { data, error } = await query.order('start_time', { ascending: false });

    if (error) {
      console.error('Erro ao buscar shifts:', error);
      throw error;
    }

    console.log('Shifts encontrados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao buscar shifts:', error);
    throw error;
  }
}

export async function getNonAccountingDays(userId: string) {
  console.log('Buscando dias não contabilizados para o usuário:', userId);
  try {
    const { data, error } = await supabase
      .from('non_accounting_days')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dias não contabilizados:', error);
      throw error;
    }

    console.log('Dias não contabilizados encontrados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao buscar dias não contabilizados:', error);
    throw error;
  }
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
    .select('*')
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
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function addNonAccountingDay(data: {
  start_date: string;
  end_date: string;
  type: string;
  reason?: string;
  user_id: string;
}) {
  console.log('API: Adicionando dia não contábil:', data);
  
  const { data: insertedData, error } = await supabase
    .from('non_accounting_days')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('API: Erro ao inserir dia não contábil:', error);
    throw error;
  }

  console.log('API: Dia não contábil inserido com sucesso:', insertedData);
  return insertedData;
}

export async function deleteShift(shiftId: string) {
  const { data, error } = await supabase
    .from('shifts')
    .delete()
    .eq('id', shiftId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNonAccountingDay(dayId: string) {
  const { data, error } = await supabase
    .from('non_accounting_days')
    .delete()
    .eq('id', dayId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}