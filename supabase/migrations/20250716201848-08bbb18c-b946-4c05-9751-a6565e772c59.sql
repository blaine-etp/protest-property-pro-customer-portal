-- Simplify INSERT policy for owners to work with token-based signup
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create simplified INSERT policy that allows creation during signup flow
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Allow creation if the created_by_user_id exists in profiles with valid token
  created_by_user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE p.authentication_token IS NOT NULL 
    AND p.token_expires_at > now()
  )
  OR
  -- Allow creation by authenticated users
  (auth.uid() IS NOT NULL AND created_by_user_id = auth.uid())
);