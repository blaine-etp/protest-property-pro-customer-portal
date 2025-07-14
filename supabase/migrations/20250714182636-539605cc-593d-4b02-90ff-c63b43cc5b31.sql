-- Clean up duplicate emails, keeping only the most recent profile for each email
DELETE FROM public.profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id 
  FROM public.profiles 
  ORDER BY email, created_at DESC
);

-- Now add unique constraint to profiles email column to prevent duplicates
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Create index for better email lookup performance  
CREATE INDEX idx_profiles_email ON public.profiles(email);