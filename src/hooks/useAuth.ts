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

  // Monitora mudanças no status de bloqueio do usuário
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`public:users:id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new.is_blocked) {
            console.log('[useAuth] Usuário foi bloqueado:', user.email);
            toast.error('Seu acesso foi bloqueado pelo administrador.');
            await signOut();
            navigate('/access');
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[useAuth] Tentando fazer login com email:', email);
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

      console.log('[useAuth] Login bem sucedido:', data.user);
      
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

      // Verificar se o usuário está bloqueado
      if (userData.is_blocked) {
        console.log('[useAuth] Usuário bloqueado:', userData.email);
        setUser(null);
        navigate('/access');
        return;
      }

      // Atualizar o estado do usuário
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user'
      });

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

  const signOut = async () => {
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
      navigate('/login');
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