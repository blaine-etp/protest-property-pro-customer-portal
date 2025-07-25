-- Migration Plan: Standardize Foreign Key References to profiles.user_id (Safe Version)
-- This migration safely adds missing foreign key constraints, checking for existing ones first

-- Add foreign key constraints only if they don't already exist
DO $$
BEGIN
    -- Check and add applications.user_id → profiles.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_applications_user_id' 
        AND table_name = 'applications'
    ) THEN
        ALTER TABLE applications 
        ADD CONSTRAINT fk_applications_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;

    -- Check and add properties.user_id → profiles.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_properties_user_id' 
        AND table_name = 'properties'
    ) THEN
        ALTER TABLE properties 
        ADD CONSTRAINT fk_properties_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;

    -- Check and add customer_documents.user_id → profiles.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customer_documents_user_id' 
        AND table_name = 'customer_documents'
    ) THEN
        ALTER TABLE customer_documents 
        ADD CONSTRAINT fk_customer_documents_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;

    -- Check and add credit_transactions.user_id → profiles.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_credit_transactions_user_id' 
        AND table_name = 'credit_transactions'
    ) THEN
        ALTER TABLE credit_transactions 
        ADD CONSTRAINT fk_credit_transactions_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;

    -- Check and add verification_codes.user_id → profiles.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_verification_codes_user_id' 
        AND table_name = 'verification_codes'
    ) THEN
        ALTER TABLE verification_codes 
        ADD CONSTRAINT fk_verification_codes_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;

    -- Check and add referral_relationships.referrer_id → profiles.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_referral_relationships_referrer_id' 
        AND table_name = 'referral_relationships'
    ) THEN
        ALTER TABLE referral_relationships 
        ADD CONSTRAINT fk_referral_relationships_referrer_id 
        FOREIGN KEY (referrer_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;

    -- Check and add referral_relationships.referee_id → profiles.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_referral_relationships_referee_id' 
        AND table_name = 'referral_relationships'
    ) THEN
        ALTER TABLE referral_relationships 
        ADD CONSTRAINT fk_referral_relationships_referee_id 
        FOREIGN KEY (referee_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;

    -- Check and add owners.created_by_user_id → profiles.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_owners_created_by_user_id' 
        AND table_name = 'owners'
    ) THEN
        ALTER TABLE owners 
        ADD CONSTRAINT fk_owners_created_by_user_id 
        FOREIGN KEY (created_by_user_id) REFERENCES profiles(user_id) ON DELETE SET NULL;
    END IF;

    -- Check and add properties.contact_id → contacts.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_properties_contact_id' 
        AND table_name = 'properties'
    ) THEN
        ALTER TABLE properties 
        ADD CONSTRAINT fk_properties_contact_id 
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;

    -- Check and add properties.secondary_contact_id → contacts.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_properties_secondary_contact_id' 
        AND table_name = 'properties'
    ) THEN
        ALTER TABLE properties 
        ADD CONSTRAINT fk_properties_secondary_contact_id 
        FOREIGN KEY (secondary_contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;

    -- Check and add communications.contact_id → contacts.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_communications_contact_id' 
        AND table_name = 'communications'
    ) THEN
        ALTER TABLE communications 
        ADD CONSTRAINT fk_communications_contact_id 
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE;
    END IF;

    -- Check and add bills.owner_id → owners.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_bills_owner_id' 
        AND table_name = 'bills'
    ) THEN
        ALTER TABLE bills 
        ADD CONSTRAINT fk_bills_owner_id 
        FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE;
    END IF;

    -- Check and add properties.owner_id → owners.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_properties_owner_id' 
        AND table_name = 'properties'
    ) THEN
        ALTER TABLE properties 
        ADD CONSTRAINT fk_properties_owner_id 
        FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE SET NULL;
    END IF;

    -- Check and add blog_posts.author_id → profiles.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_blog_posts_author_id' 
        AND table_name = 'blog_posts'
    ) THEN
        ALTER TABLE blog_posts 
        ADD CONSTRAINT fk_blog_posts_author_id 
        FOREIGN KEY (author_id) REFERENCES profiles(user_id) ON DELETE SET NULL;
    END IF;

    -- Add unique constraint on profiles.user_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uk_profiles_user_id' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT uk_profiles_user_id 
        UNIQUE (user_id);
    END IF;

END $$;