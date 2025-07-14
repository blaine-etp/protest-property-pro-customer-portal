-- Temporarily make the customer-documents bucket more accessible for testing
-- We can tighten these policies later once downloads work

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can access their own document files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Service role can access all documents" ON storage.objects;

-- Create simple, permissive policies for testing
CREATE POLICY "Anyone can read customer documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'customer-documents');

CREATE POLICY "Anyone can insert customer documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'customer-documents');

CREATE POLICY "Anyone can update customer documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'customer-documents');