-- Temporarily allow public read access to properties for testing
-- This should be reverted in production!
CREATE POLICY "Allow public read access to properties (temp)" 
ON public.properties 
FOR SELECT 
USING (true);