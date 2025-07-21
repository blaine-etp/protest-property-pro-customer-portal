
-- Disable RLS on all tables for demo/QA purposes
-- This will make all data accessible without authentication restrictions

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on properties table
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;

-- Disable RLS on applications table
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;

-- Disable RLS on owners table
ALTER TABLE public.owners DISABLE ROW LEVEL SECURITY;

-- Disable RLS on protests table
ALTER TABLE public.protests DISABLE ROW LEVEL SECURITY;

-- Disable RLS on bills table
ALTER TABLE public.bills DISABLE ROW LEVEL SECURITY;

-- Disable RLS on customer_documents table
ALTER TABLE public.customer_documents DISABLE ROW LEVEL SECURITY;

-- Disable RLS on credit_transactions table
ALTER TABLE public.credit_transactions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on referral_relationships table
ALTER TABLE public.referral_relationships DISABLE ROW LEVEL SECURITY;

-- Disable RLS on verification_codes table
ALTER TABLE public.verification_codes DISABLE ROW LEVEL SECURITY;

-- Disable RLS on communications table
ALTER TABLE public.communications DISABLE ROW LEVEL SECURITY;

-- Disable RLS on communication_properties table
ALTER TABLE public.communication_properties DISABLE ROW LEVEL SECURITY;

-- Disable RLS on document_properties table
ALTER TABLE public.document_properties DISABLE ROW LEVEL SECURITY;

-- Disable RLS on blog tables
ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags DISABLE ROW LEVEL SECURITY;

-- Disable RLS on county tables
ALTER TABLE public.counties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.county_pages DISABLE ROW LEVEL SECURITY;
