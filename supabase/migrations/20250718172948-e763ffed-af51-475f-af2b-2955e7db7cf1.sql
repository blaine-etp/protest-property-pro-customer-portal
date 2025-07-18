-- Create counties table for county-specific pages
CREATE TABLE public.counties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'Texas',
  county_code TEXT,
  
  -- Tax Information
  current_tax_year INTEGER DEFAULT EXTRACT(year FROM CURRENT_DATE),
  protest_deadline DATE,
  hearing_period_start DATE,
  hearing_period_end DATE,
  
  -- Contact Information
  appraisal_district_name TEXT,
  appraisal_district_phone TEXT,
  appraisal_district_website TEXT,
  appraisal_district_address TEXT,
  appraisal_district_city TEXT,
  appraisal_district_zip TEXT,
  
  -- Content
  how_to_content TEXT DEFAULT '',
  county_info_content TEXT DEFAULT '',
  
  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Status and timestamps
  status TEXT NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.counties ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to published counties
CREATE POLICY "Everyone can read published counties" 
ON public.counties 
FOR SELECT 
USING (status = 'published');

-- Admin can manage all counties
CREATE POLICY "Anyone can manage counties" 
ON public.counties 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_counties_updated_at
BEFORE UPDATE ON public.counties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for slug lookups
CREATE INDEX idx_counties_slug ON public.counties(slug);
CREATE INDEX idx_counties_status ON public.counties(status);

