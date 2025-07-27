-- Phase 2: FK Constraint Cleanup Migration
-- Remove duplicate foreign key constraints and standardize naming

-- Step 1: Drop all duplicate constraints (keeping standardized names)
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_property_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_user_id_fkey;

ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_contact_id_fkey;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_protest_id_fkey;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_user_id_fkey;

ALTER TABLE credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_referral_relationship_id_fkey;
ALTER TABLE credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_user_id_fkey;

ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_contact_id_fkey;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_owner_id_fkey;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_secondary_contact_id_fkey;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_user_id_fkey;

ALTER TABLE referral_relationships DROP CONSTRAINT IF EXISTS referral_relationships_referee_id_fkey;
ALTER TABLE referral_relationships DROP CONSTRAINT IF EXISTS referral_relationships_referrer_id_fkey;

-- Step 2: Drop incorrect target table constraints
ALTER TABLE properties DROP CONSTRAINT IF EXISTS fk_properties_contact;
ALTER TABLE communications DROP CONSTRAINT IF EXISTS fk_communications_contact;

-- Step 3: Create standardized foreign key constraints with correct targets

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

-- Credit transactions table
ALTER TABLE credit_transactions 
ADD CONSTRAINT fk_credit_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

ALTER TABLE credit_transactions 
ADD CONSTRAINT fk_credit_transactions_referral_relationship_id 
FOREIGN KEY (referral_relationship_id) REFERENCES referral_relationships(id);

-- Properties table (with correct targets)
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

-- Communications table (with correct target)
ALTER TABLE communications 
ADD CONSTRAINT fk_communications_contact_id 
FOREIGN KEY (contact_id) REFERENCES contacts(id);

-- Referral relationships table
ALTER TABLE referral_relationships 
ADD CONSTRAINT fk_referral_relationships_referrer_id 
FOREIGN KEY (referrer_id) REFERENCES profiles(user_id);

ALTER TABLE referral_relationships 
ADD CONSTRAINT fk_referral_relationships_referee_id 
FOREIGN KEY (referee_id) REFERENCES profiles(user_id);

-- Step 4: Update remaining constraints to follow naming convention
ALTER TABLE communication_properties DROP CONSTRAINT IF EXISTS communication_properties_communication_id_fkey;
ALTER TABLE communication_properties DROP CONSTRAINT IF EXISTS communication_properties_property_id_fkey;
ALTER TABLE communication_properties 
ADD CONSTRAINT fk_communication_properties_communication_id 
FOREIGN KEY (communication_id) REFERENCES communications(id);
ALTER TABLE communication_properties 
ADD CONSTRAINT fk_communication_properties_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id);

ALTER TABLE county_pages DROP CONSTRAINT IF EXISTS county_pages_county_id_fkey;
ALTER TABLE county_pages 
ADD CONSTRAINT fk_county_pages_county_id 
FOREIGN KEY (county_id) REFERENCES counties(id);

ALTER TABLE customer_documents DROP CONSTRAINT IF EXISTS customer_documents_property_id_fkey;
ALTER TABLE customer_documents DROP CONSTRAINT IF EXISTS customer_documents_user_id_fkey;
ALTER TABLE customer_documents 
ADD CONSTRAINT fk_customer_documents_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);
ALTER TABLE customer_documents 
ADD CONSTRAINT fk_customer_documents_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id);

ALTER TABLE document_properties DROP CONSTRAINT IF EXISTS document_properties_document_id_fkey;
ALTER TABLE document_properties DROP CONSTRAINT IF EXISTS document_properties_property_id_fkey;
ALTER TABLE document_properties 
ADD CONSTRAINT fk_document_properties_document_id 
FOREIGN KEY (document_id) REFERENCES customer_documents(id);
ALTER TABLE document_properties 
ADD CONSTRAINT fk_document_properties_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id);

ALTER TABLE owners DROP CONSTRAINT IF EXISTS owners_created_by_user_id_fkey;
ALTER TABLE owners 
ADD CONSTRAINT fk_owners_created_by_user_id 
FOREIGN KEY (created_by_user_id) REFERENCES profiles(user_id);

ALTER TABLE protests DROP CONSTRAINT IF EXISTS protests_property_id_fkey;
ALTER TABLE protests 
ADD CONSTRAINT fk_protests_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id);

ALTER TABLE verification_codes DROP CONSTRAINT IF EXISTS verification_codes_user_id_fkey;
ALTER TABLE verification_codes 
ADD CONSTRAINT fk_verification_codes_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);