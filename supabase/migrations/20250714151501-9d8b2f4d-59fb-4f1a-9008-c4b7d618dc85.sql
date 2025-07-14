-- Check and fix storage policies for customer-documents bucket
-- First, let's make sure the bucket exists and is configured properly

-- Create policies for customer-documents bucket to allow authenticated access
CREATE POLICY "Users can view their own documents by token or auth" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'customer-documents' AND 
  name LIKE '%' || 
  COALESCE(
    (SELECT p.user_id::text 
     FROM profiles p 
     WHERE p.authentication_token IS NOT NULL 
     AND p.token_expires_at > now() 
     LIMIT 1),
    auth.uid()::text
  ) || '%'
);

CREATE POLICY "Users can download their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'customer-documents' AND 
  (
    -- Allow access via authentication token
    name LIKE '%' || (
      SELECT p.user_id::text 
      FROM profiles p 
      WHERE p.authentication_token IS NOT NULL 
      AND p.token_expires_at > now() 
      LIMIT 1
    ) || '%'
    OR
    -- Allow access via authenticated user
    (auth.uid() IS NOT NULL AND name LIKE '%' || auth.uid()::text || '%')
  )
);