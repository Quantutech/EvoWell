
-- CLEANUP (Optional - remove if preserving existing data)
-- DELETE FROM auth.users WHERE email LIKE '%@evowell.test';
-- DELETE FROM public.users WHERE email LIKE '%@evowell.test';

-- 1. CREATE ADMIN USER
-- Insert into Auth (Identity)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001', 
  '00000000-0000-0000-0000-000000000000', 
  'authenticated', 
  'authenticated', 
  'admin@evowell.test', 
  crypt('password123', gen_salt('bf')), -- Password is 'password123'
  NOW(), 
  '{"provider":"email","providers":["email"]}', 
  '{"full_name":"Test Admin"}', 
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert into Public (Profile)
INSERT INTO public.users (id, email, first_name, last_name, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001', 
  'admin@evowell.test', 
  'Test', 
  'Admin', 
  'ADMIN'
) ON CONFLICT (id) DO NOTHING;


-- 2. CREATE PROVIDER USER
-- Insert into Auth
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002', 
  '00000000-0000-0000-0000-000000000000', 
  'authenticated', 
  'authenticated', 
  'provider@evowell.test', 
  crypt('password123', gen_salt('bf')), 
  NOW(), 
  '{"provider":"email","providers":["email"]}', 
  '{"full_name":"Dr. Test Provider"}', 
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert into Public User Profile
INSERT INTO public.users (id, email, first_name, last_name, role)
VALUES (
  'a0000000-0000-0000-0000-000000000002', 
  'provider@evowell.test', 
  'Test', 
  'Provider', 
  'PROVIDER'
) ON CONFLICT (id) DO NOTHING;

-- Insert into Public Provider Profile
INSERT INTO public.providers (
  id, user_id, professional_title, professional_category, 
  years_experience, bio, tagline, image_url, hourly_rate, 
  sliding_scale, is_published, moderation_status, subscription_tier, subscription_status
) VALUES (
  'prov-test-001', 
  'a0000000-0000-0000-0000-000000000002', 
  'Clinical Psychologist', 
  'Mental Health',
  10, 
  'This is a test provider account generated for platform validation.', 
  'Testing the future of care.', 
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
  150, 
  true, 
  true, 
  'APPROVED', 
  'PROFESSIONAL', 
  'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- Add Test Availability for Provider
INSERT INTO public.provider_schedules (provider_id, day, active, start_time, end_time)
VALUES 
('prov-test-001', 'Mon', true, '09:00', '17:00'),
('prov-test-001', 'Tue', true, '09:00', '17:00'),
('prov-test-001', 'Wed', true, '09:00', '17:00'),
('prov-test-001', 'Thu', true, '09:00', '17:00'),
('prov-test-001', 'Fri', true, '09:00', '17:00')
ON CONFLICT DO NOTHING;


-- 3. CREATE CLIENT USER
-- Insert into Auth
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000003', 
  '00000000-0000-0000-0000-000000000000', 
  'authenticated', 
  'authenticated', 
  'client@evowell.test', 
  crypt('password123', gen_salt('bf')), 
  NOW(), 
  '{"provider":"email","providers":["email"]}', 
  '{"full_name":"Test Client"}', 
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert into Public User Profile
INSERT INTO public.users (id, email, first_name, last_name, role)
VALUES (
  'a0000000-0000-0000-0000-000000000003', 
  'client@evowell.test', 
  'Test', 
  'Client', 
  'CLIENT'
) ON CONFLICT (id) DO NOTHING;
