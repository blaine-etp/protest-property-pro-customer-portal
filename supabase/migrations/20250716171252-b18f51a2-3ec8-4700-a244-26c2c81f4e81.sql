-- Add fields to connect owners to users and properties
ALTER TABLE public.owners 
ADD COLUMN property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
ADD COLUMN created_by_user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_owners_property_id ON public.owners(property_id);
CREATE INDEX idx_owners_created_by_user_id ON public.owners(created_by_user_id);

-- Add fields to store entity information from the form
ALTER TABLE public.owners 
ADD COLUMN entity_relationship text,
ADD COLUMN form_entity_name text,
ADD COLUMN form_entity_type text;