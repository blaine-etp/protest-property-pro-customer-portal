-- Drop the problematic policies and create working ones
DROP POLICY IF EXISTS "Token users can access their documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access their documents" ON storage.objects;
DROP POLICY IF EXISTS "Service role can insert documents" ON storage.objects;

-- Create a simple policy that allows users to access files with their user_id in the path
CREATE POLICY "Users can access their own document files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'customer-documents' AND (
    -- For token-based access: check if current request matches a valid token user
    (auth.jwt() ->> 'role' = 'anon' AND 
     EXISTS (
       SELECT 1 FROM profiles p 
       WHERE p.authentication_token IS NOT NULL 
       AND p.token_expires_at > now()
       AND name LIKE '%' || p.user_id::text || '%'
     ))
    OR
    -- For authenticated users: check if file path contains their user_id
    (auth.uid() IS NOT NULL AND name LIKE '%' || auth.uid()::text || '%')
  )
);

-- Allow service role (edge functions) to upload documents
CREATE POLICY "Service role can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'customer-documents');

-- Also allow service role to select (needed for some operations)
CREATE POLICY "Service role can access all documents" 
ON storage.objects 
FOR ALL
USING (bucket_id = 'customer-documents');