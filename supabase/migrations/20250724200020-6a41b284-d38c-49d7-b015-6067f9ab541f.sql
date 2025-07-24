-- Update RLS policies for protests table to allow broader access

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Administrators can view all protests" ON protests;

-- Create new policies that allow users to view protests
-- Allow authenticated users to view all protests (since this is admin/CRM functionality)
CREATE POLICY "Authenticated users can view all protests" 
ON protests 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow administrators to have full access
CREATE POLICY "Administrators can manage all protests" 
ON protests 
FOR ALL 
USING (get_user_permissions(auth.uid()) = 'administrator');

-- Keep existing insert/update policies but make them more permissive for authenticated users
DROP POLICY IF EXISTS "Users can insert protests with token or auth" ON protests;
DROP POLICY IF EXISTS "Users can update protests with token or auth" ON protests;

CREATE POLICY "Authenticated users can insert protests" 
ON protests 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update protests" 
ON protests 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);