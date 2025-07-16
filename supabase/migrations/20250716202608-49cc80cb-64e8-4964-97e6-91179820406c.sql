-- Debug the exact issue by making the policy very explicit about token validation
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create a more specific INSERT policy for debugging
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Check if the created_by_user_id has a valid token in profiles
  EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.user_id = created_by_user_id 
    AND p.authentication_token IS NOT NULL 
    AND p.token_expires_at > now()
  )
  AND
  -- Check if the property exists and belongs to the same user
  EXISTS (
    SELECT 1
    FROM properties pr
    WHERE pr.id = property_id
    AND pr.user_id = created_by_user_id
  )
);