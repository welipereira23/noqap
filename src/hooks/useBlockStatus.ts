import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { errorLogger } from '../utils/errorLog';

export function useBlockStatus() {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  // Função para fazer logout e redirecionar
  const handleBlockedUser = async () => {
    try {
      console.log('[useBlockStatus] Iniciando processo de logout por bloqueio');
      
      // Primeiro limpa o estado do usuário
      setUser(null);
      
      // Depois faz logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('[useBlockStatus] Logout realizado com sucesso');
      
      // Por último redireciona
      navigate('/access');
      
      // Notifica o usuário
      toast.error('Sua conta foi bloqueada. Entre em contato com o administrador.');
    } catch (error) {
      console.error('[useBlockStatus] Erro ao processar bloqueio:', error);
      errorLogger.logError(error as Error, 'BlockStatus:handleBlockedUser');
      
      // Força redirecionamento mesmo em caso de erro
      navigate('/access');
    }
  };

  // Verifica status inicial do usuário
  useEffect(() => {
    const checkInitialStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_blocked')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.is_blocked) {
          console.log('[useBlockStatus] Usuário já está bloqueado');
          await handleBlockedUser();
        }
      } catch (error) {
        console.error('[useBlockStatus] Erro ao verificar status inicial:', error);
        errorLogger.logError(error as Error, 'BlockStatus:checkInitialStatus');
      }
    };

    checkInitialStatus();
  }, [user]);

  // Monitora mudanças no status
  useEffect(() => {
    if (!user) return;

    console.log('[useBlockStatus] Iniciando monitoramento de status para:', user.email);

    const subscription = supabase
      .channel('user-block-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('[useBlockStatus] Mudança detectada:', payload);
          
          if (payload.new && payload.new.is_blocked) {
            console.log('[useBlockStatus] Usuário bloqueado, iniciando logout');
            await handleBlockedUser();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('[useBlockStatus] Limpando monitoramento de status');
      subscription.unsubscribe();
    };
  }, [user, navigate, setUser]);
}
