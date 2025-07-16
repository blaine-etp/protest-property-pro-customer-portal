-- Update the INSERT policy for owners to work with the new access pattern
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create new INSERT policy that allows creation when property exists and user has access
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Allow if creating by token (during signup flow)
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = created_by_user_id 
    AND p.authentication_token IS NOT NULL 
    AND p.token_expires_at > now()
  )
  OR
  -- Allow if creating by authenticated user
  created_by_user_id = auth.uid()
);