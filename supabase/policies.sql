
-- Enable RLS on core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_blocked_dates ENABLE ROW LEVEL SECURITY;

-- Helper Function for Admin Checks
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- --- USERS TABLE ---
-- Self: Read/Update
-- Providers: Public Read (Basic Info)
-- Admin: Read All

CREATE POLICY "Users: View Self" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users: View Providers" ON public.users
FOR SELECT USING (
  role = 'PROVIDER' 
  AND EXISTS (
    SELECT 1 FROM public.providers 
    WHERE user_id = users.id 
    AND is_published = true 
    AND moderation_status = 'APPROVED'
  )
);

CREATE POLICY "Users: Admin View All" ON public.users
FOR SELECT USING (is_admin());

CREATE POLICY "Users: Update Self" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- --- PROVIDERS TABLE ---
-- Public: Read All
-- Owner/Admin: Update/Insert

CREATE POLICY "Providers: Public View" ON public.providers
FOR SELECT USING (is_published = true AND moderation_status = 'APPROVED');

CREATE POLICY "Providers: Owner Update" ON public.providers
FOR UPDATE USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Providers: Owner Insert" ON public.providers
FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

-- --- PROVIDER DETAILS (Sub-tables) ---
-- Public: Read All
-- Owner/Admin: Update/Insert via join check

CREATE POLICY "Edu: Public View" ON public.provider_education FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.providers 
    WHERE id = provider_education.provider_id 
    AND is_published = true 
    AND moderation_status = 'APPROVED'
  )
);
CREATE POLICY "Edu: Owner Manage" ON public.provider_education FOR ALL USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_education.provider_id AND user_id = auth.uid()) 
  OR is_admin()
);

-- Repeat pattern for Licenses, Specialties, Languages, Schedules, Blocked Dates
CREATE POLICY "Lic: Public View" ON public.provider_licenses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.providers 
    WHERE id = provider_licenses.provider_id 
    AND is_published = true 
    AND moderation_status = 'APPROVED'
  )
);
CREATE POLICY "Lic: Owner Manage" ON public.provider_licenses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_licenses.provider_id AND user_id = auth.uid()) OR is_admin()
);

CREATE POLICY "Spec: Public View" ON public.provider_specialties FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.providers 
    WHERE id = provider_specialties.provider_id 
    AND is_published = true 
    AND moderation_status = 'APPROVED'
  )
);
CREATE POLICY "Spec: Owner Manage" ON public.provider_specialties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_specialties.provider_id AND user_id = auth.uid()) OR is_admin()
);

CREATE POLICY "Lang: Public View" ON public.provider_languages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.providers 
    WHERE id = provider_languages.provider_id 
    AND is_published = true 
    AND moderation_status = 'APPROVED'
  )
);
CREATE POLICY "Lang: Owner Manage" ON public.provider_languages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_languages.provider_id AND user_id = auth.uid()) OR is_admin()
);

CREATE POLICY "Sched: Public View" ON public.provider_schedules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.providers 
    WHERE id = provider_schedules.provider_id 
    AND is_published = true 
    AND moderation_status = 'APPROVED'
  )
);
CREATE POLICY "Sched: Owner Manage" ON public.provider_schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_schedules.provider_id AND user_id = auth.uid()) OR is_admin()
);

CREATE POLICY "Block: Public View" ON public.provider_blocked_dates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.providers 
    WHERE id = provider_blocked_dates.provider_id 
    AND is_published = true 
    AND moderation_status = 'APPROVED'
  )
);
CREATE POLICY "Block: Owner Manage" ON public.provider_blocked_dates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_blocked_dates.provider_id AND user_id = auth.uid()) OR is_admin()
);

-- --- APPOINTMENTS TABLE ---
-- Participants: Read/Update
-- Client: Insert

CREATE POLICY "Appt: Participant View" ON public.appointments
FOR SELECT USING (
  client_id = auth.uid() 
  OR provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
  OR is_admin()
);

CREATE POLICY "Appt: Client Create" ON public.appointments
FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Appt: Participant Update" ON public.appointments
FOR UPDATE USING (
  client_id = auth.uid() 
  OR provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
);
