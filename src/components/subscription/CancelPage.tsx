import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function CancelPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Mostrar mensagem de cancelamento
    toast.error('Assinatura não concluída', {
      description: 'O processo de assinatura foi cancelado ou houve um erro no pagamento.',
    });

    // Redirecionar para a página de assinatura após 3 segundos
    setTimeout(() => {
      navigate('/subscription');
    }, 3000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pagamento não Concluído
        </h1>
        <p className="text-gray-600 mb-6">
          O processo de assinatura foi interrompido ou houve um erro no pagamento. 
          Você será redirecionado para tentar novamente.
        </p>
        <div className="animate-pulse text-sm text-gray-500">
          Redirecionando...
        </div>
      </div>
    </div>
  );
}
