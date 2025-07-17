-- Fix infinite recursion in RLS policies by creating security definer function
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT permissions FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Drop and recreate the problematic admin policy on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_user_permissions(auth.uid()) = 'administrator');

-- Fix similar admin policies on other tables to prevent recursion
-- Drop the old recursive policies first
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can view all owners" ON public.owners;

-- Drop existing new policies to recreate them
DROP POLICY IF EXISTS "Administrators can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Administrators can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Administrators can view all bills" ON public.bills;

CREATE POLICY "Administrators can view all applications" 
ON public.applications 
FOR SELECT 
USING (public.get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Administrators can view all properties" 
ON public.properties 
FOR SELECT 
USING (public.get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Administrators can view all bills" 
ON public.bills 
FOR SELECT 
USING (public.get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Administrators can view all owners" 
ON public.owners 
FOR SELECT 
USING (public.get_user_permissions(auth.uid()) = 'administrator');