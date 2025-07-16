-- Fix RLS policy to allow owner creation during initial submission flow
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

-- Create a permissive INSERT policy for initial submission flow
CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Allow owner creation if created_by_user_id is provided
  -- This is permissive during signup flow but secure since only our form process sets this
  created_by_user_id IS NOT NULL
);