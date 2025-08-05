-- Add property_id and generation_date columns to customer_documents table
ALTER TABLE customer_documents 
ADD COLUMN property_id UUID REFERENCES properties(id),
ADD COLUMN generation_date DATE DEFAULT CURRENT_DATE;

-- Create unique constraint to prevent duplicate forms on same date for same property
ALTER TABLE customer_documents 
ADD CONSTRAINT unique_property_document_per_date 
UNIQUE (user_id, property_id, document_type, generation_date);

-- Update existing records to link them to properties (if any exist)
-- This will help with data migration for existing documents
UPDATE customer_documents 
SET property_id = (
  SELECT p.id 
  FROM properties p 
  WHERE p.user_id = customer_documents.user_id 
  ORDER BY p.created_at ASC 
  LIMIT 1
)
WHERE property_id IS NULL;