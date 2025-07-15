-- Create owners table
CREATE TABLE public.owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_type TEXT NOT NULL DEFAULT 'individual' CHECK (owner_type IN ('individual', 'llc', 'trust', 'corporation')),
  tax_id TEXT,
  contact_info JSONB DEFAULT '{}',
  mailing_address TEXT,
  mailing_address_2 TEXT,
  mailing_city TEXT,
  mailing_state TEXT,
  mailing_zip TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create communications table
CREATE TABLE public.communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'general' CHECK (inquiry_type IN ('general', 'protest_status', 'billing', 'documents', 'property_info')),
  subject TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  follow_up_date TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  bill_number TEXT UNIQUE NOT NULL DEFAULT concat('BILL-', upper(substring(gen_random_uuid()::text, 1, 8))),
  tax_year INTEGER NOT NULL,
  total_assessed_value NUMERIC DEFAULT 0,
  total_market_value NUMERIC DEFAULT 0,
  total_protest_amount NUMERIC DEFAULT 0,
  total_fee_amount NUMERIC DEFAULT 0,
  contingency_fee_percent NUMERIC DEFAULT 25.00,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rename appeal_status to protests
ALTER TABLE public.appeal_status RENAME TO protests;

-- Add missing columns to protests table
ALTER TABLE public.protests ADD COLUMN IF NOT EXISTS tax_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);
ALTER TABLE public.protests ADD COLUMN IF NOT EXISTS protest_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.protests ADD COLUMN IF NOT EXISTS hearing_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.protests ADD COLUMN IF NOT EXISTS resolution_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.protests ADD COLUMN IF NOT EXISTS assessed_value NUMERIC DEFAULT 0;
ALTER TABLE public.protests ADD COLUMN IF NOT EXISTS market_value NUMERIC DEFAULT 0;
ALTER TABLE public.protests ADD COLUMN IF NOT EXISTS protest_amount NUMERIC DEFAULT 0;
ALTER TABLE public.protests ADD COLUMN IF NOT EXISTS bill_id UUID;

-- Add owner_id and contact_id to properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS contact_id UUID;

-- Create junction table for communications and properties (many-to-many)
CREATE TABLE public.communication_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  communication_id UUID NOT NULL,
  property_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(communication_id, property_id)
);

-- Create junction table for documents and properties (many-to-many)
CREATE TABLE public.document_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  property_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, property_id)
);

-- Add foreign key constraints
ALTER TABLE public.properties ADD CONSTRAINT fk_properties_owner FOREIGN KEY (owner_id) REFERENCES public.owners(id);
ALTER TABLE public.properties ADD CONSTRAINT fk_properties_contact FOREIGN KEY (contact_id) REFERENCES public.profiles(id);
ALTER TABLE public.communications ADD CONSTRAINT fk_communications_contact FOREIGN KEY (contact_id) REFERENCES public.profiles(id);
ALTER TABLE public.bills ADD CONSTRAINT fk_bills_owner FOREIGN KEY (owner_id) REFERENCES public.owners(id);
ALTER TABLE public.protests ADD CONSTRAINT fk_protests_bill FOREIGN KEY (bill_id) REFERENCES public.bills(id);
ALTER TABLE public.communication_properties ADD CONSTRAINT fk_comm_props_communication FOREIGN KEY (communication_id) REFERENCES public.communications(id) ON DELETE CASCADE;
ALTER TABLE public.communication_properties ADD CONSTRAINT fk_comm_props_property FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
ALTER TABLE public.document_properties ADD CONSTRAINT fk_doc_props_document FOREIGN KEY (document_id) REFERENCES public.customer_documents(id) ON DELETE CASCADE;
ALTER TABLE public.document_properties ADD CONSTRAINT fk_doc_props_property FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- Add constraint for one protest per property per year
ALTER TABLE public.protests ADD CONSTRAINT unique_protest_per_property_per_year UNIQUE (property_id, tax_year);

-- Enable RLS on new tables
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for owners table
CREATE POLICY "Users can view owners by token or auth" ON public.owners
FOR SELECT USING (
  id IN (
    SELECT o.id FROM public.owners o
    JOIN public.properties pr ON pr.owner_id = o.id
    JOIN public.profiles p ON pr.contact_id = p.id
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);

CREATE POLICY "Users can insert owners with token or auth" ON public.owners
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update owners by token or auth" ON public.owners
FOR UPDATE USING (
  id IN (
    SELECT o.id FROM public.owners o
    JOIN public.properties pr ON pr.owner_id = o.id
    JOIN public.profiles p ON pr.contact_id = p.id
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);

-- Create RLS policies for communications table
CREATE POLICY "Users can view their communications by token or auth" ON public.communications
FOR SELECT USING (
  contact_id IN (
    SELECT p.id FROM public.profiles p
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);

CREATE POLICY "Users can insert their communications with token or auth" ON public.communications
FOR INSERT WITH CHECK (
  contact_id IN (
    SELECT p.id FROM public.profiles p
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR
      (p.user_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can update their communications by token or auth" ON public.communications
FOR UPDATE USING (
  contact_id IN (
    SELECT p.id FROM public.profiles p
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);

-- Create RLS policies for bills table
CREATE POLICY "Users can view bills by token or auth" ON public.bills
FOR SELECT USING (
  owner_id IN (
    SELECT o.id FROM public.owners o
    JOIN public.properties pr ON pr.owner_id = o.id
    JOIN public.profiles p ON pr.contact_id = p.id
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);

CREATE POLICY "Users can insert bills with token or auth" ON public.bills
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update bills by token or auth" ON public.bills
FOR UPDATE USING (
  owner_id IN (
    SELECT o.id FROM public.owners o
    JOIN public.properties pr ON pr.owner_id = o.id
    JOIN public.profiles p ON pr.contact_id = p.id
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);

-- Create RLS policies for junction tables
CREATE POLICY "Users can view communication properties by token or auth" ON public.communication_properties
FOR SELECT USING (
  communication_id IN (
    SELECT c.id FROM public.communications c
    JOIN public.profiles p ON c.contact_id = p.id
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);

CREATE POLICY "Users can insert communication properties with token or auth" ON public.communication_properties
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view document properties by token or auth" ON public.document_properties
FOR SELECT USING (
  property_id IN (
    SELECT pr.id FROM public.properties pr
    JOIN public.profiles p ON pr.contact_id = p.id
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);

CREATE POLICY "Users can insert document properties with token or auth" ON public.document_properties
FOR INSERT WITH CHECK (true);

-- Add admin policies for all tables
CREATE POLICY "Administrators can view all owners" ON public.owners
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
  )
);

CREATE POLICY "Administrators can view all communications" ON public.communications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
  )
);

CREATE POLICY "Administrators can view all bills" ON public.bills
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.permissions = 'administrator'
  )
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_owners_updated_at
  BEFORE UPDATE ON public.owners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communications_updated_at
  BEFORE UPDATE ON public.communications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();