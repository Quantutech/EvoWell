
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.14.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map tiers to Stripe Price IDs (configured in Supabase secrets)
const TIER_TO_PRICE_ID: Record<string, string> = {
  'FREE': Deno.env.get('STRIPE_PRICE_ID_STARTER') || 'price_starter_mock',
  'PROFESSIONAL': Deno.env.get('STRIPE_PRICE_ID_PROFESSIONAL') || 'price_pro_mock',
  'PREMIUM': Deno.env.get('STRIPE_PRICE_ID_PREMIUM') || 'price_premium_mock',
};

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
      // --- Client -> Provider Payments (Connect) ---
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Check if this is a subscription checkout (Provider -> Platform)
        if (session.mode === 'subscription') {
            const { providerId, tier } = session.metadata;
            if (providerId) {
                 await supabase.from('providers').update({
                    subscription_id: session.subscription,
                    subscription_tier: tier,
                    subscription_status: 'ACTIVE' // Will be refined by subscription.created/updated
                }).eq('id', providerId);
            }
            break;
        }

        // Otherwise, it's a Client -> Provider payment
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
      
      // --- Provider Connect Account Updates ---
      case 'account.updated': {
        const account = event.data.object;
        await supabase.from('providers').update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_payouts_enabled: account.payouts_enabled,
          stripe_onboarding_complete: account.details_submitted
        }).eq('stripe_account_id', account.id);
        break;
      }

      // --- Provider Subscription Updates (Platform Billing) ---
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const status = subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE';
        
        // Find provider by stripe_customer_id
        const { data: provider } = await supabase
            .from('providers')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single();

        if (provider) {
             await supabase.from('providers').update({
                subscription_id: subscription.id,
                subscription_status: status,
                // We might want to map price ID back to tier, but metadata is safer if available
                // subscription.items.data[0].price.id
            }).eq('id', provider.id);
        }
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
    const reqData = await req.json();
    const { action, providerId, redirectUrl } = reqData;

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- 1. Create Portal Session (Manage Billing) ---
    if (action === 'create_portal_session') {
      const { data: provider } = await supabase
        .from('providers')
        .select('stripe_customer_id')
        .eq('id', providerId)
        .single();

      if (!provider?.stripe_customer_id) {
        throw new Error('Provider has no billing account yet. Please upgrade to a plan first.');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: provider.stripe_customer_id,
        return_url: redirectUrl,
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- 2. Get Billing History ---
    if (action === 'get_billing_history') {
      const { data: provider } = await supabase
        .from('providers')
        .select('stripe_customer_id')
        .eq('id', providerId)
        .single();

      if (!provider?.stripe_customer_id) {
        return new Response(
          JSON.stringify({ invoices: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const invoices = await stripe.invoices.list({
        customer: provider.stripe_customer_id,
        limit: 10,
      });

      const formattedInvoices = invoices.data.map((inv: any) => ({
        id: inv.id,
        date: new Date(inv.created * 1000).toISOString(),
        amount: inv.total / 100,
        status: inv.status,
        pdfUrl: inv.invoice_pdf,
        number: inv.number,
        plan: inv.lines.data[0]?.description || 'Subscription'
      }));

      return new Response(
        JSON.stringify({ invoices: formattedInvoices }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- 3. Provider Subscription Checkout (Provider pays Platform) ---
    if (action === 'create_subscription_checkout') {
      const { tier, userEmail, userName } = reqData;

      // Get Provider details
      const { data: provider } = await supabase
        .from('providers')
        .select('id, stripe_customer_id')
        .eq('id', providerId)
        .single();

      if (!provider) throw new Error('Provider not found');

      let customerId = provider.stripe_customer_id;

      // Create Stripe Customer if not exists
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          name: userName,
          metadata: {
            providerId: providerId
          }
        });
        customerId = customer.id;
        
        // Save customer ID to DB
        await supabase.from('providers')
          .update({ stripe_customer_id: customerId })
          .eq('id', providerId);
      }

      const priceId = TIER_TO_PRICE_ID[tier];
      if (!priceId) throw new Error(`Invalid subscription tier: ${tier}`);

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${redirectUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${redirectUrl}?canceled=true`,
        metadata: {
          providerId,
          tier
        },
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- 4. Client Payment Checkout (Client pays Provider via Connect) ---
    if (action === 'create_checkout') {
      const { price, title, clientId, appointmentDate } = reqData;

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
