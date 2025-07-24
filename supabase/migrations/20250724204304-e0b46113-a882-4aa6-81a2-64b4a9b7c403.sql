-- First, insert sample properties for the mock user
INSERT INTO public.properties (
  id,
  user_id,
  situs_address,
  parcel_number,
  assessed_value,
  estimated_savings,
  county,
  created_at,
  updated_at
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '550e8400-e29b-41d4-a716-446655440001', -- mock customer user ID
  '123 Main St, Austin, TX 78701',
  'R123456',
  450000,
  12000,
  'Travis',
  now(),
  now()
),
(
  '22222222-2222-2222-2222-222222222222', 
  '550e8400-e29b-41d4-a716-446655440001',
  '456 Oak Ave, Austin, TX 78702',
  'R789012',
  380000,
  8500,
  'Travis',
  now(),
  now()
),
(
  '33333333-3333-3333-3333-333333333333',
  '550e8400-e29b-41d4-a716-446655440001', 
  '789 Pine Rd, Austin, TX 78703',
  'R345678',
  520000,
  15000,
  'Travis',
  now(),
  now()
);

-- Clear existing property_id values that don't match real properties
UPDATE public.protests SET property_id = NULL WHERE property_id IS NOT NULL;

-- Update the first few protests to reference our new properties
UPDATE public.protests 
SET property_id = '11111111-1111-1111-1111-111111111111',
    situs_address = '123 Main St, Austin, TX 78701'
WHERE id = (SELECT id FROM public.protests ORDER BY created_at LIMIT 1);

UPDATE public.protests 
SET property_id = '22222222-2222-2222-2222-222222222222',
    situs_address = '456 Oak Ave, Austin, TX 78702' 
WHERE id = (SELECT id FROM public.protests ORDER BY created_at OFFSET 1 LIMIT 1);

UPDATE public.protests 
SET property_id = '33333333-3333-3333-3333-333333333333',
    situs_address = '789 Pine Rd, Austin, TX 78703'
WHERE id = (SELECT id FROM public.protests ORDER BY created_at OFFSET 2 LIMIT 1);

-- Now add the foreign key constraint
ALTER TABLE public.protests 
ADD CONSTRAINT fk_protests_property_id 
FOREIGN KEY (property_id) REFERENCES public.properties(id);