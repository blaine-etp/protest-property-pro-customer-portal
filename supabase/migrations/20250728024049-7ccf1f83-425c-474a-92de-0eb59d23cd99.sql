-- Drop existing policies that rely on auth.uid() which doesn't work with mock auth
DROP POLICY IF EXISTS "Users can download their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Service role can insert customer documents" ON storage.objects;

-- Create new policies that work with mock authentication
-- Allow public read access to customer-documents since we're using mock auth
CREATE POLICY "Public can download customer documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'customer-documents');

-- Allow public insert for now to match the mock auth setup
CREATE POLICY "Public can insert customer documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'customer-documents');