-- Replace permissive policies with secure ones
-- Drop the overly permissive testing policies
DROP POLICY IF EXISTS "Anyone can read customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can insert customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update customer documents" ON storage.objects;

-- Create secure policy for token-based users (customer portal)
CREATE POLICY "Token users can access their own documents" 
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

-- Create secure policy for authenticated users
CREATE POLICY "Authenticated users can access their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'customer-documents' AND 
  auth.uid() IS NOT NULL AND 
  name LIKE '%' || auth.uid()::text || '%'
);

-- Allow service role (edge functions) to upload documents
CREATE POLICY "Service role can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'customer-documents');

-- Allow service role to access all documents for management operations
CREATE POLICY "Service role can manage all documents" 
ON storage.objects 
FOR ALL
TO service_role
USING (bucket_id = 'customer-documents');

-- Add policy for authenticated users to upload their own documents (if needed)
CREATE POLICY "Authenticated users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'customer-documents' AND 
  auth.uid() IS NOT NULL AND 
  name LIKE '%' || auth.uid()::text || '%'
);