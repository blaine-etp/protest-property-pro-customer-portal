-- Phase 3: Create new simplified RLS policies (using DO blocks to avoid conflicts)

-- Helper function to drop and recreate policies safely
DO $$
BEGIN
  -- Profiles table policies
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
    )
  );

  -- Properties table policies
  DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
  CREATE POLICY "Users can view their own properties" ON public.properties
  FOR SELECT USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can insert their own properties" ON public.properties;
  CREATE POLICY "Users can insert their own properties" ON public.properties
  FOR INSERT WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
  CREATE POLICY "Users can update their own properties" ON public.properties
  FOR UPDATE USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
  CREATE POLICY "Admins can view all properties" ON public.properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
    )
  );

  -- Applications table policies
  DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
  CREATE POLICY "Users can view their own applications" ON public.applications
  FOR SELECT USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can insert their own applications" ON public.applications;
  CREATE POLICY "Users can insert their own applications" ON public.applications
  FOR INSERT WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
  CREATE POLICY "Users can update their own applications" ON public.applications
  FOR UPDATE USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
  CREATE POLICY "Admins can view all applications" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
    )
  );
END
$$;