-- Insert the 30 Texas counties
INSERT INTO public.counties (name, slug, state, status, meta_title, meta_description) VALUES
('Harris County', 'harris-county-texas', 'Texas', 'draft', 'Harris County Property Tax Protest - Get Your Taxes Reduced', 'Professional property tax protest services for Harris County, Texas. Reduce your property taxes with our expert team.'),
('Tarrant County', 'tarrant-county-texas', 'Texas', 'draft', 'Tarrant County Property Tax Protest - Expert Tax Reduction Services', 'Lower your property taxes in Tarrant County, Texas with our professional protest services and expert representation.'),
('Dallas County', 'dallas-county-texas', 'Texas', 'draft', 'Dallas County Property Tax Protest - Professional Tax Appeals', 'Reduce your Dallas County property taxes with our experienced tax protest professionals and proven strategies.'),
('Bexar County', 'bexar-county-texas', 'Texas', 'draft', 'Bexar County Property Tax Protest - San Antonio Tax Reduction', 'Expert property tax protest services for Bexar County and San Antonio area. Lower your tax burden today.'),
('Travis County', 'travis-county-texas', 'Texas', 'draft', 'Travis County Property Tax Protest - Austin Tax Appeal Services', 'Professional property tax protests for Travis County and Austin. Reduce your property taxes with our expert team.'),
('Collin County', 'collin-county-texas', 'Texas', 'draft', 'Collin County Property Tax Protest - Plano Tax Reduction Services', 'Lower your Collin County property taxes with our professional protest and appeal services.'),
('Montgomery County', 'montgomery-county-texas', 'Texas', 'draft', 'Montgomery County Property Tax Protest - Conroe Tax Appeals', 'Expert property tax protest services for Montgomery County, Texas. Reduce your tax burden professionally.'),
('Fort Bend County', 'fort-bend-county-texas', 'Texas', 'draft', 'Fort Bend County Property Tax Protest - Sugar Land Tax Services', 'Professional property tax protests for Fort Bend County. Lower your taxes with our experienced team.'),
('Denton County', 'denton-county-texas', 'Texas', 'draft', 'Denton County Property Tax Protest - Frisco Tax Reduction', 'Reduce your Denton County property taxes with our expert protest and appeal services.'),
('El Paso County', 'el-paso-county-texas', 'Texas', 'draft', 'El Paso County Property Tax Protest - Professional Tax Appeals', 'Expert property tax protest services for El Paso County, Texas. Lower your property taxes today.'),
('Williamson County', 'williamson-county-texas', 'Texas', 'draft', 'Williamson County Property Tax Protest - Round Rock Tax Services', 'Professional property tax protests for Williamson County. Reduce your tax burden with our experts.'),
('Jefferson County', 'jefferson-county-texas', 'Texas', 'draft', 'Jefferson County Property Tax Protest - Beaumont Tax Appeals', 'Lower your Jefferson County property taxes with our professional protest services.'),
('Brazoria County', 'brazoria-county-texas', 'Texas', 'draft', 'Brazoria County Property Tax Protest - Pearland Tax Reduction', 'Expert property tax protest services for Brazoria County, Texas. Reduce your taxes professionally.'),
('Galveston County', 'galveston-county-texas', 'Texas', 'draft', 'Galveston County Property Tax Protest - League City Tax Appeals', 'Professional property tax protests for Galveston County. Lower your property taxes today.'),
('Bell County', 'bell-county-texas', 'Texas', 'draft', 'Bell County Property Tax Protest - Killeen Tax Reduction Services', 'Reduce your Bell County property taxes with our expert protest and appeal services.'),
('Hidalgo County', 'hidalgo-county-texas', 'Texas', 'draft', 'Hidalgo County Property Tax Protest - McAllen Tax Appeals', 'Expert property tax protest services for Hidalgo County, Texas. Lower your tax burden professionally.'),
('Nueces County', 'nueces-county-texas', 'Texas', 'draft', 'Nueces County Property Tax Protest - Corpus Christi Tax Services', 'Professional property tax protests for Nueces County. Reduce your property taxes with our team.'),
('Lubbock County', 'lubbock-county-texas', 'Texas', 'draft', 'Lubbock County Property Tax Protest - Professional Tax Appeals', 'Lower your Lubbock County property taxes with our expert protest services.'),
('Webb County', 'webb-county-texas', 'Texas', 'draft', 'Webb County Property Tax Protest - Laredo Tax Reduction', 'Expert property tax protest services for Webb County, Texas. Reduce your taxes today.'),
('McLennan County', 'mclennan-county-texas', 'Texas', 'draft', 'McLennan County Property Tax Protest - Waco Tax Appeals', 'Professional property tax protests for McLennan County. Lower your property taxes professionally.'),
('Comal County', 'comal-county-texas', 'Texas', 'draft', 'Comal County Property Tax Protest - New Braunfels Tax Services', 'Reduce your Comal County property taxes with our expert protest and appeal services.'),
('Cameron County', 'cameron-county-texas', 'Texas', 'draft', 'Cameron County Property Tax Protest - Brownsville Tax Reduction', 'Expert property tax protest services for Cameron County, Texas. Lower your tax burden today.'),
('Bastrop County', 'bastrop-county-texas', 'Texas', 'draft', 'Bastrop County Property Tax Protest - Professional Tax Appeals', 'Professional property tax protests for Bastrop County. Reduce your property taxes with our experts.'),
('Grayson County', 'grayson-county-texas', 'Texas', 'draft', 'Grayson County Property Tax Protest - Sherman Tax Services', 'Lower your Grayson County property taxes with our expert protest services.'),
('Hays County', 'hays-county-texas', 'Texas', 'draft', 'Hays County Property Tax Protest - San Marcos Tax Reduction', 'Expert property tax protest services for Hays County, Texas. Reduce your taxes professionally.'),
('Smith County', 'smith-county-texas', 'Texas', 'draft', 'Smith County Property Tax Protest - Tyler Tax Appeals', 'Professional property tax protests for Smith County. Lower your property taxes today.'),
('Rockwall County', 'rockwall-county-texas', 'Texas', 'draft', 'Rockwall County Property Tax Protest - Professional Tax Services', 'Reduce your Rockwall County property taxes with our expert protest and appeal services.'),
('Angelina County', 'angelina-county-texas', 'Texas', 'draft', 'Angelina County Property Tax Protest - Lufkin Tax Reduction', 'Expert property tax protest services for Angelina County, Texas. Lower your tax burden professionally.'),
('Nacogdoches County', 'nacogdoches-county-texas', 'Texas', 'draft', 'Nacogdoches County Property Tax Protest - Professional Tax Appeals', 'Professional property tax protests for Nacogdoches County. Reduce your property taxes with our team.');