-- Create contacts table
CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  mailing_address text,
  mailing_address_2 text,
  mailing_city text,
  mailing_state text,
  mailing_zip text,
  notes text,
  status text NOT NULL DEFAULT 'active',
  source text DEFAULT 'property_import',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public access (matching other tables)
CREATE POLICY "Public access to all data" ON public.contacts FOR ALL USING (true) WITH CHECK (true);

-- Add contact_id to properties table
ALTER TABLE public.properties ADD COLUMN contact_id uuid REFERENCES public.contacts(id);

-- Create updated_at trigger for contacts
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample contacts
INSERT INTO public.contacts (id, first_name, last_name, email, phone, company, mailing_address, mailing_city, mailing_state, mailing_zip, notes, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '(512) 555-0123', NULL, '1234 Oak Street', 'Austin', 'TX', '78701', 'Primary contact for multiple properties', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Michael', 'Rodriguez', 'michael.rodriguez@email.com', '(512) 555-0124', 'Rodriguez Properties LLC', '5678 Pine Avenue', 'Austin', 'TX', '78702', 'Commercial property owner', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Jennifer', 'Chen', 'jennifer.chen@email.com', '(512) 555-0125', NULL, '9012 Cedar Lane', 'Austin', 'TX', '78703', 'Residential homeowner', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'David', 'Thompson', 'david.thompson@email.com', '(512) 555-0126', 'Thompson Real Estate', '3456 Maple Drive', 'Austin', 'TX', '78704', 'Real estate investor', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 'Lisa', 'Wilson', 'lisa.wilson@email.com', '(512) 555-0127', NULL, '7890 Elm Street', 'Austin', 'TX', '78705', 'Single property owner', 'active'),
('550e8400-e29b-41d4-a716-446655440006', 'Robert', 'Martinez', 'robert.martinez@email.com', '(512) 555-0128', 'Martinez Holdings', '2468 Birch Road', 'Austin', 'TX', '78706', 'Investment property owner', 'active'),
('550e8400-e29b-41d4-a716-446655440007', 'Amanda', 'Davis', 'amanda.davis@email.com', '(512) 555-0129', NULL, '1357 Willow Way', 'Austin', 'TX', '78707', 'Homeowner', 'active');