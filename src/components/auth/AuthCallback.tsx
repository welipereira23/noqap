import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

export function AuthCallback() {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Recupera a sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        if (!session?.user) {
          console.error('[AuthCallback] Sem sessão de usuário');
          navigate('/login');
          return;
        }

        // Busca dados adicionais do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          // Se o usuário não existe, cria um novo registro
          if (userError.code === 'PGRST116') {
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata.full_name,
                role: 'user',
                is_blocked: false
              }])
              .select()
              .single();

            if (createError) throw createError;
            
            setUser({
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              is_blocked: false
            });
          } else {
            throw userError;
          }
        } else {
          // Verifica se o usuário está bloqueado
          if (userData.is_blocked) {
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

          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role || 'user',
            is_blocked: false
          });
        }

        navigate('/');
      } catch (error) {
        console.error('[AuthCallback] Erro:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
