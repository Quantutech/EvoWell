
-- Function to automatically create user profile when OAuth signup occurs
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_avatar TEXT;
  provider_name TEXT;
BEGIN
  -- Extract metadata from OAuth provider
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)  -- Fallback: use email prefix as name
  );
  
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );
  
  -- Determine which OAuth provider was used
  provider_name := COALESCE(
    NEW.raw_app_meta_data->>'provider',
    'email'
  );
  
  -- Log the operation
  RAISE NOTICE 'Creating user profile for OAuth user: % (provider: %)', NEW.email, provider_name;
  
  -- Create user profile in public.users table
  INSERT INTO public.users (
    id,
    email,
    first_name, -- Mapped from full_name approximation
    last_name,  -- Mapped from full_name approximation
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(user_name, ' ', 1), -- First Name
    COALESCE(NULLIF(SUBSTRING(user_name FROM POSITION(' ' IN user_name) + 1), ''), 'User'), -- Last Name or Default
    'CLIENT',  -- Default role for OAuth users (can be changed later)
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate inserts
  
  RAISE NOTICE 'User profile created successfully for: %', NEW.email;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block the auth signup
  RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
