-- Fix the INSERT policy for owners to work with signup flow
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create a simplified INSERT policy that allows creation during signup flow
CREATE POLICY "Users can insert owners during signup with valid token" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Simply check if created_by_user_id has a valid token in profiles
  EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.user_id = created_by_user_id 
    AND p.authentication_token IS NOT NULL 
    AND p.token_expires_at > now()
  )
);

-- Add SELECT policy to profiles table to allow foreign key validation during signup
CREATE POLICY "Allow foreign key validation for signup tokens"
ON public.profiles
FOR SELECT
USING (
  -- Allow SELECT for profiles with valid tokens (needed for foreign key validation)
  authentication_token IS NOT NULL 
  AND token_expires_at > now()
);