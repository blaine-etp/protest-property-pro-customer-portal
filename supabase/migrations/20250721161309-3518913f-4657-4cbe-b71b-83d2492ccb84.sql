
-- Update the owners table owner_type check constraint to include all required entity types
ALTER TABLE public.owners DROP CONSTRAINT IF EXISTS owners_owner_type_check;

ALTER TABLE public.owners ADD CONSTRAINT owners_owner_type_check 
  CHECK (owner_type IN ('individual', 'llc', 'trust', 'corporation', 'partnership', 'estate', 'other'));
