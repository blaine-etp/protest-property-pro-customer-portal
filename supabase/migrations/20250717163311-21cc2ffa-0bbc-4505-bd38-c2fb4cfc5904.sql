-- Continue with remaining policies
DO $$
BEGIN
  -- Owners table policies
  DROP POLICY IF EXISTS "Users can view their owners" ON public.owners;
  CREATE POLICY "Users can view their owners" ON public.owners
  FOR SELECT USING (
    id IN (
      SELECT DISTINCT o.id 
      FROM public.owners o
      JOIN public.properties p ON p.owner_id = o.id
      WHERE p.user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "Users can insert owners" ON public.owners;
  CREATE POLICY "Users can insert owners" ON public.owners
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

  DROP POLICY IF EXISTS "Users can update their owners" ON public.owners;
  CREATE POLICY "Users can update their owners" ON public.owners
  FOR UPDATE USING (
    id IN (
      SELECT DISTINCT o.id 
      FROM public.owners o
      JOIN public.properties p ON p.owner_id = o.id
      WHERE p.user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "Admins can view all owners" ON public.owners;
  CREATE POLICY "Admins can view all owners" ON public.owners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
    )
  );

  -- Protests table policies
  DROP POLICY IF EXISTS "Users can view their protests" ON public.protests;
  CREATE POLICY "Users can view their protests" ON public.protests
  FOR SELECT USING (
    property_id IN (
      SELECT p.id FROM public.properties p WHERE p.user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "Users can insert protests for their properties" ON public.protests;
  CREATE POLICY "Users can insert protests for their properties" ON public.protests
  FOR INSERT WITH CHECK (
    property_id IN (
      SELECT p.id FROM public.properties p WHERE p.user_id = auth.uid()
    )
  );

  DROP POLICY IF EXISTS "Users can update their protests" ON public.protests;
  CREATE POLICY "Users can update their protests" ON public.protests
  FOR UPDATE USING (
    property_id IN (
      SELECT p.id FROM public.properties p WHERE p.user_id = auth.uid()
    )
  );

  -- Customer documents policies
  DROP POLICY IF EXISTS "Users can view their own documents" ON public.customer_documents;
  CREATE POLICY "Users can view their own documents" ON public.customer_documents
  FOR SELECT USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can insert their own documents" ON public.customer_documents;
  CREATE POLICY "Users can insert their own documents" ON public.customer_documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

  -- Credit transactions policies
  DROP POLICY IF EXISTS "Users can view their credit transactions" ON public.credit_transactions;
  CREATE POLICY "Users can view their credit transactions" ON public.credit_transactions
  FOR SELECT USING (user_id = auth.uid());

  -- Referral relationships policies
  DROP POLICY IF EXISTS "Users can view their referral relationships" ON public.referral_relationships;
  CREATE POLICY "Users can view their referral relationships" ON public.referral_relationships
  FOR SELECT USING (referrer_id = auth.uid() OR referee_id = auth.uid());

  DROP POLICY IF EXISTS "Users can create referral relationships" ON public.referral_relationships;
  CREATE POLICY "Users can create referral relationships" ON public.referral_relationships
  FOR INSERT WITH CHECK (referrer_id = auth.uid() OR referee_id = auth.uid());
END
$$;