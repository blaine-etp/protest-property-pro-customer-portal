-- Re-enable RLS on owners table and fix the INSERT policy for proper token validation
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create a proper INSERT policy that validates token-based access
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Allow creation if the created_by_user_id has a valid token in profiles
  EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.user_id = created_by_user_id 
    AND p.authentication_token IS NOT NULL 
    AND p.token_expires_at > now()
  )
  OR
  -- Allow creation by authenticated users
  (auth.uid() IS NOT NULL AND created_by_user_id = auth.uid())
);