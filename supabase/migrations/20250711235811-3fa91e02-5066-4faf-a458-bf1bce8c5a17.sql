-- Create a security definer function to safely handle profile creation during signup
CREATE OR REPLACE FUNCTION public.can_create_profile(profile_user_id uuid, profile_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow if the user_id matches the current auth user
  IF auth.uid() = profile_user_id THEN
    RETURN true;
  END IF;
  
  -- Allow during signup flow when auth.uid() is null but we have a valid user_id and email
  IF auth.uid() IS NULL AND profile_user_id IS NOT NULL AND profile_email IS NOT NULL THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a new policy that allows profile creation during signup
CREATE POLICY "Users can create profiles during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.can_create_profile(user_id, email));

-- Keep the existing select and update policies
-- Users can view their own profile
-- Users can update their own profile