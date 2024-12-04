import Stripe from 'stripe';

if (!import.meta.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key');
}

export const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true
});

export const STRIPE_PLANS = {
  BASIC: {
    name: 'Básico',
    price: 29.90,
    interval: 'month' as const,
    features: [
      { text: 'Registro ilimitado de turnos', included: true },
      { text: 'Relatórios básicos', included: true },
      { text: 'Exportação de dados', included: true },
      { text: 'Relatórios avançados', included: false },
      { text: 'Suporte prioritário', included: false }
    ],
    recommended: true,
    trial: {
      text: '14 dias grátis',
      days: 14
    }
  },
  PRO: {
    name: 'Profissional',
    price: 49.90,
    interval: 'month' as const,
    features: [
      { text: 'Registro ilimitado de turnos', included: true },
      { text: 'Relatórios básicos', included: true },
      { text: 'Exportação de dados', included: true },
      { text: 'Relatórios avançados', included: true },
      { text: 'Múltiplos usuários', included: true },
    ],
    recommended: true
  },
  ENTERPRISE: {
    name: 'Empresarial',
    price: 449.90,
    interval: 'year' as const,
    features: [
      { text: 'Registro ilimitado de turnos', included: true },
      { text: 'Relatórios básicos', included: true },
      { text: 'Exportação de dados', included: true },
      { text: 'Relatórios avançados', included: true },
      { text: 'Múltiplos usuários', included: true },
    ]
  }
};