-- Drop the recursive INSERT policy for owners that's causing infinite recursion
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;