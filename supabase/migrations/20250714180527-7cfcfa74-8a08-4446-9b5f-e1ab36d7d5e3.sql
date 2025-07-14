-- Add unique constraint to profiles email column to prevent duplicates
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Create index for better email lookup performance  
CREATE INDEX idx_profiles_email ON public.profiles(email);