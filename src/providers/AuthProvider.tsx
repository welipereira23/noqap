import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/api';
import { errorLogger } from '../utils/errorLog';

const AuthContext = createContext<{
  isLoading: boolean;
}>({
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        // Verifica sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
          errorLogger.logError(error, 'Auth:getSession');
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Sessão encontrada, buscando dados do usuário:', session.user.id);
          
          // Busca dados completos do usuário
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Erro ao buscar dados do usuário:', userError);
            errorLogger.logError(userError, 'Auth:getUser');
            setIsLoading(false);
            return;
          }

          if (userData) {
            console.log('Dados do usuário encontrados:', userData);
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
            });
          }
        } else {
          console.log('Nenhuma sessão encontrada');
          setUser(null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro inesperado na inicialização da autenticação:', error);
        errorLogger.logError(error as Error, 'Auth:initialization');
        setIsLoading(false);
      }
    }

    initializeAuth();

    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento de autenticação:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Usuário logado, buscando dados:', session.user.id);
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Erro ao buscar dados do usuário após login:', userError);
            return;
          }

          if (userData) {
            console.log('Dados do usuário atualizados após login:', userData);
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('Usuário deslogado');
          setUser(null);
          navigate('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setUser]);

  return (
    <AuthContext.Provider value={{ isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Exportar o hook como constante para evitar problemas de HMR
const useAuthContext = () => useContext(AuthContext);
export { useAuthContext };