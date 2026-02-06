
-- Backfill user profiles for existing OAuth users
INSERT INTO public.users (id, email, first_name, last_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 1),
    SPLIT_PART(au.email, '@', 1)
  ) as first_name,
  COALESCE(
    NULLIF(SUBSTRING(au.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN au.raw_user_meta_data->>'full_name') + 1), ''),
    'User'
  ) as last_name,
  'CLIENT' as role,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE 
  pu.id IS NULL  -- Only users without a profile
  AND au.email IS NOT NULL;  -- Must have valid email
