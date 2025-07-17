-- Phase 3: Create new simplified RLS policies that work with authenticated users only

-- Profiles table policies
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
CREATE POLICY "Users can view their own documents" ON public.customer_documents
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own documents" ON public.customer_documents
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Credit transactions policies
CREATE POLICY "Users can view their credit transactions" ON public.credit_transactions
FOR SELECT USING (user_id = auth.uid());

-- Referral relationships policies
CREATE POLICY "Users can view their referral relationships" ON public.referral_relationships
FOR SELECT USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "Users can create referral relationships" ON public.referral_relationships
FOR INSERT WITH CHECK (referrer_id = auth.uid() OR referee_id = auth.uid());

-- Communications policies
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

-- Bills policies
CREATE POLICY "Users can view their bills" ON public.bills
FOR SELECT USING (
  owner_id IN (
    SELECT DISTINCT o.id 
    FROM public.owners o
    JOIN public.properties p ON p.owner_id = o.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their bills" ON public.bills
FOR UPDATE USING (
  owner_id IN (
    SELECT DISTINCT o.id 
    FROM public.owners o
    JOIN public.properties p ON p.owner_id = o.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert bills" ON public.bills
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view all bills" ON public.bills
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
  )
);

-- Communication properties policies
CREATE POLICY "Users can view their communication properties" ON public.communication_properties
FOR SELECT USING (
  communication_id IN (
    SELECT c.id FROM public.communications c
    JOIN public.profiles p ON c.contact_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert communication properties" ON public.communication_properties
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Document properties policies
CREATE POLICY "Users can view their document properties" ON public.document_properties
FOR SELECT USING (
  property_id IN (
    SELECT p.id FROM public.properties p WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert document properties" ON public.document_properties
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);