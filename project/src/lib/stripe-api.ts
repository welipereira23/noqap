import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('Missing API URL');
}

async function fetchApi(endpoint: string, options: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || 'An error occurred');
  }

  return response.json();
}

export async function createCheckoutSession(priceId: string, userId: string) {
  return fetchApi('/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ priceId, userId }),
  });
}

export async function createPortalSession(customerId: string) {
  return fetchApi('/stripe/create-portal-session', {
    method: 'POST',
    body: JSON.stringify({ customerId }),
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return fetchApi('/stripe/cancel-subscription', {
    method: 'POST',
    body: JSON.stringify({ subscriptionId }),
  });
}

export async function updateSubscription(subscriptionId: string, priceId: string) {
  return fetchApi('/stripe/update-subscription', {
    method: 'POST',
    body: JSON.stringify({ subscriptionId, priceId }),
  });
}
