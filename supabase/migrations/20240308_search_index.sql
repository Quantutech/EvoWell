
-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for efficient text search
CREATE INDEX IF NOT EXISTS idx_providers_bio_trgm ON providers USING GIN (bio gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_providers_title_trgm ON providers USING GIN (professional_title gin_trgm_ops);
-- Note: Indexing concatenated text on joined tables isn't direct, 
-- but we can index the individual user columns if needed. 
-- For the RPC, the filter will run dynamically.

-- Search Function
CREATE OR REPLACE FUNCTION search_providers(
  search_query TEXT DEFAULT NULL,
  filter_specialty TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_max_price INTEGER DEFAULT NULL,
  filter_day TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id TEXT,
  user_id UUID,
  professional_title TEXT,
  bio TEXT,
  image_url TEXT,
  hourly_rate INTEGER,
  sliding_scale BOOLEAN,
  address_city TEXT,
  address_state TEXT,
  first_name TEXT,
  last_name TEXT,
  specialties TEXT[],
  languages TEXT[],
  active_days TEXT[],
  years_experience INTEGER,
  relevance FLOAT,
  full_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id::TEXT,
    p.user_id,
    p.professional_title,
    p.bio,
    p.image_url,
    p.hourly_rate,
    p.sliding_scale,
    p.address_city,
    p.address_state,
    u.first_name,
    u.last_name,
    -- Aggregated Specialties
    COALESCE(ARRAY(
      SELECT s.name 
      FROM provider_specialties ps 
      JOIN specialties s ON s.id = ps.specialty_id 
      WHERE ps.provider_id = p.id
    ), '{}'::TEXT[]) as specialties,
    -- Aggregated Languages
    COALESCE(ARRAY(
      SELECT l.language 
      FROM provider_languages l 
      WHERE l.provider_id = p.id
    ), '{}'::TEXT[]) as languages,
    -- Aggregated Active Days
    COALESCE(ARRAY(
      SELECT sch.day 
      FROM provider_schedules sch 
      WHERE sch.provider_id = p.id AND sch.active = true
    ), '{}'::TEXT[]) as active_days,
    p.years_experience,
    -- Relevance Score (1.0 if no query)
    (
      CASE WHEN search_query IS NULL OR search_query = '' THEN 1.0
      ELSE 
        GREATEST(
          similarity(p.professional_title, search_query),
          similarity(p.bio, search_query),
          similarity(u.first_name || ' ' || u.last_name, search_query)
        )
      END
    ) as relevance,
    -- Total Count (Window Function)
    count(*) OVER() as full_count
  FROM providers p
  JOIN users u ON p.user_id = u.id
  WHERE 
    p.is_published = true AND
    (filter_max_price IS NULL OR p.hourly_rate <= filter_max_price) AND
    (filter_state IS NULL OR filter_state = '' OR p.address_state ILIKE '%' || filter_state || '%') AND
    (
      filter_specialty IS NULL OR filter_specialty = '' OR EXISTS (
        SELECT 1 FROM provider_specialties ps 
        WHERE ps.provider_id = p.id AND ps.specialty_id = filter_specialty
      )
    ) AND
    (
      filter_day IS NULL OR filter_day = '' OR EXISTS (
        SELECT 1 FROM provider_schedules psch 
        WHERE psch.provider_id = p.id AND psch.day = filter_day AND psch.active = true
      )
    ) AND
    (
      search_query IS NULL OR search_query = '' OR 
      p.professional_title ILIKE '%' || search_query || '%' OR
      p.bio ILIKE '%' || search_query || '%' OR
      (u.first_name || ' ' || u.last_name) ILIKE '%' || search_query || '%'
    )
  ORDER BY relevance DESC, p.hourly_rate ASC
  LIMIT result_limit OFFSET result_offset;
END;
$$;
