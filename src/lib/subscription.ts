import { supabase } from './supabase';
import { stripe } from './stripe';
import { Database } from '../types/supabase';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type User = Database['public']['Tables']['users']['Row'];

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}

export async function createCustomer(user: User) {
  try {
    // Cria customer no Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        supabaseUUID: user.id
      }
    });

    // Atualiza user com stripe_customer_id
    const { error } = await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id);

    if (error) throw error;

    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  userId: string
) {
  try {
    // Cria subscription no Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 14,
      metadata: {
        supabaseUUID: userId
      }
    });

    // Insere subscription no Supabase
    const { error } = await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      status: subscription.status,
      price_id: priceId,
      trial_start: new Date(subscription.trial_start! * 1000).toISOString(),
      trial_end: new Date(subscription.trial_end! * 1000).toISOString(),
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    });

    if (error) throw error;

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    // Cancela subscription no Stripe
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Atualiza status no Supabase
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        canceled_at: new Date(subscription.canceled_at! * 1000).toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) throw error;

    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}