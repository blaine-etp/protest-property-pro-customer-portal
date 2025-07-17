-- Phase 1: Drop all policies that depend on authentication_token before dropping the column

-- Drop ALL existing token-based policies across all tables
DROP POLICY IF EXISTS "Allow foreign key validation for signup tokens" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation with token" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles by token or auth" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles by token or auth" ON public.profiles;
DROP POLICY IF EXISTS "Administrators can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can insert properties with token or auth" ON public.properties;
DROP POLICY IF EXISTS "Users can update properties by token or auth" ON public.properties;
DROP POLICY IF EXISTS "Users can view properties by token or auth" ON public.properties;
DROP POLICY IF EXISTS "Administrators can view all properties" ON public.properties;

DROP POLICY IF EXISTS "Users can insert applications with token or auth" ON public.applications;
DROP POLICY IF EXISTS "Users can update applications by token or auth" ON public.applications;
DROP POLICY IF EXISTS "Users can view applications by token or auth" ON public.applications;
DROP POLICY IF EXISTS "Administrators can view all applications" ON public.applications;

DROP POLICY IF EXISTS "Users can insert appeal status with token or auth" ON public.protests;
DROP POLICY IF EXISTS "Users can update appeal status by token or auth" ON public.protests;
DROP POLICY IF EXISTS "Users can view appeal status by token or auth" ON public.protests;

DROP POLICY IF EXISTS "Users can insert their own documents" ON public.customer_documents;
DROP POLICY IF EXISTS "Users can view their own documents by token or auth" ON public.customer_documents;

DROP POLICY IF EXISTS "Users can view their credit transactions by token or auth" ON public.credit_transactions;

DROP POLICY IF EXISTS "Users can create referral relationships with token or auth" ON public.referral_relationships;
DROP POLICY IF EXISTS "Users can view their referral relationships by token or auth" ON public.referral_relationships;

DROP POLICY IF EXISTS "Users can insert their communications with token or auth" ON public.communications;
DROP POLICY IF EXISTS "Users can update their communications by token or auth" ON public.communications;
DROP POLICY IF EXISTS "Users can view their communications by token or auth" ON public.communications;
DROP POLICY IF EXISTS "Administrators can view all communications" ON public.communications;

DROP POLICY IF EXISTS "Users can view bills by token or auth" ON public.bills;
DROP POLICY IF EXISTS "Users can update bills by token or auth" ON public.bills;

DROP POLICY IF EXISTS "Users can view communication properties by token or auth" ON public.communication_properties;
DROP POLICY IF EXISTS "Users can view document properties by token or auth" ON public.document_properties;

DROP POLICY IF EXISTS "Users can insert owners during signup with valid token" ON public.owners;
DROP POLICY IF EXISTS "Users can update owners by token or auth" ON public.owners;
DROP POLICY IF EXISTS "Users can view owners by token or auth" ON public.owners;
DROP POLICY IF EXISTS "Administrators can view all owners" ON public.owners;

-- Drop any storage policies that reference authentication_token
DROP POLICY IF EXISTS "Token users can access their own documents" ON storage.objects;

-- Phase 2: Now drop the authentication token columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS authentication_token;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS token_expires_at;