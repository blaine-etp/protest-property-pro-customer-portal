-- Update the database profile from "Demo User" to "dingus moist beard"
UPDATE public.profiles 
SET first_name = 'dingus', 
    last_name = 'moist beard'
WHERE user_id = '61075f98-529a-4c52-91c7-ee6a696bfa21';

-- Link orphaned properties (those without contact_id) to the existing "dingus moist beard" contact
UPDATE public.properties 
SET contact_id = 'bbfa44fa-3965-4045-b6cb-6d5385d1e6df'
WHERE user_id = '61075f98-529a-4c52-91c7-ee6a696bfa21' 
  AND contact_id IS NULL;