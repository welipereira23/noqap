import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { errorLogger } from '../utils/errorLog';
import { toast } from '../utils/toast';

interface AuthContextType {
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const initializationRef = useRef(false);
  const authCheckInProgressRef = useRef(false);

  const checkBlockStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_blocked')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Erro ao verificar status de bloqueio:', error);
        return false;
      }

      return data?.is_blocked || false;
    } catch (error) {
      console.error('[Auth] Erro ao verificar status:', error);
      return false;
    }
  };

  const processSession = async (session: any) => {
    try {
      if (authCheckInProgressRef.current) {
        console.log('[Auth] Verificação de autenticação já em andamento, pulando...');
        return;
      }

      authCheckInProgressRef.current = true;
      console.log('[Auth] Processando sessão:', session?.user?.email);

      if (!session?.user) {
        console.log('[Auth] Sem sessão ativa');
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('[Auth] Erro ao buscar dados do usuário:', userError);
        errorLogger.logError(userError, 'Auth:processSession');
        setUser(null);
        return;
      }

      // Atualizar o estado do usuário
      const cleanUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name || null,
        role: userData.role || 'user',
        is_blocked: userData.is_blocked || false
      };

      console.log('[Auth] Dados do usuário limpos:', cleanUser);

      // Verificar status de bloqueio e redirecionar se necessário
      if (userData.is_blocked) {
        console.log('[Auth] Usuário bloqueado:', userData.email);
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name || null,
          role: userData.role || 'user',
          is_blocked: true
        });
        navigate('/access', { replace: true });
      } else if (location.pathname === '/access') {
        console.log('[Auth] Usuário desbloqueado, redirecionando para página inicial');
        navigate('/');
      } else {
        setUser(cleanUser);
      }

      console.log('[Auth] Usuário autenticado:', userData.email, 'Role:', userData.role);
    } catch (error) {
      console.error('[Auth] Erro ao processar sessão:', error);
      errorLogger.logError(error as Error, 'Auth:processSession');
      setUser(null);
    } finally {
      authCheckInProgressRef.current = false;
      setIsLoading(false);
    }
  };

  // Monitorar mudanças no status de bloqueio
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
          console.log('[Auth] Mudança detectada no usuário:', payload.new);
          
          // Se o usuário foi bloqueado
          if (payload.new.is_blocked) {
            console.log('[Auth] Usuário foi bloqueado');
            setUser({
              ...user,
              is_blocked: true
            });
            navigate('/access');
          } 
          // Se o usuário foi desbloqueado
          else if (!payload.new.is_blocked && location.pathname === '/access') {
            console.log('[Auth] Usuário foi desbloqueado');
            setUser({
              ...user,
              is_blocked: false
            });
            navigate('/');
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  // Verificar status de bloqueio ao carregar a página
  useEffect(() => {
    if (!user?.id) return;

    const verifyBlockStatus = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('is_blocked')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[Auth] Erro ao verificar status de bloqueio:', error);
        return;
      }

      if (data.is_blocked && location.pathname !== '/access') {
        console.log('[Auth] Usuário está bloqueado, redirecionando para /access');
        setUser({
          ...user,
          is_blocked: true
        });
        navigate('/access');
      } else if (!data.is_blocked && location.pathname === '/access') {
        console.log('[Auth] Usuário não está bloqueado, redirecionando para /');
        setUser({
          ...user,
          is_blocked: false
        });
        navigate('/');
      }
    };

    verifyBlockStatus();
  }, [user?.id]);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    console.log('[Auth] Inicializando autenticação...');

    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      processSession(session);
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      processSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}