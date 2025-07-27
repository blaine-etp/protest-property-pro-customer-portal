-- Add only the missing foreign key constraints
-- First check and add constraints that don't already exist

-- Check if constraints exist and add only missing ones
DO $$
BEGIN
    -- Properties table foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_properties_owner_id' AND table_name = 'properties'
    ) THEN
        ALTER TABLE public.properties 
        ADD CONSTRAINT fk_properties_owner_id 
        FOREIGN KEY (owner_id) REFERENCES public.owners(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_properties_secondary_contact_id' AND table_name = 'properties'
    ) THEN
        ALTER TABLE public.properties 
        ADD CONSTRAINT fk_properties_secondary_contact_id 
        FOREIGN KEY (secondary_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_properties_user_id' AND table_name = 'properties'
    ) THEN
        ALTER TABLE public.properties 
        ADD CONSTRAINT fk_properties_user_id 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;

    -- Protests table foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_protests_property_id' AND table_name = 'protests'
    ) THEN
        ALTER TABLE public.protests 
        ADD CONSTRAINT fk_protests_property_id 
        FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
    END IF;

    -- Bills table foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_bills_contact_id' AND table_name = 'bills'
    ) THEN
        ALTER TABLE public.bills 
        ADD CONSTRAINT fk_bills_contact_id 
        FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_bills_protest_id' AND table_name = 'bills'
    ) THEN
        ALTER TABLE public.bills 
        ADD CONSTRAINT fk_bills_protest_id 
        FOREIGN KEY (protest_id) REFERENCES public.protests(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_bills_user_id' AND table_name = 'bills'
    ) THEN
        ALTER TABLE public.bills 
        ADD CONSTRAINT fk_bills_user_id 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;

    -- Communications table foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_communications_contact_id' AND table_name = 'communications'
    ) THEN
        ALTER TABLE public.communications 
        ADD CONSTRAINT fk_communications_contact_id 
        FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;
    END IF;

    -- Applications table foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_applications_user_id' AND table_name = 'applications'
    ) THEN
        ALTER TABLE public.applications 
        ADD CONSTRAINT fk_applications_user_id 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_applications_property_id' AND table_name = 'applications'
    ) THEN
        ALTER TABLE public.applications 
        ADD CONSTRAINT fk_applications_property_id 
        FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
    END IF;

    -- Customer Documents table foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customer_documents_user_id' AND table_name = 'customer_documents'
    ) THEN
        ALTER TABLE public.customer_documents 
        ADD CONSTRAINT fk_customer_documents_user_id 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customer_documents_property_id' AND table_name = 'customer_documents'
    ) THEN
        ALTER TABLE public.customer_documents 
        ADD CONSTRAINT fk_customer_documents_property_id 
        FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
    END IF;

    -- Blog/Content table foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_blog_post_tags_post_id' AND table_name = 'blog_post_tags'
    ) THEN
        ALTER TABLE public.blog_post_tags 
        ADD CONSTRAINT fk_blog_post_tags_post_id 
        FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_blog_post_tags_tag_id' AND table_name = 'blog_post_tags'
    ) THEN
        ALTER TABLE public.blog_post_tags 
        ADD CONSTRAINT fk_blog_post_tags_tag_id 
        FOREIGN KEY (tag_id) REFERENCES public.blog_tags(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_county_pages_county_id' AND table_name = 'county_pages'
    ) THEN
        ALTER TABLE public.county_pages 
        ADD CONSTRAINT fk_county_pages_county_id 
        FOREIGN KEY (county_id) REFERENCES public.counties(id) ON DELETE CASCADE;
    END IF;

    -- Junction table foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_communication_properties_communication_id' AND table_name = 'communication_properties'
    ) THEN
        ALTER TABLE public.communication_properties 
        ADD CONSTRAINT fk_communication_properties_communication_id 
        FOREIGN KEY (communication_id) REFERENCES public.communications(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_communication_properties_property_id' AND table_name = 'communication_properties'
    ) THEN
        ALTER TABLE public.communication_properties 
        ADD CONSTRAINT fk_communication_properties_property_id 
        FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_document_properties_property_id' AND table_name = 'document_properties'
    ) THEN
        ALTER TABLE public.document_properties 
        ADD CONSTRAINT fk_document_properties_property_id 
        FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
    END IF;

    -- Credit and referral table foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_credit_transactions_user_id' AND table_name = 'credit_transactions'
    ) THEN
        ALTER TABLE public.credit_transactions 
        ADD CONSTRAINT fk_credit_transactions_user_id 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_credit_transactions_referral_relationship_id' AND table_name = 'credit_transactions'
    ) THEN
        ALTER TABLE public.credit_transactions 
        ADD CONSTRAINT fk_credit_transactions_referral_relationship_id 
        FOREIGN KEY (referral_relationship_id) REFERENCES public.referral_relationships(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_verification_codes_user_id' AND table_name = 'verification_codes'
    ) THEN
        ALTER TABLE public.verification_codes 
        ADD CONSTRAINT fk_verification_codes_user_id 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_referral_relationships_referrer_id' AND table_name = 'referral_relationships'
    ) THEN
        ALTER TABLE public.referral_relationships 
        ADD CONSTRAINT fk_referral_relationships_referrer_id 
        FOREIGN KEY (referrer_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_referral_relationships_referee_id' AND table_name = 'referral_relationships'
    ) THEN
        ALTER TABLE public.referral_relationships 
        ADD CONSTRAINT fk_referral_relationships_referee_id 
        FOREIGN KEY (referee_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
    
END $$;