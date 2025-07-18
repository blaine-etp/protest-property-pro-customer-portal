-- Create county_pages table for managing multiple pages per county
CREATE TABLE public.county_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  county_id UUID NOT NULL REFERENCES public.counties(id) ON DELETE CASCADE,
  page_type TEXT NOT NULL, -- 'how-to', 'basics', 'deadlines', 'appeals', etc.
  title TEXT NOT NULL,
  slug TEXT NOT NULL, -- e.g., 'angelina-county-texas-how-to-protest-property-taxes'
  content TEXT DEFAULT '',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(county_id, page_type),
  UNIQUE(slug)
);

-- Enable RLS
ALTER TABLE public.county_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for county_pages
CREATE POLICY "Anyone can manage county pages" ON public.county_pages FOR ALL USING (true);
CREATE POLICY "Everyone can read published county pages" ON public.county_pages FOR SELECT USING (status = 'published');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_county_pages_updated_at
  BEFORE UPDATE ON public.county_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create some default page types for existing counties
INSERT INTO public.county_pages (county_id, page_type, title, slug, content, status)
SELECT 
  c.id,
  'how-to',
  c.name || ' Property Tax Protest Guide',
  LOWER(REPLACE(c.name, ' ', '-')) || '-county-texas-how-to-protest-property-taxes',
  'Complete guide on how to protest property taxes in ' || c.name || ' County, Texas.',
  'draft'
FROM public.counties c;

INSERT INTO public.county_pages (county_id, page_type, title, slug, content, status)
SELECT 
  c.id,
  'basics',
  c.name || ' Property Tax Basics',
  LOWER(REPLACE(c.name, ' ', '-')) || '-county-texas-property-tax-basics',
  'Essential information about property taxes in ' || c.name || ' County, Texas.',
  'draft'
FROM public.counties c;

INSERT INTO public.county_pages (county_id, page_type, title, slug, content, status)
SELECT 
  c.id,
  'deadlines',
  c.name || ' Tax Protest Deadlines',
  LOWER(REPLACE(c.name, ' ', '-')) || '-county-texas-tax-protest-deadlines',
  'Important deadlines and dates for property tax protests in ' || c.name || ' County.',
  'draft'
FROM public.counties c;