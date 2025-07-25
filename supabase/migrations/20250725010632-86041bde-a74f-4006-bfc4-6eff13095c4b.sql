-- Fix property-to-contact linking by matching addresses and names
-- Link properties to Sarah Johnson (first contact)
UPDATE properties 
SET contact_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE situs_address IN ('123 Main St, Austin, TX 78701', '456 Oak Ave, Austin, TX 78702');

-- Link properties to Michael Rodriguez (second contact - gets 2 properties)
UPDATE properties 
SET contact_id = '550e8400-e29b-41d4-a716-446655440002'  
WHERE situs_address IN ('789 Pine Rd, Austin, TX 78703', '321 Pine St, Plano, TX 75023');

-- Link remaining properties to other contacts (one each)
UPDATE properties 
SET contact_id = '550e8400-e29b-41d4-a716-446655440003'
WHERE situs_address = '456 Oak Ave, Houston, TX 77002';

UPDATE properties 
SET contact_id = '550e8400-e29b-41d4-a716-446655440004'
WHERE situs_address = '654 Cedar Ln, Round Rock, TX 78664';

UPDATE properties 
SET contact_id = '550e8400-e29b-41d4-a716-446655440005'
WHERE situs_address = '789 Business Blvd, Dallas, TX 75201';

UPDATE properties 
SET contact_id = '550e8400-e29b-41d4-a716-446655440006'
WHERE situs_address = '123 Main Street, Austin, TX 78701';

-- Link any remaining properties to Amanda Davis if they exist
UPDATE properties 
SET contact_id = '550e8400-e29b-41d4-a716-446655440007'
WHERE contact_id IS NULL;