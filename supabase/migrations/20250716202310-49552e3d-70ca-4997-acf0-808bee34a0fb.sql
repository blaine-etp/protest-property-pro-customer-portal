-- Fix the RLS policy to work with the actual data flow during owner creation
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create INSERT policy that works with property_id being set on owner creation
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Allow if the property exists and belongs to a user with valid token
  property_id IN (
    SELECT pr.id
    FROM properties pr
    JOIN profiles p ON (pr.user_id = p.user_id)
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) 
      OR 
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
  OR
  -- Allow if created by authenticated user
  (auth.uid() IS NOT NULL AND created_by_user_id = auth.uid())
);