# EvoWell Database Migration Guide

This guide details how to migrate from mock data to a real Supabase instance.

## 1. Schema Setup

Run the following SQL in your Supabase SQL Editor.

### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'CLIENT',
  timezone TEXT DEFAULT 'UTC',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true);
```

### Providers Table
```sql
CREATE TABLE providers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  professional_title TEXT,
  professional_category TEXT DEFAULT 'Mental Health Provider',
  npi TEXT,
  years_experience INTEGER DEFAULT 0,
  bio TEXT,
  tagline TEXT,
  image_url TEXT,
  hourly_rate NUMERIC DEFAULT 150,
  sliding_scale BOOLEAN DEFAULT FALSE,
  min_fee NUMERIC,
  max_fee NUMERIC,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  phone TEXT,
  website TEXT,
  pronouns TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  moderation_status TEXT DEFAULT 'PENDING',
  subscription_tier TEXT DEFAULT 'FREE',
  subscription_status TEXT DEFAULT 'TRIAL',
  profile_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers are viewable by everyone" ON providers FOR SELECT USING (true);
CREATE POLICY "Providers can update their own profile" ON providers FOR UPDATE USING (auth.uid() = user_id);
```

### Specialties & Meta Tables
```sql
CREATE TABLE specialties (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Add some seed specialties
INSERT INTO specialties (id, name, slug) VALUES 
('s1', 'Anxiety', 'anxiety'),
('s2', 'Depression', 'depression'),
('s3', 'Trauma', 'trauma');
```

## 2. Search Function (RPC)

Required for the search feature in `provider.service.ts`:

```sql
CREATE OR REPLACE FUNCTION search_providers(
  search_query TEXT DEFAULT NULL,
  filter_specialty TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_max_price NUMERIC DEFAULT NULL,
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
  hourly_rate NUMERIC,
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
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.user_id, p.professional_title, p.bio, p.image_url, 
    p.hourly_rate, p.sliding_scale, p.address_city, p.address_state,
    u.first_name, u.last_name,
    ARRAY[]::TEXT[] as specialties, -- Join with specialty table if exists
    ARRAY[]::TEXT[] as languages,
    ARRAY[]::TEXT[] as active_days,
    p.years_experience,
    1.0 as relevance,
    COUNT(*) OVER() as full_count
  FROM providers p
  JOIN users u ON p.user_id = u.id
  WHERE 
    p.is_published = true 
    AND p.moderation_status = 'APPROVED'
    AND (search_query IS NULL OR (
      u.first_name ILIKE '%' || search_query || '%' OR 
      u.last_name ILIKE '%' || search_query || '%' OR 
      p.bio ILIKE '%' || search_query || '%'
    ))
    AND (filter_state IS NULL OR p.address_state = filter_state)
    AND (filter_max_price IS NULL OR p.hourly_rate <= filter_max_price)
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql;
```

## 3. Data Migration (Mock to Supabase)

1. **Users**: In Supabase Dashboard, go to **Authentication** > **Users** and manually invite or create your test users.
2. **Profiles**: Copy the generated UUIDs from Auth and insert them into the `users` table.
3. **Providers**: Insert corresponding rows into the `providers` table using the `auth.uid`.

## 4. GCP Environment Configuration

Ensure your `app.yaml` includes:
```yaml
env_variables:
  VITE_SUPABASE_URL: "https://your-id.supabase.co"
  VITE_SUPABASE_ANON_KEY: "your-anon-key"
```
