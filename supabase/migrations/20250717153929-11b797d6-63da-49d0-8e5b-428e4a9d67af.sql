-- Fix the INSERT policy for owners with correct syntax
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create corrected INSERT policy that allows creation during signup flow
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Allow if the created_by_user_id has a valid token (signup flow)
  created_by_user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now())
      OR
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);