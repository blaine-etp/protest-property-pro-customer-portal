-- Connect existing documents to their properties, owners, and contacts

-- Step 1: Update customer_documents to set owner_id and contact_id based on associated properties
UPDATE customer_documents 
SET 
  owner_id = p.owner_id,
  contact_id = p.contact_id
FROM properties p
WHERE customer_documents.user_id = p.user_id
  AND customer_documents.owner_id IS NULL
  AND customer_documents.contact_id IS NULL
  AND p.owner_id IS NOT NULL
  AND p.contact_id IS NOT NULL;

-- Step 2: Update properties to reference their documents
-- For each user, connect their properties to their document (assuming one 50-162 per user for now)
WITH user_documents AS (
  SELECT DISTINCT user_id, id as document_id
  FROM customer_documents 
  WHERE document_type = 'form-50-162'
)
UPDATE properties 
SET document_id = ud.document_id
FROM user_documents ud
WHERE properties.user_id = ud.user_id
  AND properties.document_id IS NULL;