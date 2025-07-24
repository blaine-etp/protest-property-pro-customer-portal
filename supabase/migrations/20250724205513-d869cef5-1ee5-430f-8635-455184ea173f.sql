-- Add foreign key constraint between protests and properties
ALTER TABLE public.protests 
ADD CONSTRAINT fk_protests_property_id 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;