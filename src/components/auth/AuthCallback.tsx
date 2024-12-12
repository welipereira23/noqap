import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Buscar dados do usuário
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: userData, error: userError }) => {
            if (userError) {
              console.error('[AuthCallback] Erro ao buscar usuário:', userError);
              return;
            }

            if (userData) {
              setUser({
                id: userData.id,
                email: userData.email,
                name: userData.name,
                is_blocked: userData.is_blocked || false,
                is_admin: userData.is_admin || false
              });
              
              navigate('/', { replace: true });
            }
          });
      } else {
        navigate('/login', { replace: true });
      }
    });
  }, [navigate, setUser]);

  return <div>Redirecionando...</div>;
}
