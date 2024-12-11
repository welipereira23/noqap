import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';

export function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSubscription = useStore((state) => state.setSubscription);
  const userId = useStore((state) => state.user?.id);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Buscar a assinatura atualizada
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        // Atualizar o estado da assinatura
        setSubscription(subscription);

        // Mostrar mensagem de sucesso
        toast.success('Assinatura realizada com sucesso!', {
          description: 'Bem-vindo ao NoQap! Você agora tem acesso a todos os recursos.',
        });

        // Redirecionar para o início após 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Erro ao verificar assinatura', {
          description: 'Por favor, entre em contato com o suporte.',
        });
      }
    };

    if (userId) {
      checkSubscription();
    }
  }, [userId, setSubscription, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pagamento Aprovado!
        </h1>
        <p className="text-gray-600 mb-6">
          Sua assinatura foi confirmada com sucesso. Você será redirecionado para a página inicial em instantes.
        </p>
        <div className="animate-pulse text-sm text-gray-500">
          Redirecionando...
        </div>
      </div>
    </div>
  );
}
