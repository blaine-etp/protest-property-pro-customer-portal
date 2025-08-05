-- Create missing profile for hardcoded user ID used in database mode
INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  role,
  is_authenticated,
  permissions
) VALUES (
  '61075f98-529a-4c52-91c7-ee6a696bfa21',
  'Database',
  'User',
  'database.user@example.com',
  '555-0123',
  'homeowner',
  true,
  'user'
) ON CONFLICT (user_id) DO NOTHING;