-- Update the INSERT policy for owners to allow creation during signup flow
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create updated INSERT policy that allows creation during signup flow
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Allow creation during signup flow (profile exists but not authenticated yet)
  created_by_user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE (
      -- During signup flow: profile exists but not authenticated
      (p.is_authenticated = false AND p.authentication_token IS NOT NULL AND p.token_expires_at > now())
      OR
      -- Regular authenticated flow
      (p.user_id = auth.uid() AND p.is_authenticated = true)
      OR
      -- Token-based access
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now())
    )
  )
);