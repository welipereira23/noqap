import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthCallback] Erro ao obter sessão:', error);
          navigate('/login');
          return;
        }

        if (!session) {
          console.log('[AuthCallback] Sem sessão ativa');
          navigate('/login');
          return;
        }

        navigate('/');
      } catch (error) {
        console.error('[AuthCallback] Erro inesperado:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Processando autenticação...</p>
      </div>
    </div>
  );
}
