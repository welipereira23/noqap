import { useState } from 'react';
import { useStripe } from '../hooks/useStripe';

export function SubscriptionPlan() {
  const [isLoading, setIsLoading] = useState(false);
  const { createCheckoutSession } = useStripe();

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { url } = await createCheckoutSession('price_1QRn0TE1aaa3UksGojn5Y4zG');
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-8">
        <h3 className="text-2xl font-bold text-center mb-8">Plano Básico</h3>
        <div className="text-center mb-8">
          <span className="text-4xl font-bold">R$ 29,90</span>
          <span className="text-gray-600">/mês</span>
        </div>
        <ul className="space-y-4 mb-8">
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Registro ilimitado de horas
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Relatórios detalhados
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Suporte prioritário
          </li>
        </ul>
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Carregando...' : 'Assinar agora'}
        </button>
      </div>
    </div>
  );
}
