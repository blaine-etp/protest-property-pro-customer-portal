-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own documents by token or auth" ON storage.objects;
DROP POLICY IF EXISTS "Users can download their own documents" ON storage.objects;

-- Create proper storage policies for customer-documents bucket
-- Policy for token-based access (customer portal users)
CREATE POLICY "Token users can access their documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'customer-documents' AND 
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.authentication_token IS NOT NULL 
    AND p.token_expires_at > now()
    AND name LIKE '%' || p.user_id::text || '%'
  )
);

-- Policy for authenticated users
CREATE POLICY "Authenticated users can access their documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'customer-documents' AND 
  auth.uid() IS NOT NULL AND 
  name LIKE '%' || auth.uid()::text || '%'
);

-- Policy for inserting documents (for edge functions)
CREATE POLICY "Service role can insert documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'customer-documents');