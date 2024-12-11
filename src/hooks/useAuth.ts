import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { errorLogger } from '../utils/errorLog';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useAuth() {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[useAuth] Tentando fazer login com email:', email);
      
      // Primeiro faz login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[useAuth] Erro no login:', error);
        errorLogger.logError(error, 'Auth:signIn');
        throw error;
      }

      if (!data.user) {
        console.error('[useAuth] Login bem sucedido mas sem dados do usuário');
        throw new Error('Login failed: No user data');
      }

      console.log('[useAuth] Login Supabase bem sucedido, buscando dados do usuário');

      // Buscar dados adicionais do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('[useAuth] Erro ao buscar dados do usuário:', userError);
        throw userError;
      }

      console.log('[useAuth] Dados do usuário recuperados, verificando bloqueio');

      // Verificar se o usuário está bloqueado
      if (userData.is_blocked) {
        console.log('[useAuth] Usuário bloqueado, redirecionando para /access');
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'user',
          is_blocked: true
        });
        navigate('/access');
        return;
      }

      console.log('[useAuth] Usuário não bloqueado, atualizando estado');

      // Atualizar o estado do usuário apenas se não estiver bloqueado
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        is_blocked: false
      });

      console.log('[useAuth] Estado atualizado, redirecionando para /');
      navigate('/');
      return data;
    } catch (error) {
      console.error('[useAuth] Erro inesperado no login:', error);
      errorLogger.logError(error as Error, 'Auth:signIn');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('[useAuth] Erro no cadastro:', error);
        errorLogger.logError(error, 'Auth:signUp');
        throw error;
      }

      if (data.user) {
        await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              role: 'user'
            },
          ]);
      }

      return data;
    } catch (error) {
      console.error('[useAuth] Erro inesperado no cadastro:', error);
      errorLogger.logError(error as Error, 'Auth:signUp');
      throw error;
    }
  };

  const signOut = async (redirectTo: string = '/login') => {
    try {
      console.log('[useAuth] Iniciando logout');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[useAuth] Erro no logout:', error);
        errorLogger.logError(error, 'Auth:signOut');
        throw error;
      }

      console.log('[useAuth] Logout bem sucedido');
      setUser(null);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('[useAuth] Erro inesperado no logout:', error);
      errorLogger.logError(error as Error, 'Auth:signOut');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        console.error('[useAuth] Erro ao resetar senha:', error);
        errorLogger.logError(error, 'Auth:resetPassword');
        throw error;
      }
    } catch (error) {
      console.error('[useAuth] Erro inesperado ao resetar senha:', error);
      errorLogger.logError(error as Error, 'Auth:resetPassword');
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        console.error('[useAuth] Erro ao atualizar senha:', error);
        errorLogger.logError(error, 'Auth:updatePassword');
        throw error;
      }
    } catch (error) {
      console.error('[useAuth] Erro inesperado ao atualizar senha:', error);
      errorLogger.logError(error as Error, 'Auth:updatePassword');
      throw error;
    }
  };

  return {
    user,
    session: user ? { user } : null,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}