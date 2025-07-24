-- Temporarily allow anyone to update protests table for testing
DROP POLICY IF EXISTS "Authenticated users can update protests" ON public.protests;

CREATE POLICY "Anyone can update protests (temporary)" 
ON public.protests 
FOR UPDATE 
USING (true);