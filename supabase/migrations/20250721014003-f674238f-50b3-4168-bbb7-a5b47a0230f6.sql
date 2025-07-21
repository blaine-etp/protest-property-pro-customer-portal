
-- Add RLS policy to allow administrators to view all profiles
CREATE POLICY "Administrators can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_user_permissions(auth.uid()) = 'administrator');
