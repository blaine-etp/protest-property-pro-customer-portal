-- Temporarily make owners INSERT policy more permissive during signup flow
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create a more permissive INSERT policy for owners during signup
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Always allow during signup flow if created_by_user_id is provided
  created_by_user_id IS NOT NULL
);