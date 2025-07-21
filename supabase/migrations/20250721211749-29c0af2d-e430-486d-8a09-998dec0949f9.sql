-- First, let's create some properties that the protests can reference
INSERT INTO public.properties (
  id,
  user_id,
  address,
  parcel_number,
  estimated_savings
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '550e8400-e29b-41d4-a716-446655440000', -- admin user
  '123 Main Street, Austin, TX 78701',
  'PARCEL001',
  2100
),
(
  '22222222-2222-2222-2222-222222222222',
  '550e8400-e29b-41d4-a716-446655440000',
  '456 Oak Avenue, Austin, TX 78702',
  'PARCEL002',
  1400
),
(
  '33333333-3333-3333-3333-333333333333',
  '550e8400-e29b-41d4-a716-446655440000',
  '789 Pine Street, Austin, TX 78703',
  'PARCEL003',
  2450
),
(
  '44444444-4444-4444-4444-444444444444',
  '550e8400-e29b-41d4-a716-446655440000',
  '321 Elm Drive, Round Rock, TX 78664',
  'PARCEL004',
  1400
),
(
  '55555555-5555-5555-5555-555555555555',
  '550e8400-e29b-41d4-a716-446655440000',
  '567 Cedar Lane, Pflugerville, TX 78660',
  'PARCEL005',
  2100
);

-- Now insert the protest data with valid property_id references
INSERT INTO public.protests (
  id,
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
  '11111111-1111-1111-1111-111111111111',
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
  '22222222-2222-2222-2222-222222222222',
  '456 Oak Avenue, Austin, TX 78702',
  'Sarah Johnson',
  'Travis County',
  'waiting_for_offer',
  '2024-04-10 14:00:00-05',
  325000,
  305000,
  20000,
  1400,
  2024,
  '2024-01-20 11:00:00-06',
  NULL,
  false,
  NULL,
  NULL
),
(
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  '789 Pine Street, Austin, TX 78703',
  'Michael Brown',
  'Travis County',
  'needs_review',
  '2024-02-28 09:30:00-06',
  675000,
  640000,
  35000,
  2450,
  2024,
  '2024-01-10 08:00:00-06',
  'Reject - Offer too low, request higher reduction',
  true,
  '/documents/evidence-packet-002.pdf',
  '2024-02-15 16:45:00-06'
),
(
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444',
  '321 Elm Drive, Round Rock, TX 78664',
  'Emily Davis',
  'Williamson County',
  'accepted',
  '2024-03-05 11:00:00-06',
  280000,
  260000,
  20000,
  1400,
  2024,
  '2024-01-05 10:00:00-06',
  'Accept - Good settlement offer',
  true,
  '/documents/evidence-packet-003.pdf',
  '2024-02-10 13:20:00-06'
),
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  '567 Cedar Lane, Pflugerville, TX 78660',
  'Robert Wilson',
  'Travis County',
  'email_reply_required',
  '2024-04-20 15:30:00-05',
  380000,
  350000,
  30000,
  2100,
  2024,
  '2024-01-25 14:00:00-06',
  'Follow up needed - Awaiting additional documentation',
  false,
  NULL,
  '2024-02-25 10:15:00-06'
);