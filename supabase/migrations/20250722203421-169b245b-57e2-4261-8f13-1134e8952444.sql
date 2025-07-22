
-- Add missing SEO fields to counties table
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS hero_image_alt text;
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS courthouse_image_alt text;
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS landscape_image_alt text;
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS og_title text;
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS og_description text;
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS og_image text;
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS twitter_title text;
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS twitter_description text;
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS twitter_image text;
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS structured_data jsonb;

-- Update the updated_at trigger to include the new columns
CREATE OR REPLACE FUNCTION update_counties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_counties_updated_at_trigger ON public.counties;
CREATE TRIGGER update_counties_updated_at_trigger
  BEFORE UPDATE ON public.counties
  FOR EACH ROW
  EXECUTE FUNCTION update_counties_updated_at();
