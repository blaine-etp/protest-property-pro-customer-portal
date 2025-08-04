-- Create test profiles with valid permission and role values

-- Create an admin user profile for testing with valid role and permissions
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
  'property_manager', -- Use valid role
  'administrator',    -- Use valid permission
  true,
  0,
  0
) ON CONFLICT (user_id) DO UPDATE SET
  permissions = 'administrator',
  role = 'property_manager',
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
  'homeowner',     -- Use valid role
  'user',          -- Use valid permission
  true,
  0,
  0
) ON CONFLICT (user_id) DO UPDATE SET
  permissions = 'user',
  role = 'homeowner',
  is_authenticated = true;