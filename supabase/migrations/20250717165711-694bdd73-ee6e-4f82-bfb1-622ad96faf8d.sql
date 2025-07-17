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

-- Drop only the old recursive policies that are causing issues
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can view all owners" ON public.owners;