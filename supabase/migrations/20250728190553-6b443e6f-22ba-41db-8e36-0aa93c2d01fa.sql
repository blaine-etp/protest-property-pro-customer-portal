-- Add property_id column to customer_documents table to link documents to properties
ALTER TABLE public.customer_documents 
ADD COLUMN property_id UUID REFERENCES public.properties(id);

-- Add index for better performance when querying documents by property
CREATE INDEX idx_customer_documents_property_id ON public.customer_documents(property_id);