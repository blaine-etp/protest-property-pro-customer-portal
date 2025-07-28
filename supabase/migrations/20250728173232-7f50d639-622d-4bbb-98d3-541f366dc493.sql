-- Restructure document relationships for 50-162 forms

-- Step 1: Add new columns to customer_documents
ALTER TABLE public.customer_documents 
ADD COLUMN owner_id uuid,
ADD COLUMN contact_id uuid;

-- Step 2: Add document_id to properties table
ALTER TABLE public.properties 
ADD COLUMN document_id uuid;

-- Step 3: Add document_id to protests table  
ALTER TABLE public.protests 
ADD COLUMN document_id uuid;

-- Step 4: Add foreign key constraints
ALTER TABLE public.customer_documents
ADD CONSTRAINT fk_customer_documents_owner 
FOREIGN KEY (owner_id) REFERENCES public.owners(id) ON DELETE SET NULL;

ALTER TABLE public.customer_documents
ADD CONSTRAINT fk_customer_documents_contact 
FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE public.properties
ADD CONSTRAINT fk_properties_document 
FOREIGN KEY (document_id) REFERENCES public.customer_documents(id) ON DELETE SET NULL;

ALTER TABLE public.protests
ADD CONSTRAINT fk_protests_document 
FOREIGN KEY (document_id) REFERENCES public.customer_documents(id) ON DELETE SET NULL;

-- Step 5: Drop the property_id column from customer_documents (after data migration if needed)
-- Note: This will remove the existing relationship - you may want to migrate data first
ALTER TABLE public.customer_documents 
DROP COLUMN property_id;

-- Step 6: Drop the document_properties junction table as it's no longer needed for 50-162s
DROP TABLE public.document_properties;