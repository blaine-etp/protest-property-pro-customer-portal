-- Temporarily allow all inserts during form submission by making policy more permissive
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated OR if created_by_user_id is provided (for form submission)
  (auth.uid() IS NOT NULL) 
  OR 
  (created_by_user_id IS NOT NULL)
);