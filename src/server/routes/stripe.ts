import express from 'express';
import { stripe } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';

const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, userId } = req.body;

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Create or get Stripe customer
    let customerId = userData.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          user_id: userId,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: `${process.env.VITE_APP_URL}/subscription/success`,
      cancel_url: `${process.env.VITE_APP_URL}/subscription/cancel`,
      metadata: {
        user_id: userId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.VITE_APP_URL}/subscription`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

router.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    res.json(subscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

router.post('/update-subscription', async (req, res) => {
  try {
    const { subscriptionId, priceId } = req.body;
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
    });

    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

export default router;
