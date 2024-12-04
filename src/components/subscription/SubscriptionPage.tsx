import React from 'react';
import { SubscriptionStatus } from './SubscriptionStatus';
import { PlansGrid } from './PlansGrid';
import { useStore } from '../../store/useStore';

export function SubscriptionPage() {
  const subscription = useStore((state) => state.subscription);

  return (
    <div className="space-y-6">
      <SubscriptionStatus />
      {(!subscription || subscription.status === 'expired' || subscription.status === 'cancelled') && (
        <PlansGrid />
      )}
    </div>
  );
}