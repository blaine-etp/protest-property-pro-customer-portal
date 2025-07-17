-- Fix the owners INSERT policy to properly validate the token-based signup flow
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create a more robust INSERT policy that handles the signup flow correctly
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- During signup flow: Allow if created_by_user_id matches a profile with valid token
  created_by_user_id IS NOT NULL AND EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.user_id = created_by_user_id 
    AND p.authentication_token IS NOT NULL 
    AND p.token_expires_at > now()
  )
  OR
  -- For authenticated users: Allow if created_by_user_id matches auth.uid()
  (auth.uid() IS NOT NULL AND created_by_user_id = auth.uid())
);