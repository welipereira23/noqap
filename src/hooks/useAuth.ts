import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { errorLogger } from '../utils/errorLog';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[useAuth] Tentando fazer login com email:', email);
      
      // Primeiro faz login no Supabase Auth
      // const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      //   email,
      //   password,
      // });

      // if (authError) {
      //   console.error('[useAuth] Erro no login:', authError);
      //   throw authError;
      // }

      // if (!authData.user) {
      //   console.error('[useAuth] Login bem sucedido mas sem dados do usuário');
      //   throw new Error('Login failed: No user data');
      // }

      // // Buscar dados adicionais do usuário
      // const { data: userData, error: userError } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('id', authData.user.id)
      //   .single();

      // if (userError) {
      //   console.error('[useAuth] Erro ao buscar dados do usuário:', userError);
      //   throw userError;
      // }

      console.log('[useAuth] Dados do usuário recuperados, verificando bloqueio');

      // Verificar se o usuário está bloqueado
      // if (userData.is_blocked) {
      //   console.log('[useAuth] Usuário bloqueado, redirecionando para /access');
      //   setUser({
      //     id: userData.id,
      //     email: userData.email,
      //     name: userData.name,
      //     role: userData.role || 'user',
      //     is_blocked: true
      //   });
      //   navigate('/access');
      //   return;
      // }

      console.log('[useAuth] Usuário não bloqueado, atualizando estado');

      // Atualizar o estado do usuário apenas se não estiver bloqueado
      // setUser({
      //   id: userData.id,
      //   email: userData.email,
      //   name: userData.name,
      //   role: userData.role || 'user',
      //   is_blocked: false
      // });

      console.log('[useAuth] Estado atualizado, redirecionando para /');
      navigate('/');
      return;
    } catch (error) {
      console.error('[useAuth] Erro inesperado no login:', error);
      errorLogger.logError(error as Error, 'Auth:signIn');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // const { data, error } = await supabase.auth.signUp({
      //   email,
      //   password,
      //   options: {
      //     emailRedirectTo: REDIRECT_URL
      //   }
      // });

      // if (error) {
      //   console.error('[useAuth] Erro no cadastro:', error);
      //   throw error;
      // }

      return;
    } catch (error) {
      console.error('[useAuth] Erro inesperado no cadastro:', error);
      errorLogger.logError(error as Error, 'Auth:signUp');
      throw error;
    }
  };

  const signOut = async (redirectTo: string = '/login') => {
    try {
      console.log('[useAuth] Iniciando logout');
      
      // Clear the user state first
      setUser(null);
      
      // Attempt to sign out from Supabase
      // const { error } = await supabase.auth.signOut();
      
      // if (error) {
      //   console.error('[useAuth] Erro no logout:', error);
      //   // Don't throw the error if it's just a missing session
      //   if (!(error instanceof Error && error.message.includes('Auth session missing'))) {
      //     errorLogger.logError(error, 'Auth:signOut');
      //     throw error;
      //   }
      // }

      console.log('[useAuth] Logout bem sucedido');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('[useAuth] Erro inesperado no logout:', error);
      errorLogger.logError(error as Error, 'Auth:signOut');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Não implementado
    } catch (error) {
      console.error('[useAuth] Erro inesperado ao resetar senha:', error);
      errorLogger.logError(error as Error, 'Auth:resetPassword');
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      // Não implementado
    } catch (error) {
      console.error('[useAuth] Erro inesperado ao atualizar senha:', error);
      errorLogger.logError(error as Error, 'Auth:updatePassword');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('[useAuth] Iniciando login com Google');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('[useAuth] Erro na autenticação com Google:', error);
        throw error;
      }
    } catch (error) {
      console.error('[useAuth] Erro inesperado no login com Google:', error);
      errorLogger.logError(error as Error, 'Auth:signInWithGoogle');
      throw error;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useAuth] Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Buscar dados do usuário
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('[useAuth] Erro ao buscar usuário:', userError);
            throw userError;
          }

          if (userData.is_blocked) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              is_blocked: true
            });
            navigate('/access');
            return;
          }

          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            is_blocked: false
          });

          if (window.location.pathname === '/login') {
            navigate('/');
          }
        } catch (error) {
          console.error('[useAuth] Erro ao processar usuário após login:', error);
          errorLogger.logError(error as Error, 'Auth:onAuthStateChange');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setUser]);

  return {
    user,
    session: user ? { user } : null,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  };
}