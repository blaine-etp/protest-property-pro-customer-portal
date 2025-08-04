-- Update blaine@easytaxprotest.com to have administrator permissions
UPDATE public.profiles 
SET permissions = 'administrator'
WHERE email = 'blaine@easytaxprotest.com';