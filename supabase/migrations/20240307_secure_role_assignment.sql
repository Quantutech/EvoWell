-- ==============================================================================
-- 1. SECURE SIGNUP TRIGGER
-- Enforces 'CLIENT' role on all new signups, ignoring client-side metadata.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_secure()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Extract name from metadata or fallback to email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Insert into public.users
  -- CRITICAL: We hardcode 'CLIENT' role here. Metadata is ignored for security.
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(user_name, ' ', 1),
    COALESCE(NULLIF(SUBSTRING(user_name FROM POSITION(' ' IN user_name) + 1), ''), 'User'),
    'CLIENT', 
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Drop existing trigger to ensure we use the secure version
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_secure();


-- ==============================================================================
-- 2. PROVIDER APPLICATIONS TABLE
-- Stores data for users applying to become providers.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.provider_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  professional_title TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_state TEXT NOT NULL,
  npi TEXT,
  years_experience INT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prov_app_user ON public.provider_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_prov_app_status ON public.provider_applications(status);

-- RLS
ALTER TABLE public.provider_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users view own applications" ON public.provider_applications
FOR SELECT USING (auth.uid() = user_id);

-- Users can create an application
CREATE POLICY "Users create applications" ON public.provider_applications
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins view all applications" ON public.provider_applications
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Admins can update applications (reviewing)
CREATE POLICY "Admins update applications" ON public.provider_applications
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);


-- ==============================================================================
-- 3. ADMIN RPC FUNCTIONS
-- Secure functions callable only by Admins to manage roles.
-- ==============================================================================

-- Helper to check admin status inside functions
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN') THEN
    RAISE EXCEPTION 'Access Denied: User is not an administrator.';
  END IF;
END;
$$ LANGUAGE plpgsql;


-- Function: Elevate User Role (Generic)
-- Usage: await supabase.rpc('elevate_user_role', { target_user_id: '...', new_role: 'ADMIN' })
CREATE OR REPLACE FUNCTION public.elevate_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  old_role TEXT;
BEGIN
  -- 1. Security Check
  PERFORM public.check_is_admin();

  -- 2. Get old role for audit
  SELECT role INTO old_role FROM public.users WHERE id = target_user_id;

  -- 3. Update Role
  UPDATE public.users 
  SET role = new_role, updated_at = NOW() 
  WHERE id = target_user_id;

  -- 4. Audit Log
  INSERT INTO public.audit_logs (user_id, action_type, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(), 
    'UPDATE', 
    'user_role', 
    target_user_id::text, 
    jsonb_build_object('old_role', old_role, 'new_role', new_role)
  );
END;
$$;


-- Function: Approve Provider Application
-- Usage: await supabase.rpc('approve_provider_application', { application_id: '...' })
CREATE OR REPLACE FUNCTION public.approve_provider_application(application_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  app_record RECORD;
BEGIN
  -- 1. Security Check
  PERFORM public.check_is_admin();

  -- 2. Fetch Application Data
  SELECT * INTO app_record FROM public.provider_applications WHERE id = application_id;
  
  IF app_record IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF app_record.status != 'PENDING' THEN
    RAISE EXCEPTION 'Application is not pending review';
  END IF;

  -- 3. Update Application Status
  UPDATE public.provider_applications
  SET 
    status = 'APPROVED',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = application_id;

  -- 4. Update User Role
  UPDATE public.users
  SET role = 'PROVIDER', updated_at = NOW()
  WHERE id = app_record.user_id;

  -- 5. Create Provider Profile
  INSERT INTO public.providers (
    id, -- Generate new UUID
    user_id,
    professional_title,
    npi,
    years_experience,
    moderation_status,
    is_published,
    subscription_tier,
    subscription_status,
    bio,
    hourly_rate,
    sliding_scale
  ) VALUES (
    gen_random_uuid()::text, -- Cast UUID to text if ID is text, or remove cast if UUID
    app_record.user_id,
    app_record.professional_title,
    app_record.npi,
    app_record.years_experience,
    'APPROVED',
    FALSE, -- Not published until they complete onboarding/settings
    'FREE',
    'TRIAL',
    'New provider profile.', -- Default bio
    100, -- Default rate
    FALSE
  )
  ON CONFLICT (user_id) DO NOTHING; -- Idempotency

  -- 6. Audit Log
  INSERT INTO public.audit_logs (user_id, action_type, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    'CREATE',
    'provider_approval',
    app_record.user_id::text,
    jsonb_build_object('application_id', application_id)
  );

END;
$$;


-- Function: Reject Provider Application
-- Usage: await supabase.rpc('reject_provider_application', { application_id: '...', reason: '...' })
CREATE OR REPLACE FUNCTION public.reject_provider_application(application_id UUID, reason TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- 1. Security Check
  PERFORM public.check_is_admin();

  -- 2. Update Application
  UPDATE public.provider_applications
  SET 
    status = 'REJECTED',
    rejection_reason = reason,
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = application_id
  RETURNING user_id INTO target_user_id;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- 3. Audit Log
  INSERT INTO public.audit_logs (user_id, action_type, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    'UPDATE',
    'provider_rejection',
    target_user_id::text,
    jsonb_build_object('application_id', application_id, 'reason', reason)
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.elevate_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_provider_application TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_provider_application TO authenticated;
