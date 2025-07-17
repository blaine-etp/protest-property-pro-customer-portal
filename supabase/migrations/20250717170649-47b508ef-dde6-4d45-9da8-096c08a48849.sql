-- Temporarily disable all admin policies that use get_user_permissions to isolate the issue
DROP POLICY IF EXISTS "Administrators can view all owners" ON public.owners;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;