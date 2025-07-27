-- Add missing foreign key constraints for documents only (communications FK already exists)

-- Check if customer_documents FK constraints exist and add if missing
DO $$
BEGIN
    -- Add FK constraint for customer_documents.user_id -> profiles.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customer_documents_user_id'
    ) THEN
        ALTER TABLE public.customer_documents 
        ADD CONSTRAINT fk_customer_documents_user_id 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;

    -- Add FK constraint for customer_documents.property_id -> properties.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customer_documents_property_id'
    ) THEN
        ALTER TABLE public.customer_documents 
        ADD CONSTRAINT fk_customer_documents_property_id 
        FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
    END IF;
END$$;