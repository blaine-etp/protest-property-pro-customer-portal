-- Add token-based authentication fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN authentication_token uuid UNIQUE DEFAULT gen_random_uuid(),
ADD COLUMN is_authenticated boolean DEFAULT false,
ADD COLUMN token_expires_at timestamp with time zone DEFAULT (now() + interval '7 days');

-- Create index for faster token lookups
CREATE INDEX idx_profiles_authentication_token ON public.profiles(authentication_token);

-- Update RLS policies to allow token-based access for unauthenticated users
DROP POLICY IF EXISTS "Users can create profiles during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Allow token-based profile creation (no auth required)
CREATE POLICY "Allow profile creation with token" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Allow viewing profiles by token or by authenticated user
CREATE POLICY "Users can view profiles by token or auth" 
ON public.profiles 
FOR SELECT 
USING (
  authentication_token IS NOT NULL AND token_expires_at > now()
  OR (user_id = auth.uid() AND is_authenticated = true)
);

-- Allow updating profiles by token (for account setup) or by authenticated user
CREATE POLICY "Users can update profiles by token or auth" 
ON public.profiles 
FOR UPDATE 
USING (
  (authentication_token IS NOT NULL AND token_expires_at > now() AND is_authenticated = false)
  OR (user_id = auth.uid() AND is_authenticated = true)
);

-- Update properties RLS to allow token-based access
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can insert their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;

CREATE POLICY "Users can view properties by token or auth" 
ON public.properties 
FOR SELECT 
USING (
  user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE (p.authentication_token IS NOT NULL AND p.token_expires_at > now())
    OR (p.user_id = auth.uid() AND p.is_authenticated = true)
  )
);

CREATE POLICY "Users can insert properties with token or auth" 
ON public.properties 
FOR INSERT 
WITH CHECK (
  user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE p.authentication_token IS NOT NULL AND p.token_expires_at > now()
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Users can update properties by token or auth" 
ON public.properties 
FOR UPDATE 
USING (
  user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE (p.authentication_token IS NOT NULL AND p.token_expires_at > now())
    OR (p.user_id = auth.uid() AND p.is_authenticated = true)
  )
);

-- Update applications RLS for token-based access
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;

CREATE POLICY "Users can view applications by token or auth" 
ON public.applications 
FOR SELECT 
USING (
  user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE (p.authentication_token IS NOT NULL AND p.token_expires_at > now())
    OR (p.user_id = auth.uid() AND p.is_authenticated = true)
  )
);

CREATE POLICY "Users can insert applications with token or auth" 
ON public.applications 
FOR INSERT 
WITH CHECK (
  user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE p.authentication_token IS NOT NULL AND p.token_expires_at > now()
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Users can update applications by token or auth" 
ON public.applications 
FOR UPDATE 
USING (
  user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE (p.authentication_token IS NOT NULL AND p.token_expires_at > now())
    OR (p.user_id = auth.uid() AND p.is_authenticated = true)
  )
);

-- Update appeal_status RLS for token-based access
DROP POLICY IF EXISTS "Users can view appeal status for their properties" ON public.appeal_status;
DROP POLICY IF EXISTS "Users can insert appeal status for their properties" ON public.appeal_status;
DROP POLICY IF EXISTS "Users can update appeal status for their properties" ON public.appeal_status;

CREATE POLICY "Users can view appeal status by token or auth" 
ON public.appeal_status 
FOR SELECT 
USING (
  property_id IN (
    SELECT pr.id 
    FROM properties pr 
    JOIN profiles p ON pr.user_id = p.user_id 
    WHERE (p.authentication_token IS NOT NULL AND p.token_expires_at > now())
    OR (p.user_id = auth.uid() AND p.is_authenticated = true)
  )
);

CREATE POLICY "Users can insert appeal status with token or auth" 
ON public.appeal_status 
FOR INSERT 
WITH CHECK (
  property_id IN (
    SELECT pr.id 
    FROM properties pr 
    JOIN profiles p ON pr.user_id = p.user_id 
    WHERE p.authentication_token IS NOT NULL AND p.token_expires_at > now()
  )
  OR property_id IN (
    SELECT pr.id 
    FROM properties pr 
    WHERE pr.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update appeal status by token or auth" 
ON public.appeal_status 
FOR UPDATE 
USING (
  property_id IN (
    SELECT pr.id 
    FROM properties pr 
    JOIN profiles p ON pr.user_id = p.user_id 
    WHERE (p.authentication_token IS NOT NULL AND p.token_expires_at > now())
    OR (p.user_id = auth.uid() AND p.is_authenticated = true)
  )
);