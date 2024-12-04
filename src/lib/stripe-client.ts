import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.error('Missing Stripe publishable key');
  throw new Error('Missing Stripe publishable key');
}

let stripePromise: Promise<any> | null = null;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
