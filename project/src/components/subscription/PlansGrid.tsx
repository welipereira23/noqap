import React, { useState } from 'react';
import { createCheckoutSession } from '../../lib/stripe-api';
import { PlanCard } from './PlanCard';
import { toast } from 'sonner';

const plans = [
  {
    name: 'Básico',
    price: 29.90,
    priceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID!,
    interval: 'month' as const,
    trial: {
      days: 14,
      text: '14 dias grátis'
    },
    features: [
      { text: 'Rastreamento ilimitado de tempo', included: true },
      { text: 'Relatórios básicos', included: true },
      { text: 'Exportação de dados', included: true },
      { text: 'Integração com calendário', included: false },
      { text: 'Suporte prioritário', included: false }
    ]
  },
  {
    name: 'Pro',
    price: 49.90,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID!,
    interval: 'month' as const,
    recommended: true,
    trial: {
      days: 14,
      text: '14 dias grátis'
    },
    features: [
      { text: 'Rastreamento ilimitado de tempo', included: true },
      { text: 'Relatórios avançados', included: true },
      { text: 'Exportação de dados', included: true },
      { text: 'Integração com calendário', included: true },
      { text: 'Suporte prioritário', included: true }
    ]
  }
];

export function PlansGrid() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (priceId: string) => {
    try {
      setLoadingPlan(priceId);
      const { url } = await createCheckoutSession(priceId);
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <PlanCard
          key={plan.priceId}
          plan={plan}
          onSelect={() => handleSelectPlan(plan.priceId)}
          isLoading={loadingPlan === plan.priceId}
        />
      ))}
    </div>
  );
}