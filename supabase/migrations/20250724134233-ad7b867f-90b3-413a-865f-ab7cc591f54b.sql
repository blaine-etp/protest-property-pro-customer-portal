-- Add public read policy for site_content table so footer can be read by everyone
CREATE POLICY "Everyone can read site content" 
ON public.site_content 
FOR SELECT 
USING (true);