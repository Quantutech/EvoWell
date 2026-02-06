
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.14.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
  })

  // Handle Webhooks
  if (req.method === 'POST' && req.url.endsWith('/webhook')) {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body, 
        signature!, 
        Deno.env.get('STRIPE_WEBHOOK_SECRET')!
      );
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Metadata contains our internal IDs
        const { providerId, clientId, servicePackageId, appointmentDate } = session.metadata;
        
        // 1. Create Appointment Record (Mark as PAID)
        if (providerId && clientId && appointmentDate) {
          await supabase.from('appointments').insert({
            provider_id: providerId,
            client_id: clientId,
            date_time: appointmentDate,
            status: 'PAID',
            payment_intent_id: session.payment_intent,
            amount: session.amount_total,
            currency: session.currency
          });
        }
        
        // 2. Notify Provider
        await supabase.from('notifications').insert({
          user_id: (await supabase.from('providers').select('user_id').eq('id', providerId).single()).data?.user_id,
          type: 'payment',
          title: 'New Payment Received',
          message: `You received a payment of $${session.amount_total! / 100}`,
          is_read: false
        });
        
        break;
      }
      
      case 'account.updated': {
        const account = event.data.object;
        await supabase.from('providers').update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_payouts_enabled: account.payouts_enabled,
          stripe_onboarding_complete: account.details_submitted
        }).eq('stripe_account_id', account.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // Handle CORS for client-side calls
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, providerId, price, title, clientId, appointmentDate, redirectUrl } = await req.json();

    if (action === 'create_checkout') {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Get Provider's Stripe Account ID
      const { data: provider } = await supabase
        .from('providers')
        .select('stripe_account_id')
        .eq('id', providerId)
        .single();

      if (!provider?.stripe_account_id) {
        throw new Error('Provider is not connected to Stripe');
      }

      // Calculate Application Fee (e.g., 10%)
      const amountInCents = Math.round(price * 100);
      const appFee = Math.round(amountInCents * 0.10);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: title,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${redirectUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${redirectUrl}?canceled=true`,
        payment_intent_data: {
          application_fee_amount: appFee,
          transfer_data: {
            destination: provider.stripe_account_id,
          },
        },
        metadata: {
          providerId,
          clientId,
          appointmentDate // Optional: If booking directly
        },
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})