-- Add county column to protests table
ALTER TABLE public.protests 
ADD COLUMN IF NOT EXISTS county text;