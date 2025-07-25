-- Add protest_id column to bills table
ALTER TABLE public.bills 
ADD COLUMN protest_id UUID REFERENCES public.protests(id);

-- Remove owner_id column and its constraint
ALTER TABLE public.bills 
DROP COLUMN owner_id;