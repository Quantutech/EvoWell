
-- Add timezone column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add timezone columns to appointments for historical record
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS provider_timezone TEXT,
ADD COLUMN IF NOT EXISTS client_timezone TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_timezone ON public.users(timezone);

-- Add timezone to provider_schedules (optional, if availability varies by zone)
-- For now, we assume provider availability is always in their profile timezone
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS timezone TEXT;
