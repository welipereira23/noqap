import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('No signature', { status: 400 })
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')
    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret ?? ''
      )
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object
        const { error } = await supabaseClient
          .from('subscriptions')
          .upsert({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer,
            status: subscription.status,
            plan_id: subscription.items.data[0].price.id,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            trial_end: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000) 
              : null,
            cancel_at: subscription.cancel_at 
              ? new Date(subscription.cancel_at * 1000) 
              : null,
            canceled_at: subscription.canceled_at 
              ? new Date(subscription.canceled_at * 1000) 
              : null,
            user_id: subscription.metadata.user_id
          })
        if (error) throw error
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        const { error: deleteError } = await supabaseClient
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date()
          })
          .eq('stripe_subscription_id', deletedSubscription.id)
        if (deleteError) throw deleteError
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
