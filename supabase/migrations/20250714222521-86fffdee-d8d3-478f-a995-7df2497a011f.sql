-- Add permissions column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN permissions text DEFAULT 'user';

-- Add check constraint to ensure only valid permission values
ALTER TABLE public.profiles 
ADD CONSTRAINT check_permissions CHECK (permissions IN ('user', 'administrator'));

-- Update RLS policies to allow administrators to access all data
CREATE POLICY "Administrators can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  ((authentication_token IS NOT NULL) AND (token_expires_at > now())) OR 
  ((user_id = auth.uid()) AND (is_authenticated = true)) OR
  (permissions = 'administrator' AND user_id = auth.uid())
);

-- Create policy for administrators to manage all applications
CREATE POLICY "Administrators can view all applications" 
ON public.applications 
FOR SELECT 
USING (
  (user_id IN ( SELECT p.user_id
   FROM profiles p
  WHERE (((p.authentication_token IS NOT NULL) AND (p.token_expires_at > now())) OR ((p.user_id = auth.uid()) AND (p.is_authenticated = true))))) OR
  (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'))
);

-- Create policy for administrators to view all properties
CREATE POLICY "Administrators can view all properties" 
ON public.properties 
FOR SELECT 
USING (
  (user_id IN ( SELECT p.user_id
   FROM profiles p
  WHERE (((p.authentication_token IS NOT NULL) AND (p.token_expires_at > now())) OR ((p.user_id = auth.uid()) AND (p.is_authenticated = true))))) OR
  (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'))
);