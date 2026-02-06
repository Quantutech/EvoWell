
-- Enable btree_gist for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create service_packages table
CREATE TABLE IF NOT EXISTS public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  sessions_included INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for service_packages
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service packages" ON public.service_packages FOR SELECT USING (true);
CREATE POLICY "Providers manage own packages" ON public.service_packages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = service_packages.provider_id AND user_id = auth.uid())
);

-- Enhance appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS service_package_id UUID REFERENCES public.service_packages(id),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, exempted
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS amount_cents INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- Add Constraint to prevent double booking
-- Exclude rows where provider_id matches AND time ranges overlap, 
-- ignoring cancelled/rejected appointments
ALTER TABLE public.appointments
ADD CONSTRAINT no_overlap_appointments
EXCLUDE USING gist (
  provider_id WITH =,
  tsrange(date_time, date_time + (duration_minutes || ' minutes')::interval) WITH &&
) WHERE (status NOT IN ('CANCELLED', 'REJECTED'));

-- RPC: Check Availability
CREATE OR REPLACE FUNCTION check_slot_available(
  p_provider_id UUID,
  p_datetime TIMESTAMPTZ,
  p_duration INTEGER
) RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
DECLARE
  v_end_time TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  v_end_time := p_datetime + (p_duration || ' minutes')::interval;

  -- 1. Check for overlapping appointments
  SELECT COUNT(*) INTO v_count
  FROM public.appointments
  WHERE provider_id = p_provider_id
    AND status NOT IN ('CANCELLED', 'REJECTED')
    AND tsrange(date_time, date_time + (duration_minutes || ' minutes')::interval) && tsrange(p_datetime, v_end_time);

  IF v_count > 0 THEN
    RETURN FALSE;
  END IF;

  -- 2. Check for blocked dates
  -- Assuming blocked_dates stores just the date part (YYYY-MM-DD) or full timestamp range
  -- For this schema, provider_blocked_dates has a 'date' column of type TEXT or DATE
  -- We cast to date to compare
  SELECT COUNT(*) INTO v_count
  FROM public.provider_blocked_dates
  WHERE provider_id = p_provider_id
    AND date::DATE = p_datetime::DATE;

  IF v_count > 0 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- RPC: Book Appointment
CREATE OR REPLACE FUNCTION book_appointment(
  p_provider_id UUID,
  p_client_id UUID,
  p_datetime TIMESTAMPTZ,
  p_duration INTEGER,
  p_service_package_id UUID DEFAULT NULL,
  p_amount_cents INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_appt_id UUID;
  v_available BOOLEAN;
BEGIN
  -- Check availability explicitly first to give nice error
  v_available := check_slot_available(p_provider_id, p_datetime, p_duration);
  
  IF NOT v_available THEN
    RAISE EXCEPTION 'Slot is not available';
  END IF;

  INSERT INTO public.appointments (
    provider_id,
    client_id,
    date_time,
    duration_minutes,
    service_package_id,
    amount_cents,
    notes,
    status,
    payment_status
  ) VALUES (
    p_provider_id,
    p_client_id,
    p_datetime,
    p_duration,
    p_service_package_id,
    p_amount_cents,
    p_notes,
    'PENDING',
    'pending'
  ) RETURNING id INTO v_appt_id;

  RETURN v_appt_id;
END;
$$;
