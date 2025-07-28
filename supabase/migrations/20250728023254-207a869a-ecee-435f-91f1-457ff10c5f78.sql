-- Create storage policies for customer-documents bucket to allow authenticated users to download their own files

-- Policy for authenticated users to select/download their own documents 
CREATE POLICY "Users can download their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'customer-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for service role to insert documents (used by edge functions)
CREATE POLICY "Service role can insert customer documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'customer-documents'
  AND auth.role() = 'service_role'
);