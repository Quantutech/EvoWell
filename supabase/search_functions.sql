
-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_providers_rate ON public.providers(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_providers_state ON public.providers(address_state);
CREATE INDEX IF NOT EXISTS idx_providers_published ON public.providers(is_published);
CREATE INDEX IF NOT EXISTS idx_prov_specs_id ON public.provider_specialties(specialty_id);
CREATE INDEX IF NOT EXISTS idx_prov_sched_day ON public.provider_schedules(day);

-- Advanced Search RPC
-- Returns provider IDs to allow the client to structure the final data fetch
CREATE OR REPLACE FUNCTION search_providers_rpc(
  keyword text DEFAULT null,
  specialty_filter text DEFAULT null,
  max_rate int DEFAULT null,
  state_filter text DEFAULT null,
  day_filter text DEFAULT null
)
RETURNS TABLE (id text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id
  FROM public.providers p
  JOIN public.users u ON p.user_id = u.id
  WHERE 
    p.is_published = true AND
    p.moderation_status = 'APPROVED' AND
    (max_rate IS NULL OR p.hourly_rate <= max_rate) AND
    (state_filter IS NULL OR p.address_state ILIKE '%' || state_filter || '%') AND
    -- Specialty Filter (Exists Check)
    (specialty_filter IS NULL OR EXISTS (
      SELECT 1 FROM public.provider_specialties ps 
      WHERE ps.provider_id = p.id AND ps.specialty_id = specialty_filter
    )) AND
    -- Day Availability Filter (Exists Check)
    (day_filter IS NULL OR EXISTS (
      SELECT 1 FROM public.provider_schedules psch 
      WHERE psch.provider_id = p.id AND psch.day = day_filter AND psch.active = true
    )) AND
    -- Text Search (Bio, Title, Name)
    (keyword IS NULL OR 
      p.bio ILIKE '%' || keyword || '%' OR 
      p.professional_title ILIKE '%' || keyword || '%' OR
      u.first_name ILIKE '%' || keyword || '%' OR
      u.last_name ILIKE '%' || keyword || '%'
    );
END;
$$;
