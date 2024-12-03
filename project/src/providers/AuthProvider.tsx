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
    // Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        errorLogger.logError(error, 'Auth:getSession');
        return;
      }

      if (session?.user) {
        // Busca dados completos do usuário
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: userData, error: userError }) => {
            if (userError) {
              errorLogger.logError(userError, 'Auth:getUser');
              return;
            }

            if (userData) {
              setUser({
                id: userData.id,
                email: userData.email,
                name: userData.name,
              });
            }
          });
      }
      setIsLoading(false);
    });

    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
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

export const useAuthContext = () => useContext(AuthContext);