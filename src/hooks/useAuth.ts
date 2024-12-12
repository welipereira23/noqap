import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import errorLogger from '../lib/errorLogger';
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
      
      // Buscar usuário pelo email
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError) {
        console.error('[useAuth] Erro ao buscar usuário:', fetchError);
        throw new Error('Email ou senha inválidos');
      }

      if (!user) {
        console.error('[useAuth] Usuário não encontrado');
        throw new Error('Email ou senha inválidos');
      }

      // Verificar se é um usuário do Google
      if (user.google_id) {
        console.error('[useAuth] Usuário registrado com Google');
        throw new Error('Este email está vinculado ao Google. Por favor, faça login com Google.');
      }

      // Verificar a senha
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_password', {
          password,
          password_hash: user.password_hash
        });

      if (verifyError || !isValid) {
        console.error('[useAuth] Senha inválida');
        throw new Error('Email ou senha inválidos');
      }

      console.log('[useAuth] Login bem sucedido');

      // Verificar se o usuário está bloqueado
      if (user.is_blocked) {
        console.log('[useAuth] Usuário bloqueado');
        setUser({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_blocked: true
        });
        navigate('/access');
        return;
      }

      // Atualizar o estado do usuário
      setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_blocked: false
      });

      navigate('/');
    } catch (error) {
      console.error('[useAuth] Erro no login:', error);
      errorLogger.logError(error as Error, 'Auth:signIn');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Verificar se o email já existe
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('Este email já está registrado');
      }

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('[useAuth] Erro ao verificar email:', fetchError);
        throw fetchError;
      }

      // Hash da senha
      const { data: passwordHash, error: hashError } = await supabase
        .rpc('hash_password', {
          password
        });

      if (hashError) {
        console.error('[useAuth] Erro ao criar hash da senha:', hashError);
        throw hashError;
      }

      // Criar usuário
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          name,
          password_hash: passwordHash,
          role: 'user',
          is_blocked: false
        })
        .select()
        .single();

      if (createError) {
        console.error('[useAuth] Erro ao criar usuário:', createError);
        throw createError;
      }

      console.log('[useAuth] Usuário criado com sucesso');
      return newUser;
    } catch (error) {
      console.error('[useAuth] Erro no cadastro:', error);
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

  interface GoogleUserData {
    email: string;
    name: string;
    sub: string;
    picture?: string;
  }

  const signInWithGoogle = async (googleData: GoogleUserData | undefined) => {
    try {
      console.log('[useAuth] Recebido dados do Google:', googleData);
      
      if (!googleData) {
        console.error('[useAuth] Dados do Google não fornecidos');
        throw new Error('Dados do Google não fornecidos');
      }

      const { email, name, sub } = googleData;

      if (!email || !name || !sub) {
        console.error('[useAuth] Dados incompletos do Google:', { email, name, sub });
        throw new Error('Dados incompletos do Google');
      }

      // Verifica se o usuário já existe pelo email
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('[useAuth] Erro ao buscar usuário:', fetchError);
        throw fetchError;
      }

      if (!existingUser) {
        console.log('[useAuth] Criando novo usuário');
        // Criar novo usuário
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email,
            name,
            google_id: sub,
            is_blocked: false,
            role: 'user'
          })
          .select()
          .single();

        if (createError) {
          console.error('[useAuth] Erro ao criar usuário:', createError);
          throw createError;
        }

        console.log('[useAuth] Novo usuário criado:', newUser);
        setUser({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          is_blocked: false
        });
      } else {
        console.log('[useAuth] Usuário existente encontrado');
        
        if (existingUser.is_blocked) {
          setUser({
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
            is_blocked: true
          });
          navigate('/access');
          return;
        }

        // Atualiza os dados do usuário caso tenha mudado algo no Google
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name,
            google_id: sub
          })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('[useAuth] Erro ao atualizar usuário:', updateError);
          throw updateError;
        }

        setUser({
          id: existingUser.id,
          email: existingUser.email,
          name, // Usa o nome mais recente do Google
          role: existingUser.role,
          is_blocked: false
        });
      }

      navigate('/');
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

  // Recuperar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('bolt-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.id && parsedUser.email) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('[useAuth] Erro ao recuperar usuário:', error);
        localStorage.removeItem('bolt-user');
      }
    }
  }, []); // Executar apenas uma vez ao montar

  // Salvar usuário no localStorage quando mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem('bolt-user', JSON.stringify(user));
    }
  }, [user]);

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