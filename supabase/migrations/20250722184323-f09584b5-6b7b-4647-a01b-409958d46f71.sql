
-- Add page content fields to the counties table to consolidate everything
ALTER TABLE counties ADD COLUMN IF NOT EXISTS page_title text;
ALTER TABLE counties ADD COLUMN IF NOT EXISTS page_content text DEFAULT '';
ALTER TABLE counties ADD COLUMN IF NOT EXISTS hero_image_url text;
ALTER TABLE counties ADD COLUMN IF NOT EXISTS courthouse_image_url text;
ALTER TABLE counties ADD COLUMN IF NOT EXISTS landscape_image_url text;

-- Migrate existing county_pages data to counties table (only basics pages)
UPDATE counties 
SET 
  page_title = county_pages.title,
  page_content = county_pages.content
FROM county_pages 
WHERE county_pages.county_id = counties.id 
  AND county_pages.page_type = 'basics';

-- Update existing counties that don't have a page_title to use the county name + "Property Tax Information"
UPDATE counties 
SET page_title = name || ' County Property Tax Information'
WHERE page_title IS NULL OR page_title = '';

-- Set default content for counties without any content
UPDATE counties 
SET page_content = 'Learn about property tax protests, exemptions, and important deadlines for ' || name || ' County, Texas. Our expert team can help you reduce your property taxes through professional protest services.'
WHERE page_content IS NULL OR page_content = '';
