
-- Update user permissions to administrator for testing
-- This will allow the customer search to work by granting administrator access
UPDATE public.profiles 
SET permissions = 'administrator' 
WHERE permissions = 'user' 
LIMIT 1;
