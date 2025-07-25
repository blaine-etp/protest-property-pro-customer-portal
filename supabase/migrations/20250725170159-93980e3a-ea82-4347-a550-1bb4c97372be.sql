-- Migration Plan: Standardize Foreign Key References to profiles.user_id
-- This migration identifies and fixes tables that incorrectly reference profiles.id instead of profiles.user_id

-- STEP 1: Audit current foreign key relationships
-- First, let's see what currently references profiles table

-- Check if any foreign keys point to profiles.id (they shouldn't, but let's verify)
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'profiles';

-- STEP 2: Identify potential issues with contact_id columns
-- These might be incorrectly referencing profiles.id when they should reference contacts.id or profiles.user_id

-- Let's check what contact_id columns exist and what they should reference
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE column_name LIKE '%contact_id%' 
  AND table_schema = 'public';

-- STEP 3: Add proper foreign key constraints where missing
-- Most tables already use user_id correctly, but let's ensure they have proper FK constraints

-- Add missing foreign key constraint for applications.user_id → profiles.user_id
ALTER TABLE applications 
ADD CONSTRAINT fk_applications_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add missing foreign key constraint for properties.user_id → profiles.user_id  
ALTER TABLE properties 
ADD CONSTRAINT fk_properties_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add missing foreign key constraint for customer_documents.user_id → profiles.user_id
ALTER TABLE customer_documents 
ADD CONSTRAINT fk_customer_documents_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add missing foreign key constraint for credit_transactions.user_id → profiles.user_id
ALTER TABLE credit_transactions 
ADD CONSTRAINT fk_credit_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add missing foreign key constraint for verification_codes.user_id → profiles.user_id
ALTER TABLE verification_codes 
ADD CONSTRAINT fk_verification_codes_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add missing foreign key constraint for referral_relationships.referrer_id → profiles.user_id
ALTER TABLE referral_relationships 
ADD CONSTRAINT fk_referral_relationships_referrer_id 
FOREIGN KEY (referrer_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add missing foreign key constraint for referral_relationships.referee_id → profiles.user_id
ALTER TABLE referral_relationships 
ADD CONSTRAINT fk_referral_relationships_referee_id 
FOREIGN KEY (referee_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add missing foreign key constraint for owners.created_by_user_id → profiles.user_id
ALTER TABLE owners 
ADD CONSTRAINT fk_owners_created_by_user_id 
FOREIGN KEY (created_by_user_id) REFERENCES profiles(user_id) ON DELETE SET NULL;

-- STEP 4: Clarify contact_id vs user_id relationships
-- Properties table has both contact_id and secondary_contact_id
-- These should reference contacts.id (separate entity) or profiles.user_id (if they represent users)

-- If contact_id should reference contacts table:
ALTER TABLE properties 
ADD CONSTRAINT fk_properties_contact_id 
FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- If secondary_contact_id should also reference contacts table:
ALTER TABLE properties 
ADD CONSTRAINT fk_properties_secondary_contact_id 
FOREIGN KEY (secondary_contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- STEP 5: Communications table contact_id should reference contacts.id
ALTER TABLE communications 
ADD CONSTRAINT fk_communications_contact_id 
FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE;

-- STEP 6: Document and bill relationships
-- Add missing foreign key for bills.owner_id → owners.id
ALTER TABLE bills 
ADD CONSTRAINT fk_bills_owner_id 
FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE;

-- Add missing foreign key for properties.owner_id → owners.id  
ALTER TABLE properties 
ADD CONSTRAINT fk_properties_owner_id 
FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE SET NULL;

-- Add missing foreign key for protests.property_id → properties.id
ALTER TABLE protests 
ADD CONSTRAINT fk_protests_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- STEP 7: Document relationships
ALTER TABLE document_properties 
ADD CONSTRAINT fk_document_properties_document_id 
FOREIGN KEY (document_id) REFERENCES customer_documents(id) ON DELETE CASCADE;

ALTER TABLE document_properties 
ADD CONSTRAINT fk_document_properties_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- STEP 8: Communication properties relationships
ALTER TABLE communication_properties 
ADD CONSTRAINT fk_communication_properties_communication_id 
FOREIGN KEY (communication_id) REFERENCES communications(id) ON DELETE CASCADE;

ALTER TABLE communication_properties 
ADD CONSTRAINT fk_communication_properties_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- STEP 9: Blog relationships
ALTER TABLE blog_posts 
ADD CONSTRAINT fk_blog_posts_author_id 
FOREIGN KEY (author_id) REFERENCES profiles(user_id) ON DELETE SET NULL;

ALTER TABLE blog_post_tags 
ADD CONSTRAINT fk_blog_post_tags_post_id 
FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;

ALTER TABLE blog_post_tags 
ADD CONSTRAINT fk_blog_post_tags_tag_id 
FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE;

-- STEP 10: Add unique constraint on profiles.user_id if not exists
-- This ensures referential integrity
ALTER TABLE profiles 
ADD CONSTRAINT uk_profiles_user_id 
UNIQUE (user_id);