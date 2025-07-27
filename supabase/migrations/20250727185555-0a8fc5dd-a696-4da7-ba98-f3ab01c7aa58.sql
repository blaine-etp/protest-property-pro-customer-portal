-- Phase 2 Cleanup - Remove existing constraints first, then add standardized ones

-- Step 1: Drop ALL existing foreign key constraints
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing foreign key constraints
    FOR r IN (SELECT constraint_name, table_name 
              FROM information_schema.table_constraints 
              WHERE constraint_type = 'FOREIGN KEY' 
              AND table_schema = 'public') LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.table_name, r.constraint_name);
    END LOOP;
END $$;

-- Step 2: Create clean, standardized foreign key constraints

-- Applications table
ALTER TABLE applications 
ADD CONSTRAINT fk_applications_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id);

-- Bills table  
ALTER TABLE bills 
ADD CONSTRAINT fk_bills_contact_id 
FOREIGN KEY (contact_id) REFERENCES contacts(id);

ALTER TABLE bills 
ADD CONSTRAINT fk_bills_protest_id 
FOREIGN KEY (protest_id) REFERENCES protests(id);

ALTER TABLE bills 
ADD CONSTRAINT fk_bills_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

-- Blog posts table
ALTER TABLE blog_posts 
ADD CONSTRAINT fk_blog_posts_author_id 
FOREIGN KEY (author_id) REFERENCES profiles(user_id);

-- Blog post tags table
ALTER TABLE blog_post_tags 
ADD CONSTRAINT fk_blog_post_tags_post_id 
FOREIGN KEY (post_id) REFERENCES blog_posts(id);

ALTER TABLE blog_post_tags 
ADD CONSTRAINT fk_blog_post_tags_tag_id 
FOREIGN KEY (tag_id) REFERENCES blog_tags(id);

-- Communication properties table
ALTER TABLE communication_properties 
ADD CONSTRAINT fk_communication_properties_communication_id 
FOREIGN KEY (communication_id) REFERENCES communications(id);

ALTER TABLE communication_properties 
ADD CONSTRAINT fk_communication_properties_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id);

-- Communications table
ALTER TABLE communications 
ADD CONSTRAINT fk_communications_contact_id 
FOREIGN KEY (contact_id) REFERENCES contacts(id);

-- County pages table
ALTER TABLE county_pages 
ADD CONSTRAINT fk_county_pages_county_id 
FOREIGN KEY (county_id) REFERENCES counties(id);

-- Credit transactions table
ALTER TABLE credit_transactions 
ADD CONSTRAINT fk_credit_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

ALTER TABLE credit_transactions 
ADD CONSTRAINT fk_credit_transactions_referral_relationship_id 
FOREIGN KEY (referral_relationship_id) REFERENCES referral_relationships(id);

-- Customer documents table
ALTER TABLE customer_documents 
ADD CONSTRAINT fk_customer_documents_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

ALTER TABLE customer_documents 
ADD CONSTRAINT fk_customer_documents_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id);

-- Document properties table
ALTER TABLE document_properties 
ADD CONSTRAINT fk_document_properties_document_id 
FOREIGN KEY (document_id) REFERENCES customer_documents(id);

ALTER TABLE document_properties 
ADD CONSTRAINT fk_document_properties_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id);

-- Owners table
ALTER TABLE owners 
ADD CONSTRAINT fk_owners_created_by_user_id 
FOREIGN KEY (created_by_user_id) REFERENCES profiles(user_id);

-- Properties table
ALTER TABLE properties 
ADD CONSTRAINT fk_properties_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

ALTER TABLE properties 
ADD CONSTRAINT fk_properties_contact_id 
FOREIGN KEY (contact_id) REFERENCES contacts(id);

ALTER TABLE properties 
ADD CONSTRAINT fk_properties_secondary_contact_id 
FOREIGN KEY (secondary_contact_id) REFERENCES contacts(id);

ALTER TABLE properties 
ADD CONSTRAINT fk_properties_owner_id 
FOREIGN KEY (owner_id) REFERENCES owners(id);

-- Protests table
ALTER TABLE protests 
ADD CONSTRAINT fk_protests_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id);

-- Referral relationships table
ALTER TABLE referral_relationships 
ADD CONSTRAINT fk_referral_relationships_referrer_id 
FOREIGN KEY (referrer_id) REFERENCES profiles(user_id);

ALTER TABLE referral_relationships 
ADD CONSTRAINT fk_referral_relationships_referee_id 
FOREIGN KEY (referee_id) REFERENCES profiles(user_id);

-- Verification codes table
ALTER TABLE verification_codes 
ADD CONSTRAINT fk_verification_codes_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);