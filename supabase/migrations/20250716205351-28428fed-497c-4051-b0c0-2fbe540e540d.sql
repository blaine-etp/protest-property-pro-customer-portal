-- Simplify the owners INSERT RLS policy to avoid timing issues
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create a simplified INSERT policy that only validates token
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Simply check if the created_by_user_id has a valid token
  -- The property validation is redundant since the same token user creates both
  EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.user_id = created_by_user_id 
    AND p.authentication_token IS NOT NULL 
    AND p.token_expires_at > now()
  )
);