
-- Create a table to store site content
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_type, content_key)
);

-- Add Row Level Security
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Create policies for site content
CREATE POLICY "Administrators can view all site content" 
  ON public.site_content 
  FOR SELECT 
  USING (get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Administrators can insert site content" 
  ON public.site_content 
  FOR INSERT 
  WITH CHECK (get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Administrators can update site content" 
  ON public.site_content 
  FOR UPDATE 
  USING (get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Administrators can delete site content" 
  ON public.site_content 
  FOR DELETE 
  USING (get_user_permissions(auth.uid()) = 'administrator');

-- Create trigger to update updated_at
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial footer content
INSERT INTO public.site_content (content_type, content_key, content_value) VALUES
('footer', 'company_logo', '{"url": "/lovable-uploads/9f31b537-92b7-4e7d-9b60-b224c326a0cc.png", "alt": "Tax Logo"}'),
('footer', 'company_description', '"Professional property tax protest services helping homeowners save thousands on their annual tax bills. No upfront fees, guaranteed results."'),
('footer', 'social_links', '[
  {"platform": "Facebook", "url": "#"},
  {"platform": "Twitter", "url": "#"},
  {"platform": "LinkedIn", "url": "#"}
]'),
('footer', 'services', '[
  {"name": "Property Tax Protest", "url": "#"},
  {"name": "Tax Assessment Review", "url": "#"},
  {"name": "Commercial Properties", "url": "#"},
  {"name": "Residential Properties", "url": "#"},
  {"name": "Consultation Services", "url": "#"}
]'),
('footer', 'contact_info', '{
  "phone": "(555) 012-3456",
  "email": "info@easytaxprotest.com",
  "address": {
    "street": "123 Business Plaza",
    "city": "Austin",
    "state": "TX",
    "zip": "78701"
  }
}'),
('footer', 'copyright_text', '"© 2024 EasyTaxProtest.com. All rights reserved."'),
('footer', 'legal_links', '[
  {"name": "Privacy Policy", "url": "#"},
  {"name": "Terms of Service", "url": "#"},
  {"name": "License Information", "url": "#"}
]');
