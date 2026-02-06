
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.14.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, userId, providerId, returnUrl } = await req.json()

    if (action === 'create_account') {
      // 1. Create Express Account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Defaulting to US for this iteration
        email: undefined, // Let Stripe collect this or pass user email if available
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })

      // 2. Save Account ID to Database
      const { error } = await supabase
        .from('providers')
        .update({ stripe_account_id: account.id })
        .eq('id', providerId)

      if (error) throw error

      return new Response(
        JSON.stringify({ accountId: account.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'create_account_link') {
      const { accountId } = await req.json();
      
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${returnUrl}?refresh=true`,
        return_url: `${returnUrl}?success=true`,
        type: 'account_onboarding',
      })

      return new Response(
        JSON.stringify({ url: accountLink.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'create_login_link') {
      const { accountId } = await req.json();
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      
      return new Response(
        JSON.stringify({ url: loginLink.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'check_status') {
      const { accountId } = await req.json();
      const account = await stripe.accounts.retrieve(accountId);
      
      const chargesEnabled = account.charges_enabled;
      const payoutsEnabled = account.payouts_enabled;
      const detailsSubmitted = account.details_submitted;

      // Update Database with latest status
      await supabase.from('providers').update({
        stripe_charges_enabled: chargesEnabled,
        stripe_payouts_enabled: payoutsEnabled,
        stripe_onboarding_complete: detailsSubmitted
      }).eq('stripe_account_id', accountId);

      return new Response(
        JSON.stringify({ 
          chargesEnabled, 
          payoutsEnabled, 
          detailsSubmitted 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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