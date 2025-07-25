-- Update John Smith's contact record to have a different ID from user ID
UPDATE contacts 
SET id = '55555555-5555-5555-5555-555555555555'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Update the property record to reference the new contact_id
UPDATE properties 
SET contact_id = '55555555-5555-5555-5555-555555555555'
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Create an application record for document generation
INSERT INTO applications (
  id,
  user_id,
  property_id,
  signature,
  status,
  submitted_at
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'John Smith',
  'submitted',
  now()
);