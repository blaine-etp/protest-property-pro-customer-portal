-- Add missing foreign key constraints for communications and documents

-- Add FK constraint for communications.contact_id -> contacts.id
ALTER TABLE public.communications 
ADD CONSTRAINT fk_communications_contact_id 
FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;

-- Add FK constraint for customer_documents.user_id -> profiles.user_id
ALTER TABLE public.customer_documents 
ADD CONSTRAINT fk_customer_documents_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add FK constraint for customer_documents.property_id -> properties.id
ALTER TABLE public.customer_documents 
ADD CONSTRAINT fk_customer_documents_property_id 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;