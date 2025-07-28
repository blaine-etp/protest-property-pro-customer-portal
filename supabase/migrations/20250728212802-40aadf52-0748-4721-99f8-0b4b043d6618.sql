-- Phase 1: Database Schema Clean-up
-- Remove redundant property_id column from customer_documents
-- Documents are now linked to owners, not individual properties
ALTER TABLE public.customer_documents 
DROP COLUMN IF EXISTS property_id;

-- Remove redundant document_id column from properties  
-- Properties are associated with documents only through their owner
ALTER TABLE public.properties 
DROP COLUMN IF EXISTS document_id;