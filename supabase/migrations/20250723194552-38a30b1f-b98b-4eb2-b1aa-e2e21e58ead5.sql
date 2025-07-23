-- Add enhanced columns to properties table for Google Places and AWS data integration
ALTER TABLE public.properties 
ADD COLUMN place_id TEXT,
ADD COLUMN formatted_address TEXT,
ADD COLUMN google_address_components JSONB,
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC,
ADD COLUMN county TEXT,
ADD COLUMN assessed_value NUMERIC;

-- Add indexes for performance on commonly queried fields
CREATE INDEX idx_properties_place_id ON public.properties(place_id);
CREATE INDEX idx_properties_county ON public.properties(county);
CREATE INDEX idx_properties_coordinates ON public.properties(latitude, longitude);