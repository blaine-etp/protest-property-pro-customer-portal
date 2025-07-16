-- Rename contact_id to secondary_contact_id in properties table
ALTER TABLE public.properties 
RENAME COLUMN contact_id TO secondary_contact_id;