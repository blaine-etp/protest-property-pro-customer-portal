-- Delete any existing data and start fresh
TRUNCATE TABLE public.protests;

-- Drop the table and recreate it simplified for demo
DROP TABLE IF EXISTS public.protests CASCADE;

-- Create a simplified protests table for demo purposes
CREATE TABLE public.protests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid,
    situs_address text,
    owner_name text,
    county text,
    appeal_status text DEFAULT 'pending',
    exemption_status text DEFAULT 'pending',
    hearing_date timestamp with time zone,
    assessed_value numeric DEFAULT 0,
    market_value numeric DEFAULT 0,
    protest_amount numeric DEFAULT 0,
    savings_amount numeric DEFAULT 0,
    tax_year integer DEFAULT EXTRACT(year FROM CURRENT_DATE),
    protest_date timestamp with time zone,
    recommendation text,
    documents_generated boolean DEFAULT false,
    evidence_packet_url text,
    offer_received_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Insert mock data
INSERT INTO public.protests (
  property_id,
  situs_address,
  owner_name,
  county,
  appeal_status,
  hearing_date,
  assessed_value,
  market_value,
  protest_amount,
  savings_amount,
  tax_year,
  protest_date,
  recommendation,
  documents_generated,
  evidence_packet_url,
  offer_received_date
) VALUES 
(
  gen_random_uuid(),
  '123 Main Street, Austin, TX 78701',
  'John Smith',
  'Travis County',
  'offer_received',
  '2024-03-15 10:00:00-05',
  450000,
  420000,
  30000,
  2100,
  2024,
  '2024-01-15 09:00:00-06',
  'Accept - Fair market adjustment based on comparable sales',
  true,
  '/documents/evidence-packet-001.pdf',
  '2024-02-20 14:30:00-06'
),
(
  gen_random_uuid(),
  '456 Oak Avenue, Austin, TX 78702',
  'Sarah Johnson',
  'Travis County',
  'needs_review',
  '2024-04-10 14:00:00-05',
  325000,
  305000,
  20000,
  1400,
  2024,
  '2024-01-20 11:00:00-06',
  'Reject - Offer too low, request higher reduction',
  false,
  NULL,
  '2024-02-25 10:15:00-06'
),
(
  gen_random_uuid(),
  '789 Pine Street, Austin, TX 78703',
  'Michael Brown',
  'Travis County',
  'accepted',
  '2024-02-28 09:30:00-06',
  675000,
  640000,
  35000,
  2450,
  2024,
  '2024-01-10 08:00:00-06',
  'Accept - Good settlement offer',
  true,
  '/documents/evidence-packet-002.pdf',
  '2024-02-15 16:45:00-06'
);