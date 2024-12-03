import { STRIPE_PLANS } from '../lib/stripe';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function getIntervalText(interval: 'month' | 'year'): string {
  return interval === 'month' ? 'mês' : 'ano';
}

export function getPlanFeatures(planId: string) {
  const plan = Object.values(STRIPE_PLANS).find(
    (plan) => plan.name.toLowerCase() === planId.toLowerCase()
  );
  return plan?.features || [];
}

export function isPlanActive(currentPlan: string | null, targetPlan: string): boolean {
  return currentPlan?.toLowerCase() === targetPlan.toLowerCase();
}

export function getUpgradeText(currentPlan: string | null, targetPlan: string): string {
  const plans = Object.values(STRIPE_PLANS);
  const currentPlanIndex = plans.findIndex(
    (plan) => plan.name.toLowerCase() === currentPlan?.toLowerCase()
  );
  const targetPlanIndex = plans.findIndex(
    (plan) => plan.name.toLowerCase() === targetPlan.toLowerCase()
  );

  if (currentPlanIndex === -1 || targetPlanIndex === -1) return 'Assinar';
  return targetPlanIndex > currentPlanIndex ? 'Fazer Upgrade' : 'Fazer Downgrade';
}

export function calculateTrialEndDate(days: number = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
