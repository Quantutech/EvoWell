
-- Add Stripe status columns to providers table
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE;

-- Add payment columns to appointments table
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS amount INTEGER, -- in cents
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd',
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add index for stripe account lookups
CREATE INDEX IF NOT EXISTS idx_providers_stripe_account ON public.providers(stripe_account_id);
