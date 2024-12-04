import { useState } from 'react';
import { useStore } from '../store/useStore';
import { getStripe } from '../lib/stripe-client';
import * as stripeApi from '../lib/stripe-api';

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useStore((state) => state.user);

  const createCheckoutSession = async (priceId: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const { sessionId } = await stripeApi.createCheckoutSession(priceId, user.id);
      
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        throw stripeError;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error creating checkout session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToPortal = async (customerId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { url } = await stripeApi.createPortalSession(customerId);
      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error redirecting to portal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await stripeApi.cancelSubscription(subscriptionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error canceling subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (subscriptionId: string, priceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await stripeApi.updateSubscription(subscriptionId, priceId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error updating subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createCheckoutSession,
    redirectToPortal,
    cancelSubscription,
    updateSubscription,
  };
}
