-- Clear all existing data and create clean 1:1:1:1 relationships
-- Delete all existing data in the correct order (respecting foreign keys)
DELETE FROM protests;
DELETE FROM applications;
DELETE FROM customer_documents;
DELETE FROM document_properties;
DELETE FROM communication_properties;
DELETE FROM communications;
DELETE FROM credit_transactions;
DELETE FROM referral_relationships;
DELETE FROM verification_codes;
DELETE FROM properties;
DELETE FROM contacts;
DELETE FROM owners;
DELETE FROM profiles;
DELETE FROM bills;

-- Create one sample profile first
INSERT INTO profiles (
  id,
  user_id,
  first_name,
  last_name,
  email,
  phone,
  mailing_address,
  mailing_city,
  mailing_state,
  mailing_zip,
  role,
  status,
  permissions,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'John',
  'Smith',
  'john.smith@email.com',
  '(512) 555-0123',
  '123 Main Street',
  'Austin',
  'TX',
  '78701',
  'homeowner',
  'active',
  'user',
  now()
);

-- Create one sample owner
INSERT INTO owners (
  id,
  name,
  owner_type,
  mailing_address,
  mailing_city,
  mailing_state,
  mailing_zip,
  contact_info,
  created_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'John Smith',
  'individual',
  '123 Main Street',
  'Austin',
  'TX',
  '78701',
  '{"email": "john.smith@email.com", "phone": "(512) 555-0123"}',
  now()
);

-- Create one sample contact linked to the owner
INSERT INTO contacts (
  id,
  first_name,
  last_name,
  email,
  phone,
  status,
  mailing_address,
  mailing_city,
  mailing_state,
  mailing_zip,
  source,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'John',
  'Smith',
  'john.smith@email.com',
  '(512) 555-0123',
  'active',
  '123 Main Street',
  'Austin',
  'TX',
  '78701',
  'property_import',
  now()
);

-- Create one sample property linked to both contact and owner
INSERT INTO properties (
  id,
  user_id,
  situs_address,
  parcel_number,
  etp_pid,
  county_pid,
  county,
  assessed_value,
  estimated_savings,
  contact_id,
  owner_id,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  '123 Main Street, Austin, TX 78701',
  'PAR-001-2024',
  'ETP-12345',
  'CNT-67890',
  'Travis',
  450000,
  15000,
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  now()
);

-- Create one sample protest linked to the property
INSERT INTO protests (
  id,
  property_id,
  situs_address,
  owner_name,
  county,
  tax_year,
  assessed_value,
  market_value,
  protest_amount,
  savings_amount,
  appeal_status,
  exemption_status,
  protest_date,
  hearing_date,
  created_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  '123 Main Street, Austin, TX 78701',
  'John Smith',
  'Travis',
  2024,
  450000,
  435000,
  15000,
  15000,
  'filed',
  'pending',
  '2024-03-15'::timestamp,
  '2024-06-15'::timestamp,
  now()
);