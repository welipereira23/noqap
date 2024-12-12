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
      
      // Primeiro faz login no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('[useAuth] Erro no login:', authError);
        throw authError;
      }

      if (!authData.user) {
        console.error('[useAuth] Login bem sucedido mas sem dados do usuário');
        throw new Error('Login failed: No user data');
      }

      // Buscar dados adicionais do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
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
      return userData;
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
        options: {
          emailRedirectTo: REDIRECT_URL
        }
      });

      if (error) {
        console.error('[useAuth] Erro no cadastro:', error);
        throw error;
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
      
      // Clear the user state first
      setUser(null);
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[useAuth] Erro no logout:', error);
        // Don't throw the error if it's just a missing session
        if (!(error instanceof Error && error.message.includes('Auth session missing'))) {
          errorLogger.logError(error, 'Auth:signOut');
          throw error;
        }
      }

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

  const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://noqap.com';
  const REDIRECT_URL = import.meta.env.VITE_REDIRECT_URL || 'https://noqap.com/auth/callback';

  const signInWithGoogle = async () => {
    try {
      console.log('[useAuth] Iniciando login com Google');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URL,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('[useAuth] Erro no login com Google:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[useAuth] Erro inesperado no login com Google:', error);
      errorLogger.logError(error as Error, 'Auth:signInWithGoogle');
      throw error;
    }
  };

  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: any) => {
      console.log('[Auth] Processando sessão:', session);

      if (!session?.user) {
        console.log('[Auth] Sem sessão ativa');
        setUser(null);
        return;
      }

      try {
        // Verifica se o usuário existe na tabela users
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError && userError.code === 'PGRST116') {
          // Usuário não existe, vamos criar
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              role: 'user',
              is_blocked: false
            });

          if (insertError) {
            console.error('[Auth] Erro ao criar usuário:', insertError);
            throw insertError;
          }

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            role: 'user',
            is_blocked: false
          });
        } else if (userError) {
          console.error('[Auth] Erro ao verificar usuário:', userError);
          throw userError;
        } else {
          // Usuário existe
          if (existingUser.is_blocked) {
            setUser({
              ...existingUser,
              is_blocked: true
            });
            navigate('/access');
            return;
          }

          setUser({
            ...existingUser,
            is_blocked: false
          });
        }

        if (window.location.pathname === '/login') {
          navigate('/');
        }
      } catch (error) {
        console.error('[Auth] Erro ao processar autenticação:', error);
        errorLogger.logError(error as Error, 'Auth:handleAuthStateChange');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

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