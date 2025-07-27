-- Add all missing foreign key constraints
-- This migration adds comprehensive referential integrity to the database

-- Properties table foreign keys
ALTER TABLE public.properties 
ADD CONSTRAINT fk_properties_contact_id 
FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE public.properties 
ADD CONSTRAINT fk_properties_owner_id 
FOREIGN KEY (owner_id) REFERENCES public.owners(id) ON DELETE SET NULL;

ALTER TABLE public.properties 
ADD CONSTRAINT fk_properties_secondary_contact_id 
FOREIGN KEY (secondary_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE public.properties 
ADD CONSTRAINT fk_properties_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Protests table foreign keys
ALTER TABLE public.protests 
ADD CONSTRAINT fk_protests_property_id 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- Bills table foreign keys
ALTER TABLE public.bills 
ADD CONSTRAINT fk_bills_contact_id 
FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE public.bills 
ADD CONSTRAINT fk_bills_protest_id 
FOREIGN KEY (protest_id) REFERENCES public.protests(id) ON DELETE SET NULL;

ALTER TABLE public.bills 
ADD CONSTRAINT fk_bills_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Communications table foreign keys
ALTER TABLE public.communications 
ADD CONSTRAINT fk_communications_contact_id 
FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;

-- Applications table foreign keys
ALTER TABLE public.applications 
ADD CONSTRAINT fk_applications_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.applications 
ADD CONSTRAINT fk_applications_property_id 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- Customer Documents table foreign keys
ALTER TABLE public.customer_documents 
ADD CONSTRAINT fk_customer_documents_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.customer_documents 
ADD CONSTRAINT fk_customer_documents_property_id 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- Blog/Content table foreign keys
ALTER TABLE public.blog_post_tags 
ADD CONSTRAINT fk_blog_post_tags_post_id 
FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;

ALTER TABLE public.blog_post_tags 
ADD CONSTRAINT fk_blog_post_tags_tag_id 
FOREIGN KEY (tag_id) REFERENCES public.blog_tags(id) ON DELETE CASCADE;

ALTER TABLE public.county_pages 
ADD CONSTRAINT fk_county_pages_county_id 
FOREIGN KEY (county_id) REFERENCES public.counties(id) ON DELETE CASCADE;

-- Junction table foreign keys
ALTER TABLE public.communication_properties 
ADD CONSTRAINT fk_communication_properties_communication_id 
FOREIGN KEY (communication_id) REFERENCES public.communications(id) ON DELETE CASCADE;

ALTER TABLE public.communication_properties 
ADD CONSTRAINT fk_communication_properties_property_id 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

ALTER TABLE public.document_properties 
ADD CONSTRAINT fk_document_properties_property_id 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- Credit and referral table foreign keys
ALTER TABLE public.credit_transactions 
ADD CONSTRAINT fk_credit_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.credit_transactions 
ADD CONSTRAINT fk_credit_transactions_referral_relationship_id 
FOREIGN KEY (referral_relationship_id) REFERENCES public.referral_relationships(id) ON DELETE SET NULL;

ALTER TABLE public.verification_codes 
ADD CONSTRAINT fk_verification_codes_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.referral_relationships 
ADD CONSTRAINT fk_referral_relationships_referrer_id 
FOREIGN KEY (referrer_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.referral_relationships 
ADD CONSTRAINT fk_referral_relationships_referee_id 
FOREIGN KEY (referee_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;