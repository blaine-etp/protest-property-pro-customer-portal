-- Temporarily allow public access to protests for testing with mock auth
-- Drop the restrictive authenticated user policy
DROP POLICY IF EXISTS "Authenticated users can view all protests" ON protests;

-- Create a more permissive policy for development/testing
CREATE POLICY "Allow public read access to protests" 
ON protests 
FOR SELECT 
USING (true);

-- Keep admin policy for full management
-- The existing "Administrators can manage all protests" policy remains