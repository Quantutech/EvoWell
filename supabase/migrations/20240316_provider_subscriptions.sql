-- Add Stripe Customer ID and Subscription ID to providers table
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- Create index for faster lookups by stripe_customer_id (useful for webhooks)
CREATE INDEX IF NOT EXISTS idx_providers_stripe_customer ON public.providers(stripe_customer_id);
