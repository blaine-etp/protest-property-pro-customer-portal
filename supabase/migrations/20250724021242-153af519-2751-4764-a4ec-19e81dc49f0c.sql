
-- Create comprehensive site_content table for all website content
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL, -- homepage, header, footer, about, global_settings
  content_key TEXT NOT NULL, -- specific content identifier
  content_type TEXT NOT NULL DEFAULT 'text', -- text, rich_text, image, link, json_array, json_object
  content_value TEXT, -- actual content value
  content_metadata JSONB DEFAULT '{}', -- additional metadata (alt text, links, etc)
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(section, content_key)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Create policies for site content
CREATE POLICY "Administrators can manage all site content" 
  ON public.site_content 
  FOR ALL 
  USING (get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Everyone can read published site content" 
  ON public.site_content 
  FOR SELECT 
  USING (status = 'published');

-- Create trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial content from existing hardcoded values
INSERT INTO public.site_content (section, content_key, content_type, content_value, status) VALUES
-- Global settings
('global_settings', 'company_name', 'text', 'EasyTaxProtest.com', 'published'),
('global_settings', 'company_phone', 'text', '(555) 012-3456', 'published'),
('global_settings', 'company_email', 'text', 'info@easytaxprotest.com', 'published'),
('global_settings', 'company_address', 'text', '123 Business Plaza', 'published'),
('global_settings', 'company_city', 'text', 'Austin', 'published'),
('global_settings', 'company_state', 'text', 'TX', 'published'),
('global_settings', 'company_zip', 'text', '78701', 'published'),

-- Header content
('header', 'logo_url', 'image', '/lovable-uploads/fe72b475-c203-4999-8384-be417f456711.png', 'published'),
('header', 'logo_alt', 'text', 'EasyTaxProtest.com', 'published'),
('header', 'nav_items', 'json_array', '[{"label": "Services", "href": "#services"}, {"label": "How It Works", "href": "#how-it-works"}, {"label": "Resources", "href": "/resources"}, {"label": "About", "href": "/about"}, {"label": "Contact", "href": "#contact"}]', 'published'),
('header', 'cta_button_text', 'text', 'Contact Us', 'published'),
('header', 'sign_up_text', 'text', 'Sign Up', 'published'),

-- Footer content
('footer', 'logo_url', 'image', '/lovable-uploads/9f31b537-92b7-4e7d-9b60-b224c326a0cc.png', 'published'),
('footer', 'logo_alt', 'text', 'Tax Logo', 'published'),
('footer', 'company_description', 'text', 'Professional property tax protest services helping homeowners save thousands on their annual tax bills. No upfront fees, guaranteed results.', 'published'),
('footer', 'services_links', 'json_array', '[{"label": "Property Tax Protest", "href": "#"}, {"label": "Tax Assessment Review", "href": "#"}, {"label": "Commercial Properties", "href": "#"}, {"label": "Residential Properties", "href": "#"}, {"label": "Consultation Services", "href": "#"}]', 'published'),
('footer', 'social_links', 'json_array', '[{"platform": "facebook", "href": "#"}, {"platform": "twitter", "href": "#"}, {"platform": "linkedin", "href": "#"}]', 'published'),
('footer', 'legal_links', 'json_array', '[{"label": "Privacy Policy", "href": "#"}, {"label": "Terms of Service", "href": "#"}, {"label": "License Information", "href": "#"}]', 'published'),
('footer', 'copyright_text', 'text', '© 2024 EasyTaxProtest.com. All rights reserved.', 'published'),

-- About page content
('about', 'hero_title', 'text', 'About EasyTaxProtest.com', 'published'),
('about', 'hero_subtitle', 'text', 'Texas''s premier property tax protest specialists, proudly serving homeowners and businesses across the Lone Star State from our Austin headquarters.', 'published'),
('about', 'hero_location', 'text', 'Austin, Texas', 'published'),
('about', 'main_title', 'text', 'Who We Are', 'published'),
('about', 'main_description', 'rich_text', 'EasyTaxProtest.com is a Texas-focused property tax protest firm dedicated to helping property owners across the state reduce their property tax burden. Based in Austin, we combine local expertise with statewide reach to deliver exceptional results for our clients.', 'published'),
('about', 'mission_title', 'text', 'Our Mission', 'published'),
('about', 'mission_description', 'text', 'To make property tax protests simple, effective, and accessible to every Texas property owner, ensuring fair assessments and maximizing tax savings.', 'published'),
('about', 'why_choose_title', 'text', 'Why Choose EasyTaxProtest.com', 'published'),
('about', 'why_choose_items', 'json_array', '[{"title": "Texas Expertise", "description": "Deep understanding of Texas property tax laws and local county procedures across all 254 counties.", "icon": "MapPin"}, {"title": "Proven Results", "description": "Thousands of successful protests and millions in tax savings for Texas property owners.", "icon": "Users"}, {"title": "Full Service", "description": "We handle everything from initial assessment to hearing representation – you don''t lift a finger.", "icon": "Clock"}]', 'published'),
('about', 'process_title', 'text', 'Our Process', 'published'),
('about', 'process_steps', 'json_array', '[{"step": 1, "title": "Property Analysis", "description": "We analyze your property''s assessment against comparable sales and market data to identify potential savings."}, {"step": 2, "title": "Evidence Gathering", "description": "Our team compiles compelling evidence including comparable sales, market analysis, and property condition reports."}, {"step": 3, "title": "Protest Filing", "description": "We file your protest with the appropriate county appraisal district and manage all deadlines and paperwork."}, {"step": 4, "title": "Hearing Representation", "description": "Our experienced representatives present your case at the appraisal review board hearing to secure the best possible outcome."}]', 'published'),
('about', 'cta_title', 'text', 'Ready to Reduce Your Property Taxes?', 'published'),
('about', 'cta_description', 'text', 'Let our Texas property tax experts help you save money with a professional protest. No upfront fees – you only pay when we save you money.', 'published'),
('about', 'cta_primary_button', 'text', 'Get Started Today', 'published'),
('about', 'cta_secondary_button', 'text', 'Call (555) 012-3456', 'published');
