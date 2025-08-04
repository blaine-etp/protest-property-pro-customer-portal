-- Create an admin user profile for testing
-- This will create a profile that can be associated with a Supabase auth user

INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name,
  email,
  role,
  permissions,
  is_authenticated,
  referral_credit_balance,
  lifetime_savings
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Placeholder user_id - will be updated after auth user creation
  'Admin',
  'User',
  'admin@example.com',
  'admin',
  'admin',
  true,
  0,
  0
) ON CONFLICT (user_id) DO UPDATE SET
  permissions = 'admin',
  role = 'admin',
  is_authenticated = true;

-- Also create a customer profile for testing
INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name,
  email,
  role,
  permissions,
  is_authenticated,
  referral_credit_balance,
  lifetime_savings
) VALUES (
  '00000000-0000-0000-0000-000000000002', -- Placeholder user_id - will be updated after auth user creation
  'John',
  'Customer',
  'customer@example.com',
  'homeowner',
  'user',
  true,
  0,
  0
) ON CONFLICT (user_id) DO UPDATE SET
  permissions = 'user',
  role = 'homeowner',
  is_authenticated = true;