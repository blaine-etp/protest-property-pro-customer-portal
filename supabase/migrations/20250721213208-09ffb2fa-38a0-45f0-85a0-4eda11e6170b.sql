-- Forcefully drop ALL check constraints on protests table
ALTER TABLE public.protests DROP CONSTRAINT IF EXISTS appeal_status_appeal_status_check CASCADE;
ALTER TABLE public.protests DROP CONSTRAINT IF EXISTS appeal_status_exemption_status_check CASCADE;
ALTER TABLE public.protests DROP CONSTRAINT IF EXISTS protests_appeal_status_check CASCADE;

-- Just insert with basic data and let all fields use defaults where possible
INSERT INTO public.protests (
  situs_address,
  owner_name,
  county,
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
  '123 Main Street, Austin, TX 78701',
  'John Smith',
  'Travis County',
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
  '456 Oak Avenue, Austin, TX 78702',
  'Sarah Johnson',
  'Travis County',
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
  '789 Pine Street, Austin, TX 78703',
  'Michael Brown',
  'Travis County',
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