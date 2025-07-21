
-- Add county_confirmation_date column to protests table
ALTER TABLE public.protests 
ADD COLUMN IF NOT EXISTS county_confirmation_date timestamp with time zone;
