-- Phase 1: Simplify the signup flow by removing token-based authentication
-- Remove authentication token and expiration columns from profiles table
ALTER TABLE public.profiles DROP COLUMN authentication_token;
ALTER TABLE public.profiles DROP COLUMN token_expires_at;

-- Update profiles table to make user_id a foreign key to auth.users
-- First, we need to handle existing data
-- For now, keep existing profiles as-is and allow new ones to use real auth user IDs

-- Phase 2: Simplify RLS policies to work with authenticated users only
-- Drop existing complex policies and create simple auth-based ones

-- Profiles table policies
DROP POLICY IF EXISTS "Allow foreign key validation for signup tokens" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation with token" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles by token or auth" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles by token or auth" ON public.profiles;
DROP POLICY IF EXISTS "Administrators can view all profiles" ON public.profiles;

-- Create new simplified policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
  )
);

-- Properties table policies
DROP POLICY IF EXISTS "Users can insert properties with token or auth" ON public.properties;
DROP POLICY IF EXISTS "Users can update properties by token or auth" ON public.properties;
DROP POLICY IF EXISTS "Users can view properties by token or auth" ON public.properties;
DROP POLICY IF EXISTS "Administrators can view all properties" ON public.properties;

CREATE POLICY "Users can view their own properties" ON public.properties
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own properties" ON public.properties
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own properties" ON public.properties
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all properties" ON public.properties
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
  )
);

-- Applications table policies
DROP POLICY IF EXISTS "Users can insert applications with token or auth" ON public.applications;
DROP POLICY IF EXISTS "Users can update applications by token or auth" ON public.applications;
DROP POLICY IF EXISTS "Users can view applications by token or auth" ON public.applications;
DROP POLICY IF EXISTS "Administrators can view all applications" ON public.applications;

CREATE POLICY "Users can view their own applications" ON public.applications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own applications" ON public.applications
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own applications" ON public.applications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all applications" ON public.applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
  )
);

-- Owners table policies
DROP POLICY IF EXISTS "Users can insert owners during signup with valid token" ON public.owners;
DROP POLICY IF EXISTS "Users can update owners by token or auth" ON public.owners;
DROP POLICY IF EXISTS "Users can view owners by token or auth" ON public.owners;
DROP POLICY IF EXISTS "Administrators can view all owners" ON public.owners;

CREATE POLICY "Users can view their owners" ON public.owners
FOR SELECT USING (
  id IN (
    SELECT DISTINCT o.id 
    FROM public.owners o
    JOIN public.properties p ON p.owner_id = o.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert owners" ON public.owners
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their owners" ON public.owners
FOR UPDATE USING (
  id IN (
    SELECT DISTINCT o.id 
    FROM public.owners o
    JOIN public.properties p ON p.owner_id = o.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all owners" ON public.owners
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
  )
);

-- Protests table policies
DROP POLICY IF EXISTS "Users can insert appeal status with token or auth" ON public.protests;
DROP POLICY IF EXISTS "Users can update appeal status by token or auth" ON public.protests;
DROP POLICY IF EXISTS "Users can view appeal status by token or auth" ON public.protests;

CREATE POLICY "Users can view their protests" ON public.protests
FOR SELECT USING (
  property_id IN (
    SELECT p.id FROM public.properties p WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert protests for their properties" ON public.protests
FOR INSERT WITH CHECK (
  property_id IN (
    SELECT p.id FROM public.properties p WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their protests" ON public.protests
FOR UPDATE USING (
  property_id IN (
    SELECT p.id FROM public.properties p WHERE p.user_id = auth.uid()
  )
);

-- Customer documents policies
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.customer_documents;
DROP POLICY IF EXISTS "Users can view their own documents by token or auth" ON public.customer_documents;

CREATE POLICY "Users can view their own documents" ON public.customer_documents
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own documents" ON public.customer_documents
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Credit transactions policies
DROP POLICY IF EXISTS "Users can view their credit transactions by token or auth" ON public.credit_transactions;

CREATE POLICY "Users can view their credit transactions" ON public.credit_transactions
FOR SELECT USING (user_id = auth.uid());

-- Referral relationships policies
DROP POLICY IF EXISTS "Users can create referral relationships with token or auth" ON public.referral_relationships;
DROP POLICY IF EXISTS "Users can view their referral relationships by token or auth" ON public.referral_relationships;

CREATE POLICY "Users can view their referral relationships" ON public.referral_relationships
FOR SELECT USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "Users can create referral relationships" ON public.referral_relationships
FOR INSERT WITH CHECK (referrer_id = auth.uid() OR referee_id = auth.uid());

-- Communications policies
DROP POLICY IF EXISTS "Users can insert their communications with token or auth" ON public.communications;
DROP POLICY IF EXISTS "Users can update their communications by token or auth" ON public.communications;
DROP POLICY IF EXISTS "Users can view their communications by token or auth" ON public.communications;
DROP POLICY IF EXISTS "Administrators can view all communications" ON public.communications;

CREATE POLICY "Users can view their communications" ON public.communications
FOR SELECT USING (
  contact_id IN (
    SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their communications" ON public.communications
FOR INSERT WITH CHECK (
  contact_id IN (
    SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their communications" ON public.communications
FOR UPDATE USING (
  contact_id IN (
    SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all communications" ON public.communications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
  )
);